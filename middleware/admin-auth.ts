export default defineNuxtRouteMiddleware(async (to, from) => {
  // Разрешаем доступ к странице входа без проверки
  if (to.path === "/admin/login") {
    return;
  }

  // Для статического хостинга используем клиентскую проверку
  if (process.client) {
    const { getToken, isTokenExpired } = await import("~/utils/auth-client");
    const token = getToken();
    
    if (!token || isTokenExpired()) {
      return navigateTo("/admin/login");
    }
    return;
  }

  // Для SSR - перенаправляем на вход (клиентская аутентификация работает только на клиенте)
  if (process.server) {
    return navigateTo("/admin/login");
  }
});
