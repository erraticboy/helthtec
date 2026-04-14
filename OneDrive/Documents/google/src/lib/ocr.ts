import { createWorker } from 'tesseract.js';

export const performOCR = async (imageFile: File, onProgress?: (message: string) => void) => {
  try {
    const worker = await createWorker('eng', 1, {
      logger: m => {
        if (m.status === 'recognizing text') {
          onProgress?.(`Recognizing: ${Math.round(m.progress * 100)}%`);
        } else {
          onProgress?.(m.status);
        }
      }
    });
    
    const { data: { text } } = await worker.recognize(imageFile);
    await worker.terminate();
    
    return text;
  } catch (error) {
    console.error('OCR Error:', error);
    throw error;
  }
};

export const classifyReport = (text: string) => {
  const categories = {
    'Emergency': ['urgent', 'emergency', 'bleeding', 'accident', 'unconscious', 'severe'],
    'Maternal Care': ['pregnant', 'maternal', 'delivery', 'anc', 'labor'],
    'Chronic Illness': ['diabetes', 'bp', 'hypertension', 'insulin', 'chronic'],
    'General': []
  };

  const lowerText = text.toLowerCase();
  for (const [category, keywords] of Object.entries(categories)) {
    if (keywords.some(k => lowerText.includes(k))) return category;
  }
  return 'General';
};
