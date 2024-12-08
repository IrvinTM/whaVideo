import {BaileysClass} from '@bot-wa/bot-wa-baileys';
import fs, { PathLike } from 'fs';
import ytdl, { videoInfo } from '@distube/ytdl-core'
import path, { format } from 'path';
import { spawn } from 'child_process'
import { Client } from 'youtubei';

const youtube = new Client();

const cookies = path.join(__dirname, "../cookies.txt");

const botBaileys = new BaileysClass({});
const binPath = path.join(__dirname, "../src/bin/yt-dlp")

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

    switch (true) {        

        case body.startsWith("search"):
            const textToSearch = body.replace("search", "").trim();
            botBaileys.sendText(message.from, "Searching for: " + textToSearch);
            try {
        const result = await searchVids(textToSearch);
        if (result) {
            botBaileys.sendText(message.from, result);
        } else {
            botBaileys.sendText(message.from, "No results found for your search.");
        }
    } catch (error) {
        botBaileys.sendText(message.from, "An error occurred during the search.");
        console.error(error); // Log para depuración
    }            break;

        case body.startsWith("dl"):
            const urlToDownload = body.replace("dl", "").trim();
            const videoId =  urlToDownload
            botBaileys.sendText(message.from, "Downloading video ");

           try {
               if (videoId) {
                const videoPath:string = await dlVideo(videoId);

                if (videoPath) {
                    await botBaileys.sendText(message.from, "Download complete! Sending video...");
                    await botBaileys.sendFile(message.from, videoPath)
                    deleteFile(videoPath)
                }
               }
                
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

    
async function dlVideo(vid:string):Promise<string> {

  return new Promise((resolve, reject) => {

    const output = path.join(__dirname, `videopipi.mp4`);

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
      })}


async function dlAudio(vid:string):Promise<string> {
  return new Promise((resolve, reject) => {
    const output = path.join(__dirname, `song.m4a`);
    const args = [
      "-f",
      "bestaudio[ext=m4a]",
      "--cookies",
      cookies,
      "-o",
      output,
      `https://www.youtube.com/watch?v=${vid}`,
    ];
    const process = spawn(binPath, args);
    process.on("error", (err) => reject(`yt-dlp error: ${err.message}`));
    process.stderr.on("data", (data) => {
      console.error(`yt-dlp error: ${data}`);
    });
    process.on("close", (code) => {
      if (code === 0) {
        resolve(output);
      } else {
        reject(`yt-dlp failed with exit code ${code}`);
      }
    });
  });
}

function deleteFile(filePath:PathLike) {
  fs.unlink(filePath, (err) => {
    if (err) {
      console.error('Error deleting file:', err);
    } else {
      console.log(`File ${filePath} deleted successfully`);
    }
  });
}


function getYouTubeVideoId(url:string) {
    try {
        const urlObj = new URL(url);
        const hostname = urlObj.hostname;

        if (hostname === 'www.youtube.com' || hostname === 'youtube.com') {
            // For standard YouTube video links (e.g., https://www.youtube.com/watch?v=...)
            if (urlObj.searchParams.has('v')) {
                return urlObj.searchParams.get('v');
            }
            // For YouTube shorts (e.g., https://www.youtube.com/shorts/...)
            if (urlObj.pathname.startsWith('/shorts/')) {
                return urlObj.pathname.split('/')[2];
            }
        } else if (hostname === 'youtu.be') {
            // For shortened YouTube links (e.g., https://youtu.be/...)
            return urlObj.pathname.substring(1);
        }
    } catch (error:any) {
        console.error("Invalid URL:", error.message);
    }
    return null; // Return null if no valid ID is found
}

async function searchVids(searchParam: string): Promise<string> {
    const videos = await youtube.search(searchParam, {
        type: "video", // video | playlist | channel | all
    });

    if (videos.items && videos.items.length > 0) {
        const ids = videos.items
            .map((item) => `Title: ${item.title} ID: ${item.id}`)
            .join("\n");
        return ids;
    } else {
        return '';
    }
}