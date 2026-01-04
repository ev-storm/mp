<script setup>
// Принудительное обновление страницы при переходе
definePageMeta({
  key: route => route.fullPath,
});

useHead({
  title: "Типография",
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
      title="Печать и сканирование до А3"
      img="/img/main-carts/print/1.svg"
      color="var(--blue)"
      hoverBg="var(--blue)"
    />
    <MainCarts
      title="Широкоформатная печать и сканирование"
      img="/img/main-carts/print/2.svg"
      color="var(--blue)"
      hoverBg="var(--blue)"
    />
    <MainCarts
      title="Печать листовок и буклетов"
      img="/img/main-carts/print/3.svg"
      color="var(--blue)"
      hoverBg="var(--blue)"
      link="/printing/booklet/laser-print"
    />
    <MainCarts
      title="Печать визиток"
      img="/img/main-carts/print/4.svg"
      color="var(--blue)"
      hoverBg="var(--blue)"
      link="/printing/visit-card/laser-print"
    />
    <MainCarts
      title="Печать брошюр и каталогов"
      img="/img/main-carts/print/5.svg"
      color="var(--blue)"
      hoverBg="var(--blue)"
    />
    <MainCarts
      title="Печать наклеек и плотерная резка"
      img="/img/main-carts/print/6.svg"
      color="var(--blue)"
      hoverBg="var(--blue)"
      link="/printing/stickers/stickers-print"
    />
    <MainCarts
      title="Печать курсовых и дипломных работ"
      img="/img/main-carts/print/7.svg"
      color="var(--blue)"
      hoverBg="var(--blue)"
    />
    <MainCarts
      title="Переплёт"
      img="/img/main-carts/print/8.svg"
      color="var(--blue)"
      hoverBg="var(--blue)"
    />
    <MainCarts
      title="Фальцовка"
      img="/img/main-carts/print/9.svg"
      color="var(--blue)"
      hoverBg="var(--blue)"
    />
    <MainCarts
      title="Ламинирование"
      img="/img/main-carts/print/10.svg"
      color="var(--blue)"
      hoverBg="var(--blue)"
    />
    <MainCarts
      title="Тиснение"
      img="/img/main-carts/print/11.svg"
      color="var(--blue)"
      hoverBg="var(--blue)"
    />
    <MainCarts
      title="Офсетная печать"
      img="/img/main-carts/print/12.svg"
      color="var(--blue)"
      hoverBg="var(--blue)"
    />
    <MainCarts
      title="Тиражированиена ризографе"
      img="/img/main-carts/print/13.svg"
      color="var(--blue)"
      hoverBg="var(--blue)"
    />
    <MainCarts
      title="Печать на кальке"
      img="/img/main-carts/print/14.svg"
      color="var(--blue)"
      hoverBg="var(--blue)"
    />
  </div>
</template>

<style scoped></style>

