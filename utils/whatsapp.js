/**
 * Helper function to open WhatsApp chat with a predefined message
 * @param {string} message - The message to send
 * @param {string|null} phone - Optional phone number (defaults to Finva's phone)
 */
export const sendWhatsAppMessage = (message, phone = null) => {
  const FINVA_PHONE = "525610534973"; // Finva's phone set as constant
  const whatsappURL = `https://wa.me/${
    phone || FINVA_PHONE
  }?text=${encodeURIComponent(message)}`;
  window.open(whatsappURL, "_blank");
};

