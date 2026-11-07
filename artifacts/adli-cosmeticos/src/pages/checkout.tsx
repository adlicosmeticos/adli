import { useState, useRef, useEffect, type ChangeEvent } from 'react';
import { useLocation, Link } from 'wouter';
import {
  ArrowLeft,
  Check,
  CheckCircle2,
  Copy,
  CreditCard,
  ExternalLink,
  FileText,
  Lock,
  MapPin,
  MessageCircle,
  QrCode,
  ShieldCheck,
  ShoppingBag,
  Store,
  Trash2,
  Truck,
  Upload,
  User,
  Calculator,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { useCart } from '@/lib/cart-context';
import { formatPrice, parseToCents } from '@/lib/products-data';

export default function CheckoutPage() {
  const [, setLocation] = useLocation();
  const {
    items,
    subtotalCents,
    discountCents,
    customShippingCents,
    setCustomShippingCents,
    totalCents,
    appliedCoupon,
    customer,
    setCustomer,
    isParana,
    storeSettings,
    generateShippingQuoteWhatsAppUrl,
  } = useCart();

  const [copiedPix, setCopiedPix] = useState(false);
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [shippingInput, setShippingInput] = useState(
    customShippingCents > 0 ? (customShippingCents / 100).toFixed(2).replace('.', ',') : ''
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  useEffect(() => {
    if (customShippingCents > 0) {
      setShippingInput((customShippingCents / 100).toFixed(2).replace('.', ','));
    }
  }, [customShippingCents]);

  const pixKey = '61.681.521/0001-46';
  const paymentLinkUrl = 'https://link.mercadopago.com.br/adlilimacosmticos';

  function handleCopyPix() {
    navigator.clipboard.writeText(pixKey).then(() => {
      setCopiedPix(true);
      setTimeout(() => setCopiedPix(false), 3000);
    });
  }

  function handleOpenPaymentLink() {
    window.open(paymentLinkUrl, '_blank', 'noopener,noreferrer');
  }

  function handleFileSelect(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setReceiptFile(file);
      if (file.type.startsWith('image/')) {
        setPreviewUrl(URL.createObjectURL(file));
      } else {
        setPreviewUrl(null);
      }
    }
  }

  function handleRemoveFile() {
    setReceiptFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }

  function handleApplyShipping() {
    const cents = parseToCents(shippingInput);
    setCustomShippingCents(cents);
  }

  function handleClearShipping() {
    setCustomShippingCents(0);
    setShippingInput('');
  }

  function formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  function handleSendWhatsApp() {
    if (!receiptFile) return;

    const phoneNumber = '5544997303797';
    let msg = `🌸 *NOVO PEDIDO — PAGAMENTO REALIZADO* 🌸\n`;
    msg += `*Adli Lima Cosméticos*\n\n`;

    msg += `✅ *STATUS:* PAGAMENTO EFETUADO COM SUCESSO\n`;
    msg += `📎 *COMPROVANTE:* Arquivo "${receiptFile.name}" pronto para conferência\n\n`;

    msg += `👤 *Cliente:* ${customer.name || 'Não informado'}\n`;
    msg += `📍 *Cidade / Estado:* ${customer.city || 'Paranavaí'} - ${customer.state || 'PR'}\n`;

    if (customer.deliveryMethod === 'pickup') {
      msg += `📦 *Modalidade:* 🏪 Retirada no Balcão da Loja (Grátis)\n`;
      msg += `🏬 *Local da Loja:* ${storeSettings.pickup_address}\n`;
    } else {
      msg += `📦 *Modalidade:* 🚚 Entrega no Endereço\n`;
      if (customer.address) {
        msg += `🏠 *Endereço:* ${customer.address}\n`;
      }
      if (customer.locationUrl) {
        msg += `📍 *Localização GPS:* ${customer.locationUrl}\n`;
      }
    }

    if (customer.notes) {
      msg += `📝 *Observação:* ${customer.notes}\n`;
    }

    msg += `\n🛒 *ITENS DO PEDIDO:*\n`;
    items.forEach((item) => {
      const itemTotal = (item.product.price_cents * item.quantity) / 100;
      msg += `• ${item.quantity}x ${item.product.name} — R$ ${itemTotal.toFixed(2).replace('.', ',')}\n`;
    });

    msg += `\n───────────────\n`;
    msg += `Subtotal: ${formatPrice(subtotalCents)}\n`;

    if (appliedCoupon && discountCents > 0) {
      const descVal =
        appliedCoupon.discountType === 'percentage'
          ? `${appliedCoupon.discountValue}%`
          : `R$ ${(appliedCoupon.discountValue / 100).toFixed(2).replace('.', ',')}`;
      msg += `🎟️ Cupom (${appliedCoupon.code}): -${formatPrice(discountCents)} (${descVal})\n`;
    }

    if (customer.deliveryMethod === 'pickup') {
      msg += `🚚 Frete: Grátis (Retirada)\n`;
    } else if (isParana) {
      msg += `🚚 Frete Fixo (PR): R$ 27,00\n`;
    } else if (customShippingCents > 0) {
      msg += `🚚 Frete Consultado: ${formatPrice(customShippingCents)}\n`;
    } else {
      msg += `🚚 Frete (Demais Estados): A combinar\n`;
    }

    msg += `💰 *VALOR TOTAL PAGO: ${formatPrice(totalCents)}*\n`;
    msg += `───────────────\n\n`;
    msg += `Olá! Já realizei o pagamento do meu pedido e estou enviando o comprovante em anexo nesta conversa. Aguardo a confirmação da preparação e envio dos meus produtos! ✨`;

    const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  }

  // Estado Vazio caso a pessoa acesse diretamente sem itens
  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-[#FBFBFA] flex flex-col justify-center items-center p-4">
        <div className="max-w-md w-full bg-white p-8 rounded-2xl border border-[#DCC4BD] text-center shadow-lg space-y-4">
          <img src="/adli-logo.png" alt="Adli Lima Cosméticos" className="h-14 mx-auto object-contain mb-2" />
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#ECDDD8] text-[#966960]">
            <ShoppingBag size={28} />
          </div>
          <h2 className="text-lg font-bold text-[#614331]">Sua sacola está vazia</h2>
          <p className="text-xs text-[#927C75]">
            Você ainda não selecionou produtos para realizar o pagamento.
          </p>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#966960] px-6 py-3 text-xs font-bold text-white shadow-md transition hover:bg-[#B68475]"
          >
            <ArrowLeft size={16} />
            <span>Voltar e Escolher Produtos</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FBFBFA] text-[#443a35]">
      {/* Top Header com a Logo da Adli Lima */}
      <header className="sticky top-0 z-40 border-b border-[#DCC4BD] bg-white/95 backdrop-blur-md shadow-xs">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => setLocation('/')}
            className="flex items-center gap-1.5 text-xs font-semibold text-[#614331] hover:text-[#966960] transition"
          >
            <ArrowLeft size={16} />
            <span className="hidden sm:inline">Voltar para a Loja</span>
          </button>

          {/* Logo Oficial Centralizada */}
          <div className="flex flex-col items-center">
            <Link href="/" className="cursor-pointer">
              <img
                src="/adli-logo.png"
                alt="Adli Lima Cosméticos"
                className="h-10 sm:h-12 w-auto object-contain"
              />
            </Link>
            <span className="text-[10px] uppercase font-bold tracking-widest text-[#966960]">
              Ambiente de Pagamento Seguro
            </span>
          </div>

          {/* Badge de Segurança */}
          <div className="flex items-center gap-1.5 rounded-full bg-[#ECDDD8]/60 px-3 py-1 text-[11px] font-semibold text-[#614331] border border-[#DCC4BD]">
            <Lock size={13} className="text-[#966960]" />
            <span className="hidden md:inline">Checkout 100% Protegido</span>
            <span className="md:hidden">Seguro</span>
          </div>
        </div>
      </header>

      {/* Conteúdo Principal Fora a Fora */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Barra de Progresso / Breadcrumb */}
        <div className="mb-8 flex items-center justify-center gap-2 sm:gap-4 text-xs font-bold">
          <div className="flex items-center gap-1.5 text-[#966960]">
            <CheckCircle2 size={16} />
            <span>1. Sacola</span>
          </div>
          <span className="text-[#DCC4BD]">───</span>
          <div className="flex items-center gap-1.5 text-[#966960]">
            <CheckCircle2 size={16} />
            <span>2. Identificação</span>
          </div>
          <span className="text-[#DCC4BD]">───</span>
          <div className="flex items-center gap-1.5 rounded-full bg-[#966960] text-white px-3 py-1 shadow-xs">
            <span>3. Pagamento & Envio</span>
          </div>
        </div>

        {/* Grid de 2 Colunas no Desktop */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* COLUNA ESQUERDA: Formas de Pagamento & Envio do Comprovante (7 colunas) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Bloco de Dados do Cliente e Entrega */}
            <div className="rounded-2xl border border-[#DCC4BD] bg-white p-5 shadow-xs">
              <div className="flex items-center justify-between border-b border-[#F0E4E0] pb-3 mb-3">
                <div className="flex items-center gap-2 text-xs font-bold text-[#614331] uppercase tracking-wider">
                  <User size={15} className="text-[#966960]" />
                  <span>Dados do Pedido</span>
                </div>
                <button
                  onClick={() => setLocation('/')}
                  className="text-[11px] font-semibold text-[#966960] hover:underline"
                >
                  Alterar dados
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-[#614331]">
                <div>
                  <span className="block text-[10px] text-[#927C75] uppercase font-bold">Nome do Cliente:</span>
                  <span className="font-semibold text-sm">{customer.name || 'Cliente Adli Lima'}</span>
                </div>
                <div>
                  <span className="block text-[10px] text-[#927C75] uppercase font-bold">Destino:</span>
                  <span className="font-semibold">
                    {customer.city || 'Paranavaí'} - {customer.state || 'PR'}
                  </span>
                </div>
                <div className="sm:col-span-2">
                  <span className="block text-[10px] text-[#927C75] uppercase font-bold">Modalidade:</span>
                  {customer.deliveryMethod === 'pickup' ? (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#966960]">
                      <Store size={14} /> Retirada no Balcão da Loja ({storeSettings.pickup_address})
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#614331]">
                      <Truck size={14} className="text-[#966960]" />
                      Entrega no endereço: {customer.address || 'Endereço a confirmar'}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* PASSO 1: Formas de Pagamento */}
            <div className="rounded-2xl border border-[#DCC4BD] bg-white p-6 shadow-sm space-y-5">
              <div className="flex items-center gap-2 border-b border-[#F0E4E0] pb-3">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#966960] text-xs font-bold text-white">
                  1
                </span>
                <h3 className="text-base font-bold text-[#614331]">
                  Escolha como deseja realizar o pagamento
                </h3>
              </div>

              {/* OPÇÃO 1: Cartão de Crédito, Boleto ou Saldo */}
              <div className="rounded-2xl border-2 border-[#DCC4BD] bg-[#FAF8F5] p-5 transition-all hover:border-[#966960] shadow-xs">
                <div className="flex items-start gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#966960]/10 text-[#966960]">
                    <CreditCard size={24} />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm sm:text-base font-bold text-[#443a35]">
                      Divida sua compra ou pague com cartão, boleto e saldo
                    </h4>
                    <p className="text-xs text-[#927C75] mt-1 leading-relaxed">
                      Pague parcelado no cartão de crédito, à vista no boleto bancário ou com saldo em conta com total segurança.
                    </p>

                    <div className="mt-4">
                      <button
                        type="button"
                        onClick={handleOpenPaymentLink}
                        className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-[#966960] py-3.5 px-6 text-xs sm:text-sm font-bold text-white shadow-md transition hover:bg-[#B68475] active:scale-[0.99]"
                      >
                        <span>Pagar com Cartão, Boleto ou Saldo ({formatPrice(totalCents)})</span>
                        <ExternalLink size={16} />
                      </button>
                      <p className="mt-2 text-[11px] text-[#927C75]">
                        🔒 Você será direcionada à página oficial de pagamento da Adli Lima Cosméticos.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* OPÇÃO 2: Pagar com Pix */}
              <div className="rounded-2xl border-2 border-[#DCC4BD] bg-[#FAF8F5] p-5 transition-all hover:border-[#22c55e] shadow-xs">
                <div className="flex items-start gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#22c55e]/15 text-[#16a34a]">
                    <QrCode size={24} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm sm:text-base font-bold text-[#443a35]">Pagar com Pix</h4>
                      <span className="rounded-full bg-[#22c55e]/15 px-2.5 py-0.5 text-[10px] font-bold text-[#16a34a]">
                        Aprovação Imediata
                      </span>
                    </div>
                    <p className="text-xs text-[#927C75] mt-1 leading-relaxed">
                      Copie a chave Pix CNPJ da loja e realize o pagamento pelo aplicativo do seu banco.
                    </p>

                    {/* Caixa de Cópia da Chave Pix */}
                    <div className="mt-4 space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded-xl border border-[#DCC4BD] bg-white p-3 shadow-xs">
                        <div>
                          <span className="block text-[9px] font-bold text-[#927C75] uppercase">
                            Chave Pix CNPJ:
                          </span>
                          <span className="font-mono text-sm font-extrabold text-[#443a35] select-all tracking-wide">
                            {pixKey}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={handleCopyPix}
                          className={`flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all shadow-xs shrink-0 ${
                            copiedPix
                              ? 'bg-[#16a34a] text-white'
                              : 'bg-[#966960] text-white hover:bg-[#B68475]'
                          }`}
                        >
                          {copiedPix ? (
                            <>
                              <Check size={16} />
                              <span>Chave Copiada!</span>
                            </>
                          ) : (
                            <>
                              <Copy size={16} />
                              <span>Copiar Chave Pix</span>
                            </>
                          )}
                        </button>
                      </div>

                      {copiedPix && (
                        <p className="text-center text-xs font-semibold text-[#16a34a] animate-in fade-in">
                          ✓ Chave Pix copiada para a área de transferência!
                        </p>
                      )}

                      {/* Passo a passo rápido */}
                      <div className="rounded-xl bg-white p-3 text-[11px] text-[#71645e] border border-[#F0E4E0] space-y-1">
                        <p>1. Clique no botão <strong>Copiar Chave Pix</strong> acima.</p>
                        <p>2. Abra o app do seu banco e acesse a opção <strong>Pix &gt; CNPJ</strong>.</p>
                        <p>3. Cole a chave, insira o valor exato de <strong>{formatPrice(totalCents)}</strong> e confirme o pagamento.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* PASSO 2: Envio do Comprovante e Confirmação no WhatsApp */}
            <div className="rounded-2xl border-2 border-[#25D366]/40 bg-white p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-2 border-b border-[#F0E4E0] pb-3">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#25D366] text-xs font-bold text-white">
                  2
                </span>
                <h3 className="text-base font-bold text-[#273B2E]">
                  Após pagar: envie seu comprovante para liberar o envio
                </h3>
              </div>

              {/* Aviso em Destaque */}
              <div className="rounded-xl border border-[#DCC4BD] bg-[#ECDDD8]/60 p-4 text-xs text-[#614331] space-y-1.5">
                <div className="flex items-center gap-2 font-bold text-[#966960]">
                  <AlertCircle size={17} className="shrink-0" />
                  <span className="text-sm">Volte aqui nesta página após realizar o pagamento!</span>
                </div>
                <p className="text-xs leading-relaxed text-[#614331]">
                  Assim que você concluir o pagamento pelo link do cartão/boleto ou no aplicativo do seu banco via Pix, <strong>retorne aqui nesta página</strong> para anexar o seu comprovante. Isso garante a separação e o envio prioritário dos seus produtos!
                </p>
              </div>

              {/* Área de Upload do Comprovante */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-[#443a35]">
                  Carregar Comprovante de Pagamento (Print da tela ou arquivo PDF):
                </label>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/jpg,image/webp,application/pdf"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="checkout-receipt-upload"
                />

                {!receiptFile ? (
                  <label
                    htmlFor="checkout-receipt-upload"
                    className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#DCC4BD] bg-[#FAF8F5] p-6 cursor-pointer hover:border-[#966960] hover:bg-[#FAF5F0] transition group text-center"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#ECDDD8] text-[#966960] group-hover:scale-105 transition mb-2">
                      <Upload size={22} />
                    </div>
                    <span className="text-sm font-bold text-[#614331]">
                      Clique para selecionar o comprovante
                    </span>
                    <span className="text-xs text-[#927C75] mt-1">
                      Aceita Print em imagem (PNG, JPG, JPEG) ou documento PDF
                    </span>
                  </label>
                ) : (
                  <div className="flex items-center justify-between rounded-xl border border-[#22c55e]/50 bg-green-50/80 p-4 text-xs">
                    <div className="flex items-center gap-3 min-w-0 pr-2">
                      {previewUrl ? (
                        <img
                          src={previewUrl}
                          alt="Preview comprovante"
                          className="h-14 w-14 shrink-0 rounded-lg border border-green-200 object-cover"
                        />
                      ) : (
                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-green-100 text-green-700">
                          <FileText size={24} />
                        </div>
                      )}
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <CheckCircle2 size={15} className="text-[#16a34a] shrink-0" />
                          <span className="font-bold text-[#1e3a1e] text-sm truncate max-w-[260px]">
                            {receiptFile.name}
                          </span>
                        </div>
                        <span className="text-xs text-green-700">
                          {formatFileSize(receiptFile.size)} • Comprovante pronto para envio
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleRemoveFile}
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-red-500 hover:bg-red-100 transition"
                      title="Remover e escolher outro"
                    >
                      <Trash2 size={17} />
                    </button>
                  </div>
                )}
              </div>

              {/* Botão de Confirmação no WhatsApp */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleSendWhatsApp}
                  disabled={!receiptFile}
                  className={`flex w-full items-center justify-center gap-2 rounded-xl py-4 px-6 text-sm font-bold tracking-wide transition ${
                    receiptFile
                      ? 'bg-[#25D366] text-white shadow-lg hover:bg-[#20ba59] active:scale-[0.99] cursor-pointer'
                      : 'bg-[#e2dcda] text-[#9c8f8b] cursor-not-allowed shadow-none'
                  }`}
                >
                  <MessageCircle size={18} />
                  <span>CONFIRMAR PEDIDO E PAGAMENTO NO WHATSAPP</span>
                </button>

                <p className="mt-2 text-center text-xs leading-snug">
                  {receiptFile ? (
                    <span className="font-semibold text-green-700">
                      ✨ Comprovante anexado! Ao abrir o WhatsApp, envie o print/PDF na conversa para confirmação imediata.
                    </span>
                  ) : (
                    <span className="text-[#927C75]">
                      🔒 Carregue seu comprovante no campo acima para liberar este botão de confirmação.
                    </span>
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* COLUNA DIREITA: Resumo Completo do Pedido (5 colunas - Sticky) */}
          <div className="lg:col-span-5 lg:sticky lg:top-24 space-y-4">
            <div className="rounded-2xl border border-[#DCC4BD] bg-white p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-[#F0E4E0] pb-3">
                <div className="flex items-center gap-2">
                  <ShoppingBag size={18} className="text-[#966960]" />
                  <h3 className="text-base font-bold text-[#614331]">Resumo da Compra</h3>
                </div>
                <span className="rounded-full bg-[#ECDDD8] px-2.5 py-0.5 text-xs font-semibold text-[#614331]">
                  {items.reduce((acc, i) => acc + i.quantity, 0)} {items.length === 1 ? 'item' : 'itens'}
                </span>
              </div>

              {/* Lista dos produtos */}
              <div className="divide-y divide-[#F4ECE8] max-h-72 overflow-y-auto pr-1">
                {items.map((item) => (
                  <div key={item.product.id} className="flex items-center justify-between py-3">
                    <div className="flex items-center gap-3 min-w-0 pr-2">
                      <img
                        src={item.product.image_url}
                        alt={item.product.name}
                        className="h-12 w-12 shrink-0 rounded-xl border border-[#F0E4E0] object-contain bg-[#FAF5F0] p-1"
                      />
                      <div className="min-w-0">
                        <p className="font-semibold text-[#443a35] truncate text-xs sm:text-sm">
                          {item.product.name}
                        </p>
                        <p className="text-xs text-[#927C75]">
                          Quantidade: {item.quantity}
                        </p>
                      </div>
                    </div>
                    <span className="shrink-0 font-bold text-[#614331] text-xs sm:text-sm">
                      {formatPrice(item.product.price_cents * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Linhas de Valores Financeiros */}
              <div className="border-t border-[#F0E4E0] pt-3 space-y-2 text-xs sm:text-sm text-[#927C75]">
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

                {/* Linha do Frete com Link Direto */}
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
                        title="Clique para consultar frete no WhatsApp"
                      >
                        A calcular via WhatsApp <ExternalLink size={12} />
                      </a>
                    )}
                  </span>
                </div>

                {/* Quadradinho: Soma do Frete para Demais Estados */}
                {!isParana && customer.deliveryMethod !== 'pickup' && (
                  <div className="rounded-xl border border-[#DCC4BD] bg-[#FAF8F5] p-3 space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold text-[#614331]">
                      <div className="flex items-center gap-1.5">
                        <Calculator size={14} className="text-[#966960]" />
                        <span>Soma do Frete</span>
                      </div>
                      {customShippingCents > 0 && (
                        <button
                          type="button"
                          onClick={handleClearShipping}
                          className="text-[11px] font-semibold text-red-600 hover:underline"
                        >
                          Remover frete
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
                          value={shippingInput}
                          onChange={(e) => setShippingInput(e.target.value)}
                          placeholder="Ex: 50,00"
                          className="w-full rounded-lg border border-[#DCC4BD] bg-white py-1.5 pl-8 pr-2 text-xs font-semibold text-[#443a35] focus:border-[#966960] focus:outline-none"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={handleApplyShipping}
                        className="rounded-lg bg-[#966960] px-3.5 py-1.5 text-xs font-bold text-white transition hover:bg-[#B68475] shrink-0 active:scale-95"
                      >
                        Somar Frete
                      </button>
                    </div>

                    {customShippingCents > 0 ? (
                      <p className="text-[10px] font-semibold text-green-700">
                        ✓ Frete de {formatPrice(customShippingCents)} somado ao valor total!
                      </p>
                    ) : (
                      <p className="text-[10px] text-[#927C75]">
                        Coloque o valor informado pela loja e clique em <strong>Somar Frete</strong> para atualizar o total.
                      </p>
                    )}
                  </div>
                )}

                {/* Caixa Destaque Total a Pagar */}
                <div className="flex items-center justify-between rounded-xl bg-[#ECDDD8]/70 p-4 border border-[#DCC4BD] mt-2">
                  <div>
                    <span className="block text-xs font-bold text-[#614331] uppercase">Valor Total a Pagar:</span>
                    <span className="text-[10px] text-[#927C75]">Tudo incluído</span>
                  </div>
                  <span className="text-xl sm:text-2xl font-extrabold text-[#966960]">
                    {formatPrice(totalCents)}
                  </span>
                </div>
              </div>

              {/* Selos de Confiança */}
              <div className="border-t border-[#F0E4E0] pt-3 grid grid-cols-2 gap-2 text-[11px] text-[#927C75]">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck size={14} className="text-[#966960] shrink-0" />
                  <span>Compra 100% Segura</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Truck size={14} className="text-[#966960] shrink-0" />
                  <span>Envio Rastreado</span>
                </div>
              </div>
            </div>

            {/* Suporte */}
            <div className="rounded-xl border border-[#DCC4BD] bg-white p-3 text-center text-xs text-[#927C75]">
              <p>Precisa de ajuda com o seu pagamento?</p>
              <a
                href="https://wa.me/5544997303797"
                target="_blank"
                rel="noreferrer"
                className="font-bold text-[#25D366] hover:underline inline-flex items-center gap-1 mt-1"
              >
                <MessageCircle size={13} />
                <span>Falar no Suporte da Loja</span>
              </a>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
