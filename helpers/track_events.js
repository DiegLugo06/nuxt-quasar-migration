export const trackEvent = (posthog, eventName, properties = {}) => {
  if (posthog && typeof posthog.capture === 'function') {
    posthog.capture(eventName, properties);
  }
};

// User logs in or signs up successfully
export const trackLoginSignup = (posthog, email, phone) => {
  trackEvent(posthog, "login_signup", {
    email,
    phone,
    timestamp: new Date().toISOString(),
  });
};

// User updates or confirms personal data successfully
export const trackUpdateConfirmPersonalData = (posthog) => {
  trackEvent(posthog, "update_confirm_personal_data", {
    timestamp: new Date().toISOString(),
  });
};

// User fills income and credit details successfully
export const trackFillIncomeCreditDetails = (posthog) => {
  trackEvent(posthog, "fill_income_credit_details", {
    timestamp: new Date().toISOString(),
  });
};

// User fills work details successfully
export const trackFillWorkDetails = (posthog) => {
  trackEvent(posthog, "fill_work_details", {
    timestamp: new Date().toISOString(),
  });
};

// User fills reference details successfully
export const trackFillReferenceDetails = (posthog) => {
  trackEvent(posthog, "fill_reference_details", {
    timestamp: new Date().toISOString(),
  });
};

// User submits and instantiates solicitud successfully
export const trackSendSolicitud = (posthog, solicitudId, flowProcess) => {
  trackEvent(posthog, "send_solicitud", {
    solicitudId,
    flowProcess,
    timestamp: new Date().toISOString(),
  });
};

// User queries and inserts BC report successfully
export const trackQueryInsertBC = (posthog, reportId) => {
  trackEvent(posthog, "query_insert_bc", {
    reportId,
    timestamp: new Date().toISOString(),
  });
};

// User gets next finva user assigned
export const trackGetNextFinvaUserAssigned = (posthog, finvaUserId, email, phone) => {
  trackEvent(posthog, "get_next_finva_user_assigned", {
    finvaUserId,
    email,
    phone,
    timestamp: new Date().toISOString(),
  });
};

