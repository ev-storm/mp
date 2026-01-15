<template>
  <div>
    <div v-if="isLoading" class="app-preloader">
      <div class="app-preloader__spinner"></div>
    </div>

    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>

<script setup lang="ts">
const isLoading = ref(true);

onMounted(() => {
  // Показываем прелоадер только при первом рендере/перезагрузке страницы
  setTimeout(() => {
    isLoading.value = false;
  }, 150);
});
</script>

<style>
.app-preloader {
  position: fixed;
  inset: 0;
  z-index: 9999;
  background: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
}

.app-preloader__spinner {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  border: 3px solid rgba(0, 0, 0, 0.05);
  border-top-color: var(--blue);
  animation: app-preloader-spin 0.7s linear infinite;
}

@keyframes app-preloader-spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
