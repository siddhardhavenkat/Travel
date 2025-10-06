// server.js
import dotenv from "dotenv";   // must come first
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Load .env
dotenv.config();

// ✅ Get API Key
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
console.log("DEBUG: GEMINI_API_KEY loaded?", GEMINI_API_KEY ? "✅ yes" : "❌ missing");

if (!GEMINI_API_KEY) {
  console.error("❌ Missing GEMINI_API_KEY in .env — add your Google AI Studio API key.");
  process.exit(1);
}

// Express setup
const app = express();
app.use(cors());
app.use(express.json());

// Static files (frontend served from "public" folder)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(path.join(__dirname, "public")));

// Gemini AI client
const genAI = new GoogleGenerativeAI({ apiKey: GEMINI_API_KEY });

// API endpoint the frontend will call
app.post("/api/generate", async (req, res) => {
  try {
    const { origin, destination, startDate, duration, budget, interests, preferences } = req.body;

    // Defaults
    const days = Number(duration) || 3;
    const budgetNum = Number(budget) || days * 50;
    const interestList = Array.isArray(interests)
      ? interests.join(", ")
      : interests || "sightseeing";

    // Prompt for Gemini
    const prompt = `
You are a travel planner for university students on a budget.
Create a ${days}-day itinerary from "${origin}" to "${destination}" starting on ${startDate}.
Budget (USD): ${budgetNum}. Interests: ${interestList}. Preferences: ${preferences || "none"}.

IMPORTANT: Respond with ONLY valid JSON (no Markdown fences, no explanations). Use this exact schema:
{
  "trip_summary": string,
  "total_estimated_cost": number,
  "within_budget": boolean,
  "currency": "USD",
  "budget_breakdown": {
    "transport": number,
    "food": number,
    "activities": number,
    "accommodation": number,
    "other": number
  },
  "itinerary": [
    {
      "day": number,
      "date": "YYYY-MM-DD",
      "title": string,
      "morning": string,
      "afternoon": string,
      "evening": string,
      "estimated_cost": number
    }
  ],
  "tips": [ string ]
}
Make sure each numeric field is a number (not a string). 
Include at least one low-cost/free activity per day and suggest student-friendly transport options.
`;

    // Call Gemini
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const result = await model.generateContent(prompt);

    let text = result.response.text();

    // 🔧 Clean out possible Markdown wrappers
    text = text.replace(/```json/g, "").replace(/```/g, "").trim();

    try {
      const data = JSON.parse(text);
      return res.json({ success: true, data });
    } catch (err) {
      console.error("❌ JSON parse error:", err.message);
      return res.json({
        success: false,
        error: "Model did not return valid JSON",
        raw: text,
      });
    }
  } catch (err) {
    console.error("❌ API error:", err);
    return res.status(500).json({ success: false, error: err.toString() });
  }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Server running at http://localhost:${PORT}`));
