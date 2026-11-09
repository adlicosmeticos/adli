import { useState, useEffect } from 'react';
import {
  ArrowRight,
  Heart,
  Instagram,
  Lock,
  Mail,
  MapPin,
  Menu,
  MessageCircle,
  Package,
  RefreshCw,
  Shield,
  ShieldCheck,
  Sparkles,
  Star,
  Truck,
  X,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import {
  type Product,
  fallbackProducts,
  formatPrice,
  getWhatsAppLink,
} from '@/lib/products-data';
import {
  type StoreSettings,
  defaultStoreSettings,
  getLocalStoreSettings,
  saveLocalStoreSettings,
} from '@/lib/store-settings';
import { useCart } from '@/lib/cart-context';
import AboutSlider from '@/components/about-slider';

/* ────────────────────────────────────────────── constants */
const whatsappUrl = getWhatsAppLink();
const instagramUrl = 'https://www.instagram.com/adlilimacosmeticos/';
const emailUrl = 'mailto:adlilimalinhacosmeticos@gmail.com';

/* ────────────────────────────────────────────── helpers */
function StarRating({ rating = 5, reviews }: { rating?: number; reviews?: number }) {
  return (
    <div className="flex items-center gap-1">
      <div className="flex gap-px">
        {[1, 2, 3, 4, 5].map((i) => (
          <Star
            key={i}
            size={12}
            fill={i <= rating ? '#B68475' : 'none'}
            className={i <= rating ? 'text-[#B68475]' : 'text-[#DCC4BD]'}
          />
        ))}
      </div>
      {reviews !== undefined && (
        <span className="text-[10px] text-[#927C75]">({reviews})</span>
      )}
    </div>
  );
}

function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart();

  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl border border-[#DCC4BD]/60 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md hover:border-[#B68475]/80">
      {/* Image */}
      <div className="relative aspect-square overflow-hidden bg-gradient-to-b from-[#FBFBFA] to-[#ECDDD8]/40">
        <img
          src={product.image_url}
          alt={product.name}
          className="h-full w-full object-contain p-2.5 sm:p-5 transition-transform duration-500 group-hover:scale-105"
        />
        <button
          type="button"
          className="absolute right-2 top-2 sm:right-3 sm:top-3 flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full bg-white/80 text-[#927C75] shadow-sm backdrop-blur-sm transition hover:bg-white hover:text-[#966960]"
          aria-label="Favoritar"
        >
          <Heart size={14} />
        </button>
        {product.is_featured && (
          <span className="absolute left-2 top-2 sm:left-3 sm:top-3 rounded-full bg-[#966960] px-2 py-0.5 sm:px-2.5 sm:py-1 text-[8px] sm:text-[9px] font-bold tracking-[.08em] text-white">
            DESTAQUE
          </span>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-3 sm:p-4">
        <span className="text-[9px] sm:text-[10px] font-semibold tracking-[.18em] text-[#B68475]">
          {product.category.toUpperCase()}
        </span>
        <h3 className="mt-1 line-clamp-2 text-xs sm:text-sm font-medium leading-snug text-[#614331] min-h-[2rem]">
          {product.name}
        </h3>
        {product.description && (
          <p className="mt-1 text-[10px] sm:text-[11px] leading-relaxed text-[#927C75]">
            {product.description}
          </p>
        )}
        <div className="mt-auto pt-2">
          <div>
            <StarRating rating={5} reviews={Math.floor(Math.random() * 80) + 50} />
          </div>
          <p className="mt-1 sm:mt-2 text-sm sm:text-lg font-bold text-[#614331]">
            {formatPrice(product.price_cents)}
          </p>
          <button
            type="button"
            onClick={() => addItem(product)}
            className="mt-2.5 sm:mt-3 flex w-full items-center justify-center gap-1.5 rounded-xl bg-[#966960] px-2.5 py-2 sm:px-4 sm:py-2.5 text-[10px] sm:text-[11px] font-bold tracking-[.06em] text-white transition hover:bg-[#B68475] active:scale-95 shadow-sm"
          >
            <Package size={13} />
            <span>ADICIONAR</span>
          </button>
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════
   HOME PAGE
   ════════════════════════════════════════════════════════ */

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [products, setProducts] = useState<Product[]>(fallbackProducts);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [settings, setSettings] = useState<StoreSettings>(getLocalStoreSettings);
  const { setIsOpen, totalItems } = useCart();

  /* fetch from supabase */
  useEffect(() => {
    if (!supabase) return;
    supabase
      .from('products')
      .select('*')
      .eq('is_active', true)
      .order('sort_order')
      .then(({ data }) => {
        if (data && data.length > 0) setProducts(data as Product[]);
      });

    supabase
      .from('store_settings')
      .select('*')
      .eq('key', 'store_config')
      .maybeSingle()
      .then(({ data }) => {
        if (data && data.value) {
          try {
            const parsed = JSON.parse(data.value);
            setSettings((prev) => {
              const updated = {
                ...prev,
                ...parsed,
                categories: { ...prev.categories, ...(parsed.categories || {}) },
              };
              saveLocalStoreSettings(updated);
              return updated;
            });
          } catch {}
        }
      });
  }, []);

  const dynamicCategories = [
    { name: 'Máscaras', image: settings.categories?.mascaras || '/products/mascara-teia.webp' },
    { name: 'Kits', image: settings.categories?.kits || '/products/kit-linha-a.webp' },
    { name: 'Finalizadores', image: settings.categories?.finalizadores || '/products/bb-cream-10-em-1.webp' },
    { name: 'Tratamentos', image: settings.categories?.tratamentos || '/products/booster-magic-cream.webp' },
  ];

  const featured = products.filter((p) => p.is_featured);
  const filtered = activeCategory
    ? products.filter((p) => p.category === activeCategory)
    : products;

  return (
    <main className="min-h-[100dvh] bg-[#FBFBFA] text-[#614331]">
      {/* ── HEADER ────────────────────────────────────── */}
      <header className="sticky top-0 z-50 border-b border-[#DCC4BD]/70 bg-[#FBFBFA]/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-[1380px] items-center justify-between px-5 py-3 sm:px-8 lg:px-14">
          {/* Logo */}
          <a href="#inicio" aria-label="Início">
            <img
              src="/adli-logo.png"
              alt="Adli Lima Cosméticos"
              className="h-14 w-auto object-contain sm:h-[62px]"
            />
          </a>

          {/* Desktop Nav */}
          <nav className="hidden items-center gap-8 md:flex">
            <a href="#inicio" className="nav-link text-[11px] tracking-[.14em] font-medium text-[#614331]">
              INÍCIO
            </a>
            <a href="#produtos" className="nav-link text-[11px] tracking-[.14em] font-medium text-[#614331]">
              PRODUTOS
            </a>
            <a href="#categorias" className="nav-link text-[11px] tracking-[.14em] font-medium text-[#614331]">
              CATEGORIAS
            </a>
            <a href="#sobre" className="nav-link text-[11px] tracking-[.14em] font-medium text-[#614331]">
              SOBRE NÓS
            </a>
            <a href="#contato" className="nav-link text-[11px] tracking-[.14em] font-medium text-[#614331]">
              CONTATO
            </a>
          </nav>

          {/* Utility Icons */}
          <div className="flex items-center gap-3">
            <a
              href={instagramUrl}
              target="_blank"
              rel="noreferrer"
              className="text-[#614331] transition hover:text-[#966960]"
              aria-label="Instagram"
            >
              <Instagram size={18} />
            </a>

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noreferrer"
              className="hidden items-center gap-2 rounded-full bg-[#966960] px-4 py-2 text-[11px] font-bold tracking-[.06em] text-white transition hover:bg-[#B68475] md:flex"
            >
              <MessageCircle size={14} /> FALE CONOSCO
            </a>

            {/* Mobile menu button */}
            <button
              type="button"
              aria-label={menuOpen ? 'Fechar menu' : 'Abrir menu'}
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-[#DCC4BD] text-[#614331] md:hidden"
            >
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        {menuOpen && (
          <nav className="absolute left-0 right-0 top-full border-b border-[#DCC4BD] bg-[#FBFBFA] px-6 py-5 shadow-lg md:hidden">
            <div className="flex flex-col gap-5">
              <a href="#inicio" onClick={() => setMenuOpen(false)} className="text-xs tracking-[.15em] text-[#614331]">INÍCIO</a>
              <a href="#produtos" onClick={() => setMenuOpen(false)} className="text-xs tracking-[.15em] text-[#614331]">PRODUTOS</a>
              <a href="#categorias" onClick={() => setMenuOpen(false)} className="text-xs tracking-[.15em] text-[#614331]">CATEGORIAS</a>
              <a href="#sobre" onClick={() => setMenuOpen(false)} className="text-xs tracking-[.15em] text-[#614331]">SOBRE NÓS</a>
              <a href="#contato" onClick={() => setMenuOpen(false)} className="text-xs tracking-[.15em] text-[#614331]">CONTATO</a>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex w-fit items-center gap-2 rounded-full bg-[#966960] px-5 py-3 text-xs font-bold text-white"
              >
                <MessageCircle size={15} /> Conversar pelo WhatsApp
              </a>
            </div>
          </nav>
        )}
      </header>

      {/* ── HERO FORA A FORA (FULL WIDTH BANNER) ────── */}
      <section id="inicio" className="relative w-full overflow-hidden bg-[#ECDDD8]">
        <div className="relative w-full aspect-[16/9] sm:aspect-[16/7] min-h-[220px] sm:min-h-[380px] md:min-h-[460px] lg:min-h-[520px] max-h-[640px]">
          <img
            src={settings.hero_image}
            alt="Adli Lima Cosméticos"
            className="h-full w-full object-cover object-center"
          />
        </div>
      </section>

      {/* ── TRUST BADGES ──────────────────────────────── */}
      <section className="border-b border-[#DCC4BD]/60 bg-white px-2 py-5 sm:px-8 sm:py-8 lg:px-14">
        <div className="mx-auto grid max-w-[1100px] grid-cols-4 gap-1.5 sm:gap-6 md:gap-8">
          {[
            { icon: <Sparkles className="h-4 w-4 sm:h-5 sm:w-5" />, title: 'Qualidade Profissional', desc: 'Fórmulas de salão' },
            { icon: <ShieldCheck className="h-4 w-4 sm:h-5 sm:w-5" />, title: 'Clinicamente Testado', desc: 'Dermatológico' },
            { icon: <Heart className="h-4 w-4 sm:h-5 sm:w-5" />, title: 'Cruelty Free', desc: 'Sem testes animais' },
            { icon: <Shield className="h-4 w-4 sm:h-5 sm:w-5" />, title: 'Desde 2020', desc: 'Marca consolidada' },
          ].map((badge) => (
            <div key={badge.title} className="flex flex-col items-center gap-1 sm:gap-2 text-center px-0.5">
              <div className="flex h-9 w-9 sm:h-12 sm:w-12 items-center justify-center rounded-full border border-[#DCC4BD] bg-[#FBFBFA] text-[#966960] shrink-0">
                {badge.icon}
              </div>
              <h3 className="text-[9px] sm:text-[11px] font-bold tracking-[.01em] sm:tracking-[.06em] text-[#614331] leading-tight line-clamp-2">
                {badge.title}
              </h3>
              <p className="text-[8px] sm:text-[10px] text-[#927C75] leading-tight line-clamp-1 sm:line-clamp-none">
                {badge.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── SHOP BY CATEGORY ──────────────────────────── */}
      <section id="categorias" className="scroll-mt-20 bg-[#FBFBFA] px-4 py-12 sm:px-8 sm:py-16 lg:px-14">
        <h2 className="mb-6 sm:mb-10 text-center text-xs sm:text-[13px] font-bold tracking-[.22em] text-[#614331]">
          COMPRE POR CATEGORIA
        </h2>
        <div className="mx-auto grid max-w-[900px] grid-cols-2 gap-4 sm:grid-cols-4 sm:gap-8">
          {dynamicCategories.map((cat) => (
            <a
              key={cat.name}
              href="#produtos"
              onClick={() => setActiveCategory(activeCategory === cat.name ? null : cat.name)}
              className="group flex flex-col items-center gap-2 sm:gap-3"
            >
              <div
                className={`h-24 w-24 sm:h-32 sm:w-32 overflow-hidden rounded-full border-2 transition-all duration-300 ${
                  activeCategory === cat.name
                    ? 'border-[#966960] shadow-md ring-4 ring-[#E7D1C7]'
                    : 'border-[#DCC4BD] group-hover:border-[#B68475] group-hover:shadow-sm'
                }`}
              >
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
              </div>
              <span className="text-[10px] sm:text-[11px] font-semibold tracking-[.14em] text-[#614331]">
                {cat.name.toUpperCase()}
              </span>
            </a>
          ))}
        </div>
      </section>

      {/* ── BEST SELLERS ──────────────────────────────── */}
      <section id="destaques" className="scroll-mt-20 bg-[#ECDDD8]/30 px-3 py-12 sm:px-8 sm:py-16 lg:px-14">
        <div className="mx-auto max-w-[1200px]">
          <div className="mb-6 sm:mb-10 flex items-center justify-between">
            <h2 className="text-xs sm:text-[13px] font-bold tracking-[.22em] text-[#614331]">
              MAIS VENDIDOS
            </h2>
            <a
              href="#produtos"
              className="text-[11px] font-semibold tracking-[.1em] text-[#966960] transition hover:text-[#B68475]"
            >
              VER TODOS
            </a>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 lg:grid-cols-5">
            {featured.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* ── ALL PRODUCTS ──────────────────────────────── */}
      <section id="produtos" className="scroll-mt-20 bg-[#FBFBFA] px-3 py-12 sm:px-8 sm:py-16 lg:px-14">
        <div className="mx-auto max-w-[1200px]">
          <h2 className="mb-2 sm:mb-4 text-center text-xs sm:text-[13px] font-bold tracking-[.22em] text-[#614331]">
            TODA A LINHA
          </h2>
          <p className="mx-auto mb-6 sm:mb-8 max-w-[500px] text-center text-xs sm:text-[13px] text-[#927C75]">
            Conheça todos os produtos da linha Adli Lima Cosméticos
          </p>

          {/* Category filter */}
          <div className="mb-6 sm:mb-8 flex flex-wrap justify-center gap-1.5 sm:gap-2">
            <button
              onClick={() => setActiveCategory(null)}
              className={`rounded-full px-3 py-1.5 sm:px-4 sm:py-2 text-[10px] sm:text-[11px] font-bold tracking-[.06em] transition ${
                !activeCategory
                  ? 'bg-[#966960] text-white shadow-sm'
                  : 'border border-[#DCC4BD] bg-white text-[#614331] hover:bg-[#ECDDD8]'
              }`}
            >
              TODOS
            </button>
            {dynamicCategories.map((cat) => (
              <button
                key={cat.name}
                onClick={() => setActiveCategory(activeCategory === cat.name ? null : cat.name)}
                className={`rounded-full px-3 py-1.5 sm:px-4 sm:py-2 text-[10px] sm:text-[11px] font-bold tracking-[.06em] transition ${
                  activeCategory === cat.name
                    ? 'bg-[#966960] text-white shadow-sm'
                    : 'border border-[#DCC4BD] bg-white text-[#614331] hover:bg-[#ECDDD8]'
                }`}
              >
                {cat.name.toUpperCase()}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {filtered.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {filtered.length === 0 && (
            <p className="py-12 text-center text-sm text-[#927C75]">
              Nenhum produto encontrado nesta categoria.
            </p>
          )}
        </div>
      </section>

      {/* ── ABOUT / QUEM SOMOS ────────────────────────── */}
      <section id="sobre" className="scroll-mt-20 px-5 py-16 sm:px-8 sm:py-24 lg:px-14 bg-white border-y border-[#DCC4BD]/40">
        <div className="mx-auto grid max-w-[1200px] items-center gap-12 lg:grid-cols-[1.06fr_.94fr] lg:gap-24">
          <AboutSlider images={settings.about_images || [settings.about_image || '/brand-editorial.webp']} />
          <div className="lg:py-4">
            <p className="text-[10px] font-bold tracking-[.24em] text-[#B68475]">QUEM SOMOS</p>
            <h2 className="serif mt-5 text-4xl leading-[1.13] tracking-[-.035em] sm:text-[52px] text-[#614331]">
              {settings.about_title}
            </h2>
            <div className="mt-7 space-y-4 text-[14px] leading-[1.9] text-[#927C75] sm:text-[15px]">
              <p>{settings.about_text_1}</p>
              {settings.about_text_2 && <p>{settings.about_text_2}</p>}
            </div>
          </div>
        </div>
      </section>

      {/* ── PROMO BANNER (OFERTA ESPECIAL) ─────────────── */}
      <section className="bg-[#ECDDD8] px-5 py-8 sm:py-0 sm:px-8 lg:px-14 border-b border-[#DCC4BD]">
        <div className="mx-auto grid max-w-[1200px] items-center gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="py-6 lg:py-16">
            <p className="text-[10px] font-bold tracking-[.24em] text-[#B68475]">
              OFERTA ESPECIAL
            </p>
            <h2 className="serif mt-4 text-3xl leading-[1.1] tracking-[-.03em] text-[#614331] sm:text-5xl">
              Conheça toda a<br />linha <em className="text-[#966960]">Adli Lima</em>
            </h2>
            <p className="mt-4 sm:mt-5 max-w-[380px] text-xs sm:text-[14px] leading-[1.8] text-[#927C75]">
              Cuide dos seus cabelos com quem entende. Converse com a gente pelo WhatsApp e monte
              seu kit personalizado.
            </p>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-6 sm:mt-7 inline-flex items-center gap-2 rounded-full border-2 border-[#614331] px-5 sm:px-6 py-2.5 sm:py-3 text-[11px] font-bold tracking-[.1em] text-[#614331] transition hover:bg-[#614331] hover:text-[#FBFBFA]"
            >
              FALE CONOSCO <ArrowRight size={14} />
            </a>
          </div>
          <div className="relative overflow-hidden rounded-2xl sm:rounded-none">
            <img
              src={settings.promo_image || '/brand-editorial.webp'}
              alt="Linha Adli Lima Cosméticos"
              className="h-[240px] sm:h-[320px] lg:h-[380px] w-full object-cover object-[70%_center] rounded-xl lg:rounded-none shadow-sm lg:shadow-none"
            />
          </div>
        </div>
      </section>

      {/* ── BENEFITS BAR ──────────────────────────────── */}
      <section className="border-b border-[#DCC4BD] bg-white px-5 py-8 sm:px-8 lg:px-14">
        <div className="mx-auto grid max-w-[1100px] grid-cols-2 gap-6 sm:grid-cols-4 sm:gap-4">
          {[
            { icon: <Truck size={20} />, title: 'Frete Seguro', desc: 'R$ 27 no Paraná' },
            { icon: <RefreshCw size={20} />, title: 'Trocas Fáceis', desc: 'Em até 7 dias' },
            { icon: <Shield size={20} />, title: 'Qualidade Garantida', desc: 'Desde 2020' },
            { icon: <MessageCircle size={20} />, title: 'Atendimento', desc: 'Direto no WhatsApp' },
          ].map((b) => (
            <div key={b.title} className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#ECDDD8] text-[#966960]">
                {b.icon}
              </div>
              <div>
                <h4 className="text-[11px] font-bold text-[#614331]">{b.title}</h4>
                <p className="text-[10px] text-[#927C75]">{b.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CONTACT ───────────────────────────────────── */}
      <section id="contato" className="scroll-mt-20 px-5 py-16 sm:px-8 sm:py-24 lg:px-14 bg-[#FBFBFA]">
        <div className="mx-auto grid max-w-[1200px] gap-12 lg:grid-cols-[.9fr_1.1fr] lg:gap-24">
          <div>
            <p className="text-[10px] font-bold tracking-[.24em] text-[#B68475]">
              VAMOS CONVERSAR?
            </p>
            <h2 className="serif mt-5 max-w-[440px] text-4xl leading-[1.1] tracking-[-.035em] sm:text-[52px] text-[#614331]">
              Seu próximo cuidado começa <em className="text-[#966960]">aqui.</em>
            </h2>
            <p className="mt-6 max-w-[380px] text-[14px] leading-[1.85] text-[#927C75]">
              Fale com a Adli Lima Cosméticos para saber mais sobre a linha profissional de cuidados
              capilares.
            </p>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-7 inline-flex items-center gap-3 rounded-full bg-[#966960] px-6 py-4 text-[11px] font-bold tracking-[.1em] text-white transition hover:bg-[#B68475] shadow-sm"
            >
              <MessageCircle size={17} /> INICIAR CONVERSA <ArrowRight size={14} />
            </a>
          </div>
          <div className="border-t border-[#DCC4BD]">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noreferrer"
              className="contact-link flex items-center justify-between gap-4 border-b border-[#DCC4BD] py-5"
            >
              <span className="flex items-center gap-4">
                <MessageCircle size={17} className="text-[#966960]" />
                <span>
                  <span className="block text-[9px] tracking-[.18em] text-[#927C75]">WHATSAPP</span>
                  <span className="mt-1 block text-[14px] text-[#614331] font-medium">(44) 99730-3797</span>
                </span>
              </span>
              <ArrowRight size={15} />
            </a>
            <a
              href={emailUrl}
              className="contact-link flex items-center justify-between gap-4 border-b border-[#DCC4BD] py-5"
            >
              <span className="flex items-center gap-4">
                <Mail size={17} className="text-[#966960]" />
                <span>
                  <span className="block text-[9px] tracking-[.18em] text-[#927C75]">E-MAIL</span>
                  <span className="mt-1 block break-all text-[14px] text-[#614331] font-medium">
                    adlilimalinhacosmeticos@gmail.com
                  </span>
                </span>
              </span>
              <ArrowRight size={15} />
            </a>
            <a
              href={instagramUrl}
              target="_blank"
              rel="noreferrer"
              className="contact-link flex items-center justify-between gap-4 border-b border-[#DCC4BD] py-5"
            >
              <span className="flex items-center gap-4">
                <Instagram size={17} className="text-[#966960]" />
                <span>
                  <span className="block text-[9px] tracking-[.18em] text-[#927C75]">INSTAGRAM</span>
                  <span className="mt-1 block text-[14px] text-[#614331] font-medium">@adlilimacosmeticos</span>
                </span>
              </span>
              <ArrowRight size={15} />
            </a>
            <div className="flex items-center gap-4 border-b border-[#DCC4BD] py-5">
              <MapPin size={17} className="shrink-0 text-[#966960]" />
              <span>
                <span className="block text-[9px] tracking-[.18em] text-[#927C75]">ENDEREÇO</span>
                <span className="mt-1 block text-[14px] leading-6 text-[#614331]">
                  Rua Antônio José da Silva, 620<br />Paranavaí–PR · CEP 87711-310
                </span>
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER (MARROM PROFUNDO #614331) ─────────── */}
      <footer className="bg-[#614331] px-5 py-14 text-[#FBFBFA] sm:px-8 lg:px-14">
        <div className="mx-auto grid max-w-[1200px] gap-10 sm:grid-cols-2 lg:grid-cols-3">
          {/* Col 1: Brand */}
          <div>
            <img
              src="/adli-logo.png"
              alt="Adli Lima Cosméticos"
              className="h-14 w-auto brightness-0 invert opacity-90"
            />
            <p className="mt-4 text-[12px] leading-6 text-[#DCC4BD]">
              Cuidado profissional, com o acolhimento de casa. Paranavaí, Paraná · Desde 2020.
            </p>
            <div className="mt-5 flex gap-3">
              <a
                href={instagramUrl}
                target="_blank"
                rel="noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-[#927C75] text-[#DCC4BD] transition hover:border-[#E7D1C7] hover:text-white"
              >
                <Instagram size={15} />
              </a>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-[#927C75] text-[#DCC4BD] transition hover:border-[#E7D1C7] hover:text-white"
              >
                <MessageCircle size={15} />
              </a>
              <a
                href={emailUrl}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-[#927C75] text-[#DCC4BD] transition hover:border-[#E7D1C7] hover:text-white"
              >
                <Mail size={15} />
              </a>
            </div>
          </div>

          {/* Col 2: Links */}
          <div>
            <h4 className="mb-4 text-[11px] font-bold tracking-[.14em] text-[#FBFBFA]">
              LINKS RÁPIDOS
            </h4>
            <ul className="space-y-3 text-[12px] text-[#DCC4BD]">
              <li><a href="#inicio" className="transition hover:text-white">Início</a></li>
              <li><a href="#produtos" className="transition hover:text-white">Produtos</a></li>
              <li><a href="#categorias" className="transition hover:text-white">Categorias</a></li>
              <li><a href="#sobre" className="transition hover:text-white">Sobre Nós</a></li>
              <li><a href="#contato" className="transition hover:text-white">Contato</a></li>
            </ul>
          </div>

          {/* Col 3: Support */}
          <div>
            <h4 className="mb-4 text-[11px] font-bold tracking-[.14em] text-[#FBFBFA]">
              ATENDIMENTO
            </h4>
            <ul className="space-y-3 text-[12px] text-[#DCC4BD]">
              <li><a href="/fale-conosco" className="transition hover:text-white">Fale Conosco</a></li>
              <li><a href="/politica-de-envio" className="transition hover:text-white">Política de Envio</a></li>
              <li><a href="/trocas-e-devolucoes" className="transition hover:text-white">Trocas e Devoluções</a></li>
              <li><a href="/termos-e-condicoes" className="transition hover:text-white">Termos e Condições</a></li>
              <li><a href="/politica-de-privacidade" className="transition hover:text-white">Política de Privacidade</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mx-auto mt-10 flex max-w-[1200px] flex-col items-center justify-between gap-4 border-t border-[#927C75]/40 pt-6 sm:flex-row">
          <p className="text-[10px] text-[#DCC4BD]">
            © 2026 Adli Lima Cosméticos. Todos os direitos reservados. · CNPJ 61.681.521/0001-46
          </p>
          <a
            href="/admin"
            className="flex items-center gap-1.5 text-[10px] text-[#DCC4BD] transition hover:text-white"
            title="Acessar painel administrativo"
          >
            <Lock size={12} /> Área do Administrador
          </a>
        </div>
      </footer>

      {/* Floating Cart Pill */}
      {totalItems > 0 && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-40 flex items-center gap-2.5 rounded-full bg-[#966960] px-5 py-3.5 text-xs font-bold text-white shadow-xl transition-all duration-300 hover:scale-105 hover:bg-[#B68475] active:scale-95"
          aria-label="Ver Sacola"
        >
          <Package size={18} />
          <span>Ver Sacola ({totalItems})</span>
        </button>
      )}
    </main>
  );
}
