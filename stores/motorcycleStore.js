import { defineStore } from "pinia";

// ========================
// Utility Functions
// ========================

/**
 * Formats a number into MXN currency format.
 * @param {number} value - The numeric value to format.
 * @returns {string} The formatted currency string.
 */
const formatCurrency = (value) => {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
  }).format(Number(value));
};

/**
 * Converts a formatted currency string back into a number.
 * @param {string} formattedValue - The formatted currency string.
 * @returns {number} The numeric value.
 */
const revertCurrencyToNumber = (formattedValue) => {
  return parseFloat(formattedValue.replace(/[^\d.-]/g, "")) || 0;
};

// ========================
// Motorcycle Store
// ========================

export const useMotorcycleStore = defineStore("motorcycleStore", {
  state: () => ({
    motorcycles: [], // Stores the list of motorcycles fetched from the API
    loading: false, // Loading state for API requests
    error: null, // Error state for API requests
    form: {
      brand: "", // Selected motorcycle brand
      model: "", // Selected motorcycle model
      year: null, // Selected year of manufacture
      price: "", // Price of the selected motorcycle
      downPayment: "20", // Down payment percentage (default: 20%)
    },
    motorcycleId: null,
    motorycleHashCode: null,
    hasDiscount: null,
    typeDiscount: null,
    valueDiscount: null,
    brandId: null,
    brandName: null,
  }),

  actions: {
    // ========================
    // Motorcycle Data Management
    // ========================

    /**
     * Fetches the list of available motorcycles from the API.
     * Stores the response in `motorcycles`.
     * Supports filtering by holding parameter (e.g., Sfera).
     */
    async fetchMotorcycles() {
      const nuxtApp = useNuxtApp();
      const axios = nuxtApp.$axios || nuxtApp.$axios;
      
      // Get user_id from route or query if available
      let userId = null;
      let holding = null;
      if (process.client) {
        const route = useRoute();
        userId = route.query.user_id || null;
        holding = route.query.holding || null;
      }
      
      // Build URL with parameters
      let url = "/product/motorcycle_models";
      const params = new URLSearchParams();
      if (userId) {
        params.append('user_id', userId);
      }
      if (holding) {
        params.append('holding', holding);
      }
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
      
      const response = await axios.get(url);
      this.motorcycles = response.data.models;
    },
    /**
     * Fetches the details of motorycle, discount, status and value from the API.
     * return the response.
     */
    async fecthDetailsMotorcycle() {
      const nuxtApp = useNuxtApp();
      const axios = nuxtApp.$axios;

      const response = await axios.get(
        `/product/decode_discount_hash/${this.motorycleHashCode}`
      );
      return response.data;
    },
    async fetchQuotes(motorcycleData) {
      const nuxtApp = useNuxtApp();
      const axios = nuxtApp.$axios;
      const response = await axios.post("/quote/quote", motorcycleData);
      return response.data;
    },
    async fetchBrandName(brandId) {
      const nuxtApp = useNuxtApp();
      const axios = nuxtApp.$axios;
      const response = await axios.get(`/product/get_brand_by_id/${brandId}`);
      return response.data.name;
    },
    /**
     * Validates brand consistency between brandName, form.brand, and solicitud.brand_motorcycle.
     * Resets stores if brands don't match.
     * @returns {boolean} True if brands are consistent, false if reset was needed.
     */
    validateBrandConsistency() {
      // Simplified version without solicitud store dependency
      const brandName = this.brandName;
      const formBrand = this.form.brand;
      
      // Normalize brands for comparison (case-insensitive, trim whitespace)
      const normalizeBrand = (brand) => 
        brand ? String(brand).trim().toLowerCase() : "";
      
      const normalizedBrandName = normalizeBrand(brandName);
      const normalizedFormBrand = normalizeBrand(formBrand);
      
      // Check if brandName exists and doesn't match form.brand
      const brandMismatch = 
        normalizedBrandName && 
        normalizedBrandName !== "" &&
        normalizedFormBrand && 
        normalizedFormBrand !== "" && 
        normalizedBrandName !== normalizedFormBrand;
      
      if (brandMismatch) {
        // Clear motorcycle selection but keep motorcycles array
        this.motorcycleId = null;
        this.brandName = null;
        this.brandId = null;
        this.form.brand = "";
        this.form.model = "";
        this.form.year = null;
        this.form.price = "";
        
        return false;
      }
      
      return true;
    },
    resetStore() {
      this.$reset();
    },
  },

  getters: {
    // ========================
    // Select Options Getters
    // ========================

    /**
     * Retrieves a list of unique motorcycle brands.
     * Filters out null/undefined brands and returns sorted list.
     * @returns {Array} List of brands.
     */
    brands: (state) => {
      const uniqueBrands = [
        ...new Set(
          state.motorcycles
            .map((item) => item.brand)
            .filter((brand) => brand != null && brand !== "")
        ),
      ];
      return uniqueBrands.sort((a, b) => a.localeCompare(b));
    },

    /**
     * Retrieves a list of models based on the selected brand.
     * @param {string} brand - The selected brand.
     * @returns {Array} List of models for the brand.
     */
    modelsByBrand: (state) => (brand) =>
      [
        ...new Set(
          state.motorcycles
            .filter((item) => item.brand === brand)
            .map((item) => item.model)
        ),
      ].sort((a, b) => a.localeCompare(b)),

    /**
     * Retrieves a list of years based on the selected model.
     * @param {string} model - The selected model.
     * @returns {Array} List of years for the model.
     */
    yearsByModel: (state) => (model) =>
      [
        ...new Set(
          state.motorcycles
            .filter((item) => item.model === model)
            .map((item) => item.year)
        ),
      ].sort((a, b) => a - b),

    // ========================
    // Motorcycle Details
    // ========================

    /**
     * Retrieves the motorcycle based on id.
     * @returns {Object|null} Motorcycle details or null if not found.
     */
    motorcycleById: (state) => {
      const result = state.motorcycles.find(
        (item) => item.id === state.motorcycleId
      );
      return result;
    },

    /**
     * Retrieves the brand of the motorcycle based on id.
     * @returns {Object|null} Motorcycle details or null if not found.
     */
    brandMotorcycleById: (state) => {
      const result = state.motorcycles.find(
        (item) => item.id === state.motorcycleId
      );
      return result ? result.brand : null;
    },

    /**
     * Retrieves the price of a motorcycle based on model and year.
     * Updates the form's price field.
     * @returns {string|null} Formatted motorcycle price or null if not found.
     */
    priceByModelAndYear: (state) => {
      const result = state.motorcycles.find(
        (item) =>
          item.model === state.form.model && item.year === state.form.year
      );
      if (result) {
        state.form.price = result.price; // Update form.price directly
        return formatCurrency(result.price);
      }
      return null;
    },

    /**
     * Retrieves the ID of a motorcycle based on brand, model, and year.
     * @returns {number|null} Motorcycle ID or null if not found.
     */
    idMotorcycle: (state) => {
      if (!state.motorcycles || state.motorcycles.length === 0) {
        return null;
      }
      const result = state.motorcycles.find(
        (item) =>
          item.model === state.form.model &&
          item.year === state.form.year &&
          item.brand === state.form.brand
      );
      if (result) {
        state.motorcycleId = result.id;
      }
      return result ? result.id : null;
    },

    /**
     * Retrieves the numeric price of the selected motorcycle.
     * @returns {number} The motorcycle price as a number.
     */
    motorcyclePrice: (state) => state.form.price || 0,

    // ========================
    // Financial Calculations
    // ========================

    /**
     * Calculates the down payment amount based on the price and percentage.
     * @returns {string} Formatted down payment amount.
     */
    calculatedDownPayment: (state) => {
      const price = state.form.price || 0;
      const downPaymentPercentage = parseInt(state.form.downPayment) || 0;
      const downPaymentAmount = (price * downPaymentPercentage) / 100;

      return downPaymentAmount > 0
        ? formatCurrency(downPaymentAmount.toFixed(2))
        : "";
    },
  },
  persist: {
    storage: piniaPluginPersistedstate.localStorage(),
    key: "motorcycleStore",
  },
});
