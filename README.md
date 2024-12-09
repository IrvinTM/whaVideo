
# Proyecto Bot de WhatsApp

Este proyecto es un **Bot de WhatsApp** desarrollado con para interactuar con WhatsApp Web. Incluye funciones para buscar videos en YouTube, descargar videos o audios, y enviarlos directamente a un chat de WhatsApp.

## Características

- **Buscar Videos**: Usa el comando **Buscar** para buscar videos en YouTube.
- **Descargar Videos**: Descarga un video de YouTube usando su ID con el comando ***Descargar*** ID
- **Descargar Audio**: Descarga solo el audio de un video de YouTube usando su ID con **Audio** ID

## Requisitos

- Node.js >= 16
- Archivo de cookies exportado para acceder a YouTube (solo para desplegar)
- Dependencias del proyecto instaladas con `npm install`

## Instalación

1. Clonar este repositorio:
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
El archivo cookies.txt debe estar en el directorio raiz del proyecto. 

4. Iniciar el bot.
```bash
   npm run start
   ```
5. Iniciar sesion con Whatsapp

Iniciar sesion con el numero a usar para el bot escaneando el qr mostrado en la terminal

## Problemas y Solución

   **sign-in to confirm you are not a robot:** Asegúrate de que cookies.txt esté en el directorio raiz del proyecto y sea válido.

