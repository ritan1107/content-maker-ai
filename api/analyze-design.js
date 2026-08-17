export default async function handler(req,res){
  if(req.method!=='POST') return res.status(405).json({error:'Method not allowed'});
  const key=process.env.GEMINI_API_KEY;
  if(!key) return res.status(500).json({error:'GEMINI_API_KEY is not configured on Vercel.'});
  try{
    const {imageData,mimeType='image/jpeg'}=req.body||{};
    if(!imageData) return res.status(400).json({error:'画像がありません'});
    if(!/^image\/(jpeg|png|webp)$/.test(mimeType)) return res.status(400).json({error:'JPEG / PNG / WebP を使用してください'});
    const base64=String(imageData).replace(/^data:[^;]+;base64,/, '');
    if(base64.length>8_000_000) return res.status(413).json({error:'画像サイズが大きすぎます'});
    const model=process.env.GEMINI_MODEL||'gemini-3.5-flash-lite';
    const prompt=`この参考画像をブランドの「デザインDNA」として分析してください。完全コピーではなく、再利用できるデザインルールに抽象化します。日本語で簡潔に返してください。\n\n次の見出しを必ず含める:\n【ブランド印象】\n【配色】\n【背景・質感】\n【カード・ボタン】\n【余白・レイアウト】\n【文字の雰囲気】\n【写真・イラスト】\n【動き・演出】\n【文章トーン】\n【画像プロンプトへ入れるデザイン指定】\n\nロゴや固有作品そのものをコピーする指示は避け、色・余白・質感・構図など一般的特徴として表現してください。`;
    const r=await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`,{method:'POST',headers:{'Content-Type':'application/json','x-goog-api-key':key},body:JSON.stringify({contents:[{role:'user',parts:[{text:prompt},{inlineData:{mimeType,data:base64}}]}],generationConfig:{temperature:.45,maxOutputTokens:2500}})});
    const data=await r.json();
    if(!r.ok) return res.status(r.status).json({error:data?.error?.message||'デザイン解析に失敗しました'});
    const text=data?.candidates?.[0]?.content?.parts?.map(p=>p.text||'').join('')||'';
    return res.status(200).json({text});
  }catch(e){
    console.error(e);
    return res.status(500).json({error:e?.message||'デザイン解析に失敗しました'});
  }
}
