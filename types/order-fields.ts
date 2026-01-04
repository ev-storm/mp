// Типы для унифицированной конфигурации полей заказа

export interface DropdownOption {
  label: string;
  price: number;
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

// Toggle (переключатель) поле
export interface ToggleField extends BaseField {
  type: "toggle";
  tooltip?: string; // Подсказка при наведении
  price: number; // Цена за включение
  value: boolean;
}

// Select поле (dropdown для тиража с предустановленными значениями)
export interface SelectField extends BaseField {
  type: "select";
  placeholder: string;
  options: DropdownOption[];
  value: DropdownOption | null;
}

// Input поле (для произвольного ввода)
export interface InputField extends BaseField {
  type: "input";
  placeholder: string;
  inputType: "number" | "text";
  min?: number;
  max?: number;
  value: string | number | null;
}

// Объединённый тип для любого поля
export type OrderField = DropdownField | ToggleField | SelectField | InputField;

// Хелпер для создания конфигурации
export function createOrderConfig(fields: OrderField[]): OrderField[] {
  return fields;
}

// Функция расчёта общей цены
export function calculateTotalPrice(
  fields: OrderField[],
  quantity: number = 1,
  designPrice: number = 0
): number {
  let sum = 0;

  for (const field of fields) {
    switch (field.type) {
      case "dropdown":
      case "select":
        if (field.value) {
          sum += field.value.price;
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

  return sum * quantity + designPrice;
}

// Получить значение количества из полей
export function getQuantityFromFields(fields: OrderField[]): number {
  for (const field of fields) {
    if (field.id === "quantity" || field.id === "count") {
      if (field.type === "select" && field.value) {
        // Извлекаем число из label, например "100 шт." -> 100
        const match = field.value.label.match(/(\d+)/);
        return match ? parseInt(match[1], 10) : 1;
      }
      if (field.type === "input" && field.value) {
        return typeof field.value === "number" ? field.value : parseInt(String(field.value), 10) || 1;
      }
    }
  }
  return 1;
}

