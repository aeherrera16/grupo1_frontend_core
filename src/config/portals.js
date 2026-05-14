export const portals = {
  operador: {
    label: 'Operador',
    description: 'Gestión de clientes, cuentas y credenciales, sin movimientos de caja.',
    startPath: '/operador',
    accent: 'bg-banker-blue',
    permissions: [
      'Consultar clientes por identificación',
      'Crear persona natural o jurídica',
      'Abrir cuentas con usuario Core',
      'Crear credenciales web',
      'Administrar estados de cuenta',
    ],
  },
  empresa: {
    label: 'Banca empresas',
    description: 'Pagos masivos, buzón SFTP y reportes del Switch.',
    startPath: '/empresa/cuentas',
    accent: 'bg-banker-navy',
    permissions: [
      'Carga manual de lotes CSV',
      'Procesamiento y validación de lotes',
      'Consulta de estados y comisiones',
      'Gestión de buzón SFTP',
    ],
  },
  personaNatural: {
    label: 'Persona natural',
    description: 'Consulta de saldo y transferencias propias.',
    startPath: '/persona-natural',
    accent: 'bg-banker-gold',
    permissions: [
      'Ingreso por credencial web',
      'Consulta de saldo disponible',
      'Transferencias desde cuenta propia',
    ],
  },
  cajero: {
    label: 'Cajero',
    description: 'Operación de ventanilla con depósitos, retiros y transferencias.',
    startPath: '/cajero',
    accent: 'bg-slate-700',
    permissions: [
      'Consultar cuenta por número',
      'Registrar crédito de depósito',
      'Registrar débito de retiro',
      'Registrar transferencia de ventanilla',
    ],
  },
};

export const menuByPortal = {
  operador: [
    { path: '/operador', label: 'Clientes y cuentas' },
    { path: '/operador/credenciales', label: 'Credenciales web' },
    { path: '/operador/cuentas', label: 'Estados de cuenta' },
    { path: '/operador/feriados', label: 'Feriados' },
  ],
  empresa: [
    { path: '/empresa/cuentas', label: 'Resumen de cuenta' },
    { path: '/empresa/pagos-masivos', label: 'Pagos masivos' },
    { path: '/empresa/sftp', label: 'Buzón SFTP' },
  ],
  personaNatural: [
    { path: '/persona-natural', label: 'Saldo y cuentas' },
    { path: '/persona-natural/transferencias', label: 'Transacciones' },
  ],
  cajero: [
    { path: '/cajero', label: 'Ventanilla' },
    { path: '/cajero/consulta', label: 'Consulta cuenta' },
  ],
};
