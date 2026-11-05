-- ============================================================
-- Adli Lima Cosméticos — Setup do Supabase
-- Execute este SQL no SQL Editor do Supabase Dashboard:
-- https://supabase.com/dashboard/project/fqxrhhwubktmlhtcway/sql
-- ============================================================

-- 1. Criar tabela de produtos
CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  price_cents INTEGER NOT NULL,
  image_url TEXT NOT NULL DEFAULT '',
  category TEXT NOT NULL DEFAULT 'Cuidados capilares',
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Criar tabela de configurações
CREATE TABLE IF NOT EXISTS store_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Desabilitar RLS por enquanto (habilitar depois pra produção)
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_settings ENABLE ROW LEVEL SECURITY;

-- 4. Políticas permissivas (permitir tudo via publishable key)
CREATE POLICY "Permitir leitura pública de produtos"
  ON products FOR SELECT
  USING (true);

CREATE POLICY "Permitir insert de produtos"
  ON products FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Permitir update de produtos"
  ON products FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Permitir delete de produtos"
  ON products FOR DELETE
  USING (true);

CREATE POLICY "Permitir tudo em store_settings"
  ON store_settings FOR ALL
  USING (true)
  WITH CHECK (true);

-- 5. Seed dos 10 produtos iniciais
INSERT INTO products (slug, name, description, price_cents, image_url, category, is_active, is_featured, sort_order) VALUES
(
  'mascara-teia',
  'Máscara Teia',
  'Máscara capilar que fortalece as áreas sensibilizadas dos fios, restaurando a resistência e a maleabilidade. Hidrata intensamente para deixar o cabelo macio, brilhante e restaurado.',
  8000,
  '/products/mascara-teia.webp',
  'Máscaras',
  true, true, 1
),
(
  'kit-linha-a',
  'Kit Shampoo e Condicionador Linha A',
  'Indicado para uso diário, o kit ajuda a restaurar a saúde dos fios e repor substâncias perdidas em tratamentos químicos. Com vitamina A, oferece hidratação para cabelos cacheados e quimicamente tratados.',
  6000,
  '/products/kit-linha-a.webp',
  'Kits',
  true, true, 2
),
(
  'bb-cream-10-em-1',
  'BB Cream Multifuncional 10 em 1',
  'Finalizador que hidrata, repara, protege e adiciona brilho. Ajuda a controlar o frizz e deixa os fios macios e protegidos. Indicado para cabelos cacheados e quimicamente tratados.',
  7990,
  '/products/bb-cream-10-em-1.webp',
  'Finalizadores',
  true, true, 3
),
(
  'reparador-pontas-argan',
  'Finalizador Reparador de Pontas — Argan Oil',
  'Finalizador com óleo de argan puro, indicado para todos os tipos de cabelo. Ajuda a reparar pontas danificadas e potencializa a hidratação dos fios.',
  5990,
  '/products/reparador-pontas-argan.webp',
  'Finalizadores',
  true, true, 4
),
(
  'linha-cresce-forte',
  'Linha Cresce Forte',
  'Linha com foco no couro cabeludo, indicada para cabelos oleosos. O shampoo ajuda a controlar a oleosidade; a máscara condicionadora pode ser aplicada da raiz ao comprimento e ajuda a restaurar a saúde dos fios. Sua tecnologia estimula o crescimento.',
  5990,
  '/products/cresce-forte.webp',
  'Kits',
  true, true, 5
),
(
  'perfume-capilar',
  'Perfume Capilar',
  'Perfume capilar para todos os tipos de cabelo. Ajuda a deixar os fios cheirosos, sem frizz e com brilho. Fórmula com perfume e óleo.',
  5000,
  '/products/perfume-capilar.webp',
  'Finalizadores',
  true, false, 6
),
(
  'nocaute-hair',
  'Nocaute Hair',
  'Protetor térmico que facilita escovas e ajuda a desembaraçar. Protege os fios contra sol, poluição e calor do secador e da prancha. Com ativos voltados à elasticidade, hidratação e reparo capilar.',
  7990,
  '/products/nocaute-hair.webp',
  'Finalizadores',
  true, false, 7
),
(
  'booster-magic-cream',
  'Booster Magic Cream',
  'Máscara líquida de nutrição profunda, restauração instantânea e reposição lipídica. Sua tecnologia microcristalina age de maneira rápida e eficaz. Indicada para todos os tipos de cabelo.',
  6990,
  '/products/booster-magic-cream.webp',
  'Tratamentos',
  true, false, 8
),
(
  'mascara-black-matize',
  'Máscara Black Matize',
  'Máscara matizadora e acidificante para cabelos loiros e grisalhos. Neutraliza tons amarelados, ajudando a deixar o loiro ou grisalho platinado.',
  5000,
  '/products/black-matize.webp',
  'Máscaras',
  true, false, 9
),
(
  'pinkizinha-1-minuto',
  'Pinkizinha 1 Minuto',
  'Ampola de hidratação e reparação. Misture a mesma quantidade de água fria para formar uma máscara rica em ativos hidratantes, com ação de 1 minuto. Indicada para todos os tipos de cabelo.',
  2000,
  '/products/pinkizinha-1-minuto.webp',
  'Tratamentos',
  true, false, 10
)
ON CONFLICT (slug) DO NOTHING;

-- 6. Marcar seed como executado
INSERT INTO store_settings (key, value)
VALUES ('initial_catalog_v1', 'seeded')
ON CONFLICT (key) DO NOTHING;
