import { useState, useEffect, type FormEvent, type ChangeEvent } from 'react';
import {
  ArrowLeft,
  Check,
  Edit,
  Eye,
  EyeOff,
  Image as ImageIcon,
  Loader2,
  Lock,
  LogOut,
  Package,
  Plus,
  Save,
  Sliders,
  Star,
  Trash2,
  Truck,
  Upload,
  X,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import {
  type Product,
  categoryList,
  fallbackProducts,
  formatPrice,
} from '@/lib/products-data';
import {
  type StoreSettings,
  defaultStoreSettings,
  getLocalStoreSettings,
  saveLocalStoreSettings,
} from '@/lib/store-settings';
import { type Coupon } from '@/lib/cart-context';

const ADMIN_PASSWORD = 'cosmeticos2026on';

const emptyProduct: Omit<Product, 'id'> = {
  slug: '',
  name: '',
  description: '',
  price_cents: 0,
  image_url: '',
  category: 'Máscaras',
  is_active: true,
  is_featured: false,
  sort_order: 0,
};

export default function AdminPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(
    () => sessionStorage.getItem('adli-admin') === 'true',
  );
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');

  const [activeTab, setActiveTab] = useState<'products' | 'customize' | 'coupons'>('products');

  /* Coupons State */
  const [coupons, setCoupons] = useState<Coupon[]>(() => {
    try {
      const saved = localStorage.getItem('adli_coupons');
      return saved
        ? JSON.parse(saved)
        : [
            { id: '1', code: 'PRIMEIRACOMPRA', discountType: 'percentage', discountValue: 10, isActive: true },
            { id: '2', code: 'ADLILIMA15', discountType: 'percentage', discountValue: 15, isActive: true },
            { id: '3', code: 'CUIDADO20', discountType: 'fixed', discountValue: 2000, isActive: true },
          ];
    } catch {
      return [];
    }
  });

  const [couponDialogOpen, setCouponDialogOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [couponForm, setCouponForm] = useState<Omit<Coupon, 'id'>>({
    code: '',
    discountType: 'percentage',
    discountValue: 10,
    minPurchaseCents: 0,
    isActive: true,
  });

  /* Products State */
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [useSupabase, setUseSupabase] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState(emptyProduct);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);

  /* Customize State */
  const [settings, setSettings] = useState<StoreSettings>(getLocalStoreSettings);
  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsSuccess, setSettingsSuccess] = useState(false);

  /* ── Login ──────────────────────────────────────── */
  function handleLogin(e: FormEvent) {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      sessionStorage.setItem('adli-admin', 'true');
      setIsLoggedIn(true);
      setLoginError('');
    } else {
      setLoginError('Senha incorreta. A senha é: cosmeticos2026on');
    }
  }

  function handleLogout() {
    sessionStorage.removeItem('adli-admin');
    setIsLoggedIn(false);
  }

  /* ── Load products & settings ───────────────────── */
  async function loadData() {
    setLoading(true);
    if (supabase) {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('sort_order');
      if (!error && data && data.length > 0) {
        setProducts(data as Product[]);
        setUseSupabase(true);
        setStatusMsg('Conectado ao Supabase ✓');
      } else {
        setProducts(fallbackProducts);
        setUseSupabase(false);
        setStatusMsg(
          error
            ? 'Supabase não conectado — usando armazenamento local'
            : 'Tabela vazia — usando produtos locais',
        );
      }

      // Load settings from Supabase
      supabase
        .from('store_settings')
        .select('*')
        .eq('key', 'store_config')
        .maybeSingle()
        .then(({ data: conf }) => {
          if (conf && conf.value) {
            try {
              const parsed = JSON.parse(conf.value);
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
    } else {
      setProducts(fallbackProducts);
      setUseSupabase(false);
      setStatusMsg('Armazenamento local ativo');
    }
    setLoading(false);
  }

  useEffect(() => {
    if (isLoggedIn) loadData();
  }, [isLoggedIn]);

  /* ── Save Coupons Helper ───────────────────────── */
  async function saveCoupons(updatedCoupons: Coupon[]) {
    setCoupons(updatedCoupons);
    localStorage.setItem('adli_coupons', JSON.stringify(updatedCoupons));

    if (supabase) {
      await supabase.from('store_settings').upsert({
        key: 'store_coupons',
        value: JSON.stringify(updatedCoupons),
        updated_at: new Date().toISOString(),
      });
    }
  }

  function openCreateCoupon() {
    setEditingCoupon(null);
    setCouponForm({
      code: '',
      discountType: 'percentage',
      discountValue: 10,
      minPurchaseCents: 0,
      isActive: true,
    });
    setCouponDialogOpen(true);
  }

  function openEditCoupon(coupon: Coupon) {
    setEditingCoupon(coupon);
    setCouponForm({
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      minPurchaseCents: coupon.minPurchaseCents || 0,
      isActive: coupon.isActive,
    });
    setCouponDialogOpen(true);
  }

  function handleSaveCoupon(e: FormEvent) {
    e.preventDefault();
    if (!couponForm.code.trim()) return;

    if (editingCoupon) {
      const updated = coupons.map((c) =>
        c.id === editingCoupon.id
          ? {
              ...c,
              code: couponForm.code.trim().toUpperCase(),
              discountType: couponForm.discountType,
              discountValue: Number(couponForm.discountValue) || 0,
              minPurchaseCents: Number(couponForm.minPurchaseCents) || 0,
              isActive: couponForm.isActive,
            }
          : c,
      );
      saveCoupons(updated);
    } else {
      const newCoupon: Coupon = {
        id: Date.now().toString(),
        code: couponForm.code.trim().toUpperCase(),
        discountType: couponForm.discountType,
        discountValue: Number(couponForm.discountValue) || 0,
        minPurchaseCents: Number(couponForm.minPurchaseCents) || 0,
        isActive: couponForm.isActive,
      };
      saveCoupons([...coupons, newCoupon]);
    }

    setCouponDialogOpen(false);
    setEditingCoupon(null);
    setCouponForm({
      code: '',
      discountType: 'percentage',
      discountValue: 10,
      minPurchaseCents: 0,
      isActive: true,
    });
  }

  function toggleCouponActive(couponId: string) {
    const updated = coupons.map((c) =>
      c.id === couponId ? { ...c, isActive: !c.isActive } : c,
    );
    saveCoupons(updated);
  }

  function deleteCoupon(couponId: string) {
    if (!confirm('Deseja excluir este cupom?')) return;
    const updated = coupons.filter((c) => c.id !== couponId);
    saveCoupons(updated);
  }

  /* ── Save Settings ──────────────────────────────── */
  async function handleSaveSettings(e: FormEvent) {
    e.preventDefault();
    setSavingSettings(true);
    saveLocalStoreSettings(settings);

    if (supabase) {
      await supabase.from('store_settings').upsert({
        key: 'store_config',
        value: JSON.stringify(settings),
        updated_at: new Date().toISOString(),
      });
    }

    setSavingSettings(false);
    setSettingsSuccess(true);
    setTimeout(() => setSettingsSuccess(false), 3000);
  }

  /* ── Generic Image Upload Helper ────────────────── */
  function handleImageFile(
    e: ChangeEvent<HTMLInputElement>,
    onLoaded: (base64: string) => void,
  ) {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          onLoaded(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  }

  /* ── CRUD Product Helpers ───────────────────────── */
  function openCreate() {
    setEditing(null);
    setForm({ ...emptyProduct, sort_order: products.length + 1 });
    setDialogOpen(true);
  }

  function openEdit(product: Product) {
    setEditing(product);
    setForm({
      slug: product.slug,
      name: product.name,
      description: product.description,
      price_cents: product.price_cents,
      image_url: product.image_url,
      category: product.category,
      is_active: product.is_active,
      is_featured: product.is_featured,
      sort_order: product.sort_order,
    });
    setDialogOpen(true);
  }

  async function handleSaveProduct(e: FormEvent) {
    e.preventDefault();
    setSaving(true);

    if (supabase) {
      if (editing) {
        const { error } = await supabase
          .from('products')
          .update({ ...form, updated_at: new Date().toISOString() })
          .eq('id', editing.id);
        if (error) alert('Erro ao atualizar no Supabase: ' + error.message);
      } else {
        const { error } = await supabase.from('products').insert(form);
        if (error) alert('Erro ao criar no Supabase: ' + error.message);
      }
      await loadData();
    } else {
      if (editing) {
        setProducts((prev) =>
          prev.map((p) => (p.id === editing.id ? { ...p, ...form } : p)),
        );
      } else {
        const newId = Math.max(0, ...products.map((p) => p.id)) + 1;
        setProducts((prev) => [...prev, { id: newId, ...form }]);
      }
    }

    setSaving(false);
    setDialogOpen(false);
  }

  async function handleDeleteProduct() {
    if (!deleteTarget) return;
    if (supabase) {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', deleteTarget.id);
      if (error) alert('Erro ao excluir no Supabase: ' + error.message);
      await loadData();
    } else {
      setProducts((prev) => prev.filter((p) => p.id !== deleteTarget.id));
    }
    setDeleteTarget(null);
  }

  function slugify(text: string) {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }

  /* ════════════════════════════════════════════════════
     TELA DE LOGIN (SOMENTE SENHA)
     ════════════════════════════════════════════════════ */
  if (!isLoggedIn) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center bg-gradient-to-br from-[#f0e0d4] via-[#f5ece3] to-[#f8f4eb] px-4">
        <div className="w-full max-w-[400px] rounded-2xl border border-[#e4dbcf] bg-white p-8 shadow-xl">
          <div className="text-center">
            <img src="/adli-logo.png" alt="Adli Lima" className="mx-auto h-16 object-contain" />
            <h1 className="mt-4 text-xl font-bold text-[#443a35]">
              Área do Administrador
            </h1>
            <p className="mt-1 text-xs text-[#91857a]">
              Acesso exclusivo para gerenciar a loja
            </p>
          </div>

          <form onSubmit={handleLogin} className="mt-6 space-y-4">
            <div>
              <label className="block text-[11px] font-semibold tracking-wider text-[#665b54] mb-1">
                SENHA DE ACESSO
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Digite a senha..."
                  className="w-full rounded-xl border border-[#e4dbcf] bg-[#faf8f4] px-4 py-3 pr-10 text-sm text-[#443a35] placeholder:text-[#b8ad9f] focus:border-[#a66e68] focus:outline-none focus:ring-2 focus:ring-[#a66e68]/20"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#b8ad9f] hover:text-[#665b54]"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {loginError && (
              <p className="rounded-lg bg-red-50 p-2.5 text-center text-xs text-red-600">
                {loginError}
              </p>
            )}

            <button
              type="submit"
              className="w-full rounded-xl bg-[#966960] py-3 text-xs font-bold tracking-wider text-white shadow transition hover:bg-[#B68475]"
            >
              ENTRAR NO PAINEL
            </button>
          </form>

          <a
            href="/"
            className="mt-6 flex items-center justify-center gap-1.5 text-xs text-[#a66e68] transition hover:underline"
          >
            <ArrowLeft size={14} /> Voltar para a loja
          </a>
        </div>
      </div>
    );
  }

  /* ════════════════════════════════════════════════════
     DASHBOARD ADMINISTRATIVO
     ════════════════════════════════════════════════════ */
  return (
    <div className="min-h-screen bg-[#f8f4eb] text-[#39312d]">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-[#e4dbcf] bg-white/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-[1300px] items-center justify-between px-5 py-3.5">
          <div className="flex items-center gap-3">
            <a href="/">
              <img src="/adli-logo.png" alt="Adli Lima" className="h-10 object-contain" />
            </a>
            <span className="rounded-full bg-[#f5efe6] px-2.5 py-0.5 text-[10px] font-bold tracking-wider text-[#966960]">
              PAINEL ADMIN
            </span>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="/"
              target="_blank"
              rel="noreferrer"
              className="rounded-lg border border-[#e4dbcf] px-3.5 py-1.5 text-xs font-medium text-[#665b54] transition hover:bg-[#f5efe6]"
            >
              Visualizar Loja
            </a>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 rounded-lg border border-[#e4dbcf] px-3.5 py-1.5 text-xs font-medium text-[#665b54] transition hover:bg-[#f5efe6]"
            >
              <LogOut size={13} /> Sair
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="mx-auto max-w-[1300px] px-5 py-8">
        {/* Navigation Tabs */}
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4 border-b border-[#e4dbcf] pb-4">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('products')}
              className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-bold transition ${
                activeTab === 'products'
                  ? 'bg-[#966960] text-white shadow-sm'
                  : 'bg-white text-[#614331] border border-[#DCC4BD] hover:bg-[#ECDDD8]'
              }`}
            >
              <Package size={16} /> Produtos ({products.length})
            </button>
            <button
              onClick={() => setActiveTab('customize')}
              className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-bold transition ${
                activeTab === 'customize'
                  ? 'bg-[#966960] text-white shadow-sm'
                  : 'bg-white text-[#614331] border border-[#DCC4BD] hover:bg-[#ECDDD8]'
              }`}
            >
              <Sliders size={16} /> Personalizar Loja (Fotos & Textos)
            </button>
            <button
              onClick={() => setActiveTab('coupons')}
              className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-bold transition ${
                activeTab === 'coupons'
                  ? 'bg-[#966960] text-white shadow-sm'
                  : 'bg-white text-[#614331] border border-[#DCC4BD] hover:bg-[#ECDDD8]'
              }`}
            >
              <Star size={16} /> Cupons de Desconto ({coupons.length})
            </button>
          </div>

          <div className="text-xs text-[#91857a]">
            Status: <span className={useSupabase ? 'font-semibold text-green-700' : 'text-amber-700'}>{statusMsg}</span>
          </div>
        </div>

        {/* ── ABA 1: GERENCIAR PRODUTOS ─────────────── */}
        {activeTab === 'products' && (
          <div>
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
              <div>
                <h1 className="text-xl font-bold text-[#443a35]">Catálogo de Produtos</h1>
                <p className="mt-0.5 text-xs text-[#91857a]">
                  Cadastre novos produtos, suba fotos direto da galeria, altere preços e destaques
                </p>
              </div>

              <button
                onClick={openCreate}
                className="flex items-center gap-2 rounded-xl bg-[#966960] px-4 py-2.5 text-xs font-bold text-white shadow transition hover:bg-[#B68475]"
              >
                <Plus size={16} /> Adicionar Produto
              </button>
            </div>

            {loading ? (
              <div className="flex justify-center py-20">
                <Loader2 className="animate-spin text-[#a66e68]" size={32} />
              </div>
            ) : (
              <div className="overflow-x-auto rounded-2xl border border-[#e4dbcf] bg-white shadow-sm">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-[#f0e8df] bg-[#faf8f4]">
                      <th className="px-4 py-3.5 text-[10px] font-bold tracking-wider text-[#91857a]">#</th>
                      <th className="px-4 py-3.5 text-[10px] font-bold tracking-wider text-[#91857a]">IMAGEM</th>
                      <th className="px-4 py-3.5 text-[10px] font-bold tracking-wider text-[#91857a]">NOME DO PRODUTO</th>
                      <th className="hidden px-4 py-3.5 text-[10px] font-bold tracking-wider text-[#91857a] sm:table-cell">CATEGORIA</th>
                      <th className="px-4 py-3.5 text-[10px] font-bold tracking-wider text-[#91857a]">PREÇO</th>
                      <th className="hidden px-4 py-3.5 text-[10px] font-bold tracking-wider text-[#91857a] md:table-cell">STATUS</th>
                      <th className="px-4 py-3.5 text-right text-[10px] font-bold tracking-wider text-[#91857a]">AÇÕES</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((product, idx) => (
                      <tr key={product.id} className="border-b border-[#f5f0e8] transition hover:bg-[#fdfbf7]">
                        <td className="px-4 py-3.5 text-xs text-[#91857a]">{idx + 1}</td>
                        <td className="px-4 py-3.5">
                          <div className="h-12 w-12 overflow-hidden rounded-xl border border-[#f0e8df] bg-[#faf5f0]">
                            <img src={product.image_url} alt={product.name} className="h-full w-full object-contain p-1" />
                          </div>
                        </td>
                        <td className="px-4 py-3.5">
                          <p className="font-semibold text-[#443a35]">{product.name}</p>
                          <p className="text-[11px] text-[#b8ad9f]">{product.slug}</p>
                        </td>
                        <td className="hidden px-4 py-3.5 sm:table-cell">
                          <span className="rounded-full bg-[#f5efe6] px-3 py-1 text-[10px] font-medium text-[#665b54]">
                            {product.category}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 font-bold text-[#443a35]">
                          {formatPrice(product.price_cents)}
                        </td>
                        <td className="hidden px-4 py-3.5 md:table-cell">
                          <div className="flex gap-1.5">
                            {product.is_active ? (
                              <span className="rounded-full bg-green-50 px-2.5 py-0.5 text-[10px] font-semibold text-green-700">
                                Ativo
                              </span>
                            ) : (
                              <span className="rounded-full bg-red-50 px-2.5 py-0.5 text-[10px] font-semibold text-red-600">
                                Inativo
                              </span>
                            )}
                            {product.is_featured && (
                              <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-[10px] font-semibold text-amber-700">
                                <Star size={9} className="mb-px mr-0.5 inline fill-amber-500 text-amber-500" />
                                Destaque
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3.5 text-right">
                          <div className="flex justify-end gap-1.5">
                            <button
                              onClick={() => openEdit(product)}
                              className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#e4dbcf] text-[#665b54] transition hover:bg-[#f5efe6]"
                              title="Editar"
                            >
                              <Edit size={14} />
                            </button>
                            <button
                              onClick={() => setDeleteTarget(product)}
                              className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#e4dbcf] text-red-400 transition hover:bg-red-50"
                              title="Excluir"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ── ABA 2: PERSONALIZAR LOJA (TODAS AS FOTOS E TEXTOS) ─ */}
        {activeTab === 'customize' && (
          <div className="max-w-[900px]">
            <div className="mb-6">
              <h1 className="text-xl font-bold text-[#443a35]">Personalização Visual da Loja</h1>
              <p className="mt-0.5 text-xs text-[#91857a]">
                Faça upload de fotos diretamente da sua galeria (PNG, JPG, WEBP) para qualquer seção do site
              </p>
            </div>

            <form onSubmit={handleSaveSettings} className="space-y-6">
              {/* 1. FOTO DA HERO */}
              <div className="rounded-2xl border border-[#e4dbcf] bg-white p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <ImageIcon size={18} className="text-[#a66e68]" />
                  <h2 className="text-sm font-bold text-[#443a35]">1. Foto do Banner da Hero (Fora a Fora)</h2>
                </div>
                <p className="text-xs text-[#91857a] mb-4">
                  Esta foto ocupa toda a largura no topo da página principal.
                </p>

                {/* Preview */}
                <div className="mb-4 overflow-hidden rounded-xl border border-[#e4dbcf] bg-[#f8f5ee]">
                  <div className="relative aspect-[16/7] w-full max-h-[260px]">
                    <img
                      src={settings.hero_image}
                      alt="Banner Preview"
                      className="h-full w-full object-cover object-center"
                    />
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <label className="flex cursor-pointer items-center gap-2 rounded-xl bg-[#966960] px-4 py-2.5 text-xs font-bold text-white shadow transition hover:bg-[#B68475]">
                    <Upload size={16} /> Subir Foto da Galeria (PNG/JPG)
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) =>
                        handleImageFile(e, (base64) =>
                          setSettings((prev) => ({ ...prev, hero_image: base64 })),
                        )
                      }
                      className="hidden"
                    />
                  </label>
                  <span className="text-xs text-[#91857a]">ou caminho:</span>
                  <input
                    type="text"
                    value={settings.hero_image}
                    onChange={(e) => setSettings({ ...settings, hero_image: e.target.value })}
                    className="flex-1 min-w-[200px] rounded-xl border border-[#e4dbcf] px-3 py-2 text-xs focus:border-[#a66e68] focus:outline-none"
                  />
                </div>
              </div>

              {/* 2. CARROSSEL DE FOTOS E TEXTO DO QUEM SOMOS */}
              <div className="rounded-2xl border border-[#e4dbcf] bg-white p-6 shadow-sm space-y-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ImageIcon size={18} className="text-[#a66e68]" />
                    <h2 className="text-sm font-bold text-[#443a35]">
                      2. Galeria / Carrossel de Fotos "Quem Somos" (Fotos Ilimitadas)
                    </h2>
                  </div>
                  <span className="text-xs font-semibold text-[#a66e68]">
                    {(settings.about_images || []).length} fotos no slide
                  </span>
                </div>

                <p className="text-xs text-[#91857a]">
                  Estas fotos passam sozinhas a cada 3 segundos e podem ser arrastadas no celular ou tablet.
                </p>

                {/* Grade de Fotos do Slide com Excluir e Adicionar */}
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 md:grid-cols-5">
                  {(settings.about_images || ['/brand-editorial.webp']).map((img, idx) => (
                    <div
                      key={idx}
                      className="group relative aspect-square overflow-hidden rounded-xl border border-[#DCC4BD] bg-[#faf5f0]"
                    >
                      <img
                        src={img}
                        alt={`Foto ${idx + 1}`}
                        className="h-full w-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const currentImgs = settings.about_images || ['/brand-editorial.webp'];
                          if (currentImgs.length <= 1) {
                            alert('Mantenha pelo menos uma foto no carrossel.');
                            return;
                          }
                          const updated = currentImgs.filter((_, i) => i !== idx);
                          setSettings({ ...settings, about_images: updated });
                        }}
                        className="absolute right-1.5 top-1.5 flex h-7 w-7 items-center justify-center rounded-lg bg-red-600/90 text-white shadow transition hover:bg-red-700"
                        title="Remover foto"
                      >
                        <Trash2 size={13} />
                      </button>
                      <span className="absolute bottom-1.5 left-1.5 rounded bg-black/60 px-1.5 py-0.5 text-[9px] font-bold text-white">
                        #{idx + 1}
                      </span>
                    </div>
                  ))}

                  {/* Card de Adicionar Nova Foto */}
                  <label className="flex aspect-square cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-[#B68475] bg-[#FAF8F4] p-3 text-center transition hover:bg-[#ECDDD8]/50">
                    <Plus size={22} className="text-[#966960] mb-1" />
                    <span className="text-[11px] font-bold text-[#614331]">Adicionar Foto</span>
                    <span className="text-[9px] text-[#927C75]">PNG ou JPG</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) =>
                        handleImageFile(e, (base64) => {
                          const currentImgs = settings.about_images || [];
                          setSettings({ ...settings, about_images: [...currentImgs, base64] });
                        })
                      }
                      className="hidden"
                    />
                  </label>
                </div>

                {/* Textos da seção */}
                <div className="space-y-3 pt-4 border-t border-[#f0e8df]">
                  <h3 className="text-xs font-bold text-[#443a35]">Textos da Seção "Quem Somos":</h3>
                  <div>
                    <label className="block text-[11px] font-semibold text-[#665b54] mb-1">
                      TÍTULO DA SEÇÃO
                    </label>
                    <input
                      type="text"
                      value={settings.about_title}
                      onChange={(e) => setSettings({ ...settings, about_title: e.target.value })}
                      className="w-full rounded-xl border border-[#e4dbcf] px-3.5 py-2.5 text-xs focus:border-[#a66e68] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-[#665b54] mb-1">
                      PRIMEIRO PARÁGRAFO
                    </label>
                    <textarea
                      rows={3}
                      value={settings.about_text_1}
                      onChange={(e) => setSettings({ ...settings, about_text_1: e.target.value })}
                      className="w-full rounded-xl border border-[#e4dbcf] px-3.5 py-2.5 text-xs focus:border-[#a66e68] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-[#665b54] mb-1">
                      SEGUNDO PARÁGRAFO
                    </label>
                    <textarea
                      rows={2}
                      value={settings.about_text_2}
                      onChange={(e) => setSettings({ ...settings, about_text_2: e.target.value })}
                      className="w-full rounded-xl border border-[#e4dbcf] px-3.5 py-2.5 text-xs focus:border-[#a66e68] focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* 3. FOTO DO BANNER DE OFERTA ESPECIAL */}
              <div className="rounded-2xl border border-[#e4dbcf] bg-white p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <ImageIcon size={18} className="text-[#a66e68]" />
                  <h2 className="text-sm font-bold text-[#443a35]">3. Foto do Banner "Conheça toda a linha" (Oferta Especial)</h2>
                </div>
                <p className="text-xs text-[#91857a] mb-4">
                  Esta foto aparece ao lado do convite para conversar no WhatsApp.
                </p>

                <div className="flex flex-wrap items-center gap-6">
                  <div className="overflow-hidden rounded-xl border border-[#e4dbcf] bg-[#f8f5ee] h-28 w-44">
                    <img
                      src={settings.promo_image || '/brand-editorial.webp'}
                      alt="Banner Oferta"
                      className="h-full w-full object-cover"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="flex cursor-pointer items-center gap-2 rounded-xl bg-[#966960] px-4 py-2.5 text-xs font-bold text-white shadow transition hover:bg-[#B68475]">
                      <Upload size={16} /> Subir Foto da Galeria (PNG/JPG)
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) =>
                          handleImageFile(e, (base64) =>
                            setSettings((prev) => ({ ...prev, promo_image: base64 })),
                          )
                        }
                        className="hidden"
                      />
                    </label>
                    <p className="text-[11px] text-[#91857a]">Troque a foto editorial desta seção</p>
                  </div>
                </div>
              </div>

              {/* 4. FOTOS DAS 4 CATEGORIAS */}
              <div className="rounded-2xl border border-[#e4dbcf] bg-white p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <ImageIcon size={18} className="text-[#a66e68]" />
                  <h2 className="text-sm font-bold text-[#443a35]">4. Fotos das Bolinhas de Categorias</h2>
                </div>
                <p className="text-xs text-[#91857a] mb-5">
                  Suba fotos circulares para as 4 categorias do site:
                </p>

                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                  {(
                    [
                      { key: 'mascaras', name: 'Máscaras' },
                      { key: 'kits', name: 'Kits' },
                      { key: 'finalizadores', name: 'Finalizadores' },
                      { key: 'tratamentos', name: 'Tratamentos' },
                    ] as const
                  ).map((cat) => (
                    <div key={cat.key} className="flex flex-col items-center rounded-xl border border-[#f0e8df] p-3 text-center">
                      <div className="h-20 w-20 overflow-hidden rounded-full border-2 border-[#e8dfd4] bg-[#faf5f0] mb-2">
                        <img
                          src={settings.categories[cat.key]}
                          alt={cat.name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <span className="text-xs font-bold text-[#443a35] mb-2">{cat.name}</span>
                      <label className="cursor-pointer rounded-lg bg-[#f5efe6] px-2.5 py-1.5 text-[11px] font-semibold text-[#665b54] hover:bg-[#eae2d5]">
                        <Upload size={12} className="inline mr-1" /> Trocar
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) =>
                            handleImageFile(e, (base64) =>
                              setSettings((prev) => ({
                                ...prev,
                                categories: { ...prev.categories, [cat.key]: base64 },
                              })),
                            )
                          }
                          className="hidden"
                        />
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Seção: Envio e Retirada no Local */}
              <div className="rounded-2xl border border-[#e4dbcf] bg-white p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <Truck size={18} className="text-[#966960]" />
                  <h2 className="text-sm font-bold uppercase tracking-wider text-[#443a35]">
                    Envio & Retirada no Local
                  </h2>
                </div>
                <p className="text-xs text-[#91857a] mb-5">
                  Configure as opções de frete e retirada que aparecem para seus clientes na sacola.
                </p>

                <div className="space-y-4">
                  {/* Switch Retirada no Local */}
                  <label className="flex items-start gap-3 rounded-xl border border-[#ece3d8] bg-[#faf8f4] p-4 cursor-pointer hover:border-[#966960]/50 transition">
                    <input
                      type="checkbox"
                      checked={settings.pickup_enabled !== false}
                      onChange={(e) =>
                        setSettings({ ...settings, pickup_enabled: e.target.checked })
                      }
                      className="mt-0.5 h-4 w-4 rounded border-[#DCC4BD] accent-[#966960]"
                    />
                    <div>
                      <span className="text-xs font-bold text-[#614331]">
                        Ativar Opção de Retirada no Local
                      </span>
                      <p className="text-[11px] text-[#927C75] mt-0.5">
                        Quando <strong>ativo</strong>, a sacola <strong>não</strong> adiciona automaticamente o frete fixo. O cliente envia os dados com o valor total apenas dos produtos, podendo ligar o GPS para enviar a localização real ou retirar na loja. O frete é calculado por você diretamente no WhatsApp.
                      </p>
                    </div>
                  </label>

                  {/* Switch Frete Fixo Automático */}
                  <label className="flex items-start gap-3 rounded-xl border border-[#ece3d8] bg-[#faf8f4] p-4 cursor-pointer hover:border-[#966960]/50 transition">
                    <input
                      type="checkbox"
                      checked={Boolean(settings.fixed_shipping_enabled)}
                      onChange={(e) =>
                        setSettings({ ...settings, fixed_shipping_enabled: e.target.checked })
                      }
                      className="mt-0.5 h-4 w-4 rounded border-[#DCC4BD] accent-[#966960]"
                    />
                    <div>
                      <span className="text-xs font-bold text-[#614331]">
                        Cobrar Frete Fixo Automático (R$ 27,00 para o Paraná)
                      </span>
                      <p className="text-[11px] text-[#927C75] mt-0.5">
                        Se ativado e a retirada estiver desativada, a sacola somará R$ 27,00 automaticamente para clientes do PR. Se desativado, o frete fica sempre a calcular via WhatsApp.
                      </p>
                    </div>
                  </label>

                  {/* Endereço de Retirada */}
                  <div>
                    <label className="block text-[11px] font-semibold text-[#665b54] mb-1">
                      ENDEREÇO DA LOJA PARA RETIRADA
                    </label>
                    <input
                      type="text"
                      value={settings.pickup_address || ''}
                      onChange={(e) =>
                        setSettings({ ...settings, pickup_address: e.target.value })
                      }
                      placeholder="Ex: Rua Antônio José da Silva, 620 — Paranavaí/PR"
                      className="w-full rounded-xl border border-[#e4dbcf] px-3.5 py-2.5 text-xs focus:border-[#a66e68] focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Botão Flutuante de Salvar Alterações */}
              <div className="sticky bottom-4 z-20 flex items-center justify-between rounded-2xl border border-[#e4dbcf] bg-white/95 p-4 shadow-xl backdrop-blur-md">
                <span className="text-xs text-[#71665e]">
                  Lembre-se de salvar para aplicar as alterações no site:
                </span>
                <div className="flex items-center gap-3">
                  {settingsSuccess && (
                    <span className="flex items-center gap-1.5 text-xs font-semibold text-green-700">
                      <Check size={16} /> Salvo com sucesso!
                    </span>
                  )}
                  <button
                    type="submit"
                    disabled={savingSettings}
                    className="flex items-center gap-2 rounded-xl bg-[#966960] px-6 py-2.5 text-xs font-bold text-white shadow transition hover:bg-[#B68475] disabled:opacity-50"
                  >
                    {savingSettings ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
                    Salvar Personalizações
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}
        {/* ── ABA 3: CUPONS DE DESCONTO ─────────────── */}
        {activeTab === 'coupons' && (
          <div className="max-w-[850px]">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
              <div>
                <h1 className="text-xl font-bold text-[#443a35]">Cupons de Desconto</h1>
                <p className="mt-0.5 text-xs text-[#91857a]">
                  Crie cupons promocionais para seus clientes usarem na sacola
                </p>
              </div>

              <button
                onClick={openCreateCoupon}
                className="flex items-center gap-2 rounded-xl bg-[#966960] px-4 py-2.5 text-xs font-bold text-white shadow transition hover:bg-[#B68475]"
              >
                <Plus size={16} /> Criar Novo Cupom
              </button>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-[#e4dbcf] bg-white shadow-sm">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-[#f0e8df] bg-[#faf8f4]">
                    <th className="px-4 py-3.5 text-[10px] font-bold tracking-wider text-[#91857a]">CÓDIGO</th>
                    <th className="px-4 py-3.5 text-[10px] font-bold tracking-wider text-[#91857a]">TIPO</th>
                    <th className="px-4 py-3.5 text-[10px] font-bold tracking-wider text-[#91857a]">DESCONTO</th>
                    <th className="px-4 py-3.5 text-[10px] font-bold tracking-wider text-[#91857a]">COMPRA MÍNIMA</th>
                    <th className="px-4 py-3.5 text-[10px] font-bold tracking-wider text-[#91857a]">STATUS</th>
                    <th className="px-4 py-3.5 text-right text-[10px] font-bold tracking-wider text-[#91857a]">AÇÕES</th>
                  </tr>
                </thead>
                <tbody>
                  {coupons.map((coupon) => (
                    <tr key={coupon.id} className="border-b border-[#f5f0e8] transition hover:bg-[#fdfbf7]">
                      <td className="px-4 py-3.5">
                        <span className="font-mono text-xs font-bold text-[#443a35] bg-[#faf6f0] px-2.5 py-1 rounded-md border border-[#e8dfd4]">
                          {coupon.code}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-xs text-[#665b54]">
                        {coupon.discountType === 'percentage' ? 'Porcentagem (%)' : 'Valor Fixo (R$)'}
                      </td>
                      <td className="px-4 py-3.5 text-xs font-bold text-[#a66e68]">
                        {coupon.discountType === 'percentage'
                          ? `${coupon.discountValue}% OFF`
                          : formatPrice(coupon.discountValue)}
                      </td>
                      <td className="px-4 py-3.5 text-xs font-semibold text-[#614331]">
                        {coupon.minPurchaseCents && coupon.minPurchaseCents > 0
                          ? `A partir de ${formatPrice(coupon.minPurchaseCents)}`
                          : 'Qualquer valor (R$ 0)'}
                      </td>
                      <td className="px-4 py-3.5">
                        <button
                          onClick={() => toggleCouponActive(coupon.id)}
                          className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold transition ${
                            coupon.isActive
                              ? 'bg-green-100 text-green-800 hover:bg-green-200'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          {coupon.isActive ? 'Ativo' : 'Pausado'}
                        </button>
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <div className="flex justify-end gap-1.5">
                          <button
                            onClick={() => openEditCoupon(coupon)}
                            className="rounded-lg border border-[#e4dbcf] p-1.5 text-[#665b54] transition hover:bg-[#f5efe6] hover:text-[#966960]"
                            title="Editar Cupom"
                          >
                            <Edit size={14} />
                          </button>
                          <button
                            onClick={() => deleteCoupon(coupon.id)}
                            className="rounded-lg border border-[#e4dbcf] p-1.5 text-red-400 transition hover:bg-red-50 hover:text-red-600"
                            title="Excluir Cupom"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {coupons.length === 0 && (
                <div className="py-12 text-center text-xs text-[#91857a]">
                  Nenhum cupom cadastrado no momento.
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* ── DIALOG DE CRIAR / EDITAR PRODUTO ────────── */}
      {dialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="max-h-[90dvh] w-full max-w-[540px] overflow-y-auto rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#f0e8df] px-6 py-4">
              <h2 className="text-base font-bold text-[#443a35]">
                {editing ? 'Editar Produto' : 'Adicionar Novo Produto'}
              </h2>
              <button onClick={() => setDialogOpen(false)} className="text-[#b8ad9f] hover:text-[#665b54]">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4 px-6 py-5">
              <div>
                <label className="block text-[11px] font-semibold text-[#665b54] mb-1">
                  NOME DO PRODUTO
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => {
                    setForm({
                      ...form,
                      name: e.target.value,
                      slug: editing ? form.slug : slugify(e.target.value),
                    });
                  }}
                  required
                  placeholder="Ex: Máscara Teia Restauradora"
                  className="w-full rounded-xl border border-[#e4dbcf] px-3.5 py-2.5 text-xs focus:border-[#a66e68] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#665b54] mb-1">
                  SLUG (IDENTIFICADOR ÚNICO)
                </label>
                <input
                  type="text"
                  value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: e.target.value })}
                  required
                  placeholder="mascara-teia"
                  className="w-full rounded-xl border border-[#e4dbcf] px-3.5 py-2.5 text-xs focus:border-[#a66e68] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#665b54] mb-1">
                  DESCRIÇÃO DETALHADA
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  required
                  rows={3}
                  placeholder="Descreva os benefícios, ativos e modo de usar..."
                  className="w-full rounded-xl border border-[#e4dbcf] px-3.5 py-2.5 text-xs focus:border-[#a66e68] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-[#665b54] mb-1">
                    PREÇO (R$)
                  </label>
                  <input
                    type="text"
                    value={(form.price_cents / 100).toFixed(2).replace('.', ',')}
                    onChange={(e) => {
                      const val = e.target.value.replace(',', '.');
                      const cents = Math.round(parseFloat(val || '0') * 100);
                      setForm({ ...form, price_cents: isNaN(cents) ? 0 : cents });
                    }}
                    required
                    placeholder="80,00"
                    className="w-full rounded-xl border border-[#e4dbcf] px-3.5 py-2.5 text-xs focus:border-[#a66e68] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#665b54] mb-1">
                    CATEGORIA
                  </label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full rounded-xl border border-[#e4dbcf] px-3.5 py-2.5 text-xs focus:border-[#a66e68] focus:outline-none"
                  >
                    {categoryList.map((c) => (
                      <option key={c.name} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Foto do Produto */}
              <div>
                <label className="block text-[11px] font-semibold text-[#665b54] mb-1">
                  IMAGEM DO PRODUTO (GALERIA OU URL)
                </label>
                <div className="flex items-center gap-3">
                  <label className="flex cursor-pointer items-center gap-1.5 rounded-xl border border-dashed border-[#c5b8a9] bg-[#faf8f5] px-3 py-2 text-xs font-semibold text-[#665b54] hover:bg-[#f0e8de]">
                    <Upload size={14} /> Subir da Galeria (PNG/JPG)
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) =>
                        handleImageFile(e, (base64) =>
                          setForm((prev) => ({ ...prev, image_url: base64 })),
                        )
                      }
                      className="hidden"
                    />
                  </label>
                  <span className="text-[11px] text-[#91857a]">ou caminho:</span>
                </div>
                <input
                  type="text"
                  value={form.image_url}
                  onChange={(e) => setForm({ ...form, image_url: e.target.value })}
                  placeholder="/products/mascara-teia.webp"
                  className="mt-2 w-full rounded-xl border border-[#e4dbcf] px-3.5 py-2 text-xs focus:border-[#a66e68] focus:outline-none"
                />

                {form.image_url && (
                  <div className="mt-2 flex h-16 w-16 items-center justify-center overflow-hidden rounded-xl border border-[#f0e8df] bg-[#faf5f0]">
                    <img src={form.image_url} alt="Preview" className="h-full w-full object-contain p-1" />
                  </div>
                )}
              </div>

              {/* Toggles */}
              <div className="flex gap-6 pt-2">
                <label className="flex items-center gap-2 text-xs font-medium text-[#443a35]">
                  <input
                    type="checkbox"
                    checked={form.is_active}
                    onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                    className="h-4 w-4 rounded border-[#e4dbcf] accent-[#966960]"
                  />
                  Produto Ativo no Catálogo
                </label>

                <label className="flex items-center gap-2 text-xs font-medium text-[#443a35]">
                  <input
                    type="checkbox"
                    checked={form.is_featured}
                    onChange={(e) => setForm({ ...form, is_featured: e.target.checked })}
                    className="h-4 w-4 rounded border-[#e4dbcf] accent-[#a66e68]"
                  />
                  Destacar nos "Mais Vendidos"
                </label>
              </div>

              <div className="flex justify-end gap-2.5 border-t border-[#f0e8df] pt-4">
                <button
                  type="button"
                  onClick={() => setDialogOpen(false)}
                  className="rounded-xl border border-[#e4dbcf] px-4 py-2 text-xs font-medium text-[#665b54] hover:bg-[#f5efe6]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-1.5 rounded-xl bg-[#966960] px-5 py-2 text-xs font-bold text-white transition hover:bg-[#B68475] disabled:opacity-50"
                >
                  {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                  {editing ? 'Salvar Alterações' : 'Criar Produto'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── DIALOG DE CRIAR CUPOM ──────────────────── */}
      {couponDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-[420px] rounded-2xl bg-white shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between border-b border-[#f0e8df] px-6 py-4">
              <h2 className="text-base font-bold text-[#443a35]">
                {editingCoupon ? 'Editar Cupom de Desconto' : 'Novo Cupom de Desconto'}
              </h2>
              <button onClick={() => setCouponDialogOpen(false)} className="text-[#b8ad9f] hover:text-[#665b54]">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveCoupon} className="space-y-4 px-6 py-5">
              <div>
                <label className="block text-[11px] font-semibold text-[#665b54] mb-1">
                  CÓDIGO DO CUPOM *
                </label>
                <input
                  type="text"
                  value={couponForm.code}
                  onChange={(e) => setCouponForm({ ...couponForm, code: e.target.value.toUpperCase() })}
                  required
                  placeholder="Ex: NOVIDADE10"
                  className="w-full rounded-xl border border-[#e4dbcf] px-3.5 py-2.5 text-xs uppercase font-mono focus:border-[#a66e68] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-[#665b54] mb-1">
                    TIPO DE DESCONTO
                  </label>
                  <select
                    value={couponForm.discountType}
                    onChange={(e) =>
                      setCouponForm({
                        ...couponForm,
                        discountType: e.target.value as 'percentage' | 'fixed',
                      })
                    }
                    className="w-full rounded-xl border border-[#e4dbcf] px-3 py-2 text-xs focus:border-[#a66e68] focus:outline-none"
                  >
                    <option value="percentage">Porcentagem (%)</option>
                    <option value="fixed">Valor Fixo (R$)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#665b54] mb-1">
                    VALOR DO DESCONTO *
                  </label>
                  <input
                    type="number"
                    value={
                      couponForm.discountType === 'percentage'
                        ? couponForm.discountValue
                        : (couponForm.discountValue / 100).toFixed(0)
                    }
                    onChange={(e) => {
                      const val = parseFloat(e.target.value) || 0;
                      setCouponForm({
                        ...couponForm,
                        discountValue:
                          couponForm.discountType === 'percentage' ? val : Math.round(val * 100),
                      });
                    }}
                    required
                    min={1}
                    placeholder={couponForm.discountType === 'percentage' ? '10' : '15'}
                    className="w-full rounded-xl border border-[#e4dbcf] px-3.5 py-2 text-xs focus:border-[#a66e68] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#665b54] mb-1">
                  VALOR MÍNIMO DO PEDIDO (R$)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={
                      couponForm.minPurchaseCents && couponForm.minPurchaseCents > 0
                        ? (couponForm.minPurchaseCents / 100).toFixed(0)
                        : 0
                    }
                    onChange={(e) => {
                      const val = parseFloat(e.target.value) || 0;
                      setCouponForm({
                        ...couponForm,
                        minPurchaseCents: Math.round(val * 100),
                      });
                    }}
                    min={0}
                    placeholder="0"
                    className="w-full rounded-xl border border-[#e4dbcf] px-3.5 py-2 text-xs focus:border-[#a66e68] focus:outline-none"
                  />
                </div>
                <p className="mt-1 text-[10px] text-[#91857a]">
                  Exemplo: digite <strong>150</strong> para valer apenas acima de R$ 150,00. Digite <strong>0</strong> para valer para qualquer valor.
                </p>
              </div>

              <div>
                <label className="flex items-center gap-2 text-xs font-medium text-[#443a35]">
                  <input
                    type="checkbox"
                    checked={couponForm.isActive}
                    onChange={(e) => setCouponForm({ ...couponForm, isActive: e.target.checked })}
                    className="h-4 w-4 rounded border-[#e4dbcf] accent-[#966960]"
                  />
                  Cupom Ativo Imediatamente
                </label>
              </div>

              <div className="flex justify-end gap-2.5 border-t border-[#f0e8df] pt-4">
                <button
                  type="button"
                  onClick={() => setCouponDialogOpen(false)}
                  className="rounded-xl border border-[#e4dbcf] px-4 py-2 text-xs font-medium text-[#665b54] hover:bg-[#f5efe6]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 rounded-xl bg-[#966960] px-5 py-2 text-xs font-bold text-white transition hover:bg-[#B68475]"
                >
                  <Save size={14} /> {editingCoupon ? 'Salvar Alterações' : 'Criar Cupom'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── DIALOG DE EXCLUSÃO ──────────────────────── */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-[380px] rounded-2xl bg-white p-6 shadow-2xl">
            <h2 className="text-base font-bold text-[#443a35]">Excluir produto?</h2>
            <p className="mt-2 text-xs text-[#71665e]">
              Deseja remover <strong>{deleteTarget.name}</strong> da loja?
            </p>
            <div className="mt-6 flex justify-end gap-2.5">
              <button
                onClick={() => setDeleteTarget(null)}
                className="rounded-xl border border-[#e4dbcf] px-4 py-2 text-xs font-medium text-[#665b54] hover:bg-[#f5efe6]"
              >
                Cancelar
              </button>
              <button
                onClick={handleDeleteProduct}
                className="flex items-center gap-1.5 rounded-xl bg-red-500 px-4 py-2 text-xs font-bold text-white hover:bg-red-600"
              >
                <Trash2 size={14} /> Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
