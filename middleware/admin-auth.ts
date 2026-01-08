export default defineNuxtRouteMiddleware(async (to, from) => {
  // Разрешаем доступ к странице входа без проверки
  if (to.path === "/admin/login") {
    return;
  }

  // Проверяем наличие токена аутентификации
  // Для статического хостинга используем localStorage, для SSR - cookies
  const config = useRuntimeConfig();
  const authApiUrl = config.public.authApiUrl as string | undefined;

  // Если используется внешний API, проверяем localStorage
  let authToken: any = null;
  if (authApiUrl && process.client) {
    // На клиенте для статического хостинга используем localStorage
    const token = localStorage.getItem("admin-auth-token");
    if (token) {
      authToken = { value: token };
    }
  } else {
    // Для SSR используем cookies
    authToken = useCookie("admin-auth-token");
  }

  console.log("🔐 Middleware проверка:", {
    path: to.path,
    hasToken: !!authToken.value,
    tokenValue: authToken.value
      ? authToken.value.substring(0, 20) + "..."
      : null,
    isServer: process.server,
  });

  // На сервере проверяем токен напрямую
  if (process.server) {
    if (!authToken.value) {
      console.log(
        "❌ Токен отсутствует (сервер), перенаправление на /admin/login"
      );
      return navigateTo("/admin/login");
    }

    const config = useRuntimeConfig();
    const secretKey =
      config.adminSecretKey || (process.env as any).ADMIN_SECRET_KEY;

    if (!secretKey) {
      console.error(
        "❌ ADMIN_SECRET_KEY не настроен. Установите его в .env файле."
      );
      return navigateTo("/admin/login");
    }

    try {
      // Проверяем токен (простая проверка, можно улучшить с JWT)
      const isValid = validateAuthToken(authToken.value, secretKey);

      console.log("🔍 Проверка токена (сервер):", {
        isValid,
        tokenLength: authToken.value?.length,
      });

      if (!isValid) {
        // Токен невалидный, удаляем его и перенаправляем
        console.log("❌ Токен невалидный, перенаправление на /admin/login");
        if (authApiUrl && process.client) {
          localStorage.removeItem("admin-auth-token");
        } else {
          authToken.value = null;
        }
        return navigateTo("/admin/login");
      }

      console.log("✅ Токен валиден (сервер), доступ разрешен");
    } catch (error) {
      console.error("❌ Ошибка проверки токена:", error);
      if (authApiUrl && process.client) {
        localStorage.removeItem("admin-auth-token");
      } else {
        authToken.value = null;
      }
      return navigateTo("/admin/login");
    }
  } else {
    // На клиенте httpOnly cookie недоступна через useCookie
    // Проверяем через API endpoint
    try {
      // Для статического хостинга проверяем localStorage
      if (authApiUrl && process.client) {
        const token = localStorage.getItem("admin-auth-token");
        if (!token) {
          console.log(
            "❌ Токен отсутствует в localStorage (клиент), перенаправление на /admin/login"
          );
          return navigateTo("/admin/login");
        }

        // Проверяем токен через API
        try {
          const config = useRuntimeConfig();
          const apiUrl = `${authApiUrl}/check`;

          const response = await $fetch(apiUrl, {
            method: "POST",
            body: { token },
            credentials: "include",
          });
          console.log("🔍 Проверка через API (клиент):", response);

          if (!response.authenticated) {
            console.log(
              "❌ Не аутентифицирован (клиент), перенаправление на /admin/login"
            );
            localStorage.removeItem("admin-auth-token");
            return navigateTo("/admin/login");
          }

          console.log("✅ Аутентифицирован (клиент), доступ разрешен");
        } catch (error) {
          console.error("❌ Ошибка проверки через API:", error);
          localStorage.removeItem("admin-auth-token");
          return navigateTo("/admin/login");
        }
      } else {
        // Для SSR проверяем через локальный API
        const config = useRuntimeConfig();
        const apiUrl = "/api/admin/check";

        const response = await $fetch(apiUrl, {
          credentials: "include", // Важно для работы с cookies
        });
        console.log("🔍 Проверка через API (клиент):", response);

        if (!response.authenticated) {
          console.log(
            "❌ Не аутентифицирован (клиент), перенаправление на /admin/login"
          );
          return navigateTo("/admin/login");
        }

        console.log("✅ Аутентифицирован (клиент), доступ разрешен");
      }
    } catch (error) {
      console.error("❌ Ошибка проверки через API:", error);
      if (authApiUrl && process.client) {
        localStorage.removeItem("admin-auth-token");
      }
      return navigateTo("/admin/login");
    }
  }
});

// Простая функция проверки токена (можно улучшить с использованием JWT)
function validateAuthToken(token: string, secretKey: string): boolean {
  try {
    // Используем crypto только на сервере
    if (typeof require !== "undefined") {
      const crypto = require("crypto");
      const expectedToken = crypto
        .createHash("sha256")
        .update(secretKey + "-admin")
        .digest("hex");
      return token === expectedToken;
    }
    // На клиенте просто проверяем наличие токена
    // Детальная проверка происходит через API
    return !!token;
  } catch {
    return false;
  }
}
