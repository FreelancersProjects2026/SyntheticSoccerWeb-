# Synthetic Soccer Web

Plataforma de reservas para canchas sintéticas de fútbol. Permite a administradores gestionar canchas y disponibilidad, y a usuarios agendar, reprogramar y buscar retos.

---

## Características

### Administrador
- Agregar y editar canchas (nombre, descripción, capacidad)
- Configurar disponibilidad: fechas y franjas horarias
- Ver calendario de reservas activas

### Usuario
- Buscar canchas disponibles por fecha y hora
- Agendar y reprogramar reservas
- Buscar reto — publicar o aceptar desafíos de otros equipos en slots disponibles

---

## Stack

| Capa | Tecnología |
|---|---|
| Build | Vite 8 |
| UI | React 19 + TypeScript 6 |
| Estilos | Tailwind CSS 4 |
| PWA | vite-plugin-pwa + Workbox |
| Linting | ESLint 10 + typescript-eslint |
| Formato | Prettier 3 + prettier-plugin-tailwindcss |
| Package manager | pnpm |

---

## Inicio rápido

```bash
# Instalar dependencias
pnpm install

# Servidor de desarrollo
pnpm dev

# Build de producción
pnpm build

# Preview del build
pnpm preview
```

---

## Scripts

| Comando | Descripción |
|---|---|
| `pnpm dev` | Servidor local en `localhost:5173` |
| `pnpm build` | Compila TypeScript y genera bundle en `dist/` |
| `pnpm preview` | Sirve el build de producción localmente |
| `pnpm lint` | Analiza el código con ESLint |
| `pnpm lint:fix` | Corrige errores de lint automáticamente |
| `pnpm format` | Formatea `src/` con Prettier |
| `pnpm type-check` | Verificación de tipos sin emitir archivos |

---

## Estructura del proyecto

```
src/
├── components/    Componentes reutilizables (UI, formularios, calendario)
├── pages/         Vistas por ruta
├── hooks/         Custom hooks de React
├── types/         Interfaces TypeScript compartidas (Cancha, Reserva, Reto, User)
├── utils/         Funciones puras (fechas, validaciones, slots)
└── assets/        Imágenes y fuentes estáticas
```

---

## PWA

La app funciona como Progressive Web App. Al ejecutar `pnpm build`, Workbox genera automáticamente el service worker (`dist/sw.js`) y el web manifest. En desarrollo, el SW también está activo para facilitar pruebas.

Para instalar en móvil: abre la app en el navegador → "Agregar a pantalla de inicio".

---

## Convenciones de código

- **Imports absolutos:** usar `@/` en lugar de rutas relativas (`@/components/Button`)
- **Package manager:** solo `pnpm`, nunca `npm` o `yarn`
- **Formato:** Prettier corre automáticamente al guardar (VS Code con la extensión recomendada)
- **Tailwind:** las clases se ordenan automáticamente al formatear con `prettier-plugin-tailwindcss`
