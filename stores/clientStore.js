import { defineStore } from "pinia";

export const useClientStore = defineStore("clientStore", {
  state: () => ({
    client: {
      id: null,
      name: "",
      second_name: "",
      first_last_name: "",
      second_last_name: "",
      phone: "",
      email: "",
      carrier: "",
      born_state: "",
      birth_date: "",
      economic_dependants: 0,
      sex: "",
      rfc: "",
      curp: "",
      street_address: "",
      zip_code: "",
      suburb_colonia: "",
      ciudad: "",
      estado: "",
      time_living_there: "0 years 0 months",
      id_type: "",
      id_number: "",
      id_expiration_date: "",
      marital_status: "",
      level_studies: "",
      profesion: "",
      housing_status: "",
      interior_number: "",
    },
    loading: false,
    error: null,
    neighborhoods: [],
    idUploaded: false,
    idValidated: null,
  }),

  actions: {
    // ========================
    // RFC-Related Actions
    // ========================
    /**
     * Generates an RFC based on client data.
     */
    async generateRfc() {
      const { $axios } = useNuxtApp();
      try {
        const response = await $axios.post("/generate_rfc", {
          nombres: `${this.client.name}${
            this.client.second_name ? " " + this.client.second_name : ""
          }`,
          apellidoPaterno: this.client.first_last_name,
          apellidoMaterno: this.client.second_last_name,
          fechaNacimiento: this.client.birth_date.replace(/\//g, "-"),
        });
        this.client.rfc = response.data?.rfc?.response?.rfc;
      } catch (error) {
        this.error = error.response?.data?.message || error.message;
      }
    },

    /**
     * Validates the client's RFC.
     * @returns {str} Validation status.
     */
    async validateRfc() {
      const { $axios } = useNuxtApp();
      const response = await $axios.post("/validate_rfc", {
        rfcs: [{ rfc: this.client.rfc }],
      });
      return response.data.status;
    },

    // ========================
    // Address-Related Actions
    // ========================
    /**
     * Validates the client's ZIP code and updates city and state.
     * @returns {str} Validation status.
     */
    async validateZipCode() {
      const { $axios } = useNuxtApp();
      const response = await $axios.post("/validate_zip_code", {
        zip_code: this.client.zip_code,
      });
      const { ciudad, estado } = response.data.response;
      this.client.ciudad = ciudad;
      this.client.estado = estado;
      return response.data.status;
    },

    /**
     * Fetches neighborhoods based on the client's ZIP code.
     * @returns {Array} List of neighborhoods.
     */
    async getNeighborhoods(zip_code = this.client.zip_code) {
      const { $axios } = useNuxtApp();
      // FastAPI endpoint: /api/client/get_neighborhoods/{zip_code}
      // baseURL already includes /api, so we use /client/get_neighborhoods/{zip_code}
      const response = await $axios.get(`/client/get_neighborhoods/${zip_code}`);
      this.neighborhoods = response.data.neighborhoods;
      return response.data.neighborhoods;
    },

    // ========================
    // Client Registration & Update
    // ========================
    /**
     * Registers a new client.
     * @returns {string} The ID of the registered client.
     */
    async registerClient(user_id, flowProcess, finvaUserId) {
      const { $axios } = useNuxtApp();
      const { id, ...client_data } = this.client;
      client_data.user_id = user_id;
      client_data.flow_process = flowProcess;
      client_data.finva_user_id = finvaUserId;
      const response = await $axios.post("/cliente", client_data);
      this.client.id = response.data.cliente_id;
      return this.client.id;
    },

    async registerClientWithoutReport(
      user_id,
      id_motorcycle,
      payment_method,
      preferred_store_id,
      time_to_buy_motorcycle,
      flowProcess,
      registration_mode
    ) {
      const { $axios } = useNuxtApp();
      const client_data = {
        email: this.client.email,
        phone: this.client.phone,
        curp: this.client.curp,
        name: this.client.name,
        second_name: this.client.second_name,
        first_last_name: this.client.first_last_name,
        second_last_name: this.client.second_last_name,
        user_id: user_id,
        id_motorcycle: id_motorcycle,
        payment_method: payment_method,
        preferred_store_id: preferred_store_id,
        time_to_buy_motorcycle: time_to_buy_motorcycle,
        registration_process: flowProcess,
        registration_mode: registration_mode,
      };

      try {
        const response = await $axios.post(
          "/add_client_without_report",
          client_data
        );

        const { client_id, solicitud_id } = response.data;
        if (!client_id) {
          throw new Error("No cliente_id in response");
        }

        this.client.id = client_id;
        return { clientId: client_id, solicitudId: solicitud_id };
      } catch (error) {
        throw error;
      }
    },

    /**
     * Updates the client's data.
     * @returns {Object} Updated client data.
     */
    async updateClientData(user_id) {
      const { $axios } = useNuxtApp();
      const { id, ...client_data } = this.client;
      client_data.user_id = user_id;
      const response = await $axios.put(
        `/cliente/${this.client.id}`,
        client_data
      );
      return response.data;
    },

    // ========================
    // Client Validation
    // ========================
    /**
     * Validates the client's phone and email.
     * @returns {Object} Validation response.
     */
    async validatePhoneAndEmail() {
      const { $axios } = useNuxtApp();
      const response = await $axios.get("/client/validate_phone", {
        params: {
          email: this.client.email,
          phone: this.client.phone,
        },
      });
      return response.data;
    },

    /**
     * Fetches client data based on email and phone.
     * @returns {Object} Client data, report, and INE file.
     */
    async getClient() {
      const { $axios } = useNuxtApp();
      const response = await $axios.get("/client/validate_client", {
        params: {
          email: this.client.email,
          phone: this.client.phone,
        },
      });
      const { client, report, files, id, id_details, has_purchases } =
        response.data;
      this.client = client;
      this.idUploaded = id;
      return {
        client_id: client.id,
        report: report,
        files: files,
        id: id,
        id_details: id_details,
        has_purchases: has_purchases,
      };
    },

    // ========================
    // Carrier
    // ========================
    /**
     * Fetches the carrier based on the client's phone number.
     * @returns {string} The carrier name.
     */
    async getCarrier() {
      const { $axios } = useNuxtApp();
      const response = await $axios.get("/client/get_carrier", {
        params: {
          phone: this.client.phone,
        },
      });
      this.client.carrier = response.data.carrier;
      return this.client.carrier;
    },

    // ========================
    // File Upload
    // ========================
    /**
     * Uploads a file for the client.
     * @param {string} type - The type of file (e.g., "officialId", "incomeProof").
     * @param {File} file - The file to upload.
     */
    async uploadFile(type, file, validated = false) {
      const { $axios } = useNuxtApp();
      const formData = new FormData();
      
      // Validate file has a name property
      if (!file || !file.name || typeof file.name !== 'string') {
        throw new Error('El archivo seleccionado no es válido. Por favor, selecciona otro archivo.');
      }
      
      const fileExtension = file.name.split(".").pop();
      const newFileName = type.endsWith("Client")
        ? `${type}.${fileExtension}`
        : `${type}Client.${fileExtension}`;
      const renamedFile = new File([file], newFileName, { type: file.type });

      formData.append("client_id", this.client.id);
      formData.append("file_type", type);
      formData.append("file", renamedFile);
      if (validated) {
        formData.append("validated", true);
      }

      await $axios.post("/client/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        params: {
          type: type,
        },
      });
    },
    async ocrExtraction(formData) {
      const { $axios } = useNuxtApp();
      const response = await $axios.post("/client/extract-validation-ine", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const { is_valid, body_validate_ine, curp, back_info } = response.data;
      return { is_valid, body_validate_ine, curp, back_info };
    },
    async validateIneInformation(body) {
      const { $axios } = useNuxtApp();
      const response = await $axios.post("/client/validate-lista-nominal", body, {
        headers: { "Content-Type": "application/json" },
      });
      const { client_data, status } = response.data;
      return { client_data, status };
    },
    async validateCurpInformation(body) {
      const { $axios } = useNuxtApp();
      const response = await $axios.post("/client/validate-curp", body, {
        headers: { "Content-Type": "application/json" },
      });

      // Handle new error response format
      if (response.data.success === false) {
        // This will throw an error that will be caught by the calling function
        throw {
          response: {
            status: 400,
            data: response.data,
          },
        };
      }

      const { client_data } = response.data;
      return client_data;
    },
    async generateCurp(body) {
      const { $axios } = useNuxtApp();
      const response = await $axios.post("/client/generate-curp", body, {
        headers: { "Content-Type": "application/json" },
      });
      const { client_data } = response.data;
      return client_data;
    },

    /**
     * Registers a new unknown client in the system.
     * @param {string} flow_process - The flow process identifier
     * @param {string} user_id - The user identifier
     * @param {string} motorcycle_id - The motorcycle identifier
     * @param {Object} motorcycle_data - The motorcycle data
     * @returns {Object} Response from the registration
     */
    async registerUnknownClient(
      flow_process,
      user_id,
      motorcycle_id,
      motorcycle_data,
      holding_page_url
    ) {
      const { $axios } = useNuxtApp();
      const response = await $axios.post("/client/unknown-client", {
        phone: this.client.phone,
        email: this.client.email,
        flow_process,
        user_id,
        motorcycle_id,
        motorcycle_data,
        holding_page_url
      });
      return response.data;
    },

    // ========================
    // Send Redirect URL
    // ========================
    /**
     * Sends a redirect URL to the client for uploading documents later.
     * @param {string|number} user_id - The user identifier
     * @param {string} motorcycle - The motorcycle model
     * @param {string} solicitud_id - The ID of the solicitud
     */
    async sendRedirectUrl(user_id, motorcycle, solicitud_id, flow_process) {
      const { $axios } = useNuxtApp();
      const params = new URLSearchParams({
        redirected: "true",
        email: this.client.email,
        phone: this.client.phone,
        solicitud_id: solicitud_id,
        user_id: user_id,
        flow_process: flow_process,
      });
      const body = {
        client_name:
          `${this.client.name} ${this.client.first_last_name}`.trim(),
        mototorycle: motorcycle,
        email: this.client.email,
        params: params.toString(),
      };
      await $axios.post("/client/send-redirect-url", body);
    },

    /**
     * Notifies the salesman that the client's INE validation failed.
     * @param {string} user_email - The email of the user (salesman)
     * @param {string} solicitud_id - The ID of the solicitud
     */
    async notifyValidationFailed(user_email, solicitud_id) {
      const { $axios } = useNuxtApp();
      const params = new URLSearchParams({
        client_id: this.client.id,
        user_email: user_email,
        solicitud_id: solicitud_id,
      });
      const url = `/client/notify-validation-failed?${params.toString()}`;
      await $axios.get(url);
    },

    /**
     * Notifies the salesman that the client has uploaded documents.
     * @param {string} client_name - The name of the client
     * @param {string} user_email - The email of the user (salesman)
     * @param {Array} files - The list of uploaded files
     * @param {string} solicitud_id - The ID of the solicitud
     */
    async notifyFilesUploaded(client_name, user_email, files, solicitud_id) {
      const { $axios } = useNuxtApp();
      const body = {
        client_name: client_name,
        user_email: user_email,
        files: files,
        solicitud_id: solicitud_id,
      };
      await $axios.post("/client/notify-files-uploaded", body);
    },

    /**
     * Performs a complete validation of client credentials.
     * @param {FormData} formData - The form data containing client credentials (for automatic validation)
     * @param {string} validationType - The type of validation ('automatic' or 'manual')
     * @param {Object} [manualData] - JSON data for manual validation
     * @returns {Object} The validation response data
     */
    async validateCredentialComplete(
      formData,
      validationType = "automatic",
      manualData = null
    ) {
      const { $axios } = useNuxtApp();

      const config = {
        params: { validation_type: validationType },
      };

      if (validationType === "manual") {
        // For manual validation, send JSON data
        config.headers = { "Content-Type": "application/json" };
        const response = await $axios.post(
          "/client/validate-credential-complete",
          manualData,
          config
        );
        return response.data;
      } else {
        // For automatic validation, send FormData
        config.headers = { "Content-Type": "multipart/form-data" };
        const response = await $axios.post(
          "/client/validate-credential-complete",
          formData,
          config
        );
        return response.data;
      }
    },

    resetStore() {
      // Store phone & email before resetting
      const preservedData = {
        phone: this.client.phone,
        email: this.client.email,
      };

      // Reset store to initial state
      this.$reset();

      // Restore phone & email
      this.client.phone = preservedData.phone;
      this.client.email = preservedData.email;
    },
  },
  persist: {
    storage: piniaPluginPersistedstate.localStorage(),
    key: "clientStore",
  },
});
