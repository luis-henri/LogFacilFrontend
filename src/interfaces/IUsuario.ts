export interface IPerfil {
    id_perfil: number;
    nome_perfil: string;
}

export interface IUsuario {
    id_usuario: number;
    nome_usuario: string;
    email_usuario: string;
    cpf_usuario: string;
    data_cadastro_usuario: string;
    situacao: {
        descricao_situacao_usuario: string;
    };
    // A propriedade perfis agora é um array
    perfis: {
        perfil: IPerfil;
    }[];
}