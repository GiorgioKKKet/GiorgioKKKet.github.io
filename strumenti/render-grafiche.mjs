// Render di personaggi, boss, acquistabili di "Difendi la birra" e mappe, con draw call e triangoli di ciascuno.
// Uso (dalla cartella del progetto):  node strumenti/render-grafiche.mjs
// Serve Google Chrome installato (percorso diverso: variabile CHROME). Scrive le immagini in Grafiche/ e l'indice Grafiche/README.md.
import http from 'http'; import fs from 'fs'; import path from 'path'; import os from 'os'; import { spawn } from 'child_process'; import { fileURLToPath } from 'url';
const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..'), OUT=path.join(ROOT,'Grafiche');
const CHROME=process.env.CHROME||['C:/Program Files/Google/Chrome/Application/chrome.exe','/Applications/Google Chrome.app/Contents/MacOS/Google Chrome','/usr/bin/google-chrome'].find(p=>fs.existsSync(p));
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const slug=s=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^A-Za-z0-9]+/g,'-').replace(/^-|-$/g,'').toLowerCase();

// server statico della cartella del gioco
const MIME={'.html':'text/html','.js':'text/javascript','.png':'image/png','.webmanifest':'application/manifest+json'};
const srv=http.createServer((q,r)=>{ const f=path.join(ROOT,decodeURIComponent(q.url.split('?')[0])==='/'?'index.html':decodeURIComponent(q.url.split('?')[0]));
  if(!f.startsWith(ROOT)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){ r.writeHead(404); return r.end(); } r.writeHead(200,{'Content-Type':MIME[path.extname(f)]||'application/octet-stream'}); fs.createReadStream(f).pipe(r); });
await new Promise(r=>srv.listen(0,'127.0.0.1',r)); const PORT=srv.address().port;
const prof=fs.mkdtempSync(path.join(os.tmpdir(),'bdm-render-')), DBG=9300+Math.floor(Math.random()*500);
const ch=spawn(CHROME,['--headless=new',`--remote-debugging-port=${DBG}`,`--user-data-dir=${prof}`,'--use-angle=swiftshader','--enable-unsafe-swiftshader','--hide-scrollbars','about:blank'],{stdio:'ignore'});
let tabs; for(let i=0;i<60;i++){ try{ tabs=await (await fetch(`http://127.0.0.1:${DBG}/json`)).json(); break; }catch(e){ await sleep(250); } }
const ws=new WebSocket(tabs.find(x=>x.type==='page').webSocketDebuggerUrl); await new Promise(r=>ws.onopen=r);
let id=0; const pend=new Map(), errs=[];
ws.onmessage=e=>{ const m=JSON.parse(e.data); if(m.id&&pend.has(m.id)){ pend.get(m.id)(m); pend.delete(m.id); } if(m.method==='Runtime.exceptionThrown') errs.push(m.params.exceptionDetails.exception?.description); };
const send=(method,params={})=>new Promise(r=>{ const i=++id; pend.set(i,r); ws.send(JSON.stringify({id:i,method,params})); });
const ev=async ex=>{ const r=await send('Runtime.evaluate',{expression:ex,returnByValue:true,awaitPromise:true}); if(r.result.exceptionDetails) throw new Error(r.result.exceptionDetails.exception?.description); return r.result.result.value; };
const done=()=>{ try{ws.close();}catch(_){} ch.kill(); srv.close(); try{fs.rmSync(prof,{recursive:true,force:true});}catch(_){} };

try{
await send('Runtime.enable'); await send('Page.enable');
await send('Emulation.setDeviceMetricsOverride',{width:1600,height:1000,deviceScaleFactor:1,mobile:false});
await send('Page.navigate',{url:`http://127.0.0.1:${PORT}/index.html`}); await sleep(6000);

// ---------- modelli: renderer a parte, sfondo sfumato e didascalia con le misure ----------
await ev(`(()=>{ if(typeof titleOn!=='undefined'&&titleOn) titleClose();
  const S=1024, r=new THREE.WebGLRenderer({antialias:true,alpha:true,preserveDrawingBuffer:true}); r.setPixelRatio(1); r.setSize(S,S,false);
  r.outputEncoding=THREE.sRGBEncoding; r.toneMapping=THREE.ACESFilmicToneMapping; r.toneMappingExposure=1.1; r.setClearColor(0,0);
  r.shadowMap.enabled=true; r.shadowMap.type=THREE.PCFSoftShadowMap;
  const sc=new THREE.Scene(); sc.add(new THREE.HemisphereLight(0xffffff,0x6a6f88,.95));
  const key=new THREE.DirectionalLight(0xffffff,1.15); key.position.set(3,6,5); key.castShadow=true; key.shadow.mapSize.set(2048,2048); key.shadow.bias=-.0005; key.shadow.normalBias=.02; sc.add(key,key.target);
  const rim=new THREE.DirectionalLight(0xcfe3ff,.45); rim.position.set(-4,3,-4); sc.add(rim);
  const floor=new THREE.Mesh(new THREE.PlaneGeometry(200,200),new THREE.ShadowMaterial({opacity:.28})); floor.rotation.x=-Math.PI/2; floor.receiveShadow=true; sc.add(floor);
  const cam=new THREE.PerspectiveCamera(26,1,.05,500);
  // misure del modello cosi' come sta in partita: mesh visibili = draw call (passata colore); quelle che fanno ombra si ridisegnano nella mappa delle ombre
  const stat=g=>{ let dc=0,sh=0,tri=0; g.updateMatrixWorld(true); g.traverseVisible(o=>{ if(!(o.isMesh||o.isSprite||o.isLine||o.isPoints)) return; dc++; if(o.isMesh&&o.castShadow) sh++;
    const gg=o.geometry; if(o.isMesh&&gg){ const n=(gg.index?gg.index.count:gg.attributes.position.count)/3; tri+=n*(o.isInstancedMesh?o.count:1); } }); return {dc,sh,tri:Math.round(tri)}; };
  window.__R={S,r,sc,cam,key,floor,stat,
    shot(o,title,sub){ const s=stat(o); sc.add(o); o.updateMatrixWorld(true);
      // ingombro: per le InstancedMesh conta ogni istanza (il bounding box della geometria e' quello di un solo cubetto)
      const bb=new THREE.Box3(), im=new THREE.Matrix4(); o.traverseVisible(c=>{ if(!(c.isMesh&&c.geometry)) return; c.geometry.computeBoundingBox(); const g0=c.geometry.boundingBox;
        if(c.isInstancedMesh){ for(let i=0;i<c.count;i++){ c.getMatrixAt(i,im); im.premultiply(c.matrixWorld); const b=g0.clone().applyMatrix4(im); if(isFinite(b.min.x)) bb.union(b); } }
        else { const b=g0.clone().applyMatrix4(c.matrixWorld); if(isFinite(b.min.x)) bb.union(b); } });
      const c=bb.getCenter(new THREE.Vector3()), sz=bb.getSize(new THREE.Vector3()), R=sz.length()*.5+.0001;   // sfera che contiene tutto il modello: non esce mai dall'inquadratura
      floor.position.y=bb.min.y+.001; const d=R/Math.sin(THREE.MathUtils.degToRad(13))*1.06, dir=new THREE.Vector3(.55,.42,1).normalize();
      cam.position.copy(c).addScaledVector(dir,d); cam.near=d/50; cam.far=d*10; cam.updateProjectionMatrix(); cam.lookAt(c);
      const kc=key.shadow.camera; kc.left=-R*1.6; kc.right=R*1.6; kc.top=R*1.6; kc.bottom=-R*1.6; kc.near=.1; kc.far=R*20; kc.updateProjectionMatrix();
      key.position.copy(c).add(new THREE.Vector3(R*2.5,R*5,R*3.5)); key.target.position.copy(c);
      r.render(sc,cam); sc.remove(o);
      const cv=document.createElement('canvas'); cv.width=S; cv.height=S+120; const g=cv.getContext('2d');
      const gr=g.createLinearGradient(0,0,0,S); gr.addColorStop(0,'#3a4670'); gr.addColorStop(1,'#151a2c'); g.fillStyle=gr; g.fillRect(0,0,S,S);
      const rg=g.createRadialGradient(S/2,S*.58,20,S/2,S*.58,S*.55); rg.addColorStop(0,'rgba(255,255,255,.16)'); rg.addColorStop(1,'rgba(255,255,255,0)'); g.fillStyle=rg; g.fillRect(0,0,S,S);
      g.drawImage(r.domElement,0,0); g.fillStyle='#0e1220'; g.fillRect(0,S,S,120);
      // il titolo si rimpicciolisce se non c'entra accanto alla scritta di destra
      g.font='700 22px ui-monospace,Menlo,monospace'; const subW=sub?g.measureText(sub).width+24:0; let fsz=44;
      do{ g.font='900 '+fsz+'px ui-monospace,Menlo,monospace'; }while(g.measureText(title).width>S-56-subW&&(fsz-=2)>20);
      g.fillStyle='#ffd54f'; g.textBaseline='top'; g.fillText(title,28,S+14+(44-fsz)/2);
      g.fillStyle='#e8ecf8'; g.font='700 28px ui-monospace,Menlo,monospace'; g.fillText(s.dc+' draw call (+'+s.sh+' ombre) · '+s.tri.toLocaleString('it-IT')+' triangoli',28,S+70);
      if(sub){ g.fillStyle='#9aa6c8'; g.font='700 22px ui-monospace,Menlo,monospace'; g.textAlign='right'; g.fillText(sub,S-28,S+22); g.textAlign='left'; }
      o.traverse(m=>{ if(m.geometry&&m.userData.own) m.geometry.dispose(); });
      return {...s,png:cv.toDataURL('image/webp',.9)}; } };
  return true; })()`);

const save=(dir,name,png)=>{ const f=path.join(OUT,dir,slug(name)+'.webp'); fs.mkdirSync(path.dirname(f),{recursive:true}); fs.writeFileSync(f,Buffer.from(png.split(',')[1],'base64')); return path.basename(f); };
const res={Personaggi:[],Boss:[],Acquistabili:[],Nemici:[],Mappe:[]};

const nC=await ev('CHARS.length');
for(let i=0;i<nC;i++){ const o=await ev(`(()=>{ const ch=CHARS[${i}], g=new THREE.Group(); const m=VOXB.has(ch.n)?VOXB.build(ch,g):buildChar(ch,g); shadowize(g); mergeStatic(g,true);
    const o=__R.shot(g,ch.n.toUpperCase(),'vita '+ch.hp+' · vel. '+ch.spd); return {n:ch.n,...o}; })()`);
  res.Personaggi.push({n:o.n,f:save('Personaggi',o.n,o.png),dc:o.dc,sh:o.sh,tri:o.tri}); process.stdout.write('.'); }

const bk=await ev('Object.keys(BOSSES)');
for(const k of bk){ const o=await ev(`(()=>{ const B=BOSSES['${k}'], m=B.mk(), g=new THREE.Group(); g.add(m.g); shadowize(m.g); mergeStatic(m.g,true);
    const o=__R.shot(g,B.name,'vita base '+B.hp+' · dall\\'ondata '+B.min); return {n:B.name,...o}; })()`);
  res.Boss.push({n:o.n,f:save('Boss',o.n,o.png),dc:o.dc,sh:o.sh,tri:o.tri}); process.stdout.write('.'); }

const items=await ev(`[...Object.entries(BOT_K).map(([k,v])=>['a',k,v.n,v.cost,v.n_]),...Object.entries(BUILD_K).map(([k,v])=>['b',k,v.n,v.cost,1])]`);
for(const [cat,k,n,cost,cnt] of items){ const o=await ev(`(()=>{ let g;
    if('${cat}'==='a'){ g=ALLY_K[BOT_K['${k}'].k].mk(); } else { g=buildMesh('${k}'); if(g.userData.bar) g.userData.bar.visible=false; }
    shadowize(g); mergeStatic(g,true); return __R.shot(g,${JSON.stringify(n.toUpperCase())},'${cat==='a'?'alleato':'costruzione'} · ${cost} 💰${cnt>1?' · ne arrivano '+cnt:''}'); })()`);
  res.Acquistabili.push({n,tipo:cat==='a'?'Alleato':'Costruzione',cnt,f:save('Acquistabili',n,o.png),dc:o.dc,sh:o.sh,tri:o.tri}); process.stdout.write('.'); }

// nemici delle ondate (lo stesso modello che usa il gioco, senza l'anello colorato a terra)
const NEMICI=[['v','Cavernicolo',"Difendi la birra · dall'ondata 12"],['p','Pinguino in monopattino elettrico',"Difendi la birra · dall'ondata 18 · kamikaze"]];
for(const [t,n,sub] of NEMICI){ const o=await ev(`(()=>{ const g=makeMinion('${t}'); if(g.userData.ring) g.userData.ring.visible=false; shadowize(g); return __R.shot(g,${JSON.stringify(n.toUpperCase())},${JSON.stringify(sub)}); })()`);
  res.Nemici.push({n,f:save('Nemici',n,o.png),dc:o.dc,sh:o.sh,tri:o.tri}); process.stdout.write('.'); }

// ---------- mappe: il renderer del gioco, qualita' ALTA, vista dall'alto come in partita ----------
await ev(`(()=>{ qAuto=false; setQuality(2); for(const id of ['menu','help','hud','banner','feed','msg','netPanel']){ const e=document.getElementById(id); if(e) e.style.visibility='hidden'; }
  const L=document.createElement('div'); L.id='rlab'; L.style.cssText='position:fixed;left:0;right:0;bottom:0;padding:14px 22px;background:rgba(14,18,32,.92);font:700 22px ui-monospace,Menlo,monospace;color:#e8ecf8;z-index:99;display:flex;justify-content:space-between;align-items:baseline'; document.body.appendChild(L); return true; })()`);
const maps=await ev(`Object.entries(MAPS).map(([k,m])=>[k,m.name,m.basketOnly?'solo Basket':m.coopOnly?'solo cooperative':m.big?'gigante':'normale'])`);
for(const [k,n,tipo] of maps){
  const s=await ev(`(()=>{ const M=MAPS['${k}']; if(M.basketOnly) bkMapSize('${k}',2); buildMap('${k}'); if(M.basketOnly){ bkStart(); } setView();
    renderer.shadowMap.needsUpdate=true; renderScene();
    const se=renderer.shadowMap.enabled; renderer.shadowMap.enabled=false; renderer.info.autoReset=false; renderer.info.reset(); renderScene();
    const calls=renderer.info.render.calls, tri=renderer.info.render.triangles; renderer.shadowMap.enabled=se; renderer.info.autoReset=true;
    let sh=0; scene.traverseVisible(o=>{ if(o.isMesh&&o.castShadow) sh++; });
    document.getElementById('rlab').innerHTML='<span style="color:#ffd54f;font-size:30px;font-weight:900">'+M.name+'</span><span>'+calls+' draw call (+'+sh+' ombre) · '+tri.toLocaleString('it-IT')+' triangoli · '+W+'×'+H+' m</span>';
    renderer.shadowMap.needsUpdate=true; return {calls,sh,tri,W,H}; })()`);
  await sleep(700);
  const shot=await send('Page.captureScreenshot',{format:'webp',quality:90});
  const f=path.join(OUT,'Mappe',slug(n)+'.webp'); fs.writeFileSync(f,Buffer.from(shot.result.data,'base64'));
  res.Mappe.push({n,tipo,f:path.basename(f),dc:s.calls,sh:s.sh,tri:s.tri,size:s.W+'×'+s.H});
  await ev(`(()=>{ if(MAPS['${k}'].basketOnly) bkStop(); return true; })()`); process.stdout.write('.'); }

// via i render vecchi di nomi che non esistono piu'
for(const d in res){ const keep=new Set(res[d].map(r=>r.f)); for(const f of fs.readdirSync(path.join(OUT,d))) if(/\.(png|webp)$/.test(f)&&!keep.has(f)) fs.rmSync(path.join(OUT,d,f)); }
// ---------- indice ----------
const it=n=>n.toLocaleString('it-IT');
const tab=(rows,extra)=>`| Render | Nome |${extra?' '+extra[0]+' |':''} Draw call | + ombre | Triangoli |\n|---|---|${extra?'---|':''}---:|---:|---:|\n`+rows.map(r=>`| <img src="${r.dir}/${r.f}" width="${r.dir==='Mappe'?220:120}"> | **${r.n}** |${extra?' '+extra[1](r)+' |':''} ${r.dc} | ${r.sh} | ${it(r.tri)} |`).join('\n');
for(const k in res) res[k].forEach(r=>r.dir=k);
const md=`# Grafiche di Bilocale Deathmatch

Render dei modelli del gioco, con le misure di quanto pesano. Generati da \`strumenti/render-grafiche.mjs\`: per rifarli dopo un restyle, lancia \`node strumenti/render-grafiche.mjs\` dalla cartella del progetto.

**Come leggere le misure**
- **Draw call**: quante volte la scheda video disegna il modello a ogni frame (dopo l'unione delle mesh statiche fatta dal gioco). È la misura che conta di più per le prestazioni.
- **+ ombre**: draw call in più per la mappa delle ombre (solo con qualità MEDIA o ALTA).
- **Triangoli**: quanti poligoni ha il modello. Pesano molto meno delle draw call.
- Riferimento: una partita di Sopravvivenza a Mola con 4 giocatori fa circa 130 draw call e 12.400 triangoli a frame. Limiti consigliati: personaggio fino a ~25-30 draw call e ~10.000 triangoli, boss fino a ~40 draw call e ~15.000 triangoli.
- Per le **mappe** le misure sono quelle dell'intera scena vuota (senza giocatori), vista come in partita.

## Personaggi (${res.Personaggi.length})

${tab(res.Personaggi)}

## Boss (${res.Boss.length})

${tab(res.Boss)}

## Acquistabili di "Difendi la birra" (${res.Acquistabili.length})

Le misure sono per un singolo modello: i polli arrivano in 4 e i mafiosi in 2.

${tab(res.Acquistabili,['Tipo',r=>r.tipo+(r.cnt>1?' (×'+r.cnt+')':'')])}

## Nemici (${res.Nemici.length})

${tab(res.Nemici)}

## Mappe (${res.Mappe.length})

${tab(res.Mappe,['Tipo · misure',r=>r.tipo+' · '+r.size+' m'])}
`;
fs.writeFileSync(path.join(OUT,'README.md'),md);
console.log(`\nFatto: ${res.Personaggi.length} personaggi, ${res.Boss.length} boss, ${res.Acquistabili.length} acquistabili, ${res.Mappe.length} mappe.`);
if(errs.length) console.log('Errori nella pagina:\n'+errs.slice(0,10).join('\n'));
}catch(e){ console.error('ERRORE:',e.message); process.exitCode=1; }
finally{ done(); }
