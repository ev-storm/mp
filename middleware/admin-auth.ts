export default defineNuxtRouteMiddleware(async (to, from) => {
  // Разрешаем доступ к странице входа без проверки
  if (to.path === "/admin/login") {
    return;
  }

  // Проверяем авторизацию через серверный endpoint
  try {
    const response = await $fetch("/api/admin/check");
    
    if (!response.authenticated) {
      return navigateTo("/admin/login");
    }
  } catch (error) {
    // Если ошибка при проверке, перенаправляем на вход
    return navigateTo("/admin/login");
  }
});
