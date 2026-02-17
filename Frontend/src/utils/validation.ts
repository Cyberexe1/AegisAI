/**
 * Input Validation Utilities
 * 
 * Provides validation functions for form inputs before API calls
 */

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

/**
 * Validate prediction input data
 */
export function validatePredictionInput(data: {
  income: number;
  age: number;
  loan_amount: number;
  credit_history: string;
  employment_type: string;
  existing_debts: number;
}): ValidationResult {
  const errors: Record<string, string> = {};

  // Income validation
  if (!data.income || data.income <= 0) {
    errors.income = 'Income must be a positive number';
  } else if (data.income > 10000000) {
    errors.income = 'Income value seems unrealistic';
  }

  // Age validation
  if (!data.age || data.age < 18) {
    errors.age = 'Age must be at least 18';
  } else if (data.age > 100) {
    errors.age = 'Age must be less than 100';
  }

  // Loan amount validation
  if (!data.loan_amount || data.loan_amount <= 0) {
    errors.loan_amount = 'Loan amount must be a positive number';
  } else if (data.loan_amount > 100000000) {
    errors.loan_amount = 'Loan amount value seems unrealistic';
  }

  // Credit history validation
  const validCreditHistory = ['Good', 'Fair', 'Poor'];
  if (!data.credit_history || !validCreditHistory.includes(data.credit_history)) {
    errors.credit_history = 'Credit history must be Good, Fair, or Poor';
  }

  // Employment type validation
  const validEmploymentTypes = ['Full-time', 'Part-time', 'Self-employed', 'Unemployed'];
  if (!data.employment_type || !validEmploymentTypes.includes(data.employment_type)) {
    errors.employment_type = 'Invalid employment type';
  }

  // Existing debts validation
  if (data.existing_debts < 0) {
    errors.existing_debts = 'Existing debts cannot be negative';
  } else if (data.existing_debts > 100000000) {
    errors.existing_debts = 'Existing debts value seems unrealistic';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

/**
 * Validate email format
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate password strength
 */
export function validatePassword(password: string): ValidationResult {
  const errors: Record<string, string> = {};

  if (password.length < 8) {
    errors.password = 'Password must be at least 8 characters';
  }
  if (!/[A-Z]/.test(password)) {
    errors.password = 'Password must contain at least one uppercase letter';
  }
  if (!/[a-z]/.test(password)) {
    errors.password = 'Password must contain at least one lowercase letter';
  }
  if (!/[0-9]/.test(password)) {
    errors.password = 'Password must contain at least one number';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

/**
 * Sanitize string input (remove HTML tags, trim whitespace)
 */
export function sanitizeString(input: string): string {
  return input
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .trim(); // Remove leading/trailing whitespace
}

/**
 * Validate numeric input
 */
export function validateNumber(value: any, min?: number, max?: number): boolean {
  const num = Number(value);
  if (isNaN(num)) return false;
  if (min !== undefined && num < min) return false;
  if (max !== undefined && num > max) return false;
  return true;
}

/**
 * Validate required fields
 */
export function validateRequired(fields: Record<string, any>): ValidationResult {
  const errors: Record<string, string> = {};

  Object.entries(fields).forEach(([key, value]) => {
    if (value === null || value === undefined || value === '') {
      errors[key] = `${key} is required`;
    }
  });

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}
