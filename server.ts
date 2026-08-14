import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import admin from 'firebase-admin';
import { getAuth } from 'firebase-admin/auth';
import rateLimit from 'express-rate-limit';

if (!admin.getApps().length) {
  admin.initializeApp();
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Authentication Middleware
  const authMiddleware = async (req: any, res: any, next: any) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized: Missing or invalid Authorization header' });
    }

    const token = authHeader.split('Bearer ')[1];
    try {
      const decodedToken = await getAuth().verifyIdToken(token);
      req.user = decodedToken;
      next();
    } catch (error) {
      console.error('Error verifying auth token', error);
      res.status(401).json({ error: 'Unauthorized: Invalid token' });
    }
  };

  // Rate Limiting Middleware
  const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each user to 100 requests per windowMs
    keyGenerator: (req: any) => {
      return req.user.uid;
    },
    message: 'Too many requests from this user, please try again later.',
  });

  // Apply middlewares to API routes
  app.use('/api/', authMiddleware, apiLimiter);

  // API endpoints
  app.post("/api/chat", async (req, res) => {
    try {
      const { messages, input } = req.body;
      const history = (messages || []).map((m: any) => ({
        role: m.sender === "user" ? "user" : "model",
        parts: [{ text: m.text }],
      }));

      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const chat = ai.chats.create({
        model: "gemini-2.5-flash",
        history,
        config: {
          systemInstruction: `You are a helpful financial assistant for a budget management app called 'Wallet' (ዋሌት). Your goal is to answer user questions about personal finance, budgeting, saving, and how to use the app's features. Be friendly, clear, and concise. Do not ask for personal financial data. You can explain concepts like income, expenses, targets, and reports. Keep your answers relatively short and easy to understand.`,
        },
      });
      const response = await chat.sendMessage({ message: input });
      res.json({ text: response.text });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: (e as any).message });
    }
  });

  app.post("/api/meal-plan", async (req, res) => {
    try {
      const { shoppingItems } = req.body;
      const prompt = `
          Based on the following available ingredients from a shopping list: ${shoppingItems}.
          Please act as a nutritionist and create a comprehensive 1-day meal plan that adheres to the principles of a balanced diet.
          The meal plan should include breakfast, lunch, dinner, and one snack.
          Each meal should be balanced and nutritious.
          For each meal, provide:
          1. A creative recipe name.
          2. A list of ingredients with quantities.
          3. Detailed step-by-step preparation instructions.
          4. An estimated calorie count for the meal.
          Finally, provide the total estimated calorie count for the entire day.
          Ensure the response is in a structured JSON format.
      `;
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              mealPlan: {
                type: Type.ARRAY,
                description: "List of meals for the day.",
                items: {
                  type: Type.OBJECT,
                  properties: {
                    mealType: {
                      type: Type.STRING,
                      description: "Type of meal (e.g., Breakfast, Lunch, Dinner, Snack).",
                    },
                    recipeName: { type: Type.STRING, description: "The name of the recipe." },
                    ingredients: {
                      type: Type.ARRAY,
                      description: "List of ingredients for the recipe.",
                      items: { type: Type.STRING },
                    },
                    instructions: {
                      type: Type.STRING,
                      description: "Step-by-step preparation instructions.",
                    },
                    calories: {
                      type: Type.NUMBER,
                      description: "Estimated calorie count for the meal.",
                    },
                  },
                },
              },
              totalCalories: {
                type: Type.NUMBER,
                description: "Total estimated calories for the entire day.",
              },
            },
          },
        },
      });
      res.json({ text: response.text });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: (e as any).message });
    }
  });

  app.post("/api/report-summary", async (req, res) => {
    try {
      const { prompt } = req.body;
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
      });
      res.json({ text: response.text });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: (e as any).message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*all", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
