import dns from 'node:dns/promises';
import net from 'node:net';

function isPrivate(ip){
  if(net.isIP(ip)===4){
    const p=ip.split('.').map(Number);
    return p[0]===10||p[0]===127||(p[0]===169&&p[1]===254)||(p[0]===172&&p[1]>=16&&p[1]<=31)||(p[0]===192&&p[1]===168)||p[0]===0;
  }
  if(net.isIP(ip)===6){
    const x=ip.toLowerCase();
    return x==='::1'||x.startsWith('fc')||x.startsWith('fd')||x.startsWith('fe80:')||x==='::';
  }
  return true;
}

async function fetchPublicPage(rawUrl){
  const u=new URL(rawUrl);
  if(!['http:','https:'].includes(u.protocol)) throw new Error('http/https のURLを入力してください');
  const records=await dns.lookup(u.hostname,{all:true});
  if(!records.length||records.some(r=>isPrivate(r.address))) throw new Error('このURLは読み込めません');
  const r=await fetch(u.toString(),{redirect:'manual',headers:{'User-Agent':'Mozilla/5.0 ContentMakerAI/1.0'}});
  if(r.status>=300&&r.status<400) throw new Error('リダイレクト先のURLを入力してください');
  if(!r.ok) throw new Error(`ページ取得に失敗しました (${r.status})`);
  const type=r.headers.get('content-type')||'';
  if(!type.includes('text/html')&&!type.includes('text/plain')) throw new Error('Webページの文章を取得できませんでした');
  const html=(await r.text()).slice(0,350000);
  return html
    .replace(/<script[\s\S]*?<\/script>/gi,' ')
    .replace(/<style[\s\S]*?<\/style>/gi,' ')
    .replace(/<noscript[\s\S]*?<\/noscript>/gi,' ')
    .replace(/<[^>]+>/g,' ')
    .replace(/&nbsp;/g,' ')
    .replace(/&amp;/g,'&')
    .replace(/&quot;/g,'"')
    .replace(/&#39;/g,"'")
    .replace(/\s+/g,' ')
    .trim()
    .slice(0,50000);
}

function parseJson(text){
  const m=text.match(/\{[\s\S]*\}/);
  if(!m) throw new Error('解析結果を読み取れませんでした');
  return JSON.parse(m[0]);
}

export default async function handler(req,res){
  if(req.method!=='POST') return res.status(405).json({error:'Method not allowed'});
  const key=process.env.GEMINI_API_KEY;
  if(!key) return res.status(500).json({error:'GEMINI_API_KEY is not configured on Vercel.'});
  try{
    const {sourceType='paste',url='',text=''}=req.body||{};
    const source=sourceType==='url'?await fetchPublicPage(url):String(text||'').slice(0,50000);
    if(!source.trim()) return res.status(400).json({error:'解析する内容がありません'});
    const model=process.env.GEMINI_MODEL||'gemini-3.5-flash-lite';
    const prompt=`以下の事業・店舗・商品情報を、販促生成AIへ安全に渡すため構造化してください。\n重要: 書かれていない事実、価格、実績、口コミ、資格、数値を創作しない。推測は必ず inference に分離する。\nJSONだけ返してください。\n形式:\n{\n"doing":"何をしているか",\n"purpose":"目的・提供価値",\n"stance":"価値観・こだわり",\n"voice":"確認できた口コミ・実績のみ。なければ空文字",\n"extra":"特徴・強み・価格・場所・導線等の確認済み補足",\n"target":"明記されたターゲット。なければ空文字",\n"facts":["確認できた事実"],\n"inferences":["AIによるターゲット・悩み・欲求・訴求候補"],\n"missing":["精度を上げるため不足している情報"],\n"summary":"内容の短い要約"\n}\n\n【取得内容】\n${source}`;
    const r=await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`,{method:'POST',headers:{'Content-Type':'application/json','x-goog-api-key':key},body:JSON.stringify({contents:[{role:'user',parts:[{text:prompt}]}],generationConfig:{temperature:.35,maxOutputTokens:4096}})});
    const data=await r.json();
    if(!r.ok) return res.status(r.status).json({error:data?.error?.message||'解析に失敗しました'});
    const out=data?.candidates?.[0]?.content?.parts?.map(p=>p.text||'').join('')||'';
    return res.status(200).json(parseJson(out));
  }catch(e){
    console.error(e);
    return res.status(500).json({error:e?.message||'解析に失敗しました'});
  }
}
