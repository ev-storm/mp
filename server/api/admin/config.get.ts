export default defineEventHandler(async (event) => {
  try {
    const config = useRuntimeConfig();

    // Показываем только что пароль настроен (не сам пароль)
    const adminPassword =
      config.adminPassword || (process.env as any).ADMIN_PASSWORD;
    const adminSecretKey =
      config.adminSecretKey || (process.env as any).ADMIN_SECRET_KEY;

    return {
      passwordConfigured: !!adminPassword,
      secretKeyConfigured: !!adminSecretKey,
      configured: !!(adminPassword && adminSecretKey),
      hint:
        adminPassword && adminSecretKey
          ? "Конфигурация настроена"
          : "Установите ADMIN_PASSWORD и ADMIN_SECRET_KEY в .env файле",
    };
  } catch (error: any) {
    return {
      error: "Ошибка проверки конфигурации",
      configured: false,
      hint: "Установите ADMIN_PASSWORD и ADMIN_SECRET_KEY в .env файле",
    };
  }
});
