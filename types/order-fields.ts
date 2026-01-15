// Типы для унифицированной конфигурации полей заказа

export interface DropdownOption {
  label: string;
  price: number | number[]; // Может быть число или массив цен для разных порогов
}

// Базовый интерфейс для всех полей
interface BaseField {
  id: string;
  label: string;
}

// Dropdown поле
export interface DropdownField extends BaseField {
  type: "dropdown";
  placeholder: string;
  options: DropdownOption[];
  value: DropdownOption | null;
}

// Dropdown-multiply поле (умножает текущую сумму на цену)
export interface DropdownMultiplyField extends BaseField {
  type: "dropdown-multiply";
  placeholder: string;
  options: DropdownOption[];
  value: DropdownOption | null;
}

// Toggle (переключатель) поле
export interface ToggleField extends BaseField {
  type: "toggle";
  tooltip?: string; // Подсказка при наведении
  price: number; // Цена за включение
  value: boolean;
}

// Input поле (для произвольного ввода)
export interface InputField extends BaseField {
  type: "input";
  placeholder: string;
  inputType: "number" | "text";
  min?: number;
  max?: number;
  value: string | number | null;
  thresholds?: number[]; // Пороги для расчета цен (только для поля "quantity")
}

// Объединённый тип для любого поля
export type OrderField = DropdownField | DropdownMultiplyField | ToggleField | InputField;

// Хелпер для создания конфигурации
export function createOrderConfig(fields: OrderField[]): OrderField[] {
  return fields;
}

// Функция для получения индекса цены на основе порогов
function getPriceIndex(quantity: number, thresholds: number[] | undefined): number {
  if (!thresholds || thresholds.length === 0) {
    return 0;
  }

  // Находим первый порог, который не превышен (quantity <= threshold)
  // Пороги определяют диапазоны: [0, threshold[0]], (threshold[0], threshold[1]], (threshold[1], threshold[2]], ...
  for (let i = 0; i < thresholds.length; i++) {
    const threshold = thresholds[i];
    if (threshold !== undefined && quantity <= threshold) {
      return i;
    }
  }

  // Если все пороги превышены, возвращаем последний валидный индекс
  // (массив цен обычно имеет длину равную thresholds.length, поэтому последний индекс = length - 1)
  return thresholds.length - 1;
}

// Функция для получения цены с учетом порогов
function getPriceWithThresholds(
  price: number | number[],
  quantity: number,
  thresholds: number[] | undefined
): number {
  // Если цена - просто число, возвращаем его
  if (typeof price === "number") {
    return price;
  }

  // Если цена - массив, выбираем нужный индекс
  if (Array.isArray(price)) {
    if (price.length === 0) {
      return 0;
    }
    
    // Если нет порогов, возвращаем первую цену
    if (!thresholds || thresholds.length === 0) {
      return price[0] !== undefined ? price[0] : 0;
    }
    
    const index = getPriceIndex(quantity, thresholds);
    
    // Ограничиваем индекс границами массива цен
    // Если индекс выходит за границы, используем последний валидный индекс
    const validIndex = Math.min(index, price.length - 1);
    const selectedPrice = price[validIndex];
    return selectedPrice !== undefined ? selectedPrice : 0;
  }

  return 0;
}

// Функция расчёта общей цены
export function calculateTotalPrice(
  fields: OrderField[],
  quantity: number = 1,
  designPrice: number = 0
): number {
  let sum = 0;
  let multiplyFactor = 1; // Множитель для dropdown-multiply полей

  // Находим поле "quantity" для получения порогов
  const quantityField = fields.find(
    (field) => field.id === "quantity" && field.type === "input"
  );
  const thresholds =
    quantityField && quantityField.type === "input"
      ? quantityField.thresholds
      : undefined;

  // Сначала собираем сумму от обычных полей
  for (const field of fields) {
    switch (field.type) {
      case "dropdown":
        if (field.value) {
          const price = getPriceWithThresholds(
            field.value.price,
            quantity,
            thresholds
          );
          sum += price;
        }
        break;
      case "dropdown-multiply":
        // Для dropdown-multiply умножаем множитель на цену
        if (field.value) {
          const price = getPriceWithThresholds(
            field.value.price,
            quantity,
            thresholds
          );
          multiplyFactor *= price;
        }
        break;
      case "toggle":
        if (field.value) {
          sum += field.price;
        }
        break;
      // input поля не добавляют к цене напрямую
    }
  }

  // Применяем множитель к сумме и умножаем на количество
  return (sum * multiplyFactor) * quantity + designPrice;
}

// Получить значение количества из полей
export function getQuantityFromFields(fields: OrderField[]): number {
  for (const field of fields) {
    if (field.id === "quantity" || field.id === "count") {
      if (field.type === "input" && field.value) {
        return typeof field.value === "number" ? field.value : parseInt(String(field.value), 10) || 1;
      }
    }
  }
  return 1;
}

