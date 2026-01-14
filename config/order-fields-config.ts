// Единая конфигурация полей заказа для всех страниц
// Этот файл можно будет в дальнейшем интегрировать с админ-панелью

import type { OrderField } from "~/types/order-fields";

// Тип для ключа страницы
export type PageConfigKey =
  // Типография
  | "tracing" // Печать на кальке
  | "catalogs" // Брошюры и каталоги
  | "replication" // Тиражирование на ризографе
  | "scan" // Сканирование документа
  | "diplom" // Печать курсовых и дипломных работ
  | "booklet-laser" // Печать листовок и буклетов (лазерная)
  | "booklet-ofset" // Печать листовок и буклетов (офсетная)
  | "visit-card-laser" // Печать визиток (лазерная)
  | "visit-card-ofset" // Печать визиток (офсетная)
  | "visit-card-uf" // Печать визиток (УФ)
  | "stickers-print" // Наклейки и плоттерная резка
  | "plotter-paper" // Плоттерная бумага
  | "bind-plastic" // Переплет (пластик)
  | "bind-metal" // Переплет (металл)
  | "bind-hard" // Переплет (твердый)
  | "lamination-doc" // Ламинирование документов
  | "lamination-large" // Широкоформатное ламинирование
  | "large-print" // Широкоформатная печать
  | "large-scan" // Широкоформатное сканирование
  | "large-plan" // Печать чертежей
  | "scan-print" // Печать документа до А3
  // Фотопечать
  | "photo-test" // Тестовая страница фотопечати
  // Сувениры
  | "gift-test" // Тестовая страница сувениров
  // Издательство
  | "publish-test" // Тестовая страница издательства
  // Гравюровка
  | "engraver-test"; // Тестовая страница гравюровки

// Конфигурация полей для каждой страницы
export const orderFieldsConfig: Record<PageConfigKey, OrderField[]> = {
  // Печать на кальке
  tracing: [
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
      id: "quantity",
      type: "input",
      label: "Тираж",
      placeholder: "Введите количество",
      inputType: "number",
      min: 1,
      value: null,
    },
  ],

  // Брошюры и каталоги
  catalogs: [
    {
      id: "paper",
      type: "dropdown",
      label: "Бумага",
      placeholder: "Выберите вплотность бумаги",
      options: [
        { label: "80 г/м²", price: 898989 },
        { label: "115 г/м²", price: 5 },
        { label: "130 г/м²", price: 10 },
        { label: "150 г/м²", price: 15 },
        { label: "170 г/м²", price: 20 },
        { label: "200 г/м²", price: 25 },
        { label: "250 г/м²", price: 35 },
        { label: "300 г/м²", price: 45 },
      ],
      value: null,
    },
    {
      id: "cover",
      type: "dropdown",
      label: "Вид обложки",
      placeholder: "Выберите тип обложки",
      options: [
        { label: "прозрачный пластик", price: 0 },
        { label: "матовый  пластик", price: 5 },
        { label: "плотная бумага", price: 10 },
      ],
      value: null,
    },
    {
      id: "bind",
      type: "dropdown",
      label: "Тип крепления",
      placeholder: "Выберите тип переплета",
      options: [
        { label: "скоба", price: 0 },
        { label: "клеевое", price: 5 },
      ],
      value: null,
    },
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
      id: "quantity",
      type: "input",
      label: "Тираж",
      placeholder: "Введите количество",
      inputType: "number",
      min: 1,
      value: null,
    },
  ],

  // Тиражирование на ризографе
  replication: [
    {
      id: "format",
      type: "dropdown",
      label: "Формат",
      placeholder: "Выберите формат",
      options: [
        { label: "А6 (105×148 мм)", price: 333333333 },
        { label: "А5 (148×210 мм)", price: 5 },
        { label: "А4 (210×297 мм)", price: 8 },
        { label: "А3 (297×420 мм)", price: 15 },
        { label: "Евро (99×210 мм)", price: 6 },
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
      id: "color-paper",
      type: "dropdown",
      label: "Цвет бумаги",
      placeholder: "Выберите цвет бумаги",
      options: [
        { label: "Синий", price: 0 },
        { label: "Красный", price: 100 },
        { label: "Белый", price: 100 },
        { label: "Желтый", price: 100 },
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
  ],

  // Сканирование документа
  scan: [
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
      id: "quantity",
      type: "input",
      label: "Тираж",
      placeholder: "Введите количество",
      inputType: "number",
      min: 1,
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
      id: "scan-type",
      type: "dropdown",
      label: "Вид сканирования",
      placeholder: "Cкорость сканирования",
      options: [
        { label: "Автоподачик", price: 200 },
        { label: "Потоковая", price: 100 },
      ],
      value: null,
    },
    {
      id: "TextVue",
      type: "toggle",
      label: "Разпознования текста",
      tooltip: "Разпознования текста...",
      price: 300,
      value: false,
    },
  ],

  // Печать курсовых и дипломных работ
  diplom: [
    {
      id: "paper",
      type: "dropdown",
      label: "Бумага",
      placeholder: "Выберите вплотность бумаги",
      options: [
        { label: "80 г/м²", price: 0 },
        { label: "115 г/м²", price: 5 },
        { label: "130 г/м²", price: 10 },
        { label: "150 г/м²", price: 15 },
        { label: "170 г/м²", price: 20 },
        { label: "200 г/м²", price: 25 },
        { label: "250 г/м²", price: 35 },
        { label: "300 г/м²", price: 45 },
      ],
      value: null,
    },
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
      id: "quantity",
      type: "input",
      label: "Тираж",
      placeholder: "Введите количество",
      inputType: "number",
      min: 1,
      value: null,
    },
  ],

  // Печать листовок и буклетов (лазерная)
  "booklet-laser": [
    {
      id: "format",
      type: "dropdown",
      label: "Формат",
      placeholder: "Выберите формат",
      options: [
        { label: "А6 (105×148 мм)", price: 0 },
        { label: "А5 (148×210 мм)", price: 0 },
        { label: "А4 (210×297 мм)", price: 0 },
        { label: "А3 (297×420 мм)", price: 0 },
      ],
      value: null,
    },
    {
      id: "paper",
      type: "dropdown",
      label: "Бумага",
      placeholder: "Выберите плотность бумаги",
      options: [
        { label: "80 г/м²", price: 0 },
        { label: "115 г/м²", price: 0 },
        { label: "130 г/м²", price: 0 },
        { label: "150 г/м²", price: 0 },
        { label: "170 г/м²", price: 0 },
        { label: "200 г/м²", price: 0 },
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
        { label: "Цветная", price: 0 },
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
        { label: "Двусторонняя", price: 0 },
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
  ],

  // Печать листовок и буклетов (офсетная)
  "booklet-ofset": [
    {
      id: "format",
      type: "dropdown",
      label: "Формат",
      placeholder: "Выберите формат",
      options: [
        { label: "А6 (105×148 мм)", price: 0 },
        { label: "А5 (148×210 мм)", price: 0 },
        { label: "А4 (210×297 мм)", price: 0 },
        { label: "А3 (297×420 мм)", price: 0 },
      ],
      value: null,
    },
    {
      id: "paper",
      type: "dropdown",
      label: "Бумага",
      placeholder: "Выберите плотность бумаги",
      options: [
        { label: "80 г/м²", price: 0 },
        { label: "115 г/м²", price: 0 },
        { label: "130 г/м²", price: 0 },
        { label: "150 г/м²", price: 0 },
        { label: "170 г/м²", price: 0 },
        { label: "200 г/м²", price: 0 },
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
        { label: "Цветная", price: 0 },
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
        { label: "Двусторонняя", price: 0 },
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
  ],

  // Печать визиток (лазерная)
  "visit-card-laser": [
    {
      id: "format",
      type: "dropdown",
      label: "Формат",
      placeholder: "Выберите формат",
      options: [
        { label: "90×50 мм (стандарт)", price: 0 },
        { label: "85×55 мм (евро)", price: 0 },
        { label: "Другой размер", price: 0 },
      ],
      value: null,
    },
    {
      id: "paper",
      type: "dropdown",
      label: "Бумага",
      placeholder: "Выберите тип бумаги",
      options: [
        { label: "Мелованная 300 г/м²", price: 0 },
        { label: "Мелованная 350 г/м²", price: 0 },
        { label: "Дизайнерская", price: 0 },
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
        { label: "Цветная", price: 0 },
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
        { label: "Двусторонняя", price: 0 },
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
  ],

  // Печать визиток (офсетная)
  "visit-card-ofset": [
    {
      id: "format",
      type: "dropdown",
      label: "Формат",
      placeholder: "Выберите формат",
      options: [
        { label: "90×50 мм (стандарт)", price: 0 },
        { label: "85×55 мм (евро)", price: 0 },
        { label: "Другой размер", price: 0 },
      ],
      value: null,
    },
    {
      id: "paper",
      type: "dropdown",
      label: "Бумага",
      placeholder: "Выберите тип бумаги",
      options: [
        { label: "Мелованная 300 г/м²", price: 0 },
        { label: "Мелованная 350 г/м²", price: 0 },
        { label: "Дизайнерская", price: 0 },
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
        { label: "Цветная", price: 0 },
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
        { label: "Двусторонняя", price: 0 },
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
  ],

  // Печать визиток (УФ)
  "visit-card-uf": [
    {
      id: "format",
      type: "dropdown",
      label: "Формат",
      placeholder: "Выберите формат",
      options: [
        { label: "90×50 мм (стандарт)", price: 0 },
        { label: "85×55 мм (евро)", price: 0 },
        { label: "Другой размер", price: 0 },
      ],
      value: null,
    },
    {
      id: "paper",
      type: "dropdown",
      label: "Бумага",
      placeholder: "Выберите тип бумаги",
      options: [
        { label: "Мелованная 300 г/м²", price: 0 },
        { label: "Мелованная 350 г/м²", price: 0 },
        { label: "Пластик", price: 0 },
        { label: "Дизайнерская", price: 0 },
      ],
      value: null,
    },
    {
      id: "finish",
      type: "dropdown",
      label: "Отделка",
      placeholder: "Выберите тип отделки",
      options: [
        { label: "Без отделки", price: 0 },
        { label: "Ламинация", price: 0 },
        { label: "Выборочный лак", price: 0 },
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
  ],

  // Наклейки и плоттерная резка
  "stickers-print": [
    {
      id: "material",
      type: "dropdown",
      label: "Материал",
      placeholder: "Выберите материал",
      options: [
        { label: "Бумага самоклеящаяся", price: 0 },
        { label: "Пленка виниловая", price: 0 },
        { label: "Пленка прозрачная", price: 0 },
        { label: "Пленка матовая", price: 0 },
      ],
      value: null,
    },
    {
      id: "format",
      type: "dropdown",
      label: "Формат",
      placeholder: "Выберите формат",
      options: [
        { label: "А4 (210×297 мм)", price: 0 },
        { label: "А3 (297×420 мм)", price: 0 },
        { label: "Произвольный размер", price: 0 },
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
        { label: "Цветная", price: 0 },
      ],
      value: null,
    },
    {
      id: "cutting",
      type: "dropdown",
      label: "Резка",
      placeholder: "Выберите тип резки",
      options: [
        { label: "Прямая резка", price: 0 },
        { label: "Фигурная резка", price: 0 },
        { label: "Без резки", price: 0 },
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
  ],

  // Плоттерная бумага
  "plotter-paper": [
    {
      id: "material",
      type: "dropdown",
      label: "Материал",
      placeholder: "Выберите материал",
      options: [
        { label: "Бумага самоклеящаяся", price: 0 },
        { label: "Пленка виниловая", price: 0 },
        { label: "Пленка прозрачная", price: 0 },
        { label: "Пленка матовая", price: 0 },
        { label: "Баннерная ткань", price: 0 },
      ],
      value: null,
    },
    {
      id: "width",
      type: "input",
      label: "Ширина (см)",
      placeholder: "Введите ширину",
      inputType: "number",
      min: 1,
      value: null,
    },
    {
      id: "length",
      type: "input",
      label: "Длина (см)",
      placeholder: "Введите длину",
      inputType: "number",
      min: 1,
      value: null,
    },
    {
      id: "quantity",
      type: "input",
      label: "Количество",
      placeholder: "Введите количество",
      inputType: "number",
      min: 1,
      value: null,
    },
  ],

  // Переплет (пластик)
  "bind-plastic": [
    {
      id: "format",
      type: "dropdown",
      label: "Формат",
      placeholder: "Выберите формат",
      options: [
        { label: "А5 (148×210 мм)", price: 0 },
        { label: "А4 (210×297 мм)", price: 0 },
        { label: "А3 (297×420 мм)", price: 0 },
      ],
      value: null,
    },
    {
      id: "thickness",
      type: "dropdown",
      label: "Толщина",
      placeholder: "Выберите толщину",
      options: [
        { label: "До 50 листов", price: 0 },
        { label: "50-100 листов", price: 0 },
        { label: "100-200 листов", price: 0 },
        { label: "Более 200 листов", price: 0 },
      ],
      value: null,
    },
    {
      id: "color",
      type: "dropdown",
      label: "Цвет обложки",
      placeholder: "Выберите цвет",
      options: [
        { label: "Прозрачный", price: 0 },
        { label: "Черный", price: 0 },
        { label: "Синий", price: 0 },
        { label: "Красный", price: 0 },
        { label: "Другой", price: 0 },
      ],
      value: null,
    },
    {
      id: "quantity",
      type: "input",
      label: "Количество",
      placeholder: "Введите количество",
      inputType: "number",
      min: 1,
      value: null,
    },
  ],

  // Переплет (металл)
  "bind-metal": [
    {
      id: "format",
      type: "dropdown",
      label: "Формат",
      placeholder: "Выберите формат",
      options: [
        { label: "А5 (148×210 мм)", price: 0 },
        { label: "А4 (210×297 мм)", price: 0 },
        { label: "А3 (297×420 мм)", price: 0 },
      ],
      value: null,
    },
    {
      id: "thickness",
      type: "dropdown",
      label: "Толщина",
      placeholder: "Выберите толщину",
      options: [
        { label: "До 50 листов", price: 0 },
        { label: "50-100 листов", price: 0 },
        { label: "100-200 листов", price: 0 },
        { label: "Более 200 листов", price: 0 },
      ],
      value: null,
    },
    {
      id: "quantity",
      type: "input",
      label: "Количество",
      placeholder: "Введите количество",
      inputType: "number",
      min: 1,
      value: null,
    },
  ],

  // Переплет (твердый)
  "bind-hard": [
    {
      id: "format",
      type: "dropdown",
      label: "Формат",
      placeholder: "Выберите формат",
      options: [
        { label: "А5 (148×210 мм)", price: 0 },
        { label: "А4 (210×297 мм)", price: 0 },
        { label: "А3 (297×420 мм)", price: 0 },
      ],
      value: null,
    },
    {
      id: "cover",
      type: "dropdown",
      label: "Обложка",
      placeholder: "Выберите тип обложки",
      options: [
        { label: "Тканевая", price: 0 },
        { label: "Кожаная", price: 0 },
        { label: "Бумажная", price: 0 },
      ],
      value: null,
    },
    {
      id: "thickness",
      type: "dropdown",
      label: "Толщина",
      placeholder: "Выберите толщину",
      options: [
        { label: "До 100 листов", price: 0 },
        { label: "100-300 листов", price: 0 },
        { label: "300-500 листов", price: 0 },
        { label: "Более 500 листов", price: 0 },
      ],
      value: null,
    },
    {
      id: "quantity",
      type: "input",
      label: "Количество",
      placeholder: "Введите количество",
      inputType: "number",
      min: 1,
      value: null,
    },
  ],

  // Ламинирование документов
  "lamination-doc": [
    {
      id: "format",
      type: "dropdown",
      label: "Формат",
      placeholder: "Выберите формат",
      options: [
        { label: "А6 (105×148 мм)", price: 0 },
        { label: "А5 (148×210 мм)", price: 0 },
        { label: "А4 (210×297 мм)", price: 0 },
        { label: "А3 (297×420 мм)", price: 0 },
      ],
      value: null,
    },
    {
      id: "thickness",
      type: "dropdown",
      label: "Толщина пленки",
      placeholder: "Выберите толщину",
      options: [
        { label: "75 мкм", price: 0 },
        { label: "125 мкм", price: 0 },
        { label: "250 мкм", price: 0 },
      ],
      value: null,
    },
    {
      id: "type",
      type: "dropdown",
      label: "Тип ламинации",
      placeholder: "Выберите тип",
      options: [
        { label: "Глянцевая", price: 0 },
        { label: "Матовая", price: 0 },
      ],
      value: null,
    },
    {
      id: "quantity",
      type: "input",
      label: "Количество",
      placeholder: "Введите количество",
      inputType: "number",
      min: 1,
      value: null,
    },
  ],

  // Широкоформатное ламинирование
  "lamination-large": [
    {
      id: "width",
      type: "input",
      label: "Ширина (см)",
      placeholder: "Введите ширину",
      inputType: "number",
      min: 1,
      value: null,
    },
    {
      id: "length",
      type: "input",
      label: "Длина (см)",
      placeholder: "Введите длину",
      inputType: "number",
      min: 1,
      value: null,
    },
    {
      id: "thickness",
      type: "dropdown",
      label: "Толщина пленки",
      placeholder: "Выберите толщину",
      options: [
        { label: "75 мкм", price: 0 },
        { label: "125 мкм", price: 0 },
        { label: "250 мкм", price: 0 },
      ],
      value: null,
    },
    {
      id: "type",
      type: "dropdown",
      label: "Тип ламинации",
      placeholder: "Выберите тип",
      options: [
        { label: "Глянцевая", price: 0 },
        { label: "Матовая", price: 0 },
      ],
      value: null,
    },
    {
      id: "quantity",
      type: "input",
      label: "Количество",
      placeholder: "Введите количество",
      inputType: "number",
      min: 1,
      value: null,
    },
  ],

  // Широкоформатная печать
  "large-print": [
    {
      id: "material",
      type: "dropdown",
      label: "Материал",
      placeholder: "Выберите материал",
      options: [
        { label: "Баннерная ткань", price: 0 },
        { label: "Пленка самоклеящаяся", price: 0 },
        { label: "Пленка для окна", price: 0 },
        { label: "Бумага постерная", price: 0 },
        { label: "Холст", price: 0 },
      ],
      value: null,
    },
    {
      id: "width",
      type: "input",
      label: "Ширина (см)",
      placeholder: "Введите ширину",
      inputType: "number",
      min: 1,
      value: null,
    },
    {
      id: "length",
      type: "input",
      label: "Длина (см)",
      placeholder: "Введите длину",
      inputType: "number",
      min: 1,
      value: null,
    },
    {
      id: "resolution",
      type: "dropdown",
      label: "Разрешение",
      placeholder: "Выберите разрешение",
      options: [
        { label: "720 dpi", price: 0 },
        { label: "1440 dpi", price: 0 },
      ],
      value: null,
    },
    {
      id: "quantity",
      type: "input",
      label: "Количество",
      placeholder: "Введите количество",
      inputType: "number",
      min: 1,
      value: null,
    },
  ],

  // Широкоформатное сканирование
  "large-scan": [
    {
      id: "format",
      type: "dropdown",
      label: "Формат оригинала",
      placeholder: "Выберите формат",
      options: [
        { label: "А3 (297×420 мм)", price: 0 },
        { label: "А2 (420×594 мм)", price: 0 },
        { label: "А1 (594×841 мм)", price: 0 },
        { label: "А0 (841×1189 мм)", price: 0 },
        { label: "Произвольный размер", price: 0 },
      ],
      value: null,
    },
    {
      id: "resolution",
      type: "dropdown",
      label: "Разрешение",
      placeholder: "Выберите разрешение",
      options: [
        { label: "150 dpi", price: 0 },
        { label: "300 dpi", price: 0 },
        { label: "600 dpi", price: 0 },
      ],
      value: null,
    },
    {
      id: "color",
      type: "dropdown",
      label: "Цвет",
      placeholder: "Выберите цвет",
      options: [
        { label: "Черно-белое", price: 0 },
        { label: "Цветное", price: 0 },
      ],
      value: null,
    },
    {
      id: "format-output",
      type: "dropdown",
      label: "Формат файла",
      placeholder: "Выберите формат",
      options: [
        { label: "PDF", price: 0 },
        { label: "JPG", price: 0 },
        { label: "TIFF", price: 0 },
      ],
      value: null,
    },
    {
      id: "quantity",
      type: "input",
      label: "Количество",
      placeholder: "Введите количество",
      inputType: "number",
      min: 1,
      value: null,
    },
  ],

  // Печать чертежей
  "large-plan": [
    {
      id: "format",
      type: "dropdown",
      label: "Формат",
      placeholder: "Выберите формат",
      options: [
        { label: "А3 (297×420 мм)", price: 0 },
        { label: "А2 (420×594 мм)", price: 0 },
        { label: "А1 (594×841 мм)", price: 0 },
        { label: "А0 (841×1189 мм)", price: 0 },
      ],
      value: null,
    },
    {
      id: "paper",
      type: "dropdown",
      label: "Бумага",
      placeholder: "Выберите тип бумаги",
      options: [
        { label: "Чертежная", price: 0 },
        { label: "Калька", price: 0 },
        { label: "Пленка", price: 0 },
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
        { label: "Цветная", price: 0 },
      ],
      value: null,
    },
    {
      id: "quantity",
      type: "input",
      label: "Количество",
      placeholder: "Введите количество",
      inputType: "number",
      min: 1,
      value: null,
    },
  ],

  // Печать документа до А3
  "scan-print": [
    {
      id: "format",
      type: "dropdown",
      label: "Формат",
      placeholder: "Выберите формат",
      options: [
        { label: "А6 (105×148 мм)", price: 0 },
        { label: "А5 (148×210 мм)", price: 0 },
        { label: "А4 (210×297 мм)", price: 0 },
        { label: "А3 (297×420 мм)", price: 0 },
      ],
      value: null,
    },
    {
      id: "paper",
      type: "dropdown",
      label: "Бумага",
      placeholder: "Выберите плотность бумаги",
      options: [
        { label: "80 г/м²", price: 0 },
        { label: "115 г/м²", price: 0 },
        { label: "130 г/м²", price: 0 },
        { label: "150 г/м²", price: 0 },
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
        { label: "Цветная", price: 0 },
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
        { label: "Двусторонняя", price: 0 },
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
  ],

  // Фотопечать
  "photo-test": [
    {
      id: "format",
      type: "dropdown",
      label: "Формат",
      placeholder: "Выберите формат",
      options: [
        { label: "10×15 см", price: 10 },
        { label: "15×20 см", price: 20 },
        { label: "20×30 см", price: 30 },
        { label: "30×40 см", price: 50 },
      ],
      value: null,
    },
    {
      id: "paper-type",
      type: "dropdown",
      label: "Тип бумаги",
      placeholder: "Выберите тип бумаги",
      options: [
        { label: "Глянцевая", price: 0 },
        { label: "Матовая", price: 5 },
        { label: "Сатиновая", price: 10 },
      ],
      value: null,
    },
    {
      id: "quantity",
      type: "input",
      label: "Количество",
      placeholder: "Введите количество",
      inputType: "number",
      min: 1,
      value: null,
    },
  ],

  // Сувениры
  "gift-test": [
    {
      id: "product-type",
      type: "dropdown",
      label: "Тип продукта",
      placeholder: "Выберите тип продукта",
      options: [
        { label: "Кружка", price: 300 },
        { label: "Футболка", price: 500 },
        { label: "Брелок", price: 150 },
        { label: "Магнит", price: 100 },
      ],
      value: null,
    },
    {
      id: "size",
      type: "dropdown",
      label: "Размер",
      placeholder: "Выберите размер",
      options: [
        { label: "S", price: 0 },
        { label: "M", price: 50 },
        { label: "L", price: 100 },
        { label: "XL", price: 150 },
      ],
      value: null,
    },
    {
      id: "quantity",
      type: "input",
      label: "Количество",
      placeholder: "Введите количество",
      inputType: "number",
      min: 1,
      value: null,
    },
  ],

  // Издательство
  "publish-test": [
    {
      id: "book-type",
      type: "dropdown",
      label: "Тип издания",
      placeholder: "Выберите тип издания",
      options: [
        { label: "Книга", price: 500 },
        { label: "Журнал", price: 300 },
        { label: "Каталог", price: 400 },
        { label: "Брошюра", price: 200 },
      ],
      value: null,
    },
    {
      id: "pages",
      type: "input",
      label: "Количество страниц",
      placeholder: "Введите количество страниц",
      inputType: "number",
      min: 1,
      value: null,
    },
    {
      id: "binding",
      type: "dropdown",
      label: "Переплет",
      placeholder: "Выберите тип переплета",
      options: [
        { label: "Мягкий", price: 0 },
        { label: "Твердый", price: 500 },
        { label: "Скрепка", price: 50 },
      ],
      value: null,
    },
    {
      id: "quantity",
      type: "input",
      label: "Тираж",
      placeholder: "Введите тираж",
      inputType: "number",
      min: 1,
      value: null,
    },
  ],

  // Гравюровка
  "engraver-test": [
    {
      id: "service-type",
      type: "dropdown",
      label: "Тип услуги",
      placeholder: "Выберите тип услуги",
      options: [
        { label: "Печати и штампы", price: 500 },
        { label: "Лазерная гравировка", price: 800 },
        { label: "Шильдики", price: 300 },
        { label: "Пломбиры", price: 600 },
        { label: "Термоклеймо", price: 400 },
      ],
      value: null,
    },
    {
      id: "material",
      type: "dropdown",
      label: "Материал",
      placeholder: "Выберите материал",
      options: [
        { label: "Резина", price: 0 },
        { label: "Металл", price: 200 },
        { label: "Пластик", price: 100 },
      ],
      value: null,
    },
    {
      id: "quantity",
      type: "input",
      label: "Количество",
      placeholder: "Введите количество",
      inputType: "number",
      min: 1,
      value: null,
    },
  ],
};

/**
 * Получить конфигурацию полей для страницы
 * @param key - ключ страницы
 * @returns копия конфигурации полей (чтобы не изменять оригинал)
 */
export function getOrderFieldsConfig(key: PageConfigKey): OrderField[] {
  const pageConfig = orderFieldsConfig[key];

  if (!pageConfig || pageConfig.length === 0) {
    console.warn(
      `Конфигурация для ключа "${key}" не найдена. Возвращаю пустой массив.`
    );
    return [];
  }

  // Создаем глубокую копию, чтобы не изменять оригинальную конфигурацию
  return JSON.parse(JSON.stringify(pageConfig)) as OrderField[];
}

/**
 * Синхронная версия для совместимости
 * @deprecated Используйте getOrderFieldsConfig
 */
export function getOrderFieldsConfigSync(key: PageConfigKey): OrderField[] {
  return getOrderFieldsConfig(key);
}

/**
 * Заглушка: сохранение конфигурации в localStorage отключено.
 * Оставлено для совместимости, всегда возвращает false и ничего не пишет.
 */
export function saveConfigToStorage(
  _config: Record<PageConfigKey, OrderField[]>
): boolean {
  // Нам больше не нужно локальное сохранение конфигурации.
  return false;
}

/**
 * Метаданные страниц (срок изготовления и другие параметры)
 */
export interface PageMeta {
  productionDays?: number; // Количество дней для изготовления
  description?: string; // Текст описания для страницы (отображается в .tab-order-name p)
  imageUrl?: string; // URL изображения для страницы (отображается в .tab-option-img img)
  showMacketButton?: boolean; // Показывать ли кнопку загрузки макета (tab-order-macket)
  showDesignButton?: boolean; // Показывать ли кнопку заказа дизайна (tab-order-macket-des)
  examples?: string[]; // Массив URL изображений примеров работ
}

/**
 * Получить метаданные страницы
 * Сейчас метаданные по умолчанию минимальные и не читаются из localStorage.
 * Актуальные метаданные берутся на клиенте через API `/api/order-fields-config`.
 */
export function getPageMeta(key: PageConfigKey): PageMeta {
  // Базовое значение по умолчанию; реальные данные приходят с сервера.
  return { productionDays: 1 };
}

/**
 * Сброс кэша больше не требуется, оставлено для совместимости.
 */
export function clearMetaCache() {
  // no-op
}

/**
 * Сбросить кэш конфигурации (для обновления после сохранения)
 * Сейчас конфигурация берётся напрямую из `orderFieldsConfig`,
 * поэтому функция ничего не делает и оставлена для совместимости.
 */
export function clearConfigCache() {
  // no-op
}

/**
 * Получить ключ страницы по маршруту
 * @param routePath - путь маршрута (например, "/printing/tracing")
 * @returns ключ конфигурации или null
 */
export function getPageConfigKeyFromRoute(
  routePath: string
): PageConfigKey | null {
  // Маппинг путей к ключам конфигурации
  const routeToKeyMap: Record<string, PageConfigKey> = {
    "/printing/tracing": "tracing",
    "/printing/catalogs": "catalogs",
    "/printing/replication": "replication",
    "/printing/scan": "scan",
    "/printing/diplom": "diplom",
    "/printing/booklet/laser-print": "booklet-laser",
    "/printing/booklet/ofset-print": "booklet-ofset",
    "/printing/visit-card/laser-print": "visit-card-laser",
    "/printing/visit-card/ofset-print": "visit-card-ofset",
    "/printing/visit-card/uf-print": "visit-card-uf",
    "/printing/stickers/stickers-print": "stickers-print",
    "/printing/stickers/plotter-paper": "plotter-paper",
    "/printing/bind/plastic": "bind-plastic",
    "/printing/bind/metal": "bind-metal",
    "/printing/bind/hard": "bind-hard",
    "/printing/lamination/doc": "lamination-doc",
    "/printing/lamination/large": "lamination-large",
    "/printing/large/print": "large-print",
    "/printing/large/scan": "large-scan",
    "/printing/large/plan": "large-plan",
    "/printing/scan/print": "scan-print",
    // Фотопечать
    "/photo/test": "photo-test",
    // Сувениры
    "/gift/test": "gift-test",
    // Издательство
    "/publish/test": "publish-test",
    // Гравюровка
    "/engraver/test": "engraver-test",
  };

  return routeToKeyMap[routePath] || null;
}
