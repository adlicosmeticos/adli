export interface Product {
  id: number;
  slug: string;
  name: string;
  description: string;
  price_cents: number;
  image_url: string;
  category: string;
  is_active: boolean;
  is_featured: boolean;
  sort_order: number;
}

export const categoryList = [
  { name: 'Máscaras', image: '/products/mascara-teia.webp' },
  { name: 'Kits', image: '/products/kit-linha-a.webp' },
  { name: 'Finalizadores', image: '/products/bb-cream-10-em-1.webp' },
  { name: 'Tratamentos', image: '/products/booster-magic-cream.webp' },
];

export const fallbackProducts: Product[] = [
  {
    id: 1,
    slug: 'mascara-teia',
    name: 'Máscara Teia',
    description:
      'Máscara capilar que fortalece as áreas sensibilizadas dos fios, restaurando a resistência e a maleabilidade. Hidrata intensamente para deixar o cabelo macio, brilhante e restaurado.',
    price_cents: 8000,
    image_url: '/products/mascara-teia.webp',
    category: 'Máscaras',
    is_active: true,
    is_featured: true,
    sort_order: 1,
  },
  {
    id: 2,
    slug: 'kit-linha-a',
    name: 'Kit Shampoo e Condicionador Linha A',
    description:
      'Indicado para uso diário, o kit ajuda a restaurar a saúde dos fios e repor substâncias perdidas em tratamentos químicos. Com vitamina A, oferece hidratação para cabelos cacheados e quimicamente tratados.',
    price_cents: 6000,
    image_url: '/products/kit-linha-a.webp',
    category: 'Kits',
    is_active: true,
    is_featured: true,
    sort_order: 2,
  },
  {
    id: 3,
    slug: 'bb-cream-10-em-1',
    name: 'BB Cream Multifuncional 10 em 1',
    description:
      'Finalizador que hidrata, repara, protege e adiciona brilho. Ajuda a controlar o frizz e deixa os fios macios e protegidos. Indicado para cabelos cacheados e quimicamente tratados.',
    price_cents: 7990,
    image_url: '/products/bb-cream-10-em-1.webp',
    category: 'Finalizadores',
    is_active: true,
    is_featured: true,
    sort_order: 3,
  },
  {
    id: 4,
    slug: 'reparador-pontas-argan',
    name: 'Finalizador Reparador de Pontas — Argan Oil',
    description:
      'Finalizador com óleo de argan puro, indicado para todos os tipos de cabelo. Ajuda a reparar pontas danificadas e potencializa a hidratação dos fios.',
    price_cents: 5990,
    image_url: '/products/reparador-pontas-argan.webp',
    category: 'Finalizadores',
    is_active: true,
    is_featured: true,
    sort_order: 4,
  },
  {
    id: 5,
    slug: 'linha-cresce-forte',
    name: 'Linha Cresce Forte',
    description:
      'Linha com foco no couro cabeludo, indicada para cabelos oleosos. O shampoo ajuda a controlar a oleosidade; a máscara condicionadora pode ser aplicada da raiz ao comprimento e ajuda a restaurar a saúde dos fios. Sua tecnologia estimula o crescimento.',
    price_cents: 5990,
    image_url: '/products/cresce-forte.webp',
    category: 'Kits',
    is_active: true,
    is_featured: true,
    sort_order: 5,
  },
  {
    id: 6,
    slug: 'perfume-capilar',
    name: 'Perfume Capilar',
    description:
      'Perfume capilar para todos os tipos de cabelo. Ajuda a deixar os fios cheirosos, sem frizz e com brilho. Fórmula com perfume e óleo.',
    price_cents: 5000,
    image_url: '/products/perfume-capilar.webp',
    category: 'Finalizadores',
    is_active: true,
    is_featured: false,
    sort_order: 6,
  },
  {
    id: 7,
    slug: 'nocaute-hair',
    name: 'Nocaute Hair',
    description:
      'Protetor térmico que facilita escovas e ajuda a desembaraçar. Protege os fios contra sol, poluição e calor do secador e da prancha. Com ativos voltados à elasticidade, hidratação e reparo capilar.',
    price_cents: 7990,
    image_url: '/products/nocaute-hair.webp',
    category: 'Finalizadores',
    is_active: true,
    is_featured: false,
    sort_order: 7,
  },
  {
    id: 8,
    slug: 'booster-magic-cream',
    name: 'Booster Magic Cream',
    description:
      'Máscara líquida de nutrição profunda, restauração instantânea e reposição lipídica. Sua tecnologia microcristalina age de maneira rápida e eficaz. Indicada para todos os tipos de cabelo.',
    price_cents: 6990,
    image_url: '/products/booster-magic-cream.webp',
    category: 'Tratamentos',
    is_active: true,
    is_featured: false,
    sort_order: 8,
  },
  {
    id: 9,
    slug: 'mascara-black-matize',
    name: 'Máscara Black Matize',
    description:
      'Máscara matizadora e acidificante para cabelos loiros e grisalhos. Neutraliza tons amarelados, ajudando a deixar o loiro ou grisalho platinado.',
    price_cents: 5000,
    image_url: '/products/black-matize.webp',
    category: 'Máscaras',
    is_active: true,
    is_featured: false,
    sort_order: 9,
  },
  {
    id: 10,
    slug: 'pinkizinha-1-minuto',
    name: 'Pinkizinha 1 Minuto',
    description:
      'Ampola de hidratação e reparação. Misture a mesma quantidade de água fria para formar uma máscara rica em ativos hidratantes, com ação de 1 minuto. Indicada para todos os tipos de cabelo.',
    price_cents: 2000,
    image_url: '/products/pinkizinha-1-minuto.webp',
    category: 'Tratamentos',
    is_active: true,
    is_featured: false,
    sort_order: 10,
  },
];

export function formatPrice(cents: number): string {
  return `R$ ${(cents / 100).toFixed(2).replace('.', ',')}`;
}

export function parseToCents(val: string): number {
  if (!val) return 0;
  const clean = val.replace(/[^\d.,]/g, '').replace(',', '.');
  const num = parseFloat(clean);
  if (isNaN(num) || num <= 0) return 0;
  return Math.round(num * 100);
}

export function getWhatsAppLink(product?: Product): string {
  const base = 'https://wa.me/5544997303797?text=';
  if (!product) {
    return `${base}${encodeURIComponent('Olá! Gostaria de conhecer a linha Adli Lima Cosméticos.')}`;
  }
  const price = formatPrice(product.price_cents);
  return `${base}${encodeURIComponent(`Olá! Tenho interesse no produto: ${product.name} (${price}). Poderia me dar mais informações?`)}`;
}
