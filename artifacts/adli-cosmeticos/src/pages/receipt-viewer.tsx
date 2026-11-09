import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import {
  ShieldCheck,
  Calendar,
  User,
  ShoppingBag,
  Download,
  ExternalLink,
  ArrowLeft,
  FileText,
  AlertCircle,
  Loader2,
  ZoomIn,
  CheckCircle2,
} from 'lucide-react';
import { getReceipt, type ReceiptData } from '@/lib/receipt-service';
import { formatPrice } from '@/lib/products-data';

export default function ReceiptViewerPage() {
  const [, setLocation] = useLocation();
  const [receipt, setReceipt] = useState<ReceiptData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isZoomed, setIsZoomed] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const params = new URLSearchParams(window.location.search);
        let id = params.get('id');

        if (!id) {
          const pathParts = window.location.pathname.split('/');
          const lastPart = pathParts[pathParts.length - 1];
          if (lastPart && lastPart !== 'comprovante') {
            id = lastPart;
          }
        }

        if (!id) {
          setError('Identificador de comprovante não informado na URL.');
          setLoading(false);
          return;
        }

        const data = await getReceipt(id);
        if (!data) {
          setError('Comprovante não encontrado ou expirado.');
        } else {
          setReceipt(data);
        }
      } catch (err) {
        setError('Ocorreu um erro ao carregar os dados do comprovante.');
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  function formatDate(isoString: string) {
    try {
      const d = new Date(isoString);
      return d.toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return 'Data não disponível';
    }
  }

  function formatSize(bytes: number) {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  const fileSource = receipt?.fileUrl || receipt?.base64Data || '';
  const isPdf = receipt?.fileType === 'application/pdf' || receipt?.fileName.toLowerCase().endsWith('.pdf');

  function handleDownload() {
    if (!fileSource) return;
    const link = document.createElement('a');
    link.href = fileSource;
    link.download = receipt?.fileName || 'comprovante-adli-cosmeticos';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#443a35] flex flex-col">
      {/* Top Header */}
      <header className="sticky top-0 z-30 border-b border-[#DCC4BD] bg-white/95 backdrop-blur-md px-4 py-3 shadow-xs">
        <div className="mx-auto flex max-w-4xl items-center justify-between">
          <button
            onClick={() => setLocation('/')}
            className="flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold text-[#966960] hover:bg-[#ECDDD8] transition"
          >
            <ArrowLeft size={16} />
            <span>Ir para a Loja</span>
          </button>

          <div className="flex items-center gap-2">
            <img src="/adli-logo.png" alt="Adli Lima Cosméticos" className="h-7 object-contain" />
            <span className="hidden sm:inline text-xs font-bold text-[#614331]">
              Adli Lima Cosméticos
            </span>
          </div>

          <div className="flex items-center gap-1 text-[11px] font-semibold text-green-700 bg-green-50 px-2.5 py-1 rounded-full border border-green-200">
            <CheckCircle2 size={13} />
            <span>Comprovante Registrado</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-4 py-6 sm:py-8">
        <div className="mx-auto max-w-2xl space-y-5">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-center space-y-3">
              <Loader2 className="animate-spin text-[#966960]" size={36} />
              <p className="text-sm font-semibold text-[#614331]">Carregando comprovante...</p>
              <p className="text-xs text-[#927C75]">Buscando dados seguros no servidor</p>
            </div>
          ) : error || !receipt ? (
            <div className="rounded-2xl border border-red-200 bg-white p-8 text-center shadow-md space-y-4">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-100 text-red-600">
                <AlertCircle size={28} />
              </div>
              <h2 className="text-lg font-bold text-[#443a35]">Comprovante não encontrado</h2>
              <p className="text-xs text-[#927C75] max-w-md mx-auto">
                {error || 'Não foi possível localizar este comprovante. Verifique o link ou entre em contato com o atendimento.'}
              </p>
              <button
                onClick={() => setLocation('/')}
                className="inline-flex items-center gap-2 rounded-xl bg-[#966960] px-5 py-2.5 text-xs font-bold text-white hover:bg-[#B68475] transition shadow"
              >
                <ArrowLeft size={14} /> Voltar para o início
              </button>
            </div>
          ) : (
            <>
              {/* Card de Detalhes do Pedido */}
              <div className="rounded-2xl border border-[#DCC4BD] bg-white p-5 shadow-sm space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#F0E4E0] pb-3">
                  <div>
                    <h1 className="text-base font-bold text-[#614331]">
                      Comprovante de Pagamento
                    </h1>
                    <p className="text-[11px] text-[#927C75]">
                      Adli Lima Cosméticos • Verificação de Pedido
                    </p>
                  </div>
                  <span className="rounded-full bg-[#ECDDD8] px-3 py-1 text-[11px] font-bold text-[#614331]">
                    ID: {receipt.id}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs sm:grid-cols-3">
                  <div className="rounded-xl bg-[#FAF8F5] p-3 border border-[#F0E4E0]">
                    <div className="flex items-center gap-1.5 text-[11px] text-[#927C75] mb-1">
                      <User size={13} className="text-[#966960]" />
                      <span>Cliente</span>
                    </div>
                    <p className="font-bold text-[#443a35] truncate">
                      {receipt.customerName || 'Cliente'}
                    </p>
                    {receipt.customerCity && (
                      <p className="text-[10px] text-[#927C75]">{receipt.customerCity}</p>
                    )}
                  </div>

                  <div className="rounded-xl bg-[#FAF8F5] p-3 border border-[#F0E4E0]">
                    <div className="flex items-center gap-1.5 text-[11px] text-[#927C75] mb-1">
                      <ShoppingBag size={13} className="text-[#966960]" />
                      <span>Valor Total</span>
                    </div>
                    <p className="font-bold text-[#16a34a] text-sm">
                      {receipt.totalCents ? formatPrice(receipt.totalCents) : 'Confirmado'}
                    </p>
                    <p className="text-[10px] text-green-700 font-medium">Pago via Pix / Cartão</p>
                  </div>

                  <div className="col-span-2 sm:col-span-1 rounded-xl bg-[#FAF8F5] p-3 border border-[#F0E4E0]">
                    <div className="flex items-center gap-1.5 text-[11px] text-[#927C75] mb-1">
                      <Calendar size={13} className="text-[#966960]" />
                      <span>Data / Hora</span>
                    </div>
                    <p className="font-bold text-[#443a35] text-[11px]">
                      {formatDate(receipt.createdAt)}
                    </p>
                    <p className="text-[10px] text-[#927C75]">
                      {formatSize(receipt.fileSize)}
                    </p>
                  </div>
                </div>

                {/* Ações Rápidas */}
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <button
                    onClick={handleDownload}
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-[#966960] px-4 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-[#B68475] transition"
                  >
                    <Download size={15} />
                    <span>Baixar Arquivo</span>
                  </button>
                  {receipt.fileUrl && (
                    <a
                      href={receipt.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-1.5 rounded-xl border border-[#DCC4BD] bg-white px-4 py-2.5 text-xs font-bold text-[#614331] hover:bg-[#FAF8F5] transition"
                    >
                      <ExternalLink size={15} />
                      <span>Abrir Original</span>
                    </a>
                  )}
                </div>
              </div>

              {/* Visualização do Print / Documento */}
              <div className="rounded-2xl border border-[#DCC4BD] bg-white p-4 sm:p-5 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#ECDDD8] text-[#966960]">
                      <FileText size={16} />
                    </span>
                    <div>
                      <h2 className="text-xs font-bold text-[#443a35]">
                        Visualização do Comprovante
                      </h2>
                      <p className="text-[10px] text-[#927C75] truncate max-w-[200px] sm:max-w-md">
                        {receipt.fileName}
                      </p>
                    </div>
                  </div>

                  {!isPdf && fileSource && (
                    <button
                      onClick={() => setIsZoomed(!isZoomed)}
                      className="flex items-center gap-1 rounded-lg border border-[#DCC4BD] bg-[#FAF8F5] px-2.5 py-1 text-[11px] font-semibold text-[#614331] hover:bg-[#ECDDD8] transition"
                    >
                      <ZoomIn size={13} />
                      <span>{isZoomed ? 'Reduzir' : 'Zoom'}</span>
                    </button>
                  )}
                </div>

                <div className="overflow-hidden rounded-xl border border-[#E5D7D2] bg-[#FAF8F5] p-2 flex items-center justify-center min-h-[300px]">
                  {isPdf ? (
                    <div className="w-full text-center py-8 space-y-4">
                      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-red-600 border border-red-200">
                        <FileText size={32} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-[#443a35]">Documento PDF do Comprovante</p>
                        <p className="text-xs text-[#927C75] mt-1">
                          Arquivo: {receipt.fileName} ({formatSize(receipt.fileSize)})
                        </p>
                      </div>
                      <div className="flex justify-center gap-2 pt-2">
                        <a
                          href={fileSource}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 rounded-xl bg-[#966960] px-4 py-2.5 text-xs font-bold text-white shadow hover:bg-[#B68475] transition"
                        >
                          <ExternalLink size={14} /> Abrir PDF Completo
                        </a>
                        <button
                          onClick={handleDownload}
                          className="inline-flex items-center gap-1.5 rounded-xl border border-[#DCC4BD] bg-white px-4 py-2.5 text-xs font-bold text-[#614331] hover:bg-[#FAF8F5] transition"
                        >
                          <Download size={14} /> Baixar PDF
                        </button>
                      </div>
                    </div>
                  ) : fileSource ? (
                    <img
                      src={fileSource}
                      alt="Print do Comprovante"
                      className={`rounded-lg object-contain transition-all duration-300 ${
                        isZoomed
                          ? 'max-h-none w-full cursor-zoom-out'
                          : 'max-h-[600px] w-auto cursor-zoom-in'
                      }`}
                      onClick={() => setIsZoomed(!isZoomed)}
                    />
                  ) : (
                    <p className="text-xs text-[#927C75]">Nenhum arquivo de imagem disponível.</p>
                  )}
                </div>
              </div>

              {/* Informação de Segurança */}
              <div className="flex items-center justify-center gap-1.5 text-[11px] text-[#927C75] pt-2">
                <ShieldCheck size={14} className="text-green-600" />
                <span>Comprovante transmitido e armazenado de forma segura • Adli Lima Cosméticos</span>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
