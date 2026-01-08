<script setup lang="ts">
import { ref } from "vue";

interface FormData {
  name: string;
  phone: string;
  email: string;
  comment: string;
}

const props = defineProps<{
  isOpen: boolean;
}>();

const emit = defineEmits<{
  (e: "close"): void;
  (e: "submit", data: FormData, file: File | null): void;
}>();

const formData = ref<FormData>({
  name: "",
  phone: "",
  email: "",
  comment: "",
});

const fileName = ref<string>("");
const fileInputRef = ref<HTMLInputElement | null>(null);
const isSubmitting = ref(false);
const submitError = ref<string>("");
const submitSuccess = ref(false);

// Функция для извлечения только цифр из строки
const getDigits = (value: string): string => {
  return value.replace(/\D/g, "");
};

// Функция для форматирования номера телефона в формат +7 999 999-99-99
const formatPhone = (value: string): string => {
  const digits = getDigits(value);

  if (!digits) return "";

  let phoneDigits = digits;

  if (phoneDigits.length > 0 && phoneDigits[0] !== "7") {
    phoneDigits = "7" + phoneDigits;
  }

  phoneDigits = phoneDigits.slice(0, 11);

  if (phoneDigits.length <= 1) {
    return phoneDigits === "7" ? "+7" : "";
  }

  const digitsAfter7 = phoneDigits.slice(1);

  let formatted = "+7";

  if (digitsAfter7.length > 0) {
    formatted += " " + digitsAfter7.slice(0, 3);
  }
  if (digitsAfter7.length > 3) {
    formatted += " " + digitsAfter7.slice(3, 6);
  }
  if (digitsAfter7.length > 6) {
    formatted += "-" + digitsAfter7.slice(6, 8);
  }
  if (digitsAfter7.length > 8) {
    formatted += "-" + digitsAfter7.slice(8, 10);
  }

  return formatted;
};

// Обработчик ввода телефона
const handlePhoneInput = (event: Event) => {
  const input = event.target as HTMLInputElement;
  const value = input.value;
  const formatted = formatPhone(value);
  formData.value.phone = formatted;
};

const handleFileUpload = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files[0]) {
    const file = target.files[0];
    
    // Проверка типа файла (опционально, можно убрать если нужны любые файлы)
    // if (file.type !== "application/pdf") {
    //   alert("Пожалуйста, загрузите файл в формате PDF");
    //   target.value = "";
    //   fileName.value = "";
    //   return;
    // }
    
    if (file.size > 2.5 * 1024 * 1024) {
      alert("Файл не должен превышать 2.5 МБ");
      // Сбрасываем input при ошибке
      target.value = "";
      fileName.value = "";
      return;
    }
    
    // Устанавливаем имя файла для отображения
    fileName.value = file.name;
  } else {
    fileName.value = "";
  }
};

const removeFile = () => {
  fileName.value = "";
  if (fileInputRef.value) {
    fileInputRef.value.value = "";
  }
};

const submitForm = async () => {
  // Валидация обязательных полей
  if (!formData.value.phone) {
    submitError.value = "Пожалуйста, заполните телефон";
    setTimeout(() => {
      submitError.value = "";
    }, 3000);
    return;
  }

  isSubmitting.value = true;
  submitError.value = "";
  submitSuccess.value = false;

  try {
    const file = fileInputRef.value?.files?.[0] || null;

    // Конвертируем файл в base64, если он есть
    let fileBase64 = null;
    let fileName = null;
    let fileMimeType = null;

    if (file) {
      fileName = file.name;
      fileMimeType = file.type;
      fileBase64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          // Убираем префикс "data:application/pdf;base64," или другой
          const base64 = (reader.result as string).split(',')[1];
          resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    }

    // Используем серверный endpoint для отправки сообщений
    const { TELEGRAM_API_URL } = await import('~/config/telegram');
    const apiUrl = TELEGRAM_API_URL;

    if (!apiUrl) {
      throw new Error("API URL не настроен");
    }

    // Отправляем данные на серверный endpoint
    const response = await $fetch(apiUrl, {
      method: "POST",
      body: {
        name: formData.value.name,
        phone: formData.value.phone,
        email: formData.value.email,
        comment: formData.value.comment,
        fileName: fileName,
        // fileBase64 и fileMimeType не отправляются, так как серверный endpoint их не обрабатывает
        // Файлы можно добавить позже, если потребуется
      },
    });

    if (response.success) {
      submitSuccess.value = true;
      emit("submit", formData.value, file);

      // Очистка формы после успешной отправки
      setTimeout(() => {
        formData.value = {
          name: "",
          phone: "",
          email: "",
          comment: "",
        };
        fileName.value = "";
        if (fileInputRef.value) {
          fileInputRef.value.value = "";
        }
        submitSuccess.value = false;
        closeModal();
      }, 1500);
    }
  } catch (error: any) {
    console.error("Error submitting form:", error);
    submitError.value =
      error.data?.statusMessage ||
      error.message ||
      "Произошла ошибка при отправке. Попробуйте позже.";
    setTimeout(() => {
      submitError.value = "";
    }, 5000);
  } finally {
    isSubmitting.value = false;
  }
};

const closeModal = () => {
  emit("close");
};
</script>

<template>
  <Transition name="modal">
    <div v-if="isOpen" class="contact-modal" @click="closeModal">
      <div class="contact-modal-content" @click.stop>
        <!-- <button class="contact-modal-close" @click="closeModal">×</button> -->
        <div class="title-modal-con">
          <img src="/assets/svg/logo.svg" alt="" />
          <h2>Митино<br />принт</h2>
        </div>

        <form class="form-order" @submit.prevent="submitForm">
          <input v-model="formData.name" type="text" placeholder="Имя" />
          <input
            :value="formData.phone"
            @input="handlePhoneInput"
            type="tel"
            placeholder="Номер телефона *"
            maxlength="16"
          />
          <input v-model="formData.email" type="email" placeholder="Почта" />
          <textarea
            v-model="formData.comment"
            placeholder="Комментарий"
            rows="4"
          ></textarea>
          <div class="contact-modal-file-upload">
            <input
              ref="fileInputRef"
              type="file"
              @change="handleFileUpload"
              class="contact-modal-file-input"
              id="contact-file"
            />
            <label
              v-if="!fileName"
              for="contact-file"
              class="contact-modal-file-btn"
              data-tooltip="Расширение файла pdf. Не более 2.5 МБ"
            >
              Прикрепить файл
            </label>
            <div v-else class="contact-modal-file">
              <span class="contact-modal-file-name">{{ fileName }}</span>
              <button
                class="contact-modal-file-remove"
                @click="removeFile"
                type="button"
              >
                ×
              </button>
            </div>
          </div>
          <div v-if="submitError" class="form-error">
            {{ submitError }}
          </div>
          <div v-if="submitSuccess" class="form-success">
            Сообщение отправлено!
          </div>
          <input
            type="submit"
            :value="isSubmitting ? 'Отправка...' : 'Отправить'"
            :disabled="isSubmitting"
          />
        </form>
        <div class="modal-contact-con">
          <div class="modal-contact">
            <img src="/assets/svg/max.svg" alt="" />
            <img src="/assets/svg/tg.svg" alt="" />
          </div>
          <div class="modal-contact-tel">
            <h3>8 495 794-81-15</h3>
            <p>mitino-print@yandex.ru</p>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.contact-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  pointer-events: auto;
  backdrop-filter: blur(3px);
}

.contact-modal-content {
  background: var(--white);
  border-radius: 10px;
  padding: 30px 20px;
  max-width: 350px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  position: relative;
}

/* Анимации появления и исчезновения */
.modal-enter-active {
  transition: opacity 0.3s ease;
}

.modal-enter-active .contact-modal-content {
  animation: slideDown 0.3s ease-out;
}

.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-leave-active .contact-modal-content {
  animation: slideUp 0.3s ease-in;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-to,
.modal-leave-from {
  opacity: 1;
}

@keyframes slideDown {
  from {
    transform: translateY(-50px);
  }
  to {
    transform: translateY(0);
  }
}

@keyframes slideUp {
  from {
    transform: translateY(0);
  }
  to {
    transform: translateY(-50px);
  }
}

.contact-modal-close {
  position: absolute;
  top: 15px;
  right: 15px;
  background: none;
  border: none;
  font-size: 30px;
  color: var(--grey);
  cursor: pointer;
  transition: color 0.2s ease;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.contact-modal-close:hover {
  color: var(--black);
}

.contact-modal-content h2 {
  font-size: 24px;
  font-weight: 600;
  color: var(--black);
}

.form-order {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.title-modal-con {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}
.title-modal-con h2 {
  text-align: end;
  line-height: 1;
  font-weight: 500;
}
.title-modal-con img {
  width: 15%;
}
.form-order input,
.form-order textarea {
  background: var(--back);
  padding: 2px 20px;
  border: none;
  border-radius: 4px;
  font-size: var(--f-p);
  color: var(--black);
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  font-family: var(--font-primary);
}

.form-order textarea {
  resize: none;
  min-height: 100px;
}

.form-order input[type="submit"] {
  border-style: solid;
  border-color: var(--blue);
  color: var(--blue);
  border-width: 1.5px;
  font-size: var(--f-p);
  cursor: pointer;
  background: var(--white);
  margin-top: 10px;
}

.form-order input[type="submit"]:hover {
  color: var(--white);
  background: var(--blue);
}

.contact-modal-file-upload {
  margin: 10px 0;
}

.contact-modal-file-input {
  position: absolute;
  width: 0;
  height: 0;
  opacity: 0;
  pointer-events: none;
}

.contact-modal-file-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 6px 20px;
  background: var(--back);
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  color: var(--grey);
  font-size: var(--f-p);
  border: 1px dashed var(--grey);
}

.contact-modal-file-btn:hover {
  background: #dedede;
  color: var(--blue);
}

.contact-modal-file {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 20px;
  background: var(--back);
  border-radius: 4px;
}

.contact-modal-file-name {
  font-size: var(--f-p);
  color: var(--blue);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 300px;
}

.contact-modal-file-remove {
  background: none;
  border: none;
  font-size: 20px;
  color: var(--grey);
  cursor: pointer;
  transition: color 0.2s ease;
  padding: 0 5px;
}

.contact-modal-file-remove:hover {
  color: var(--red);
}

.form-error {
  padding: 10px;
  background: #fee;
  border: 1px solid var(--red);
  border-radius: 4px;
  color: var(--red);
  font-size: var(--f-p);
  text-align: center;
}

.form-success {
  padding: 10px;
  background: #efe;
  border: 1px solid var(--green);
  border-radius: 4px;
  color: var(--green);
  font-size: var(--f-p);
  text-align: center;
}

.form-order input[type="submit"]:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
.modal-contact-con {
  display: flex;
  width: 100%;
  justify-content: space-between;
  margin-top: 20px;
}
.modal-contact {
  display: flex;
  width: 40%;
  justify-content: start;
  gap: 20px;
}
.modal-contact img {
  width: 20%;
  cursor: pointer;
}
.modal-contact-tel {
  display: flex;
  flex-direction: column;
  width: 60%;
  align-items: end;
}
.modal-contact-tel h3 {
  color: var(--blue);
}

@media (max-width: 799px) {
  .contact-modal-content {
    padding: 20px;
    width: 95%;
  }
}
</style>
