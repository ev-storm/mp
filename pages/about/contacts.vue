<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";

definePageMeta({
  key: (route) => route.fullPath,
});

useHead({
  title: "Контакты",
  meta: [
    {
      name: "description",
      content: "Контакты",
    },
  ],
  script: [
    {
      src: "https://api-maps.yandex.ru/3.0/?apikey=2daa9fb2-779c-4369-b15e-8ba3c97897c5&lang=ru_RU",
      async: true,
    },
  ],
});

const showToast = ref(false);
const toastMessage = ref("");
const mapContainer = ref<HTMLElement | null>(null);
let map: any = null;

const copyText = async (event: Event) => {
  const img = event.target as HTMLElement;
  const contactsItem = img.closest(".main-contacts-item");

  if (!contactsItem) return;

  const span = contactsItem.querySelector("h2 span");
  if (!span) return;

  const textToCopy = span.textContent || "";

  try {
    // Проверяем доступность Clipboard API
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(textToCopy);
      toastMessage.value = "Текст скопирован";
      showToast.value = true;
    } else {
      // Fallback метод для старых браузеров или небезопасного контекста
      const textArea = document.createElement("textarea");
      textArea.value = textToCopy;
      textArea.style.position = "fixed";
      textArea.style.left = "-999999px";
      textArea.style.top = "-999999px";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();

      try {
        const successful = document.execCommand("copy");
        if (successful) {
          toastMessage.value = "Текст скопирован";
          showToast.value = true;
        } else {
          throw new Error("execCommand failed");
        }
      } catch (err) {
        console.error("Ошибка копирования (fallback):", err);
        toastMessage.value = "Ошибка копирования";
        showToast.value = true;
      } finally {
        document.body.removeChild(textArea);
      }
    }
  } catch (err) {
    console.error("Ошибка копирования:", err);
    toastMessage.value = "Ошибка копирования";
    showToast.value = true;
  }
};

const closeToast = () => {
  showToast.value = false;
};

const initMap = async () => {
  if (!mapContainer.value || typeof window === "undefined") return;

  try {
    // Ждем загрузки API
    await (window as any).ymaps3.ready;

    const {
      YMap,
      YMapDefaultSchemeLayer,
      YMapDefaultFeaturesLayer,
      YMapMarker,
    } = (window as any).ymaps3;

    // Координаты: г. Москва, Новотушинский проезд, дом 6к1
    const coordinates = [37.38265, 55.837258];

    // Создаем карту
    map = new YMap(mapContainer.value, {
      location: {
        center: coordinates,
        zoom: 16,
      },
    });

    // Добавляем слои
    map.addChild(new YMapDefaultSchemeLayer());
    map.addChild(new YMapDefaultFeaturesLayer());

    // Создаем кастомную иконку для маркера (будка)
    const markerElement = document.createElement("div");
    markerElement.innerHTML = `
      <div style="
        width: 30px;
        height: 30px;
        background: var(--blue);
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        box-shadow: 0 2px 6px rgba(0,0,0,0.3);
        position: relative;
      ">
        <div style="
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%) rotate(45deg);
        width: 20px;
        height: 20px;
				border-radius: 50%;
					background:var(--white)
        "></div>
      </div>
    `;
    markerElement.style.cursor = "pointer";

    // Добавляем маркер с кастомной иконкой
    const marker = new YMapMarker(
      {
        coordinates: coordinates,
        mapFollowsOnClick: false,
      },
      markerElement
    );

    map.addChild(marker);
  } catch (error) {
    console.error("Ошибка инициализации карты:", error);
  }
};

onMounted(() => {
  if (typeof window !== "undefined") {
    // Проверяем, загружен ли уже API
    if ((window as any).ymaps3) {
      initMap();
    } else {
      // Ждем загрузки скрипта
      const checkYmaps = setInterval(() => {
        if ((window as any).ymaps3) {
          clearInterval(checkYmaps);
          initMap();
        }
      }, 100);

      // Очищаем интервал через 10 секунд, если API не загрузился
      setTimeout(() => {
        clearInterval(checkYmaps);
      }, 10000);
    }
  }
});

onUnmounted(() => {
  if (map) {
    map.destroy();
    map = null;
  }
});
</script>

<template>
  <div class="contacts-con">
    <div class="main-contacts-con">
      <div ref="mapContainer" class="map-con"></div>
      <div class="main-contacts">
        <h1>Контакты</h1>
        <div class="tel-con main-contacts-item">
          <img src="/public/img/contact/copy.svg" alt="" @click="copyText" />
          <div class="tel">
            <h2>Телефон<br /><span>+7 495 794-81-15</span></h2>
          </div>
        </div>
        <div class="mail-con main-contacts-item">
          <img src="/public/img/contact/copy.svg" alt="" @click="copyText" />
          <div class="mail">
            <h2>E-mail<br /><span>mitino-print@yandex.ru</span></h2>
          </div>
        </div>
        <div class="tg-con main-contacts-item">
          <img src="/public/img/contact/copy.svg" alt="" @click="copyText" />
          <div class="tg">
            <h2>Telegram<br /><span>@mitino-print</span></h2>
          </div>
        </div>
        <div class="loc-con main-contacts-item">
          <img src="/public/img/contact/copy.svg" alt="" @click="copyText" />
          <div class="loc">
            <h2>
              Наш адрес:<br /><span
                >г. Москва, Новотушинский проезд, дом 6к1.</span
              >
            </h2>
          </div>
        </div>
        <div class="time-con main-contacts-item">
          <div class="time">
            <h2>
              Время работы:<br /><span
                >Пн - Пт с 9:00 до 19:00<br />Суббота, Воскресенье
                - выходной</span
              >
            </h2>
          </div>
        </div>
      </div>
    </div>

    <div class="contacts-desc-con">
      <div class="contacts-desc-item">
        <img src="/public/img/contact/1.svg" alt="" @click="copyText" />
        <h2>
          Как к нам пройти от станции метро Волоколамская:<br /><span
            >Выход м.«Волоколамская» (первый вагон из центра). По подземному
            переходу перейти на другую сторону дороги Наш офис находится в
            центре дома 6 корп. 1 со стороны Новотушинского проезда.</span
          >
        </h2>
      </div>
      <div class="contacts-desc-item">
        <img src="/public/img/contact/2.svg" alt="" @click="copyText" />
        <h2>
          Как к нам пройти от станции МЦД-2 Волоколамская:<br /><span
            >Пройдите по дороге до первого входа в метро      Далее пройти
            дальше по парку до следующего входа в метро    Далее аналогичный
            путь от метро "Волоколамская"</span
          >
        </h2>
      </div>
      <div class="contacts-desc-item">
        <img src="/public/img/contact/3.svg" alt="" @click="copyText" />
        <h2>
          Как к нам доехать на автобусе:<br /><span
            >Станция м. Тушинская (последний вагон из центра). Автобус 266.
            Остановка "1-й микрорайон Митино". Перейти на другую сторону
            Пятницкого шоссе, пройти с зади жилых домов в сторону метро
            Волоколамская. Наш офис находится в центре дома 6 корп. 1 со стороны
            Новотушинского проезда.</span
          >
        </h2>
      </div>
    </div>

    <Toast :message="toastMessage" :show="showToast" @close="closeToast" />
  </div>
</template>

<style scoped>
.contacts-con {
  width: 100%;
  height: 87vh;
  overflow: scroll;
}
.main-contacts-con {
  display: flex;
  width: 100%;
  justify-content: space-between;
  height: 50vh;
}
.map-con {
  width: 60%;
  height: 100%;
  background: var(--grey);
  overflow: hidden;
  border-radius: 8px;
  position: relative;
}
.main-contacts {
  width: 35%;
}
.main-contacts h1 {
  font-weight: 500;
  border-bottom: solid var(--blue) 2px;
  width: 40%;
  line-height: 2.8;
  font-size: var(--f-1);
}
.main-contacts-item {
  display: flex;
  padding: 15px 0;
  gap: 10px;
}
.main-contacts-item img {
  width: 20px;
  transition: var(--tran);
  cursor: pointer;
}
.main-contacts-item img:active {
  scale: 0.95;
}
.main-contacts-item h2 {
  font-size: var(--f-2);
  font-weight: 500;
  line-height: 1.2;
}
.main-contacts-item h2 span {
  font-size: var(--f-p);
  color: var(--grey);
}
.contacts-desc-con {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 50px 0;
}
.contacts-desc-item {
  width: 70%;
  display: flex;
  gap: 20px;
  align-items: center;
}
.contacts-desc-item img {
  filter: grayscale(1);
  transition: var(--tran);
}
.contacts-desc-item:hover img {
  filter: grayscale(0);
}
.contacts-desc-item h2 {
  font-size: var(--f-2);
  font-weight: 500;
  line-height: 1.2;
}
.contacts-desc-item h2 span {
  font-size: var(--f-p);
  color: var(--grey);
}

@media (max-width: 799px) {
  .contacts-con {
    height: auto;
    padding: 15px;
  }

  .main-contacts-con {
    flex-direction: column;
    height: auto;
    gap: 20px;
    align-items: center;
  }

  .map-con {
    width: 100%;
    height: 250px;
    order: 2;
  }

  .main-contacts {
    width: 70%;
    order: 1;
    margin: 20px 0;
  }

  .main-contacts h1 {
    width: 60%;
    font-size: var(--f-2);
    line-height: 2;
  }

  .main-contacts-item {
    padding: 12px 0;
    gap: 8px;
  }

  .main-contacts-item img {
    width: 18px;
    flex-shrink: 0;
  }

  .main-contacts-item h2 {
    font-size: var(--f-p);
    line-height: 1.3;
  }

  .main-contacts-item h2 span {
    font-size: 11px;
  }

  .contacts-desc-con {
    margin: 30px 0;
    padding: 0 15px;
  }

  .contacts-desc-item {
    width: 100%;
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
    margin-bottom: 25px;
  }

  .contacts-desc-item img {
    width: 80px;
    height: 80px;
    align-self: flex-start;
  }

  .contacts-desc-item h2 {
    font-size: var(--f-p);
    line-height: 1.4;
    width: 100%;
  }

  .contacts-desc-item h2 span {
    font-size: 11px;
    line-height: 1.5;
  }
}
</style>
