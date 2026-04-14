import type { NextApiRequest, NextApiResponse } from 'next';

// Corrected to match the user's functional curl snippet
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { message, history = [] } = req.body;
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ message: 'API Key not configured in .env.local' });
  }

  try {
    const systemInstruction = "You are a professional healthcare assistant for 'HealthGap AI'. Provide helpful, concise medical guidance. Always include a disclaimer that you are an AI assistant and not a replacement for a professional doctor. If the situation is an emergency, advise calling emergency services immediately.";
    
    // Format contents for Gemini API
    const contents = [
      {
        role: "user",
        parts: [{ text: `System Instruction: ${systemInstruction}` }]
      },
      {
        role: "model",
        parts: [{ text: "Understood. I will act as a professional healthcare assistant for HealthGap AI and include necessary disclaimers." }]
      },
      ...history.map((msg: any) => ({
        role: msg.sender === 'Patient' ? 'user' : 'model',
        parts: [{ text: msg.text }]
      })),
      {
        role: "user",
        parts: [{ text: message }]
      }
    ];

    const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ contents }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error('Gemini API Error details:', JSON.stringify(data, null, 2));
      return res.status(response.status).json({ message: data.error?.message || 'Error from AI service' });
    }

    const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || "I'm sorry, I couldn't process that request.";
    
    res.status(200).json({ response: aiResponse });
  } catch (error) {
    console.error('Chat API Error:', error);
    res.status(500).json({ message: 'Internal Server Error during AI communication' });
  }
}


