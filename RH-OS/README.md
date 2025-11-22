# RH-OS - Sistema de Gestão de Recursos Humanos

Sistema desktop multiplataforma para gestão de RH com controle de usuários, perfis, cargos, funcionários e geração de folha de pagamento.

## 📋 Requisitos

- **MySQL 8.0+** (servidor de banco de dados)
- **Windows 10/11** ou **Linux** (Fedora 35+, Ubuntu 20.04+)

## 🚀 Instalação - Produção

### Windows

1. **Baixe o instalador**
   - Acesse a seção [Releases](../../releases)
   - Baixe `RH-OS-1.0.0-Setup.exe`

2. **Execute o instalador**
   - Duplo clique no arquivo `.exe`
   - Escolha o diretório de instalação
   - Aguarde a conclusão

3. **Configure o MySQL**
   - Abra o MySQL Workbench ou linha de comando
   - Execute o script de criação do banco:
   ```sql
   CREATE DATABASE rhos CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```
   - Importe o schema: `RHOS/src/main/database/database.sql`

4. **Configure as variáveis de ambiente**
   - Localize a pasta de instalação (padrão: `C:\Users\SeuUsuario\AppData\Local\Programs\RH-OS`)
   - Crie o arquivo `.env` com:
   ```env
   EXPRESS_PORT=4040
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=sua_senha
   DB_DATABASE=rhos
   JWT_SECRET=sua_chave_secreta_forte
   ```

5. **Inicie o aplicativo**
   - Use o atalho criado na área de trabalho ou menu iniciar

### Linux (Fedora)

```bash
# 1. Baixe o instalador
wget https://github.com/seu-usuario/rhos/releases/download/v1.0.0/RH-OS-1.0.0.AppImage

# 2. Torne executável
chmod +x RH-OS-1.0.0.AppImage

# 3. Instale o MySQL
sudo dnf install mysql-server
sudo systemctl enable --now mysqld

# 4. Configure o banco de dados
mysql -u root -p
CREATE DATABASE rhos CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
SOURCE /caminho/para/database.sql;
exit;

# 5. Configure variáveis de ambiente
mkdir -p ~/.config/rh-os
cat > ~/.config/rh-os/.env << EOF
EXPRESS_PORT=4040
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=sua_senha
DB_DATABASE=rhos
JWT_SECRET=$(openssl rand -base64 32)
EOF

# 6. Execute o aplicativo
./RH-OS-1.0.0.AppImage
```

### Linux (Ubuntu/Debian)

```bash
# 1. Baixe o instalador
wget https://github.com/seu-usuario/rhos/releases/download/v1.0.0/RH-OS-1.0.0.AppImage

# 2. Torne executável
chmod +x RH-OS-1.0.0.AppImage

# 3. Instale o MySQL
sudo apt update
sudo apt install mysql-server
sudo systemctl enable --now mysql

# 4. Configure o banco de dados
sudo mysql
CREATE DATABASE rhos CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
SOURCE /caminho/para/database.sql;
exit;

# 5. Configure variáveis de ambiente
mkdir -p ~/.config/rh-os
cat > ~/.config/rh-os/.env << EOF
EXPRESS_PORT=4040
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=sua_senha
DB_DATABASE=rhos
JWT_SECRET=$(openssl rand -base64 32)
EOF

# 6. Execute o aplicativo
./RH-OS-1.0.0.AppImage
```

## 👤 Primeiro Acesso

- **Usuário padrão:** `admin`
- **Senha padrão:** `admin123`

⚠️ **Importante:** Altere a senha após o primeiro login!

## 🔧 Tecnologias

### Frontend
- React 19.0.0
- TypeScript 5.7.2
- React Router DOM 7.9.4
- Electron 38.4.0

### Backend
- Node.js (integrado)
- Express 5.1.0
- MySQL2 3.15.3
- Knex.js 3.1.0
- JWT para autenticação
- bcrypt para senhas

## 📁 Estrutura do Sistema

- **Usuários**: Gerenciamento de usuários do sistema
- **Perfis**: Controle de permissões (RBAC)
- **Cargos**: Cadastro de cargos com salários
- **Funcionários**: Gestão completa de colaboradores
- **Folha de Pagamento**: Cálculo automático com descontos
- **Logs**: Auditoria de ações do sistema

## 🔒 Segurança

- Autenticação JWT com tokens seguros
- Senhas criptografadas com bcrypt
- Sistema de permissões baseado em perfis (RBAC)
- Logs de auditoria para todas ações críticas
- Validação de dados com Joi

## ⚙️ Configuração Avançada

### Porta do Servidor

Edite o arquivo `.env` e altere:
```env
EXPRESS_PORT=4040  # Altere para a porta desejada
```

### Conexão Remota MySQL

```env
DB_HOST=192.168.1.100  # IP do servidor MySQL remoto
DB_PORT=3306
DB_USER=usuario_remoto
DB_PASSWORD=senha_remota
```

## 🐛 Problemas Comuns

### Erro de conexão com banco de dados

```bash
# Verifique se o MySQL está rodando
# Windows
services.msc

# Linux
sudo systemctl status mysqld    # Fedora
sudo systemctl status mysql     # Ubuntu
```

### Porta 4040 já em uso

Altere `EXPRESS_PORT` no arquivo `.env` para outra porta disponível (ex: 4041, 4050).

### Permissões no Linux

```bash
# Conceda permissões de execução
chmod +x RH-OS-1.0.0.AppImage

# Instale FUSE se necessário
sudo dnf install fuse         # Fedora
sudo apt install libfuse2     # Ubuntu
```

## 📞 Suporte

Para problemas e sugestões, abra uma [Issue](../../issues) no GitHub.

## 📄 Licença

MIT License - Veja [LICENSE](LICENSE) para detalhes.

---

**Versão:** 1.0.0  
**Última atualização:** Novembro 2025
