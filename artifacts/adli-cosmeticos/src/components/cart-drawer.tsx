import { useState, useEffect, type FormEvent } from 'react';
import { useLocation } from 'wouter';
import {
  Calculator,
  Check,
  ChevronRight,
  Compass,
  CreditCard,
  MapPin,
  MessageCircle,
  Minus,
  Plus,
  ShoppingBag,
  Store,
  Tag,
  Trash2,
  Truck,
  User,
  X,
} from 'lucide-react';
import { useCart } from '@/lib/cart-context';
import { formatPrice, parseToCents } from '@/lib/products-data';

export default function CartDrawer() {
  const [, setLocation] = useLocation();
  const {
    items,
    isOpen,
    setIsOpen,
    removeItem,
    updateQuantity,
    totalItems,
    subtotalCents,
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
  } = useCart();

  const [couponCode, setCouponCode] = useState('');
  const [couponMsg, setCouponMsg] = useState<{ text: string; error?: boolean } | null>(null);
  const [validationError, setValidationError] = useState('');
  const [gettingLocation, setGettingLocation] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [drawerShippingInput, setDrawerShippingInput] = useState(
    customShippingCents > 0 ? (customShippingCents / 100).toFixed(2).replace('.', ',') : ''
  );

  useEffect(() => {
    if (customShippingCents > 0) {
      setDrawerShippingInput((customShippingCents / 100).toFixed(2).replace('.', ','));
    } else {
      setDrawerShippingInput('');
    }
  }, [customShippingCents]);

  if (!isOpen) return null;

  function handleApplyCoupon(e: FormEvent) {
    e.preventDefault();
    if (!couponCode.trim()) return;
    const res = applyCoupon(couponCode);
    setCouponMsg({ text: res.message, error: !res.success });
    if (res.success) setCouponCode('');
  }

  function handleGetGPS() {
    if (!navigator.geolocation) {
      setLocationError('Seu dispositivo ou navegador não suporta geolocalização.');
      return;
    }
    setGettingLocation(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const mapsUrl = `https://maps.google.com/?q=${lat},${lng}`;
        setCustomer((prev) => ({
          ...prev,
          locationUrl: mapsUrl,
        }));
        setGettingLocation(false);
      },
      (err) => {
        console.error(err);
        setLocationError('Permissão negada ou sinal de GPS indisponível.');
        setGettingLocation(false);
      },
      { enableHighAccuracy: true, timeout: 12000 }
    );
  }

  function handleCheckout() {
    if (!customer.name.trim()) {
      setValidationError('Por favor, informe seu nome para o pedido.');
      return;
    }
    if (!customer.city.trim()) {
      setValidationError('Por favor, informe sua cidade.');
      return;
    }
    setValidationError('');
    setIsOpen(false);
    setLocation('/pagamento');
  }

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={() => setIsOpen(false)}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
      />

      {/* Drawer */}
      <div className="absolute inset-y-0 right-0 flex max-w-full">
        <div className="flex w-screen max-w-md flex-col bg-[#FBFBFA] shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[#DCC4BD] bg-white px-6 py-4">
            <div className="flex items-center gap-2">
              <ShoppingBag size={20} className="text-[#966960]" />
              <h2 className="text-base font-bold text-[#614331]">Sua Sacola</h2>
              <span className="rounded-full bg-[#ECDDD8] px-2.5 py-0.5 text-xs font-semibold text-[#614331]">
                {totalItems} {totalItems === 1 ? 'item' : 'itens'}
              </span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="flex h-8 w-8 items-center justify-center rounded-full text-[#927C75] transition hover:bg-[#ECDDD8] hover:text-[#614331]"
            >
              <X size={18} />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
            {items.length === 0 ? (
              <div className="py-16 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#ECDDD8] text-[#927C75] mb-3">
                  <ShoppingBag size={28} />
                </div>
                <h3 className="text-sm font-bold text-[#614331]">Sua sacola está vazia</h3>
                <p className="mt-1 text-xs text-[#927C75]">
                  Adicione produtos incríveis para cuidar do seu cabelo!
                </p>
                <button
                  onClick={() => setIsOpen(false)}
                  className="mt-5 rounded-full bg-[#966960] px-6 py-2.5 text-xs font-bold text-white transition hover:bg-[#B68475]"
                >
                  Explorar Produtos
                </button>
              </div>
            ) : (
              <>
                {/* 1. Lista de Itens */}
                <div className="space-y-3">
                  {items.map((item) => (
                    <div
                      key={item.product.id}
                      className="flex items-center gap-3 rounded-xl border border-[#ece3d8] bg-white p-3 shadow-2xs"
                    >
                      <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-[#f0e8df] bg-[#faf5f0]">
                        <img
                          src={item.product.image_url}
                          alt={item.product.name}
                          className="h-full w-full object-contain p-1"
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <h4 className="truncate text-xs font-semibold text-[#443a35]">
                          {item.product.name}
                        </h4>
                        <p className="mt-0.5 text-xs font-bold text-[#a66e68]">
                          {formatPrice(item.product.price_cents)}
                        </p>

                        <div className="mt-2 flex items-center justify-between">
                          <div className="flex items-center rounded-lg border border-[#e4dbcf] bg-[#faf8f4]">
                            <button
                              onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                              className="px-2 py-0.5 text-[#665b54] transition hover:text-[#443a35]"
                            >
                              <Minus size={12} />
                            </button>
                            <span className="px-2 text-xs font-semibold text-[#443a35]">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                              className="px-2 py-0.5 text-[#665b54] transition hover:text-[#443a35]"
                            >
                              <Plus size={12} />
                            </button>
                          </div>

                          <button
                            onClick={() => removeItem(item.product.id)}
                            className="text-[#b8ad9f] transition hover:text-red-500"
                            title="Remover"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* 2. Cupom de Desconto */}
                <div className="rounded-xl border border-[#ece3d8] bg-white p-4">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#443a35] mb-2">
                    <Tag size={14} className="text-[#a66e68]" />
                    Cupom de Desconto
                  </div>

                  {appliedCoupon ? (
                    <div className="flex items-center justify-between rounded-lg bg-green-50 p-2.5 text-xs text-green-800">
                      <div className="flex items-center gap-1.5">
                        <Check size={14} className="text-green-600" />
                        <span>
                          Cupom <strong>{appliedCoupon.code}</strong> aplicado (
                          {appliedCoupon.discountType === 'percentage'
                            ? `-${appliedCoupon.discountValue}%`
                            : `-R$ ${(appliedCoupon.discountValue / 100).toFixed(2).replace('.', ',')}`}
                          )
                        </span>
                      </div>
                      <button
                        onClick={removeCoupon}
                        className="text-[11px] font-semibold text-red-600 hover:underline"
                      >
                        Remover
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleApplyCoupon} className="flex gap-2">
                      <input
                        type="text"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                        placeholder=""
                        className="flex-1 rounded-lg border border-[#DCC4BD] bg-[#FAF8F4] px-3 py-2 text-xs uppercase focus:border-[#966960] focus:outline-none"
                      />
                      <button
                        type="submit"
                        className="rounded-lg bg-[#966960] px-4 py-2 text-xs font-bold text-white transition hover:bg-[#B68475]"
                      >
                        Aplicar
                      </button>
                    </form>
                  )}

                  {couponMsg && !appliedCoupon && (
                    <p
                      className={`mt-2 text-[11px] ${
                        couponMsg.error ? 'text-red-600' : 'text-green-700'
                      }`}
                    >
                      {couponMsg.text}
                    </p>
                  )}
                </div>

                {/* 3. Triagem de Entrega / Retirada */}
                <div className="rounded-xl border border-[#ece3d8] bg-white p-4 space-y-3.5">
                  <div className="flex items-center justify-between text-xs font-bold text-[#614331]">
                    <div className="flex items-center gap-1.5">
                      <User size={14} className="text-[#966960]" />
                      <span>Dados para Entrega / Retirada</span>
                    </div>
                  </div>

                  {/* Opção de Retirada vs Entrega se a Retirada estiver ativa pela loja */}
                  {isPickupActive && (
                    <div className="grid grid-cols-2 gap-2 rounded-xl bg-[#ECDDD8]/50 p-1 border border-[#DCC4BD]/70 text-xs font-semibold">
                      <button
                        type="button"
                        onClick={() => setCustomer({ ...customer, deliveryMethod: 'delivery' })}
                        className={`flex items-center justify-center gap-1.5 rounded-lg py-2 transition-all ${
                          customer.deliveryMethod !== 'pickup'
                            ? 'bg-[#966960] text-white shadow-sm'
                            : 'text-[#614331] hover:text-[#966960]'
                        }`}
                      >
                        <Truck size={14} />
                        <span>Entrega</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setCustomer({ ...customer, deliveryMethod: 'pickup' })}
                        className={`flex items-center justify-center gap-1.5 rounded-lg py-2 transition-all ${
                          customer.deliveryMethod === 'pickup'
                            ? 'bg-[#966960] text-white shadow-sm'
                            : 'text-[#614331] hover:text-[#966960]'
                        }`}
                      >
                        <Store size={14} />
                        <span>Retirar no Local</span>
                      </button>
                    </div>
                  )}

                  <div>
                    <label className="block text-[10px] font-semibold text-[#8a7f76] mb-1">
                      SEU NOME COMPLETO *
                    </label>
                    <input
                      type="text"
                      value={customer.name}
                      onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
                      placeholder="Como podemos te chamar?"
                      className="w-full rounded-lg border border-[#e4dbcf] bg-[#faf8f4] px-3 py-2 text-xs focus:border-[#a66e68] focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-[1fr_80px] gap-2">
                    <div>
                      <label className="block text-[10px] font-semibold text-[#8a7f76] mb-1">
                        CIDADE *
                      </label>
                      <input
                        type="text"
                        value={customer.city}
                        onChange={(e) => setCustomer({ ...customer, city: e.target.value })}
                        placeholder="Ex: Paranavaí"
                        className="w-full rounded-lg border border-[#e4dbcf] bg-[#faf8f4] px-3 py-2 text-xs focus:border-[#a66e68] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-[#8a7f76] mb-1">
                        ESTADO
                      </label>
                      <input
                        type="text"
                        value={customer.state}
                        onChange={(e) => setCustomer({ ...customer, state: e.target.value.toUpperCase() })}
                        placeholder="PR"
                        maxLength={2}
                        className="w-full rounded-lg border border-[#e4dbcf] bg-[#faf8f4] px-3 py-2 text-xs uppercase text-center focus:border-[#a66e68] focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Se for Entrega: solicita endereço e botão de GPS. Se for Retirada: esconde ambos */}
                  {customer.deliveryMethod !== 'pickup' ? (
                    <>
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="block text-[10px] font-semibold text-[#8a7f76]">
                            ENDEREÇO DE ENTREGA / BAIRRO
                          </label>
                        </div>
                        <input
                          type="text"
                          value={customer.address}
                          onChange={(e) => setCustomer({ ...customer, address: e.target.value })}
                          placeholder="Rua, número, bairro..."
                          className="w-full rounded-lg border border-[#e4dbcf] bg-[#faf8f4] px-3 py-2 text-xs focus:border-[#a66e68] focus:outline-none"
                        />
                      </div>

                      {/* Botão de Localização Real / GPS */}
                      <div className="space-y-1.5 pt-0.5">
                        <button
                          type="button"
                          onClick={handleGetGPS}
                          disabled={gettingLocation}
                          className="flex w-full items-center justify-center gap-2 rounded-xl border border-[#B68475] bg-[#FBFBFA] px-3 py-2 text-xs font-semibold text-[#966960] shadow-sm transition hover:bg-[#ECDDD8]/50 active:scale-95"
                        >
                          <MapPin size={15} className={gettingLocation ? 'animate-bounce text-[#966960]' : 'text-[#966960]'} />
                          <span>
                            {gettingLocation
                              ? 'Acessando GPS do aparelho...'
                              : customer.locationUrl
                              ? 'Atualizar Localização GPS'
                              : '📍 Enviar Localização Real (Ligar GPS)'}
                          </span>
                        </button>

                        {customer.locationUrl && (
                          <div className="flex items-center justify-between rounded-lg bg-[#ECDDD8]/70 px-3 py-1.5 text-[11px] text-[#614331]">
                            <span className="flex items-center gap-1.5 font-medium text-[#614331]">
                              <Check size={13} className="text-[#966960]" />
                              GPS conectado ao pedido
                            </span>
                            <a
                              href={customer.locationUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="font-bold text-[#966960] underline text-[10px]"
                            >
                              Ver no Maps
                            </a>
                          </div>
                        )}

                        {locationError && (
                          <p className="text-[10px] text-red-600">{locationError}</p>
                        )}
                      </div>
                    </>
                  ) : (
                    /* Card de Retirada na Loja (sem pedir endereço ou GPS) */
                    <div className="rounded-xl border border-[#DCC4BD] bg-[#ECDDD8]/40 p-3 text-xs text-[#614331] space-y-1.5">
                      <div className="flex items-center gap-1.5 font-bold text-[#966960]">
                        <Store size={15} />
                        <span>Retirada no Balcão da Loja</span>
                      </div>
                      <p className="text-[11px] text-[#614331]">
                        <strong>Local de Retirada:</strong> {storeSettings.pickup_address}
                      </p>
                      <p className="text-[10px] text-[#927C75]">
                        ✨ Não precisa preencher endereço nem localização. Seu pedido será separado e avisaremos no WhatsApp assim que estiver pronto para você retirar!
                      </p>
                    </div>
                  )}

                  <div>
                    <label className="block text-[10px] font-semibold text-[#8a7f76] mb-1">
                      OBSERVAÇÕES (OPCIONAL)
                    </label>
                    <input
                      type="text"
                      value={customer.notes || ''}
                      onChange={(e) => setCustomer({ ...customer, notes: e.target.value })}
                      placeholder={
                        customer.deliveryMethod === 'pickup'
                          ? 'Alguma observação sobre a retirada?'
                          : 'Alguma preferência ou instrução para a entrega?'
                      }
                      className="w-full rounded-lg border border-[#e4dbcf] bg-[#faf8f4] px-3 py-2 text-xs focus:border-[#a66e68] focus:outline-none"
                    />
                  </div>

                  {/* Informação do frete / retirada */}
                  {customer.deliveryMethod === 'pickup' ? (
                    <div className="rounded-lg bg-[#ECDDD8]/50 p-2.5 text-[11px] text-[#614331] flex flex-col gap-1 border border-[#DCC4BD]">
                      <div className="flex items-center gap-1.5 font-bold text-[#966960]">
                        <Store size={14} />
                        <span>Retirada no Local: Grátis (R$ 0,00)</span>
                      </div>
                      <p className="text-[10px] text-[#927C75]">
                        Retirada no balcão: {storeSettings.pickup_address}
                      </p>
                    </div>
                  ) : isParana ? (
                    <div className="rounded-lg bg-[#ECDDD8]/50 p-2.5 text-[11px] text-[#614331] flex flex-col gap-1 border border-[#DCC4BD]">
                      <div className="flex items-center gap-1.5 font-bold text-[#966960]">
                        <Truck size={14} />
                        <span>Entrega no Paraná: Frete Fixo de R$ 27,00</span>
                      </div>
                      <p className="text-[10px] text-[#927C75]">
                        Valor fixo de frete para entrega em qualquer cidade do Paraná.
                      </p>
                    </div>
                  ) : (
                    <div className="rounded-xl bg-[#ECDDD8]/50 p-3 text-[11px] text-[#614331] flex flex-col gap-2.5 border border-[#DCC4BD]">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 font-bold text-[#966960]">
                          <Truck size={15} />
                          <span>Demais Estados: Frete a calcular</span>
                        </div>
                        {customShippingCents > 0 && (
                          <span className="rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-bold text-green-800">
                            Frete Somado
                          </span>
                        )}
                      </div>

                      <p className="text-[10px] text-[#927C75] leading-relaxed">
                        Consulte o valor do frete para o seu CEP no WhatsApp antes de pagar. Ao receber o valor, adicione no campo abaixo para somar ao total.
                      </p>

                      {/* Botão de Consulta no WhatsApp */}
                      <a
                        href={generateShippingQuoteWhatsAppUrl()}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center justify-center gap-1.5 rounded-lg bg-[#25D366] py-2 px-3 text-xs font-bold text-white shadow-xs transition hover:bg-[#20ba59] active:scale-95"
                      >
                        <MessageCircle size={14} />
                        <span>Consultar Frete no WhatsApp</span>
                      </a>

                      {/* Bloco Somar Frete */}
                      <div className="rounded-lg bg-white p-2.5 border border-[#DCC4BD] space-y-2">
                        <div className="flex items-center justify-between text-xs font-bold text-[#443a35]">
                          <div className="flex items-center gap-1.5">
                            <Calculator size={14} className="text-[#966960]" />
                            <span>Somar o Frete ao Pedido</span>
                          </div>
                          {customShippingCents > 0 && (
                            <button
                              type="button"
                              onClick={() => {
                                setCustomShippingCents(0);
                                setDrawerShippingInput('');
                              }}
                              className="text-[10px] text-red-600 hover:underline"
                            >
                              Remover
                            </button>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <div className="relative flex-1">
                            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-[#927C75]">
                              R$
                            </span>
                            <input
                              type="text"
                              value={drawerShippingInput}
                              onChange={(e) => setDrawerShippingInput(e.target.value)}
                              placeholder="Ex: 50,00"
                              className="w-full rounded-lg border border-[#DCC4BD] bg-[#FAF8F4] py-1.5 pl-8 pr-2 text-xs font-semibold text-[#443a35] focus:border-[#966960] focus:outline-none"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              const cents = parseToCents(drawerShippingInput);
                              setCustomShippingCents(cents);
                            }}
                            className="rounded-lg bg-[#966960] px-3 py-1.5 text-xs font-bold text-white transition hover:bg-[#B68475] shrink-0"
                          >
                            Somar
                          </button>
                        </div>

                        {customShippingCents > 0 ? (
                          <p className="text-[10px] font-semibold text-green-700">
                            ✓ Frete de {formatPrice(customShippingCents)} somado ao valor total!
                          </p>
                        ) : (
                          <p className="text-[10px] text-[#927C75]">
                            Digite o valor informado pela loja e clique em <strong>Somar</strong>.
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Footer / Resumo do Pedido */}
          {items.length > 0 && (
            <div className="border-t border-[#DCC4BD] bg-white p-6 space-y-3">
              <div className="space-y-1.5 text-xs text-[#927C75]">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>{formatPrice(subtotalCents)}</span>
                </div>

                {discountCents > 0 && (
                  <div className="flex justify-between font-semibold text-[#966960]">
                    <span>Desconto ({appliedCoupon?.code})</span>
                    <span>-{formatPrice(discountCents)}</span>
                  </div>
                )}

                <div className="flex justify-between items-center">
                  <span>Frete</span>
                  <span className={isParana || customShippingCents > 0 ? 'font-bold text-[#614331]' : ''}>
                    {customer.deliveryMethod === 'pickup' ? (
                      'Grátis (Retirada)'
                    ) : isParana ? (
                      'R$ 27,00 (Fixo PR)'
                    ) : customShippingCents > 0 ? (
                      `${formatPrice(customShippingCents)} (Consultado)`
                    ) : (
                      <a
                        href={generateShippingQuoteWhatsAppUrl()}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 font-bold text-[#25D366] hover:underline cursor-pointer"
                        title="Clique para consultar o frete no WhatsApp"
                      >
                        A calcular via WhatsApp ↗
                      </a>
                    )}
                  </span>
                </div>

                <div className="flex justify-between border-t border-[#DCC4BD] pt-2 text-sm font-bold text-[#614331]">
                  <span>
                    {customer.deliveryMethod === 'pickup'
                      ? 'Total (Retirada)'
                      : isParana || customShippingCents > 0
                      ? 'Total Estimado'
                      : 'Total dos Produtos'}
                  </span>
                  <span className="text-base text-[#966960]">{formatPrice(totalCents)}</span>
                </div>
              </div>

              {validationError && (
                <p className="rounded-lg bg-red-50 p-2 text-center text-xs text-red-600">
                  {validationError}
                </p>
              )}

              <button
                onClick={handleCheckout}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#966960] py-3.5 text-xs font-bold tracking-wider text-white shadow-md transition hover:bg-[#B68475] active:scale-[0.99]"
              >
                <CreditCard size={16} /> PAGAR {formatPrice(totalCents)} <ChevronRight size={16} />
              </button>

              <p className="text-center text-[10px] text-[#91857a]">
                Pague via Cartão/Boleto (Mercado Pago) ou Pix.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
