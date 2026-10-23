# Meu Financeiro — Frontend com cadastro

## Requisitos
- Node.js LTS instalado
- Backend Spring Boot iniciado em `http://localhost:8080`

## Configuração da API
O arquivo `.env` contém:

```env
VITE_API_URL=http://localhost:8080
```

Se a API estiver em outro endereço, altere esse valor e reinicie o Vite.

## Executar
Abra um terminal nesta pasta (`original-project`) e execute:

```bash
npm install
npm run dev
```

Abra o endereço local mostrado pelo Vite.

## Fluxo de autenticação
- Cadastro: `POST /user`
- Login: `POST /user/login`
- Campos do cadastro conforme `UserCreateDTO`: `name`, `email`, `password`
- O cadastro envia JSON e apresenta erros retornados pela API.
- Após cadastro bem-sucedido, o usuário é direcionado para `/login`.
- A tela de login mantém a integração de autenticação existente.

Exemplo do corpo enviado no cadastro:

```json
{
  "name": "Seu Nome",
  "email": "seu@email.com",
  "password": "suaSenha"
}
```

## Build de produção
```bash
npm run build
```

O build deve ser executado localmente depois da instalação das dependências; não foi validado nesta entrega.
