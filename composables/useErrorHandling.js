export const useErrorHandling = () => {
  const { $posthog } = useNuxtApp();
  const clientStore = useClientStore();
  const { client } = clientStore;

  const notifySentry = (errorMessage, options = {}) => {
    const {
      pageName = 'unknown',
      shouldSkipError = () => false,
      additionalContext = {}
    } = options;

    // Check if we should skip this error based on page-specific conditions
    if (shouldSkipError && shouldSkipError(errorMessage)) {
      return;
    }

    let distinctId = null;
    let sessionId = null;

    try {
      // Safely get PostHog instance and IDs
      if ($posthog) {
        const posthog = $posthog();
        distinctId = posthog?.get_distinct_id?.() || null;
        sessionId = posthog?.get_session_id?.() || null;
      }
    } catch (posthogError) {
      console.error('Error getting PostHog data:', posthogError);
    }

    // Log error to console (Sentry integration can be added later)
    console.error(`[${pageName}] Error:`, {
      error: errorMessage,
      error_details: {
        response: errorMessage.response?.data,
        status: errorMessage.response?.status,
        url: errorMessage.config?.url,
        method: errorMessage.config?.method,
        message: errorMessage.message,
        name: errorMessage.name,
      },
      client_info: {
        phone: client?.phone,
        email: client?.email,
      },
      posthog_info: {
        distinct_id: distinctId,
        session_id: sessionId
      },
      ...additionalContext
    });
  };

  return {
    notifySentry
  };
};

