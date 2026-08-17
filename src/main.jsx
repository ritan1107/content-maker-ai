import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { AlertCircle, CheckCircle2, Copy, FileText, History, Image as ImageIcon, Sparkles, Trash2, X, Zap } from 'lucide-react';
import './styles.css';

const formats=[['sales_letter','✉️','セールスレター'],['manga','🎨','漫画シナリオ'],['storyboard','🎬','動画絵コンテ'],['flyer','📄','チラシ構成案'],['pamphlet','📑','パンフレット'],['sns','📱','SNS投稿・興味付け'],['image','🖼️','画像プロンプト']];
const modes=[['basic','基本王道','定番の名著から選ぶ'],['legend','重厚・権威','巨匠の叡智を融合'],['book','書籍連携','任意の本を参考に'],['infinite','∞ 無限展開','5パターン一気生成']];
const refineOptions=[['headings','見出し提案'],['length','コンパクト要約'],['cta','CTA 3種提案'],['concrete','具体性アップ'],['strong','力強い表現に'],['legal','薬機法配慮']];
const ratios=['1:1','4:5','9:16','16:9'];
const imageStyles=['広告・アイキャッチ','やさしい手描き','写真風・リアル','アニメ・イラスト','高級・洗練','シンプル・ミニマル'];
const snsPlatforms=['Instagram','Threads','X','Facebook'];
const snsStages=[
  ['post','通常投稿','共感→興味付け→自然なCTA'],
  ['interest','興味付け投稿','続きを知りたくなる導線'],
  ['reply','興味ある人への返信','売り込み感を抑えた会話'],
  ['closing','クロージング','興味がある人の次の一歩を後押し']
];

function App(){
  const [formData,setFormData]=useState({doing:'',purpose:'',stance:'',voice:'',extra:'',target:''});
  const [mode,setMode]=useState('basic');
  const [basicType,setBasicType]=useState('A');
  const [bookName,setBookName]=useState('');
  const [outputFormat,setOutputFormat]=useState('sales_letter');
  const [activeTab,setActiveTab]=useState('ai');
  const [resultAi,setResultAi]=useState('');
  const [imagePrompt,setImagePrompt]=useState('');
  const [imageRatio,setImageRatio]=useState('4:5');
  const [imageStyle,setImageStyle]=useState('広告・アイキャッチ');
  const [snsPlatform,setSnsPlatform]=useState('Instagram');
  const [snsStage,setSnsStage]=useState('post');
  const [snsExtra,setSnsExtra]=useState('');
  const [history,setHistory]=useState([]);
  const [historyOpen,setHistoryOpen]=useState(false);
  const [loading,setLoading]=useState(false);
  const [error,setError]=useState('');
  const [toast,setToast]=useState('');

  useEffect(()=>{try{setHistory(JSON.parse(localStorage.getItem('contentMakerHistory')||'[]'))}catch{}},[]);
  const formatLabel=id=>formats.find(x=>x[0]===id)?.[2]||id;
  const modeLabel=id=>modes.find(x=>x[0]===id)?.[1]||id;
  const material=useMemo(()=>`【素材】\n①やっていること：${formData.doing||'（未入力）'}\n②目的：${formData.purpose||'（未入力）'}\n③スタンス・価値観：${formData.stance||'（未入力）'}\n④お客様の声：${formData.voice||'（未入力）'}\n⑤独自性・補足：${formData.extra||'（未入力）'}\n＋ターゲット：${formData.target||'（未入力）'}`,[formData]);
  const prompt=useMemo(()=>{
    if(outputFormat==='image'){
      return `あなたは画像生成AI向けプロンプト設計の専門家です。以下の素材から、画像生成AIにそのまま貼り付けて使える完成度の高い日本語プロンプトを1つ作ってください。画像そのものは生成しないでください。\n\n【指定】\nテイスト：${imageStyle}\nアスペクト比：${imageRatio}\n\n【必ず含める要素】\n・主役と場面\n・構図、カメラアングル、被写体の配置\n・表情、ポーズ、視線\n・背景と小物\n・色、光、質感、空気感\n・仕上がりのテイスト\n・画像内文字はユーザーが明示した場合のみ指定\n・不要な文字、ロゴ、透かしを入れない\n\n最後に「そのままコピペ用」として、説明を混ぜず1本の完成プロンプトを出してください。\n\n${material}\n\n追加の画像指示：${imagePrompt||'（なし）'}`;
    }
    if(outputFormat==='sns'){
      const stageLabel=snsStages.find(x=>x[0]===snsStage)?.[1]||snsStage;
      const stageGuide={
        post:'SNSの通常投稿。最初の1〜2行で目を止め、共感→気づき→価値→自然なCTAの順に構成する。',
        interest:'興味付け用。全部を説明しすぎず、相手が「それ何？」「もう少し知りたい」と感じる余白を残す。煽りや誇張はしない。',
        reply:'すでに反応・質問・DMをくれた人への返信。質問で相手の状況を聞き、押し売りせず、会話が続く自然な返答を3パターン作る。',
        closing:'すでに内容に興味を示している人へのクロージング。相手の不安を確認し、選択権を尊重しながら「話を聞く・詳細を見る・相談する」など次の一歩へつなぐ。強引な勧誘、期限の捏造、収入保証はしない。'
      }[snsStage];
      const platformGuide={
        Instagram:'読みやすい改行、保存・共感されやすい構成。必要なら短いハッシュタグ候補も付ける。',
        Threads:'会話感のある自然な文章。最初の一文を強くし、コメントしたくなる問いかけを入れる。',
        X:'短くテンポよく。結論や違和感を先に置き、必要なら140〜280字程度の短文版も作る。',
        Facebook:'人柄と背景が伝わる少し長めの文章。信頼感、体験、地域・つながりを意識する。'
      }[snsPlatform];
      return `あなたはSNS集客・コミュニケーション設計の専門家です。以下の素材をもとに、${snsPlatform}向けの「${stageLabel}」を作成してください。\n\n【目的】\n売り込み感を抑え、共感と信頼から自然に興味につなげること。相手の選択権を尊重し、誇大表現・収入保証・不自然な煽りは使わないこと。\n\n【媒体の特徴】\n${platformGuide}\n\n【今回の段階】\n${stageGuide}\n\n【出力】\n1. そのままコピペできる完成文\n2. 冒頭フックを3案\n3. CTAまたは次の返信を3案\n4. ${snsStage==='reply'||snsStage==='closing'?'相手の反応別に「前向き／迷っている／警戒している」の返し方を各1案':'投稿後にコメントやDMが来た時の自然な返答例を2案'}\n\n${material}\n\n追加指示：${snsExtra||'（なし）'}`;
    }
    const common='常時ON：Gary Halbertの人間味、Joseph Sugarmanの滑らかな展開、Eugene Schwartzの顧客意識レベル、Jeff Bloomfieldの安心と信頼。';
    const formatText={sales_letter:'セールスレター',manga:'販促用マンガのシナリオとコマ割り案',storyboard:'動画広告用の絵コンテ案',flyer:'紙のチラシ用構成案',pamphlet:'会社/商品パンフレット構成案'}[outputFormat];
    if(mode==='basic'){
      const type={A:'Cashvertisingの心理直撃型',B:'StoryBrandのストーリー型',C:'Fascinateの差別化型',D:'The Cheat Codeの発想ショートカット型'}[basicType];
      return `以下の素材をもとに「${formatText}」を作成してください。方向性：${type}。${common}\n\n${material}`;
    }
    if(mode==='legend') return `以下の素材をもとに「${formatText}」を作成してください。Dan Kennedy、Jay Abraham、Jeff Bloomfield、Joseph Sugarman、Gary Halbert、David Ogilvyの原理を融合し、具体性・信頼・読みやすさを重視してください。\n\n${material}`;
    if(mode==='book') return `「${bookName||'影響力の武器'}」の原理原則を参考に、以下の素材から「${formatText}」を作成してください。\n\n${material}`;
    return `以下の素材とターゲットに最適なアプローチを5つ選び、それぞれに基づく「${formatText}」を5パターン作成してください。\n\n${material}`;
  },[outputFormat,imageStyle,imageRatio,imagePrompt,snsPlatform,snsStage,snsExtra,material,mode,basicType,bookName]);

  const showToast=m=>{setToast(m);setTimeout(()=>setToast(''),2500)};
  const saveHistory=text=>{const item={id:String(Date.now()),date:new Date().toLocaleString('ja-JP',{month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'}),title:`${formatLabel(outputFormat)} (${modeLabel(mode)})`,state:{formData,mode,basicType,bookName,outputFormat,resultAi:text,prompt,imagePrompt,imageRatio,imageStyle,snsPlatform,snsStage,snsExtra}};const next=[item,...history].slice(0,50);setHistory(next);localStorage.setItem('contentMakerHistory',JSON.stringify(next));};
  const callAI=async p=>{const r=await fetch('/api/generate',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({prompt:p})});const d=await r.json();if(!r.ok)throw new Error(d.error||'生成に失敗しました');return d.text||'結果を取得できませんでした。';};
  const generate=async()=>{setLoading(true);setError('');setActiveTab('ai');try{const t=await callAI(prompt);setResultAi(t);saveHistory(t);showToast(outputFormat==='image'?'📝 画像プロンプトを作成しました':outputFormat==='sns'?'📱 SNS文を作成しました':'✨ 生成完了！履歴に保存しました');}catch(e){setError(e.message)}finally{setLoading(false)}};
  const refine=async type=>{if(!resultAi)return;const inst={headings:'見出しやセクションタイトルを5つ提案してください。',length:'魅力を損なわず全体を約7割に要約してください。',cta:'CTAを3種類提案してください。',concrete:'具体性を加えてください。事実でない数字は作らないでください。',strong:'曖昧語を減らし、明確で力強い表現にしてください。',legal:'薬機法・景品表示法等に配慮し、誇大表現を避けて修正してください。'}[type];setLoading(true);setError('');try{const t=await callAI(`【指示】${inst}\n\n【現在の出力】\n${resultAi}`);setResultAi(t);saveHistory(t);showToast('✨ 推敲完了')}catch(e){setError(e.message)}finally{setLoading(false)}};
  const copy=async text=>{try{await navigator.clipboard.writeText(text);showToast('📋 コピーしました')}catch{setError('コピーに失敗しました')}};
  const fillSample=()=>setFormData({doing:'北海道産エゾシカ革を使用した洗顔パフの製造・販売',purpose:'毎日の洗顔を癒やしの時間に変え、肌悩みを抱える人の選択肢を増やす',stance:'肌への優しさを重視し、自然な製法にこだわる',voice:'「肌触りが全然違う」「洗顔後が心地よい」などの感想',extra:'北海道の未活用資源を生かし、職人が手作業で仕上げる',target:'敏感肌や乾燥肌に悩む30〜40代の女性'});
  const loadItem=i=>{setFormData(i.state.formData);setMode(i.state.mode);setBasicType(i.state.basicType);setBookName(i.state.bookName);setOutputFormat(i.state.outputFormat);setResultAi(i.state.resultAi||'');setImagePrompt(i.state.imagePrompt||'');setImageRatio(i.state.imageRatio||'4:5');setImageStyle(i.state.imageStyle||'広告・アイキャッチ');setSnsPlatform(i.state.snsPlatform||'Instagram');setSnsStage(i.state.snsStage||'post');setSnsExtra(i.state.snsExtra||'');setActiveTab('ai');setHistoryOpen(false)};
  const deleteItem=id=>{const n=history.filter(i=>i.id!==id);setHistory(n);localStorage.setItem('contentMakerHistory',JSON.stringify(n))};

  return <div className="app">
    <header><div className="brand"><div className="logo"><Sparkles size={18}/></div><div><h1>コンテンツ & レター生成AI</h1><small>POWERED BY AI</small></div></div><div className="head-actions"><button className="ghost" onClick={fillSample}><FileText size={14}/>サンプル</button><button className="ghost" onClick={()=>setHistoryOpen(true)}><History size={14}/>履歴 ({history.length})</button></div></header>
    <main className="grid">
      <section className="card input-card"><div className="card-title"><span>1</span><div><b>素材の入力</b><small>空欄があっても大丈夫です</small></div></div><div className="fields">{[['doing','① やっていること','例：北海道産エゾシカ革の洗顔パフ販売'],['purpose','② 目的・実現したいこと','例：肌悩みを抱える人の選択肢を増やす'],['stance','③ スタンス・価値観','例：自然な製法にこだわる'],['voice','④ お客様の声・レビュー','例：「肌触りが全然違う！」'],['extra','⑤ 独自性・補足要素','例：地域性、職人手作業'],['target','＋ ターゲット詳細','例：敏感肌の30〜40代女性']].map(([k,l,p])=><label key={k}>{l}<textarea value={formData[k]} onChange={e=>setFormData({...formData,[k]:e.target.value})} placeholder={p}/></label>)}</div></section>
      <div className="right">
        <section className="card"><div className="card-title"><span className="gold">2</span><b>用途と設定</b></div><div className="pad"><p className="eyebrow">何を作成しますか？</p><div className="format-grid">{formats.map(([id,e,l])=><button key={id} className={outputFormat===id?'selected':''} onClick={()=>{setOutputFormat(id);setResultAi('')}}><i>{e}</i>{l}</button>)}</div>{outputFormat==='image'?<div className="image-settings"><p className="eyebrow">画像の追加指示</p><textarea value={imagePrompt} onChange={e=>setImagePrompt(e.target.value)} placeholder="例：白背景、手描き線画、文字なし、ピンク・黄色・ミント。人物はやさしい表情。"/><div className="image-options"><label>テイスト<select value={imageStyle} onChange={e=>setImageStyle(e.target.value)}>{imageStyles.map(v=><option key={v}>{v}</option>)}</select></label><label>比率<select value={imageRatio} onChange={e=>setImageRatio(e.target.value)}>{ratios.map(v=><option key={v}>{v}</option>)}</select></label></div><p className="mode-detail">画像そのものは生成せず、他の画像生成AIへそのまま貼れるプロンプトを作ります。</p></div>:outputFormat==='sns'?<div className="image-settings"><p className="eyebrow">SNSを選択</p><div className="image-options"><label>媒体<select value={snsPlatform} onChange={e=>setSnsPlatform(e.target.value)}>{snsPlatforms.map(v=><option key={v}>{v}</option>)}</select></label><label>目的<select value={snsStage} onChange={e=>setSnsStage(e.target.value)}>{snsStages.map(([id,l])=><option key={id} value={id}>{l}</option>)}</select></label></div><p className="eyebrow" style={{marginTop:14}}>追加指示</p><textarea value={snsExtra} onChange={e=>setSnsExtra(e.target.value)} placeholder="例：30代主婦向け、やさしく、売り込み感なし、まず話だけ聞いてみたいと思える感じ"/><div className="mode-detail"><p>{snsStages.find(x=>x[0]===snsStage)?.[2]}</p></div></div>:<><p className="eyebrow">アプローチ手法</p><div className="mode-grid">{modes.map(([id,l,d])=><button key={id} className={mode===id?'selected violet':''} onClick={()=>setMode(id)}><b>{l}</b><small>{d}</small></button>)}</div><div className="mode-detail">{mode==='basic'&&<select value={basicType} onChange={e=>setBasicType(e.target.value)}><option value="A">⚡ 心理直撃型 — Cashvertising</option><option value="B">📖 ストーリー型 — StoryBrand</option><option value="C">✨ 差別化型 — Fascinate</option><option value="D">🚀 発想ショートカット型 — The Cheat Code</option></select>}{mode==='legend'&&<p>歴代のマーケティング巨匠の原理を組み合わせて構成します。</p>}{mode==='book'&&<input value={bookName} onChange={e=>setBookName(e.target.value)} placeholder="参考にしたい書籍名・著者名"/>}{mode==='infinite'&&<p>ターゲットに合う5つのアプローチを選定し、5パターン生成します。</p>}</div></>}
        <button className="generate" onClick={generate} disabled={loading}><Zap size={20}/>{loading?(outputFormat==='image'?'プロンプト作成中…':outputFormat==='sns'?'SNS文を作成中…':'AIが執筆中…'):`${formatLabel(outputFormat)} を生成する`}</button></div></section>
        <section className="card output"><div className="tabs"><button className={activeTab==='ai'?'on':''} onClick={()=>setActiveTab('ai')}>✨ AI出力結果</button><button className={activeTab==='prompt'?'on':''} onClick={()=>setActiveTab('prompt')}>📝 プロンプト確認</button></div><div className="output-body">{activeTab==='prompt'?<><div className="result-head"><span>生成に使う指示</span><button className="copy" onClick={()=>copy(prompt)}><Copy size={13}/>コピー</button></div><textarea className="prompt" readOnly value={prompt}/></>:resultAi?<><div className="result-head"><span><CheckCircle2 size={15}/>{outputFormat==='image'?'画像プロンプト完成':outputFormat==='sns'?'SNS文完成':'完成'}</span><button className="copy" onClick={()=>copy(resultAi)}><Copy size={13}/>コピー</button></div><pre className="result">{resultAi}</pre>{outputFormat!=='image'&&<div className="refine"><p>✨ 仕上げの推敲</p><div>{refineOptions.map(([k,l])=><button disabled={loading} key={k} onClick={()=>refine(k)}>{l}</button>)}</div></div>}</>:<div className="empty"><ImageIcon size={32}/><p>{outputFormat==='image'?<>素材と画像の指示を入力して<br/>「画像プロンプトを生成する」を押してください</>:outputFormat==='sns'?<>SNSと目的を選んで<br/>「SNS投稿・興味付けを生成する」を押してください</>:<>素材を入力して<br/>生成ボタンを押してください</>}</p></div>}</div></section>
      </div>
    </main>
    {historyOpen&&<div className="overlay" onClick={()=>setHistoryOpen(false)}><aside onClick={e=>e.stopPropagation()}><div className="drawer-head"><b><History size={18}/>履歴 ({history.length})</b><button onClick={()=>setHistoryOpen(false)}><X/></button></div><div className="history-list">{history.length===0?<p className="empty-history">履歴はまだありません。</p>:history.map(i=><div className="history-item" key={i.id} onClick={()=>loadItem(i)}><div><span>{i.title}</span><small>{i.date}</small></div><p>{i.state.formData.doing||'内容未入力'}</p><button onClick={e=>{e.stopPropagation();deleteItem(i.id)}}><Trash2 size={15}/></button></div>)}</div></aside></div>}
    {toast&&<div className="toast"><CheckCircle2 size={16}/>{toast}</div>}
    {error&&<div className="error"><AlertCircle size={16}/>{error}<button onClick={()=>setError('')}>×</button></div>}
  </div>
}

createRoot(document.getElementById('root')).render(<App/>);
