import { defineStore } from "pinia";

export const useSolicitudStore = defineStore("solicitudStore", {
  state: () => ({
    solicitudes: [],
    solicitud: {
      id: null,
      cliente_id: null,
      report_id: null,
      user_id: null,
      brand_motorcycle: "",
      model_motorcycle: "",
      year_motorcycle: null,
      first_motorcycle: "",
      use_motorcycle: "",
      invoice_motorcycle_value: null,
      percentage_down_payment: 0.2,
      insurance_payment: "",
      finance_term_months: "",
      income_source_type: [],
      income_proof: [],
      monthly_income: null,
      debt_pay_from_income: null,
      client_credit_history_description: "",
      clients_banks: [],
      clients_debt_banks: null,
      possible_guarantor: "",
      time_current_job: "",
      time_current_business: "",
      time_last_job: "",
      name_current_job: "",
      current_job_business_line: "",
      type_company_current_job: "Privada (No cotiza en bolsa de valores)",
      current_job_position: "",
      current_job_street_address: "",
      current_job_interior_number: "",
      current_job_zip_code: "",
      current_job_suburb_colonia: "",
      current_job_phone: "",
      name_last_job: "",
      last_job_phone: "",
      current_business_street_address: "",
      current_business_interior_number: "",
      current_business_zip_code: "",
      current_business_suburb_colonia: "",
      fam_reference_names: "",
      fam_reference_first_last_name: "",
      fam_reference_second_last_name: "",
      fam_reference_street_address: "",
      fam_reference_zip_code: "",
      fam_reference_relation: "",
      fam_reference_suburb_colonia: "",
      fam_reference_phone: "",
      friend_reference_names: "",
      friend_reference_first_last_name: "",
      friend_reference_second_last_name: "",
      friend_reference_street_address: "",
      friend_reference_zip_code: "",
      friend_reference_suburb_colonia: "",
      friend_reference_phone: "",
      friend_reference_time_knowing: "",
      beneficiary_names: "",
      beneficiary_last_names: "",
      time_to_buy_motorcycle: "",
      credit_preference: "",
      preferred_store_id: null,
      finva_user_id: null,
      registration_process: "onCreditWeb",
      utm_source: null,
      utm_medium: null,
      utm_campaign: null,
      utm_content: null,
      utm_term: null,
      other_url_params: null,
      ai_assisted: false,
      holding_page_url: null,
    },
  }),

  actions: {
    /**
     * Migrates old 'price' field to 'invoice_motorcycle_value' if needed
     */
    migratePriceField() {
      if (this.solicitud.price !== undefined && this.solicitud.price !== null && this.solicitud.invoice_motorcycle_value === null) {
        this.solicitud.invoice_motorcycle_value = this.solicitud.price;
      }
      // Remove old price field if it exists
      if (this.solicitud.price !== undefined) {
        delete this.solicitud.price;
      }
    },

    /**
     * Migrates old 'down_payment_amount' to 'percentage_down_payment' if needed
     */
    migrateDownPaymentField() {
      if (this.solicitud.down_payment_amount !== undefined && 
          this.solicitud.down_payment_amount !== null && 
          this.solicitud.invoice_motorcycle_value && 
          this.solicitud.invoice_motorcycle_value > 0) {
        // Convert absolute amount to percentage, rounded to 2 decimal places
        this.solicitud.percentage_down_payment = Math.round((this.solicitud.down_payment_amount / this.solicitud.invoice_motorcycle_value) * 100) / 100;
      }
      // Remove old down_payment_amount field if it exists
      if (this.solicitud.down_payment_amount !== undefined) {
        delete this.solicitud.down_payment_amount;
      }
    },

    /**
     * Migrates numeric 'finance_term_months' to string format if needed
     */
    migrateFinanceTermField() {
      if (typeof this.solicitud.finance_term_months === 'number') {
        this.solicitud.finance_term_months = `${this.solicitud.finance_term_months} meses`;
      }
    },

    /**
     * Sets motorcycle data from quote generator
     */
    setMotorcycleData(motorcycleData) {
      this.solicitud.motorcycle_id = motorcycleData.id;
      this.solicitud.brand_motorcycle = motorcycleData.brand;
      this.solicitud.model_motorcycle = motorcycleData.model;
      this.solicitud.year_motorcycle = motorcycleData.year;
      this.solicitud.invoice_motorcycle_value = motorcycleData.price;
      // Ensure old price field is removed
      if (this.solicitud.price !== undefined) {
        delete this.solicitud.price;
      }
    },

    /**
     * Sets quote parameters
     */
    setQuoteParams(quoteParams) {
      // Migrate old fields if they exist
      this.migratePriceField();
      this.migrateDownPaymentField();
      this.migrateFinanceTermField();
      
      this.solicitud.invoice_motorcycle_value = quoteParams.invoice_motorcycle_value;
      
      // Calculate percentage_down_payment as decimal (e.g., 0.2 for 20%), rounded to 2 decimal places
      if (quoteParams.invoice_motorcycle_value && quoteParams.invoice_motorcycle_value > 0 && quoteParams.downPayment) {
        this.solicitud.percentage_down_payment = Math.round((quoteParams.downPayment / quoteParams.invoice_motorcycle_value) * 100) / 100;
      } else {
        this.solicitud.percentage_down_payment = 0.2; // Default 20%
      }
      
      // Format finance_term_months as string (e.g., "12 meses", "24 meses")
      if (quoteParams.term) {
        this.solicitud.finance_term_months = `${quoteParams.term} meses`;
      } else {
        this.solicitud.finance_term_months = "";
      }
      
      this.solicitud.insurance_payment = quoteParams.insurancePaymentMethod;
    },

    /**
     * Sets store selection
     */
    setPreferredStore(storeId) {
      this.solicitud.preferred_store_id = storeId;
    },

    /**
     * Fetches all solicitudes for a client
     */
    async fetchSolicitudes(clientId) {
      try {
        const { $axios } = useNuxtApp();
        const response = await $axios.get("/loan/applications", {
          params: {
            client_id: clientId,
          },
        });
        this.solicitudes = response.data.applications;
      } catch (error) {
        console.error("Error fetching solicitudes:", error);
        throw error;
      }
    },

    /**
     * Gets a solicitud by ID
     */
    async getSolicitudById(id) {
      try {
        const { $axios } = useNuxtApp();
        const response = await $axios.get(`/loan/solicitud/${id}`);
        // Update the solicitud object with the response data
        this.solicitud = { ...this.solicitud, ...response.data };
        return this.solicitud;
      } catch (error) {
        console.error("Error fetching solicitud:", error);
        throw error;
      }
    },

    /**
     * Creates a new solicitud
     */
    async createSolicitud(flowProcess) {
      try {
        const { $axios } = useNuxtApp();
        const flowProcessStore = useFlowProcessStore();
        const { id, ...solicitud_data } = this.solicitud;

        // If we have motorcycle data stored in flowProcessStore, merge it
        const motorcycleData = flowProcessStore.getMotorcycleData?.();
        if (motorcycleData) {
          Object.assign(solicitud_data, motorcycleData);
          flowProcessStore.clearMotorcycleData?.(); // Clear after using
        }

        // Set flow_process and registration_process
        solicitud_data.flow_process = flowProcess;
        if (!solicitud_data.registration_process) {
          solicitud_data.registration_process = flowProcess;
        }

        // Migrate old fields before sending
        this.migratePriceField();
        this.migrateDownPaymentField();
        this.migrateFinanceTermField();

        // Prepare data for backend
        // The backend expects specific fields, so we need to structure the data
        const backendData = {
          cliente_id: solicitud_data.cliente_id,
          motorcycle_id: solicitud_data.motorcycle_id || null,
          user_id: solicitud_data.user_id,
          finva_user_id: solicitud_data.finva_user_id,
          status: solicitud_data.status || "pending",
          solicitud_data: {
            brand_motorcycle: solicitud_data.brand_motorcycle,
            model_motorcycle: solicitud_data.model_motorcycle,
            year_motorcycle: solicitud_data.year_motorcycle,
            invoice_motorcycle_value: solicitud_data.invoice_motorcycle_value,
            percentage_down_payment: solicitud_data.percentage_down_payment,
            finance_term_months: solicitud_data.finance_term_months,
            insurance_payment: solicitud_data.insurance_payment,
            // Include all other solicitud fields in solicitud_data JSON
            ...Object.fromEntries(
              Object.entries(solicitud_data).filter(
                ([key]) =>
                  ![
                    "id",
                    "cliente_id",
                    "motorcycle_id",
                    "user_id",
                    "finva_user_id",
                    "status",
                    "created_at",
                    "updated_at",
                  ].includes(key)
              )
            ),
          },
        };

        const response = await $axios.post("/loan/solicitud", backendData);
        // Update the entire solicitud object with the backend response
        // The backend returns { success, message, solicitud: {...}, email_notification }
        if (response.data && response.data.solicitud) {
          this.solicitud = { ...this.solicitud, ...response.data.solicitud };
        } else {
          // Fallback: if response structure is different, use the whole response
          this.solicitud = { ...this.solicitud, ...response.data };
        }
        return this.solicitud.id;
      } catch (error) {
        console.error("Error creating solicitud:", error);
        throw error;
      }
    },

    /**
     * Updates an existing solicitud
     */
    async updateSolicitud() {
      try {
        const { $axios } = useNuxtApp();
        if (!this.solicitud.id) {
          throw new Error("Solicitud ID is required for update");
        }

        // Migrate old fields before sending
        this.migratePriceField();
        this.migrateDownPaymentField();
        this.migrateFinanceTermField();

        // Prepare update data
        const { id, cliente_id, motorcycle_id, user_id, finva_user_id, created_at, updated_at, ...updateData } = this.solicitud;

        // Structure data similar to create
        const backendData = {
          status: updateData.status,
          solicitud_data: {
            brand_motorcycle: updateData.brand_motorcycle,
            model_motorcycle: updateData.model_motorcycle,
            year_motorcycle: updateData.year_motorcycle,
            invoice_motorcycle_value: updateData.invoice_motorcycle_value,
            percentage_down_payment: updateData.percentage_down_payment,
            finance_term_months: updateData.finance_term_months,
            insurance_payment: updateData.insurance_payment,
            // Include all other fields
            ...Object.fromEntries(
              Object.entries(updateData).filter(
                ([key]) => !["status"].includes(key)
              )
            ),
          },
        };

        const response = await $axios.put(
          `/loan/solicitud/${this.solicitud.id}`,
          backendData
        );
        // Update the solicitud with response data
        this.solicitud = { ...this.solicitud, ...response.data };
      } catch (error) {
        console.error("Error updating solicitud:", error);
        throw error;
      }
    },

    /**
     * Evaluates a solicitud and returns bank offers
     */
    async evaluateSolicitud() {
      try {
        const { $axios } = useNuxtApp();
        // If solicitud ID is missing, try to get it from cliente_id if available
        if (!this.solicitud.id) {
          if (this.solicitud.cliente_id) {
            // Try to fetch the most recent solicitud for this client
            await this.fetchSolicitudes(this.solicitud.cliente_id);
            if (this.solicitudes && this.solicitudes.length > 0) {
              // Use the most recent solicitud
              const mostRecent = this.solicitudes.sort((a, b) => 
                new Date(b.created_at) - new Date(a.created_at)
              )[0];
              this.solicitud = { ...this.solicitud, ...mostRecent };
            }
          }
          if (!this.solicitud.id) {
            throw new Error("Solicitud ID is required for evaluation");
          }
        }
        const response = await $axios.get(`/loan/evaluar/${this.solicitud.id}`);
        return response.data;
      } catch (error) {
        console.error("Error evaluating solicitud:", error);
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
    key: "solicitudStore",
  },
});

