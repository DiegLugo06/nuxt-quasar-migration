import { defineStore } from "pinia";

export const useReportStore = defineStore("reportStore", {
  state: () => ({
    report: {
      id: null,
      cliente_id: null,
    },
    loading: false,
    error: null,
  }),

  actions: {
    /**
     * Sends NIP to phone number via Kiban service
     * @param {string} phone - Phone number (format: +52XXXXXXXXXX)
     * @returns {Promise<number>} - NIP request ID
     */
    async sendNip(phone) {
      try {
        const { $axios } = useNuxtApp();
        // Format phone number: remove +52 and get last 10 digits
        const formattedPhone = `+${phone.replace(/\D/g, "")}`.slice(-10);
        
        const response = await $axios.post("/loan/send_nip_kiban", {
          method: "whatsapp",
          countryCode: "+52",
          to: formattedPhone,
        });
        
        // Response format: { response: { id: <nip_request_id> } }
        return response.data.response.id;
      } catch (error) {
        console.error("Error sending NIP:", error);
        throw error;
      }
    },

    /**
     * Validates NIP with Kiban service
     * @param {number} id - NIP request ID from sendNip
     * @param {string} nip - NIP code (6 digits)
     * @returns {Promise<number>} - Validated ID
     */
    async validateNip(id, nip) {
      try {
        const { $axios } = useNuxtApp();
        const response = await $axios.post("/loan/validate_nip_kiban", {
          id: id,
          nip: nip,
        });
        
        // Response format: { response: { id: <validated_id> } }
        return response.data.response.id;
      } catch (error) {
        console.error("Error validating NIP:", error);
        throw error;
      }
    },

    /**
     * Requests credit bureau report from Kiban service
     * @param {number} clienteId - Client ID
     * @param {object} body - Request body with BC parameters
     * @returns {Promise<number>} - Report ID
     */
    async requestBc(clienteId, body) {
      try {
        const { $axios } = useNuxtApp();
        const response = await $axios.post(`/loan/get_bc_kiban/${clienteId}`, body);
        
        // Response format: { report_id: <report_id>, cliente_id: <cliente_id> }
        this.report.id = response.data.report_id;
        this.report.cliente_id = response.data.cliente_id;
        return this.report.id;
      } catch (error) {
        console.error("Error requesting BC:", error);
        throw error;
      }
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
    key: "reportStore",
  },
});

