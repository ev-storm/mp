// Yandex Cloud Function для аутентификации админ-панели
// Поддерживает: POST /login, GET /check, POST /logout

const crypto = require("crypto");

// Получаем секретные ключи из переменных окружения
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const ADMIN_SECRET_KEY = process.env.ADMIN_SECRET_KEY;

// Генерация токена аутентификации
function generateAuthToken(secretKey) {
  return crypto
    .createHash("sha256")
    .update(secretKey + "-admin")
    .digest("hex");
}

// Проверка валидности токена
function validateAuthToken(token, secretKey) {
  const expectedToken = generateAuthToken(secretKey);
  return token === expectedToken;
}

// Установка cookie
function setCookie(name, value, options = {}) {
  const {
    httpOnly = true,
    secure = false,
    sameSite = "lax",
    maxAge = 60 * 60 * 24 * 7, // 7 дней
    path = "/",
  } = options;

  const cookieOptions = [
    `${name}=${value}`,
    `Path=${path}`,
    `Max-Age=${maxAge}`,
    `SameSite=${sameSite}`,
  ];

  if (httpOnly) {
    cookieOptions.push("HttpOnly");
  }

  if (secure) {
    cookieOptions.push("Secure");
  }

  return cookieOptions.join("; ");
}

// Удаление cookie
function deleteCookie(name) {
  return `${name}=; Path=/; Max-Age=0; HttpOnly; SameSite=lax`;
}

module.exports.handler = async function (event, context) {
  // Логируем входящее событие для отладки (только структуру, не весь объект)
  console.log("Yandex Cloud Function Auth - получено событие");
  console.log("Тип события:", typeof event);
  console.log("Ключи события:", event ? Object.keys(event) : "null");
  console.log("httpMethod:", event?.httpMethod);
  console.log("method:", event?.method);
  console.log("path:", event?.path);
  console.log("url:", event?.url);
  console.log("body тип:", typeof event?.body);
  console.log(
    "body длина:",
    typeof event?.body === "string" ? event.body.length : "не строка"
  );

  // CORS заголовки
  const headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Credentials": "true",
    "Access-Control-Max-Age": "86400", // 24 часа
  };

  // Обработка OPTIONS запроса (preflight)
  const httpMethod =
    event?.httpMethod ||
    event?.requestContext?.http?.method ||
    event?.method ||
    "GET";

  console.log("Определенный метод:", httpMethod);

  if (httpMethod === "OPTIONS") {
    console.log("OPTIONS запрос (preflight)");
    return {
      statusCode: 200,
      headers,
      body: "",
    };
  }

  // Проверка наличия секретных ключей
  if (!ADMIN_PASSWORD || !ADMIN_SECRET_KEY) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: "Конфигурация не настроена",
        message:
          "ADMIN_PASSWORD и ADMIN_SECRET_KEY должны быть установлены в переменных окружения функции",
      }),
    };
  }

  // Определяем путь и метод из разных форматов событий Yandex Cloud
  // Yandex Cloud Functions могут использовать разные форматы
  // При прямом вызове функции через URL путь может быть в разных местах
  let path =
    event.path ||
    event.requestContext?.path ||
    event.requestContext?.http?.path ||
    event.requestPath ||
    event.url ||
    "";

  let method =
    event.httpMethod ||
    event.requestMethod ||
    event.requestContext?.http?.method ||
    event.method ||
    event.requestContext?.http?.requestMethod ||
    "GET";

  // Извлекаем путь из полного URL, если нужно
  if (path.includes("?")) {
    path = path.split("?")[0];
  }

  // Убираем базовый путь функции, оставляем только endpoint
  // Например: если path = "/login" или "login", то endpoint = "login"
  // Или если функция вызывается напрямую, может быть пустой путь
  const pathParts = path.split("/").filter((p) => p);
  const endpoint = pathParts[pathParts.length - 1] || "";

  // Также проверяем query параметры для endpoint (если используется как query параметр)
  const queryParams = event.queryStringParameters || event.query || {};
  const queryEndpoint = queryParams.endpoint || queryParams.action || null;

  console.log("Yandex Cloud Function Auth - обработка:", {
    path,
    method,
    endpoint,
    queryEndpoint,
    hasBody: !!event?.body,
    bodyType: typeof event?.body,
    eventKeys: event ? Object.keys(event).slice(0, 15) : [],
    queryParams: Object.keys(queryParams),
  });

  try {
    // POST /login - вход в систему
    // Проверяем endpoint в пути, query параметрах, или просто по методу POST (если путь пустой)
    const isLoginRequest =
      method === "POST" &&
      (endpoint === "login" ||
        path.includes("/login") ||
        path.endsWith("/login") ||
        queryEndpoint === "login" ||
        (endpoint === "" && method === "POST")); // Если путь пустой, но метод POST - это может быть login

    if (isLoginRequest) {
      // Парсим тело запроса
      let body;
      try {
        body =
          typeof event.body === "string"
            ? JSON.parse(event.body)
            : event.body || {};
      } catch (e) {
        console.error("Ошибка парсинга body:", e);
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({
            error: "Неверный формат данных",
            message: e.message,
          }),
        };
      }

      const { password } = body || {};

      console.log("POST /login - проверка пароля");

      if (!password) {
        console.log("❌ Пароль не передан");
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({
            error: "Пароль обязателен",
          }),
        };
      }

      if (password !== ADMIN_PASSWORD) {
        console.log("❌ Неверный пароль");
        return {
          statusCode: 401,
          headers,
          body: JSON.stringify({
            error: "Неверный пароль",
          }),
        };
      }

      console.log("✅ Пароль верный, генерируем токен");

      // Генерируем токен
      const authToken = generateAuthToken(ADMIN_SECRET_KEY);
      const cookieHeader = setCookie("admin-auth-token", authToken, {
        httpOnly: true,
        secure: false, // В production установите true для HTTPS
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7, // 7 дней
      });

      return {
        statusCode: 200,
        headers: {
          ...headers,
          "Set-Cookie": cookieHeader,
        },
        body: JSON.stringify({
          success: true,
          message: "Успешный вход в систему",
          // Возвращаем токен для хранения в localStorage (для статического хостинга)
          token: authToken,
        }),
      };
    }

    // GET /check или POST /check - проверка аутентификации
    const isCheckRequest =
      (method === "GET" || method === "POST") &&
      (endpoint === "check" ||
        path.includes("/check") ||
        path.endsWith("/check") ||
        queryEndpoint === "check");

    if (isCheckRequest) {
      // Получаем токен из cookies или из тела запроса (для статического хостинга)
      let authToken = null;

      // Сначала проверяем cookies
      const allHeaders =
        event.headers || event.requestContext?.http?.headers || {};
      const cookies =
        allHeaders.Cookie ||
        allHeaders.cookie ||
        allHeaders["Cookie"] ||
        allHeaders["cookie"] ||
        "";
      const cookieMatch = cookies.match(/admin-auth-token=([^;]+)/);
      if (cookieMatch) {
        authToken = cookieMatch[1];
      }

      // Если токена нет в cookies, проверяем тело запроса (для localStorage)
      if (!authToken) {
        try {
          const body =
            typeof event.body === "string"
              ? JSON.parse(event.body)
              : event.body;
          authToken = body?.token || null;
        } catch (e) {
          // Игнорируем ошибку парсинга
        }
      }

      if (!authToken) {
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({
            authenticated: false,
          }),
        };
      }

      const isValid = validateAuthToken(authToken, ADMIN_SECRET_KEY);

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          authenticated: isValid,
        }),
      };
    }

    // POST /logout - выход из системы
    const isLogoutRequest =
      method === "POST" &&
      (endpoint === "logout" ||
        path.includes("/logout") ||
        path.endsWith("/logout") ||
        queryEndpoint === "logout");

    if (isLogoutRequest) {
      const cookieHeader = deleteCookie("admin-auth-token");

      return {
        statusCode: 200,
        headers: {
          ...headers,
          "Set-Cookie": cookieHeader,
        },
        body: JSON.stringify({
          success: true,
          message: "Успешный выход из системы",
        }),
      };
    }

    // Неизвестный endpoint
    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({
        error: "Not Found",
      }),
    };
  } catch (error) {
    console.error("❌ Ошибка обработки запроса:", error);
    console.error("❌ Stack trace:", error.stack);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: "Внутренняя ошибка сервера",
        message: error.message || "Неизвестная ошибка",
        details:
          process.env.NODE_ENV === "development" ? error.stack : undefined,
      }),
    };
  }
};
