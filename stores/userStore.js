import { defineStore } from "pinia";

// ========================
// User Store
// ========================

export const useUserStore = defineStore("userStore", {
  state: () => ({
    user: {
      id: null, // Unique user identifier
      name: "", // First name
      second_name: "", // Middle name (optional)
      first_last_name: "", // First last name
      second_last_name: "", // Second last name
      email: "", // Email address
      phone_number: "", // Phone number
      role_id: null, // User role identifier
    },
    finvaAgent: {
      id: null,
      name: "",
      second_name: "",
      first_last_name: "",
      second_last_name: "",
      email: "",
      phone_number: "",
    },
    finvaAgentStores: [], // Stores assigned to the finvaAgent
    registration_mode: "", // Registration mode
    stores: [], // List of stores associated with the user
    loading: false, // Loading state for API requests
    error: null, // Error state for API requests
  }),

  actions: {
    // ========================
    // User Information
    // ========================

    /**
     * Fetches user details from the API.
     */
    async getUserInfo() {
      const { $axios } = useNuxtApp();
      this.loading = true;
      this.error = null;
      try {
        const response = await $axios.get(
          `/advisor/get_advisor_details/${this.user.id}`
        );
        const { advisor, stores } = response.data;
        const {
          id,
          name,
          second_name,
          first_last_name,
          second_last_name,
          email,
          phone_number,
          role_id,
        } = advisor;

        // Update user information
        this.user = {
          id,
          name,
          second_name,
          first_last_name,
          second_last_name,
          email,
          phone_number,
          role_id
        };

        // Update stores list
        this.stores = stores || [];
      } catch (err) {
        this.error =
          err.response?.data?.message || "Error fetching user details";
      } finally {
        this.loading = false;
      }
    },
    /**
     * Fetches stores with optional filters
     * @param {Object} filters - Key-value pairs of filters (e.g., { razon_social: 'ferbel', marca: 'yamaha' })
     * @returns {Promise} Axios response
     */
    async getStoresByFilters(filters = {}, holdingStorePage) {
      const { $axios } = useNuxtApp();

      // Convert filters object to query params
      const params = new URLSearchParams();

      for (const [key, value] of Object.entries(filters)) {
        if (value !== null && value !== undefined && value !== "") {
          params.append(key, value);
        }
      }
      params.append("holding", holdingStorePage);

      const response = await $axios.get("/advisor/get_stores", { params });
      return response.data;
    },
    /**
     * Get next asesor assinged by clocks method from the API
     */
    async getNextUserAssigned(storeId, clientEmail, clientPhone) {
      const { $axios } = useNuxtApp();
      const { data } = await $axios.get("/advisor/get_next_user", {
        params: {
          store_id: storeId,
          client_email: clientEmail,
          client_phone: clientPhone,
        },
      });
      this.user.id = data.id;
      this.user.name = data.name;
      this.user.second_name = data.second_name;
      this.user.first_last_name = data.first_last_name;
      this.user.second_last_name = data.second_last_name;
      this.user.email = data.email;
      this.user.phone_number = data.phone_number;
      return this.user.id;
    },
    /**
     * Get next asesor assinged by clocks method from the API
     */
    async getNextFinvaUserAssigned(client_id = null) {
      const { $axios } = useNuxtApp();
      
      // Get holdingStorePage from flowProcessStore if available (only on client side)
      let holdingStore = null;
      if (process.client) {
        const flowStore = useFlowProcessStore();
        const route = useRoute();
        const holdingFromRoute = route.query.holding;
        const holdingFromStore = flowStore.holdingStorePage;
        holdingStore = holdingFromRoute || holdingFromStore;
      }
      
      let params = {};
      if (client_id !== null && client_id !== undefined) {
        params.client_id = client_id;
      }
      
      // Add holdingStore parameter if available
      if (holdingStore) {
        params.holdingStore = holdingStore;
      }
      
      const { data } = await $axios.get("/advisor/get_next_finva_user", { params });
      this.finvaAgent = data;
      return data.id;
    },

    /**
     * Get finva user details by ID (similar to getUserInfo but for finva agents)
     */
    async getFinvaUserDetails(finvaUserId) {
      const { $axios } = useNuxtApp();
      this.loading = true;
      this.error = null;
      try {
        const response = await $axios.get(
          `/advisor/get_advisor_details/${finvaUserId}`
        );
        const { advisor, stores } = response.data;
        const {
          id,
          name,
          second_name,
          first_last_name,
          second_last_name,
          email,
          phone_number,
        } = advisor;

        // Update finvaAgent information
        this.finvaAgent = {
          id,
          name,
          second_name,
          first_last_name,
          second_last_name,
          email,
          phone_number
        };

        // Update finvaAgent stores
        this.finvaAgentStores = stores || [];

        return this.finvaAgent;
      } catch (err) {
        this.error =
          err.response?.data?.message || "Error fetching finva user details";
        // Fallback to default values if API fails
        this.finvaAgent = {
          id: finvaUserId,
          name: "Nuestro asesor",
          email: "asesor@finva.com.mx",
          phone_number: "+52 (55) 3043 5463",
          second_name: "",
          first_last_name: "",
          second_last_name: ""
        };
        this.finvaAgentStores = [];
        return this.finvaAgent;
      } finally {
        this.loading = false;
      }
    },
  },

  getters: {
    // ========================
    // Store Data
    // ========================

    /**
     * Retrieves a list of unique brands from the user's associated stores.
     * @returns {Array} List of unique brands.
     */
    brands: (state) => [...new Set(state.stores.map((store) => store.brand))],
  },
  persist: {
    storage: piniaPluginPersistedstate.localStorage(),
    key: "userStore",
  },
});

