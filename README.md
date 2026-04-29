# Allbase Links

> Landing page tipo Linktree para centralizar los links de Allbase.

## Stack

- **Vite** (build tool)
- Vanilla JS + CSS
- Deployable en Vercel, Netlify o GitHub Pages

## Desarrollo

```bash
npm install
npm run dev
```

## Build para producción

```bash
npm run build
# La carpeta /dist contiene el sitio listo para deploy
```

## Deploy en Vercel

```bash
npx vercel
```

## Deploy en Netlify

Conectar el repo y configurar:
- **Build command:** `npm run build`
- **Publish directory:** `dist`

## Estructura

```
/
├── public/
│   └── logo.png
├── src/
│   ├── main.js
│   ├── links.js        ← editar links aquí
│   └── style.css
├── index.html
├── vite.config.js
└── package.json
```
