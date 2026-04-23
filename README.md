# 💊 Projeto Remédio API

[![Node.js Version](https://img.shields.io/badge/node-%3E%3D%2014.0.0-brightgreen)](https://nodejs.org/)
[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](https://opensource.org/licenses/ISC)

Uma API robusta desenvolvida em **Node.js** para o gerenciamento centralizado de medicamentos e controle de usuários. O sistema conta com autenticação segura e diferentes níveis de acesso.

---

## 🚀 Funcionalidades

* **Autenticação Segura:** Login utilizando **JWT (JSON Web Token)**.
* **Segurança de Dados:** Criptografia de senhas com **Bcrypt**.
* **Controle de Acesso:** Gerenciamento por perfis de usuário (Hierarquia).
* **Persistência:** Integração com banco de dados **MySQL** via pool de conexões.
* **Arquitetura:** Design de API RESTful escalável.

---

## 🛠️ Tecnologias e Ferramentas

O projeto foi construído utilizando o seguinte ecossistema:

* **Runtime:** [Node.js](https://nodejs.org/)
* **Framework Web:** [Express](https://expressjs.com/)
* **Banco de Dados:** [MySQL](https://www.mysql.com/)
* **Segurança:** JWT & Bcrypt
* **Middleware:** CORS

---

## 📂 Estrutura do Projeto

```text
REMEDIO PROJETO/
├── server.js                 # Ponto de entrada da aplicação
├── package.json              # Manifesto e dependências
├── banco_de_dados_remedio.sql # Script de inicialização SQL
└── .gitignore                # Arquivos ignorados pelo Git
```

---

## ⚙️ Configuração e Instalação

Siga os passos abaixo para rodar o projeto localmente:

### 1. Clonar e Instalar
```bash
# Clone o repositório
git clone https://github.com/seu-usuario/seu-repositorio.git

# Acesse a pasta
cd REMEDIO-PROJETO

# Instale as dependências
npm install
```

### 2. Banco de Dados
Certifique-se de ter um servidor MySQL rodando. Execute o script `banco_de_dados_remedio.sql` para criar as tabelas necessárias.

### 3. Variáveis de Ambiente
Crie um arquivo `.env` na raiz do projeto com as seguintes chaves:
```env
DB_HOST=localhost
DB_USER=seu_usuario
DB_PASS=sua_senha
DB_NAME=remedio_db
JWT_SECRET=sua_chave_mestra
```

### 4. Executar
```bash
npm start
```
A API estará disponível em: `http://localhost:3000`

---

## 🔐 Segurança e Autenticação

Para acessar as rotas protegidas, é necessário enviar o token gerado no login através do Header:

| Header | Valor |
| :--- | :--- |
| **Authorization** | `Bearer SEU_TOKEN_AQUI` |

---

## 📌 Recomendações Importantes

1.  **Produção:** Nunca exponha senhas ou segredos JWT em repositórios públicos.
2.  **Git:** O diretório `node_modules` está configurado para ser ignorado. Caso não esteja, adicione-o ao seu `.gitignore`.
3.  **Ambiente:** Utilize sempre variáveis de ambiente para dados sensíveis.

---

## 👨‍💻 Autor

**Matheus de Souza Soares - RA: N064943**  
**Henrique Barros - RA: r010082**  
**Leonardo Diogo Buzelin Julio - RA: G790GB9**  
**Luan Martiniano Rocha - RA: R029EB8**

---
## 👨‍🏫 Orientação / Professor
* **Andre Muniz** ([@agdelira](https://github.com/agdelira))
---

## 📄 Licença

Este projeto está sob a licença **ISC**.