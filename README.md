# RPG Loja - Sistema de Gerenciamento de Lojas

Sistema completo de gerenciamento de lojas RPG com suporte a subdomínios, carrinho de compras e geração de notas fiscais com código de validação.

## 🚀 Funcionalidades

- **Gestão de Lojas**: Crie e gerencie múltiplas lojas com subdomínios personalizados
- **Subdomínios**: Cada loja possui seu próprio subdomínio (ex: minhaloja.localhost:3000)
- **Gestão de Produtos**: Adicione produtos com imagens, descrições e preços
- **Carrinho de Compras**: Sistema completo de carrinho para os clientes
- **Checkout**: Processo de finalização de compra com coleta de dados do cliente
- **Nota Fiscal**: Geração automática de NF com código único
- **Validação**: Sistema de validação de notas fiscais baseado em matemática específica
- **Personalização**: Cada loja pode ter sua cor de tema personalizada

## 📋 Requisitos

- Node.js (v14 ou superior)
- NPM (v6 ou superior)

## 🔧 Instalação

1. Clone o repositório:
```bash
git clone <repository-url>
cd loja
```

2. Instale as dependências:
```bash
npm install
```

3. Inicie o servidor:
```bash
npm start
```

O servidor estará rodando em `http://localhost:3000`

## 🎯 Como Usar

### Painel Administrativo

1. Acesse `http://localhost:3000/admin/stores`
2. Crie uma nova loja clicando em "Nova Loja"
3. Preencha:
   - Nome da loja
   - Subdomínio (apenas letras minúsculas, números e hífens)
   - Cor do tema
4. Adicione produtos à loja clicando em "Produtos"

### Loja (Frontend)

Para acessar uma loja, você precisa configurar subdomínios localmente:

1. **Windows**: Edite `C:\Windows\System32\drivers\etc\hosts`
2. **Linux/Mac**: Edite `/etc/hosts`

Adicione estas linhas:
```
127.0.0.1  minhaloja.localhost
127.0.0.1  outralooja.localhost
```

Então acesse `http://minhaloja.localhost:3000` (substitua "minhaloja" pelo subdomínio da sua loja)

### Fluxo de Compra

1. **Navegue** pelos produtos na página principal da loja
2. **Adicione** produtos ao carrinho
3. **Visualize** o carrinho em `/cart`
4. **Finalize** a compra em `/checkout`
5. **Receba** a nota fiscal com código de validação
6. **Valide** a nota fiscal em `/validate` usando o código da NF e o código de validação

## 🔐 Sistema de Validação de NF

O código de validação é gerado usando uma fórmula matemática específica:

```javascript
validationCode = (soma_ASCII_do_codigo_NF * valor_total_em_centavos) % 999999
```

O código é formatado com 6 dígitos (com zeros à esquerda se necessário).

## 📁 Estrutura do Projeto

```
loja/
├── config/
│   └── database.js          # Configuração do banco de dados SQLite
├── controllers/
│   ├── storeController.js           # Controle de lojas (admin)
│   ├── productController.js         # Controle de produtos (admin)
│   └── storeController-frontend.js  # Controle da loja frontend
├── models/
│   ├── Store.js            # Modelo de loja
│   ├── Product.js          # Modelo de produto
│   ├── Cart.js             # Modelo de carrinho
│   └── Invoice.js          # Modelo de nota fiscal
├── middleware/
│   └── subdomain.js        # Middleware de detecção de subdomínio
├── routes/
│   ├── admin.js            # Rotas administrativas
│   └── store.js            # Rotas da loja
├── views/
│   ├── admin/              # Views do painel admin
│   └── store/              # Views da loja
├── public/
│   ├── css/                # Estilos CSS
│   └── uploads/            # Imagens de produtos
├── index.js                # Arquivo principal
└── package.json
```

## 💾 Banco de Dados

O sistema usa SQLite com as seguintes tabelas:

- **stores**: Armazena informações das lojas
- **products**: Produtos de cada loja
- **carts**: Carrinhos de compras
- **cart_items**: Itens nos carrinhos
- **invoices**: Notas fiscais geradas
- **invoice_items**: Itens das notas fiscais

## 🛠️ Tecnologias Utilizadas

- **Node.js**: Runtime JavaScript
- **Express**: Framework web
- **EJS**: Template engine
- **SQLite3**: Banco de dados
- **Multer**: Upload de arquivos
- **Express-session**: Gerenciamento de sessões
- **UUID**: Geração de IDs únicos

## 📝 Rotas Principais

### Admin
- `GET /admin/stores` - Lista todas as lojas
- `GET /admin/stores/new` - Formulário de nova loja
- `POST /admin/stores` - Cria nova loja
- `GET /admin/stores/:id/products` - Lista produtos da loja
- `POST /admin/stores/:storeId/products` - Cria novo produto

### Loja (Frontend)
- `GET /` - Página principal com produtos
- `POST /cart/add/:productId` - Adiciona produto ao carrinho
- `GET /cart` - Visualiza carrinho
- `GET /checkout` - Página de checkout
- `POST /checkout` - Processa compra e gera NF
- `GET /invoice/:invoiceId` - Visualiza nota fiscal
- `GET /validate` - Formulário de validação
- `POST /validate` - Valida nota fiscal

## 🎨 Personalização

Cada loja pode ter:
- Nome personalizado
- Subdomínio único
- Cor de tema customizada
- Logo próprio (recurso expansível)

## 🔒 Segurança

- **Validação de entrada de dados**: Todos os inputs são validados
- **Proteção contra SQL injection**: Uso de prepared statements
- **Sessões seguras**: Configuráveis via variáveis de ambiente
- **Validação de uploads de imagens**: Apenas formatos permitidos
- **Rate Limiting**: Proteção contra abuso de requisições (100 req/15min)
- **Códigos de validação**: Algoritmo matemático impossível de falsificar

### ⚠️ Considerações de Produção

Para uso em produção, considere implementar:
- CSRF protection para formulários
- HTTPS/TLS obrigatório
- Autenticação para o painel administrativo
- Backup automático do banco de dados
- Logging de auditoria
- Variáveis de ambiente para configurações sensíveis

## 📄 Licença

ISC

## 👥 Autor

Sistema desenvolvido para gerenciamento de lojas RPG.

