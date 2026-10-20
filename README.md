# F.E.S. Construcción 🏗️

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/farleymrtnz25/FES_construccion)

Plataforma Web Profesional de Comercio Electrónico, Cotización Automatizada y Asistencia de Ingeniería Civil con Inteligencia Artificial para **F.E.S. Construcción** (Vereda Patio Bonito, Nemocón, Cundinamarca).

---

## 🚀 Características Principales

* **Asistente de Ingeniería IA (Gemini Flash):** Cotizaciones y cálculos en tiempo real de cantidades de obra (ladrillos, bloques, arena, morteros) basados en rendimientos técnicos y precios actualizados del catálogo.
* **Catálogo de Materiales Completo:** 23 productos certificados de arcilla estructural, adoquines, tejas, tabletas y agregados.
* **Navegación Moderna por Pestañas:** Separación limpia de vistas (Inicio, Catálogo, Nuestra Planta en Nemocón, Contacto).
* **Seguridad y Cumplimiento 20/20:**
  * Cabeceras de seguridad HTTP (HSTS, CSP, X-Frame-Options, XSS Protection).
  * Rate limiting en API y endpoints de autenticación.
  * Formulario con protección Anti-Spam Honeypot.
  * Avisos legales, política de privacidad y banner de cookies.
  * SEO optimizado (Meta etiquetas OpenGraph, Twitter Cards, Schema.org JSON-LD, Sitemap y Robots.txt).
* **Gestión de Pedidos y Facturación:** Carrito de compras reactivo, exportación de facturas / remisiones en PDF descargables.
* **Canal Directo de WhatsApp:** Botón flotante para atención y fletes inmediatos.
* **Despacho de Cotizaciones:** Envío automático de solicitudes al correo oficial `frlmrtnz@gmail.com`.

---

## 🛠️ Tecnologías

* **Frontend:** React 19, Vite, Tailwind CSS, Lucide Icons, html2canvas, jsPDF, DOMPurify.
* **Backend:** Node.js, Express, Rate Limiter, CORS, JWT, Bcrypt.
* **Base de Datos:** MySQL (XAMPP / MariaDB) con soporte SSL para bases en la nube (TiDB / Aiven).
* **Inteligencia Artificial:** Google Generative AI (Gemini Flash API).

---

## 💻 Instalación y Ejecución Local

1. Clonar el repositorio:
   ```bash
   git clone https://github.com/farleymrtnz25/FES_construccion.git
   cd FES_construccion
   ```

2. Instalar dependencias:
   ```bash
   npm run install:all
   ```

3. Importar la base de datos en MySQL:
   * Crear la base de datos `fes_construccion` en phpMyAdmin o consola MySQL.
   * Importar el archivo `fes_construccion.sql`.

4. Configurar variables de entorno (`backend/.env`):
   ```env
   PORT=5000
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=
   DB_NAME=fes_construccion
   JWT_SECRET=tu_secreto_aqui
   GEMINI_API_KEY=tu_api_key_de_gemini
   ```

5. Iniciar la aplicación:
   ```bash
   npm start
   ```
   * Frontend y Backend unificados en: `http://localhost:5000`

---

## 🌐 Despliegue en la Nube (Render / Vercel / Railway)

* **Build Command:** `npm run build`
* **Start Command:** `npm start`
* **Variables requeridas:** `GEMINI_API_KEY`, `JWT_SECRET`, `NODE_ENV=production`.

---
© 2026 F.E.S. Construcción - Vereda Patio Bonito, Nemocón, Cundinamarca.
