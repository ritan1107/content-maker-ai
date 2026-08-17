import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { AlertCircle, CheckCircle2, Copy, FileText, History, Image, LayoutTemplate, Sparkles, Trash2, Video, X, Zap } from 'lucide-react';
import './styles.css';

const formats = [
  ['sales_letter','✉️','セールスレター'],['manga','🎨','漫画シナリオ'],['storyboard','🎬','動画絵コンテ'],['flyer','📄','チラシ構成案'],['pamphlet','📑','パンフレット']
];
const modes = [
  ['basic','基本王道','定番の名著から選ぶ'],['legend','重厚・権威','巨匠の叡智を融合'],['book','書籍連携','任意の本を参考に'],['infinite','∞ 無限展開','5パターン一気生成']
];
const refineOptions = [
  ['headings','見出し提案'],['length','コンパクト要約'],['cta','CTA 3種提案'],['concrete','具体性アップ'],['strong','力強い表現に'],['legal','薬機法配慮']
];

function App(){
  const [formData,setFormData]=useState({doing:'',purpose:'',stance:'',voice:'',extra:'',target:''});
  const [mode,setMode]=useState('basic');
  const [basicType,setBasicType]=useState('A');
  const [bookName,setBookName]=useState('');
  const [outputFormat,setOutputFormat]=useState('sales_letter');
  const [activeTab,setActiveTab]=useState('ai');
  const [resultAi,setResultAi]=useState('');
  const [history,setHistory]=useState([]);
  const [historyOpen,setHistoryOpen]=useState(false);
  const [loading,setLoading]=useState(false);
  const [error,setError]=useState('');
  const [toast,setToast]=useState('');

  useEffect(()=>{try{setHistory(JSON.parse(localStorage.getItem('contentMakerHistory')||'[]'))}catch{}},[]);
  const formatLabel=(id)=>formats.find(x=>x[0]===id)?.[2]||id;
  const modeLabel=(id)=>modes.find(x=>x[0]===id)?.[1]||id;

  const prompt=useMemo(()=>{
    const material=`【素材】\n①自分のやっていること：\n${formData.doing||'（未入力）'}\n\n②目的：\n${formData.purpose||'（未入力）'}\n\n③スタンス・価値観：\n${formData.stance||'（未入力）'}\n\n④お客様の声：\n${formData.voice||'（未入力）'}\n\n⑤独自性・補足：\n${formData.extra||'（未入力）'}\n\n＋ターゲット詳細：\n${formData.target||'（未入力）'}`;
    const common=`常時ONの要素：\n・Gary Halbert：人間味のあるコミュニケーション\n・Joseph Sugarman：次を読ませる滑らかな展開\n・Eugene Schwartz：顧客の意識レベルに合わせる\n・Jeff Bloomfield：安心と信頼を作る`;
    const formatText={sales_letter:'セールスレター',manga:'販促用マンガのシナリオとコマ割り案（ページ数・コマごとのセリフと描写）',storyboard:'動画広告用の絵コンテ案（秒数・画面描写・ナレーション/テロップ）',flyer:'紙のチラシ用構成案（表面・裏面のキャッチコピー、画像配置、テキスト構成）',pamphlet:'会社/商品パンフレット構成案（表紙、見開きごとの見出し、本文、図解・画像指示）'}[outputFormat];
    if(mode==='basic'){
      const type={A:'Drew Eric Whitman「Cashvertising」の心理直撃型',B:'Donald Miller「StoryBrand」のストーリー型',C:'Sally Hogshead「Fascinate」の差別化型',D:'Brian Wong「The Cheat Code」の発想ショートカット型'}[basicType];
      return `以下の素材をもとに「${formatText}」を作成してください。\n方向性：${type}\n${common}\n\n${material}`;
    }
    if(mode==='legend') return `以下の素材をもとに「${formatText}」を作成してください。Dan Kennedy、Jay Abraham、Jeff Bloomfield、Joseph Sugarman、Gary Halbert、David Ogilvyの原理を融合し、具体性・信頼・読みやすさを重視してください。\n${common}\n\n${material}`;
    if(mode==='book') return `「${bookName||'影響力の武器'}」の原理原則を参考に、以下の素材から「${formatText}」を作成してください。\n${common}\n\n${material}`;
    return `以下の素材とターゲットに最適なマーケティング/セールスライティングの本を5冊選び、それぞれの原理に基づく「${formatText}」を5パターン作成してください。各パターンに参考アプローチ名を明記してください。\n${common}\n\n${material}`;
  },[formData,mode,basicType,bookName,outputFormat]);

  const showToast=(m)=>{setToast(m);setTimeout(()=>setToast(''),2500)};
  const saveHistory=(text)=>{
    const item={id:String(Date.now()),date:new Date().toLocaleString('ja-JP',{month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'}),title:`${formatLabel(outputFormat)} (${modeLabel(mode)})`,state:{formData,mode,basicType,bookName,outputFormat,resultAi:text,prompt}};
    const next=[item,...history].slice(0,50); setHistory(next); localStorage.setItem('contentMakerHistory',JSON.stringify(next));
  };
  const callAI=async(p)=>{
    const r=await fetch('/api/generate',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({prompt:p})});
    const d=await r.json(); if(!r.ok) throw new Error(d.error||'生成に失敗しました'); return d.text||'結果を取得できませんでした。';
  };
  const generate=async()=>{setLoading(true);setError('');setActiveTab('ai');try{const t=await callAI(prompt);setResultAi(t);saveHistory(t);showToast('✨ 生成完了！履歴に保存しました')}catch(e){setError(e.message)}finally{setLoading(false)}};
  const refine=async(type)=>{if(!resultAi)return; const inst={headings:'見出しやセクションタイトルを5つ提案してください。',length:'魅力を損なわず全体を約7割に要約してください。',cta:'CTAを3種類提案してください。',concrete:'数字・固有名詞・情景などの具体性を加えてください。事実でない数字は作らないでください。',strong:'曖昧語を減らし、明確で力強い表現にしてください。',legal:'薬機法・景品表示法等に配慮し、誇大表現を避けて魅力的に修正してください。'}[type]; setLoading(true);setError('');try{const t=await callAI(`【指示】${inst}\n\n【現在の出力】\n${resultAi}`);setResultAi(t);saveHistory(t);showToast('✨ 推敲完了')}catch(e){setError(e.message)}finally{setLoading(false)}};
  const copy=async(text)=>{try{await navigator.clipboard.writeText(text);showToast('📋 コピーしました')}catch{setError('コピーに失敗しました')}};
  const fillSample=()=>setFormData({doing:'北海道産エゾシカ革を使用した洗顔パフの製造・販売',purpose:'毎日の洗顔を癒やしの時間に変え、肌悩みを抱える人の選択肢を増やす',stance:'肌への優しさを重視し、自然な製法にこだわる',voice:'「肌触りが全然違う」「洗顔後が心地よい」などの感想',extra:'北海道の未活用資源を生かし、職人が手作業で仕上げる',target:'敏感肌や乾燥肌に悩む30〜40代の女性'});
  const loadItem=(i)=>{setFormData(i.state.formData);setMode(i.state.mode);setBasicType(i.state.basicType);setBookName(i.state.bookName);setOutputFormat(i.state.outputFormat);setResultAi(i.state.resultAi);setActiveTab('ai');setHistoryOpen(false)};
  const deleteItem=(id)=>{const n=history.filter(i=>i.id!==id);setHistory(n);localStorage.setItem('contentMakerHistory',JSON.stringify(n))};

  return <div className="app">
    <header><div className="brand"><div className="logo"><Sparkles size={18}/></div><div><h1>コンテンツ & レター生成AI</h1><small>POWERED BY AI</small></div></div><div className="head-actions"><button className="ghost" onClick={fillSample}><FileText size={14}/>サンプル</button><button className="ghost" onClick={()=>setHistoryOpen(true)}><History size={14}/>履歴 ({history.length})</button></div></header>
    <main className="grid">
      <section className="card input-card"><div className="card-title"><span>1</span><div><b>素材の入力</b><small>空欄があっても大丈夫です</small></div></div><div className="fields">
        {[['doing','① やっていること','例：北海道産エゾシカ革の洗顔パフ販売'],['purpose','② 目的・実現したいこと','例：肌悩みを抱える人の選択肢を増やす'],['stance','③ スタンス・価値観','例：自然な製法にこだわる'],['voice','④ お客様の声・レビュー','例：「肌触りが全然違う！」'],['extra','⑤ 独自性・補足要素','例：地域性、職人手作業'],['target','＋ ターゲット詳細','例：敏感肌の30〜40代女性']].map(([k,l,p])=><label key={k}>{l}<textarea value={formData[k]} onChange={e=>setFormData({...formData,[k]:e.target.value})} placeholder={p}/></label>)}
      </div></section>
      <div className="right">
        <section className="card"><div className="card-title"><span className="gold">2</span><b>用途と設定</b></div><div className="pad"><p className="eyebrow">何を作成しますか？</p><div className="format-grid">{formats.map(([id,e,l])=><button key={id} className={outputFormat===id?'selected':''} onClick={()=>setOutputFormat(id)}><i>{e}</i>{l}</button>)}</div><p className="eyebrow">アプローチ手法</p><div className="mode-grid">{modes.map(([id,l,d])=><button key={id} className={mode===id?'selected violet':''} onClick={()=>setMode(id)}><b>{l}</b><small>{d}</small></button>)}</div><div className="mode-detail">{mode==='basic'&&<select value={basicType} onChange={e=>setBasicType(e.target.value)}><option value="A">⚡ 心理直撃型 — Cashvertising</option><option value="B">📖 ストーリー型 — StoryBrand</option><option value="C">✨ 差別化型 — Fascinate</option><option value="D">🚀 発想ショートカット型 — The Cheat Code</option></select>}{mode==='legend'&&<p>歴代のマーケティング巨匠の原理を組み合わせて構成します。</p>}{mode==='book'&&<input value={bookName} onChange={e=>setBookName(e.target.value)} placeholder="参考にしたい書籍名・著者名"/>}{mode==='infinite'&&<p>ターゲットに合う5つのアプローチを選定し、5パターン生成します。</p>}</div><button className="generate" onClick={generate} disabled={loading}><Zap size={20}/>{loading?'AIが執筆中…':`${formatLabel(outputFormat)} を生成する`}</button></div></section>
        <section className="card output"><div className="tabs"><button className={activeTab==='ai'?'on':''} onClick={()=>setActiveTab('ai')}>✨ AI出力結果</button><button className={activeTab==='prompt'?'on':''} onClick={()=>setActiveTab('prompt')}>📝 プロンプト確認</button></div><div className="output-body">{activeTab==='ai'?(resultAi?<><div className="result-head"><span><CheckCircle2 size={15}/>完成</span><button className="copy" onClick={()=>copy(resultAi)}><Copy size={13}/>コピー</button></div><pre className="result">{resultAi}</pre><div className="refine"><p>✨ 仕上げの推敲</p><div>{refineOptions.map(([k,l])=><button disabled={loading} key={k} onClick={()=>refine(k)}>{l}</button>)}</div></div></>:<div className="empty"><Image size={32}/><p>素材を入力して<br/>生成ボタンを押してください</p></div>):<><div className="result-head"><span>ChatGPT等の外部AIでも使えます</span><button className="copy" onClick={()=>copy(prompt)}><Copy size={13}/>コピー</button></div><textarea className="prompt" readOnly value={prompt}/></>}</div></section>
      </div>
    </main>
    {historyOpen&&<div className="overlay" onClick={()=>setHistoryOpen(false)}><aside onClick={e=>e.stopPropagation()}><div className="drawer-head"><b><History size={18}/>履歴 ({history.length})</b><button onClick={()=>setHistoryOpen(false)}><X/></button></div><div className="history-list">{history.length===0?<p className="empty-history">履歴はまだありません。</p>:history.map(i=><div className="history-item" key={i.id} onClick={()=>loadItem(i)}><div><span>{i.title}</span><small>{i.date}</small></div><p>{i.state.formData.doing||'内容未入力'}</p><button onClick={e=>{e.stopPropagation();deleteItem(i.id)}}><Trash2 size={15}/></button></div>)}</div></aside></div>}
    {toast&&<div className="toast"><CheckCircle2 size={16}/>{toast}</div>}
    {error&&<div className="error"><AlertCircle size={16}/>{error}<button onClick={()=>setError('')}>×</button></div>}
  </div>
}

createRoot(document.getElementById('root')).render(<App/>);
