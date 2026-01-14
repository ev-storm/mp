// API endpoint для сохранения конфигурации полей заказа
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";
import { createHash } from "crypto";

// Функция проверки аутентификации
const checkAuth = (event: any): boolean => {
  try {
    const authToken = getCookie(event, "admin-auth-token");
    if (!authToken) return false;

    const config = useRuntimeConfig();
    const adminSecretKey =
      config.adminSecretKey || process.env.ADMIN_SECRET_KEY;
    if (!adminSecretKey) return false;

    const expectedToken = createHash("sha256")
      .update(adminSecretKey + "-admin")
      .digest("hex");

    return authToken === expectedToken;
  } catch {
    return false;
  }
};

export default defineEventHandler(async (event) => {
  if (event.node.req.method !== "POST") {
    throw createError({
      statusCode: 405,
      statusMessage: "Method Not Allowed",
    });
  }

  // Проверяем аутентификацию для POST запросов
  const isAuthenticated = checkAuth(event);
  if (!isAuthenticated) {
    console.error("POST /api/order-fields-config: Не авторизован");
    throw createError({
      statusCode: 401,
      statusMessage: "Требуется аутентификация",
    });
  }

  try {
    // Увеличиваем лимит размера тела запроса для этого endpoint
    // По умолчанию h3 имеет лимит 1MB, увеличиваем до 50MB для base64 изображений
    const body = await readBody(event, {
      maxSize: 50 * 1024 * 1024, // 50MB
    });
    const { config, meta } = body;

    console.log("POST /api/order-fields-config: Получен запрос", {
      hasConfig: !!config,
      hasMeta: !!meta,
    });

    if (!config || typeof config !== "object") {
      console.error("POST /api/order-fields-config: Неверный формат данных");
      throw createError({
        statusCode: 400,
        statusMessage: "Неверный формат данных",
      });
    }

    // Сохраняем конфигурацию в JSON файл
    // В продакшене лучше использовать базу данных
    const dataDir = join(process.cwd(), "data");

    // Создаем директорию data, если её нет
    if (!existsSync(dataDir)) {
      await mkdir(dataDir, { recursive: true });
    }

    // Сохраняем конфигурацию полей
    const configPath = join(dataDir, "order-fields-config.json");
    await writeFile(configPath, JSON.stringify(config, null, 2), "utf-8");

    // Сохраняем метаданные страниц (если переданы)
    if (meta && typeof meta === "object") {
      const metaPath = join(dataDir, "order-fields-meta.json");
      await writeFile(metaPath, JSON.stringify(meta, null, 2), "utf-8");
    }

    console.log("POST /api/order-fields-config: Успешно сохранено");
    return {
      success: true,
      message: "Конфигурация успешно сохранена",
    };
  } catch (error: any) {
    console.error("POST /api/order-fields-config: Ошибка сохранения:", error);
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || "Ошибка сохранения конфигурации",
    });
  }
});
