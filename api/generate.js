import { STORYBOARD_MODULE } from './storyboard-module.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'GEMINI_API_KEY is not configured on Vercel.' });
  }

  try {
    const { prompt, systemInstruction } = req.body || {};
    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ error: 'prompt is required' });
    }

    const model = process.env.GEMINI_MODEL || 'gemini-3.5-flash-lite';
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`;
    const isStoryboard = /動画絵コンテ|絵コンテ|storyboard/i.test(prompt);
    const baseInstruction = systemInstruction || 'あなたは世界最高峰のセールスライター、マーケター、そしてクリエイティブディレクターです。ユーザーの指示に従い、指定された用途に合わせて魅力的で実用的な日本語の構成・テキストを作成してください。誇大表現を避け、事実として確認できない数値や体験談は創作しないでください。';
    const mergedInstruction = isStoryboard
      ? `${baseInstruction}\n\n${STORYBOARD_MODULE}`
      : baseInstruction;

    const payload = {
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      systemInstruction: {
        parts: [{ text: mergedInstruction }]
      },
      generationConfig: {
        temperature: isStoryboard ? 0.82 : 0.9,
        maxOutputTokens: isStoryboard ? 16384 : 8192
      }
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    if (!response.ok) {
      return res.status(response.status).json({ error: data?.error?.message || 'Gemini API request failed' });
    }

    const text = data?.candidates?.[0]?.content?.parts?.map(p => p.text || '').join('') || '';
    return res.status(200).json({ text });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error?.message || 'Unexpected server error' });
  }
}
