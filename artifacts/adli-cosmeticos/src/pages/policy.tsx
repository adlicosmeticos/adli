import { useState, useEffect } from 'react';
import { ArrowLeft, MessageCircle, Mail, MapPin, Truck, RefreshCw, Shield, FileText, ChevronRight } from 'lucide-react';
import { getWhatsAppLink } from '@/lib/products-data';

interface PolicyProps {
  initialTab?: string;
}

export default function PolicyPage({ initialTab = 'envio' }: PolicyProps) {
  const [activeTab, setActiveTab] = useState(initialTab);
  const whatsappUrl = getWhatsAppLink();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeTab]);

  const tabs = [
    { id: 'fale-conosco', label: 'Fale Conosco', icon: <MessageCircle size={16} /> },
    { id: 'envio', label: 'Política de Envio', icon: <Truck size={16} /> },
    { id: 'trocas', label: 'Trocas e Devoluções', icon: <RefreshCw size={16} /> },
    { id: 'termos', label: 'Termos e Condições', icon: <FileText size={16} /> },
    { id: 'privacidade', label: 'Política de Privacidade', icon: <Shield size={16} /> },
  ];

  return (
    <div className="min-h-screen bg-[#f8f4eb] text-[#39312d]">
      {/* Top Header */}
      <header className="sticky top-0 z-30 border-b border-[#e4dbcf] bg-[#f8f4eb]/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-[1200px] items-center justify-between px-5 py-4">
          <a href="/" className="flex items-center gap-2 text-xs font-semibold tracking-wider text-[#665b54] transition hover:text-[#a66e68]">
            <ArrowLeft size={16} /> VOLTAR PARA A LOJA
          </a>
          <a href="/">
            <img src="/adli-logo.png" alt="Adli Lima Cosméticos" className="h-10 w-auto object-contain" />
          </a>
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 rounded-full bg-[#966960] px-4 py-2 text-[11px] font-bold tracking-wide text-white transition hover:bg-[#B68475]"
          >
            <MessageCircle size={14} /> WHATSAPP
          </a>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-[1100px] px-5 py-12">
        <div className="mb-10 text-center">
          <span className="text-[11px] font-semibold tracking-[0.2em] text-[#a66e68]">CENTRAL DE ATENDIMENTO</span>
          <h1 className="serif mt-2 text-3xl sm:text-4xl text-[#443a35]">Cuidado, Transparência & Suporte</h1>
          <p className="mt-2 text-xs sm:text-sm text-[#746861]">Tudo o que você precisa saber sobre compras, envios e segurança na Adli Lima Cosméticos.</p>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-10 flex flex-wrap justify-center gap-2 border-b border-[#e4dbcf] pb-4">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 rounded-full px-4 py-2.5 text-xs font-medium transition ${
                activeTab === tab.id
                  ? 'bg-[#966960] text-white shadow-sm'
                  : 'bg-white/80 text-[#614331] hover:bg-[#ECDDD8]'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Box */}
        <div className="rounded-2xl border border-[#e4dbcf] bg-white p-6 sm:p-10 shadow-sm">
          {/* 1. FALE CONOSCO */}
          {activeTab === 'fale-conosco' && (
            <div className="space-y-6">
              <div>
                <span className="text-[10px] font-bold tracking-[0.18em] text-[#a66e68]">CANAL DIRETO</span>
                <h2 className="serif mt-1 text-2xl text-[#443a35]">Fale Conosco</h2>
                <p className="mt-2 text-sm text-[#665b54] leading-relaxed">
                  Estamos sempre à disposição para esclarecer dúvidas sobre os nossos produtos, acompanhar o seu pedido ou indicar o melhor tratamento para o seu tipo de cabelo.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 pt-4">
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="group flex items-start gap-4 rounded-xl border border-[#ece3d8] p-5 transition hover:border-[#966960] hover:bg-[#faf6f0]"
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#966960]/10 text-[#966960]">
                    <MessageCircle size={20} />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-[#443a35] group-hover:text-[#966960]">WhatsApp Comercial</h3>
                    <p className="mt-1 text-xs text-[#746861]">(44) 99730-3797</p>
                    <span className="mt-2 inline-flex items-center gap-1 text-[11px] font-medium text-[#966960]">
                      Iniciar conversa <ChevronRight size={12} />
                    </span>
                  </div>
                </a>

                <a
                  href="mailto:adlilimalinhacosmeticos@gmail.com"
                  className="group flex items-start gap-4 rounded-xl border border-[#ece3d8] p-5 transition hover:border-[#a66e68] hover:bg-[#faf6f0]"
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#a66e68]/10 text-[#a66e68]">
                    <Mail size={20} />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-[#443a35] group-hover:text-[#a66e68]">E-mail Oficial</h3>
                    <p className="mt-1 text-xs text-[#746861] break-all">adlilimalinhacosmeticos@gmail.com</p>
                    <span className="mt-2 inline-flex items-center gap-1 text-[11px] font-medium text-[#a66e68]">
                      Enviar mensagem <ChevronRight size={12} />
                    </span>
                  </div>
                </a>
              </div>

              <div className="rounded-xl bg-[#f8f5ee] p-5 mt-6 border border-[#ece5db]">
                <div className="flex items-start gap-3">
                  <MapPin size={20} className="shrink-0 text-[#a66e68] mt-0.5" />
                  <div>
                    <h4 className="text-xs font-semibold text-[#443a35]">Endereço & Atendimento Físico</h4>
                    <p className="mt-1 text-xs text-[#665b54] leading-relaxed">
                      Rua Antônio José da Silva, 620 — Paranavaí / PR · CEP 87711-310<br />
                      Horário de Atendimento: Segunda a Sexta, das 08h30 às 18h00.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 2. POLÍTICA DE ENVIO */}
          {activeTab === 'envio' && (
            <div className="space-y-6">
              <div>
                <span className="text-[10px] font-bold tracking-[0.18em] text-[#a66e68]">ENTREGAS & PRAZOS</span>
                <h2 className="serif mt-1 text-2xl text-[#443a35]">Política de Envio</h2>
                <p className="mt-2 text-sm text-[#665b54] leading-relaxed">
                  Trabalhamos para que seus produtos de cuidado capilar cheguem com agilidade, segurança e carinho até o conforto da sua casa.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 pt-2">
                <div className="rounded-xl border-2 border-[#966960]/40 bg-[#FBFBFA] p-5">
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-[#966960] px-2.5 py-0.5 text-[10px] font-bold text-white">PARANÁ (PR)</span>
                    <h3 className="text-sm font-bold text-[#614331]">Frete Fixo Estadual</h3>
                  </div>
                  <p className="mt-3 text-2xl font-bold text-[#966960]">R$ 27,00</p>
                  <p className="mt-2 text-xs text-[#927C75] leading-relaxed">
                    Para todas as cidades do estado do Paraná, o frete possui valor fixo promocional de apenas R$ 27,00 por pedido.
                  </p>
                </div>

                <div className="rounded-xl border-2 border-[#B68475]/40 bg-[#FBFBFA] p-5">
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-[#B68475] px-2.5 py-0.5 text-[10px] font-bold text-white">DEMAIS ESTADOS</span>
                    <h3 className="text-sm font-bold text-[#614331]">Cálculo via WhatsApp</h3>
                  </div>
                  <p className="mt-3 text-sm font-semibold text-[#B68475]">Sob consulta de CEP</p>
                  <p className="mt-2 text-xs text-[#927C75] leading-relaxed">
                    Para envios fora do Paraná, cotamos as melhores opções de transportadora e Correios diretamente via WhatsApp para garantir o menor custo.
                  </p>
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[#966960] px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-[#B68475]"
                  >
                    <MessageCircle size={14} /> Cotar Frete no WhatsApp
                  </a>
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-[#f0e8df] text-xs text-[#665b54] leading-relaxed">
                <h4 className="text-sm font-semibold text-[#443a35]">Informações Importantes sobre o Envio:</h4>
                <ul className="list-disc pl-5 space-y-2">
                  <li><strong>Prazo de Postagem:</strong> Os pedidos são preparados e postados em até 1 a 2 dias úteis após a confirmação do pagamento.</li>
                  <li><strong>Rastreamento:</strong> Assim que sua encomenda for despachada, enviamos o código de rastreio e link direto para acompanhamento.</li>
                  <li><strong>Embalagem Protetora:</strong> Cada frasco e pote é cuidadosamente lacrado e embalado com proteção térmica e anti-impacto.</li>
                </ul>
              </div>
            </div>
          )}

          {/* 3. TROCAS E DEVOLUÇÕES */}
          {activeTab === 'trocas' && (
            <div className="space-y-6">
              <div>
                <span className="text-[10px] font-bold tracking-[0.18em] text-[#a66e68]">SATISFAÇÃO GARANTIDA</span>
                <h2 className="serif mt-1 text-2xl text-[#443a35]">Trocas e Devoluções</h2>
                <p className="mt-2 text-sm text-[#665b54] leading-relaxed">
                  Nosso compromisso é com a sua total satisfação e bem-estar. Caso precise trocar ou devolver algum item, nossa política é descomplicada e segue as normas do Código de Defesa do Consumidor.
                </p>
              </div>

              <div className="space-y-4 text-xs text-[#665b54] leading-relaxed pt-2">
                <div className="rounded-xl bg-[#faf6f0] p-4 border border-[#e8dfd4]">
                  <h3 className="text-sm font-bold text-[#443a35]">1. Direito de Arrependimento (Até 7 dias)</h3>
                  <p className="mt-1">
                    Conforme o artigo 49 do CDC, você tem até <strong>7 (sete) dias corridos</strong> a partir do recebimento do pedido para solicitar a devolução por desistência, desde que o produto esteja <strong>sem uso, com lacre original intacto e embalagem preservada</strong>.
                  </p>
                </div>

                <div className="rounded-xl bg-[#faf6f0] p-4 border border-[#e8dfd4]">
                  <h3 className="text-sm font-bold text-[#443a35]">2. Avarias ou Divergência no Transporte</h3>
                  <p className="mt-1">
                    Se a caixa apresentar violação ou se algum produto chegar danificado no transporte, entre em contato imediatamente (em até 48 horas do recebimento) com fotos do ocorrido pelo nosso WhatsApp para reposição imediata sem custos.
                  </p>
                </div>

                <div className="rounded-xl bg-[#faf6f0] p-4 border border-[#e8dfd4]">
                  <h3 className="text-sm font-bold text-[#443a35]">3. Como Solicitar</h3>
                  <p className="mt-1">
                    Basta enviar uma mensagem no WhatsApp <strong>(44) 99730-3797</strong> ou e-mail informando o número do pedido, seu nome e o motivo da troca. Nossa equipe orientará sobre o envio da logística reversa.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* 4. TERMOS E CONDIÇÕES */}
          {activeTab === 'termos' && (
            <div className="space-y-6">
              <div>
                <span className="text-[10px] font-bold tracking-[0.18em] text-[#a66e68]">ACORDO DE USO</span>
                <h2 className="serif mt-1 text-2xl text-[#443a35]">Termos e Condições</h2>
                <p className="mt-2 text-sm text-[#665b54] leading-relaxed">
                  Ao navegar e realizar pedidos na Adli Lima Cosméticos, você concorda com os seguintes termos gerais de serviço.
                </p>
              </div>

              <div className="space-y-4 text-xs text-[#665b54] leading-relaxed pt-2">
                <div>
                  <h3 className="text-sm font-semibold text-[#443a35]">1. Informações de Produtos e Preços</h3>
                  <p className="mt-1">
                    Buscamos exibir com precisão descrições, ativos, modo de uso e fotos reais dos cosméticos. Reservamo-nos o direito de corrigir eventuais erros gráficos ou atualizar preços sem aviso prévio.
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-[#443a35]">2. Processamento e Pagamentos</h3>
                  <p className="mt-1">
                    Os pedidos são validados após confirmação do meio de pagamento (Pix instantâneo ou Cartão de Crédito). O parcelamento é disponibilizado em até 3 vezes sem juros.
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-[#443a35]">3. Propriedade Intelectual</h3>
                  <p className="mt-1">
                    Todo conteúdo deste site, incluindo marca, logotipo, fotografias institucionais, textos autorais e layouts são de propriedade exclusiva da <strong>Adli Lima Cosméticos (CNPJ: 61.681.521/0001-46)</strong>.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* 5. POLÍTICA DE PRIVACIDADE */}
          {activeTab === 'privacidade' && (
            <div className="space-y-6">
              <div>
                <span className="text-[10px] font-bold tracking-[0.18em] text-[#a66e68]">SEGURANÇA & DADOS</span>
                <h2 className="serif mt-1 text-2xl text-[#443a35]">Política de Privacidade (LGPD)</h2>
                <p className="mt-2 text-sm text-[#665b54] leading-relaxed">
                  Sua privacidade é prioridade absoluta. Tratamos todos os seus dados pessoais com o mais alto padrão de segurança e confidencialidade.
                </p>
              </div>

              <div className="space-y-4 text-xs text-[#665b54] leading-relaxed pt-2">
                <div>
                  <h3 className="text-sm font-semibold text-[#443a35]">1. Coleta e Finalidade dos Dados</h3>
                  <p className="mt-1">
                    Coletamos apenas as informações estritamente necessárias para a emissão do pedido e entrega da sua compra: nome completo, endereço de envio, CPF (para nota fiscal) e número de WhatsApp para atualizações de rastreamento.
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-[#443a35]">2. Compartilhamento Restrito</h3>
                  <p className="mt-1">
                    Seus dados <strong>nunca</strong> são vendidos, alugados ou compartilhados com terceiros para fins publicitários. Compartilhamos unicamente com transportadoras e intermediadores de pagamento para viabilizar a entrega.
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-[#443a35]">3. Seus Direitos</h3>
                  <p className="mt-1">
                    Conforme a Lei Geral de Proteção de Dados (LGPD - Lei nº 13.709/2018), você pode a qualquer momento solicitar a atualização, confirmação ou remoção dos seus dados cadastrais enviando uma mensagem aos nossos canais oficiais.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer Minimal */}
      <footer className="border-t border-[#e4dbcf] bg-[#f0e8df] py-6 text-center text-[11px] text-[#746861]">
        © 2026 Adli Lima Cosméticos · CNPJ 61.681.521/0001-46 · Paranavaí / PR
      </footer>
    </div>
  );
}
