-- ============================================================
-- PASSFY — Esquema de Base de Datos para Supabase
-- Ejecutar en: Supabase Dashboard → SQL Editor
-- ============================================================

-- ===================== EXTENSIONES ========================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ===================== TABLAS =============================

-- Tabla: users (perfil extendido sobre auth.users)
CREATE TABLE IF NOT EXISTS public.users (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nombre        TEXT NOT NULL DEFAULT '',
  email         TEXT UNIQUE NOT NULL,
  avatar_url    TEXT,
  affiliate_id  UUID,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla: passes
CREATE TABLE IF NOT EXISTS public.passes (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre        TEXT NOT NULL,
  slug          TEXT UNIQUE NOT NULL,
  nicho         TEXT NOT NULL CHECK (nicho IN ('cines','comida','cafe','fitness','restaurantes')),
  precio        NUMERIC(10,2) NOT NULL DEFAULT 199.00,
  descripcion   TEXT,
  color_brand   TEXT DEFAULT '#FF535B',
  color_brand_end TEXT DEFAULT '#FFB3B1',
  activo        BOOLEAN DEFAULT TRUE,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla: benefits
CREATE TABLE IF NOT EXISTS public.benefits (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pass_id       UUID NOT NULL REFERENCES public.passes(id) ON DELETE CASCADE,
  descripcion   TEXT NOT NULL,
  usos_totales  INTEGER NOT NULL DEFAULT 1,
  tipo          TEXT NOT NULL DEFAULT 'descuento',
  icono         TEXT DEFAULT '🎁',
  activo        BOOLEAN DEFAULT TRUE
);

-- Tabla: merchants
CREATE TABLE IF NOT EXISTS public.merchants (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre          TEXT NOT NULL,
  nicho           TEXT NOT NULL,
  logo_url        TEXT,
  ciudad          TEXT DEFAULT 'México',
  activo          BOOLEAN DEFAULT TRUE,
  contacto_email  TEXT,
  pin             TEXT DEFAULT '1234',
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla: affiliates
CREATE TABLE IF NOT EXISTS public.affiliates (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id           UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  codigo_afiliado   TEXT UNIQUE NOT NULL,
  comision_pct      NUMERIC(5,2) DEFAULT 15.00,
  activo            BOOLEAN DEFAULT TRUE,
  total_ganado      NUMERIC(10,2) DEFAULT 0.00,
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla: user_passes
CREATE TABLE IF NOT EXISTS public.user_passes (
  id                      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id                 UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  pass_id                 UUID NOT NULL REFERENCES public.passes(id),
  codigo_unico            TEXT UNIQUE NOT NULL,
  qr_url                  TEXT,
  fecha_compra            TIMESTAMPTZ DEFAULT NOW(),
  fecha_expiry            TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '1 year'),
  activo                  BOOLEAN DEFAULT TRUE,
  mercadopago_payment_id  TEXT
);

-- Tabla: benefit_uses
CREATE TABLE IF NOT EXISTS public.benefit_uses (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_pass_id    UUID NOT NULL REFERENCES public.user_passes(id) ON DELETE CASCADE,
  benefit_id      UUID NOT NULL REFERENCES public.benefits(id),
  usos_restantes  INTEGER NOT NULL DEFAULT 0,
  fecha_uso       TIMESTAMPTZ,
  comercio_id     UUID REFERENCES public.merchants(id),
  validado_por    TEXT
);

-- Tabla: affiliate_sales
CREATE TABLE IF NOT EXISTS public.affiliate_sales (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  affiliate_id    UUID NOT NULL REFERENCES public.affiliates(id) ON DELETE CASCADE,
  user_pass_id    UUID NOT NULL REFERENCES public.user_passes(id),
  monto           NUMERIC(10,2) NOT NULL,
  comision        NUMERIC(10,2) NOT NULL,
  pagado          BOOLEAN DEFAULT FALSE,
  fecha           TIMESTAMPTZ DEFAULT NOW()
);

-- ===================== ÍNDICES ============================
CREATE INDEX IF NOT EXISTS idx_user_passes_user ON public.user_passes(user_id);
CREATE INDEX IF NOT EXISTS idx_user_passes_pass ON public.user_passes(pass_id);
CREATE INDEX IF NOT EXISTS idx_benefit_uses_user_pass ON public.benefit_uses(user_pass_id);
CREATE INDEX IF NOT EXISTS idx_benefits_pass ON public.benefits(pass_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_sales_affiliate ON public.affiliate_sales(affiliate_id);
CREATE INDEX IF NOT EXISTS idx_affiliates_user ON public.affiliates(user_id);

-- ===================== TRIGGER: auto-crear perfil user ====
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, nombre, email, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.email,
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ===================== ROW LEVEL SECURITY ================

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.passes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.benefits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_passes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.benefit_uses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.affiliates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.affiliate_sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.merchants ENABLE ROW LEVEL SECURITY;

-- Políticas: users
CREATE POLICY "users_self_read" ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "users_self_update" ON public.users FOR UPDATE USING (auth.uid() = id);

-- Políticas: passes (lectura pública para todos)
CREATE POLICY "passes_public_read" ON public.passes FOR SELECT USING (activo = TRUE);

-- Políticas: benefits (lectura pública)
CREATE POLICY "benefits_public_read" ON public.benefits FOR SELECT USING (activo = TRUE);

-- Políticas: merchants (lectura pública)
CREATE POLICY "merchants_public_read" ON public.merchants FOR SELECT USING (activo = TRUE);

-- Políticas: user_passes (solo el dueño)
CREATE POLICY "user_passes_owner_read" ON public.user_passes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "user_passes_owner_insert" ON public.user_passes FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Políticas: benefit_uses (solo el dueño del user_pass)
CREATE POLICY "benefit_uses_owner_read" ON public.benefit_uses
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_passes
      WHERE id = user_pass_id AND user_id = auth.uid()
    )
  );

-- Políticas: affiliates (solo el dueño)
CREATE POLICY "affiliates_owner_read" ON public.affiliates FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "affiliates_owner_update" ON public.affiliates FOR UPDATE USING (auth.uid() = user_id);

-- Políticas: affiliate_sales (solo el afiliado)
CREATE POLICY "affiliate_sales_owner_read" ON public.affiliate_sales
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.affiliates
      WHERE id = affiliate_id AND user_id = auth.uid()
    )
  );

-- ===================== DATOS SEED ========================

-- Passes
INSERT INTO public.passes (nombre, slug, nicho, precio, descripcion, color_brand, color_brand_end) VALUES
  ('CinePass',       'cinepass',       'cines',       199.00, 'Accede a funciones exclusivas en Cinépolis con descuentos y entradas 2x1. El mejor plan para los amantes del cine.',           '#E63946', '#FF8FA3'),
  ('BurgerPass',     'burgerpass',     'comida',      199.00, 'Hamburguesas, pizzas y comida rápida a precio de amigo. Válido en McDonald''s, Domino''s y Burger King.',                     '#F4A261', '#E76F51'),
  ('CoffeePass',     'coffeepass',     'cafe',        199.00, 'Tu café de especialidad favorito con descuentos en cafeterías premium. Ideal para empezar el día con el pie derecho.',          '#264653', '#2A9D8F'),
  ('GymPass',        'gympass',        'fitness',     199.00, 'Acceso a gimnasios, clases de yoga y pilates. Cuida tu cuerpo con los mejores centros fitness de la ciudad.',                   '#8338EC', '#3A86FF'),
  ('RestaurantPass', 'restaurantpass', 'restaurantes',199.00, 'Cena en los mejores restaurantes con descuentos especiales. Válido en Chili''s, Applebee''s y más cadenas premium.',          '#2A9D8F', '#E9C46A')
ON CONFLICT (slug) DO NOTHING;

-- Benefits: CinePass
INSERT INTO public.benefits (pass_id, descripcion, usos_totales, tipo, icono) VALUES
  ((SELECT id FROM public.passes WHERE slug='cinepass'), '2x1 en boletos cualquier función de lunes a jueves', 4, 'descuento', '🎬'),
  ((SELECT id FROM public.passes WHERE slug='cinepass'), '50% de descuento en combo de palomitas grande + refresco', 4, 'descuento', '🍿'),
  ((SELECT id FROM public.passes WHERE slug='cinepass'), 'Boleto gratis en estreno de temporada (1 vez al mes)', 1, 'gratis', '⭐'),
  ((SELECT id FROM public.passes WHERE slug='cinepass'), '30% de descuento en CinePlatino y salas MACRO XE', 4, 'descuento', '💎')
ON CONFLICT DO NOTHING;

-- Benefits: BurgerPass
INSERT INTO public.benefits (pass_id, descripcion, usos_totales, tipo, icono) VALUES
  ((SELECT id FROM public.passes WHERE slug='burgerpass'), 'Hamburguesa doble con queso GRATIS en McDonald''s', 2, 'gratis', '🍔'),
  ((SELECT id FROM public.passes WHERE slug='burgerpass'), 'Pizza mediana 40% de descuento en Domino''s', 4, 'descuento', '🍕'),
  ((SELECT id FROM public.passes WHERE slug='burgerpass'), 'Burger combo con 2x1 en Burger King', 4, 'descuento', '👑'),
  ((SELECT id FROM public.passes WHERE slug='burgerpass'), 'Entrega gratis sin mínimo en Domino''s app', 8, 'beneficio', '🛵')
ON CONFLICT DO NOTHING;

-- Benefits: CoffeePass
INSERT INTO public.benefits (pass_id, descripcion, usos_totales, tipo, icono) VALUES
  ((SELECT id FROM public.passes WHERE slug='coffeepass'), 'Café americano o latte GRATIS (tamaño grande)', 8, 'gratis', '☕'),
  ((SELECT id FROM public.passes WHERE slug='coffeepass'), '2x1 en bebidas frías de temporada', 4, 'descuento', '🧋'),
  ((SELECT id FROM public.passes WHERE slug='coffeepass'), '40% de descuento en pastelería y snacks', 8, 'descuento', '🥐'),
  ((SELECT id FROM public.passes WHERE slug='coffeepass'), 'Tarjeta de lealtad acelerada: 2x puntos por visita', 999, 'beneficio', '⚡')
ON CONFLICT DO NOTHING;

-- Benefits: GymPass
INSERT INTO public.benefits (pass_id, descripcion, usos_totales, tipo, icono) VALUES
  ((SELECT id FROM public.passes WHERE slug='gympass'), '10 accesos a cualquier gimnasio afiliado', 10, 'acceso', '💪'),
  ((SELECT id FROM public.passes WHERE slug='gympass'), '4 clases de yoga o pilates incluidas', 4, 'clase', '🧘'),
  ((SELECT id FROM public.passes WHERE slug='gympass'), 'Evaluación física y rutina personalizada GRATIS', 1, 'gratis', '📋'),
  ((SELECT id FROM public.passes WHERE slug='gympass'), '30% en suplementos en tienda oficial del gimnasio', 4, 'descuento', '🥤')
ON CONFLICT DO NOTHING;

-- Benefits: RestaurantPass
INSERT INTO public.benefits (pass_id, descripcion, usos_totales, tipo, icono) VALUES
  ((SELECT id FROM public.passes WHERE slug='restaurantpass'), '30% de descuento en tu cuenta total en Chili''s', 4, 'descuento', '🌶️'),
  ((SELECT id FROM public.passes WHERE slug='restaurantpass'), '2x1 en entradas y appetizers en Applebee''s', 4, 'descuento', '🍖'),
  ((SELECT id FROM public.passes WHERE slug='restaurantpass'), 'Postre gratis al pedir plato principal', 4, 'gratis', '🍰'),
  ((SELECT id FROM public.passes WHERE slug='restaurantpass'), 'Reservación prioritaria sin tiempo de espera', 8, 'beneficio', '🪑')
ON CONFLICT DO NOTHING;

-- Merchants de prueba
INSERT INTO public.merchants (nombre, nicho, ciudad, pin) VALUES
  ('Cinépolis Perisur',    'cines',        'Ciudad de México', '1234'),
  ('McDonald''s Reforma',  'comida',        'Ciudad de México', '5678'),
  ('Domino''s Polanco',    'comida',        'Ciudad de México', '9012'),
  ('Burger King Satélite', 'comida',        'Estado de México', '3456'),
  ('Café Buna Roma',       'cafe',          'Ciudad de México', '7890'),
  ('Smart Fit Interlomas', 'fitness',       'Estado de México', '2345'),
  ('Chili''s Santa Fe',   'restaurantes',  'Ciudad de México', '6789'),
  ('Applebee''s Coyoacán','restaurantes',  'Ciudad de México', '0123')
ON CONFLICT DO NOTHING;
