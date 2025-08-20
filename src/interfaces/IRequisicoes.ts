// ARQUIVO: src/interfaces/IRequisicoes.ts
// VERSÃO FINAL E CORRIGIDA para resolver o erro de tipo 'never'

// Define a estrutura de um único Volume
export interface IVolume {
  id_requisicao?: number
  id_volume?: number;
  comprimento: number | null;
  largura: number | null;
  altura: number | null;
  peso: number | null;
}

// Define a estrutura de um único Item
export interface IItemRequisicao {
  id_item_requisicao: number;
  descricao_material_item_requisicao: string;
  unidade_material_item_requisicao: string;
  endereco_item_requisicao: string;
  quantidade_solicitada_item_requisicao: number;
  quantidade_atendida_item_requisicao: number | null;
} 

// Define a estrutura do Tipo de Envio de forma clara e exportável
export interface ITipoEnvio {
  id_tipo_envio_requisicao: number;
  descricao_tipo_envio_requisicao: string;
}

// Define a estrutura principal de uma Requisição
export interface IRequisicoes {
  id_requisicao: number;
  data_requisicao: string;
  requisitante_requisicao: string;
  numero_requisicao: number;
  situacao: {
    id_situacao_requisicao: number;
    descricao_situacao_requisicao: string;
  };
  observacao_requisicao: string | null;
  prioridade_requisicao: boolean;
  
  // CORREÇÃO: Usa a interface ITipoEnvio e garante que a propriedade é opcional
  // e pode ser nula, o que reflete a resposta da sua API.
  tipo_envio?: ITipoEnvio | null;
  
  // Mantém esta propriedade para compatibilidade com o PopUp
  id_tipo_envio_requisicao?: number | null;

  itens: IItemRequisicao[];
  volumes: IVolume[];
  checked?: boolean;
}