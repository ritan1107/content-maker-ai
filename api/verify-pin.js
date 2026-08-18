import crypto from 'crypto';

const EXPECTED_HASH = '88fc59a805d7e8ae29950352e81f12aa45496b4f026002d4911e8fa7e75ff275';

export default function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ ok: false });
  const pin = String(req.body?.pin || '');
  const hash = crypto.createHash('sha256').update(pin).digest('hex');
  const a = Buffer.from(hash);
  const b = Buffer.from(EXPECTED_HASH);
  const ok = a.length === b.length && crypto.timingSafeEqual(a, b);
  if (!ok) return res.status(401).json({ ok: false, message: '暗証番号が違います' });
  return res.status(200).json({ ok: true });
}
