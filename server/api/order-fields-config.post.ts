// API endpoint для сохранения конфигурации полей заказа
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

export default defineEventHandler(async (event) => {
  if (event.node.req.method !== "POST") {
    throw createError({
      statusCode: 405,
      statusMessage: "Method Not Allowed",
    });
  }

  try {
    const body = await readBody(event);
    const { config, meta } = body;

    if (!config || typeof config !== "object") {
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

    return {
      success: true,
      message: "Конфигурация успешно сохранена",
    };
  } catch (error: any) {
    console.error("Error saving order fields config:", error);
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || "Ошибка сохранения конфигурации",
    });
  }
});

