<script setup lang="ts">
import { reactive, computed, ref } from "vue";
import type { OrderField } from "~/types/order-fields";
import {
  calculateTotalPrice,
  getQuantityFromFields,
} from "~/types/order-fields";
import { type PageConfigKey } from "~/config/order-fields-config";
import { useServerOrderConfig } from "~/composables/useServerOrderConfig";

definePageMeta({
  key: (route) => route.fullPath,
});

useHead({
  title: "Тестовая страница гравюровки",
  meta: [
    {
      name: "description",
      content: "Тестовая страница для гравюровки",
    },
  ],
});

// Конфигурация полей + серверные данные
const pageKey: PageConfigKey = "engraver-test";
const { fields, productionDays, pageExamples } = useServerOrderConfig({
  pageKey,
  defaultImage: "",
  defaultDescription:
    "Эта страница используется для тестирования добавления и изменения полей через админ-панель.",
  defaultShowMacketButton: true,
  defaultShowDesignButton: false,
});

// Функция для форматирования количества дней
const formatProductionDays = (days: number | undefined): string => {
  if (!days || days === 0) return "один рабочий день";
  if (days === 1) return "один рабочий день";
  if (days >= 2 && days <= 4) return `${days} рабочих дня`;
  return `${days} рабочих дней`;
};

const productionDaysText = computed(() =>
  formatProductionDays(productionDays.value)
);

// Заказать дизайн
const isDesignActive = ref(false);
const designPrice = 1500;

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

const {
  showToast,
  toastMessage,
  closeToast,
  submitOrder: submitOrderFn,
} = useOrderSubmit();

const submitOrder = async () => {
  await submitOrderFn({
    productType: "Тестовая страница гравюровки",
    printType: undefined,
    fields,
    isDesignActive: isDesignActive.value,
    designPrice,
    macketFileName: macketFileName.value,
    macketFile: macketFile.value,
    formData,
    totalPrice,
  });
};

// Модалка примеров работ
const showExamplesModal = ref(false);

const openExamplesModal = () => {
  showExamplesModal.value = true;
};

const closeExamplesModal = () => {
  showExamplesModal.value = false;
};
</script>

<template>
  <div class="main-content-con">
    <div class="main-content">
      <div class="tab-con">
        <div class="tab-main">
          <div class="tab-option">
            <div class="tab-option-img">
              <img src="" alt="" />
            </div>
            <TabOptionMain :fields="fields" />
            <div class="tab-option-btn-con">
              <button class="tab-option-btn">
                Технические требования к макету
              </button>
              <button class="tab-option-btn example-btn" @click="openExamplesModal">Примеры работ</button>
              <button class="tab-option-btn">
                Срок изготовления: <span>{{ productionDaysText }}</span>
              </button>
            </div>
          </div>
          <TabOrder
            title="Тестовая страница гравюровки"
            subTitle="Эта страница используется для тестирования добавления и изменения полей через админ-панель."
            :fields="fields"
            :is-design-active="isDesignActive"
            :total-price="totalPrice"
            :show-design-button="false"
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

  <ExamplesModal
    :is-open="showExamplesModal"
    :examples="pageExamples"
    @close="closeExamplesModal"
  />
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
