import { defineStore } from "pinia";

export const useSolicitudStore = defineStore("solicitudStore", {
  state: () => ({
    solicitud: {
      id: null,
      cliente_id: null,
      motorcycle_id: null,
      brand_motorcycle: "",
      model_motorcycle: "",
      year_motorcycle: null,
      price: null,
      down_payment_amount: null,
      finance_term_months: null,
      insurance_payment_method: "",
      preferred_store_id: null,
      user_id: null,
      registration_mode: null,
      flow_process: "onCreditWeb",
    },
  }),

  actions: {
    /**
     * Sets motorcycle data from quote generator
     */
    setMotorcycleData(motorcycleData) {
      this.solicitud.motorcycle_id = motorcycleData.id;
      this.solicitud.brand_motorcycle = motorcycleData.brand;
      this.solicitud.model_motorcycle = motorcycleData.model;
      this.solicitud.year_motorcycle = motorcycleData.year;
      this.solicitud.price = motorcycleData.price;
    },

    /**
     * Sets quote parameters
     */
    setQuoteParams(quoteParams) {
      this.solicitud.down_payment_amount = quoteParams.downPayment;
      this.solicitud.finance_term_months = quoteParams.term;
      this.solicitud.insurance_payment_method = quoteParams.insurancePaymentMethod;
    },

    /**
     * Sets store selection
     */
    setPreferredStore(storeId) {
      this.solicitud.preferred_store_id = storeId;
    },

    /**
     * Resets the store
     */
    resetStore() {
      this.$reset();
    },
  },

  persist: {
    storage: piniaPluginPersistedstate.localStorage(),
    key: "solicitudStore",
  },
});

