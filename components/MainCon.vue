<template>
  <div class="main-content-con">
    <div class="map">
      <p v-if="breadcrumb">
        {{ breadcrumb.main }}
        <span v-if="breadcrumb.sub">|</span>
        {{ breadcrumb.sub }}
      </p>
    </div>
    <div class="main-content"></div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";

// @ts-ignore - useRoute is auto-imported by Nuxt
const route = useRoute();

// Маппинг маршрута -> { main: заголовок, sub: подзаголовок }
const breadcrumbMap: Record<string, { main: string; sub: string }> = {
  "/printing": { main: "Типография", sub: "" },
  "/photo": { main: "Фотопечать", sub: "" },
  "/gift": { main: "Сувениры", sub: "" },
  "/publish": { main: "Издательство", sub: "" },
  "/engraver": { main: "Гравировка", sub: "" },
  "/": { main: "Главная", sub: "" },
};

const breadcrumb = computed(() => {
  return breadcrumbMap[route.path] || breadcrumbMap["/"];
});
</script>

<style scoped>
.main-content-con {
  width: 80%;
  height: 95%;
  max-height: 1000px;
  margin: 0 20px 0px 0px;
  display: flex;
  flex-direction: column;
}
.map {
  display: flex;
  justify-content: end;
  width: 100%;
  height: 20px;
}
.map p {
  font-size: 10px;
  cursor: pointer;
}
.map p span {
  margin: 15px;
  cursor: default;
}

.main-content {
  width: 100%;
  height: 100%;
  background: var(--white);
  border-radius: 8px;
}
</style>
