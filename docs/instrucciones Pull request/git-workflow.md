# Git Workflow

## Regla de protección de `main`

**No se puede mergear a `main` sin al menos 1 aprobación humana.**

Esto significa: abrís el PR → pedís review → esperás aprobación → mergeás. Nunca mergear sin que alguien lo haya revisado. Sin aprobación, GitHub bloquea el merge.

---

## Nombres de ramas

Formato: `tipo/descripcion-corta-en-kebab`

| Tipo | Cuándo |
|---|---|
| `feat/` | Feature nueva |
| `fix/` | Corrección de bug |
| `refactor/` | Cambio de código sin cambiar comportamiento |
| `chore/` | Deps, config, CI, archivos de proyecto |
| `docs/` | Solo documentación |

**Ejemplos:**
```
feat/reserva-form
feat/admin-canchas-crud
fix/rls-policy-admin
fix/supabase-client-undefined
refactor/auth-context-split
chore/update-supabase-deps
docs/errores-comunes
```

Nunca:
```
❌ jason-prueba2
❌ arreglos
❌ wip
❌ main2
```

---

## Commits

Formato: `tipo: descripción en imperativo, minúsculas`

```
feat: agregar formulario de reserva con validación de horario
fix: corregir policy RLS para usuarios con rol admin
refactor: extraer lógica de auth a hook useAuthState
chore: actualizar @supabase/supabase-js a v2.50
docs: agregar guía de errores comunes
```

### Reglas
- Imperativo: "agregar" no "agregué" ni "agregando"
- Minúsculas después de los dos puntos
- Sin punto final
- Máximo 72 caracteres en el título
- Si necesitás más contexto, agregalo en el cuerpo del commit (línea en blanco + párrafo)

### Un commit = un cambio atómico
Si el commit describe dos cosas, son dos commits:
```
❌ feat: agregar formulario de reserva y arreglar bug de login
✅ feat: agregar formulario de reserva
✅ fix: corregir redirect de login cuando sesión expira
```

---

## Flujo completo

```
1. Crear rama desde main actualizado
   git checkout main
   git pull
   git checkout -b feat/nombre-feature

2. Trabajar en commits atómicos
   git add src/components/ReservaForm.tsx src/hooks/use-reserva-form.ts
   git commit -m "feat: agregar componente ReservaForm con validación"

3. Antes de abrir PR — verificar que CI pasará
   pnpm type-check && pnpm lint && pnpm prettier --check "src/**/*.{ts,tsx,css}" && pnpm build

4. Push y abrir PR
   git push -u origin feat/nombre-feature
   (abrir PR en GitHub con título y descripción — ver como-hacer-un-buen-pr.md)

5. Pedir review explícitamente
   Asignar reviewer en GitHub → esperar aprobación
   Sin aprobación = no se puede mergear

6. Responder feedback
   Hacer los cambios → nuevo commit (no amend en ramas compartidas)
   git commit -m "fix: aplicar sugerencias de review en ReservaForm"

7. Merge
   Solo después de aprobación → Squash and merge o Merge commit (lo que decida el equipo)
   Borrar la rama después del merge
```

---

## Sincronizar rama con main actualizado

Si `main` avanzó mientras trabajabas en tu rama:

```bash
git checkout main
git pull
git checkout feat/mi-rama
git rebase main
```

Rebase mantiene el historial limpio. Si hay conflictos, resolverlos y continuar:

```bash
git add .
git rebase --continue
```

---

## Qué NO hacer

- ❌ Commitear directo a `main` — está protegida
- ❌ Mergear sin aprobación — GitHub lo bloquea
- ❌ `git push --force` en ramas compartidas — destruye historial del equipo
- ❌ Ramas de vida larga (+3 días sin mergear) — generan conflictos grandes
- ❌ Un commit con 20 archivos cambiados — dividir en commits atómicos
- ❌ `git add .` sin revisar qué se está agregando — puede commitear `.env.local` u otros archivos sensibles
