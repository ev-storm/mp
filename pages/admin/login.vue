<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import {
  verifyPassword,
  generateAuthToken,
  saveToken,
  getToken,
  isTokenExpired,
  checkBruteForceProtection,
  recordFailedAttempt,
  clearFailedAttempts,
} from "~/utils/auth-client";

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
const lockoutTime = ref<number | null>(null);
const remainingAttempts = ref<number | null>(null);
const router = useRouter();
const route = useRoute();

// Проверка, если уже авторизован, перенаправляем
onMounted(() => {
  if (process.client) {
    const token = getToken();
    if (token && !isTokenExpired()) {
      router.push("/admin");
    }
  }
});

// Обработка входа
const handleLogin = async () => {
  if (!password.value.trim()) {
    error.value = "Введите пароль";
    return;
  }

  // Проверяем защиту от брутфорса
  const bruteForceCheck = checkBruteForceProtection();
  if (!bruteForceCheck.allowed) {
    if (bruteForceCheck.lockoutTime) {
      const minutes = Math.ceil(bruteForceCheck.lockoutTime / 60000);
      error.value = `Слишком много неудачных попыток. Попробуйте снова через ${minutes} ${
        minutes === 1 ? "минуту" : minutes < 5 ? "минуты" : "минут"
      }.`;
      lockoutTime.value = bruteForceCheck.lockoutTime;
    } else {
      error.value = "Доступ временно заблокирован";
    }
    return;
  }

  // Устанавливаем remainingAttempts только если осталось 3 или меньше попыток
  if (bruteForceCheck.remainingAttempts <= 3) {
    remainingAttempts.value = bruteForceCheck.remainingAttempts;
  } else {
    remainingAttempts.value = null;
  }

  loading.value = true;
  error.value = "";

  try {
    const config = useRuntimeConfig();

    // Получаем хеш пароля и секретный ключ из конфигурации
    const passwordHash = (config.public as any).adminPasswordHash as
      | string
      | undefined;
    const secretKey = (config.public as any).adminSecretKey as
      | string
      | undefined;

    // Проверяем, настроена ли клиентская аутентификация
    if (
      !passwordHash ||
      !secretKey ||
      passwordHash === "" ||
      secretKey === ""
    ) {
      error.value =
        "Аутентификация не настроена. Настройте ADMIN_PASSWORD_HASH и ADMIN_SECRET_KEY в .env файле.";
      loading.value = false;
      return;
    }

    // Проверяем пароль
    const isValid = await verifyPassword(password.value, passwordHash!);

    if (!isValid) {
      // Регистрируем неудачную попытку
      recordFailedAttempt();

      // Проверяем оставшиеся попытки
      const newCheck = checkBruteForceProtection();

      if (newCheck.remainingAttempts > 0) {
        // Показываем предупреждение только если осталось 3 или меньше попыток
        if (newCheck.remainingAttempts <= 3) {
          remainingAttempts.value = newCheck.remainingAttempts;
          error.value = `Неверный пароль. Осталось попыток: ${newCheck.remainingAttempts}`;
        } else {
          remainingAttempts.value = null;
          error.value = "Неверный пароль";
        }
      } else {
        remainingAttempts.value = null;
        error.value =
          "Слишком много неудачных попыток. Попробуйте снова через 15 минут.";
        lockoutTime.value = newCheck.lockoutTime || 15 * 60 * 1000;
      }

      // Добавляем задержку для усложнения брутфорса
      await new Promise((resolve) =>
        setTimeout(resolve, 1000 + Math.random() * 1000)
      );

      loading.value = false;
      return;
    }

    // Пароль верный - очищаем счетчик попыток
    clearFailedAttempts();
    remainingAttempts.value = null;
    lockoutTime.value = null;

    // Генерируем токен
    const token = await generateAuthToken(password.value, secretKey!);
    saveToken(token);

    // Перенаправляем на страницу админки
    const redirectPath = (route.query.redirect as string) || "/admin";
    setTimeout(() => {
      window.location.href = redirectPath;
    }, 100);
  } catch (err: any) {
    let errorMessage = "Ошибка входа. Проверьте пароль.";

    if (err.message) {
      // Проверяем ошибки связанные с crypto API
      if (err.message.includes("crypto") || err.message.includes("HTTPS")) {
        errorMessage =
          "Аутентификация требует HTTPS. Убедитесь, что сайт работает по защищенному соединению.";
      } else if (err.statusMessage) {
        errorMessage = err.statusMessage;
      } else {
        errorMessage = err.message;
      }
    } else if (err.statusMessage) {
      errorMessage = err.statusMessage;
    }

    error.value = errorMessage;
  } finally {
    loading.value = false;
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

        <div
          v-if="
            remainingAttempts !== null &&
            remainingAttempts > 0 &&
            remainingAttempts <= 3
          "
          class="attempts-warning"
        >
          Осталось попыток: {{ remainingAttempts }}
        </div>

        <div v-if="lockoutTime" class="lockout-message">
          Блокировка до:
          {{ new Date(Date.now() + lockoutTime).toLocaleTimeString() }}
        </div>

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
  /* background: var(--back, #f5f5f5); */
  background-image: url(/img/login/1.png);
  background-position: center;
  background-size: cover;
  border-radius: 10px;
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
  padding: 0px 12px;
  background: #ffffff;
  border: 0px solid #fcc;
  border-radius: 6px;
  color: var(--red, #d32f2f);
  font-size: 14px;
  text-align: center;
}

.attempts-warning {
  padding: 10px;
  background: #fff4e6;
  border: 1px solid #ffcc80;
  border-radius: 6px;
  color: #ff9c5e;
  font-size: 13px;
  text-align: center;
  margin-bottom: 10px;
}

.lockout-message {
  padding: 10px;
  background: #fee;
  border: 1px solid #fcc;
  border-radius: 6px;
  color: var(--red, #d32f2f);
  font-size: 13px;
  text-align: center;
  margin-bottom: 10px;
  font-weight: 600;
}

.loading-indicator {
  padding: 0 12px;
  background: #ffffff;
  border: 0px solid #90caf9;
  border-radius: 6px;
  color: var(--blue);
  font-size: 12px;
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
