<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from "vue";

const props = defineProps<{
  isOpen: boolean;
  examples: string[]; // Массив URL изображений
}>();

const emit = defineEmits<{
  (e: "close"): void;
}>();

const currentIndex = ref(0);

// Вычисляемое свойство для текущего изображения
const currentImage = computed(() => {
  if (!props.examples || props.examples.length === 0) {
    return null;
  }
  return props.examples[currentIndex.value];
});

// Проверка, есть ли примеры
const hasExamples = computed(() => {
  return props.examples && props.examples.length > 0;
});

// Переключение на следующее изображение
const nextImage = () => {
  if (!hasExamples.value) return;
  currentIndex.value = (currentIndex.value + 1) % props.examples.length;
};

// Переключение на предыдущее изображение
const prevImage = () => {
  if (!hasExamples.value) return;
  currentIndex.value =
    currentIndex.value === 0
      ? props.examples.length - 1
      : currentIndex.value - 1;
};

// Обработка нажатий клавиш
const handleKeyDown = (event: KeyboardEvent) => {
  if (!props.isOpen) return;

  if (event.key === "ArrowLeft") {
    prevImage();
  } else if (event.key === "ArrowRight") {
    nextImage();
  } else if (event.key === "Escape") {
    emit("close");
  }
};

// Закрытие модалки при клике на оверлей
const handleOverlayClick = (event: MouseEvent) => {
  const target = event.target as HTMLElement;
  if (target.classList.contains("examples-modal")) {
    emit("close");
  }
};

// Сброс индекса при открытии модалки
watch(
  () => props.isOpen,
  (isOpen) => {
    if (isOpen) {
      currentIndex.value = 0;
    }
  }
);

onMounted(() => {
  window.addEventListener("keydown", handleKeyDown);
});

onUnmounted(() => {
  window.removeEventListener("keydown", handleKeyDown);
});
</script>

<template>
  <Transition name="modal">
    <div v-if="isOpen" class="examples-modal" @click="handleOverlayClick">
      <div class="examples-modal-content" @click.stop>
        <!-- Контент модалки -->
        <div v-if="hasExamples" class="examples-modal-image-container">
          <img
            :src="currentImage"
            :alt="`Пример работы ${currentIndex + 1}`"
            class="examples-modal-image"
          />
        </div>

        <!-- Сообщение, если примеров нет -->
        <div v-else class="examples-modal-empty">
          <p>Примеров пока нет</p>
        </div>

        <!-- Навигация стрелками (только если есть примеры) -->
        <div
          v-if="hasExamples && examples.length > 1"
          class="examples-modal-nav"
        >
          <button
            class="examples-modal-nav-btn examples-modal-nav-btn-prev"
            @click="prevImage"
            aria-label="Предыдущее изображение"
          >
            <img src="/assets/svg/l.svg" alt="" />
          </button>
          <button
            class="examples-modal-nav-btn examples-modal-nav-btn-next"
            @click="nextImage"
            aria-label="Следующее изображение"
          >
            <img src="/assets/svg/r.svg" alt="" />
          </button>
        </div>

        <!-- Индикатор текущего изображения (только если есть несколько примеров) -->
        <div
          v-if="hasExamples && examples.length > 1"
          class="examples-modal-indicator"
        >
          <span>{{ currentIndex + 1 }} / {{ examples.length }}</span>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.examples-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  pointer-events: auto;
  backdrop-filter: blur(3px);
}

.examples-modal-content {
  background: var(--white);
  border-radius: 10px;
  padding: 20px;
  max-width: 1000px;
  position: relative;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 70%;
  height: 70vh;
}

.examples-modal-image-container {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.examples-modal-image {
  width: auto;
  height: 100%;
  object-fit: contain;
  border-radius: 8px;
}

.examples-modal-empty {
  padding: 60px 40px;
  text-align: center;
  color: var(--grey);
  font-size: 18px;
}

.examples-modal-nav {
  display: flex;
  gap: 20px;
  margin-top: 10px;
  position: absolute;
  top: 80%;
  left: 85%;
  border: 2px solid var(--blue);
  border-radius: 30px;
}

.examples-modal-nav-btn {
  color: var(--blue);
  border: none;
  border-radius: 50%;
  width: 50px;
  height: 50px;
  font-size: 24px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  user-select: none;
  background: transparent;
}
.examples-modal-nav-btn:hover {
  background: #6ba0e53a;
}

/* .examples-modal-nav-btn:hover {
  background: #558dd5;
  transform: scale(1.1);
}

.examples-modal-nav-btn:active {
  transform: scale(0.95);
}

 */
.examples-modal-indicator {
  margin-top: 15px;
  color: var(--grey);
  font-size: 14px;
  position: absolute;
  top: 90%;
  left: 90%;
}

/* Анимации появления и исчезновения */
.modal-enter-active {
  transition: opacity 0.3s ease;
}

.modal-enter-active .examples-modal-content {
  animation: slideDown 0.3s ease-out;
}

.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-leave-active .examples-modal-content {
  animation: slideUp 0.3s ease-in;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-to,
.modal-leave-from {
  opacity: 1;
}

@keyframes slideDown {
  from {
    transform: translateY(-50px);
  }
  to {
    transform: translateY(0);
  }
}

@keyframes slideUp {
  from {
    transform: translateY(0);
  }
  to {
    transform: translateY(-50px);
  }
}

@media (max-width: 799px) {
  .examples-modal-content {
    padding: 15px;
    max-width: 95vw;
  }

  .examples-modal-image-container {
    max-height: 60vh;
  }

  .examples-modal-nav-btn {
    width: 40px;
    height: 40px;
    font-size: 20px;
  }
}
</style>
