export interface IUsuario {
  id_usuario: number;
  nome_usuario: string;
  email_usuario: string;
  cpf_usuario: string;
  data_cadastro_usuario: string;
  situacao: {
    descricao_situacao_usuario: string;
  };
  // Propriedades usadas apenas no formulário de edição
  ativo?: boolean;
  senha?: string;
}