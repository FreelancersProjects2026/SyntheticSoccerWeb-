# Cómo hacer un Pull Request de calidad

## Antes de abrir el PR

### 1. Verifica que CI pasará localmente

Corre los 4 checks antes de pushear. Si falla local, falla en GitHub:

```bash
pnpm type-check && pnpm lint && pnpm prettier --check "src/**/*.{ts,tsx,css}" && pnpm build
```

### 2. Revisa tu propio código antes que nadie

Abre el diff en GitHub antes de pedir review. Pregúntate:

- ¿Cada archivo tiene una sola responsabilidad?
- ¿Hay lógica de negocio dentro de un componente React? → moverla a un hook
- ¿Hay una query Supabase directa en un componente? → moverla a `src/services/`
- ¿Hay algún `any` en TypeScript? → definir el tipo o usar `unknown`
- ¿Algún archivo supera 150 líneas? → dividirlo
- ¿Alguna función supera 30 líneas? → extraer subfunciones
- ¿Hay magic numbers o strings sin constante nombrada?
- ¿Hay `console.log` olvidados?

### 3. Un PR = un propósito

No mezcles features con refactors con bugfixes en el mismo PR. Si surgió algo mientras trabajabas, abrí un PR separado.

---

## Título del PR

Formato: `tipo: descripción corta en imperativo`

| Tipo | Cuándo usarlo |
|---|---|
| `feat:` | Nueva funcionalidad |
| `fix:` | Corrección de bug |
| `refactor:` | Cambio de código sin cambiar comportamiento |
| `chore:` | Configuración, dependencias, CI |
| `docs:` | Solo documentación |

**Bien:** `feat: agregar formulario de reserva de cancha`
**Mal:** `cambios`, `arreglé cosas`, `wip`

El título debe poder leerse en un `git log` y entenderse sin contexto adicional.

---

## Descripción del PR

Una buena descripción tiene tres partes:

### ¿Qué cambia?
Lista breve de los cambios principales. No copies el diff — explica el propósito:

```
- Nuevo componente `ReservaForm` con validación de fecha y hora
- Hook `useReservaForm` maneja el estado del formulario y el submit
- Service `reservaService.createReserva()` hace la llamada a Supabase
```

### ¿Por qué?
El contexto que no está en el código. ¿Qué problema resuelve? ¿Qué decisión tomaste y por qué?

```
Se separó la validación de fecha en un util porque la misma lógica
se necesitará en el calendario de admin.
```

### ¿Cómo probarlo?
Pasos exactos para verificar que funciona:

```
1. Ir a /reservar
2. Seleccionar una cancha y una fecha disponible
3. Confirmar que el formulario valida hora de cierre > hora de apertura
4. Confirmar que la reserva aparece en /admin/reservas
```

---

## Tamaño del PR

| Líneas cambiadas | Estado |
|---|---|
| < 200 | Ideal — review rápido y preciso |
| 200 – 500 | Aceptable si es una feature completa |
| > 500 | Dividir en PRs más chicos |

PRs grandes = reviews superficiales = bugs que pasan. Si el PR es grande, es una señal de que se puede dividir.

---

## Amazon Q Developer — Review automático

Este proyecto tiene **Amazon Q Developer** instalado como GitHub App. Q analiza cada PR contra las reglas de arquitectura definidas en `.amazonq/rules/general.md`.

### Cómo funciona

Q revisa automáticamente cuando se abre o reabre un PR. También puedes activarlo manualmente comentando en el PR:

```
/q review
```

Q deja inline comments en las líneas con problemas — violaciones de arquitectura, posibles bugs, problemas de seguridad, TypeScript incorrecto.

### Cómo interactuar con Q

Dentro de cualquier thread de review, puedes responderle:

```
/q ¿por qué esto es un problema?
/q muéstrame cómo arreglarlo
/q ignora este caso, es intencional porque...
```

Si quieres que Q implemente una corrección:

```
/q dev arregla los problemas que encontraste en este archivo
```

### Reglas que Q aplica en este proyecto

- Sin Supabase imports fuera de `src/services/`
- Sin `any` en TypeScript
- Componentes máximo 150 líneas
- Funciones máximo 30 líneas
- Sin lógica de negocio en componentes
- Todos los errores de Supabase manejados explícitamente
- Sin `console.log` en código commiteado
- Sin magic numbers ni strings sin constante

---

## Checklist antes de pedir review

- [ ] CI pasa localmente (type-check, lint, prettier, build)
- [ ] El título sigue el formato `tipo: descripción`
- [ ] La descripción explica qué, por qué y cómo probar
- [ ] El PR tiene un solo propósito
- [ ] No hay `console.log`, `any`, ni código comentado
- [ ] Corrí `/q review` y revisé los comments de Amazon Q
- [ ] Los archivos nuevos siguen la estructura de capas del proyecto
- [ ] No hay lógica de negocio en componentes ni queries directas en UI

---

## Flujo completo

```
rama feature → commits atómicos → pnpm checks local
    → push → abrir PR con título y descripción
    → /q review → revisar inline comments de Q
    → corregir o responder → pedir review humano
    → merge a main
```
