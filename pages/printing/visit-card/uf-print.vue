<script setup lang="ts">
import { reactive, computed, ref } from "vue";
import type { OrderField } from "~/types/order-fields";
import {
  calculateTotalPrice,
  getQuantityFromFields,
} from "~/types/order-fields";

definePageMeta({
  key: (route) => route.fullPath,
});

useHead({
  title: "Печать визиток",
  meta: [
    {
      name: "description",
      content: "Печать визиток | УФ печать",
    },
  ],
});

// Конфигурация полей для визиток (УФ печать)
const fields = reactive<OrderField[]>([
  {
    id: "paper",
    type: "dropdown",
    label: "Бумага",
    placeholder: "Выберите плотность бумаги",
    options: [
      { label: "80 г/м²", price: 0 },
      { label: "120 г/м²", price: 10 },
      { label: "160 г/м²", price: 20 },
      { label: "200 г/м²", price: 30 },
      { label: "250 г/м²", price: 40 },
      { label: "300 г/м²", price: 50 },
    ],
    value: null,
  },
  {
    id: "format",
    type: "dropdown",
    label: "Формат",
    placeholder: "Выберите формат бумаги",
    options: [
      { label: "90x50", price: 150 },
      { label: "95x55", price: 200 },
    ],
    value: null,
  },
  {
    id: "sides",
    type: "dropdown",
    label: "Стороны",
    placeholder: "Выберите стороны печати",
    options: [
      { label: "Односторонняя", price: 0 },
      { label: "Двусторонняя", price: 100 },
    ],
    value: null,
  },
  {
    id: "radius",
    type: "dropdown",
    label: "Скругление углов",
    placeholder: "Выберите диаметр скругления",
    options: [
      { label: "Без скругления", price: 0 },
      { label: "Ø20", price: 15 },
      { label: "Ø25", price: 20 },
      { label: "Ø30", price: 25 },
    ],
    value: null,
  },
  {
    id: "color",
    type: "dropdown",
    label: "Цвет печати",
    placeholder: "Выберите цвет печати",
    options: [
      { label: "Черно-белая", price: 0 },
      { label: "Цветная", price: 50 },
    ],
    value: null,
  },
  {
    id: "lamination",
    type: "dropdown",
    label: "Ламинация",
    placeholder: "Выберите тип ламинации",
    options: [
      { label: "Без ламинации", price: 0 },
      { label: "Матовая", price: 30 },
      { label: "Глянцевая", price: 30 },
      { label: "Soft-touch", price: 50 },
    ],
    value: null,
  },
  {
    id: "quantity",
    type: "input",
    label: "Тираж",
    placeholder: "Введите количество",
    inputType: "number",
    min: 1,
    value: null,
  },
]);

// Заказать дизайн
const isDesignActive = ref(false);
const designPrice = 1000;

// Вычисляем общую стоимость
const totalPrice = computed(() => {
  const quantity = getQuantityFromFields(fields);
  return calculateTotalPrice(
    fields,
    quantity,
    isDesignActive.value ? designPrice : 0
  );
});

// Файл макета
const macketFile = ref<File | null>(null);
const macketFileName = ref("");

const handleFileUpload = (file: File) => {
  macketFile.value = file;
  macketFileName.value = file.name;
};

const removeFile = () => {
  macketFile.value = null;
  macketFileName.value = "";
};

// Форма заказа
const formData = reactive({
  name: "",
  phone: "",
  email: "",
});

const { showToast, toastMessage, closeToast, submitOrder: submitOrderFn } =
  useOrderSubmit();

const submitOrder = async () => {
  await submitOrderFn({
    productType: "Визитка",
    printType: "УФ печать",
    fields,
    isDesignActive: isDesignActive.value,
    designPrice,
    macketFileName: macketFileName.value,
    macketFile: macketFile.value,
    formData,
    totalPrice,
  });
};
</script>

<template>
  <div class="main-content-con">
    <div class="main-content">
      <div class="tab-con">
        <div class="tab-btn-con">
          <NuxtLink
            to="/printing/visit-card/laser-print"
            class="tab-btn"
            :class="{
              active: $route.path === '/printing/visit-card/laser-print',
            }"
          >
            Лазерная печать
          </NuxtLink>
          <NuxtLink
            to="/printing/visit-card/uf-print"
            class="tab-btn"
            :class="{ active: $route.path === '/printing/visit-card/uf-print' }"
          >
            УФ печать
          </NuxtLink>
          <NuxtLink
            to="/printing/visit-card/ofset-print"
            class="tab-btn"
            :class="{
              active: $route.path === '/printing/visit-card/ofset-print',
            }"
          >
            Офсетная печать
          </NuxtLink>
        </div>
        <div class="tab-main">
          <div class="tab-option">
            <div class="tab-option-img">
              <img src="/img/visit/2.png" alt="" />
            </div>
            <TabOptionMain :fields="fields" />
            <div class="tab-option-btn-con">
              <button class="tab-option-btn">
                Технические требования к макету
              </button>
              <button class="tab-option-btn">Примеры работ</button>
              <button class="tab-option-btn">
                Срок изготовления: <span>один рабочий день</span>
              </button>
            </div>
          </div>
          <TabOrder
            title="Визитка"
            :fields="fields"
            :is-design-active="isDesignActive"
            :total-price="totalPrice"
            :form-data="formData"
            :macket-file-name="macketFileName"
            @update:is-design-active="isDesignActive = $event"
            @update:form-data="Object.assign(formData, $event)"
            @file-upload="handleFileUpload"
            @file-remove="removeFile"
            @submit="submitOrder"
          />
        </div>
      </div>
    </div>
  </div>

  <Toast :message="toastMessage" :show="showToast" @close="closeToast" />
</template>

<style scoped>
.tab-option-btn {
  font-size: var(--f-p);
  margin: 10px 40px 0px 0;
  text-align: start;
  display: flex;
  align-items: center;
  border-style: none;
  cursor: pointer;
  transition: var(--tran);
  background: transparent;
}
.tab-option-btn:active {
  scale: 0.95;
}
.tab-option-btn:active:nth-child(3) {
  scale: 1;
}
.tab-option-btn::before {
  margin-right: 5px;
  scale: 0.8;
}
.tab-option-btn:nth-child(1) {
  color: var(--blue);
}
.tab-option-btn:nth-child(2) {
  color: var(--green);
}
.tab-option-btn:nth-child(3) {
  color: var(--black);
}
.tab-option-btn:nth-child(1)::before {
  content: url(/public/img/tab-btn/mini/1.svg);
}
.tab-option-btn:nth-child(2)::before {
  content: url(/public/img/tab-btn/mini/2.svg);
}
.tab-option-btn:nth-child(3)::before {
  content: url(/public/img/tab-btn/mini/3.svg);
}
.tab-option-btn span {
  color: var(--grey);
}
</style>
