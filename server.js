const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const GEMINI_KEY = process.env.GEMINI_API_KEY;
const MODEL_NAME = process.env.MODEL_NAME || 'gemini-1.5-mini';

app.get('/', (req, res) => res.send({ status: 'ok' }));

app.post('/api/itinerary', async (req, res) => {
  const { origin, destination, days = 1, budget = 'low', preferences = '' } = req.body;
  const prompt = `Plan a ${days}-day budget trip from ${origin} to ${destination}, budget: ${budget}, preferences: ${preferences}. Output JSON only.`;

  try {
    const aiResp = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateText?key=${GEMINI_KEY}`,
      { prompt: { text: prompt } },
      { headers: { 'Content-Type': 'application/json' } }
    );

    const aiText = aiResp.data?.candidates?.[0]?.content?.parts?.[0]?.text || JSON.stringify(aiResp.data);
    let itinerary;
    try { itinerary = JSON.parse(aiText); } catch { itinerary = { raw: aiText }; }

    res.json({ itinerary });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
