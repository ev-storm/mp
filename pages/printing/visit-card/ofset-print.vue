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
  title: "Печать визиток",
  meta: [
    {
      name: "description",
      content: "Печать визиток | Офсетная печать",
    },
  ],
});

// Конфигурация полей + серверные данные
const pageKey: PageConfigKey = "visit-card-ofset";
const {
  fields,
  productionDays,
  pageImage,
  pageDescription,
  pageExamples,
} = useServerOrderConfig({
  pageKey,
  defaultImage: "/img/visit/2.png",
  defaultDescription: "",
  defaultShowMacketButton: true,
  defaultShowDesignButton: true,
});

// Функция для форматирования количества дней
const formatProductionDays = (days: number | undefined): string => {
  if (!days || days === 0) return "один рабочий день";
  if (days === 1) return "один рабочий день";
  if (days >= 2 && days <= 4) return `${days} рабочих дня`;
  return `${days} рабочих дней`;
};


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
    printType: "Офсетная печать",
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
              <img :src="pageImage || '/img/visit/2.png'" alt="Изображение" />
            </div>
            <TabOptionMain :fields="fields" />
            <div class="tab-option-btn-con">
              <button class="tab-option-btn">
                Технические требования к макету
              </button>
              <button class="tab-option-btn example-btn" @click="openExamplesModal">Примеры работ</button>
              <button class="tab-option-btn">
                Срок изготовления: <span>{{ formatProductionDays(productionDays) }}</span>
              </button>
            </div>
          </div>
          <TabOrder
            title="Визитка"
            :subTitle="pageDescription || ''"
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
