# Delicatto Doceria

PWA de pedidos online para a **Delicatto Doceria** — confeitaria artesanal especializada em brigadeiros, trufas e boxes especiais.

🔗 **[delicatto-eta.vercel.app](https://delicatto-eta.vercel.app)**

---

## Funcionalidades

### Loja (cliente)
- Cardápio com filtro por categoria e fotos dos produtos
- Modal de produto com ingredientes, alérgenos e prazo de preparo
- Escolha de sabores por quantidade (ex: caixa de 4 = 2× Chocolate, 1× Morango, 1× Limão)
- Carrinho com resumo do pedido
- Checkout com dados do cliente e opções de entrega/retirada
- Cálculo automático de frete via CEP (Franca-SP e Cássia-MG)
- Pagamento via **Pix** (chave + instruções + envio de comprovante) ou **Cartão** (link via WhatsApp)
- Instalável como app no celular (PWA)

### Painel Admin
- Login seguro via Supabase Auth
- Dashboard com métricas de pedidos e receita
- Gerenciamento de produtos com upload de fotos
- Cadastro de sabores por produto com controle de slots
- Acompanhamento de pedidos com atualização de status
- Histórico de clientes com pedidos vinculados

---

## Stack

| Camada | Tecnologia |
|--------|-----------|
| Frontend | React 18 + Vite |
| Estilo | CSS Modules |
| Backend | Supabase (Postgres + Auth + Storage) |
| Deploy | Vercel |
| PWA | Web App Manifest + Service Worker |

---

## Rodando localmente

### Pré-requisitos
- Node.js 18+
- Conta no [Supabase](https://supabase.com)

### Instalação

```bash
git clone https://github.com/eduardocastrodev7/delicatto.git
cd delicatto
npm install
```

### Variáveis de ambiente

Crie um arquivo `.env` na raiz com base no `.env.example`:

```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-anon-key
```

### Banco de dados

No Supabase, execute o schema em **SQL Editor**:

```
supabase/schema.sql
```

Se estiver atualizando de uma versão anterior, aplique também as migrations:

```
supabase/migration_sabores.sql
```

### Rodando

```bash
npm run dev
```

Acesse `http://localhost:5173`

O painel admin fica em `http://localhost:5173/admin`

---

## Estrutura

```
src/
├── components/        # Componentes compartilhados (Header, CartPanel...)
├── context/           # AppContext (carrinho, produtos, pedidos) e AuthContext
├── lib/               # Integração com Supabase (products, orders, customers)
├── pages/
│   ├── admin/         # Dashboard, Pedidos, Produtos, Clientes, Login
│   └── loja/          # Cardápio, Checkout, Pagamento
public/
├── manifest.json      # Configuração PWA
├── og-image.jpg       # Imagem para compartilhamento
└── favicon.ico
supabase/
├── schema.sql         # Schema completo do banco
└── migration_*.sql    # Migrations incrementais
```

---

## Banco de dados

| Tabela | Descrição |
|--------|-----------|
| `products` | Produtos com suporte a sabores (`has_flavors`, `flavors`, `flavor_slots`) |
| `customers` | Clientes identificados por telefone |
| `orders` | Pedidos com status e método de pagamento |
| `order_items` | Itens do pedido com sabores escolhidos em JSON |
| `admins` | Usuários com acesso ao painel |

---

## Variáveis de ambiente

| Variável | Descrição |
|----------|-----------|
| `VITE_SUPABASE_URL` | URL do projeto Supabase |
| `VITE_SUPABASE_ANON_KEY` | Chave pública do Supabase |

---

## 📱 PWA — Instalação no celular

**Android:** ao acessar o site no Chrome, aparece o banner "Adicionar à tela inicial" automaticamente.

**iPhone:** abra no **Safari** → botão compartilhar → **"Adicionar à Tela de Início"**.

---

## 📄 Licença

Projeto privado — todos os direitos reservados à **Delicatto Doceria**.
