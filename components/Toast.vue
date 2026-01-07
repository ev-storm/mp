<script setup lang="ts">
import { ref, watch } from "vue";

const props = defineProps<{
  message: string;
  show: boolean;
  duration?: number;
}>();

const emit = defineEmits<{
  (e: "close"): void;
}>();

watch(
  () => props.show,
  (newVal) => {
    if (newVal) {
      setTimeout(() => {
        emit("close");
      }, props.duration || 3000);
    }
  }
);
</script>

<template>
  <Transition name="toast">
    <div v-if="show" class="toast">
      <p>{{ message }}</p>
    </div>
  </Transition>
</template>

<style scoped>
.toast {
  position: fixed;
  bottom: 30px;
  left: 30px;
  background: var(--blue);

  padding: 10px 28px;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 500;
  z-index: 9999;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.toast p {
  margin: 0;
  color: #fff;
  font-size: var(--f-1);
}

.toast-enter-active {
  animation: slideIn 0.3s ease-out;
}

.toast-leave-active {
  animation: slideOut 0.3s ease-in;
}

@keyframes slideIn {
  from {
    transform: translateX(-100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes slideOut {
  from {
    transform: translateX(0);
    opacity: 1;
  }
  to {
    transform: translateX(-100%);
    opacity: 0;
  }
}
</style>
