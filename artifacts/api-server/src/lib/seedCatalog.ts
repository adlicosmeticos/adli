import { db, productsTable, storeSettingsTable } from "@workspace/db";

const initialProducts = [
  {
    slug: "mascara-teia",
    name: "Máscara Teia",
    description:
      "Máscara capilar que fortalece as áreas sensibilizadas dos fios, restaurando a resistência e a maleabilidade. Hidrata intensamente para deixar o cabelo macio, brilhante e restaurado.",
    priceCents: 8000,
    imageUrl: "/products/mascara-teia.webp",
    category: "Máscaras",
    isActive: true,
    isFeatured: true,
    sortOrder: 1,
  },
  {
    slug: "kit-linha-a",
    name: "Kit Shampoo e Condicionador Linha A",
    description:
      "Indicado para uso diário, o kit ajuda a restaurar a saúde dos fios e repor substâncias perdidas em tratamentos químicos. Com vitamina A, oferece hidratação para cabelos cacheados e quimicamente tratados.",
    priceCents: 6000,
    imageUrl: "/products/kit-linha-a.webp",
    category: "Kits",
    isActive: true,
    isFeatured: true,
    sortOrder: 2,
  },
  {
    slug: "bb-cream-10-em-1",
    name: "BB Cream Multifuncional 10 em 1",
    description:
      "Finalizador que hidrata, repara, protege e adiciona brilho. Ajuda a controlar o frizz e deixa os fios macios e protegidos. Indicado para cabelos cacheados e quimicamente tratados.",
    priceCents: 7990,
    imageUrl: "/products/bb-cream-10-em-1.webp",
    category: "Finalizadores",
    isActive: true,
    isFeatured: true,
    sortOrder: 3,
  },
  {
    slug: "reparador-pontas-argan",
    name: "Finalizador Reparador de Pontas — Argan Oil",
    description:
      "Finalizador com óleo de argan puro, indicado para todos os tipos de cabelo. Ajuda a reparar pontas danificadas e potencializa a hidratação dos fios.",
    priceCents: 5990,
    imageUrl: "/products/reparador-pontas-argan.webp",
    category: "Finalizadores",
    isActive: true,
    isFeatured: true,
    sortOrder: 4,
  },
  {
    slug: "linha-cresce-forte",
    name: "Linha Cresce Forte",
    description:
      "Linha com foco no couro cabeludo, indicada para cabelos oleosos. O shampoo ajuda a controlar a oleosidade; a máscara condicionadora pode ser aplicada da raiz ao comprimento e ajuda a restaurar a saúde dos fios. Sua tecnologia estimula o crescimento.",
    priceCents: 5990,
    imageUrl: "/products/cresce-forte.webp",
    category: "Kits",
    isActive: true,
    isFeatured: true,
    sortOrder: 5,
  },
  {
    slug: "perfume-capilar",
    name: "Perfume Capilar",
    description:
      "Perfume capilar para todos os tipos de cabelo. Ajuda a deixar os fios cheirosos, sem frizz e com brilho. Fórmula com perfume e óleo.",
    priceCents: 5000,
    imageUrl: "/products/perfume-capilar.webp",
    category: "Finalizadores",
    isActive: true,
    isFeatured: false,
    sortOrder: 6,
  },
  {
    slug: "nocaute-hair",
    name: "Nocaute Hair",
    description:
      "Protetor térmico que facilita escovas e ajuda a desembaraçar. Protege os fios contra sol, poluição e calor do secador e da prancha. Com ativos voltados à elasticidade, hidratação e reparo capilar.",
    priceCents: 7990,
    imageUrl: "/products/nocaute-hair.webp",
    category: "Finalizadores",
    isActive: true,
    isFeatured: false,
    sortOrder: 7,
  },
  {
    slug: "booster-magic-cream",
    name: "Booster Magic Cream",
    description:
      "Máscara líquida de nutrição profunda, restauração instantânea e reposição lipídica. Sua tecnologia microcristalina age de maneira rápida e eficaz. Indicada para todos os tipos de cabelo.",
    priceCents: 6990,
    imageUrl: "/products/booster-magic-cream.webp",
    category: "Tratamentos",
    isActive: true,
    isFeatured: false,
    sortOrder: 8,
  },
  {
    slug: "mascara-black-matize",
    name: "Máscara Black Matize",
    description:
      "Máscara matizadora e acidificante para cabelos loiros e grisalhos. Neutraliza tons amarelados, ajudando a deixar o loiro ou grisalho platinado.",
    priceCents: 5000,
    imageUrl: "/products/black-matize.webp",
    category: "Máscaras",
    isActive: true,
    isFeatured: false,
    sortOrder: 9,
  },
  {
    slug: "pinkizinha-1-minuto",
    name: "Pinkizinha 1 Minuto",
    description:
      "Ampola de hidratação e reparação. Misture a mesma quantidade de água fria para formar uma máscara rica em ativos hidratantes, com ação de 1 minuto. Indicada para todos os tipos de cabelo.",
    priceCents: 2000,
    imageUrl: "/products/pinkizinha-1-minuto.webp",
    category: "Tratamentos",
    isActive: true,
    isFeatured: false,
    sortOrder: 10,
  },
];

export async function seedInitialCatalog() {
  await db.transaction(async (transaction) => {
    const [marker] = await transaction
      .insert(storeSettingsTable)
      .values({ key: "initial_catalog_v1", value: "seeded" })
      .onConflictDoNothing()
      .returning({ key: storeSettingsTable.key });

    if (!marker) return;

    await transaction
      .insert(productsTable)
      .values(initialProducts)
      .onConflictDoNothing();
  });
}
