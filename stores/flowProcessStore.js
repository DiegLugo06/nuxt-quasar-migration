import { defineStore } from "pinia";

export const useFlowProcessStore = defineStore("flowProcessStore", {
  state: () => ({
    flowProcess: "onCreditWeb",
    routes: {
      onCreditWeb: [
        "quote-generator",
        "confirm-store",
        "client-validation",
      ],
    },
  }),

  actions: {
    /**
     * Gets previous and next step based on current page
     */
    getPreviousAndNextStep(currentPage) {
      const flowProcess = this.flowProcess;
      const routes = this.routes[flowProcess];

      if (!routes) {
        return {
          previousStep: null,
          nextStep: null,
        };
      }

      const currentPageIndex = routes.indexOf(currentPage);

      if (currentPageIndex === -1) {
        return {
          previousStep: null,
          nextStep: null,
        };
      }

      return {
        previousStep:
          currentPageIndex > 0 ? routes[currentPageIndex - 1] : null,
        nextStep:
          currentPageIndex < routes.length - 1
            ? routes[currentPageIndex + 1]
            : null,
      };
    },

    resetStore() {
      this.$reset();
    },
  },

  persist: {
    storage: piniaPluginPersistedstate.localStorage(),
    key: "flowProcessStore",
  },
});

