export interface RespostaLogin {
    success: boolean;
    message: string;
}
export interface IElectronAPI {
    submitLogin: (usuario: string, senha: string) => Promise<RespostaLogin>;
}
//# sourceMappingURL=types.d.ts.map