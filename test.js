import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

async function run() {
  console.log("API Key loaded?", process.env.GEMINI_API_KEY ? "✅ yes" : "❌ no");
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  const result = await model.generateContent("Say hello from Gemini!");
  console.log(result.response.text());
}

run().catch(console.error);