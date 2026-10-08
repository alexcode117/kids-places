# 7. Puesta en marcha

## Correr la app en tu computadora

Requisitos: Node.js 20 o superior. Se recomienda Node.js 22, porque Supabase dejará de soportar Node 20.

```bash
npm install
npm run dev
```

Abre http://localhost:3000.

Sin configurar nada, la app arranca en **modo demostración**:
- Usa los sitios del dataset con ubicación (`apps/web/src/data/dataset.json`).
- El inicio de sesión es simulado.
- Las puntuaciones se guardan solo en tu navegador.

## Conectar Supabase

1. Crea una cuenta y un proyecto en https://supabase.com. Elige la región más cercana a Venezuela (por ejemplo, `us-east-1`).
2. Abre **SQL Editor** y ejecuta, en este orden:
   1. `supabase/migrations/20261008120000_esquema_inicial.sql` (tablas, seguridad, fotos)
   2. `supabase/migrations/20261008150000_ubicaciones_y_cursos.sql`
   3. `supabase/seed.sql` (categorías, servicios y ciudades)
   4. `supabase/datos/sitios-dataset.sql` (los sitios del dataset, ver docs/06-formato-del-dataset.md)
3. En **Project Settings → API**, copia la *Project URL* y la *publishable key* (o *anon key*).
4. Copia `apps/web/.env.example` como `apps/web/.env.local` y pega ahí esos dos valores.
5. Reinicia `npm run dev`. La etiqueta "Modo demostración" desaparece.

> La clave *publishable / anon* es pública por diseño: la protección de los datos está en las reglas de seguridad (RLS) de la base de datos. **Nunca** pongas la clave *service_role* en `.env.local` del frontend.

## Inicio de sesión

**Enlace por correo**: funciona sin configuración extra. En **Authentication → URL Configuration**:
- *Site URL*: `http://localhost:3000` (y luego tu dominio).
- *Redirect URLs*: agrega `http://localhost:3000/auth/callback` (y luego `https://tu-dominio/auth/callback`).

**Google**:
1. En Google Cloud Console crea un *OAuth Client ID* de tipo "Aplicación web".
2. Como *Authorized redirect URI* usa la que muestra Supabase en **Authentication → Providers → Google**.
3. Pega el Client ID y el Secret en Supabase y activa el proveedor.

## Hacerte administrador

Inicia sesión una vez en la app. Luego ejecuta en el SQL Editor:

```sql
update public.profiles set role = 'admin'
where id = (select id from auth.users where email = 'tu-correo@ejemplo.com');
```

## Mapa

- Por defecto usa **OpenFreeMap**: gratis, sin clave y con datos de OpenStreetMap. Los colores se ajustan a la marca en `apps/web/src/components/map/MapView.tsx`.
- Para usar **MapTiler** u otro proveedor, define `NEXT_PUBLIC_MAP_STYLE_URL` en `.env.local`.

## Comandos útiles

| Comando | Qué hace |
|---|---|
| `npm run dev` | Servidor de desarrollo |
| `npm run importar` | Regenera el SQL y los datos de demostración desde el dataset |
| `npm run build` | Build de producción |
| `npm run lint` | Revisión de estilo de código |
| `npm run typecheck -w web` | Revisión de tipos |
