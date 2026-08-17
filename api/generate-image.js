export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'GEMINI_API_KEY is not configured on Vercel.' });

  try {
    const { prompt, aspectRatio = '4:5', imageSize = '1K' } = req.body || {};
    if (!prompt || typeof prompt !== 'string') return res.status(400).json({ error: 'prompt is required' });

    const model = process.env.GEMINI_IMAGE_MODEL || 'gemini-3.1-flash-image';
    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/interactions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey
      },
      body: JSON.stringify({
        model,
        input: [{ type: 'text', text: prompt }],
        response_format: {
          type: 'image',
          mime_type: 'image/png',
          aspect_ratio: aspectRatio,
          image_size: imageSize
        }
      })
    });

    const data = await response.json();
    if (!response.ok) return res.status(response.status).json({ error: data?.error?.message || 'Gemini image request failed' });

    let imageBlock = null;
    for (const step of data?.steps || []) {
      if (step?.type !== 'model_output') continue;
      for (const block of step?.content || []) {
        if (block?.type === 'image' && block?.data) imageBlock = block;
      }
    }
    if (!imageBlock) return res.status(502).json({ error: 'Gemini returned no image.' });

    return res.status(200).json({ image: imageBlock.data, mimeType: imageBlock.mime_type || 'image/png', model });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error?.message || 'Unexpected server error' });
  }
}
