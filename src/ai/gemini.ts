import "dotenv/config";
import { Content, GoogleGenerativeAI, Part, POSSIBLE_ROLES, StartChatParams } from "@google/generative-ai";

const apikey = process.env.GAPIKEY;
let systemPrompt = "Eres un bot de whatsapp dispuesto a ayudar tu nombre es Ashisogi Jizō."

let startParams: StartChatParams = {
  history: []
};


export async function getGeminiCompletion(
  prompt: string,
  model?: string,
  history?: boolean
): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!model) {
      model = "gemini-1.5-flash";
    }

    if (!apikey) {
      reject("ERROR: no api key found");
    } else {
      const genAI = new GoogleGenerativeAI(apikey);
      const modeltoUse = genAI.getGenerativeModel({
        model: model,
        systemInstruction: systemPrompt
      });

      if (history) {
        const chat = modeltoUse.startChat(startParams)
        chat.sendMessage(prompt).then((chat) => {
          const userMessage: Content = {
            role: "user",
            parts: [
              {
                text: prompt
              }
            ]
          }
          startParams.history?.push(userMessage)

          if (chat.response.text()) {
            const response: Content = {
              role: "model",
              parts: [
                {
                  text: chat.response.text()
                }
              ]
            }
            startParams.history?.push(response)
            resolve(chat.response.text())
          }
        }).catch((e: any) => {
          reject(e)
        })

      } else {
        modeltoUse.generateContent(prompt).then((res) => {
          const response = res.response.text();

          if (response) {
            resolve(response);
          }
        }).catch((e: any) => {
          reject(e)
        })
      }
    }
  });
}

export function resetConversation() {
  const start: StartChatParams = {
    history: []
  }
  startParams = start
}

export function setSystemPrompt(sysPromt: string) {
  systemPrompt = sysPromt
}