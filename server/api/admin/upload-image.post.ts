// API endpoint для загрузки изображений на сервер
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

  // Проверяем аутентификацию
  const isAuthenticated = checkAuth(event);
  if (!isAuthenticated) {
    throw createError({
      statusCode: 401,
      statusMessage: "Требуется аутентификация",
    });
  }

  try {
    // Получаем multipart/form-data
    const formData = await readMultipartFormData(event);
    
    if (!formData || formData.length === 0) {
      throw createError({
        statusCode: 400,
        statusMessage: "Файл не предоставлен",
      });
    }

    // Ищем файл и pageKey в formData
    let file: any = null;
    let pageKey: string | null = null;
    let fileType: string = "image"; // image или example

    for (const item of formData) {
      if (item.name === "file" && item.filename) {
        file = item;
      } else if (item.name === "pageKey" && item.data) {
        pageKey = item.data.toString("utf-8");
      } else if (item.name === "fileType" && item.data) {
        fileType = item.data.toString("utf-8");
      }
    }

    if (!file || !file.filename) {
      throw createError({
        statusCode: 400,
        statusMessage: "Файл не найден в запросе",
      });
    }

    if (!pageKey) {
      throw createError({
        statusCode: 400,
        statusMessage: "pageKey не указан",
      });
    }

    // Проверяем тип файла
    const contentType = file.type || "image/jpeg";
    if (!contentType.startsWith("image/")) {
      throw createError({
        statusCode: 400,
        statusMessage: "Файл должен быть изображением",
      });
    }

    // Проверяем размер файла (максимум 10 МБ)
    if (file.data.length > 10 * 1024 * 1024) {
      throw createError({
        statusCode: 400,
        statusMessage: "Размер файла не должен превышать 10 МБ",
      });
    }

    // Определяем расширение файла
    const extension = file.filename.split(".").pop() || "jpg";
    const allowedExtensions = ["jpg", "jpeg", "png", "gif", "webp"];
    if (!allowedExtensions.includes(extension.toLowerCase())) {
      throw createError({
        statusCode: 400,
        statusMessage: "Неподдерживаемый формат изображения",
      });
    }

    // Создаем директорию для загрузок, если её нет
    const uploadsDir = join(process.cwd(), "public", "uploads");
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true });
    }

    // Создаем подпапку по типу файла (images или examples)
    const typeDir = join(uploadsDir, fileType === "example" ? "examples" : "images");
    if (!existsSync(typeDir)) {
      await mkdir(typeDir, { recursive: true });
    }

    // Генерируем уникальное имя файла: pageKey-timestamp.extension
    const timestamp = Date.now();
    const randomSuffix = Math.random().toString(36).substring(2, 8);
    const fileName = `${pageKey}-${timestamp}-${randomSuffix}.${extension}`;
    const filePath = join(typeDir, fileName);

    // Сохраняем файл на диск
    await writeFile(filePath, file.data);

    // Формируем публичный URL (относительный путь от public)
    const publicUrl = `/uploads/${fileType === "example" ? "examples" : "images"}/${fileName}`;

    return {
      success: true,
      imageUrl: publicUrl,
      fileName,
    };
  } catch (error: any) {
    console.error("Ошибка загрузки изображения:", error);
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || "Ошибка загрузки изображения",
    });
  }
});
