export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePhone = (phone) => {
  const phoneRegex = /^(\+593|0)[0-9]{9,10}$/;
  return phoneRegex.test(phone.replace(/\s|-/g, ''));
};

export const validateCurrency = (amount) => {
  if (!amount) return false;
  const num = parseFloat(amount);
  return !isNaN(num) && num >= 0 && num <= 999999999.99;
};

export const validateIdentification = (type, number) => {
  if (!number) return false;

  switch (type) {
    case 'CEDULA':
      return /^\d{10}$/.test(number);
    case 'RUC':
      return /^\d{13}$/.test(number);
    case 'PASAPORTE':
      return /^[A-Z0-9]{6,10}$/.test(number);
    default:
      return false;
  }
};

export const validateUsername = (username) => {
  return username && username.length >= 3 && username.length <= 50;
};

export const validateRequired = (value) => {
  return value && value.toString().trim().length > 0;
};

export const validateMinLength = (value, min) => {
  return value && value.toString().length >= min;
};

export const validateMaxLength = (value, max) => {
  return !value || value.toString().length <= max;
};

export const validateDateFormat = (dateString) => {
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date);
};

export const validateFutureDate = (dateString) => {
  const date = new Date(dateString);
  return date > new Date();
};
