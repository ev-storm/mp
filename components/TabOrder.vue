<script setup lang="ts">
import type { OrderField } from "~/types/order-fields";

interface FormData {
  name: string;
  phone: string;
  email: string;
}

const props = withDefaults(
  defineProps<{
    title: string;
    subTitle?: string;
    fields: OrderField[];
    isDesignActive: boolean;
    totalPrice: number;
    formData: FormData;
    macketFileName: string;
    showDesignButton?: boolean;
    showMacketButton?: boolean;
    showOrderForm?: boolean;
  }>(),
  {
    showDesignButton: true,
    showMacketButton: true,
    showOrderForm: true,
  }
);

const emit = defineEmits<{
  (e: "update:isDesignActive", value: boolean): void;
  (e: "update:formData", value: FormData): void;
  (e: "fileUpload", file: File): void;
  (e: "fileRemove"): void;
  (e: "submit"): void;
}>();

// Получаем отображаемое значение для поля
const getFieldDisplayValue = (field: OrderField): string | null => {
  switch (field.type) {
    case "dropdown":
    case "select":
      return field.value?.label || null;
    case "toggle":
      return field.value ? "Да" : null;
    case "input":
      if (field.value !== null && field.value !== "") {
        return field.inputType === "number"
          ? `${field.value} шт.`
          : String(field.value);
      }
      return null;
  }
};

// Проверяем, нужно ли показывать поле в сводке
const shouldShowField = (field: OrderField): boolean => {
  switch (field.type) {
    case "dropdown":
    case "select":
      return field.value !== null;
    case "toggle":
      return field.value === true;
    case "input":
      return field.value !== null && field.value !== "";
  }
};

const handleFileUpload = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files[0]) {
    const file = target.files[0];
    if (file.type !== "application/pdf") {
      alert("Пожалуйста, загрузите файл в формате PDF");
      return;
    }
    if (file.size > 30 * 1024 * 1024) {
      alert("Файл не должен превышать 30 МБ");
      return;
    }
    emit("fileUpload", file);
  }
};

const removeFile = () => {
  emit("fileRemove");
};

const toggleDesign = () => {
  emit("update:isDesignActive", !props.isDesignActive);
};

const updateFormField = (field: keyof FormData, value: string) => {
  emit("update:formData", { ...props.formData, [field]: value });
};

// Функция для извлечения только цифр из строки
const getDigits = (value: string): string => {
  return value.replace(/\D/g, "");
};

// Функция для форматирования номера телефона в формат +7 999 999-99-99
const formatPhone = (value: string): string => {
  // Извлекаем только цифры
  const digits = getDigits(value);

  // Если пусто, возвращаем пустую строку
  if (!digits) return "";

  let phoneDigits = digits;

  // Если начинается не с 7, добавляем 7 в начало
  if (phoneDigits.length > 0 && phoneDigits[0] !== "7") {
    phoneDigits = "7" + phoneDigits;
  }

  // СТРОГО ограничиваем до 11 цифр (7 + максимум 10 цифр после "+7")
  phoneDigits = phoneDigits.slice(0, 11);

  // Если только одна цифра "7", возвращаем "+7"
  if (phoneDigits.length <= 1) {
    return phoneDigits === "7" ? "+7" : "";
  }

  // Форматируем: +7 999 999-99-99
  // Берем только цифры после "7" (максимум 10 цифр)
  const digitsAfter7 = phoneDigits.slice(1); // Уже ограничено до 10 цифр

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

  updateFormField("phone", formatted);
};

const submitOrder = () => {
  emit("submit");
};

// Форматирование цены с пробелами (14500 -> 14 500)
const formatPrice = (price: number): string => {
  return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
};

// Состояние для отслеживания развернут ли текст описания
const isDescriptionExpanded = ref(false);

const toggleDescription = () => {
  isDescriptionExpanded.value = !isDescriptionExpanded.value;
};
</script>

<template>
  <div class="tab-order">
    <div class="tab-order-name">
      <h1 v-html="title"></h1>
      <div v-if="subTitle" class="tab-order-name-description">
        <p v-html="subTitle" :class="{ expanded: isDescriptionExpanded }"></p>
        <button
          v-if="subTitle"
          class="tab-order-name-more-btn"
          @click="toggleDescription"
        >
          {{ isDescriptionExpanded ? "Свернуть" : "Подробнее" }}
        </button>
      </div>
    </div>
    <div class="tab-order-options">
      <template v-for="field in fields" :key="field.id">
        <p
          v-if="
            shouldShowField(field) ||
            field.type === 'dropdown' ||
            field.type === 'select'
          "
        >
          {{ field.label }}:
          <span v-if="getFieldDisplayValue(field)">{{
            getFieldDisplayValue(field)
          }}</span>
          <span v-else class="not-selected">—</span>
        </p>
      </template>
      <p v-if="showDesignButton && isDesignActive">
        Заказать дизайн: <span>Да</span>
      </p>
    </div>
    <div class="calc-order">
      <h1>{{ formatPrice(totalPrice) }} ₽</h1>
    </div>
    <div v-if="showMacketButton" class="tab-order-macket">
      <div class="macket-upload" :class="{ 'has-file': macketFileName }">
        <input
          type="file"
          accept=".pdf"
          @change="handleFileUpload"
          class="macket-input"
          id="macket-file"
        />
        <label
          for="macket-file"
          class="macket-btn"
          v-if="!macketFileName"
          data-tooltip="Расширение файла pdf. Не более 30мб"
        >
          <img src="/public/img/order/maket.svg" alt="" />
        </label>
        <div class="macket-file" v-else>
          <span class="macket-file-name">{{ macketFileName }}</span>
          <button class="macket-remove" @click="removeFile">×</button>
        </div>
      </div>
      <button
        v-if="showDesignButton"
        class="tab-order-macket-des"
        :class="{ active: isDesignActive }"
        @click="toggleDesign"
      >
        <img src="/public/img/order/des.svg" alt="" />
      </button>
    </div>
    <form v-if="showOrderForm" class="form-order" @submit.prevent="submitOrder">
      <input
        :value="formData.name"
        @input="
          updateFormField('name', ($event.target as HTMLInputElement).value)
        "
        type="text"
        placeholder="Имя"
      />
      <input
        :value="formData.phone"
        @input="handlePhoneInput"
        type="tel"
        placeholder="Номер телефона *"
        maxlength="16"
      />
      <input
        :value="formData.email"
        @input="
          updateFormField('email', ($event.target as HTMLInputElement).value)
        "
        type="email"
        placeholder="Почта *"
      />
      <input type="submit" value="Отправить заказ" />
    </form>
  </div>
</template>

<style scoped>
.tab-order {
  width: 35%;
  height: 100%;
  max-height: 800px;
  display: flex;
  flex-direction: column;
  justify-content: space-evenly;
}

.tab-order-name {
  padding: 20px 0;
}

.tab-order-name h1 {
  font-size: 25px;
  margin-bottom: 10px;
  font-weight: 600;
  line-height: normal;
}

.tab-order-name-description {
  position: relative;
}

.tab-order-name p {
  font-size: var(--f-p);
  line-height: 1.5;
  color: var(--black);
}

.tab-order-name-more-btn {
  display: none;
  margin-top: 8px;
  padding: 4px 12px;
  background: transparent;
  border: none;
  color: var(--blue);
  font-size: var(--f-p);
  cursor: pointer;
  text-decoration: underline;
  transition: color 0.2s ease;
}

.tab-order-name-more-btn:hover {
  color: var(--blue_2);
}

.tab-order-options {
  width: 100%;
  padding: 0;
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  height: 130px;
  justify-content: start;
  gap: 0 20px;
}

.tab-order-options p {
  width: 40%;
  font-size: var(--f-p);
  color: var(--black);
  margin-bottom: 8px;
  display: flex;
  justify-content: space-between;
  border: solid #d3d3d3;
  border-width: 0 0 1px 0;
}

.tab-order-options p span {
  color: var(--grey);
  font-weight: 500;
  text-align: end;
}

.tab-order-options p span.not-selected {
  color: var(--grey);
  font-weight: 400;
  font-style: italic;
}

/* Calc order - итоговая цена */
.calc-order {
  display: flex;
  flex-direction: column;
  align-items: end;
  padding: 0 10%;
}

.calc-order h1 {
  font-size: 35px;
  font-weight: 500;
  color: var(--black);
}

/* Macket upload styles */
.tab-order-macket {
  display: flex;
  justify-content: space-around;
  padding: 20px;
  border-top: 1px solid var(--back);
  height: 100px;
}

.macket-upload {
  position: relative;
  width: 40%;
  display: flex;
}

.tab-order-macket-des {
  width: 40%;
  display: flex;
  padding: 5px 20px;
  background: var(--white);
  border-radius: 8px;
  border-color: var(--green);
  border-style: solid;
  border-width: 1.5px;
  transition: var(--tran);
  cursor: pointer;
  justify-content: center;
}

/* .tab-order-macket-des:hover {
  background: var(--green);
}
	.tab-order-macket-des:hover img {
  filter: brightness(0) invert(1);
}
*/

.tab-order-macket-des.active {
  background: var(--green);
}

.tab-order-macket-des.active img {
  filter: brightness(0) invert(1);
}

.tab-order-macket-des:active {
  scale: 0.98;
}

.macket-input {
  position: absolute;
  width: 0;
  height: 0;
  opacity: 0;
  pointer-events: none;
}

.macket-btn {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 5px 20px;
  background: var(--back);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  color: var(--grey);
  font-size: var(--f-p);
  width: 100%;
  justify-content: center;
  position: relative;
}

.macket-btn:hover {
  background: #dedede;
  color: var(--blue);
}

.macket-btn img {
  height: 90%;
}

.macket-btn[data-tooltip]:hover::after {
  content: attr(data-tooltip);
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  background: var(--black);
  color: var(--white);
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 11px;
  white-space: nowrap;
  z-index: 100;
  margin-bottom: 8px;
  opacity: 0;
  animation: tooltipFade 0.2s ease forwards;
}

.macket-btn[data-tooltip]:hover::before {
  content: "";
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  border: 6px solid transparent;
  border-top-color: var(--black);
  margin-bottom: -4px;
  z-index: 100;
  opacity: 0;
  animation: tooltipFade 0.2s ease forwards;
}

@keyframes tooltipFade {
  to {
    opacity: 1;
  }
}

.macket-file {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 20px;
  background: var(--back);
  border-radius: 8px;
}

.macket-file-name {
  font-size: var(--f-p);
  color: var(--blue);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 200px;
}

.macket-remove {
  background: none;
  border: none;
  font-size: 20px;
  color: var(--grey);
  cursor: pointer;
  transition: color 0.2s ease;
  padding: 0 5px;
}

.macket-remove:hover {
  color: var(--red);
}

.form-order {
  display: flex;
  width: 100%;
  padding: 0 10%;
  margin: 5% 0;
  flex-direction: column;
}

.form-order input {
  background: var(--back);
  padding: 2px 20px;
  margin: 4px 0;
  border: none;
  border-radius: 4px;
  font-size: var(--f-p);
  color: var(--black);
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.form-order input[type="submit"] {
  border-style: solid;
  border-color: var(--blue);
  color: var(--blue);
  border-width: 1.5px;
  font-size: var(--f-p);
  cursor: pointer;
  background: var(--white);
}

.form-order input[type="submit"]:hover {
  color: var(--white);
  background: var(--blue);
}
@media (max-width: 799px) {
  .tab-order {
    width: 100%;
    padding: 0 15px 50px 15px;
  }
  .tab-order-macket {
    padding: 20px 0;
  }
  .tab-order-options {
    justify-content: center;
  }

  .tab-order-name p {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .tab-order-name p.expanded {
    display: block;
    -webkit-line-clamp: unset;
    line-clamp: unset;
  }
  .tab-order-name-more-btn {
    display: inline-block;
  }
}
</style>
