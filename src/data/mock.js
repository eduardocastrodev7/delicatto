export const PIX_KEY = 'delicatto@pix.com.br'

// ── Status ────────────────────────────────────────────
export const STATUS_LABEL = {
  aguardando_pagamento:  'Aguardando pagamento',
  pagamento_aprovado:    'Pagamento aprovado',
  em_preparo:            'Em preparo',
  pronto:                'Pronto p/ retirada / Saiu p/ entrega',
  entregue:              'Entregue / Retirado',
  cancelado:             'Cancelado',
}

export const STATUS_COLOR = {
  aguardando_pagamento:  '#b07830',
  pagamento_aprovado:    '#4a7c59',
  em_preparo:            '#6b5080',
  pronto:                '#2a6090',
  entregue:              '#9a8070',
  cancelado:             '#8c3030',
}

// Status que o admin pode setar manualmente (não retrocede)
export const STATUS_FLOW = [
  'aguardando_pagamento',
  'pagamento_aprovado',
  'em_preparo',
  'pronto',
  'entregue',
]

// ── Produtos ──────────────────────────────────────────
export const INITIAL_PRODUCTS = [
  {
    id: 1, name: 'Brigadeiro Tradicional', price: 4.5,
    category: 'Brigadeiros',
    description: 'Brigadeiro cremoso com chocolate belga e granulado crocante. Uma receita clássica elevada com ingredientes selecionados.',
    ingredients: 'Leite condensado, manteiga, chocolate belga 70%, granulado de chocolate. Contém: leite, glúten.',
    prepTime: '24h de antecedência', rating: 4.9, reviews: 38, available: true, image: null,
  },
  {
    id: 2, name: 'Brigadeiro de Pistache', price: 6.0,
    category: 'Brigadeiros',
    description: 'Brigadeiro sofisticado com pasta de pistache importado e cobertura de pistache triturado.',
    ingredients: 'Leite condensado, manteiga, pasta de pistache importado, pistache triturado. Contém: leite, nozes.',
    prepTime: '24h de antecedência', rating: 5.0, reviews: 21, available: true, image: null,
  },
  {
    id: 3, name: 'Trufa de Limão Siciliano', price: 7.5,
    category: 'Trufas',
    description: 'Trufa refrescante com ganache de limão siciliano e casca crocante de chocolate branco.',
    ingredients: 'Chocolate branco, creme de leite, suco e raspas de limão siciliano. Contém: leite.',
    prepTime: '48h de antecedência', rating: 4.8, reviews: 15, available: true, image: null,
  },
  {
    id: 4, name: 'Beijinho de Coco', price: 4.5,
    category: 'Brigadeiros',
    description: 'Clássico beijinho com coco fresco ralado na hora e cravo-da-índia para decoração.',
    ingredients: 'Leite condensado, manteiga, coco fresco ralado, cravo-da-índia. Contém: leite.',
    prepTime: '24h de antecedência', rating: 4.7, reviews: 29, available: true, image: null,
  },
  {
    id: 5, name: 'Romeu e Julieta', price: 8.0,
    category: 'Especiais',
    description: 'Combinação perfeita de goiabada artesanal com queijo minas frescal em camadas delicadas.',
    ingredients: 'Goiabada artesanal, queijo minas frescal, massa folhada. Contém: leite, glúten.',
    prepTime: '48h de antecedência', rating: 4.9, reviews: 12, available: true, image: null,
  },
  {
    id: 6, name: 'Cajuzinho', price: 5.0,
    category: 'Brigadeiros',
    description: 'Brigadeiro de amendoim torrado em formato de caju, com textura firme e sabor intenso.',
    ingredients: 'Leite condensado, manteiga, amendoim torrado e moído. Contém: leite, amendoim.',
    prepTime: '24h de antecedência', rating: 4.6, reviews: 18, available: true, image: null,
  },
  {
    id: 7, name: 'Trufa de Maracujá', price: 7.0,
    category: 'Trufas',
    description: 'Trufa tropical com polpa de maracujá fresca e cobertura de chocolate ao leite.',
    ingredients: 'Chocolate ao leite, creme de leite, polpa de maracujá fresca. Contém: leite.',
    prepTime: '48h de antecedência', rating: 4.8, reviews: 9, available: false, image: null,
  },
  {
    id: 8, name: 'Box Sortido 20un', price: 75.0,
    category: 'Boxes',
    description: 'Monte sua caixa com 20 doces à sua escolha, embalados em caixa especial para presente.',
    ingredients: 'Varia conforme escolha dos doces.',
    prepTime: '72h de antecedência', rating: 5.0, reviews: 44, available: true, image: null,
  },
]

// ── Pedidos iniciais ──────────────────────────────────
export const INITIAL_ORDERS = [
  {
    id: 1001, customerName: 'Ana Lima', customerPhone: '16 99999-0001',
    customerInstagram: 'ana.lima',
    endereco: 'Retirada — Estr. José Ovídio de Assis, 5261, Franca-SP',
    entrega: 'retirada_franca',
    items: [{ name: 'Brigadeiro Tradicional', qty: 10, price: 4.5 }],
    subtotal: 45.0, frete: 0, total: 45.0,
    metodoPagamento: 'pix',
    status: 'entregue', date: '18/02/2025',
  },
  {
    id: 1002, customerName: 'Carlos Souza', customerPhone: '35 99999-0002',
    customerInstagram: 'carlossouza',
    endereco: 'Retirada — R. Azárias Azevedo de Melo, 170, Cássia-MG',
    entrega: 'retirada_cassia',
    items: [{ name: 'Box Sortido 20un', qty: 1, price: 75.0 }],
    subtotal: 75.0, frete: 0, total: 75.0,
    metodoPagamento: 'cartao',
    status: 'aguardando_pagamento', date: '23/02/2025',
  },
  {
    id: 1003, customerName: 'Mariana Costa', customerPhone: '16 99999-0003',
    customerInstagram: 'marianacosta',
    endereco: 'Rua XV de Novembro, 200, Apto 4 — Centro, Franca-SP',
    entrega: 'entrega',
    items: [
      { name: 'Trufa de Limão Siciliano', qty: 6, price: 7.5 },
      { name: 'Beijinho de Coco', qty: 4, price: 4.5 },
    ],
    subtotal: 63.0, frete: 10.0, total: 73.0,
    metodoPagamento: 'pix',
    status: 'em_preparo', date: '23/02/2025',
  },
]

// ── Clientes iniciais ─────────────────────────────────
export const INITIAL_CUSTOMERS = [
  {
    id: 1, name: 'Ana Lima', phone: '16 99999-0001', instagram: 'ana.lima',
    endereco: '', totalOrders: 3,
    pedidos: [{ id: 1001, date: '18/02/2025', total: 45.0, items: [{ name: 'Brigadeiro Tradicional', qty: 10 }] }],
  },
  {
    id: 2, name: 'Carlos Souza', phone: '35 99999-0002', instagram: 'carlossouza',
    endereco: '', totalOrders: 1,
    pedidos: [{ id: 1002, date: '23/02/2025', total: 75.0, items: [{ name: 'Box Sortido 20un', qty: 1 }] }],
  },
  {
    id: 3, name: 'Mariana Costa', phone: '16 99999-0003', instagram: 'marianacosta',
    endereco: 'Rua XV de Novembro, 200 — Franca-SP', totalOrders: 5,
    pedidos: [{ id: 1003, date: '23/02/2025', total: 73.0, items: [{ name: 'Trufa de Limão Siciliano', qty: 6 }, { name: 'Beijinho de Coco', qty: 4 }] }],
  },
]