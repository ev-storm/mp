<script setup lang="ts">
import type { OrderField } from "~/types/order-fields";

const props = defineProps<{
  fields: OrderField[];
}>();
</script>

<template>
  <div class="tab-option-main">
    <template v-for="field in fields" :key="field.id">
      <!-- Dropdown -->
      <Dropdown
        v-if="field.type === 'dropdown'"
        v-model="field.value"
        :label="field.label"
        :placeholder="field.placeholder"
        :options="field.options"
      />

      <!-- Toggle -->
      <div
        v-if="field.type === 'toggle'"
        class="toggle-group"
      >
        <label class="toggle-switch">
          <input type="checkbox" v-model="field.value" />
          <span class="toggle-slider"></span>
        </label>
        <span class="toggle-label">
          {{ field.label }}
          <span
            v-if="field.tooltip"
            class="toggle-tooltip"
            :data-tooltip="field.tooltip"
            >?</span
          >
        </span>
      </div>

      <!-- Input -->
      <div
        v-if="field.type === 'input'"
        class="input-group"
      >
        <label class="input-label">{{ field.label }}</label>
        <input
          v-model="field.value"
          :type="field.inputType"
          :min="field.min"
          :max="field.max"
          :placeholder="field.placeholder"
          class="input-field"
        />
      </div>
    </template>
  </div>
</template>

<style scoped>
.tab-option-main {
  width: 90%;
  height: -moz-fit-content;
  height: fit-content;
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  align-content: space-around;
  justify-content: flex-start;
  gap: 0 5%;
}

/* Input group styles */
.input-group {
  position: relative;
  width: 30%;
  margin: 10px 0;
}

.input-label {
  display: block;
  font-size: var(--f-p);
  font-weight: 500;
  color: var(--black);
}

.input-field {
  width: 100%;
  padding: 2px 20px;
  background: var(--back);
  border: none;
  border-radius: 4px;
  font-size: var(--f-p);
  color: var(--black);
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.input-field:hover {
  background: #dedede;
}

.input-field:focus {
  background: #dedede;
  outline: none;
}

.input-field::placeholder {
  color: var(--grey);
}

/* Убираем стрелки у number input */
.input-field::-webkit-outer-spin-button,
.input-field::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.input-field[type="number"] {
  -moz-appearance: textfield;
}

/* Toggle styles */
.toggle-group {
  display: flex;
  align-items: center;
  width: 30%;
  margin: 10px 0;
  gap: 12px;
}

.toggle-switch {
  position: relative;
  width: 36px;
  height: 18px;
  flex-shrink: 0;
}

.toggle-switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: var(--grey);
  border-radius: 18px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.toggle-slider::before {
  position: absolute;
  content: "";
  height: 14px;
  width: 14px;
  left: 2px;
  bottom: 2px;
  background-color: white;
  border-radius: 50%;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}

.toggle-switch input:checked + .toggle-slider {
  background-color: var(--blue);
}

.toggle-switch input:checked + .toggle-slider::before {
  transform: translateX(18px);
}

.toggle-label {
  font-size: var(--f-p);
  font-weight: 500;
  color: var(--black);
  display: flex;
  align-items: center;
  gap: 6px;
}

.toggle-tooltip {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: var(--white);
  color: var(--grey);
  border-style: solid;
  border-width: 1px;
  border-color: var(--grey);
  font-size: 10px;
  cursor: pointer;
  position: relative;
}
.toggle-tooltip:hover {
  color: var(--blue);
  border-color: var(--blue);
}
.toggle-tooltip:hover::after {
  content: attr(data-tooltip);
  position: absolute;
  width: 300px;
  bottom: 130%;
  left: 50%;
  transform: translateX(-50%);
  background: var(--white);
  color: var(--grey);
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 600;
  white-space: wrap;
  z-index: 100;
  animation: tooltipFade 0.2s ease forwards;
  box-shadow: #00000035 0 10px 20px;
}

.toggle-tooltip:hover::before {
  content: "";
  position: absolute;
  bottom: 115%;
  left: 50%;
  transform: translateX(-50%);
  border: 6px solid transparent;
  border-top-color: var(--black);
  z-index: 100;
  animation: tooltipFade 0.2s ease forwards;
}

@keyframes tooltipFade {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
@media (max-width: 799px) {
  .toggle-group {
    width: 46%;
  }
  .input-group {
    width: 46%;
  }
}
</style>
