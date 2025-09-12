import { useRef, useCallback } from 'react';

/**
 * Hook personalizzato per gestire lo scroll automatico ai form
 * @param {boolean} isFormVisible - Se il form è visibile
 * @param {string} formId - ID del form da scrollare
 * @returns {Object} - Riferimento al form e funzione per scrollare
 */
export const useScrollToForm = (isFormVisible, formId = 'add-form') => {
  const formRef = useRef(null);

  const scrollToForm = useCallback(() => {
    if (isFormVisible && formRef.current) {
      // Piccolo delay per assicurarsi che il form sia renderizzato
      setTimeout(() => {
        formRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
          inline: 'nearest'
        });
      }, 100);
    }
  }, [isFormVisible]);

  return {
    formRef,
    scrollToForm
  };
};

