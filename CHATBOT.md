# 🤖 Chatbot de la AEFN — Guía rápida

Un asistente flotante (botón azul con borde dorado, abajo a la derecha) que responde
preguntas usando **tus documentos** y **los datos del sitio**. Costo: **$0**.

## Cómo funciona

```
Pregunta → busca los fragmentos más parecidos en tus documentos (en tu servidor, gratis)
         → se los pasa a Google Gemini (plan gratuito) → respuesta
```

No hay "entrenamiento" pesado: el bot lee tus documentos en cada pregunta (técnica RAG).
Así, cuando cambias un documento, el bot cambia su respuesta de inmediato tras el despliegue.

## Activarlo (5 minutos)

1. **Clave gratis de Gemini:** entra a https://aistudio.google.com/apikey con una cuenta de Google
   → *Create API key*. No pide tarjeta.
2. **Vercel:** proyecto → *Settings* → *Environment Variables* → agrega
   `GEMINI_API_KEY` = tu clave.
3. **Redespliega** (o haz cualquier commit).

Sin clave, el chat igual funciona, pero solo muestra los fragmentos encontrados en lugar de redactar una respuesta.

## Agregar documentos

Sube archivos `.pdf`, `.docx`, `.md` o `.txt` a la carpeta **`conocimiento/`** del repositorio
(desde GitHub: *Add file → Upload files*). Al hacer commit, Vercel redespliega y el bot ya los conoce.

## Variables opcionales

| Variable | Para qué | Valor por defecto |
|---|---|---|
| `GEMINI_MODEL` | Cambiar de modelo si Google retira el actual | `gemini-2.5-flash` |
| `GROQ_API_KEY` | Respaldo gratis si se acaba la cuota de Gemini (https://console.groq.com/keys) | — |
| `GROQ_MODEL` | Modelo de Groq | `llama-3.3-70b-versatile` |
| `CHATBOT_MAX_OUTPUT_TOKENS` | Longitud máxima de la respuesta en Gemini | `4000` |
| `GROQ_MAX_TOKENS` | Longitud máxima de la respuesta en Groq | `2000` |
| `CHATBOT_MAX_REQUESTS` | Máximo de preguntas por visitante cada 10 min | `25` |

> Recuerda: tras **agregar o cambiar** una variable en Vercel hay que **redesplegar**
> (Deployments → ⋯ → Redeploy, o un commit cualquiera) para que surta efecto.

## Diagnóstico del chat (si responde con fragmentos)

Cuando el bot contesta "Esto es lo más relacionado que encontré" en lugar de redactar,
es que Gemini **y** Groq fallaron. Abre **`/api/chat`** en el navegador (GET) y verás:

- `hasKey` de cada proveedor → `false` significa que la clave no está en el entorno
  (no la guardaste en Vercel, o falta el redespliegue después de añadirla).
- `lastError` del último intento → ejemplos:
  - `Gemini 429: ...` → cuota gratuita agotada (se resetea sola; Groq toma el relevo)
  - `Groq 401: ...` → clave de Groq inválida (revisa que empiece con `gsk_`, sin espacios)
  - `Groq 404: ...` → modelo retirado → cambia `GROQ_MODEL` por uno vigente
    (lista actual en console.groq.com → Models)
  - `Gemini 400: ... API key not valid` → rotar la clave

Los `lastError` viven en memoria del servidor: se limpian con cada despliegue, así que
haz una pregunta al chat **después** de desplegar y recarga `/api/chat` para verlos.

## Límites del plan gratis

Google fija un número de peticiones por minuto y por día para el plan gratuito, y lo cambia de vez en cuando.
Para una asociación estudiantil suele sobrar. Si un día se agota, el chat no se cae: usa Groq (si lo configuraste)
o muestra los fragmentos encontrados.

> Nota: en el plan gratuito, Google puede usar las conversaciones para mejorar sus productos.
> Por eso el bot solo debe tener información pública.

## Archivos

- `conocimiento/` — tus documentos
- `scripts/build-knowledge.mjs` — convierte documentos en fragmentos (se ejecuta en cada build)
- `src/lib/chat-search.ts` — buscador de fragmentos
- `src/app/api/chat/route.ts` — endpoint que habla con Gemini/Groq
- `public/js/chatbot.js`, `public/css/chatbot.css` — el widget

## Personalizar

- **Personalidad / reglas:** `SYSTEM_PROMPT` en `src/app/api/chat/route.ts`
- **Mensaje de bienvenida y sugerencias:** arriba de `public/js/chatbot.js`
- **Colores:** variables `--chat-*` al inicio de `public/css/chatbot.css`

## Probar en tu computadora

```bash
bun install
echo "GEMINI_API_KEY=tu_clave" >> .env
bun run dev
```
