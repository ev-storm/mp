// https://nuxt.com/docs/api/configuration/nuxt-config

// URL функции Yandex Cloud для отправки сообщений в Telegram
// Замените на ваш URL функции
const TELEGRAM_API_URL =
  "https://functions.yandexcloud.net/d4e1pouvgqhbgkjerjq9/form-tg";

// URL функции Yandex Cloud для загрузки изображений в Object Storage
// Замените на ваш URL функции после развертывания
const UPLOAD_IMAGE_API_URL = process.env.UPLOAD_IMAGE_API_URL || "";

export default defineNuxtConfig({
  devtools: { enabled: false },

  // Глобальные стили
  css: ["~/assets/css/main.css"],

  // Настройка для статической генерации
  ssr: true,
  nitro: {
    prerender: {
      crawlLinks: true,
      routes: ["/"],
    },
  },

  // Конфигурация для API
  // URL функции Yandex Cloud будет доступен через runtimeConfig.public.telegramApiUrl
  runtimeConfig: {
    public: {
      telegramApiUrl: TELEGRAM_API_URL,
      // URL функции Yandex Cloud для загрузки изображений
      uploadImageApiUrl: UPLOAD_IMAGE_API_URL,
      // Клиентская аутентификация для статического хостинга
      // Сгенерируйте хеш пароля с помощью: node scripts/generate-password-hash.js <пароль> <секретный-ключ>
      adminPasswordHash: process.env.ADMIN_PASSWORD_HASH || "",
      adminSecretKey: process.env.ADMIN_SECRET_KEY || "",
    },
    // Секретные ключи для аутентификации (только на сервере для SSR)
    // ОБЯЗАТЕЛЬНО: установите ADMIN_PASSWORD и ADMIN_SECRET_KEY в .env файле
    adminPassword: process.env.ADMIN_PASSWORD,
    adminSecretKey: process.env.ADMIN_SECRET_KEY,

    // Yandex Object Storage конфигурация (только на сервере)
    yandexStorageEndpoint:
      process.env.YANDEX_STORAGE_ENDPOINT || "https://storage.yandexcloud.net",
    yandexStorageRegion: process.env.YANDEX_STORAGE_REGION || "ru-central1",
    yandexStorageBucket: process.env.YANDEX_STORAGE_BUCKET || "",
    yandexStorageAccessKeyId: process.env.YANDEX_STORAGE_ACCESS_KEY_ID || "",
    yandexStorageSecretAccessKey:
      process.env.YANDEX_STORAGE_SECRET_ACCESS_KEY || "",
  },

  // Оптимизация для статического хостинга
  app: {
    head: {
      charset: "utf-8",
      viewport:
        "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no",
      link: [{ rel: "icon", type: "image/x-icon", href: "/fav.ico" }],
    },
    // pageTransition отключен из-за бага с навигацией
    // pageTransition: { name: "page", mode: "out-in" },
  },
});
