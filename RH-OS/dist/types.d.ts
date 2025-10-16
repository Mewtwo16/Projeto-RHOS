export interface RespostaLogin {
    success: boolean;
    message: string;
}
export interface IElectronAPI {
    submitLogin: (usuario: string, senha: string) => Promise<RespostaLogin>;
    adicionarUsuario: (dadosUsuario: any) => Promise<{
        success: boolean;
        message: string;
    }>;
}
//# sourceMappingURL=types.d.ts.map