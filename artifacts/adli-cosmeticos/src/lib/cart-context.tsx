import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { type Product } from '@/lib/products-data';
import { supabase } from '@/lib/supabase';
import { getLocalStoreSettings, type StoreSettings } from '@/lib/store-settings';

export interface Coupon {
  id: string;
  code: string;
  discountType: 'percentage' | 'fixed'; // '%' ou 'R$'
  discountValue: number; // ex: 10 para 10% ou 1500 para R$ 15,00
  minPurchaseCents: number; // 0 para qualquer valor, ou em centavos (ex: 15000 para R$ 150,00)
  isActive: boolean;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface CustomerInfo {
  name: string;
  city: string;
  state: string;
  address: string;
  notes?: string;
  deliveryMethod: 'delivery' | 'pickup'; // 'delivery' ou 'pickup'
  locationUrl?: string; // Link direto do Google Maps obtido via GPS
}

interface CartContextType {
  items: CartItem[];
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  subtotalCents: number;
  
  // Coupons
  coupons: Coupon[];
  appliedCoupon: Coupon | null;
  applyCoupon: (code: string) => { success: boolean; message: string };
  removeCoupon: () => void;
  discountCents: number;
  
  // Shipping & Total
  shippingCents: number;
  customShippingCents: number;
  setCustomShippingCents: (cents: number) => void;
  totalCents: number;
  isParana: boolean;
  storeSettings: StoreSettings;
  isPickupActive: boolean;
  
  // Customer info
  customer: CustomerInfo;
  setCustomer: React.Dispatch<React.SetStateAction<CustomerInfo>>;
  
  // WhatsApp generator
  generateWhatsAppUrl: () => string;
  generateShippingQuoteWhatsAppUrl: () => string;
}

const defaultCoupons: Coupon[] = [
  { id: '1', code: 'PRIMEIRACOMPRA', discountType: 'percentage', discountValue: 10, minPurchaseCents: 0, isActive: true },
  { id: '2', code: 'ADLILIMA15', discountType: 'percentage', discountValue: 15, minPurchaseCents: 15000, isActive: true },
  { id: '3', code: 'CUIDADO20', discountType: 'fixed', discountValue: 2000, minPurchaseCents: 15000, isActive: true },
];

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('adli_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isOpen, setIsOpen] = useState(false);
  const [coupons, setCoupons] = useState<Coupon[]>(() => {
    try {
      const saved = localStorage.getItem('adli_coupons');
      return saved ? JSON.parse(saved) : defaultCoupons;
    } catch {
      return defaultCoupons;
    }
  });

  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);

  const [storeSettings, setStoreSettings] = useState<StoreSettings>(getLocalStoreSettings);

  const [customShippingCents, setCustomShippingCents] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('adli_custom_shipping');
      return saved ? Number(saved) : 0;
    } catch {
      return 0;
    }
  });

  const [customer, setCustomer] = useState<CustomerInfo>(() => {
    try {
      const saved = localStorage.getItem('adli_customer');
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          name: parsed.name || '',
          city: parsed.city || 'Paranavaí',
          state: parsed.state || 'PR',
          address: parsed.address || '',
          notes: parsed.notes || '',
          deliveryMethod: parsed.deliveryMethod || 'delivery',
          locationUrl: parsed.locationUrl || '',
        };
      }
    } catch {}
    return {
      name: '',
      city: 'Paranavaí',
      state: 'PR',
      address: '',
      notes: '',
      deliveryMethod: 'delivery',
      locationUrl: '',
    };
  });

  // Sync cart to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('adli_cart', JSON.stringify(items));
    } catch {}
  }, [items]);

  // Sync customer to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('adli_customer', JSON.stringify(customer));
    } catch {}
  }, [customer]);

  // Sync customShippingCents to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('adli_custom_shipping', customShippingCents.toString());
    } catch {}
  }, [customShippingCents]);

  // Load store settings from Supabase or localStorage
  useEffect(() => {
    const handleStorage = () => setStoreSettings(getLocalStoreSettings());
    window.addEventListener('storage', handleStorage);

    if (supabase) {
      supabase
        .from('store_settings')
        .select('*')
        .eq('key', 'store_config')
        .maybeSingle()
        .then(({ data }) => {
          if (data && data.value) {
            try {
              const parsed = JSON.parse(data.value);
              setStoreSettings((prev) => ({ ...prev, ...parsed }));
            } catch {}
          }
        });
    }

    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  // Load coupons from Supabase if available
  useEffect(() => {
    if (supabase) {
      supabase
        .from('store_settings')
        .select('*')
        .eq('key', 'store_coupons')
        .maybeSingle()
        .then(({ data }) => {
          if (data && data.value) {
            try {
              const parsed = JSON.parse(data.value);
              if (Array.isArray(parsed) && parsed.length > 0) {
                setCoupons(parsed);
                localStorage.setItem('adli_coupons', JSON.stringify(parsed));
              }
            } catch {}
          }
        });
    }
  }, []);

  // Cart operations
  const addItem = (product: Product, quantity = 1) => {
    setItems((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item,
        );
      }
      return [...prev, { product, quantity }];
    });
    setIsOpen(true);
  };

  const removeItem = (productId: number) => {
    setItems((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const updateQuantity = (productId: number, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId);
      return;
    }
    setItems((prev) =>
      prev.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item,
      ),
    );
  };

  const clearCart = () => {
    setItems([]);
    setAppliedCoupon(null);
  };

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  const subtotalCents = items.reduce(
    (sum, item) => sum + item.product.price_cents * item.quantity,
    0,
  );

  // Coupon handling
  const applyCoupon = (code: string) => {
    const clean = code.trim().toUpperCase();
    const found = coupons.find(
      (c) => c.code.toUpperCase() === clean && c.isActive,
    );
    if (!found) {
      return { success: false, message: 'Cupom inválido ou expirado.' };
    }

    const minCents = found.minPurchaseCents || 0;
    if (minCents > 0 && subtotalCents < minCents) {
      const minFormatted = (minCents / 100).toFixed(2).replace('.', ',');
      const diffFormatted = ((minCents - subtotalCents) / 100).toFixed(2).replace('.', ',');
      return {
        success: false,
        message: `Este cupom é válido para compras acima de R$ ${minFormatted}. Faltam R$ ${diffFormatted}!`,
      };
    }

    setAppliedCoupon(found);
    return { success: true, message: `Cupom ${found.code} aplicado com sucesso!` };
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
  };

  // Discount calculation
  let discountCents = 0;
  if (appliedCoupon && subtotalCents > 0) {
    if (appliedCoupon.discountType === 'percentage') {
      discountCents = Math.round((subtotalCents * appliedCoupon.discountValue) / 100);
    } else {
      discountCents = Math.min(appliedCoupon.discountValue, subtotalCents);
    }
  }

  // Shipping calculation:
  // Se for retirada: grátis (R$ 0,00)
  // Se for entrega no Paraná (PR): Frete Fixo de R$ 27,00
  // Se for entrega em demais estados: A calcular no WhatsApp (R$ 0,00 adicionado)
  const isPickupActive = storeSettings.pickup_enabled !== false;
  const isPickup = isPickupActive && customer.deliveryMethod === 'pickup';

  const isParana =
    customer.state.trim().toUpperCase() === 'PR' ||
    customer.state.trim().toLowerCase().includes('paraná') ||
    customer.state.trim().toLowerCase().includes('parana');

  const shippingCents = isPickup ? 0 : isParana ? 2700 : customShippingCents;
  const totalCents = Math.max(0, subtotalCents - discountCents + shippingCents);

  // WhatsApp shipping quote builder
  const generateShippingQuoteWhatsAppUrl = () => {
    const phoneNumber = '5544997303797';
    let msg = `🌸 *CONSULTA DE FRETE — Adli Lima Cosméticos* 🌸\n\n`;
    msg += `Olá! Gostaria de consultar o valor do frete para o meu CEP/endereço antes de realizar o pagamento:\n\n`;
    msg += `👤 *Cliente:* ${customer.name || 'Não informado'}\n`;
    msg += `📍 *Destino:* ${customer.city || 'Minha Cidade'} - ${customer.state || 'UF'}\n`;
    if (customer.address) {
      msg += `🏠 *Endereço:* ${customer.address}\n`;
    }
    if (customer.locationUrl) {
      msg += `📍 *Localização GPS:* ${customer.locationUrl}\n`;
    }
    msg += `\n🛒 *ITENS NA SACOLA:*\n`;
    items.forEach((item) => {
      msg += `• ${item.quantity}x ${item.product.name}\n`;
    });
    msg += `\nQual seria o valor do frete para essa entrega? Aguardo o valor para somar ao pedido e concluir o pagamento. Obrigada! ✨`;

    return `https://wa.me/${phoneNumber}?text=${encodeURIComponent(msg)}`;
  };

  // WhatsApp message builder
  const generateWhatsAppUrl = () => {
    const phoneNumber = '5544997303797';
    let msg = `🌸 *NOVO PEDIDO — Adli Lima Cosméticos* 🌸\n\n`;

    // Customer info
    msg += `👤 *Cliente:* ${customer.name || 'Não informado'}\n`;
    msg += `📍 *Cidade / Estado:* ${customer.city || 'Paranavaí'} - ${customer.state || 'PR'}\n`;

    if (customer.deliveryMethod === 'pickup') {
      msg += `📦 *Modalidade:* 🏪 Retirada no Local (Grátis)\n`;
      msg += `🏬 *Local da Loja:* ${storeSettings.pickup_address}\n`;
    } else {
      msg += `📦 *Modalidade:* 🚚 Entrega no Endereço\n`;
      if (customer.address) {
        msg += `🏠 *Endereço:* ${customer.address}\n`;
      }
      if (customer.locationUrl) {
        msg += `📍 *Localização GPS (Google Maps):* ${customer.locationUrl}\n`;
      }
    }

    if (customer.notes) {
      msg += `📝 *Observação:* ${customer.notes}\n`;
    }
    msg += `\n🛒 *ITENS DO PEDIDO:*\n`;

    // Items
    items.forEach((item) => {
      const itemTotal = (item.product.price_cents * item.quantity) / 100;
      msg += `• ${item.quantity}x ${item.product.name} — R$ ${itemTotal.toFixed(2).replace('.', ',')}\n`;
    });

    msg += `\n───────────────\n`;
    msg += `Subtotal: R$ ${(subtotalCents / 100).toFixed(2).replace('.', ',')}\n`;

    if (appliedCoupon && discountCents > 0) {
      const descVal =
        appliedCoupon.discountType === 'percentage'
          ? `${appliedCoupon.discountValue}%`
          : `R$ ${(appliedCoupon.discountValue / 100).toFixed(2).replace('.', ',')}`;
      msg += `🎟️ Cupom (${appliedCoupon.code}): -R$ ${(discountCents / 100).toFixed(2).replace('.', ',')} (${descVal})\n`;
    }

    if (isPickup) {
      msg += `🚚 Frete: Grátis (Retirada no Local)\n`;
      msg += `*TOTAL ESTIMADO: R$ ${(totalCents / 100).toFixed(2).replace('.', ',')}*\n`;
    } else if (isParana) {
      msg += `🚚 Frete Fixo (Paraná): R$ 27,00\n`;
      msg += `*TOTAL ESTIMADO: R$ ${(totalCents / 100).toFixed(2).replace('.', ',')}*\n`;
    } else if (customShippingCents > 0) {
      msg += `🚚 Frete Consultado: R$ ${(customShippingCents / 100).toFixed(2).replace('.', ',')}\n`;
      msg += `*TOTAL: R$ ${(totalCents / 100).toFixed(2).replace('.', ',')}*\n`;
    } else {
      msg += `🚚 Frete (Demais Estados): A calcular via WhatsApp\n`;
      msg += `*TOTAL DOS PRODUTOS: R$ ${(totalCents / 100).toFixed(2).replace('.', ',')}*\n`;
    }

    msg += `───────────────\n\n`;
    msg += `Olá! Gostaria de confirmar meu pedido e combinar a entrega/retirada e o pagamento ✨`;

    return `https://wa.me/${phoneNumber}?text=${encodeURIComponent(msg)}`;
  };

  return (
    <CartContext.Provider
      value={{
        items,
        isOpen,
        setIsOpen,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        totalItems,
        subtotalCents,
        coupons,
        appliedCoupon,
        applyCoupon,
        removeCoupon,
        discountCents,
        shippingCents,
        customShippingCents,
        setCustomShippingCents,
        totalCents,
        isParana,
        storeSettings,
        isPickupActive,
        customer,
        setCustomer,
        generateWhatsAppUrl,
        generateShippingQuoteWhatsAppUrl,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
