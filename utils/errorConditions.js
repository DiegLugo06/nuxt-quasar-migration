// Error conditions for different pages - determines if errors should be skipped
export const errorConditions = {
  "id-validation": (error) => {
    // Skip 422 errors (validation errors) as they're handled in the UI
    return error?.response?.status === 422;
  },
  "curp-generator": (error) => {
    return error?.response?.status === 422;
  },
  "curp-validation": (error) => {
    return error?.response?.status === 422 || error?.response?.status === 400;
  },
};

