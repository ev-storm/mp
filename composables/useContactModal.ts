import { ref } from "vue";

// Общее состояние для всех компонентов
const isContactModalOpen = ref(false);

export const useContactModal = () => {
  const openContactModal = () => {
    isContactModalOpen.value = true;
  };

  const closeContactModal = () => {
    isContactModalOpen.value = false;
  };

  return {
    isContactModalOpen,
    openContactModal,
    closeContactModal,
  };
};

