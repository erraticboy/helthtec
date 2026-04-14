import type { NextApiRequest, NextApiResponse } from 'next';

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { symptoms, name, age } = req.body;
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ message: 'API Key not configured in .env.local' });
  }

  try {
    const prompt = `You are a professional medical assistant drafting a prescription for a doctor to review. 
    PATIENT CONTEXT:
    Name: ${name || 'N/A'}
    Age: ${age || 'N/A'}
    Current Symptoms/Problem: ${symptoms}

    Based on the age and symptoms, suggest appropriate medications. 
    Return ONLY a JSON array of objects. 
    Each object must have: "name", "dosage", and "instructions".
    Ensure dosages are age-appropriate.
    Do not include any other text or disclaimers. 
    Example format: [{"name": "Paracetamol", "dosage": "500m", "instructions": "Twice a day after meals"}]`;
    
    const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          role: "user",
          parts: [{ text: prompt }]
        }]
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      return res.status(response.status).json({ message: data.error?.message || 'AI service error' });
    }

    const aiResponseText = data.candidates?.[0]?.content?.parts?.[0]?.text || "[]";
    
    // Clean up potential markdown formatting from AI
    const cleanedJson = aiResponseText.replace(/```json|```/g, '').trim();
    
    try {
      const medicines = JSON.parse(cleanedJson);
      res.status(200).json({ medicines });
    } catch (parseError) {
      console.error('Parse error:', aiResponseText);
      res.status(200).json({ medicines: [], raw: aiResponseText });
    }
  } catch (error) {
    console.error('AI API Error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}
