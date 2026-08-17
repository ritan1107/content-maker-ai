const cleanHtml = (html='') => html
  .replace(/<script[\s\S]*?<\/script>/gi,' ')
  .replace(/<style[\s\S]*?<\/style>/gi,' ')
  .replace(/<noscript[\s\S]*?<\/noscript>/gi,' ')
  .replace(/<[^>]+>/g,' ')
  .replace(/&nbsp;/g,' ')
  .replace(/&amp;/g,'&')
  .replace(/&quot;/g,'"')
  .replace(/&#39;/g,"'")
  .replace(/\s+/g,' ')
  .trim();

export default async function handler(req,res){
  if(req.method!=='POST') return res.status(405).json({error:'Method not allowed'});
  const apiKey=process.env.GEMINI_API_KEY;
  if(!apiKey) return res.status(500).json({error:'GEMINI_API_KEY is not configured on Vercel.'});
  try{
    const {url,pastedText=''}=req.body||{};
    let source='';
    let sourceType='pasted';
    if(url){
      let parsed;
      try{parsed=new URL(url)}catch{return res.status(400).json({error:'URLの形式を確認してください。'});}
      if(!['http:','https:'].includes(parsed.protocol)) return res.status(400).json({error:'http/https のURLのみ利用できます。'});
      const r=await fetch(parsed.toString(),{headers:{'User-Agent':'Mozilla/5.0 ContentMakerAI/1.0'},redirect:'follow'});
      if(!r.ok) return res.status(400).json({error:`ページを取得できませんでした (${r.status})。文章コピペ解析をお試しください。`});
      const html=await r.text();
      source=cleanHtml(html).slice(0,24000);
      sourceType='url';
    } else {
      source=String(pastedText).trim().slice(0,24000);
    }
    if(!source) return res.status(400).json({error:'URLまたは解析する文章を入力してください。'});

    const model=process.env.GEMINI_MODEL||'gemini-3.5-flash-lite';
    const endpoint=`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`;
    const prompt=`以下はホームページ・SNS・チラシ等から取得した原文です。後段の「チートシステム」の強いプロンプトを変更せず最大限活かせるよう、素材だけを整理してください。\n\n重要ルール:\n- 原文にある事実とAIの推測を絶対に混ぜない。\n- 売上、効果、実績、口コミ、資格、価格などを創作しない。\n- 不明な項目は空文字にする。\n- targetGuess, painGuess, desireGuess は推測なので、原文から妥当な候補だけ簡潔に出す。\n- JSON以外を出力しない。\n\n次のJSON形式:\n{"doing":"事業・商品・サービス内容","purpose":"目的・実現したいこと（明記がある場合）","stance":"価値観・こだわり","voice":"実在するお客様の声・レビューのみ","extra":"強み・独自性・地域性・実績など確認できる情報","target":"明記されている対象顧客","targetGuess":"想定ターゲット候補","painGuess":"想定される悩み候補","desireGuess":"想定される願望候補","factsSummary":"確認できた重要事実の短い要約","missing":"生成精度を上げるため不足している情報"}\n\n【原文】\n${source}`;
    const gr=await fetch(endpoint,{method:'POST',headers:{'Content-Type':'application/json','x-goog-api-key':apiKey},body:JSON.stringify({contents:[{role:'user',parts:[{text:prompt}]}],generationConfig:{temperature:0.2,maxOutputTokens:4096,responseMimeType:'application/json'}})});
    const data=await gr.json();
    if(!gr.ok) return res.status(gr.status).json({error:data?.error?.message||'解析に失敗しました'});
    const text=data?.candidates?.[0]?.content?.parts?.map(p=>p.text||'').join('')||'{}';
    let analysis; try{analysis=JSON.parse(text)}catch{return res.status(502).json({error:'解析結果の読み込みに失敗しました。もう一度お試しください。'});}
    return res.status(200).json({analysis,sourceType});
  }catch(e){console.error(e);return res.status(500).json({error:e?.message||'Unexpected server error'});}
}
