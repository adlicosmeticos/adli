export interface CategoryImage {
  name: string;
  image: string;
}

export interface StoreSettings {
  hero_image: string;
  hero_tag: string;
  hero_title: string;
  hero_subtitle: string;
  about_image: string;
  about_images: string[]; // Lista ilimitada para o carrossel do Quem Somos
  about_title: string;
  about_text_1: string;
  about_text_2: string;
  promo_image: string;
  categories: {
    mascaras: string;
    kits: string;
    finalizadores: string;
    tratamentos: string;
  };
  pickup_enabled: boolean; // Permitir retirada no local
  fixed_shipping_enabled: boolean; // Cobrar frete fixo automático de R$ 27 (PR)
  pickup_address: string; // Endereço para retirada
}

export const defaultStoreSettings: StoreSettings = {
  hero_image: '/hero-banner.jpg',
  hero_tag: 'NOVA LINHA DE CUIDADOS',
  hero_title: 'Seu cabelo. Seu momento.',
  hero_subtitle: 'Cuidado capilar profissional que nutre, fortalece e transforma — a experiência do salão, na sua casa.',
  about_image: '/brand-editorial.webp',
  about_images: [
    '/brand-editorial.webp',
    '/products/mascara-teia.webp',
    '/products/kit-linha-a.webp',
    '/products/bb-cream-10-em-1.webp',
  ],
  about_title: 'De profissional da beleza para você.',
  about_text_1: 'Nascida em 2020 da paixão pela beleza e da experiência de uma profissional da área, a Adli Lima Cosméticos desenvolve produtos que unem tecnologia, qualidade, praticidade e resultados — aproximando a sensação de cuidado do salão à sua casa.',
  about_text_2: 'Mais do que cosméticos, queremos transformar o cuidado com os cabelos em um momento de autoestima, confiança e bem-estar.',
  promo_image: '/brand-editorial.webp',
  categories: {
    mascaras: '/products/mascara-teia.webp',
    kits: '/products/kit-linha-a.webp',
    finalizadores: '/products/bb-cream-10-em-1.webp',
    tratamentos: '/products/booster-magic-cream.webp',
  },
  pickup_enabled: true,
  fixed_shipping_enabled: false, // Por padrão, apenas os produtos vão ao WhatsApp e a loja calcula o frete / retirada
  pickup_address: 'Rua Antônio José da Silva, 620 — Paranavaí/PR',
};

export function getLocalStoreSettings(): StoreSettings {
  try {
    const raw = localStorage.getItem('adli_store_settings');
    if (raw) {
      const parsed = JSON.parse(raw);
      // Garantir compatibilidade com fotos antigas
      const images = Array.isArray(parsed.about_images) && parsed.about_images.length > 0
        ? parsed.about_images
        : parsed.about_image
        ? [parsed.about_image]
        : defaultStoreSettings.about_images;

      return {
        ...defaultStoreSettings,
        ...parsed,
        pickup_enabled: parsed.pickup_enabled !== undefined ? parsed.pickup_enabled : true,
        fixed_shipping_enabled: parsed.fixed_shipping_enabled !== undefined ? parsed.fixed_shipping_enabled : false,
        pickup_address: parsed.pickup_address || defaultStoreSettings.pickup_address,
        about_images: images,
        categories: { ...defaultStoreSettings.categories, ...(parsed.categories || {}) },
      };
    }
  } catch {}
  return defaultStoreSettings;
}

export function saveLocalStoreSettings(settings: StoreSettings) {
  try {
    localStorage.setItem('adli_store_settings', JSON.stringify(settings));
  } catch {}
}
