<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from "vue";

interface DropdownOption {
  label: string;
  price: number;
}

const props = defineProps<{
  label: string;
  placeholder: string;
  options: DropdownOption[];
}>();

const modelValue = defineModel<DropdownOption | null>({ default: null });
const isOpen = ref(false);
const dropdownRef = ref<HTMLElement | null>(null);

// Получаем отображаемый текст
const displayValue = computed(() => {
  return modelValue.value?.label || "";
});

const selectOption = (option: DropdownOption) => {
  modelValue.value = option;
  isOpen.value = false;
};

const toggleDropdown = () => {
  if (!isOpen.value) {
    // Закрываем все другие dropdown перед открытием
    document.dispatchEvent(new CustomEvent("close-all-dropdowns"));
  }
  isOpen.value = !isOpen.value;
};

const closeDropdown = () => {
  isOpen.value = false;
};

// Слушаем клики вне компонента
const handleClickOutside = (event: MouseEvent) => {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target as Node)) {
    isOpen.value = false;
  }
};

// Слушаем событие закрытия всех dropdown
const handleCloseAll = () => {
  isOpen.value = false;
};

onMounted(() => {
  document.addEventListener("click", handleClickOutside);
  document.addEventListener("close-all-dropdowns", handleCloseAll);
});

onUnmounted(() => {
  document.removeEventListener("click", handleClickOutside);
  document.removeEventListener("close-all-dropdowns", handleCloseAll);
});
</script>

<template>
  <div ref="dropdownRef" class="dropdown">
    <label class="dropdown-label">{{ label }}</label>
    <div
      class="dropdown-btn"
      :class="{ open: isOpen }"
      @click.stop="toggleDropdown"
    >
      <span :class="{ placeholder: !displayValue }">
        {{ displayValue || placeholder }}
      </span>
      <span class="dropdown-arrow">›</span>
    </div>
    <ul class="dropdown-list" :class="{ open: isOpen }">
      <li
        v-for="option in options"
        :key="option.label"
        :class="{ selected: modelValue?.label === option.label }"
        @click.stop="selectOption(option)"
      >
        {{ option.label }}
      </li>
    </ul>
  </div>
</template>

<style scoped>
.dropdown {
  position: relative;
  width: 30%;
  margin: 10px 0;
}
.dropdown-label {
  display: block;
  font-size: var(--f-p);
  font-weight: 500;
  color: var(--black);
}
.dropdown-btn {
  display: flex;
  width: 100%;
  justify-content: space-between;
  align-items: center;
  padding: 2px 20px;
  background: var(--back);
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}
.dropdown-btn:hover {
  background: #dedede;
}
.dropdown-btn span {
  color: var(--black);
  font-size: var(--f-p);
  /* flex: 1;
  min-width: 0; */
}
.dropdown-btn span.placeholder {
  color: var(--grey);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.dropdown-arrow {
  scale: 1.8;
  transition: transform 0.3s ease;
  transform: rotate(90deg);
}
.dropdown-btn.open .dropdown-arrow {
  transform: rotate(-90deg);
}
.dropdown-list {
  position: absolute;
  top: 100%;
  width: 100%;
  left: 0;
  right: 0;
  background: var(--back);
  border-radius: 8px;
  box-shadow: #00000015 0 5px 20px;
  margin-top: 5px;
  max-height: 0;
  overflow: hidden;
  opacity: 0;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 10;
}
.dropdown-list.open {
  max-height: 300px;
  opacity: 1;
  overflow-y: auto;
  box-shadow: #00000030 0 5px 20px;
}
.dropdown-list li {
  padding: 2px 20px;
  cursor: pointer;
  transition: background 0.2s ease;
  color: var(--grey);
  font-size: var(--f-p);
  border-style: solid;
  border-color: var(--white);
  border-width: 0 0 0px 0;
}
.dropdown-list li:hover {
  background: #d4d4d4;
  color: var(--black);
}
.dropdown-list li.selected {
  background: var(--back);
  color: var(--blue);
}
@media (max-width: 799px) {
  .dropdown {
    width: 46%;
  }
}
</style>
