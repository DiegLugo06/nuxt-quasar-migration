/**
 * Composable for handling iframe navigation and state management
 * Solves the problem of cookie/storage loss when the app is embedded in an iframe
 */

export const useIframeNavigation = () => {
  /**
   * Checks if the app is running inside an iframe
   */
  const isInIframe = () => {
    if (process.client) {
      try {
        return window.self !== window.top;
      } catch (e) {
        return true; // If we can't access window.top due to CORS, we're definitely in an iframe
      }
    }
    return false;
  };

  /**
   * Checks if the current page was opened from an iframe
   */
  const isFromIframe = () => {
    if (process.client) {
      const urlParams = new URLSearchParams(window.location.search);
      return urlParams.get('fromIframe') === 'true';
    }
    return false;
  };

  /**
   * Saves the current state to localStorage before opening in a new tab
   */
  const saveStateForNewTab = (stateData) => {
    if (!process.client) return;
    
    try {
      const dataWithTimestamp = {
        ...stateData,
        timestamp: Date.now(),
        returnToIframe: true,
      };
      
      localStorage.setItem('pendingRegistration', JSON.stringify(dataWithTimestamp));
    } catch (error) {
      console.error("Error saving state:", error);
    }
  };

  /**
   * Restores state from localStorage
   * Returns null if no valid state is found
   */
  const restoreStateFromStorage = () => {
    if (!process.client) return null;
    
    try {
      const savedState = localStorage.getItem('pendingRegistration');
      if (savedState) {
        const stateData = JSON.parse(savedState);
        
        // Check if state is not too old (less than 1 hour)
        const oneHour = 60 * 60 * 1000;
        if (Date.now() - stateData.timestamp < oneHour) {
          return stateData;
        } else {
          // Clean up old state
          localStorage.removeItem('pendingRegistration');
        }
      }
    } catch (error) {
      console.error("Error restoring state:", error);
    }
    return null;
  };

  /**
   * Clears the saved registration state
   */
  const clearSavedState = () => {
    if (!process.client) return;
    
    try {
      localStorage.removeItem('pendingRegistration');
    } catch (error) {
      console.error("Error clearing state:", error);
    }
  };

  /**
   * Saves completion state and provides instructions to return to iframe
   */
  const markRegistrationComplete = (completionData = {}) => {
    if (!process.client) return;
    
    try {
      const completeState = {
        ...completionData,
        completed: true,
        timestamp: Date.now(),
      };
      
      localStorage.setItem('registrationComplete', JSON.stringify(completeState));
      
      // Clear pending registration
      clearSavedState();
    } catch (error) {
      console.error("Error marking registration complete:", error);
    }
  };

  /**
   * Gets the iframe origin URL if available
   */
  const getIframeOrigin = () => {
    if (!process.client) return null;
    
    const savedState = restoreStateFromStorage();
    return savedState?.iframeOrigin || null;
  };

  /**
   * Opens a URL in a new tab with state preservation
   */
  const openInNewTab = (url, stateData = {}) => {
    if (!process.client) return false;
    
    try {
      // Save current state
      saveStateForNewTab(stateData);
      
      // Construct URL with fromIframe flag
      const urlObj = new URL(url, window.location.href);
      
      // Open in new tab
      window.open(urlObj.toString(), '_blank');
      
      return true;
    } catch (error) {
      console.error("Error opening new tab:", error);
      return false;
    }
  };

  /**
   * Sends a message to the parent iframe or opener window
   */
  const sendMessageToParent = (message) => {
    if (!process.client) return;
    
    try {
      // Priority: send to opener first (most common for our use case)
      if (window.opener && !window.opener.closed) {
        window.opener.postMessage(message, '*');
      }
      
      // Also try parent if in iframe
      if (window.parent && window.parent !== window) {
        window.parent.postMessage(message, '*');
      }
    } catch (error) {
      console.error("Error sending message to parent:", error);
    }
  };

  /**
   * Notifies parent and closes current tab after completion
   */
  const notifyCompletionAndClose = (completionData = {}, closeDelay = 2000) => {
    if (!process.client) return;
    
    // Mark as complete
    markRegistrationComplete(completionData);
    
    // Send message to parent
    sendMessageToParent({
      type: 'registrationComplete',
      data: completionData,
    });
    
    // Close tab after delay
    setTimeout(() => {
      window.close();
      
      // If window.close() doesn't work (some browsers block it)
      // show a message to the user
      setTimeout(() => {
        if (!window.closed) {
          alert('Registro completado. Puedes cerrar esta pestaña y volver a la anterior.');
        }
      }, 100);
    }, closeDelay);
  };

  return {
    isInIframe,
    isFromIframe,
    saveStateForNewTab,
    restoreStateFromStorage,
    clearSavedState,
    markRegistrationComplete,
    getIframeOrigin,
    openInNewTab,
    sendMessageToParent,
    notifyCompletionAndClose,
  };
};

