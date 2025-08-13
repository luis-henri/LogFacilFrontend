export const PERMISSIONS = {
  ADMIN: 'Administrator - Geral',
  ATENDIMENTO: 'ALMOX - Atendimento',
  SEPARACAO: 'ALMOX - Separação',
  // ... outros perfis
};

export const hasPermission = (userPerfil: string, requiredPerfis: string[]) => {
  return requiredPerfis.includes(userPerfil);
};