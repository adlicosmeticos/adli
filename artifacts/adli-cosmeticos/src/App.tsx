import { useState } from 'react';
import { ArrowDown, ArrowRight, Check, CreditCard, Instagram, Mail, MapPin, Menu, MessageCircle, Smartphone, X } from 'lucide-react';

const whatsappUrl = 'https://wa.me/5544997303797?text=Ol%C3%A1!%20Gostaria%20de%20conhecer%20a%20linha%20Adli%20Lima%20Cosm%C3%A9ticos.';
const instagramUrl = 'https://www.instagram.com/adlilimacosmeticos/';
const emailUrl = 'mailto:adlilimalinhacosmeticos@gmail.com';

function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const closeMenu = () => setMenuOpen(false);

  return (
    <main className="site-shell min-h-[100dvh] bg-[#f8f4eb] text-[#39312d]">
      <div className="topline px-5 py-2 text-center text-[10px] font-medium tracking-[.19em] sm:text-[11px]">
        CUIDADO PROFISSIONAL, COM O ACOLHIMENTO DE CASA
      </div>
      <header className="relative z-20 border-b border-[#e4dbcf] bg-[#f8f4eb]/95">
        <div className="mx-auto flex max-w-[1380px] items-center justify-between px-5 py-3 sm:px-8 lg:px-14">
          <a href="#inicio" aria-label="Adli Lima Cosméticos — início" data-testid="link-logo-home" className="flex items-center">
            <img src="/adli-logo.png" alt="Adli Lima Cosméticos" className="h-14 w-auto object-contain sm:h-[68px]" data-testid="img-brand-logo" />
          </a>
          <nav aria-label="Navegação principal" className="hidden items-center gap-9 md:flex">
            <a href="#linha" className="nav-link text-[12px] tracking-[.12em] text-[#665b54]" data-testid="link-nav-linha">A LINHA</a>
            <a href="#historia" className="nav-link text-[12px] tracking-[.12em] text-[#665b54]" data-testid="link-nav-historia">QUEM SOMOS</a>
            <a href="#pagamento" className="nav-link text-[12px] tracking-[.12em] text-[#665b54]" data-testid="link-nav-pagamento">PAGAMENTO</a>
            <a href="#contato" className="nav-link text-[12px] tracking-[.12em] text-[#665b54]" data-testid="link-nav-contato">CONTATO</a>
          </nav>
          <a href={whatsappUrl} target="_blank" rel="noreferrer" className="hidden items-center gap-2 rounded-full bg-[#718065] px-5 py-3 text-[11px] font-semibold tracking-[.1em] text-[#fffaf1] transition hover:bg-[#5d6d52] md:inline-flex" data-testid="link-header-whatsapp">
            <MessageCircle size={15} strokeWidth={1.8} /> FALE CONOSCO
          </a>
          <button type="button" aria-label={menuOpen ? 'Fechar menu' : 'Abrir menu'} aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)} className="flex h-11 w-11 items-center justify-center rounded-full border border-[#ded4c7] text-[#4a403b] md:hidden" data-testid="button-mobile-menu">
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
        {menuOpen && (
          <nav aria-label="Navegação móvel" className="absolute left-0 right-0 top-full border-b border-[#e4dbcf] bg-[#f8f4eb] px-6 py-5 shadow-lg md:hidden">
            <div className="mx-auto flex max-w-[1380px] flex-col gap-5">
              <a href="#linha" onClick={closeMenu} className="text-xs tracking-[.15em]" data-testid="link-mobile-linha">A LINHA</a>
              <a href="#historia" onClick={closeMenu} className="text-xs tracking-[.15em]" data-testid="link-mobile-historia">QUEM SOMOS</a>
              <a href="#pagamento" onClick={closeMenu} className="text-xs tracking-[.15em]" data-testid="link-mobile-pagamento">PAGAMENTO</a>
              <a href="#contato" onClick={closeMenu} className="text-xs tracking-[.15em]" data-testid="link-mobile-contato">CONTATO</a>
              <a href={whatsappUrl} target="_blank" rel="noreferrer" className="inline-flex w-fit items-center gap-2 rounded-full bg-[#718065] px-5 py-3 text-xs text-white" data-testid="link-mobile-whatsapp"><MessageCircle size={15} /> Conversar pelo WhatsApp</a>
            </div>
          </nav>
        )}
      </header>

      <section id="inicio" className="relative mx-auto grid max-w-[1440px] items-center gap-8 px-5 pb-14 pt-10 sm:px-8 sm:pb-20 sm:pt-14 lg:min-h-[650px] lg:grid-cols-[.88fr_1.12fr] lg:gap-12 lg:px-14 lg:py-14">
        <div className="relative z-10 order-2 max-w-[530px] lg:order-1 lg:pl-6">
          <p className="rise-in flex items-center gap-3 text-[10px] font-semibold tracking-[.24em] text-[#8b7569] sm:text-[11px]"><span className="h-px w-8 bg-[#d78388]" /> BELEZA QUE COMEÇA NO CUIDADO</p>
          <h1 className="serif rise-in delay-1 mt-6 text-[clamp(3.35rem,7vw,6.5rem)] leading-[.99] tracking-[-.055em] text-[#443a35]">
            Seu cabelo.<br /><em className="font-medium text-[#a66e68]">Seu momento.</em>
          </h1>
          <p className="rise-in delay-2 mt-7 max-w-[390px] text-[15px] leading-[1.8] text-[#746861] sm:text-base">
            Cuidado capilar profissional para fazer parte da sua rotina — e do jeito que você merece se sentir.
          </p>
          <div className="rise-in delay-3 mt-8 flex flex-wrap items-center gap-5">
            <a href="#linha" className="inline-flex items-center gap-3 rounded-full bg-[#718065] px-6 py-4 text-[11px] font-semibold tracking-[.12em] text-[#fffaf1] transition hover:bg-[#5d6d52]" data-testid="link-hero-explore">
              CONHEÇA A LINHA <ArrowRight size={15} />
            </a>
            <a href="#historia" className="text-[12px] text-[#6e625b] underline decoration-[#d9c9b8] underline-offset-4" data-testid="link-hero-story">Nossa história</a>
          </div>
          <div className="mt-12 flex items-center gap-3 text-[10px] tracking-[.18em] text-[#897c72]">
            <span className="serif text-xl italic text-[#a66e68]">2020</span><span className="h-px w-8 bg-[#d8c8b9]" /> NASCIDA DA EXPERIÊNCIA DE SALÃO
          </div>
        </div>
        <div className="hero-photo order-1 relative min-h-[360px] overflow-hidden rounded-[46%_46%_5px_5px] bg-[#e4d6c8] sm:min-h-[490px] lg:order-2 lg:min-h-[570px]">
          <img src="/brand-editorial.webp" alt="Mulher com cabelos cacheados em um momento de cuidado e bem-estar" className="absolute inset-0 h-full w-full object-cover object-[65%_center]" data-testid="img-hero-editorial" />
          <div className="absolute bottom-5 left-5 flex items-center gap-3 rounded-full bg-[#f8f4eb]/90 px-4 py-3 backdrop-blur-sm sm:bottom-8 sm:left-8 sm:px-5">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#e8c4b8] text-[#605147]"><Check size={16} /></span>
            <span className="text-[10px] leading-4 tracking-[.04em] text-[#544942] sm:text-[11px]">A expertise do salão,<br />perto de você.</span>
          </div>
          <span className="absolute right-5 top-7 rotate-90 text-[9px] tracking-[.25em] text-white/90 sm:right-8">ADLI LIMA · PARANAVAÍ</span>
        </div>
        <a href="#linha" aria-label="Rolar para conhecer a linha" className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 items-center gap-2 text-[9px] tracking-[.22em] text-[#887b70] lg:flex" data-testid="link-scroll-line">
          DESCUBRA <ArrowDown size={13} />
        </a>
      </section>

      <section id="linha" className="scroll-mt-8 bg-[#eae4d8] px-5 py-16 sm:px-8 sm:py-24 lg:px-14">
        <div className="mx-auto grid max-w-[1210px] gap-10 lg:grid-cols-[.72fr_1.28fr] lg:items-end">
          <div>
            <p className="text-[10px] font-semibold tracking-[.24em] text-[#8a7567]">CUIDADO PARA A SUA ROTINA</p>
            <h2 className="serif mt-5 max-w-[400px] text-4xl leading-[1.13] tracking-[-.035em] sm:text-5xl">Uma linha feita para cuidar de <em className="text-[#a66e68]">perto.</em></h2>
          </div>
          <div className="max-w-[560px] lg:pb-1">
            <p className="text-[15px] leading-[1.9] text-[#6e625b]">Adli Lima Cosméticos apresenta uma linha profissional de cuidados capilares, criada para aproximar a experiência e o cuidado do salão da vida em casa.</p>
            <a href={whatsappUrl} target="_blank" rel="noreferrer" className="mt-6 inline-flex items-center gap-2 border-b border-[#a66e68] pb-2 text-[11px] font-semibold tracking-[.12em] text-[#65574f] transition hover:text-[#a66e68]" data-testid="link-line-inquiry">CONVERSE SOBRE A LINHA <ArrowRight size={14} /></a>
          </div>
        </div>
        <div className="mx-auto mt-12 max-w-[1210px] border-t border-[#cfc5b7] pt-5 sm:mt-16">
          <div className="grid gap-7 sm:grid-cols-3 sm:gap-5">
            <div className="flex gap-4"><span className="serif text-[13px] italic text-[#a66e68]">01</span><p className="text-[12px] leading-6 text-[#665b54]">Cuidado capilar profissional</p></div>
            <div className="flex gap-4"><span className="serif text-[13px] italic text-[#a66e68]">02</span><p className="text-[12px] leading-6 text-[#665b54]">Uma experiência que cabe em casa</p></div>
            <div className="flex gap-4"><span className="serif text-[13px] italic text-[#a66e68]">03</span><p className="text-[12px] leading-6 text-[#665b54]">Atendimento direto e próximo</p></div>
          </div>
        </div>
      </section>

      <section id="historia" className="scroll-mt-8 px-5 py-16 sm:px-8 sm:py-24 lg:px-14">
        <div className="mx-auto grid max-w-[1210px] items-center gap-12 lg:grid-cols-[1.06fr_.94fr] lg:gap-24">
          <div className="relative mx-auto w-full max-w-[540px]">
            <div className="botanical-ring absolute -left-4 -top-4 h-24 w-24 sm:-left-8 sm:-top-8 sm:h-36 sm:w-36" />
            <img src="/brand-editorial.webp" alt="Detalhe editorial que representa cuidado, confiança e bem-estar" className="relative aspect-[4/4.25] w-full rounded-[2px] object-cover object-[70%_center]" data-testid="img-story-editorial" />
            <div className="absolute -bottom-5 -right-3 bg-[#e8c4b8] px-5 py-4 sm:-right-6 sm:px-7 sm:py-5"><span className="serif text-2xl italic text-[#55453f]">Desde 2020</span></div>
          </div>
          <div className="lg:py-4">
            <p className="text-[10px] font-semibold tracking-[.24em] text-[#8a7567]">QUEM SOMOS</p>
            <h2 className="serif mt-5 text-4xl leading-[1.13] tracking-[-.035em] sm:text-[52px]">De profissional<br />da beleza para <em className="text-[#a66e68]">você.</em></h2>
            <div className="mt-7 space-y-4 text-[14px] leading-[1.9] text-[#71665e] sm:text-[15px]">
              <p>Nascida em 2020 da paixão pela beleza e da experiência de uma profissional da área, a Adli Lima Cosméticos desenvolve produtos que unem tecnologia, qualidade, praticidade e resultados — aproximando a sensação de cuidado do salão à sua casa.</p>
              <p>Mais do que cosméticos, queremos transformar o cuidado com os cabelos em um momento de autoestima, confiança e bem-estar.</p>
            </div>
            <div className="mt-8 flex items-center gap-3 text-[11px] tracking-[.06em] text-[#71665e]"><span className="h-px w-9 bg-[#d78388]" /> Cuidado que acompanha você.</div>
          </div>
        </div>
      </section>

      <section id="pagamento" className="scroll-mt-8 bg-[#718065] px-5 py-14 text-[#f8f4eb] sm:px-8 sm:py-20 lg:px-14">
        <div className="mx-auto max-w-[1210px]">
          <div className="grid gap-8 border-b border-white/20 pb-9 sm:grid-cols-[.75fr_1.25fr] sm:items-end">
            <div><p className="text-[10px] font-semibold tracking-[.23em] text-[#e6d8c2]">PAGAMENTO</p><h2 className="serif mt-4 text-4xl leading-tight sm:text-5xl">Escolha como<br /><em>prefere pagar.</em></h2></div>
            <p className="max-w-[460px] text-[14px] leading-[1.8] text-[#e6e3d7] sm:justify-self-end">Converse com a gente pelo WhatsApp para conhecer a linha e combinar seu pedido.</p>
          </div>
          <div className="grid gap-px bg-white/20 sm:grid-cols-2">
            <div className="flex min-h-[156px] gap-5 bg-[#718065] px-1 py-7 sm:py-9">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-white/35"><Smartphone size={20} strokeWidth={1.4} /></span>
              <div><h3 className="serif text-2xl">Pix</h3><p className="mt-2 text-[13px] leading-6 text-[#e6e3d7]">Pagamento via Pix disponível.</p></div>
            </div>
            <div className="flex min-h-[156px] gap-5 bg-[#718065] px-1 py-7 sm:pl-8 sm:py-9">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-white/35"><CreditCard size={20} strokeWidth={1.4} /></span>
              <div><h3 className="serif text-2xl">Cartão de crédito</h3><p className="mt-2 text-[13px] leading-6 text-[#e6e3d7]">Em até 3 parcelas sem juros. Parcelamentos adicionais sujeitos a juros.</p></div>
            </div>
          </div>
          <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-[11px] text-[#e4dfd3]">Dúvidas? Nossa equipe está à disposição para conversar.</p>
            <a href={whatsappUrl} target="_blank" rel="noreferrer" className="inline-flex w-fit items-center gap-2 rounded-full bg-[#f8f4eb] px-6 py-3.5 text-[11px] font-semibold tracking-[.08em] text-[#53634a] transition hover:bg-[#f0e7da]" data-testid="link-payment-whatsapp"><MessageCircle size={15} /> FALE PELO WHATSAPP</a>
          </div>
        </div>
      </section>

      <section id="contato" className="scroll-mt-8 px-5 py-16 sm:px-8 sm:py-24 lg:px-14">
        <div className="mx-auto grid max-w-[1210px] gap-12 lg:grid-cols-[.9fr_1.1fr] lg:gap-24">
          <div>
            <p className="text-[10px] font-semibold tracking-[.24em] text-[#8a7567]">VAMOS CONVERSAR?</p>
            <h2 className="serif mt-5 max-w-[440px] text-4xl leading-[1.1] tracking-[-.035em] sm:text-[58px]">Seu próximo cuidado começa <em className="text-[#a66e68]">aqui.</em></h2>
            <p className="mt-6 max-w-[380px] text-[14px] leading-[1.85] text-[#746861]">Fale com a Adli Lima Cosméticos para saber mais sobre a linha profissional de cuidados capilares.</p>
            <a href={whatsappUrl} target="_blank" rel="noreferrer" className="mt-7 inline-flex items-center gap-3 rounded-full bg-[#d9868b] px-6 py-4 text-[11px] font-semibold tracking-[.1em] text-[#423633] transition hover:bg-[#d4777e]" data-testid="link-contact-whatsapp"><MessageCircle size={17} /> INICIAR CONVERSA <ArrowRight size={14} /></a>
          </div>
          <div className="border-t border-[#ded4c7]">
            <a href={whatsappUrl} target="_blank" rel="noreferrer" className="contact-link flex items-center justify-between gap-4 border-b border-[#ded4c7] py-5" data-testid="link-contact-phone"><span className="flex items-center gap-4"><MessageCircle size={17} className="text-[#9e7669]" /><span><span className="block text-[9px] tracking-[.18em] text-[#91857a]">WHATSAPP</span><span className="mt-1 block text-[14px]">(44) 99730-3797</span></span></span><ArrowRight size={15} /></a>
            <a href={emailUrl} className="contact-link flex items-center justify-between gap-4 border-b border-[#ded4c7] py-5" data-testid="link-contact-email"><span className="flex items-center gap-4"><Mail size={17} className="text-[#9e7669]" /><span><span className="block text-[9px] tracking-[.18em] text-[#91857a]">E-MAIL</span><span className="mt-1 block break-all text-[14px]">adlilimalinhacosmeticos@gmail.com</span></span></span><ArrowRight size={15} /></a>
            <a href={instagramUrl} target="_blank" rel="noreferrer" className="contact-link flex items-center justify-between gap-4 border-b border-[#ded4c7] py-5" data-testid="link-contact-instagram"><span className="flex items-center gap-4"><Instagram size={17} className="text-[#9e7669]" /><span><span className="block text-[9px] tracking-[.18em] text-[#91857a]">INSTAGRAM</span><span className="mt-1 block text-[14px]">@adlilimacosmeticos</span></span></span><ArrowRight size={15} /></a>
            <div className="flex items-center gap-4 border-b border-[#ded4c7] py-5" data-testid="text-business-address"><MapPin size={17} className="shrink-0 text-[#9e7669]" /><span><span className="block text-[9px] tracking-[.18em] text-[#91857a]">ENDEREÇO</span><span className="mt-1 block text-[14px] leading-6">Rua Antônio José da Silva, 620<br />Paranavaí–PR · CEP 87711-310</span></span></div>
            <p className="pt-5 text-[10px] tracking-[.08em] text-[#94877b]" data-testid="text-business-cnpj">CNPJ 61.681.521/0001-46</p>
          </div>
        </div>
      </section>

      <footer className="bg-[#383b32] px-5 py-8 text-[#f5eee3] sm:px-8 lg:px-14">
        <div className="mx-auto flex max-w-[1210px] flex-col items-center justify-between gap-6 sm:flex-row">
          <a href="#inicio" aria-label="Voltar ao início" data-testid="link-footer-home"><img src="/adli-logo.png" alt="Adli Lima Cosméticos" className="h-12 w-auto brightness-0 invert opacity-90" data-testid="img-footer-logo" /></a>
          <p className="text-center text-[10px] leading-5 tracking-[.05em] text-[#d5cfc4]">Cuidado profissional, com o acolhimento de casa.<br />Paranavaí, Paraná · Desde 2020</p>
          <a href={instagramUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-[11px] tracking-[.08em] text-[#e5b2ae] transition hover:text-white" data-testid="link-footer-instagram"><Instagram size={16} /> @adlilimacosmeticos</a>
        </div>
      </footer>
    </main>
  );
}

export default Home;
