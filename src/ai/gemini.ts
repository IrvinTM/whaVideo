import "dotenv/config";
import { GoogleGenerativeAI } from "@google/generative-ai";

const apikey = process.env.GAPIKEY;

export async function getGeminiCompletion(
  prompt: string,
  model?: string
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
        model: "gemini-1.5-flash",
      });
    modeltoUse.generateContent(prompt).then((res) => {
    const response = res.response.text();

        if (response) {
          resolve(response);
        } else {
          reject("ERROR: error getting the response");
        }
      });
    }
  });
}
