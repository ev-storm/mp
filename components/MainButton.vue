<template>
  <button
    class="main-btn"
    :class="{ active: isActive }"
    :style="{ '--btn-color': color }"
    @click="navigate"
  >
    <img v-if="svgPath" :src="svgPath" alt="" class="svg-icon" />
    <h2>{{ text }}</h2>
  </button>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";

const props = withDefaults(
  defineProps<{
    text: string;
    svgPath?: string;
    color?: string;
  }>(),
  {
    color: "#6BA0E5",
  }
);

// @ts-ignore - useRoute and useRouter are auto-imported by Nuxt
const route = useRoute();
// @ts-ignore
const router = useRouter();

const routeMap: Record<string, string> = {
  Типография: "/printing",
  Фотопечать: "/photo",
  Сувениры: "/gift",
  Издательство: "/publish",
  Гравюровка: "/engraver",
};

const isClicked = ref(false);

// Определяем активную кнопку по текущему маршруту или по клику
const isActive = computed(() => {
  const buttonRoute = routeMap[props.text];
  // Проверяем точное совпадение или вложенные маршруты
  const isCurrentRoute = buttonRoute && route.path.startsWith(buttonRoute);
  return isCurrentRoute || isClicked.value;
});

const navigate = () => {
  isClicked.value = true;
  const targetRoute = routeMap[props.text];
  if (targetRoute) {
    router.push(targetRoute);
    // Сбрасываем состояние клика после небольшой задержки
    setTimeout(() => {
      isClicked.value = false;
    }, 300);
  }
};
</script>

<style scoped>
.main-btn {
  /* background: #ffffff; */
  background: var(--back);
  border-style: none;
  margin: 5px 15px;
  cursor: pointer;
  padding: 2px 20px;
  border-radius: 5px;
  display: flex;
  align-items: center;
  transition: all 0.2s ease-in-out;
  font-size: var(--f-2);
}

.main-btn h2 {
  margin: 0;
  color: var(--btn-color);
  transition: color 0.2s ease-in-out, max-width 0.5s ease-in-out,
    opacity 0.5s ease-in-out, padding 0.5s ease-in-out, margin 0.5s ease-in-out;
  white-space: nowrap;
  overflow: hidden;
  max-width: 200px;
  margin-left: 8px;
}

.main-btn .svg-icon {
  width: 21px;
  height: 21px;
  flex-shrink: 0;
  display: block;
  transition: filter 0.2s ease-in-out;
}

.main-btn:hover {
  background: var(--btn-color);
}

.main-btn.active,
.main-btn:active {
  background: var(--btn-color);
}

.main-btn:hover h2 {
  color: #ffffff;
}

.main-btn.active h2,
.main-btn:active h2 {
  color: #ffffff;
}

.main-btn:hover .svg-icon {
  filter: brightness(0) invert(1);
}

.main-btn.active .svg-icon,
.main-btn:active .svg-icon {
  filter: brightness(0) invert(1);
}
</style>
