<script setup lang="ts">
import { reactive, computed, ref, watch, onMounted, onUnmounted } from "vue";
import type { OrderField } from "~/types/order-fields";
import {
  calculateTotalPrice,
  getQuantityFromFields,
} from "~/types/order-fields";
import {
  getOrderFieldsConfigSync,
  getPageMeta,
  type PageConfigKey,
} from "~/config/order-fields-config";

definePageMeta({
  key: (route) => route.fullPath,
});

useHead({
  title: "Печать листовок и буклетов",
  meta: [
    {
      name: "description",
      content: "Печать листовок и буклетов | Лазерная печать",
    },
  ],
});

// Конфигурация полей из единого файла конфигурации
const pageKey: PageConfigKey = "booklet-laser";
const fields = reactive<OrderField[]>(getOrderFieldsConfigSync(pageKey));

// Функция для форматирования количества дней
const formatProductionDays = (days: number | undefined): string => {
  if (!days || days === 0) return "один рабочий день";
  if (days === 1) return "один рабочий день";
  if (days >= 2 && days <= 4) return `${days} рабочих дня`;
  return `${days} рабочих дней`;
};

// Метаданные страницы (срок изготовления) - реактивные, обновляются динамически
const productionDays = ref<number | undefined>(1);

// Обновить метаданные из localStorage
const updateProductionDays = () => {
  const pageMeta = getPageMeta(pageKey);
  const newValue = pageMeta.productionDays ?? 1;
  if (productionDays.value !== newValue) {
    productionDays.value = newValue;
  }
};

// Обновить поля из конфигурации при изменении в localStorage
const updateFields = () => {
  const newFields = getOrderFieldsConfigSync(pageKey);
  // Обновляем поля, сохраняя реактивность
  if (newFields.length !== fields.length || JSON.stringify(newFields) !== JSON.stringify(fields)) {
    fields.splice(0, fields.length, ...newFields);
  }
};

// Слушаем изменения конфигурации
const handleConfigUpdate = (e?: StorageEvent) => {
  if (!e || e.key === "order-fields-config") {
    updateFields();
  }
  if (!e || e.key === "order-fields-meta") {
    updateProductionDays();
  }
};

// Слушаем кастомное событие обновления конфигурации
const handlePageConfigUpdated = () => {
  updateFields();
  updateProductionDays();
};

let intervalId: ReturnType<typeof setInterval> | null = null;

onMounted(() => {
  updateProductionDays();
  updateFields();
  // Слушаем изменения в localStorage (когда админ-панель сохраняет данные в другой вкладке)
  window.addEventListener("storage", handleConfigUpdate);
  // Слушаем кастомное событие обновления конфигурации (когда админ-панель сохраняет данные в той же вкладке)
  window.addEventListener("pageConfigUpdated", handlePageConfigUpdated);
  // Также проверяем изменения при фокусе окна
  window.addEventListener("focus", () => {
    updateFields();
    updateProductionDays();
  });
  // Периодическая проверка изменений (каждые 2 секунды)
  intervalId = setInterval(() => {
    updateFields();
    updateProductionDays();
  }, 2000);
});

onUnmounted(() => {
  window.removeEventListener("storage", handleConfigUpdate);
  window.removeEventListener("pageConfigUpdated", handlePageConfigUpdated);
  window.removeEventListener("focus", handleConfigUpdate);
  if (intervalId) {
    clearInterval(intervalId);
  }
});

// Активная кнопка буклета (индекс)
const activeBookBtn = ref<number | null>(null);

// SVG контейнеры для book-btn
const bookBtnSvgRefs = ref<(HTMLElement | null)[]>([]);

// Пути к SVG иконкам буклетов
const bookBtnSvgPaths = [
  "/img/book/btn/1.svg",
  "/img/book/btn/2.svg",
  "/img/book/btn/3.svg",
  "/img/book/btn/4.svg",
  "/img/book/btn/5.svg",
  "/img/book/btn/6.svg",
];

// Загрузка SVG с подготовкой для анимации
async function loadBookBtnSvg(container: HTMLElement | null, svgPath: string) {
  if (!container) return;
  try {
    const response = await fetch(svgPath);
    const svgText = await response.text();
    container.innerHTML = svgText;

    // Добавляем stroke-dasharray ко всем path
    const paths = container.querySelectorAll(
      "path, line, circle, rect, polyline, polygon"
    );
    paths.forEach((path) => {
      const el = path as SVGGeometryElement;
      if (el.getTotalLength) {
        const length = el.getTotalLength();
        el.style.strokeDasharray = `${length}`;
        el.style.strokeDashoffset = "0";
        el.style.setProperty("--path-length", `${length}`);
      }
    });
  } catch (e) {
    console.error("Failed to load SVG:", e);
  }
}

// Функция для установки ref
const setBookBtnSvgRef = (index: number) => (el: any) => {
  bookBtnSvgRefs.value[index] = el;
};

// Загружаем все SVG при монтировании
onMounted(() => {
  bookBtnSvgRefs.value.forEach(
    (container: HTMLElement | null, index: number) => {
      const path = bookBtnSvgPaths[index];
      if (path) {
        loadBookBtnSvg(container, path);
      }
    }
  );
});

// Маппинг кнопок буклета на опции сложения
const bookBtnToFoldingMap: Record<number, string> = {
  0: "Без сложения",
  1: "1 фальц (пополам)",
  2: "2 фальца (евробуклет)",
  3: "2 фальца (гармошка)",
  4: "3 фальца (гармошка)",
  5: "4 фальца (гармошка)",
};

// Обратный маппинг: опция сложения -> индекс кнопки
const foldingToBookBtnMap: Record<string, number> = {
  "Без сложения": 0,
  "1 фальц (пополам)": 1,
  "2 фальца (евробуклет)": 2,
  "2 фальца (гармошка)": 3,
  "3 фальца (гармошка)": 4,
  "4 фальца (гармошка)": 5,
};

// Выбор кнопки буклета
const selectBookBtn = (index: number) => {
  activeBookBtn.value = index;

  // Находим поле folding и устанавливаем значение
  const foldingFieldItem = fields.find((f: OrderField) => f.id === "folding");
  if (foldingFieldItem && foldingFieldItem.type === "dropdown") {
    const optionLabel = bookBtnToFoldingMap[index];
    const option = foldingFieldItem.options.find(
      (o: { label: string; price: number }) => o.label === optionLabel
    );
    if (option) {
      foldingFieldItem.value = option;
    }
  }
};

// Следим за изменениями в dropdown "Сложение" для обратной синхронизации
const foldingFieldComputed = computed(() =>
  fields.find((f: OrderField) => f.id === "folding")
);

watch(
  () =>
    foldingFieldComputed.value?.type === "dropdown"
      ? foldingFieldComputed.value.value
      : null,
  (newValue: { label: string; price: number } | null) => {
    if (newValue && newValue.label) {
      const btnIndex = foldingToBookBtnMap[newValue.label];
      if (btnIndex !== undefined) {
        activeBookBtn.value = btnIndex;
      }
    } else {
      activeBookBtn.value = null;
    }
  },
  { deep: true }
);

// Следим за изменениями в dropdown "Бумага" для автоактивации Биговки
const paperFieldComputed = computed(() =>
  fields.find((f: OrderField) => f.id === "paper")
);
const creasingFieldComputed = computed(() =>
  fields.find((f: OrderField) => f.id === "creasing")
);

watch(
  () =>
    paperFieldComputed.value?.type === "dropdown"
      ? paperFieldComputed.value.value
      : null,
  (newValue: { label: string; price: number } | null) => {
    if (newValue && newValue.label) {
      // Извлекаем число из label, например "200 г/м²" -> 200
      const match = newValue.label.match(/(\d+)/);
      if (match) {
        const weight = parseInt(match[1], 10);
        // Если плотность >= 200, активируем Биговку
        if (weight >= 200 && creasingFieldComputed.value?.type === "toggle") {
          creasingFieldComputed.value.value = true;
        }
      }
    }
  },
  { deep: true }
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

const { showToast, toastMessage, closeToast, submitOrder: submitOrderFn } =
  useOrderSubmit();

const submitOrder = async () => {
  await submitOrderFn({
    productType: "Буклет",
    printType: "Лазерная печать",
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
            to="/printing/booklet/laser-print"
            class="tab-btn"
            :class="{
              active: $route.path === '/printing/booklet/laser-print',
            }"
          >
            Лазерная печать
          </NuxtLink>

          <NuxtLink
            to="/printing/booklet/ofset-print"
            class="tab-btn"
            :class="{
              active: $route.path === '/printing/booklet/ofset-print',
            }"
          >
            Офсетная печать
          </NuxtLink>
        </div>
        <div class="tab-main">
          <div class="tab-option">
            <div class="tab-option-img">
              <div class="book-btn-con">
                <div
                  class="book-btn"
                  :class="{ active: activeBookBtn === 0 }"
                  @click="selectBookBtn(0)"
                >
                  <div :ref="setBookBtnSvgRef(0)" class="book-btn-svg"></div>
                  <h2>Листовка<br /><span>Без сложений</span></h2>
                </div>
                <div
                  class="book-btn"
                  :class="{ active: activeBookBtn === 1 }"
                  @click="selectBookBtn(1)"
                >
                  <div :ref="setBookBtnSvgRef(1)" class="book-btn-svg"></div>
                  <h2>Книжка<br /><span>1 сложение</span></h2>
                </div>
                <div
                  class="book-btn"
                  :class="{ active: activeBookBtn === 2 }"
                  @click="selectBookBtn(2)"
                >
                  <div :ref="setBookBtnSvgRef(2)" class="book-btn-svg"></div>
                  <h2>Евробуклет<br /><span>2 сложения</span></h2>
                </div>
                <div
                  class="book-btn"
                  :class="{ active: activeBookBtn === 3 }"
                  @click="selectBookBtn(3)"
                >
                  <div :ref="setBookBtnSvgRef(3)" class="book-btn-svg"></div>
                  <h2>Гармошка<br /><span>2 сложения</span></h2>
                </div>
                <div
                  class="book-btn"
                  :class="{ active: activeBookBtn === 4 }"
                  @click="selectBookBtn(4)"
                >
                  <div :ref="setBookBtnSvgRef(4)" class="book-btn-svg"></div>
                  <h2>Гармошка<br /><span>3 сложения</span></h2>
                </div>
                <div
                  class="book-btn"
                  :class="{ active: activeBookBtn === 5 }"
                  @click="selectBookBtn(5)"
                >
                  <div :ref="setBookBtnSvgRef(5)" class="book-btn-svg"></div>
                  <h2>Гармошка<br /><span>4 сложения</span></h2>
                </div>
              </div>
            </div>
            <TabOptionMain :fields="fields" />
            <div class="tab-option-btn-con">
              <button class="tab-option-btn">
                Технические требования к макету
              </button>
              <button class="tab-option-btn">Примеры работ</button>
              <button class="tab-option-btn">
                Срок изготовления: <span>{{ formatProductionDays(productionDays) }}</span>
              </button>
            </div>
          </div>
          <TabOrder
            title="Буклет"
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
.tab-option-img {
  padding: 2%;
  background: var(--white);
}
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
