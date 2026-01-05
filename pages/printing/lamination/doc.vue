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
  title: "Ламинирование документов",
  meta: [
    {
      name: "description",
      content: "Ламинирование документов",
    },
  ],
});

// Конфигурация полей для буклетов
const fields = reactive<OrderField[]>([
  {
    id: "format",
    type: "dropdown",
    label: "Формат",
    placeholder: "Выберите формат",
    options: [
      { label: "А6 (105×148 мм)", price: 3 },
      { label: "А5 (148×210 мм)", price: 5 },
      { label: "А4 (210×297 мм)", price: 8 },
      { label: "А3 (297×420 мм)", price: 15 },
      { label: "Евро (99×210 мм)", price: 6 },
    ],
    value: null,
  },
  {
    id: "lamination",
    type: "dropdown",
    label: "Тип покрытия",
    placeholder: "Выберите вид ламинации",
    options: [
      { label: "Глянцевая", price: 3 },
      { label: "Матовая", price: 3 },
      { label: "Soft-touch", price: 8 },
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
const showToast = ref(false);
const toastMessage = ref("");

const submitOrder = () => {
  // Собираем все данные заказа
  const orderData = {
    productType: "Буклет",
    printType: "Лазерная печать",
    // Выбранные опции
    options: fields.map((f: OrderField) => {
      let displayValue: string | null = null;
      let price = 0;

      switch (f.type) {
        case "dropdown":
        case "select":
          displayValue = f.value?.label || null;
          price = f.value?.price || 0;
          break;
        case "toggle":
          displayValue = f.value ? "Да" : "Нет";
          price = f.value ? f.price : 0;
          break;
        case "input":
          displayValue = f.value !== null ? String(f.value) : null;
          break;
      }

      return {
        id: f.id,
        label: f.label,
        value: displayValue,
        price,
      };
    }),
    // Дизайн
    designActive: isDesignActive.value,
    designPrice: isDesignActive.value ? designPrice : 0,
    // Макет
    macketFile: macketFile.value,
    macketFileName: macketFileName.value || null,
    // Контактные данные
    contact: {
      name: formData.name,
      phone: formData.phone,
      email: formData.email,
    },
    // Итоговая цена
    totalPrice: totalPrice.value,
  };

  console.log("Order data:", orderData);

  // TODO: отправка данных на сервер

  // Показываем уведомление
  toastMessage.value = "Заказ отправлен!";
  showToast.value = true;
};
</script>

<template>
  <div class="main-content-con">
    <div class="main-content">
      <div class="tab-con">
        <div class="tab-btn-con">
          <NuxtLink
            to="/printing/lamination/doc"
            class="tab-btn"
            :class="{
              active: $route.path === '/printing/lamination/doc',
            }"
          >
            Ламинирование документов
          </NuxtLink>

          <NuxtLink
            to="/printing/lamination/large"
            class="tab-btn"
            :class="{
              active: $route.path === '/printing/lamination/large',
            }"
          >
            Широкоформатное ламинирование
          </NuxtLink>
          <NuxtLink
            to="/printing/lamination/more"
            class="tab-btn"
            :class="{
              active: $route.path === '/printing/lamination/more',
            }"
          >
            Подробнее
          </NuxtLink>
        </div>
        <div class="tab-main">
          <div class="tab-option">
            <div class="tab-option-img">
              <img src="/public/img/lam/1.png" alt="" />
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
            title="Ламинирование документов"
            subTitle="Преимущества ламинирования документов :<br>
- Укрепление и сохранение цвета и контрастности изображения;<br>
- Долговременная защита документов, которые нуждаются в частом использовании, становятся практически неуязвимыми;<br>
- Избежание - складок, морщинок, повреждений от солнца, разрывов, пятен, отпечатков пальцев и жира;<br>
- Быстрый и надежный способ защиты ваших документов от промокания и истирания.
 С помощью ламинирования  Ваш документ примет более презентабельный вид. "
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

  <Toast :message="toastMessage" :show="showToast" @close="showToast = false" />
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
