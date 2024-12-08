import { BaileysClass } from "@bot-wa/bot-wa-baileys";
import { dlVideo, deleteFile, searchVids, dlAudio } from "./youtubedl/youtubedl";
import fs from 'fs'

const botBaileys = new BaileysClass({});

botBaileys.on("auth_failure", async (error) =>
  console.log("ERROR BOT: ", error)
);

botBaileys.on("qr", (qr) => console.log("NEW QR CODE: ", qr));
botBaileys.on("ready", async () => console.log("READY BOT"));

const phoneNumbr = "50360280607@s.whatsapp.net";

botBaileys.on("message", async (message) => {
  handleMessages(message);
});

async function handleMessages(message:any) {
  if (message.from !== phoneNumbr) {
    botBaileys.sendText(message.from, "You don't have access to this bot");
    return;
  }

  const body = message.body;

  switch (true) {
    case body.startsWith("search"): {
      const textToSearch = body.replace("search", "").trim();
      botBaileys.sendText(message.from, "Searching for: " + textToSearch);

      try {
        const result = await searchVids(textToSearch);

        if (result) {
          botBaileys.sendText(message.from, result);
        } else {
          botBaileys.sendText(
            message.from,
            "No results found for your search."
          );
        }
      } catch (error) {
        botBaileys.sendText(
          message.from,
          "An error occurred during the search."
        );
        console.error(error); // Log para depuración
      }
      break;
    }

    case body.startsWith("dl"): {
      const videoId = body.replace("dl", "").trim()
        botBaileys.sendText(message.from, "Downloading video ");
      try {
        if (videoId) {
          const videoPath: string = await dlVideo(videoId);

          if (videoPath) {
            await botBaileys.sendText(
              message.from,
              "Download complete! Sending video..."
            );
            await botBaileys.sendFile(message.from, videoPath);
            deleteFile(videoPath);
          }
        }
      } catch (error: any) {
        botBaileys.sendText(
          message.from,
          `Failed to download video: ${error.message}`
        );
      }
      break;
    }
    case body.startsWith("audio"):{
        try{
            const id = body.replace("audio", "").trim()
            await botBaileys.sendText(message.from, "Descargando audio")
            const audio = await dlAudio(id)
            if (fs.existsSync(audio)) {
            await botBaileys.sendFile(message.from, audio)
            }

        }catch(e:any){
            botBaileys.sendText(message.from, e)
        }
        break
    }

    default:
      botBaileys.sendText(message.from, `comando no valido 
        enviar:
         search "video a buscar" para buscar videos 
         dl "id del video" para descargar un video
         audio "id del video" para descargar solo el audio
         
         ejemplo:
         search linkin park the emptiness machine

         ejemplo:
         dl SRXH9AbT280
        `);
      break;
  }
}
