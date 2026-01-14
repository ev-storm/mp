import { createS3Client, uploadToS3, getPublicUrl } from "~/server/utils/s3-client";

export default defineEventHandler(async (event) => {
  try {
    // Проверка аутентификации через токен из cookie, header или x-auth-token
    const token = 
      getCookie(event, "admin-auth-token") || 
      getHeader(event, "authorization")?.replace("Bearer ", "") ||
      getHeader(event, "x-auth-token");
    
    if (!token) {
      throw createError({
        statusCode: 401,
        statusMessage: "Unauthorized - токен не предоставлен",
      });
    }

    const config = useRuntimeConfig();
    
    // Конфигурация Yandex Object Storage
    const YANDEX_ENDPOINT = config.yandexStorageEndpoint || "https://storage.yandexcloud.net";
    const YANDEX_REGION = config.yandexStorageRegion || "ru-central1";
    const YANDEX_BUCKET = config.yandexStorageBucket || "";
    const YANDEX_ACCESS_KEY_ID = config.yandexStorageAccessKeyId || "";
    const YANDEX_SECRET_ACCESS_KEY = config.yandexStorageSecretAccessKey || "";

    if (!YANDEX_BUCKET || !YANDEX_ACCESS_KEY_ID || !YANDEX_SECRET_ACCESS_KEY) {
      throw createError({
        statusCode: 500,
        statusMessage: "Yandex Storage не настроен. Проверьте переменные окружения.",
      });
    }

    // Получаем файл из body
    const body = await readBody(event);
    const { pageKey, imageData } = body;

    if (!pageKey || !imageData) {
      throw createError({
        statusCode: 400,
        statusMessage: "Не указаны pageKey или imageData",
      });
    }

    // Извлекаем base64 данные (удаляем префикс data:image/...;base64,)
    const base64Data = imageData.replace(/^data:image\/\w+;base64,/, "");
    const imageBuffer = Buffer.from(base64Data, "base64");

    // Определяем расширение файла из исходных данных
    const mimeMatch = imageData.match(/^data:image\/(\w+);base64,/);
    const extension = mimeMatch ? mimeMatch[1] : "png";
    const contentType = `image/${extension}`;

    // Генерируем имя файла: pageKey-timestamp.extension
    const timestamp = Date.now();
    const fileName = `images/${pageKey}-${timestamp}.${extension}`;

    // Создаем S3 клиент и загружаем файл
    const s3Client = createS3Client({
      endpoint: YANDEX_ENDPOINT,
      region: YANDEX_REGION,
      bucket: YANDEX_BUCKET,
      accessKeyId: YANDEX_ACCESS_KEY_ID,
      secretAccessKey: YANDEX_SECRET_ACCESS_KEY,
    });

    await uploadToS3(s3Client, YANDEX_BUCKET, fileName, imageBuffer, contentType);

    // Формируем публичный URL
    const publicUrl = getPublicUrl(YANDEX_BUCKET, fileName);

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

