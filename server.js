// server.js
const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const GEMINI_KEY = process.env.GEMINI_API_KEY;
const MODEL_NAME = process.env.MODEL_NAME || 'gemini-1.5-mini';

// Health check
app.get('/', (req, res) => res.send({ status: 'ok' }));

// Generate itinerary endpoint
app.post('/api/itinerary', async (req, res) => {
  const { origin, destination, days = 1, budget = 'low', preferences = '', startDate = '' } = req.body;

  const prompt = `
    Plan a ${days}-day budget trip from ${origin} to ${destination}.
    Budget level: ${budget}.
    Start date: ${startDate || 'not specified'}.
    Preferences: ${preferences}.
    Output strictly in JSON format, structured like this:
    {
      "tripSummary": "short overview",
      "days": [
        { "day": 1, "activities": ["...","..."] },
        { "day": 2, "activities": ["...","..."] }
      ],
      "estimatedCost": "..."
    }
  `;

  try {
    const aiResp = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${GEMINI_KEY}`,
      {
        contents: [
          {
            parts: [{ text: prompt }]
          }
        ]
      },
      { headers: { 'Content-Type': 'application/json' } }
    );

    // Extract text output from Gemini response
    const aiText = aiResp.data?.candidates?.[0]?.content?.parts?.[0]?.text || JSON.stringify(aiResp.data);

    let itinerary;
    try {
      itinerary = JSON.parse(aiText); // parse AI JSON response
    } catch {
      itinerary = { raw: aiText }; // fallback if not valid JSON
    }

    res.json({ itinerary });
  } catch (err) {
    console.error('Error generating itinerary:', err.response?.data || err.message);
    res.status(500).json({ error: err.message, details: err.response?.data });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
