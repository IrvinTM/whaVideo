import {BaileysClass} from '@bot-wa/bot-wa-baileys';
import fs, { PathLike } from 'fs';
import ytdl, { videoInfo } from '@distube/ytdl-core'
import path, { format } from 'path';
import { spawn } from 'child_process'

const cookies = path.join(__dirname, "../cookies.txt");

const botBaileys = new BaileysClass({});
const binPath = path.join(__dirname, "./bin/yt-dlp")

botBaileys.on('auth_failure', async (error) => console.log("ERROR BOT: ", error));
botBaileys.on('qr', (qr) => console.log("NEW QR CODE: ", qr));
botBaileys.on('ready', async () => console.log('READY BOT'))

let awaitingResponse = false;
const phoneNumbr = "50360280607@s.whatsapp.net";

    botBaileys.on('message', async (message) => {
    handleMessages(message)
    });



async function handleMessages(message:any) {
    if (message.from !== phoneNumbr) {
        botBaileys.sendText(message.from, "You don't have access to this bot");
        return;
    }

    const body = message.body;

    switch (true) {        case body.startsWith("url"):
            const textToSearch = body.replace("url", "").trim();
            botBaileys.sendText(message.from, "Searching for: " + textToSearch);
            break;

        case body.startsWith("dl"):
            const urlToDownload = body.replace("dl", "").trim();
            botBaileys.sendText(message.from, "Downloading: " + urlToDownload);
            const outFi:string = await ytvdl("tRATnT577Aw")
            botBaileys.sendText(message.from, outFi);

           try {
                const filePath:PathLike = await downloadVideo(urlToDownload);
                await botBaileys.sendText(message.from, "Download complete! Sending video...");
                // Send the video back
                await botBaileys.sendFile(message.from, filePath.toString())
                // Clean up the file
            } catch (error:any) {
                botBaileys.sendText(message.from, `Failed to download video: ${error.message}`);
            }            break;

        default:
            botBaileys.sendText(message.from, "Invalid command");
            break;
    }
}

async function downloadVideo(url: string): Promise<PathLike> {
    const cookie =
    "example cookie"
    return new Promise(async (resolve, reject) => {
        try {
            const filePath: PathLike = path.join(__dirname, "video.mp4");

            const info = await ytdl.getInfo(url);

            const format = info.formats.find(f => f.itag === 135);
            if (!format) {
                return reject(new Error("Desired format not available"));
            }

            const stream = ytdl.downloadFromInfo(info, { quality: "highestaudio", requestOptions:{
                headers:{
                    cookie:cookie,
                    'x-youtube-identity-token': "example",
                }
            } }).pipe(fs.createWriteStream(filePath));

            stream.on("finish", () => resolve(filePath));
            stream.on("error", (err) => reject(err));
        } catch (error) {
            reject(error);
        }
    });
}

    
async function ytvdl(vid:string):Promise<string> {

  return new Promise((resolve, reject) => {

    const output = path.join(__dirname, `video.mp4`);

    const args = [

      "-f",

      "bestvideo+bestaudio[ext=mp4]/mp4",

      "--cookies",

      cookies,

      "-o",

      output,

      `https://www.youtube.com/watch?v=${vid}`,

    ];

    const process = spawn(binPath, args);

    process.on("close", (code) => {

      if (code === 0) {

        resolve(output);

      } else {

        reject(`yt-dlp failed with exit code ${code}`);

      }

    });

    process.on("error", (err) => {

      console.error(`yt-dlp process failed: ${err}`);

      reject(`yt-dlp error: ${err.message}`);

    });

  });

}
