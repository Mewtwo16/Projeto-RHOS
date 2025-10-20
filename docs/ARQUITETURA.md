# Guia de Arquitetura – RH-OS

Este documento descreve, de ponta a ponta, como o projeto funciona: front (HTML/CSS/JS), Preload, IPC, camada Main do Electron, serviços de banco de dados e o esquema SQL. Foi escrito com base no código atual do repositório.

## Visão geral

- Aplicação desktop construída com Electron + TypeScript no processo Main, e HTML/CSS/JS puro no Renderer.
- O Main cria janelas (login e menu), expõe canais IPC e delega regras de negócio aos serviços (`src/services`).
- O Preload publica uma API segura em `window.api` para os renderers chamarem funções do backend sem acesso direto ao Node.
- A persistência usa Knex + MySQL (`mysql2`). O schema está em `src/database/database.sql`.

Estrutura essencial:
- `app/` – interface (HTML/CSS/JS) e renderers
- `src/` – código TypeScript (Main, Preload, serviços e DB)
- `src/database/database.sql` – definição do schema

## Build e execução

- `package.json` define `start`: compila TypeScript e inicia o Electron (`tsc && electron .`).
- `tsconfig.json` está com `module: commonjs`, `strict: true`, e as janelas usam `contextIsolation: true` e `nodeIntegration: false`.

## Fluxo de inicialização da aplicação

1) `app.whenReady()` (em `src/main.ts`)
- Testa a conexão com o banco: `db.raw('SELECT 1+1 AS result')`.
- Em sucesso, abre a janela de Login (`createLoginWindow()`), carregando `app/views/login/login.html`.

2) Login
- O renderer do login (`app/views/Renderer/login.js`) captura usuário e senha e chama `window.api.submitLogin(usuario, senha)`.
- O Preload (`src/preload.ts`) encaminha para o canal IPC `login:submit`.
- O Main trata `login:submit` chamando `auth.login()` (`src/services/auth.ts`).
  - Autentica consultando `users` por `login`, comparando `password_hash` com `bcrypt` e checando `status === 1`.
  - Em sucesso, retorna `{ success, message, userId }`.
- No Main, em caso de sucesso, guarda o `currentUserId`, abre a janela principal (menu) e fecha a janela de login.

3) Sessão
- O Main expõe `session:get`, que retorna `{ userId: currentUserId }`.
- O Preload usa este canal para incluir automaticamente `user_id` no envio de logs pelo método `logAction`.

## Janelas e navegação

- Janela de Login: `app/views/login/login.html` + `app/views/Renderer/login.js`.
- Janela principal (Menu): `app/views/menu/menu.html` + `app/views/Renderer/menu.js`.
  - O `menu.js` implementa um sistema de abas. Ao clicar, chama `window.api.getPage(caminho)` que retorna HTML do backend.
  - O conteúdo HTML retornado é injetado e, em seguida, o script correspondente é carregado dinamicamente (`../<caminho>.js`).

### Páginas/carregamento dinâmico
- `window.api.getPage('CadastroUsuarios/usuarios')` busca `app/views/CadastroUsuarios/usuarios.html` (via Main > FS) e injeta na aba.
- Exemplos de páginas carregadas: Cadastro de Usuários, Logs.

## API exposta no Preload (`window.api`)
Arquivo: `src/preload.ts`

- `submitLogin(usuario: string, senha: string)` → `login:submit`
- `getPage(pageName: string)` → `app:get-page`
- `addUser(dadosUsuario: any)` → `add-usuario`
- `getAllRoles()` → `roles:getAll`
- `logAction(entry: any)` → `log:acao`
  - Antes de enviar, tenta obter `userId` atual (`session:get`) e injeta em `entry.user_id`.
- `getLogs(limit?: number)` → `logs:obter`

Observação: A API é tipada via `src/types.ts` (interfaces de resposta e contrato do `IElectronAPI`).

## Canais IPC tratados no Main
Arquivo: `src/main.ts`

- `login:submit` (autentica; em sucesso guarda `currentUserId`, abre menu e fecha login).
- `session:get` (retorna `{ userId }`).
- `app:get-page` (lê e retorna o HTML de uma página de `app/views`).
- `add-usuario` (invoca `userService.addUser`).
- `roles:getAll` (invoca `roleService.getAllRoles`).
- `log:acao` (invoca `logService.writeLogs`).
- `logs:obter` (invoca `logService.listLogs`).

## Renderers e comportamento

### Login (`app/views/Renderer/login.js`)
- Captura usuário/senha e envia via `window.api.submitLogin`.
- Em erro, exibe a mensagem; em sucesso, o Main abre o menu.

### Menu (`app/views/Renderer/menu.js`)
- Implementa dropdowns e um gerenciador de abas.
- Ao abrir uma aba, busca a página via `window.api.getPage(caminho)` e injeta o HTML.
- Em seguida, carrega o script da página (`../<caminho>.js`) caso ainda não esteja no DOM.

### Cadastro de Usuários
- HTML: `app/views/CadastroUsuarios/usuarios.html` (formulário com campos e `<select id="cargo">`).
- JS: `app/views/CadastroUsuarios/usuarios.js`
  - Carrega cargos dinamicamente com `window.api.getAllRoles()` e preenche o `<select id="cargo">` (mantém a option placeholder).
  - Validações:
    - Campos obrigatórios não vazios
    - Senha = confirmação
    - CPF com 11 dígitos válidos (calcula dígitos verificadores)
  - Em sucesso, monta objeto com `nome/email/cpf/dataNascimento/usuario/senha/cargo` e envia via `window.api.addUser(dados)`.

### Logs
- HTML: `app/views/Logs/logs.html` (controles e contêiner de lista).
- JS: `app/views/Logs/logs.js`
  - Ao clicar em “Pesquisar”, chama `window.api.getLogs(200)`.
  - Renderiza cada log exibindo `username`, `action`, `resource`, `resource_id`, `created_at`, `details`.
  - Há hooks opcionais `onLogsUpdated`/`onLogNew` com `?.` (não implementados atualmente no Preload/Main, então não fazem nada por padrão).

## Serviços (camada de negócio)

### Autenticação – `src/services/auth.ts`
- `login(usuario, senha)`:
  - Busca por `users.login`.
  - Compara `password_hash` com `bcrypt.compare`.
  - Exige `status === 1`.
  - Em sucesso, retorna `{ success: true, message, userId }`.

### Usuários – `src/services/user.ts`
- `addUser(dadosUsuario)`:
  - Hash de senha com `bcrypt`.
  - Transação: insere em `users`, recupera `id` do cargo por `role_name`, insere em `role_users`.
  - Tenta registrar log com `logService.writeLogs({ action: 'create', resource: 'users', resource_id: novoUsuarioId, username, user_id })`.

### Cargos – `src/services/role.ts`
- `getAllRoles()` retorna `select * from roles`.

### Logs – `src/services/log.ts`
- `writeLogs(entry)`:
  - Insere em `audit_logs` com: `users_id`, `action`, `resource`, `resource_id`, `details` (JSON com `username` e/ou `details`).
  - Retorna `{ success: true }` ou `{ success: false, error }`.
- `listLogs(limit)`:
  - `select * from audit_logs order by created_at desc limit ?`.
  - Normaliza `details` (JSON) para extrair `username` e `details` (string) para a UI.
  - Retorna `{ success: true, data: normalized }`.

## Acesso ao Banco (Knex)

- `src/db/knexfile.ts` – carrega variáveis do `.env` com `dotenv.config({ path: path.resolve(__dirname, '../.env') })` e expõe configuração `development`.
- `src/db/db.ts` – instancia o `knex(configuration.development)` e exporta.

Observação: após transpilar para `dist`, `__dirname` muda. Garanta que o `.env` seja localizado corretamente conforme seu ambiente (atualmente o caminho relativo está definido para `../.env` a partir de `src/db`).

## Schema de Banco de Dados (resumo)

Arquivo: `src/database/database.sql` – Schema `RHOS` com as tabelas:

- `users` – usuários do sistema.
  - Campos relevantes: `id`, `full_name`, `email`, `login`, `password_hash`, `cpf`, `birth_date`, `status`, `creation_date`.
  - Restrições: `email`, `login`, `cpf` únicos.

- `roles` – papéis/cargos.
  - Campos: `id`, `role_name` (único), `description` (opcional).

- `role_users` – relação N:N usuário x cargo.
  - Chave composta (`users_id`, `roles_id`).

- `allowed` / `roles_allowed` – permissões (ainda não utilizadas no código atual).

- `audit_logs` – auditoria de ações.
  - Campos: `id`, `users_id` (NOT NULL), `action`, `resource` (opcional), `resource_id` (opcional), `details` (JSON opcional), `created_at` (default CURRENT_TIMESTAMP).
  - Nota: `users_id` é NOT NULL. Como o Preload injeta `user_id` quando possível, evite chamar `logAction` sem usuário autenticado se quiser garantir sucesso.

## Segurança e isolamento

- `BrowserWindow.webPreferences` usa `contextIsolation: true` e `nodeIntegration: false`.
- O Preload expõe uma API controlada (`window.api`) – boa prática para reduzir superfície de ataque.

## Dicas de uso e integração de logs no front

- Para registrar uma ação:
  ```js
  await window.api.logAction({
    action: 'update',
    resource: 'users',
    resource_id: 123,
    details: 'Alterou email do usuário 123',
    // username: 'admin' // opcional – pode ser incluído em details
  });
  ```
  O Preload tentará preencher `user_id` usando a sessão atual.

- Para listar logs:
  ```js
  const res = await window.api.getLogs(200);
  if (res.success) {
    // res.data é uma lista normalizada com created_at, username, action, resource, resource_id, details
  }
  ```

## Pontos em aberto/observações

- Eventos em tempo real na tela de logs (`onLogNew`/`onLogsUpdated`) ainda não estão implementados no Preload/Main (apenas ganchos opcionais no JS).
- O select de cargos já é preenchido dinamicamente; as opções estáticas no HTML são sobrescritas pelo JS ao carregar.
- `allowed`/`roles_allowed` não têm uso no fluxo atual; estão prontos para uma camada de autorização futura.

---

Este guia reflete o estado atual do código e deve ajudar a entender o fluxo ponta a ponta e os contratos entre camadas.
