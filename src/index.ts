import { BaileysClass } from "@bot-wa/bot-wa-baileys";
import {
  dlVideo,
  deleteFile,
  searchVids,
  dlAudio,
  dlVideoNoArgs,
} from "./youtubedl/youtubedl";
import fs from "fs";
import {
  getGeminiCompletion,
  resetConversation,
  setSystemPrompt,
} from "./ai/gemini";

const botBaileys = new BaileysClass({});
const adminNumber = process.env.ADMIN;

botBaileys.on("auth_failure", async (error) =>
  console.log("ERROR BOT: ", error),
);

botBaileys.on("qr", (qr) => console.log("NEW QR CODE: ", qr));
botBaileys.on("ready", async () => console.log("READY BOT"));
//restrict to just a number or array of
/* const phoneNumbr = "00000000@s.whatsapp.net"; */

botBaileys.on("message", async (message) => {
  handleMessages(message);
});

async function handleMessages(message: any) {
  //restrict
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
        console.error(error);
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
    case body.startsWith("Video calidad"): {
      const args: string[] = body.split(" ");
      if (args.length != 4) {
        botBaileys.sendText(
          message.from,
          "Argumentos no validos: video [calidad] [idDelVideo]",
        );
        return;
      }
      const videoId = args[3];
      botBaileys.sendText(
        message.from,
        `Descargando el video en calidad ${args[2]} por favor espera...`,
      );
      try {
        if (videoId) {
          const videoPath: string = await dlVideo(videoId, args[2]);

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
        deleteFile(audio);
      } catch (e: any) {
        botBaileys.sendText(message.from, e);
      }
      break;
    }
    case body.startsWith("Setsystemprompt"): {
      if (message.from == adminNumber) {
        const syspr = body.replace("Setsystemprompt", "").trim();
        setSystemPrompt(syspr);
        botBaileys.sendText(message.from, "sistem prompt chnaged");
      } else {
        botBaileys.sendText(message.from, "no autorizado");
      }
      break;
    }

    case body.toLowerCase().startsWith("ia"): {
      if (message.from !== adminNumber) {
        await botBaileys.sendText(
          message.from,
          "No tienes permitida esta opcion xD",
        );
        break;
      }

      try {
        const prompt = body.toLowerCase().replace("ia", "");
        const answer = await getGeminiCompletion(prompt, undefined, true);
        await botBaileys.sendText(message.from, answer);
      } catch (e: any) {
        botBaileys.sendText(message.from, e.message);
      }
      break;
    }

    case body.toLowerCase().startsWith("f ia"): {
      if (message.from !== adminNumber) {
        await botBaileys.sendText(
          message.from,
          "No tienes permitida esta opcion xD",
        );
        break;
      }
      try {
        const prompt = body.toLowerCase().replace("f ia", "");
        const answer = await getGeminiCompletion(prompt);
        await botBaileys.sendText(message.from, answer);
      } catch (e: any) {
        botBaileys.sendText(message.from, e);
      }
      break;
    }

    case body.toLowerCase().startsWith("reset ia"): {
      if (message.from !== adminNumber) {
        await botBaileys.sendText(
          message.from,
          "No tienes permitida esta opcion xD",
        );
        break;
      }
      resetConversation();
      botBaileys.sendText(message.from, "conversacion borrada");
      break;
    }
    case body.startsWith("noargs"): {
      const videoId = body.replace("noargs", "").trim();
      botBaileys.sendText(
        message.from,
        `Descargando el video ${videoId} por favor espera...`,
      );
      try {
        if (videoId) {
          const videoPath: string = await dlVideoNoArgs(videoId);

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
    default: {
      botBaileys.sendText(
        message.from,
        `comando no valido\n
        enviar:
         *Buscar* "video a buscar" para buscar videos
         *Descargar* "id del video" para descargar un video
         *Video calidad [calida]* ejemplo "Video calidad 1080" para descargar en calidad 1080
         Calidades disponiibles: 1080, 720, 480
         *Audio* "id del video" para descargar solo el audio
         *ia* "mensaje" para hablar con la ia
         *reset ia* para resetear la conversacion *recomendado*
         *f ia* "mensaje" para una respuesta sin recordar la conversacion

         Ejemplo:
         Buscar linkin park the emptiness machine

         Ejemplo:
         Descargar  SRXH9AbT280
        `,
      );
      return;
    }
  }
}
