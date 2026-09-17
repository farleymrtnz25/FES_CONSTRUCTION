USE test;

-- ========================================================
-- 1. TABLA: USUARIOS Y SUS DATOS
-- ========================================================
CREATE TABLE IF NOT EXISTS `usuarios` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `nombre` VARCHAR(100) NOT NULL,
  `email` VARCHAR(150) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `rol` ENUM('cliente','admin') DEFAULT 'cliente',
  `creado_en` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO `usuarios` (`id`, `nombre`, `email`, `password`, `rol`, `creado_en`) VALUES
(1, 'Administrador FES', 'admin@fes.com', '$2b$12$EFV2VK6wYJ0c11m4fDLfweM/rCWSg8cnQXcv9WVNAeV509r9rdsga', 'admin', '2026-09-15 21:31:49')
ON DUPLICATE KEY UPDATE `nombre`=VALUES(`nombre`), `rol`=VALUES(`rol`);

-- ========================================================
-- 2. TABLA: PRODUCTOS (23 PRODUCTOS CON CATEGORÍAS Y AGREGADOS)
-- ========================================================
CREATE TABLE IF NOT EXISTS `productos` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `nombre` VARCHAR(150) NOT NULL,
  `precio` DECIMAL(12,2) NOT NULL,
  `medidas` VARCHAR(50) DEFAULT NULL,
  `descripcion` TEXT DEFAULT NULL,
  `stock` INT DEFAULT 0,
  `imagen` TEXT DEFAULT NULL,
  `categoria` VARCHAR(50) DEFAULT 'General',
  `creado_en` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

REPLACE INTO `productos` (`id`, `nombre`, `precio`, `medidas`, `descripcion`, `stock`, `imagen`, `categoria`, `creado_en`) VALUES
(1, 'Ladrillo pequeño negro', 300.00, '18*9*6', 'Ladrillo artesanal de alta calidad fabricado con arcilla seleccionada.', 900, 'https://placehold.co/400x300/2d1b69/ffffff?text=Ladrillo+Negro', 'Ladrillos', '2026-09-15 21:31:49'),
(2, 'Ladrillo pequeño rosado', 260.00, '18*9*6', 'Ladrillo artesanal rosado excelente toque tradicional.', 1200, 'https://placehold.co/400x300/f87171/ffffff?text=Ladrillo+Rosado', 'Ladrillos', '2026-09-15 21:31:49'),
(3, 'Ladrillo grande negro', 450.00, '22*12*7', 'Ladrillo grande negro superior resistencia estructural.', 800, 'https://placehold.co/400x300/1f2937/ffffff?text=Ladrillo+Grande+Negro', 'Ladrillos', '2026-09-15 21:31:49'),
(4, 'Ladrillo grande rosado', 400.00, '22*12*7', 'Ladrillo grande rosado artesanal excelente calidad.', 900, 'https://placehold.co/400x300/fda4af/ffffff?text=Ladrillo+Grande+Rosado', 'Ladrillos', '2026-09-15 21:31:49'),
(5, 'Bloque número 4', 1050.00, 'Estándar', 'Bloque de alta resistencia para muros estructurales.', 500, 'https://placehold.co/400x300/94a3b8/ffffff?text=Bloque+4', 'Bloques', '2026-09-15 21:31:49'),
(6, 'Bloque número 5', 1100.00, 'Estándar', 'Bloque de máxima resistencia para proyectos exigentes.', 400, 'https://placehold.co/400x300/64748b/ffffff?text=Bloque+5', 'Bloques', '2026-09-15 21:31:49'),
(7, 'Regilla', 700.00, 'Estándar', 'Regilla de arcilla para ventilación y decoración.', 300, 'https://placehold.co/400x300/86efac/ffffff?text=Regilla', 'Especiales', '2026-09-15 21:31:49'),
(8, 'Adoquín', 750.00, 'Estándar', 'Adoquín de arcilla para pavimentación exterior resistente.', 600, 'https://placehold.co/400x300/a3a3a3/ffffff?text=Adoquin', 'Especiales', '2026-09-15 21:31:49'),
(9, 'Teja de barro', 1000.00, 'Estándar', 'Teja de barro tradicional con excelente aislamiento térmico.', 450, 'https://placehold.co/400x300/dc2626/ffffff?text=Teja+de+Barro', 'Tejas', '2026-09-15 21:31:49'),
(10, 'Bloquelón', 5500.00, 'Grande', 'Bloquelón de gran tamaño para placas y entrepisos.', 150, 'https://placehold.co/400x300/7c3aed/ffffff?text=Bloquelon', 'Bloques', '2026-09-15 21:31:49'),
(11, 'Ladrillo Prensado Liviano 24.5x12x6cm Santafe', 1400.00, '24.5x12x6 cm', 'Ladrillo prensado liviano Santafe. 2.2 Kg, rendimiento 56 u/m2. Tipo enchape, color terracota. Código: 114940.', 1000, 'https://placehold.co/400x300/b45309/ffffff?text=Prensado+Liviano', 'Ladrillos', '2026-09-17 13:20:00'),
(12, 'Bloque Perf Vert DP 33x23x11.5cm', 4900.00, '33x23x11.5 cm', 'Bloque perforación vertical DP estructural. 7.9 Kg, rendimiento 12.25 u/m2. Color terracota. Código: 76786.', 600, 'https://placehold.co/400x300/9a3412/ffffff?text=Bloque+DP', 'Bloques', '2026-09-17 13:20:00'),
(13, 'Ladrillo Refractario 24x12.5x4cm 1400°C', 2700.00, '24x12.5x4 cm', 'Ladrillo refractario de alta resistencia térmica hasta 1400°C. 1.5 Kg, rendimiento 36 u/m2, color arena. Código: 159253.', 500, 'https://placehold.co/400x300/d97706/ffffff?text=Refractario', 'Refractarios', '2026-09-17 13:20:00'),
(14, 'Tolete #1 Perforado 24x12x6cm', 660.00, '24x12x6 cm', 'Tolete #1 perforado artesanal. 2.10 Kg, rendimiento 56 u/m2. Garantía 1 año. Código: 99717.', 1500, 'https://placehold.co/400x300/c2410c/ffffff?text=Tolete+Perforado', 'Ladrillos', '2026-09-17 13:20:00'),
(15, 'Prensado Macizo 24.5x12x5.5cm', 1900.00, '24.5x12x5.5 cm', 'Ladrillo prensado macizo tipo enchape. Rendimiento 60 u/m2, color terracota. Código: 23209.', 800, 'https://placehold.co/400x300/b45309/ffffff?text=Prensado+Macizo', 'Ladrillos', '2026-09-17 13:20:00'),
(16, 'Tableta Arcilla Cúcuta 20x20cm', 23000.00, '20x20 cm', 'Tableta elaborada en arcilla natural tamaño 20x20 cm. Acabado tradicional cálido para pisos y muros.', 400, 'https://placehold.co/400x300/ea580c/ffffff?text=Tableta+Cucuta', 'Tabletas', '2026-09-17 13:20:00'),
(17, 'Adoquín Corbatín 15x10x6cm', 800.00, '15x10x6 cm', 'Adoquín tipo corbatín para pavimentación exterior y senderos de alto tránsito.', 1200, 'https://placehold.co/400x300/78716c/ffffff?text=Adoquin+Corbatin', 'Adoquines', '2026-09-17 13:20:00'),
(18, 'Tableta Rústica 25x25cm', 20000.00, '25x25 cm', 'Tableta acabado rústico en arcilla de alta resistencia, formato 25x25 cm.', 350, 'https://placehold.co/400x300/c2410c/ffffff?text=Tableta+Rustica', 'Tabletas', '2026-09-17 13:20:00'),
(19, 'Ladrillo Prisma Gris 24x12x6cm', 900.00, '24x12x6 cm', 'Ladrillo de fachada acabado prisma gris moderno. Alta estética arquitectónica.', 700, 'https://placehold.co/400x300/64748b/ffffff?text=Prisma+Gris', 'Fachadas', '2026-09-17 13:20:00'),
(20, 'Ladrillo Cocoa 24x12x6cm', 900.00, '24x12x6 cm', 'Ladrillo de fachada tono cocoa oscuro elegante. Gran durabilidad y textura.', 700, 'https://placehold.co/400x300/78350f/ffffff?text=Ladrillo+Cocoa', 'Fachadas', '2026-09-17 13:20:00'),
(21, 'Arena de Río (m³)', 100000.00, 'm³', 'Arena de río lavada y seleccionada para mezclas de concreto y pegas de mampostería.', 100, 'https://placehold.co/400x300/a8a29e/ffffff?text=Arena+de+Rio', 'Agregados', '2026-09-17 13:20:00'),
(22, 'Arena Amarilla (m³)', 100000.00, 'm³', 'Arena amarilla seleccionada para morteros de pega, acabados y revoques uniformes.', 100, 'https://placehold.co/400x300/ca8a04/ffffff?text=Arena+Amarilla', 'Agregados', '2026-09-17 13:20:00'),
(23, 'Mixto de Concreto (m³)', 100000.00, 'm³', 'Material mixto granular (grava y arena) balanceado para fundición estructural.', 100, 'https://placehold.co/400x300/57534e/ffffff?text=Mixto+Concreto', 'Agregados', '2026-09-17 13:20:00');

-- ========================================================
-- 3. TABLA: PEDIDOS Y SUS DATOS
-- ========================================================
CREATE TABLE IF NOT EXISTS `pedidos` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `usuario_id` INT DEFAULT NULL,
  `tipo_persona` ENUM('Natural','Jurídica') DEFAULT 'Natural',
  `subtotal` DECIMAL(12,2) NOT NULL,
  `iva` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  `ica` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  `total` DECIMAL(12,2) NOT NULL,
  `estado` ENUM('Pendiente','Pagado','En Proceso','Enviado','Entregado','Finalizado','Cancelado') DEFAULT 'Pendiente',
  `metodo_pago` VARCHAR(50) DEFAULT 'WhatsApp',
  `notas` TEXT DEFAULT NULL,
  `creado_en` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL
);

INSERT INTO `pedidos` (`id`, `usuario_id`, `tipo_persona`, `subtotal`, `iva`, `ica`, `total`, `estado`, `metodo_pago`, `notas`, `creado_en`) VALUES
(1, 1, 'Natural', 30000.00, 0.00, 0.00, 30000.00, 'Pendiente', 'NEQUI', '', '2026-09-15 22:07:28')
ON DUPLICATE KEY UPDATE `estado`=VALUES(`estado`);

-- ========================================================
-- 4. TABLA: DETALLE_PEDIDO Y SUS DATOS
-- ========================================================
CREATE TABLE IF NOT EXISTS `detalle_pedido` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `pedido_id` INT NOT NULL,
  `producto_id` INT NOT NULL,
  `nombre_producto` VARCHAR(150) NOT NULL,
  `precio_unitario` DECIMAL(12,2) NOT NULL,
  `cantidad` INT NOT NULL,
  `subtotal` DECIMAL(12,2) NOT NULL,
  FOREIGN KEY (`pedido_id`) REFERENCES `pedidos` (`id`) ON DELETE CASCADE
);

INSERT INTO `detalle_pedido` (`id`, `pedido_id`, `producto_id`, `nombre_producto`, `precio_unitario`, `cantidad`, `subtotal`) VALUES
(1, 1, 1, 'Ladrillo pequeño negro', 300.00, 100, 30000.00)
ON DUPLICATE KEY UPDATE `cantidad`=VALUES(`cantidad`);

-- ========================================================
-- 5. TABLA: MOVIMIENTOS_INVENTARIO Y SUS DATOS
-- ========================================================
CREATE TABLE IF NOT EXISTS `movimientos_inventario` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `producto_id` INT NOT NULL,
  `nombre_producto` VARCHAR(150) NOT NULL,
  `tipo` ENUM('entrada','salida') NOT NULL,
  `cantidad` INT NOT NULL,
  `nota` TEXT DEFAULT NULL,
  `fecha` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO `movimientos_inventario` (`id`, `producto_id`, `nombre_producto`, `tipo`, `cantidad`, `nota`, `fecha`) VALUES
(1, 1, 'Ladrillo pequeño negro', 'salida', 100, 'Pedido #1', '2026-09-15 22:07:28')
ON DUPLICATE KEY UPDATE `cantidad`=VALUES(`cantidad`);
