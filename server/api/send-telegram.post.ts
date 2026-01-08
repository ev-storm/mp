export default defineEventHandler(async (event) => {
  if (event.node.req.method !== "POST") {
    throw createError({
      statusCode: 405,
      statusMessage: "Method Not Allowed",
    });
  }

  try {
    const body = await readBody(event);
    const { name, phone, email, comment, fileName } = body;

    if (!phone) {
      throw createError({
        statusCode: 400,
        statusMessage: "Телефон обязателен для заполнения",
      });
    }

    const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
    const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

    if (!BOT_TOKEN || !CHAT_ID) {
      throw createError({
        statusCode: 500,
        statusMessage: "Конфигурация Telegram не настроена",
      });
    }

    let message = `📧 <b>Новое сообщение с сайта</b>\n\n`;
    message += `👤 <b>Имя:</b> ${name || "Не указано"}\n`;
    message += `📞 <b>Телефон:</b> ${phone}\n`;
    if (email) {
      message += `✉️ <b>Email:</b> ${email}\n`;
    }

    if (comment) {
      message += `\n💬 <b>Комментарий:</b>\n${comment}\n`;
    }

    if (fileName) {
      message += `\n📎 <b>Прикреплен файл:</b> ${fileName}`;
    }

    const telegramUrl = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;

    const response = await fetch(telegramUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chat_id: CHAT_ID,
        text: message,
        parse_mode: "HTML",
      }),
    });

    const data = await response.json();

    if (!response.ok || !data.ok) {
      console.error("Telegram API error:", data);
      throw createError({
        statusCode: 500,
        statusMessage: "Ошибка отправки сообщения в Telegram",
      });
    }

    return {
      success: true,
      message: "Сообщение успешно отправлено",
    };
  } catch (error: any) {
    console.error("Error sending to Telegram:", error);
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || "Внутренняя ошибка сервера",
    });
  }
});
