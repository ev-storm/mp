// API endpoint для получения конфигурации полей заказа и метаданных
import { orderFieldsConfig } from "~/config/order-fields-config";
import { readFile } from "fs/promises";
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
  // Проверяем аутентификацию (опционально, можно убрать если нужно публичный доступ)
  // const isAuthenticated = checkAuth(event);
  // if (!isAuthenticated) {
  //   throw createError({
  //     statusCode: 401,
  //     statusMessage: "Требуется аутентификация",
  //   });
  // }

  try {
    let configData = orderFieldsConfig;
    let metaData = null;

    // Пытаемся загрузить сохраненную конфигурацию из файла
    const configPath = join(process.cwd(), "data", "order-fields-config.json");

    if (existsSync(configPath)) {
      try {
        const savedConfig = await readFile(configPath, "utf-8");
        const parsedConfig = JSON.parse(savedConfig);
        configData = parsedConfig;
      } catch (error) {
        console.warn(
          "Ошибка чтения сохраненной конфигурации, используем дефолтную:",
          error
        );
      }
    }

    // Пытаемся загрузить метаданные из файла
    const metaPath = join(process.cwd(), "data", "order-fields-meta.json");

    if (existsSync(metaPath)) {
      try {
        const savedMeta = await readFile(metaPath, "utf-8");
        const parsedMeta = JSON.parse(savedMeta);
        metaData = parsedMeta;
      } catch (error) {
        console.warn("Ошибка чтения метаданных:", error);
      }
    }

    return {
      success: true,
      data: configData,
      meta: metaData,
    };
  } catch (error: any) {
    console.error("Error getting order fields config:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Ошибка получения конфигурации",
    });
  }
});
