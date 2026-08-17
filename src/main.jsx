import React,{useEffect,useMemo,useState}from'react';
import{createRoot}from'react-dom/client';
import{AlertCircle,Brain,CheckCircle2,ChevronDown,ClipboardPaste,Copy,FileText,Globe2,History,Image as ImageIcon,Save,Sparkles,Trash2,Upload,X,Zap}from'lucide-react';
import'./styles.css';

const formats=[['sales_letter','✉️','セールスレター'],['manga','🎨','漫画シナリオ'],['storyboard','🎬','動画絵コンテ'],['flyer','📄','チラシ構成案'],['pamphlet','📑','パンフレット'],['sns','📱','SNS投稿・興味付け'],['image','🖼️','画像プロンプト']];
const modes=[['basic','基本王道','定番の名著から選ぶ'],['legend','重厚・権威','巨匠の叡智を融合'],['book','書籍連携','任意の本を参考に'],['infinite','∞ 無限展開','5パターン一気生成']];
const ratios=['1:1','4:5','9:16','16:9'];
const imageStyles=['広告・アイキャッチ','やさしい手描き','写真風・リアル','アニメ・イラスト','高級・洗練','シンプル・ミニマル'];
const snsPlatforms=['Instagram','Threads','X','Facebook'];
const snsStages=[['post','通常投稿','共感→興味付け→自然なCTA'],['interest','興味付け','続きを知りたくなる導線'],['reply','興味ある人への返信','売り込み感を抑えた会話'],['closing','クロージング','次の一歩を自然に後押し']];
const emptyForm={doing:'',purpose:'',stance:'',voice:'',extra:'',target:''};

function App(){
 const[step,setStep]=useState(1),[intake,setIntake]=useState('url'),[sourceUrl,setSourceUrl]=useState(''),[sourceText,setSourceText]=useState('');
 const[formData,setFormData]=useState(emptyForm),[analysis,setAnalysis]=useState(null),[profiles,setProfiles]=useState([]),[profileName,setProfileName]=useState('');
 const[designDNA,setDesignDNA]=useState(''),[designPreview,setDesignPreview]=useState('');
 const[mode,setMode]=useState('basic'),[basicType,setBasicType]=useState('A'),[bookName,setBookName]=useState(''),[outputFormat,setOutputFormat]=useState('sales_letter');
 const[imagePrompt,setImagePrompt]=useState(''),[imageRatio,setImageRatio]=useState('4:5'),[imageStyle,setImageStyle]=useState('広告・アイキャッチ');
 const[snsPlatform,setSnsPlatform]=useState('Instagram'),[snsStage,setSnsStage]=useState('post'),[snsExtra,setSnsExtra]=useState('');
 const[resultAi,setResultAi]=useState(''),[history,setHistory]=useState([]),[historyOpen,setHistoryOpen]=useState(false),[loading,setLoading]=useState(false),[loadingText,setLoadingText]=useState(''),[error,setError]=useState(''),[toast,setToast]=useState('');
 useEffect(()=>{try{setHistory(JSON.parse(localStorage.getItem('contentMakerHistory')||'[]'));setProfiles(JSON.parse(localStorage.getItem('contentMakerProfiles')||'[]'))}catch{}},[]);
 const showToast=t=>{setToast(t);setTimeout(()=>setToast(''),2400)};
 const material=useMemo(()=>`【素材】\n①やっていること：${formData.doing||'（未入力）'}\n②目的：${formData.purpose||'（未入力）'}\n③スタンス・価値観：${formData.stance||'（未入力）'}\n④お客様の声・実績：${formData.voice||'（未入力）'}\n⑤独自性・補足：${formData.extra||'（未入力）'}\n＋ターゲット：${formData.target||'（未入力）'}${designDNA?`\n\n【デザインDNA】\n${designDNA}`:''}`,[formData,designDNA]);
 const cheatCore=`【チートシステム固定ルール】\n常時ON：Gary Halbertの人間味、Joseph Sugarmanの滑らかな展開、Eugene Schwartzの顧客意識レベル、Jeff Bloomfieldの安心と信頼。\n最初に「誰に／何を感じてもらい／次に何をしてほしいか／現在の心理段階」を内部で整理してから出力する。\n確認できない数値・実績・口コミ・資格・価格を創作しない。煽り、期限の捏造、収入保証、強引な勧誘を避ける。`;
 const prompt=useMemo(()=>{
  if(outputFormat==='image')return `あなたは一流のアートディレクター兼画像生成プロンプト設計者です。${cheatCore}\n以下の素材から、画像生成AIへそのまま貼れる日本語プロンプトを1本作成してください。画像そのものは生成しません。\n【指定】テイスト:${imageStyle}／比率:${imageRatio}\n主役、場面、構図、カメラ、表情、ポーズ、背景、小物、色、光、質感、空気感、余白、文字の扱いを具体化。不要なロゴ・透かし・無関係な文字は入れない。\n最後に「そのままコピペ用」だけを独立表示。\n${material}\n追加指示:${imagePrompt||'なし'}`;
  if(outputFormat==='sns'){
   const stage=snsStages.find(x=>x[0]===snsStage)?.[1]||snsStage;
   const guide={post:'共感→気づき→価値→自然なCTA。',interest:'全部を説明せず「もう少し知りたい」という余白を残す。',reply:'相手の状況を聞きながら会話を続ける。返信3案。',closing:'不安を確認し、選択権を尊重しながら次の一歩へ。'}[snsStage];
   const pg={Instagram:'見やすい改行。保存・共感されやすく。',Threads:'会話感。最初の一文を強く。',X:'短くテンポ良く。短文版も。',Facebook:'背景と人柄が伝わる信頼型。'}[snsPlatform];
   return `あなたはSNS集客・対話設計の専門家です。${cheatCore}\n${snsPlatform}向け「${stage}」を作成。媒体:${pg} 段階:${guide}\n出力:①そのままコピペ完成文 ②冒頭フック3案 ③CTA/次の返信3案 ④${snsStage==='reply'||snsStage==='closing'?'前向き／迷い／警戒それぞれの返し方':'コメント・DMへの自然な返答2案'}。\n${material}\n追加指示:${snsExtra||'なし'}`;
  }
  const label={sales_letter:'セールスレター',manga:'販促マンガのシナリオとコマ割り',storyboard:'動画広告の絵コンテ',flyer:'チラシ構成案',pamphlet:'パンフレット構成案'}[outputFormat];
  if(mode==='basic'){const type={A:'Cashvertisingの心理直撃型',B:'StoryBrandのストーリー型',C:'Fascinateの差別化型',D:'The Cheat Codeの発想ショートカット型'}[basicType];return `${cheatCore}\n以下から「${label}」を作成。方向性:${type}。\n${material}`}
  if(mode==='legend')return `${cheatCore}\nDan Kennedy、Jay Abraham、Jeff Bloomfield、Joseph Sugarman、Gary Halbert、David Ogilvyの原理を融合し「${label}」を作成。具体性・信頼・読みやすさ重視。\n${material}`;
  if(mode==='book')return `${cheatCore}\n「${bookName||'影響力の武器'}」の原理原則を参考に「${label}」を作成。\n${material}`;
  return `${cheatCore}\n素材とターゲットに最適なアプローチを5つ選び「${label}」を5パターン生成。\n${material}`;
 },[outputFormat,imageStyle,imageRatio,imagePrompt,snsPlatform,snsStage,snsExtra,material,mode,basicType,bookName]);
 async function callJson(url,body){const r=await fetch(url,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});const d=await r.json();if(!r.ok)throw new Error(d.error||'処理に失敗しました');return d}
 async function analyzeSource(){setLoading(true);setLoadingText(intake==='url'?'ホームページを読込中…':'内容を整理中…');setError('');try{const d=await callJson('/api/analyze',{sourceType:intake==='url'?'url':'paste',url:sourceUrl,text:sourceText});setAnalysis(d);setFormData({doing:d.doing||'',purpose:d.purpose||'',stance:d.stance||'',voice:d.voice||'',extra:d.extra||'',target:d.target||''});setStep(2);showToast('✨ 情報を整理しました')}catch(e){setError(e.message)}finally{setLoading(false);setLoadingText('')}}
 async function analyzeDesign(file){if(!file)return;setLoading(true);setLoadingText('トーン&マナーを解析中…');setError('');try{const reader=new FileReader();const data=await new Promise((ok,ng)=>{reader.onload=()=>ok(reader.result);reader.onerror=ng;reader.readAsDataURL(file)});setDesignPreview(data);const d=await callJson('/api/analyze-design',{imageData:data,mimeType:file.type||'image/jpeg'});setDesignDNA(d.text||'');showToast('🎨 デザインDNAを作成しました')}catch(e){setError(e.message)}finally{setLoading(false);setLoadingText('')}}
 function saveProfile(){const name=profileName.trim()||formData.doing.trim().slice(0,20)||'保存済み事業';const item={id:String(Date.now()),name,formData,designDNA,analysis};const next=[item,...profiles].slice(0,30);setProfiles(next);localStorage.setItem('contentMakerProfiles',JSON.stringify(next));setProfileName(name);showToast('💾 事業プロフィールを保存しました')}
 function loadProfile(p){setFormData(p.formData||emptyForm);setDesignDNA(p.designDNA||'');setAnalysis(p.analysis||null);setProfileName(p.name);setStep(2);showToast('📂 保存済み事業を読み込みました')}
 async function generate(){setLoading(true);setLoadingText('チートシステムで戦略を組み立て中…');setError('');try{const d=await callJson('/api/generate',{prompt});const t=d.text||'結果を取得できませんでした';setResultAi(t);const item={id:String(Date.now()),date:new Date().toLocaleString('ja-JP'),title:formats.find(x=>x[0]===outputFormat)?.[2]||outputFormat,text:t,state:{formData,designDNA,mode,basicType,bookName,outputFormat,imagePrompt,imageRatio,imageStyle,snsPlatform,snsStage,snsExtra}};const next=[item,...history].slice(0,50);setHistory(next);localStorage.setItem('contentMakerHistory',JSON.stringify(next));setStep(4);showToast('✨ 生成完了')}catch(e){setError(e.message)}finally{setLoading(false);setLoadingText('')}}
 async function refine(inst){if(!resultAi)return;setLoading(true);setLoadingText('仕上げを調整中…');try{const d=await callJson('/api/generate',{prompt:`【修正指示】${inst}\n\n【現在の文章】\n${resultAi}`});setResultAi(d.text||resultAi)}catch(e){setError(e.message)}finally{setLoading(false);setLoadingText('')}}
 const copy=async t=>{await navigator.clipboard.writeText(t);showToast('📋 コピーしました')};
 const deleteHistory=id=>{const n=history.filter(x=>x.id!==id);setHistory(n);localStorage.setItem('contentMakerHistory',JSON.stringify(n))};
 return <div className="app">
  <header><div className="brand"><div className="logo"><Sparkles size={20}/></div><div><h1>コンテンツ & レター生成AI</h1><small>CHEAT SYSTEM × AI</small></div></div><div className="head-actions"><button className="ghost" onClick={()=>{setStep(1);setAnalysis(null)}}>新規</button><button className="ghost" onClick={()=>setHistoryOpen(true)}><History size={15}/>履歴 {history.length}</button></div></header>
  <main className="shell">
   <section className="hero"><span>PREMIUM CREATIVE ASSISTANT</span><h2>{step===1?'今日は何を作りますか？':'素材を整えて、強い生成へ。'}</h2><p>情報収集 → AI整理 → チートシステム → 生成まで、迷わず進めます。</p><div className="progress">{[1,2,3,4].map(n=><i key={n} className={step>=n?'on':''}>{n}</i>)}</div></section>
   {step===1&&<section className="card intake"><div className="card-head"><Brain size={19}/><div><b>STEP 1｜素材を集める</b><small>入力を減らして精度を上げる</small></div></div><div className="pad">
    <div className="source-tabs"><button className={intake==='url'?'selected':''} onClick={()=>setIntake('url')}><Globe2/>URLから読込</button><button className={intake==='paste'?'selected':''} onClick={()=>setIntake('paste')}><ClipboardPaste/>文章を貼る</button><button className={intake==='saved'?'selected':''} onClick={()=>setIntake('saved')}><Save/>保存済み事業</button><button className={intake==='manual'?'selected':''} onClick={()=>setIntake('manual')}><FileText/>手入力</button></div>
    {intake==='url'&&<div className="input-panel"><label>ホームページURL</label><input value={sourceUrl} onChange={e=>setSourceUrl(e.target.value)} placeholder="https://example.com"/><button className="primary" onClick={analyzeSource} disabled={!sourceUrl||loading}><Sparkles/>情報を取得して自動整理</button></div>}
    {intake==='paste'&&<div className="input-panel"><label>HP・SNS・チラシなどの文章</label><textarea value={sourceText} onChange={e=>setSourceText(e.target.value)} placeholder="ここにまとめて貼り付けてOK"/><button className="primary" onClick={analyzeSource} disabled={!sourceText||loading}><Sparkles/>内容を解析して自動整理</button></div>}
    {intake==='saved'&&<div className="profile-grid">{profiles.length?profiles.map(p=><button key={p.id} className="profile-card" onClick={()=>loadProfile(p)}><Save size={17}/><b>{p.name}</b><small>{p.formData?.doing||'保存済み事業'}</small></button>):<div className="empty-mini">まだ保存済み事業はありません</div>}</div>}
    {intake==='manual'&&<button className="primary" onClick={()=>setStep(2)}><FileText/>手入力で進む</button>}
   </div></section>}
   {step>=2&&<section className="card"><div className="card-head"><CheckCircle2 size={19}/><div><b>STEP 2｜AI整理・確認</b><small>事実と推測を分けて確認</small></div></div><div className="pad split">
    <div className="fields">{[['doing','① やっていること'],['purpose','② 目的・実現したいこと'],['stance','③ スタンス・価値観'],['voice','④ お客様の声・実績'],['extra','⑤ 独自性・補足'],['target','⑥ ターゲット']].map(([k,l])=><label key={k}>{l}<textarea value={formData[k]} onChange={e=>setFormData({...formData,[k]:e.target.value})}/></label>)}</div>
    <div className="insights">{analysis&&<><div className="fact-box"><b>✓ 確認できた事実</b>{(analysis.facts||[]).slice(0,7).map((x,i)=><p key={i}>・{x}</p>)}</div><div className="infer-box"><b>✨ AI候補・推測</b>{(analysis.inferences||[]).slice(0,7).map((x,i)=><p key={i}>・{x}</p>)}</div>{analysis.missing?.length>0&&<div className="missing"><b>精度UPにあると良い情報</b>{analysis.missing.slice(0,5).map((x,i)=><p key={i}>・{x}</p>)}</div>}</>}
     <div className="save-profile"><input value={profileName} onChange={e=>setProfileName(e.target.value)} placeholder="保存名 例：山寳ラーメン"/><button onClick={saveProfile}><Save size={16}/>この事業を保存</button></div>
     <div className="design-dna"><b>🎨 デザインDNA</b><p>参考画像からトーン&マナーを抽出して、文章と画像プロンプトに反映。</p><label className="upload"><Upload size={17}/>参考画像を選ぶ<input type="file" accept="image/jpeg,image/png,image/webp" onChange={e=>analyzeDesign(e.target.files?.[0])}/></label>{designPreview&&<img src={designPreview} alt="参考"/>}<textarea value={designDNA} onChange={e=>setDesignDNA(e.target.value)} placeholder="解析結果・または手入力のトンマナ"/></div>
    </div>
   </div><div className="bottom-action"><button className="primary" onClick={()=>setStep(3)}>この内容で制作へ <ChevronDown size={18}/></button></div></section>}
   {step>=3&&<section className="card"><div className="card-head gold"><Zap size={19}/><div><b>STEP 3｜何を作る？</b><small>チートシステムは核として維持</small></div></div><div className="pad">
    <p className="eyebrow">制作物</p><div className="format-grid">{formats.map(x=><button key={x[0]} className={outputFormat===x[0]?'selected':''} onClick={()=>setOutputFormat(x[0])}><i>{x[1]}</i>{x[2]}</button>)}</div>
    {outputFormat==='sns'&&<div className="special"><div className="chips">{snsPlatforms.map(x=><button className={snsPlatform===x?'on':''} onClick={()=>setSnsPlatform(x)} key={x}>{x}</button>)}</div><div className="stage-grid">{snsStages.map(x=><button className={snsStage===x[0]?'on':''} onClick={()=>setSnsStage(x[0])} key={x[0]}><b>{x[1]}</b><small>{x[2]}</small></button>)}</div><textarea value={snsExtra} onChange={e=>setSnsExtra(e.target.value)} placeholder="追加指示：30代主婦向け、やさしく、地域感を出す…"/></div>}
    {outputFormat==='image'&&<div className="special"><div className="two"><label>テイスト<select value={imageStyle} onChange={e=>setImageStyle(e.target.value)}>{imageStyles.map(x=><option key={x}>{x}</option>)}</select></label><label>比率<select value={imageRatio} onChange={e=>setImageRatio(e.target.value)}>{ratios.map(x=><option key={x}>{x}</option>)}</select></label></div><textarea value={imagePrompt} onChange={e=>setImagePrompt(e.target.value)} placeholder="追加の画像指示"/></div>}
    <p className="eyebrow">アプローチ手法</p><div className="mode-grid">{modes.map(x=><button key={x[0]} className={mode===x[0]?'selected':''} onClick={()=>setMode(x[0])}><b>{x[1]}</b><small>{x[2]}</small></button>)}</div>
    {mode==='basic'&&<div className="cheat-types">{[['A','⚡心理直撃','Cashvertising'],['B','📖ストーリー','StoryBrand'],['C','💎差別化','Fascinate'],['D','🧠発想ショートカット','The Cheat Code']].map(x=><button className={basicType===x[0]?'on':''} onClick={()=>setBasicType(x[0])} key={x[0]}><b>{x[1]}</b><small>{x[2]}</small></button>)}</div>}
    {mode==='book'&&<input className="book" value={bookName} onChange={e=>setBookName(e.target.value)} placeholder="参考にする本の名前"/>}
    <div className="strategy"><Sparkles size={18}/><div><b>生成前の戦略</b><p>ターゲット・心理段階・訴求・避ける表現を内部整理してから、固定のチートシステムへ通します。</p></div></div>
    <button className="generate" onClick={generate} disabled={loading}><Zap/>{loading?'生成中…':'この内容で生成'}</button>
   </div></section>}
   {step>=4&&<section className="card output"><div className="card-head"><Sparkles size={19}/><div><b>STEP 4｜AI出力結果</b><small>そのまま使える・さらに磨ける</small></div></div><div className="pad"><div className="result-actions"><button onClick={()=>copy(resultAi)}><Copy size={16}/>コピー</button><button onClick={()=>refine('全体をもっと読みやすく、自然で親しみやすく整えてください。')}>やさしく</button><button onClick={()=>refine('興味付けを強めてください。ただし煽りや誇張は避けてください。')}>興味付けUP</button><button onClick={()=>refine('CTAを自然で選択権を尊重する3案に改善してください。')}>CTA改善</button></div><pre className="result">{resultAi}</pre><button className="primary secondary" onClick={()=>setStep(3)}>別の形式でも作る</button></div></section>}
  </main>
  {loading&&<div className="loading-layer"><div><Sparkles/><b>{loadingText||'AI処理中…'}</b><span>情報を整理して、最適な形にしています</span></div></div>}
  {historyOpen&&<div className="overlay" onClick={()=>setHistoryOpen(false)}><aside onClick={e=>e.stopPropagation()}><div className="drawer-head"><b><History/>履歴</b><button onClick={()=>setHistoryOpen(false)}><X/></button></div><div className="history-list">{history.map(h=><div className="history-item" key={h.id}><div onClick={()=>{setResultAi(h.text);setStep(4);setHistoryOpen(false)}}><b>{h.title}</b><small>{h.date}</small><p>{h.text.slice(0,90)}…</p></div><button onClick={()=>deleteHistory(h.id)}><Trash2 size={15}/></button></div>)}</div></aside></div>}
  {toast&&<div className="toast"><CheckCircle2 size={16}/>{toast}</div>}{error&&<div className="error"><AlertCircle size={17}/><span>{error}</span><button onClick={()=>setError('')}><X/></button></div>}
 </div>
}
createRoot(document.getElementById('root')).render(<App/>);
