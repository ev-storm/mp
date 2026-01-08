// https://nuxt.com/docs/api/configuration/nuxt-config

// URL функции Yandex Cloud для отправки сообщений в Telegram
// Замените на ваш URL функции
const TELEGRAM_API_URL =
  "https://functions.yandexcloud.net/d4e1pouvgqhbgkjerjq9/form-tg";

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
      // URL функции Yandex Cloud для аутентификации (если используется статический хостинг)
      // Оставьте пустым, если используете SSR (nuxt build)
      authApiUrl: process.env.AUTH_API_URL || "",
    },
    // Секретные ключи для аутентификации (только на сервере)
    // ОБЯЗАТЕЛЬНО: установите ADMIN_PASSWORD и ADMIN_SECRET_KEY в .env файле
    adminPassword: process.env.ADMIN_PASSWORD,
    adminSecretKey: process.env.ADMIN_SECRET_KEY,
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
