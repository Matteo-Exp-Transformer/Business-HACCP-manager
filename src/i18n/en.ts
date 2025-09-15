/**
 * English Translations - Foundation Pack v1
 * 
 * English dictionary for validation and UX messages
 * 
 * @version 1.0
 * @critical Architecture - i18n English
 */

export const en = {
  // ============================================================================
  // VALIDATION
  // ============================================================================
  validation: {
    required: 'Required field',
    minLength: 'Must be at least {{min}} characters',
    maxLength: 'Cannot exceed {{max}} characters',
    min: 'Must be at least {{min}}',
    max: 'Cannot exceed {{max}}',
    email: 'Invalid email',
    phone: 'Invalid phone number',
    url: 'Invalid URL',
    pattern: 'Invalid format',
    custom: 'Invalid value',
    
    // HACCP specific validations
    temperature: {
      tooLow: 'Temperature too low (min -50°C)',
      tooHigh: 'Temperature too high (max 50°C)',
      outOfRange: 'Temperature {{temp}}°C out of range {{min}}-{{max}}°C',
      invalid: 'Invalid temperature'
    },
    
    refrigerator: {
      nameRequired: 'Refrigerator name required',
      locationRequired: 'Location required',
      tempRequired: 'Target temperature required',
      categoriesMax: 'You can select a maximum of 5 categories'
    },
    
    staff: {
      nameRequired: 'Full name required',
      roleRequired: 'Role required',
      departmentRequired: 'Department required',
      emailInvalid: 'Invalid email',
      phoneInvalid: 'Invalid phone number'
    },
    
    inventory: {
      nameRequired: 'Product name required',
      categoryRequired: 'Category required',
      supplierRequired: 'Supplier required',
      quantityInvalid: 'Quantity cannot be negative',
      expiryDateInvalid: 'Invalid expiry date',
      expiryDatePast: 'Expiry date has already passed'
    },
    
    department: {
      nameRequired: 'Department name required',
      nameMinLength: 'Department name must be at least 2 characters',
      nameUnique: 'Department names must be unique'
    },
    
    supplier: {
      nameRequired: 'Supplier name required',
      categoryRequired: 'Category required',
      contactRequired: 'Contact required',
      documentationRequired: 'Documentation required'
    }
  },

  // ============================================================================
  // HACCP MESSAGES
  // ============================================================================
  haccp: {
    compliance: {
      compliant: 'Compliant',
      warning: 'Warning',
      critical: 'Critical',
      unknown: 'Unknown'
    },
    
    temperature: {
      status: {
        ok: 'OK',
        warning: 'Warning',
        danger: 'Danger'
      },
      tolerance: 'Tolerance ±{{tolerance}}°C',
      target: 'Target: {{target}}°C',
      current: 'Current: {{current}}°C',
      difference: 'Difference: {{diff}}°C'
    },
    
    categories: {
      incompatible: 'Incompatible categories selected',
      maxReached: 'Maximum limit of 5 categories reached',
      selectAtLeastOne: 'Select at least one category'
    },
    
    maintenance: {
      required: 'Maintenance required',
      overdue: 'Maintenance overdue',
      scheduled: 'Maintenance scheduled',
      completed: 'Maintenance completed'
    },
    
    alerts: {
      temperatureOutOfRange: 'Temperature out of range: {{temp}}°C vs {{target}}°C',
      productExpiring: 'Product expiring in less than 3 days',
      productExpired: 'Product expired',
      maintenanceOverdue: 'Maintenance overdue for {{item}}',
      noData: 'No data available'
    }
  },

  // ============================================================================
  // UX MESSAGES
  // ============================================================================
  ui: {
    buttons: {
      save: 'Save',
      cancel: 'Cancel',
      delete: 'Delete',
      edit: 'Edit',
      add: 'Add',
      close: 'Close',
      confirm: 'Confirm',
      retry: 'Retry',
      refresh: 'Refresh',
      back: 'Back',
      next: 'Next',
      finish: 'Finish'
    },
    
    messages: {
      success: 'Operation completed successfully',
      error: 'An error occurred',
      warning: 'Warning',
      info: 'Information',
      loading: 'Loading...',
      saving: 'Saving...',
      deleting: 'Deleting...',
      noData: 'No data available',
      noResults: 'No results found',
      tryAgain: 'Try again later'
    },
    
    forms: {
      required: 'Required fields',
      optional: 'Optional fields',
      draft: 'Draft saved',
      conflict: 'A form for {{entity}} is already open. Close it before opening another.',
      validation: 'Validating...',
      submitting: 'Submitting...',
      submitted: 'Form submitted successfully',
      error: 'Error submitting form'
    },
    
    navigation: {
      home: 'Home',
      conservation: 'Conservation Points',
      activities: 'Activities and Tasks',
      inventory: 'Inventory',
      labels: 'Label Management',
      ai: 'AI Assistant',
      settings: 'Settings and Data',
      management: 'Management'
    },
    
    status: {
      active: 'Active',
      inactive: 'Inactive',
      pending: 'Pending',
      completed: 'Completed',
      failed: 'Failed',
      cancelled: 'Cancelled'
    }
  },

  // ============================================================================
  // ERROR MESSAGES
  // ============================================================================
  errors: {
    general: {
      unexpected: 'Unexpected error',
      network: 'Network error',
      timeout: 'Request timeout',
      unauthorized: 'Unauthorized',
      forbidden: 'Access denied',
      notFound: 'Resource not found',
      server: 'Server error',
      validation: 'Validation error',
      unknown: 'Unknown error'
    },
    
    forms: {
      invalidData: 'Invalid data',
      missingFields: 'Missing fields',
      validationFailed: 'Validation failed',
      submitFailed: 'Submit failed',
      conflict: 'Form conflict'
    },
    
    data: {
      loadFailed: 'Data loading failed',
      saveFailed: 'Data saving failed',
      deleteFailed: 'Data deletion failed',
      syncFailed: 'Data sync failed',
      migrationFailed: 'Data migration failed'
    }
  },

  // ============================================================================
  // EDUCATIONAL MESSAGES
  // ============================================================================
  education: {
    haccp: {
      temperature: {
        importance: 'Correct temperatures are fundamental for food safety',
        monitoring: 'Regularly monitor temperatures to prevent contamination',
        range: 'Keep temperatures within HACCP specified ranges',
        tolerance: 'Respect temperature tolerances for each product type'
      },
      
      categories: {
        selection: 'Select only compatible categories',
        maxLimit: 'Do not exceed the limit of 5 categories per refrigerator',
        temperature: 'Consider temperature ranges of selected categories'
      },
      
      maintenance: {
        importance: 'Regular maintenance prevents failures and contamination',
        schedule: 'Respect the maintenance schedule for each refrigerator',
        records: 'Keep detailed records of all maintenance activities'
      },
      
      compliance: {
        monitoring: 'Continuous monitoring ensures HACCP compliance',
        alerts: 'Pay attention to temperature and maintenance alerts',
        documentation: 'Document all activities for inspections'
      }
    },
    
    forms: {
      oneAtTime: 'You can only open one form at a time to avoid conflicts',
      draft: 'Changes are automatically saved as draft',
      validation: 'Real-time validation prevents input errors'
    }
  },

  // ============================================================================
  // CONFIRMATION MESSAGES
  // ============================================================================
  confirmations: {
    delete: {
      refrigerator: 'Are you sure you want to delete this refrigerator?',
      temperature: 'Are you sure you want to delete this record?',
      staff: 'Are you sure you want to delete this staff member?',
      inventory: 'Are you sure you want to delete this product?',
      department: 'Are you sure you want to delete this department?',
      supplier: 'Are you sure you want to delete this supplier?'
    },
    
    save: {
      draft: 'Save changes as draft?',
      overwrite: 'Overwrite existing data?',
      continue: 'Continue without saving?'
    },
    
    form: {
      close: 'Close form without saving?',
      switch: 'Switch to another form? Unsaved changes will be lost.'
    }
  }
}
