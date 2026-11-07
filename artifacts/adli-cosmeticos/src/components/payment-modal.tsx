import { useState, useRef, useEffect, type ChangeEvent } from 'react';
import {
  X,
  CreditCard,
  QrCode,
  Copy,
  Check,
  ExternalLink,
  ShoppingBag,
  MessageCircle,
  ShieldCheck,
  ChevronLeft,
  Upload,
  FileText,
  Trash2,
  AlertCircle,
  CheckCircle2,
  Calculator,
} from 'lucide-react';
import type { CartItem, CustomerInfo, Coupon } from '@/lib/cart-context';
import { formatPrice, parseToCents } from '@/lib/products-data';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  subtotalCents: number;
  discountCents: number;
  shippingCents: number;
  customShippingCents: number;
  setCustomShippingCents: (cents: number) => void;
  totalCents: number;
  appliedCoupon: Coupon | null;
  customer: CustomerInfo;
  isParana: boolean;
  generateWhatsAppUrl: () => string;
  generateShippingQuoteWhatsAppUrl: () => string;
}

export default function PaymentModal({
  isOpen,
  onClose,
  items,
  subtotalCents,
  discountCents,
  shippingCents,
  customShippingCents,
  setCustomShippingCents,
  totalCents,
  appliedCoupon,
  customer,
  isParana,
  generateShippingQuoteWhatsAppUrl,
}: PaymentModalProps) {
  const [copiedPix, setCopiedPix] = useState(false);
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [shippingInput, setShippingInput] = useState(
    customShippingCents > 0 ? (customShippingCents / 100).toFixed(2).replace('.', ',') : ''
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (customShippingCents > 0) {
      setShippingInput((customShippingCents / 100).toFixed(2).replace('.', ','));
    }
  }, [customShippingCents]);

  if (!isOpen) return null;

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
    msg += `📎 *COMPROVANTE:* Arquivo "${receiptFile.name}" pronto para conferência\n`;
    msg += `\n`;

    msg += `👤 *Cliente:* ${customer.name || 'Não informado'}\n`;
    msg += `📍 *Cidade / Estado:* ${customer.city || 'Paranavaí'} - ${customer.state || 'PR'}\n`;

    if (customer.deliveryMethod === 'pickup') {
      msg += `📦 *Modalidade:* 🏪 Retirada no Balcão da Loja (Grátis)\n`;
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

    if (receiptFile) {
      msg += `Olá! Já realizei o pagamento do meu pedido e estou enviando o comprovante em anexo nesta conversa. Aguardo a confirmação da preparação e envio dos meus produtos! ✨`;
    } else {
      msg += `Olá! Já realizei o pagamento do meu pedido e segue a confirmação para envio dos produtos! ✨`;
    }

    const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-3 sm:p-4 overflow-y-auto bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg overflow-hidden rounded-2xl bg-[#FBFBFA] shadow-2xl border border-[#DCC4BD] my-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#DCC4BD] bg-white px-5 py-4">
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="mr-1 flex h-8 w-8 items-center justify-center rounded-full text-[#927C75] transition hover:bg-[#ECDDD8] hover:text-[#614331]"
              title="Voltar para a Sacola"
            >
              <ChevronLeft size={20} />
            </button>
            <div>
              <h2 className="text-base font-bold text-[#614331]">Finalizar Pagamento</h2>
              <p className="text-[11px] text-[#927C75]">Adli Lima Cosméticos</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-[#927C75] transition hover:bg-[#ECDDD8] hover:text-[#614331]"
            title="Fechar"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Body */}
        <div className="max-h-[calc(85vh-120px)] overflow-y-auto px-5 py-4 space-y-4">
          {/* Card Resumo do Pedido */}
          <div className="rounded-xl border border-[#DCC4BD] bg-white p-4 shadow-xs">
            <div className="flex items-center gap-2 border-b border-[#F0E4E0] pb-2 text-xs font-bold text-[#614331]">
              <ShoppingBag size={15} className="text-[#966960]" />
              <span>Produtos Selecionados ({items.reduce((acc, i) => acc + i.quantity, 0)})</span>
            </div>

            {/* Lista dos produtos */}
            <div className="divide-y divide-[#F4ECE8] max-h-40 overflow-y-auto pr-1 my-2">
              {items.map((item) => (
                <div key={item.product.id} className="flex items-center justify-between py-2 text-xs">
                  <div className="flex items-center gap-2.5 min-w-0 pr-2">
                    <img
                      src={item.product.image_url}
                      alt={item.product.name}
                      className="h-9 w-9 shrink-0 rounded-md border border-[#F0E4E0] object-contain bg-[#FAF5F0] p-0.5"
                    />
                    <div className="min-w-0">
                      <p className="font-medium text-[#443a35] truncate text-[11px]">{item.product.name}</p>
                      <p className="text-[10px] text-[#927C75]">Qtd: {item.quantity}</p>
                    </div>
                  </div>
                  <span className="shrink-0 font-semibold text-[#614331] text-[11px]">
                    {formatPrice(item.product.price_cents * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            {/* Linhas de Valores */}
            <div className="border-t border-[#F0E4E0] pt-2.5 space-y-2 text-xs text-[#927C75]">
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

              {/* Linha do Frete com link direto pro WhatsApp */}
              <div className="flex justify-between items-center">
                <span>Frete</span>
                <span>
                  {customer.deliveryMethod === 'pickup' ? (
                    'Grátis (Retirada)'
                  ) : isParana ? (
                    <span className="font-bold text-[#614331]">R$ 27,00 (Fixo PR)</span>
                  ) : customShippingCents > 0 ? (
                    <span className="font-bold text-[#614331]">
                      {formatPrice(customShippingCents)} (Consultado)
                    </span>
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

              {/* Quadradinho: Somar o Frete (para demais estados) */}
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
                      Coloque o valor que a loja te informou no WhatsApp e clique em <strong>Somar Frete</strong> para atualizar o total.
                    </p>
                  )}
                </div>
              )}

              {/* Valor Total a Pagar com o frete somado */}
              <div className="flex items-center justify-between rounded-lg bg-[#ECDDD8]/60 px-3 py-2 mt-2 border border-[#DCC4BD]">
                <span className="text-xs font-bold text-[#614331]">Valor Total a Pagar:</span>
                <span className="text-base font-extrabold text-[#966960]">
                  {formatPrice(totalCents)}
                </span>
              </div>
            </div>
          </div>

          {/* PASSO 1: Formas de Pagamento */}
          <div className="space-y-3">
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#927C75]">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#966960] text-[10px] text-white">
                1
              </span>
              <span>Escolha como pagar seu pedido:</span>
            </div>

            {/* Opção 1: Cartão de Crédito, Boleto ou Saldo */}
            <div className="rounded-xl border-2 border-[#DCC4BD] bg-white p-4 transition-all hover:border-[#966960] shadow-xs">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#966960]/10 text-[#966960]">
                    <CreditCard size={20} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[#443a35]">
                      Divida sua compra ou pague com cartão, boleto e saldo
                    </h4>
                    <p className="text-[11px] text-[#927C75] mt-0.5">
                      Cartão de crédito, boleto bancário ou saldo em conta.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-3">
                <button
                  type="button"
                  onClick={handleOpenPaymentLink}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#966960] py-2.5 px-4 text-xs font-bold text-white shadow-sm transition hover:bg-[#B68475] active:scale-[0.99]"
                >
                  <span>Pagar com Cartão, Boleto ou Saldo ({formatPrice(totalCents)})</span>
                  <ExternalLink size={14} />
                </button>
                <p className="mt-1 text-center text-[10px] text-[#927C75]">
                  Ambiente seguro: você será direcionada à página oficial de pagamento.
                </p>
              </div>
            </div>

            {/* Opção 2: Pix Chave CNPJ */}
            <div className="rounded-xl border-2 border-[#DCC4BD] bg-white p-4 transition-all hover:border-[#22c55e] shadow-xs">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#22c55e]/15 text-[#16a34a]">
                    <QrCode size={20} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[#443a35]">Pagar com Pix</h4>
                    <p className="text-[11px] text-[#927C75] mt-0.5">
                      Copie a chave Pix CNPJ e transfira o valor de <strong>{formatPrice(totalCents)}</strong>.
                    </p>
                  </div>
                </div>
              </div>

              {/* Caixa da Chave Pix */}
              <div className="mt-3 space-y-2">
                <div className="flex items-center justify-between rounded-lg border border-[#DCC4BD] bg-[#FAF8F4] px-3 py-2">
                  <div className="min-w-0 pr-2">
                    <span className="block text-[9px] font-semibold text-[#927C75] uppercase">Chave CNPJ:</span>
                    <span className="font-mono text-xs font-bold text-[#443a35] select-all tracking-wide">
                      {pixKey}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleCopyPix}
                    className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all shadow-xs ${
                      copiedPix
                        ? 'bg-[#16a34a] text-white'
                        : 'bg-[#966960] text-white hover:bg-[#B68475]'
                    }`}
                  >
                    {copiedPix ? (
                      <>
                        <Check size={14} />
                        <span>Copiado!</span>
                      </>
                    ) : (
                      <>
                        <Copy size={14} />
                        <span>Copiar Chave</span>
                      </>
                    )}
                  </button>
                </div>

                {copiedPix && (
                  <p className="text-center text-[11px] font-semibold text-[#16a34a] animate-in fade-in">
                    ✓ Chave Pix copiada para a área de transferência!
                  </p>
                )}

                <div className="rounded-lg bg-[#FAF8F4] p-2 text-[10px] text-[#927C75] border border-[#F0E4E0] space-y-0.5">
                  <p>1. Clique em <strong>Copiar Chave</strong>.</p>
                  <p>2. Abra o app do seu banco e escolha a opção <strong>Pix &gt; CNPJ</strong>.</p>
                  <p>3. Cole a chave, insira o valor de <strong>{formatPrice(totalCents)}</strong> e confirme.</p>
                </div>
              </div>
            </div>
          </div>

          {/* PASSO 2: Envio do Comprovante e Confirmação no WhatsApp */}
          <div className="rounded-2xl border-2 border-[#25D366]/40 bg-[#FAF8F5] p-4 shadow-sm space-y-3.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#614331]">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#25D366] text-[10px] text-white font-bold">
                2
              </span>
              <span className="text-sm font-bold text-[#273B2E]">Após pagar: envie seu comprovante</span>
            </div>

            {/* Aviso de retorno */}
            <div className="rounded-xl border border-[#DCC4BD] bg-[#ECDDD8]/60 p-3 text-xs text-[#614331] space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-[#966960]">
                <AlertCircle size={15} className="shrink-0" />
                <span>Volte aqui nesta tela após realizar o pagamento!</span>
              </div>
              <p className="text-[11px] leading-relaxed text-[#614331]">
                Assim que você efetuar o pagamento no link do cartão/boleto ou no Pix, <strong>retorne aqui nesta tela</strong> para carregar o seu comprovante e enviar a confirmação completa para nosso WhatsApp.
              </p>
            </div>

            {/* Upload do Comprovante (Print ou PDF) */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-[#443a35]">
                Carregar Comprovante (Print em PNG/JPG ou PDF):
              </label>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/jpg,image/webp,application/pdf"
                onChange={handleFileSelect}
                className="hidden"
                id="receipt-upload"
              />

              {!receiptFile ? (
                <label
                  htmlFor="receipt-upload"
                  className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-[#DCC4BD] bg-white p-4 cursor-pointer hover:border-[#966960] hover:bg-[#FAF5F0] transition group text-center"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#ECDDD8] text-[#966960] group-hover:scale-105 transition mb-2">
                    <Upload size={18} />
                  </div>
                  <span className="text-xs font-bold text-[#614331]">
                    Clique para selecionar seu comprovante
                  </span>
                  <span className="text-[10px] text-[#927C75] mt-0.5">
                    Aceita Print (PNG, JPG) ou documento PDF
                  </span>
                </label>
              ) : (
                <div className="flex items-center justify-between rounded-xl border border-[#22c55e]/50 bg-green-50/70 p-3 text-xs">
                  <div className="flex items-center gap-2.5 min-w-0 pr-2">
                    {previewUrl ? (
                      <img
                        src={previewUrl}
                        alt="Preview comprovante"
                        className="h-10 w-10 shrink-0 rounded-lg border border-green-200 object-cover"
                      />
                    ) : (
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-green-100 text-green-700">
                        <FileText size={20} />
                      </div>
                    )}
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <CheckCircle2 size={13} className="text-[#16a34a] shrink-0" />
                        <span className="font-bold text-[#1e3a1e] truncate text-[11px] max-w-[190px]">
                          {receiptFile.name}
                        </span>
                      </div>
                      <span className="text-[10px] text-green-700">
                        {formatFileSize(receiptFile.size)} • Pronto para confirmar
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleRemoveFile}
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-red-500 hover:bg-red-100 transition"
                    title="Remover e escolher outro"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              )}
            </div>

            {/* Botão de Envio no WhatsApp */}
            <div className="pt-1">
              <button
                type="button"
                onClick={handleSendWhatsApp}
                disabled={!receiptFile}
                className={`flex w-full items-center justify-center gap-2 rounded-xl py-3 px-4 text-xs font-bold transition ${
                  receiptFile
                    ? 'bg-[#25D366] text-white shadow-md hover:bg-[#20ba59] active:scale-[0.99] cursor-pointer'
                    : 'bg-[#e2dcda] text-[#9c8f8b] cursor-not-allowed shadow-none'
                }`}
              >
                <MessageCircle size={16} />
                <span>CONFIRMAR PEDIDO E PAGAMENTO NO WHATSAPP</span>
              </button>
              <p className="mt-1.5 text-center text-[10px] leading-snug">
                {receiptFile ? (
                  <span className="font-semibold text-green-700">
                    ✨ Comprovante anexado! Ao abrir o WhatsApp, envie o print/PDF na conversa para confirmação imediata.
                  </span>
                ) : (
                  <span className="text-[#927C75]">
                    🔒 Carregue seu comprovante no campo acima para liberar este botão.
                  </span>
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-[#DCC4BD] bg-white px-5 py-3">
          <div className="flex items-center gap-1 text-[10px] text-[#927C75]">
            <ShieldCheck size={13} className="text-[#966960]" />
            <span>Compra 100% Segura</span>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg px-3 py-1.5 text-xs font-semibold text-[#614331] hover:bg-[#ECDDD8] transition"
          >
            Voltar para a Sacola
          </button>
        </div>
      </div>
    </div>
  );
}
