export default defineEventHandler(async (event) => {
  if (event.node.req.method !== "POST") {
    throw createError({
      statusCode: 405,
      statusMessage: "Method Not Allowed",
    });
  }

  try {
    // Удаляем cookie с токеном
    deleteCookie(event, "admin-auth-token", {
      path: "/",
    });

    return {
      success: true,
      message: "Успешный выход из системы",
    };
  } catch (error: any) {
    console.error("Ошибка выхода:", error);
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || "Внутренняя ошибка сервера",
    });
  }
});
