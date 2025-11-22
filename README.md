# RH-OS - Sistema de Gestão de Recursos Humanos

Sistema desktop multiplataforma para gestão completa de RH, desenvolvido com Electron, React e Node.js.

## 🚀 Tecnologias

- **Frontend:** React 19 + TypeScript + Electron 38
- **Backend:** Node.js + Express 5 + MySQL
- **Build:** electron-builder (Windows, Linux, macOS)

## 📋 Funcionalidades

- ✅ Autenticação JWT com controle de permissões (RBAC)
- ✅ Gestão de Usuários, Perfis e Cargos
- ✅ Cadastro completo de Funcionários
- ✅ Cálculo automático de Folha de Pagamento
- ✅ Sistema de Logs e Auditoria
- ✅ Backend integrado com auto-start

## 🔧 Como Rodar

### Pré-requisitos
- Node.js 18+
- MySQL 8.0+

### Instalação

```bash
# Clone o repositório
git clone https://github.com/Mewtwo16/Projeto-RHOS.git
cd Projeto-RHOS/RH-OS

# Instale as dependências
npm install

# Configure o banco de dados
# Importe o arquivo: src/main/database/database.sql no MySQL

# Configure as variáveis de ambiente
# Copie .env.example para .env e ajuste as credenciais do MySQL

# Execute em modo desenvolvimento
npm run dev

# Build para produção
npm run build:win    # Windows
npm run build:linux  # Linux
npm run build:mac    # macOS
```

## 🔐 Acesso Padrão

- **Usuário:** admin
- **Senha:** admin123

## 📄 Licença

MIT License - Livre para uso pessoal e comercial.
