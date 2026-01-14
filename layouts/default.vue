<template>
  <div class="layout">
    <Header />
    <main>
      <div class="container">
        <LeftBar />
        <slot />
      </div>
    </main>
    <Footer />
  </div>
</template>

<script setup>
import Header from "~/components/Header.vue";
import Footer from "~/components/Footer.vue";

// Базовый layout для всего приложения
</script>

<style scoped></style>

<style></style>
