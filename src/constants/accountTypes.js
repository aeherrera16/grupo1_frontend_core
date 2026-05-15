export const ACCOUNT_TYPES = [
  { id: 1, name: 'Cuenta de Ahorros' },
  { id: 2, name: 'Cuenta Corriente' },
  { id: 3, name: 'Nómina' },
];

export const getAccountTypeName = (id) => {
  const type = ACCOUNT_TYPES.find(t => t.id === id);
  return type ? type.name : 'Desconocido';
};
