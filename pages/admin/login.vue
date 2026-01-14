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
const remainingAttempts = ref<number | null>(null);
// Пока защита от брутфорса не реализована на сервере,
// держим lockoutTime как ref, чтобы не было ворнинга Vue.
const lockoutTime = ref<number | null>(null);
const router = useRouter();
const route = useRoute();

// Проверка, если уже авторизован, перенаправляем
onMounted(async () => {
  if (process.client) {
    try {
      // Проверяем авторизацию через серверный endpoint
      const response = await $fetch("/api/admin/check");
      if (response.authenticated) {
        router.push("/admin");
      }
    } catch {
      // Если не авторизован, остаемся на странице входа
    }
  }
});

// Обработка входа
const handleLogin = async () => {
  if (!password.value.trim()) {
    error.value = "Введите пароль";
    return;
  }

  loading.value = true;
  error.value = "";
  remainingAttempts.value = null;

  try {
    // Используем серверный endpoint для авторизации
    // Cookies устанавливаются автоматически сервером
    const response = await $fetch("/api/admin/login", {
      method: "POST",
      body: {
        password: password.value,
      },
    });

    if (response.success) {
      // Успешный вход - перенаправляем на админ-панель
      const redirectPath = (route.query.redirect as string) || "/admin";
      await router.push(redirectPath);
    }
  } catch (err: any) {
    // Обработка ошибок от сервера
    let errorMessage = "Ошибка входа. Проверьте пароль.";

    if (err.statusMessage) {
      errorMessage = err.statusMessage;
    } else if (err.message) {
      errorMessage = err.message;
    } else if (err.data?.message) {
      errorMessage = err.data.message;
    }

    // Если сервер вернул информацию о попытках
    if (err.data?.remainingAttempts !== undefined) {
      const attempts = err.data.remainingAttempts;
      if (attempts > 0 && attempts <= 3) {
        remainingAttempts.value = attempts;
        errorMessage = `Неверный пароль. Осталось попыток: ${attempts}`;
      }
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
