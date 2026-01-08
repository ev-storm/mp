// https://nuxt.com/docs/api/configuration/nuxt-config

export default defineNuxtConfig({
  devtools: { enabled: false },

  // Глобальные стили
  css: ["~/assets/css/main.css"],

  // Настройка для SSR
  ssr: true,
  nitro: {
    prerender: {
      crawlLinks: true,
      routes: ["/"],
    },
  },

  // Конфигурация для API
  runtimeConfig: {
    public: {
      // Публичные переменные (доступны на клиенте и сервере)
      // Здесь можно добавить публичные настройки, если нужны
    },
    // Секретные ключи для аутентификации (только на сервере)
    // ОБЯЗАТЕЛЬНО: установите ADMIN_PASSWORD и ADMIN_SECRET_KEY в .env файле
    adminPassword: process.env.ADMIN_PASSWORD,
    adminSecretKey: process.env.ADMIN_SECRET_KEY,

    // Telegram конфигурация (только на сервере)
    telegramBotToken: process.env.TELEGRAM_BOT_TOKEN,
    telegramChatId: process.env.TELEGRAM_CHAT_ID,

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
