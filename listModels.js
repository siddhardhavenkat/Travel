import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

async function run() {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

  // List models through genAI.models
  const response = await genAI.models.list();
  
  console.log("Available Models:");
  response.models.forEach(m => console.log(m.name));
}

run().catch(console.error);
