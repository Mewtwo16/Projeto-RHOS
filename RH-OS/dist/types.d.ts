export interface RespostaLogin {
    success: boolean;
    message: string;
}
export interface RespostaPagina {
    success: boolean;
    content: string;
}
export interface Role {
    id: number;
    nome_role: string;
    descricao?: string;
}
export interface RespostaRoles {
    success: boolean;
    message?: string;
    data: Role[];
}
export interface IElectronAPI {
    submitLogin: (usuario: string, senha: string) => Promise<RespostaLogin>;
    getPage: (pageName: string) => Promise<RespostaPagina>;
    adicionarUsuario: (dadosUsuario: any) => Promise<{
        success: boolean;
        message: string;
    }>;
    getAllRoles: () => Promise<RespostaRoles>;
    logAction?: (entry: any) => Promise<{
        success: boolean;
    } | any>;
    getLogs?: (limit?: number) => Promise<{
        success: boolean;
        data?: any[];
    } | any>;
    registrarLog?: (entrada: any) => Promise<{
        success: boolean;
    } | any>;
    obterLogs?: (limit?: number) => Promise<{
        success: boolean;
        data?: any[];
    } | any>;
}
//# sourceMappingURL=types.d.ts.map