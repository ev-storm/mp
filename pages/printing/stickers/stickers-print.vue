<script setup lang="ts">
import { reactive, computed, ref, watch, onMounted } from "vue";
import type { OrderField } from "~/types/order-fields";
import {
  calculateTotalPrice,
  getQuantityFromFields,
} from "~/types/order-fields";

definePageMeta({
  key: (route) => route.fullPath,
});

useHead({
  title: "Печать наклеек",
  meta: [
    {
      name: "description",
      content: "Печать наклеек",
    },
  ],
});

// Конфигурация полей для буклетов
const fields = reactive<OrderField[]>([
  {
    id: "material",
    type: "dropdown",
    label: "Материал",
    placeholder: "Выберите материал",
    options: [
      { label: "Бумага самоклеящаяся", price: 100 },
      { label: "Плёнка белая самоклеящаяся", price: 200 },
      { label: "Плёнка прозрачная самоклеящаяся", price: 300 },
      { label: "Монтажная пленка", price: 300 },
    ],
    value: null,
  },
  {
    id: "deep",
    type: "dropdown",
    label: "Глубина надреза",
    placeholder: "Выберите глубину",
    options: [
      { label: "Полная", price: 3 },
      { label: "Частичная", price: 3 },
    ],
    value: null,
  },
  {
    id: "form",
    type: "dropdown",
    label: "Форма выреза",
    placeholder: "Выберите форму",
    options: [
      { label: "Прямоугольная", price: 10 },
      { label: "Фигурная", price: 20 },
    ],
    value: null,
  },

  {
    id: "size-quantity",
    type: "input",
    label: "Размер",
    placeholder: "Введите размер (мм)",
    inputType: "text",
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

  {
    id: "Mounting",
    type: "toggle",
    label: "Монтажная пленка",
    tooltip: "Монтажная пленка...",
    price: 300,
    value: false,
  },
]);

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

// Toast
const { showToast, toastMessage, closeToast, submitOrder: submitOrderFn } =
  useOrderSubmit();

const submitOrder = async () => {
  await submitOrderFn({
    productType: "Наклейки",
    printType: "Печать наклеек",
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
            to="/printing/stickers/stickers-print"
            class="tab-btn"
            :class="{
              active: $route.path === '/printing/stickers/stickers-print',
            }"
          >
            Печать наклеек
          </NuxtLink>

          <NuxtLink
            to="/printing/stickers/plotter-paper"
            class="tab-btn"
            :class="{
              active: $route.path === '/printing/stickers/plotter-paper',
            }"
          >
            Плоттерная резка бумаги
          </NuxtLink>
        </div>
        <div class="tab-main">
          <div class="tab-option">
            <div class="tab-option-img">
              <img src="/public/img/stick/1.png" alt="" />
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
            title="Печать наклеек"
            subTitle="Цветная печать и копирование  производится на современном профессиональном аппарате Xerox C75 press"
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
.book-btn-con {
  width: 100%;
  height: 100%;
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
}
.book-btn {
  width: 30%;
  height: 45%;
  transition: all 0.3s ease-in-out;
  border-radius: 5px;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  padding: 10px 20px;
  justify-content: space-around;
}
.book-btn:hover {
  background: var(--back);
}

.book-btn.active {
  background: var(--blue);
  box-shadow: #00000030 0px 5px 20px;
  scale: 1.1;
}
.book-btn.active h2,
.book-btn.active h2 span {
  color: #fff;
}
.tab-option-img img {
  height: auto;
  width: 100%;
}

/* SVG контейнер */
.book-btn-svg {
  height: 70%;
  display: flex;
  align-items: center;
  justify-content: center;
}
.book-btn-svg :deep(svg) {
  height: 100%;
  width: auto;
}
.book-btn-svg :deep(path),
.book-btn-svg :deep(line),
.book-btn-svg :deep(circle),
.book-btn-svg :deep(rect),
.book-btn-svg :deep(polyline),
.book-btn-svg :deep(polygon) {
  stroke: var(--blue);
  fill: none;
  transition: stroke 0.1s ease-in-out;
}

/* Active состояние SVG с анимацией */
.book-btn.active .book-btn-svg :deep(path),
.book-btn.active .book-btn-svg :deep(line),
.book-btn.active .book-btn-svg :deep(circle),
.book-btn.active .book-btn-svg :deep(rect),
.book-btn.active .book-btn-svg :deep(polyline),
.book-btn.active .book-btn-svg :deep(polygon) {
  stroke: #fff;
  animation: draw-stroke 2s cubic-bezier(0.4, 0, 0.2, 1) forwards;
}

@keyframes draw-stroke {
  0% {
    stroke-dashoffset: var(--path-length, 1000);
  }
  100% {
    stroke-dashoffset: 0;
  }
}
.book-btn h2 {
  line-height: 1.2;
  font-size: var(--f-p);
  transition: var(--tran);
}
.book-btn h2 span {
  font-size: 10px;
  color: var(--grey);
  transition: var(--tran);
}
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
