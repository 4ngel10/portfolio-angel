# Originales de cámara

Aquí van las fotos originales (JPG, HEIC...) con las que se generan las imágenes del sitio. Esta
carpeta está en `.gitignore`: nada de lo que pongas aquí se sube al repositorio ni se despliega.
Solo este archivo se sigue por git.

Nunca en `public/`: todo lo que hay en `public/` se publica tal cual y un original pesa varios MB.

Foto del hero:

```
npx tsx scripts/generar-foto-hero.ts nombre-del-original.jpg
```

Lee el archivo de esta carpeta y escribe las variantes AVIF y WebP en `public/hero/`.
