<script setup>
definePageMeta({
  key: (route) => route.fullPath,
});

useHead({
  title: "Издательство",
  meta: [
    {
      name: "description",
      content: "",
    },
  ],
});
</script>

<template>
  <div class="main-carts-con">
    <MainCarts
      title="Корректура и редакторская правка"
      img="/img/main-carts/publish/1.svg"
      color="var(--green)"
      hoverBg="var(--green)"
    />
    <MainCarts
      title="Набор текста 
(в том числе рукописного)"
      img="/img/main-carts/publish/2.svg"
      color="var(--green)"
      hoverBg="var(--green)"
    />
    <MainCarts
      title="Спуск полос"
      img="/img/main-carts/publish/3.svg"
      color="var(--green)"
      hoverBg="var(--green)"
    />
    <MainCarts
      title="Авторам"
      img="/img/main-carts/publish/4.svg"
      color="var(--green)"
      hoverBg="var(--green)"
    />
    <MainCarts
      title="Полиграфическая верстка любой сложности"
      img="/img/main-carts/publish/5.svg"
      color="var(--green)"
      hoverBg="var(--green)"
    />
    <div class="main-carts"></div>
  </div>
</template>

<style scoped></style>
