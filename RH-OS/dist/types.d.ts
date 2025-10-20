export interface RespostaLogin {
    success: boolean;
    message: string;
    userId?: number;
}
export interface RespostaPagina {
    success: boolean;
    content: string;
}
export interface Cargo {
    id: number;
    role_name: string;
    description?: string;
}
export interface RespostaRoles {
    success: boolean;
    message?: string;
    data: Cargo[];
}
export interface IElectronAPI {
    submitLogin: (usuario: string, senha: string) => Promise<RespostaLogin>;
    getPage: (pageName: string) => Promise<RespostaPagina>;
    addUser: (dadosUsuario: any) => Promise<{
        success: boolean;
        message: string;
    }>;
    addRole: (dadosCargo: any) => Promise<{
        success: boolean;
        message: string;
    }>;
    getAllRoles: () => Promise<RespostaRoles>;
    searchUsers: (filters?: {
        field?: string;
        value?: string;
    }) => Promise<{
        success: boolean;
        data: any[];
        message?: string;
    }>;
    searchRoles: (filters?: {
        field?: string;
        value?: string;
    }) => Promise<{
        success: boolean;
        data: Cargo[];
        message?: string;
    }>;
    logAction: (entry: any) => Promise<{
        success: boolean;
    } | any>;
    getLogs: (limit?: number) => Promise<{
        success: boolean;
        data?: any[];
    } | any>;
}
//# sourceMappingURL=types.d.ts.map