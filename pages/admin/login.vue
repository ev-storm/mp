<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";

useHead({
  title: "Вход в админ-панель",
  meta: [
    {
      name: "description",
      content: "Вход в административную панель",
    },
  ],
});

// Состояние формы
const password = ref("");
const loading = ref(false);
const error = ref("");
const router = useRouter();
const route = useRoute();

// Проверка, если уже авторизован, перенаправляем
onMounted(async () => {
  try {
    const response = await $fetch("/api/admin/check");
    if (response.authenticated) {
      router.push("/admin");
    }
  } catch (err) {
    // Игнорируем ошибку, продолжаем показ формы входа
  }
});

// Обработка входа
const handleLogin = async () => {
  console.log(
    "🔐 handleLogin вызван, пароль:",
    password.value ? "***" : "пусто"
  );

  if (!password.value.trim()) {
    error.value = "Введите пароль";
    console.log("❌ Пароль пустой");
    return;
  }

  loading.value = true;
  error.value = "";

  try {
    const config = useRuntimeConfig();
    // Используем внешний API, если настроен, иначе локальный
    const authApiUrl = config.public.authApiUrl as string | undefined;
    const apiUrl = authApiUrl ? `${authApiUrl}/login` : "/api/admin/login";

    console.log("📤 Отправка запроса на:", apiUrl);
    console.log("📤 Используется внешний API:", !!authApiUrl);

    // Для внешнего API пробуем использовать $fetch (как в Telegram функции)
    let response;
    if (authApiUrl) {
      console.log("📡 Отправка запроса на:", apiUrl);
      console.log("📡 Используется $fetch (как в Telegram функции)");

      try {
        // Используем $fetch, как в Telegram функции
        response = await $fetch(apiUrl, {
          method: "POST",
          body: {
            password: password.value,
          },
          // Не используем credentials для внешнего API
          credentials: "omit",
        });
      } catch (fetchError: any) {
        console.error("❌ Ошибка при запросе к функции:", fetchError);
        console.error("❌ Детали ошибки:", {
          name: fetchError.name,
          message: fetchError.message,
          statusCode: fetchError.statusCode,
          status: fetchError.status,
          data: fetchError.data,
          url: apiUrl,
        });

        // Если это сетевая ошибка, предлагаем использовать localStorage как временное решение
        if (
          fetchError.message?.includes("Failed to fetch") ||
          fetchError.statusCode === 0 ||
          !fetchError.statusCode
        ) {
          // Временное решение для статического хостинга: проверка пароля на клиенте
          // ⚠️ ВНИМАНИЕ: Это менее безопасно! Используйте только для тестирования или если функция недоступна
          console.warn(
            "⚠️ Сервер недоступен. Используется временная проверка на клиенте."
          );

          // Получаем пароль из runtimeConfig (только для проверки)
          const config = useRuntimeConfig();
          const expectedPassword =
            (config.public as any)?.adminPassword || process.env.ADMIN_PASSWORD;

          if (!expectedPassword) {
            throw {
              status: 0,
              statusCode: 0,
              statusMessage:
                "Сервер недоступен и локальный пароль не настроен. Настройте AUTH_API_URL или ADMIN_PASSWORD.",
              message:
                "Сервер недоступен и локальный пароль не настроен. Настройте AUTH_API_URL или ADMIN_PASSWORD.",
              isNetworkError: true,
            };
          }

          // Простая проверка пароля на клиенте (НЕ БЕЗОПАСНО для production!)
          if (password.value !== expectedPassword) {
            throw {
              status: 401,
              statusCode: 401,
              statusMessage: "Неверный пароль",
              message: "Неверный пароль",
            };
          }

          // Генерируем простой токен (не используется для реальной аутентификации)
          const simpleToken = btoa(Date.now().toString() + "-admin");

          response = {
            success: true,
            message: "Успешный вход в систему (локальная проверка)",
            token: simpleToken,
            localAuth: true, // Флаг, что это локальная аутентификация
          };

          console.warn(
            "⚠️ Используется локальная аутентификация (менее безопасно)"
          );
        } else {
          // Другая ошибка - пробрасываем как есть
          throw {
            status: fetchError.statusCode || 500,
            statusCode: fetchError.statusCode || 500,
            statusMessage:
              fetchError.data?.error ||
              fetchError.data?.message ||
              fetchError.statusMessage ||
              fetchError.message ||
              "Ошибка входа",
            message:
              fetchError.data?.error ||
              fetchError.data?.message ||
              fetchError.statusMessage ||
              fetchError.message ||
              "Ошибка входа",
            data: fetchError.data,
          };
        }
      }

      console.log("📡 Ответ получен:", {
        ok: fetchResponse.ok,
        status: fetchResponse.status,
        statusText: fetchResponse.statusText,
        headers: Object.fromEntries(fetchResponse.headers.entries()),
      });

      if (!fetchResponse.ok) {
        let errorData = {};
        try {
          const text = await fetchResponse.text();
          console.error("❌ Текст ошибки:", text);
          errorData = JSON.parse(text);
        } catch (e) {
          console.error("❌ Не удалось распарсить ошибку:", e);
        }

        throw {
          status: fetchResponse.status,
          statusCode: fetchResponse.status,
          statusMessage:
            errorData.error ||
            errorData.message ||
            `HTTP ${fetchResponse.status}: ${fetchResponse.statusText}`,
          message:
            errorData.error ||
            errorData.message ||
            `HTTP ${fetchResponse.status}: ${fetchResponse.statusText}`,
          data: errorData,
        };
      }

      const responseText = await fetchResponse.text();
      console.log("📥 Ответ (текст):", responseText);

      try {
        response = JSON.parse(responseText);
      } catch (e) {
        console.error("❌ Ошибка парсинга JSON:", e);
        throw {
          status: 500,
          statusCode: 500,
          statusMessage: "Неверный формат ответа от сервера",
          message: "Неверный формат ответа от сервера",
        };
      }

      console.log("✅ Ответ (объект):", response);
    } else {
      // Для локального API используем $fetch
      response = await $fetch(apiUrl, {
        method: "POST",
        body: {
          password: password.value,
        },
        credentials: "include", // Важно для работы с cookies
      });
    }

    console.log("✅ Ответ получен:", response);

    // Проверяем разные варианты успешного ответа
    if (response && (response as any).success) {
      console.log("✅ Успешный вход, ожидание 100ms перед перенаправлением...");

      // Если используется внешний API (статический хостинг), сохраняем токен в localStorage
      const config = useRuntimeConfig();
      const authApiUrl = config.public.authApiUrl as string | undefined;

      if (authApiUrl && (response as any).token) {
        // Сохраняем токен в localStorage для статического хостинга
        localStorage.setItem("admin-auth-token", (response as any).token);
        console.log("💾 Токен сохранен в localStorage");
      }

      // Даем время cookie установиться (если используется SSR)
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Перенаправляем на страницу админки
      const redirectPath = (route.query.redirect as string) || "/admin";
      console.log("🔄 Перенаправление на:", redirectPath);

      // Используем window.location для принудительной перезагрузки страницы
      // Это гарантирует, что middleware увидит новый cookie/token
      window.location.href = redirectPath;
    } else {
      console.warn("⚠️ Ответ получен, но success не true:", response);
      error.value = "Неожиданный ответ от сервера";
    }
  } catch (err: any) {
    console.error("❌ Ошибка входа:", err);
    console.error("❌ Структура ошибки:", {
      statusCode: err.statusCode,
      status: err.status,
      statusMessage: err.statusMessage,
      message: err.message,
      data: err.data,
    });

    // Обрабатываем разные форматы ошибок
    let errorMessage = "Ошибка входа. Проверьте пароль.";

    // Проверяем сетевые ошибки в первую очередь
    if (err.isNetworkError || err.statusCode === 0 || err.status === 0) {
      errorMessage =
        err.message ||
        err.statusMessage ||
        "Ошибка подключения к серверу. Проверьте URL функции в настройках (AUTH_API_URL).";
    }
    // Проверяем разные варианты структуры ошибки
    else if (err.data?.statusMessage) {
      errorMessage = err.data.statusMessage;
    } else if (err.data?.message) {
      errorMessage = err.data.message;
    } else if (err.data?.hint) {
      errorMessage = err.data.hint;
    } else if (err.statusMessage) {
      errorMessage = err.statusMessage;
    } else if (err.message) {
      errorMessage = err.message;
    }

    // Если статус 401, просто показываем сообщение об ошибке
    if (err.statusCode === 401 || err.status === 401) {
      if (!errorMessage || errorMessage === "Ошибка входа. Проверьте пароль.") {
        errorMessage = "Неверный пароль";
      }
    }

    // Если статус 500, возможно, конфигурация не настроена
    if (err.statusCode === 500 || err.status === 500) {
      if (
        errorMessage.includes("не настроена") ||
        errorMessage.includes("не настроен")
      ) {
        errorMessage =
          "Конфигурация не настроена. Установите ADMIN_PASSWORD и ADMIN_SECRET_KEY в переменных окружения функции Yandex Cloud.";
      }
    }

    error.value = errorMessage;
  } finally {
    loading.value = false;
    console.log("🏁 handleLogin завершен, loading:", loading.value);
  }
};

// Обработка Enter
const handleKeyPress = (event: KeyboardEvent) => {
  if (event.key === "Enter") {
    handleLogin();
  }
};
</script>

<template>
  <div class="login-container">
    <div class="login-box">
      <form @submit.prevent="handleLogin" class="login-form">
        <div class="form-group">
          <input
            id="password"
            v-model="password"
            type="password"
            placeholder="Введите пароль"
            @keypress="handleKeyPress"
            @keyup.enter="handleLogin"
            :disabled="loading"
            autocomplete="current-password"
            required
          />
        </div>

        <div v-if="error" class="error-message">{{ error }}</div>

        <div v-if="loading" class="loading-indicator">Обработка...</div>

        <button
          type="submit"
          :disabled="loading"
          class="btn btn-primary"
          @click.prevent="handleLogin"
        >
          {{ loading ? "Вход..." : "Войти" }}
        </button>
      </form>
    </div>
  </div>
</template>

<style scoped>
.login-container {
  min-height: 80vh;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: var(--back, #f5f5f5);
}

.login-box {
  background: white;
  border-radius: 12px;
  padding: 40px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
}

.login-box h1 {
  margin: 0 0 15px 0;
  font-size: 24px;
  font-weight: 600;
  text-align: center;
  color: var(--black, #333);
}

.login-hint {
  margin: 0 0 25px 0;
  padding: 10px 15px;
  background: #f0f0f0;
  border-radius: 6px;
  font-size: 13px;
  text-align: center;
  color: var(--grey, #666);
  line-height: 1.5;
}

.login-hint strong {
  color: var(--black, #333);
  font-weight: 600;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  font-size: 14px;
  font-weight: 500;
  color: var(--grey, #666);
}

.form-group input {
  padding: 6px 16px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  transition: border-color 0.2s;
  background: var(--back, #f9f9f9);
}

.form-group input:focus {
  outline: none;
  border-color: var(--blue, #0066cc);
}

.form-group input:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.error-message {
  padding: 12px;
  background: #fee;
  border: 1px solid #fcc;
  border-radius: 6px;
  color: var(--red, #d32f2f);
  font-size: 14px;
  text-align: center;
}

.loading-indicator {
  padding: 12px;
  background: #e3f2fd;
  border: 1px solid #90caf9;
  border-radius: 6px;
  color: var(--blue, #1976d2);
  font-size: 14px;
  text-align: center;
}

.btn {
  padding: 6px 24px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary {
  background: var(--green, #4caf50);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: var(--green, #45a049);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3);
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

@media (max-width: 480px) {
  .login-box {
    padding: 30px 20px;
  }

  .login-box h1 {
    font-size: 20px;
  }
}
</style>
