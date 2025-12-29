import { defineStore } from "pinia";

// Shared steps for onCreditWeb process
const COMMON_STEPS_WEB = [
  "client-validation",
  "confirm-data",
  "validate-applications",
  "buro-credito-request",
  "credit-approval-result",
  "complete-solicitud-data", // Combined page replacing personal-info, income-source, job-description, references-confirmation
  "my-documents",
  "credit-approval-result",
];

export const useFlowProcessStore = defineStore("flowProcessStore", {
  state: () => ({
    flowProcess: "onCreditWeb",
    motorcycleData: null,
    routes: {
      onCreditWeb: [
        "quote-generator",
        "personal-quote",
        "confirm-store",
        ...COMMON_STEPS_WEB,
      ],
    },
    holdingStorePage: "Ferbel",
    header: null,
    fromIframe: false,
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

    async syncMotorcycleData() {
      const solicitudStore = useSolicitudStore();

      // Only proceed if we have motorcycle data and we're in onCreditWeb flow
      if (this.motorcycleData && this.flowProcess === "onCreditWeb") {
        try {
          // Update solicitud with motorcycle data
          if (solicitudStore.solicitud.id) {
            Object.assign(solicitudStore.solicitud, this.motorcycleData);
            await solicitudStore.updateSolicitud();
          } else {
            Object.assign(solicitudStore.solicitud, this.motorcycleData);
          }

          // Clear the temporary motorcycle data after syncing
          this.clearMotorcycleData();
        } catch (error) {
          throw error;
        }
      }
    },

    setMotorcycleData(data) {
      this.motorcycleData = data;
    },

    getMotorcycleData() {
      return this.motorcycleData;
    },

    clearMotorcycleData() {
      this.motorcycleData = null;
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

