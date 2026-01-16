<template>
  <div class="layout">
    <Header />
    <main>
      <div class="container">
        <LeftBar />
        <slot />
      </div>
    </main>
    <Footer v-if="!isAdminPage" />
  </div>
</template>

<script setup>
import Header from "~/components/Header.vue";
import Footer from "~/components/Footer.vue";

const route = useRoute();
const isAdminPage = computed(() => {
  return route.path.startsWith('/admin');
});

// Базовый layout для всего приложения
</script>

<style scoped></style>

<style></style>
