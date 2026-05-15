export const DEBIT_SUBTYPES = [
  { code: 'MASS_PAYMENT', name: 'Pago masivo' },
  { code: 'ATM_WITHDRAW', name: 'Retiro por cajero' },
  { code: 'PURCHASE', name: 'Compra en comercio' },
  { code: 'COMISION', name: 'Cobro de comisión' },
  { code: 'TAX_PAYMENT', name: 'Pago de impuestos' },
];

export const CREDIT_SUBTYPES = [
  { code: 'PAYROLL', name: 'Abono de nómina' },
  { code: 'DEPOSIT', name: 'Depósito por ventanilla' },
  { code: 'TRANSFER_IN', name: 'Transferencia recibida' },
];

export const getDebitSubtypeName = (code) => {
  const subtype = DEBIT_SUBTYPES.find(s => s.code === code);
  return subtype ? subtype.name : code;
};

export const getCreditSubtypeName = (code) => {
  const subtype = CREDIT_SUBTYPES.find(s => s.code === code);
  return subtype ? subtype.name : code;
};
