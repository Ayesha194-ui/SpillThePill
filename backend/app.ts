import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import path from 'path';
import drugRoutes from "./routes/drugRoutes";
import authRoutes from "./routes/authRoutes";
import { simplifyMedicineInfo } from "./services/llmSimplifier";
dotenv.config({ path: path.resolve(__dirname, '.env') });

const app = express();
const PORT = process.env.PORT || 5050;

app.use(cors());
app.use(express.json());

app.use("/api/drugs", drugRoutes);
app.use("/api/auth", authRoutes);

// Chat endpoint for PillBot
app.post("/api/chat", async (req, res) => {
  try {
    const { message } = req.body;
    console.log('Chat request received:', message);
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
    const OPENROUTER_ENDPOINT = "https://openrouter.ai/api/v1/chat/completions";

    if (!OPENROUTER_API_KEY) {
      throw new Error('OpenRouter API key not found');
    }

    const response = await fetch(OPENROUTER_ENDPOINT, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://spillthepill.com',
        'X-Title': 'SpillThePill ChatBot'
      },
      body: JSON.stringify({
        model: 'deepseek/deepseek-chat-v3-0324:free',
        messages: [
          {
            role: "system",
            content: "You are PillBot, a helpful medical assistant. Provide accurate, easy-to-understand information about medications, health conditions, and medical topics. Always recommend consulting healthcare providers for specific medical advice."
          },
          {
            role: "user",
            content: message,
          },
        ],
        max_tokens: 500,
        temperature: 0.3,
      })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OpenRouter error: ${response.status} ${error}`);
    }

    const data = await response.json();
    const chatResponse = data.choices?.[0]?.message?.content || "I'm sorry, I couldn't process your question. Please try again.";

    console.log('Chat response generated:', chatResponse);
    res.json({ response: chatResponse });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ error: 'Failed to generate chat response' });
  }
});

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});

