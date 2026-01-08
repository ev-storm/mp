// API endpoint для получения конфигурации полей заказа
import { orderFieldsConfig } from "~/config/order-fields-config";
import { readFile } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

export default defineEventHandler(async (event) => {
  try {
    // Пытаемся загрузить сохраненную конфигурацию из файла
    const configPath = join(process.cwd(), "data", "order-fields-config.json");
    
    if (existsSync(configPath)) {
      try {
        const savedConfig = await readFile(configPath, "utf-8");
        const parsedConfig = JSON.parse(savedConfig);
        return {
          success: true,
          data: parsedConfig,
        };
      } catch (error) {
        console.warn("Ошибка чтения сохраненной конфигурации, используем дефолтную:", error);
      }
    }

    // Возвращаем дефолтную конфигурацию
    return {
      success: true,
      data: orderFieldsConfig,
    };
  } catch (error: any) {
    console.error("Error getting order fields config:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Ошибка получения конфигурации",
    });
  }
});

