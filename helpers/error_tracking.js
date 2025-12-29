/**
 * Error tracking helper functions
 */

export const trackApiError = (error, pageName, operation) => {
  // This can be extended to send errors to analytics services
  console.error(`API Error on ${pageName} - ${operation}:`, error);
  
  // You can add PostHog or other analytics tracking here
  // if (process.client && window.posthog) {
  //   window.posthog.capture('api_error', {
  //     page: pageName,
  //     operation: operation,
  //     error_message: error.message,
  //     error_status: error.response?.status,
  //   });
  // }
};

