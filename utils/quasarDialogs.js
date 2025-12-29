import { Loading, Notify } from "quasar";
import { QSpinnerPuff } from "quasar";

/**
 * Shows a loading indicator with custom options
 * @param {Object|string} options - Loading options or message string
 */
export const showLoading = (options) => {
  const defaultMessage = "Por favor no cierres ni actualices la página";
  const message = typeof options === 'string' ? options : (options?.message || "");
  const defaultOptions = {
    message: message ? `<div class="loading-message">${message}</div><div class="loading-hint">${defaultMessage}</div>` : `<div class="loading-hint">${defaultMessage}</div>`,
    html: true,
    spinner: QSpinnerPuff,
    spinnerColor: "#2FFF96",
    spinnerSize: "3.5rem",
    backgroundColor: "rgba(0, 0, 0, 0.85)",
    customClass: "enhanced-loading",
    solidBackground: false,
    ...(typeof options === 'object' ? options : {}),
  };

  Loading.show(defaultOptions);
};

/**
 * Hides the loading indicator
 */
export const hideLoading = () => {
  Loading.hide();
};

/**
 * Shows a notification with custom options
 * @param {Object} options - Notification options
 */
export const showNotification = (options) => {
  const defaultOptions = {
    position: "top",
    timeout: 5000,
    ...options,
  };

  Notify.create(defaultOptions);
};

// Convenience methods for common notification types
export const showNotificationSuccess = (message, options = {}) => {
  showNotification({ type: "positive", message, ...options });
};

export const showNotificationError = (message, options = {}) => {
  showNotification({ type: "negative", message, ...options });
};

export const showNotificationWarning = (message, options = {}) => {
  showNotification({ type: "warning", message, ...options });
};

export const showNotificationInfo = (message, options = {}) => {
  showNotification({ type: "info", message, ...options });
};

