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
    // Увеличиваем лимит размера тела запроса для загрузки изображений и больших конфигураций
    // По умолчанию Nitro имеет лимит ~1MB, увеличиваем до 50MB для base64 изображений
    experimental: {
      wasm: true,
    },
    // Настройка для увеличения лимита размера запроса
    routeRules: {
      "/api/**": {
        cors: true,
        headers: {
          "Access-Control-Allow-Origin": "*",
        },
      },
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

  },

  // Оптимизация для статического хостинга
  app: {
    head: {
      charset: "utf-8",
      viewport:
        "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no",
      link: [
        { rel: "icon", type: "image/x-icon", href: "/fav.ico" },
        // Предзагрузка и приоритетная загрузка шрифтов
        {
          rel: "preconnect",
          href: "https://fonts.googleapis.com",
        },
        {
          rel: "preconnect",
          href: "https://fonts.gstatic.com",
          crossorigin: "anonymous",
        },
        {
          rel: "stylesheet",
          href: "https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700&display=swap",
        },
      ],
    },
  },
});
