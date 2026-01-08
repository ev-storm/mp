import { createHash } from "node:crypto";

export default defineEventHandler(async (event) => {
  if (event.node.req.method !== "POST") {
    throw createError({
      statusCode: 405,
      statusMessage: "Method Not Allowed",
    });
  }

  try {
    const body = await readBody(event);
    const { password } = body;

    if (!password) {
      throw createError({
        statusCode: 400,
        statusMessage: "Пароль обязателен",
      });
    }

    // Читаем пароль и секретный ключ из переменных окружения
    const config = useRuntimeConfig();
    const adminPassword =
      (process.env as any).ADMIN_PASSWORD || config.adminPassword;
    const adminSecretKey =
      (process.env as any).ADMIN_SECRET_KEY || config.adminSecretKey;

    // Проверяем, что переменные окружения установлены
    if (!adminPassword || !adminSecretKey) {
      console.error("❌ Конфигурация не настроена:", {
        ADMIN_PASSWORD: !!adminPassword,
        ADMIN_SECRET_KEY: !!adminSecretKey,
      });
      throw createError({
        statusCode: 500,
        statusMessage:
          "Конфигурация администратора не настроена. Установите ADMIN_PASSWORD и ADMIN_SECRET_KEY в .env файле.",
      });
    }

    // Проверяем пароль
    // В production лучше использовать bcrypt для сравнения хэшированных паролей
    const isValidPassword = password === adminPassword;

    if (!isValidPassword) {
      throw createError({
        statusCode: 401,
        statusMessage: "Неверный пароль",
      });
    }

    // Генерируем токен аутентификации
    const authToken = createHash("sha256")
      .update(adminSecretKey + "-admin")
      .digest("hex");

    // Устанавливаем cookie с токеном
    // httpOnly: true - защищает от XSS атак
    // secure: true - только через HTTPS (в production)
    // sameSite: 'lax' - защита от CSRF
    const isProduction = (process.env as any).NODE_ENV === "production";

    setCookie(event, "admin-auth-token", authToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 дней
      path: "/",
    });

    return {
      success: true,
      message: "Успешный вход в систему",
    };
  } catch (error: any) {
    console.error("Ошибка входа:", error);
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || "Внутренняя ошибка сервера",
    });
  }
});
