<template>
  <footer class="footer">
    <div class="footer-container">
      <!-- Логотип и название -->
      <div class="footer-logo-section">
        <!-- <div class="footer-logo">
          <img src="/assets/svg/logo.svg" alt="" />
        </div> -->
        <div class="footer-company-name">
          <h1>МИТИНО<br />&nbsp;ПРИНТ</h1>
          <p>Типография «Митино-Принт»</p>
          <p class="year">2026</p>
        </div>
      </div>

      <!-- Навигационные колонки -->
      <div class="footer-nav">
        <div class="nav-column">
          <ul>
            <li>Типография</li>
            <li>Фотопечать</li>
            <li>Сувениры</li>
            <li>Издательство</li>
            <li>Гравюровка</li>
          </ul>
        </div>
        <div class="nav-column-marg"></div>
        <div class="nav-column">
          <ul>
            <li>Печать</li>
            <li>Сканирование</li>
            <li>Фальцовка</li>
            <li>Ламинирование</li>
            <li>Переплёт</li>
          </ul>
        </div>
        <div class="nav-column-marg"></div>
        <div class="nav-column">
          <ul>
            <li>Портфолио</li>
            <li>Тех. требования</li>
            <li>Магазин</li>
            <li>Политика <br />конфиденциальности</li>
          </ul>
        </div>
        <div class="nav-column-marg"></div>
        <div class="nav-column">
          <ul>
            <li>О компании</li>
            <li>
              <NuxtLink
                to="/about/contacts"
                :class="{ active: route.path === '/about/contacts' }"
                >Контакты и адрес</NuxtLink
              >
            </li>
            <li>Документация</li>
            <li>Оплата и доставка</li>
            <li>Вакансии</li>
          </ul>
        </div>
      </div>

      <div class="theme-con">
        <div class="theme">
          <label class="theme-switch">
            <input
              type="checkbox"
              :checked="isDarkTheme"
              @change="toggleTheme"
            />
            <span class="slider"></span>
          </label>
        </div>
      </div>

      <!-- Контактная информация -->
      <div class="footer-contact">
        <div class="contact-phone">8 495 794-81-15</div>
        <div class="contact-email">mitino-print@yandex.ru</div>
        <div class="contact-address">Москва, Новотушинский проезд, дом 6к1</div>
        <div class="contact-hours">Режим работы: Пн-Пт 09:00 - 19:00</div>
        <button class="contact-button" @click="openContactModal">
          Написать
        </button>
      </div>
    </div>
  </footer>

  <ContactModal
    :isOpen="isContactModalOpen"
    @close="closeContactModal"
    @submit="handleContactSubmit"
  />
  <Toast :message="toastMessage" :show="showToast" @close="closeToast" />
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useContactModal } from "~/composables/useContactModal";

// @ts-ignore - useRoute is auto-imported by Nuxt
const route = useRoute();

const isDarkTheme = ref(false);
const { isContactModalOpen, openContactModal, closeContactModal } =
  useContactModal();

const showToast = ref(false);
const toastMessage = ref("");

const closeToast = () => {
  showToast.value = false;
};

const handleContactSubmit = (formData: any, file: File | null) => {
  toastMessage.value = "Сообщение отправлено!";
  showToast.value = true;
};

const toggleTheme = (event: Event) => {
  const target = event.target as HTMLInputElement;
  isDarkTheme.value = target.checked;
  if (isDarkTheme.value) {
    document.documentElement.classList.add("dark-theme");
  } else {
    document.documentElement.classList.remove("dark-theme");
  }
  // Сохраняем в localStorage
  localStorage.setItem("theme", isDarkTheme.value ? "dark" : "light");
};

// Загружаем тему при монтировании
onMounted(() => {
  const savedTheme = localStorage.getItem("theme");
  if (savedTheme === "dark") {
    isDarkTheme.value = true;
    document.documentElement.classList.add("dark-theme");
  }
});
</script>

<style scoped>
.footer {
  display: flex;
  justify-content: center;
  width: 100%;
  background-color: #2d2d2d;
  color: #ffffff;
  padding: 20px 100px;
}

.footer-container {
  max-width: 1800px;
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.footer-logo-section {
  display: flex;
  align-items: center;
  gap: 20px;
  width: 20%;
}

.footer-logo {
  position: relative;
}

.footer-company-name h1 {
  font-size: 28px;
  font-weight: 500;
  line-height: 1.2;
  margin-bottom: 8px;
  text-transform: uppercase;
}

.footer-company-name p {
  font-size: 12px;
  color: #a0a0a0;
  margin: 4px 0;
}

.footer-company-name .year {
  font-size: 12px;
}

.footer-nav {
  display: flex;
  gap: 4%;
  flex: 1;
  justify-content: start;
}

.nav-column {
  display: flex;
  flex-direction: column;
}

.nav-column {
  position: relative;
  padding: 0 20px;
}

.nav-column ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.nav-column li {
  font-size: 12px;
  margin-bottom: 5px;
  font-weight: 400;
  cursor: pointer;
  transition: color 0.2s ease;
}

.nav-column li:hover {
  color: var(--blue);
}

.nav-column li a {
  color: inherit;
  transition: color 0.2s ease;
}

.nav-column li a.router-link-active:not(.active) {
  color: inherit !important;
}

.nav-column li a.active {
  color: var(--blue) !important;
  font-weight: 600 !important;
}

.footer-contact {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  width: 20%;
}
.nav-column-marg {
  height: 100px;
  width: 1px;
  background: #a0a0a0;
}
.contact-phone {
  font-size: 24px;
  font-weight: 400;
  color: #ffffff;
}

.contact-email {
  font-size: 14px;
  font-weight: 400;
  color: #ffffff;
}

.contact-address {
  font-size: 12px;
  color: #a0a0a0;
  text-align: right;
}

.contact-hours {
  font-size: 12px;
  color: #a0a0a0;
  text-align: right;
}

.contact-button {
  margin-top: 10px;
  padding: 0px 60px;
  background-color: var(--blue);
  color: #ffffff;
  border: none;
  font-weight: 500;
  border-radius: 5px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.contact-button:hover {
  background-color: #5a8fd4;
}
.theme-con {
  display: none;
  height: -webkit-fill-available;
  align-items: flex-end;
}
.theme {
  display: flex;
  align-items: center;
  justify-content: center;
}

.theme-switch {
  position: relative;
  display: inline-block;
  width: 36px;
  height: 20px;
  cursor: pointer;
}

.theme-switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #4a4a4a;
  transition: 0.3s;
  border-radius: 20px;
}

.slider:before {
  position: absolute;
  content: "";
  height: 14px;
  width: 14px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  transition: 0.3s;
  border-radius: 50%;
}

.theme-switch input:checked + .slider {
  background-color: var(--blue);
}

.theme-switch input:checked + .slider:before {
  transform: translateX(16px);
}

@media (max-width: 799px) {
  .footer {
    padding: 60px 20px;
  }
  .footer-container {
    flex-direction: column;
  }
  .footer-logo-section {
    width: 100%;
  }
  .footer-contact {
    width: 100%;
    align-items: flex-start;
  }
  .nav-column-marg {
    display: none;
  }
  .nav-column {
    margin: 0;
    padding: 0;
    width: 45%;
  }
  .footer-nav {
    flex-wrap: wrap;
    margin: 30px 0;
  }
  .footer-company-name h1 br {
    display: none;
  }
}
</style>
