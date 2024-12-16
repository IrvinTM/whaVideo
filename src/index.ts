import { BaileysClass } from "@bot-wa/bot-wa-baileys";
import {
  dlVideo,
  deleteFile,
  searchVids,
  dlAudio,
} from "./youtubedl/youtubedl";
import fs from "fs";
import { getGeminiCompletion } from "./ai/gemini";

const botBaileys = new BaileysClass({});

botBaileys.on("auth_failure", async (error) =>
  console.log("ERROR BOT: ", error),
);

botBaileys.on("qr", (qr) => console.log("NEW QR CODE: ", qr));
botBaileys.on("ready", async () => console.log("READY BOT"));

/* const phoneNumbr = "50360280607@s.whatsapp.net"; */

botBaileys.on("message", async (message) => {
  handleMessages(message);
});

async function handleMessages(message: any) {
  /* if (message.from !== phoneNumbr) {
    botBaileys.sendText(message.from, "You don't have access to this bot");
    return;
  } */

  const body: string = message.body;

  switch (true) {
    case body.startsWith("Buscar"): {
      const textToSearch = body.replace("Buscar", "").trim();
      botBaileys.sendText(message.from, "*Buscando:* " + textToSearch);

      try {
        const result = await searchVids(textToSearch);

        if (result) {
          botBaileys.sendText(message.from, result);
        } else {
          botBaileys.sendText(
            message.from,
            "No results found for your search.",
          );
        }
      } catch (error) {
        botBaileys.sendText(
          message.from,
          "An error occurred during the search.",
        );
        console.error(error); // Log para depuración
      }
      break;
    }

    case body.startsWith("Descargar"): {
      const videoId = body.replace("Descargar", "").trim();
      botBaileys.sendText(
        message.from,
        "Descargando el video por favor espera...",
      );
      try {
        if (videoId) {
          const videoPath: string = await dlVideo(videoId);

          if (videoPath) {
            await botBaileys.sendText(
              message.from,
              "Descarga completa! Obtendras el video en un momento...",
            );
            await botBaileys.sendFile(message.from, videoPath);
            deleteFile(videoPath);
          }
        }
      } catch (error: any) {
        botBaileys.sendText(
          message.from,
          `Error al descargar el video: ${error}`,
        );
      }
      break;
    }
    case body.startsWith("Audio"): {
      try {
        const id = body.replace("Audio", "").trim();
        await botBaileys.sendText(message.from, "Descargando audio...");
        const audio = await dlAudio(id);
        if (fs.existsSync(audio)) {
          await botBaileys.sendFile(message.from, audio);
        }
      } catch (e: any) {
        botBaileys.sendText(message.from, e);
      }
      break;
    }
    case body.toLowerCase().startsWith("ai"): {
      const prompt = body.toLowerCase().replace("ai", "")
      const answer = await getGeminiCompletion(prompt)
      await botBaileys.sendText(message.from, answer)
      break;
    }

    default:
      botBaileys.sendText(
        message.from,
        `comando no valido\n
        enviar:
         *Buscar* "video a buscar" para buscar videos
         *Descargar* "id del video" para descargar un video
         *Audio* "id del video" para descargar solo el audio

         Ejemplo:
         Buscar linkin park the emptiness machine

         Ejemplo:
         Descargar  SRXH9AbT280
        `,
      );
      break;
  }
}
