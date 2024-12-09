
# Proyecto Bot de WhatsApp

Este proyecto es un **Bot de WhatsApp** desarrollado con [Baileys](https://github.com/adiwajshing/Baileys) para interactuar con WhatsApp Web. Incluye funciones para buscar videos en YouTube, descargar videos o audios, y enviarlos directamente a un chat de WhatsApp.

## Características

- **Buscar Videos**: Usa un comando para buscar videos en YouTube.
- **Descargar Videos**: Descarga un video de YouTube usando su ID y envíalo como archivo.
- **Descargar Audio**: Descarga solo el audio de un video de YouTube usando su ID.

## Requisitos

- Node.js >= 16
- Archivo de cookies exportado para acceder a YouTube
- Dependencias del proyecto instaladas con `npm install`

## Instalación

1. Clona este repositorio:
   ```bash
   git clone https://github.com/tu-usuario/whatsapp-bot.git
   cd whatsapp-bot
   ```
2. Instalar dependencias:
   ```bash
   npm install
   ```
3. Agregar cookies en formato Mozilla/Netscape(usualmente solo se necesita para desplegar en vps)

Ver guia en [yt-dlp](https://github.com/yt-dlp/yt-dlp/wiki/FAQ#how-do-i-pass-cookies-to-yt-dlp)

4. Iniciar el bot.
```bash
   npm run start
   ```
5. Iniciar sesion con Whatsapp

Iniciar sesion con el numero a usar para el bot escaneando el qr mostrado en la terminal


