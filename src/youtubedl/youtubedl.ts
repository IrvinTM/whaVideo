import path from "path";
import fs, { PathLike } from "fs";
import { spawn } from "child_process";
import { Client } from "youtubei";

const youtube = new Client();
const binPath = path.join(__dirname, "../bin/yt-dlp");
const cookies = path.join(__dirname, "../cookies.txt");

export async function dlVideo(vid: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const output = path.join(__dirname, `videopipi.%(ext)s`);
    const logs = path.join(__dirname, "logsYoutube.log")
const logStream = fs.createWriteStream(logs, { flags: "a" });

    const args = [
      "-f",

      "bv*[ext=mp4][height<=720]+ba/b[ext=mp4][height<=720] / bv*[ext=webm][height<=720]+ba/b[ext=webm][height<=720]",

      "--cookies",

      cookies,

      "-o",

      output,

      `https://www.youtube.com/watch?v=${vid}`,
    ];

    const process = spawn(binPath, args);
    
    process.stdout.on("data", (data) => {
      console.log(`STDOUT: ${data}`);
      logStream.write(`STDOUT: ${data}`);
    });

    process.stderr.on("data", (data) => {
      console.error(`STDERR: ${data}`);
      logStream.write(`STDERR: ${data}`);
    });

    process.on("close", (code) => {
      const mp4 = path.join(__dirname, "videopipi.mp4");
      const webm = path.join(__dirname, "videopipi.webm");
      logStream.end()

      if (code === 0) {
        if (fs.existsSync(mp4)) {
          resolve(mp4);
        } else if (fs.existsSync(webm)) {
          resolve(webm);
        }
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

export async function dlAudio(vid: string): Promise<string> {
  return new Promise((resolve, reject) => {

console.log("cookies path : "+cookies)
    const argsForTitle = [
      "--print",
      "%(title)s",
      "--cookies",
      cookies,
      `https://www.youtube.com/watch?v=${vid}`,
    ];

    const titleProcess = spawn(binPath, argsForTitle);
    let title = "";

    titleProcess.stdout.on("data", (data) => {
      title += data.toString();
    });

    titleProcess.stderr.on("data", (data) => {
      console.error(`yt-dlp title fetch error: ${data}`);
    });

    titleProcess.on("close", (code) => {
      if (code === 0) {
        title = title.trim().replace(/[\\/:*?"<>|]/g, ""); // Sanitize the title
        const output = path.join(__dirname, `${title}.m4a`);

        const argsForDownload = [
          "-f",
          "bestaudio[ext=m4a]",
          "--cookies",
          cookies,
          "-o",
          output,
          `https://www.youtube.com/watch?v=${vid}`,
        ];

        const downloadProcess = spawn(binPath, argsForDownload);

        downloadProcess.on("error", (err) =>
          reject(`yt-dlp error: ${err.message}`)
        );

        downloadProcess.stderr.on("data", (data) => {
          console.error(`yt-dlp download error: ${data}`);
        });

        downloadProcess.on("close", (downloadCode) => {
          if (downloadCode === 0) {
            resolve(output);
          } else {
            reject(`yt-dlp failed with exit code ${downloadCode}`);
          }
        });
      } else {
        reject(`yt-dlp failed to fetch title with exit code ${code}`);
      }
    });
  });
}

export function deleteFile(filePath: PathLike) {
  fs.unlink(filePath, (err) => {
    if (err) {
      console.error("Error deleting file:", err);
    } else {
      console.log(`File ${filePath} deleted successfully`);
    }
  });
}

export function getYouTubeVideoId(url: string) {
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname;

    if (hostname === "www.youtube.com" || hostname === "youtube.com") {
      // For standard YouTube video links (e.g., https://www.youtube.com/watch?v=...)
      if (urlObj.searchParams.has("v")) {
        return urlObj.searchParams.get("v");
      }
      // For YouTube shorts (e.g., https://www.youtube.com/shorts/...)
      if (urlObj.pathname.startsWith("/shorts/")) {
        return urlObj.pathname.split("/")[2];
      }
    } else if (hostname === "youtu.be") {
      // For shortened YouTube links (e.g., https://youtu.be/...)
      return urlObj.pathname.substring(1);
    }
  } catch (error: any) {
    console.error("Invalid URL:", error.message);
  }
  return null; // Return null if no valid ID is found
}

export async function searchVids(searchParam: string): Promise<string> {
  const videos = await youtube.search(searchParam, {
    type: "video", // video | playlist | channel | all
  });

  if (videos.items && videos.items.length > 0) {
    const ids = videos.items
      .map((item) => `*Titulo:* ${item.title} \n *Canal:* _${item.channel?.name}_ \n *Duracion:* ${formatDuration(item.duration)} \n *Subido:*  ${item.uploadDate} \n *ID:* ${item.id}\n`)
      .join("\n");
    return ids;
  } else {
    return "";
  }
}

function formatDuration(seconds: number | null): string {
  const totalSeconds = seconds ?? 0;
  const minutes = Math.floor(totalSeconds / 60);
  const secondsRemainder = totalSeconds % 60;
  return `${minutes} minutos y ${secondsRemainder} segundos`;
}