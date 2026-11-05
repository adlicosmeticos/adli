import { useState } from 'react';
import {
  ArrowRight,
  Check,
  CreditCard,
  Instagram,
  Mail,
  MapPin,
  Menu,
  MessageCircle,
  Smartphone,
  Sparkles,
  X,
} from 'lucide-react';
import './ReferenceStorefront.css';

const whatsappUrl =
  'https://wa.me/5544997303797?text=Ol%C3%A1%2C%20gostaria%20de%20conhecer%20a%20linha%20profissional%20Adli%20Lima.';
const instagramUrl = 'https://www.instagram.com/adlilimacosmeticos/';
const emailUrl = 'mailto:adlilimalinhacosmeticos@gmail.com';

const values = [
  {
    number: '01',
    title: 'Tecnologia',
    copy: 'Tecnologia a favor de uma rotina de cuidado capilar mais prática.',
    icon: Sparkles,
  },
  {
    number: '02',
    title: 'Qualidade',
    copy: 'Uma linha profissional pensada por quem vive o universo da beleza.',
    icon: Check,
  },
  {
    number: '03',
    title: 'Resultados',
    copy: 'Cuidado de salão que acompanha você também em casa.',
    icon: ArrowRight,
  },
];

export function ReferenceStorefront() {
  const [menuOpen, setMenuOpen] = useState(false);
  const closeMenu = () => setMenuOpen(false);

  return (
    <main className="adli-storefront" id="inicio">
      <div className="adli-announcement">
        <span>ADLI LIMA COSMÉTICOS</span>
        <span className="adli-announcement-separator" aria-hidden="true">✳</span>
        <span>CUIDADO PROFISSIONAL PARA A SUA ROTINA</span>
      </div>

      <header className="adli-header">
        <div className="adli-header-inner">
          <a
            href="#inicio"
            aria-label="Adli Lima Cosméticos — voltar ao início"
            className="adli-logo-link"
            data-testid="link-logo-home"
          >
            <img
              src="/__mockup/images/adli-logo-user.png"
              alt="Logotipo Adli Lima Cosméticos"
              className="adli-logo"
              data-testid="img-brand-logo"
            />
          </a>

          <nav className="adli-desktop-nav" aria-label="Navegação principal">
            <a href="#linha" data-testid="link-nav-linha">A linha</a>
            <a href="#historia" data-testid="link-nav-historia">Nossa história</a>
            <a href="#pagamento" data-testid="link-nav-pagamento">Pagamento</a>
            <a href="#contato" data-testid="link-nav-contato">Contato</a>
          </nav>

          <a
            className="adli-header-cta"
            href={whatsappUrl}
            target="_blank"
            rel="noreferrer"
            data-testid="link-header-whatsapp"
          >
            <MessageCircle size={16} strokeWidth={1.8} />
            <span>Fale conosco</span>
          </a>

          <button
            className="adli-menu-button"
            type="button"
            aria-label={menuOpen ? 'Fechar menu' : 'Abrir menu'}
            aria-expanded={menuOpen}
            aria-controls="adli-mobile-nav"
            onClick={() => setMenuOpen((open) => !open)}
            data-testid="button-mobile-menu"
          >
            {menuOpen ? <X size={21} /> : <Menu size={21} />}
          </button>
        </div>
        {menuOpen && (
          <nav className="adli-mobile-nav" id="adli-mobile-nav" aria-label="Navegação móvel">
            <a href="#linha" onClick={closeMenu} data-testid="link-mobile-linha">A linha</a>
            <a href="#historia" onClick={closeMenu} data-testid="link-mobile-historia">Nossa história</a>
            <a href="#pagamento" onClick={closeMenu} data-testid="link-mobile-pagamento">Pagamento</a>
            <a href="#contato" onClick={closeMenu} data-testid="link-mobile-contato">Contato</a>
            <a href={whatsappUrl} target="_blank" rel="noreferrer" onClick={closeMenu} data-testid="link-mobile-whatsapp">
              <MessageCircle size={16} /> Conversar pelo WhatsApp
            </a>
          </nav>
        )}
      </header>

      <section className="adli-hero" aria-labelledby="adli-hero-title">
        <div className="adli-hero-copy">
          <p className="adli-eyebrow"><span /> Beleza que começa no cuidado</p>
          <h1 id="adli-hero-title">Seu cabelo.<br /><em>Seu momento.</em></h1>
          <p className="adli-hero-description">
            Cuidado capilar profissional para fazer parte da sua rotina — com a
            experiência do salão e o acolhimento de casa.
          </p>
          <div className="adli-hero-actions">
            <a className="adli-button adli-button-burgundy" href="#linha" data-testid="link-hero-explore">
              Conheça a linha <ArrowRight size={16} />
            </a>
            <a className="adli-text-link" href="#historia" data-testid="link-hero-story">Nossa história</a>
          </div>
          <div className="adli-founded-note">
            <span className="adli-founded-year">2020</span>
            <span className="adli-founded-rule" />
            <span>Fundada por uma profissional da beleza</span>
          </div>
        </div>
        <div className="adli-hero-visual">
          <img
            src="/__mockup/images/brand-editorial.webp"
            alt="Mulher de cabelos cacheados em um momento de cuidado e bem-estar"
            data-testid="img-hero-editorial"
          />
          <div className="adli-hero-caption">
            <span className="adli-caption-icon"><Check size={16} /></span>
            <span>A experiência do salão,<br />perto de você.</span>
          </div>
          <span className="adli-hero-vertical">ADLI LIMA · PARANAVAÍ</span>
        </div>
      </section>

      <section className="adli-confidence" aria-label="O cuidado Adli Lima">
        <p><span className="adli-confidence-mark"><Check size={15} /></span> Cuidado capilar profissional</p>
        <span className="adli-confidence-divider" aria-hidden="true" />
        <p><span className="adli-confidence-mark"><Sparkles size={15} /></span> Tecnologia e qualidade</p>
        <span className="adli-confidence-divider" aria-hidden="true" />
        <p><span className="adli-confidence-mark"><MessageCircle size={15} /></span> Atendimento próximo</p>
      </section>

      <section className="adli-discovery" id="linha" aria-labelledby="adli-discovery-title">
        <div className="adli-section-heading">
          <p className="adli-eyebrow adli-centered-eyebrow">Cuidado que acompanha você</p>
          <h2 id="adli-discovery-title">Uma rotina com <em>mais cuidado.</em></h2>
          <p>Conheça os princípios que guiam a linha profissional Adli Lima.</p>
        </div>
        <div className="adli-discovery-row">
          <a className="adli-discovery-item" href="#destaques" data-testid="link-discovery-profissional">
            <span className="adli-discovery-disc disc-rose"><span className="disc-number">01</span><span>Salão</span></span>
            <span>Cuidado profissional</span>
          </a>
          <a className="adli-discovery-item" href="#destaques" data-testid="link-discovery-tecnologia">
            <span className="adli-discovery-disc disc-cream"><Sparkles size={24} strokeWidth={1.3} /></span>
            <span>Tecnologia</span>
          </a>
          <a className="adli-discovery-item" href="#destaques" data-testid="link-discovery-qualidade">
            <span className="adli-discovery-disc disc-blush"><span className="disc-monogram">A</span></span>
            <span>Qualidade</span>
          </a>
          <a className="adli-discovery-item" href="#destaques" data-testid="link-discovery-praticidade">
            <span className="adli-discovery-disc disc-lilac"><span className="disc-number">04</span><span>Casa</span></span>
            <span>Praticidade</span>
          </a>
          <a className="adli-discovery-item" href="#destaques" data-testid="link-discovery-resultados">
            <span className="adli-discovery-disc disc-sand"><Check size={25} strokeWidth={1.3} /></span>
            <span>Resultados</span>
          </a>
        </div>
      </section>

      <section className="adli-feature-pair" id="historia" aria-label="Nossa história e formas de pagamento">
        <div className="adli-story-panel">
          <p className="adli-eyebrow">Nossa história · desde 2020</p>
          <h2>Da paixão pela beleza,<br /><em>para o seu cuidado.</em></h2>
          <p>
            Criada por uma profissional da beleza, a Adli Lima nasceu para levar
            o cuidado do salão para casa. Tecnologia, qualidade e praticidade
            caminham juntas em uma experiência que valoriza confiança e bem-estar.
          </p>
          <a href="#contato" className="adli-panel-link" data-testid="link-story-contact">
            Conheça a Adli Lima <ArrowRight size={15} />
          </a>
          <span className="adli-story-seal" aria-hidden="true">ADLI<br />LIMA<br /><i>2020</i></span>
        </div>
        <div className="adli-payment-panel" id="pagamento">
          <div className="adli-payment-heading">
            <p className="adli-eyebrow">Pagamento</p>
            <h2>Do seu jeito,<br /><em>com tranquilidade.</em></h2>
          </div>
          <div className="adli-payment-options">
            <div className="adli-payment-option">
              <span className="adli-payment-icon"><Smartphone size={21} strokeWidth={1.5} /></span>
              <div><h3>Pix</h3><p>Pagamento via Pix disponível.</p></div>
            </div>
            <div className="adli-payment-option">
              <span className="adli-payment-icon"><CreditCard size={21} strokeWidth={1.5} /></span>
              <div><h3>Cartão</h3><p>Até 3 parcelas sem juros. Parcelamentos adicionais com juros.</p></div>
            </div>
          </div>
          <a className="adli-payment-link" href={whatsappUrl} target="_blank" rel="noreferrer" data-testid="link-payment-whatsapp">
            Tire suas dúvidas pelo WhatsApp <ArrowRight size={15} />
          </a>
        </div>
      </section>

      <section className="adli-line-showcase" id="destaques" aria-labelledby="adli-line-title">
        <div className="adli-showcase-top">
          <div>
            <p className="adli-eyebrow">Conheça a proposta Adli Lima</p>
            <h2 id="adli-line-title">Cuidado profissional<br /><em>em cada escolha.</em></h2>
          </div>
          <p className="adli-showcase-intro">
            Uma linha profissional de cuidados capilares, criada para aproximar
            a experiência do salão da vida em casa.
          </p>
        </div>
        <div className="adli-value-cards">
          {values.map(({ number, title, copy, icon: Icon }) => (
            <article className="adli-value-card" key={title}>
              <div className="adli-value-card-top">
                <span>{number}</span>
                <span className="adli-value-icon"><Icon size={19} strokeWidth={1.5} /></span>
              </div>
              <div className="adli-value-orbit" aria-hidden="true"><i /><i /><i /></div>
              <h3>{title}</h3>
              <p>{copy}</p>
              <a href={whatsappUrl} target="_blank" rel="noreferrer" data-testid={`link-inquiry-${number}`}>
                Converse sobre a linha <ArrowRight size={14} />
              </a>
            </article>
          ))}
        </div>
      </section>

      <section className="adli-service-strip" aria-label="Informações sobre pagamento e atendimento">
        <div className="adli-service-item"><Smartphone size={19} /><span><strong>Pix</strong><small>Disponível para pagamento</small></span></div>
        <span className="adli-service-rule" aria-hidden="true" />
        <div className="adli-service-item"><CreditCard size={19} /><span><strong>Cartão de crédito</strong><small>Até 3x sem juros</small></span></div>
        <span className="adli-service-rule" aria-hidden="true" />
        <a className="adli-service-item adli-service-contact" href={whatsappUrl} target="_blank" rel="noreferrer" data-testid="link-service-whatsapp">
          <MessageCircle size={19} /><span><strong>Atendimento direto</strong><small>Converse com a Adli Lima</small></span><ArrowRight className="adli-service-arrow" size={15} />
        </a>
      </section>

      <footer className="adli-footer" id="contato">
        <div className="adli-footer-main">
          <div className="adli-footer-brand">
            <a href="#inicio" aria-label="Voltar ao início" data-testid="link-footer-home">
              <img src="/__mockup/images/adli-logo-user.png" alt="Logotipo Adli Lima Cosméticos" data-testid="img-footer-logo" />
            </a>
            <p>Cuidado profissional,<br />com o acolhimento de casa.</p>
            <a className="adli-footer-social" href={instagramUrl} target="_blank" rel="noreferrer" data-testid="link-footer-instagram">
              <Instagram size={16} /> @adlilimacosmeticos
            </a>
          </div>

          <div className="adli-footer-links">
            <h2>Navegue</h2>
            <a href="#inicio" data-testid="link-footer-inicio">Início</a>
            <a href="#linha" data-testid="link-footer-linha">A linha</a>
            <a href="#historia" data-testid="link-footer-historia">Nossa história</a>
            <a href="#pagamento" data-testid="link-footer-pagamento">Pagamento</a>
          </div>

          <div className="adli-footer-contact">
            <h2>Fale com a gente</h2>
            <a href={whatsappUrl} target="_blank" rel="noreferrer" data-testid="link-footer-whatsapp">
              <MessageCircle size={15} /><span>(44) 99730-3797</span>
            </a>
            <a href={emailUrl} data-testid="link-footer-email">
              <Mail size={15} /><span>adlilimalinhacosmeticos@gmail.com</span>
            </a>
            <p className="adli-footer-address" data-testid="text-business-address">
              <MapPin size={15} />
              <span>Rua Antônio José da Silva, 620<br />Paranavaí–PR · CEP 87711-310</span>
            </p>
          </div>
        </div>
        <div className="adli-footer-bottom">
          <span data-testid="text-business-cnpj">CNPJ 61.681.521/0001-46</span>
          <span>Adli Lima Cosméticos · Paranavaí, Paraná · Desde 2020</span>
        </div>
      </footer>
    </main>
  );
}
