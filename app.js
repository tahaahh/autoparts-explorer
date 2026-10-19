const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const demo = {
  meta:{name:"AutoParts Explorer demo",version:1,notice:"بيانات توضيحية تجريبية؛ ليست كتالوجاً عالمياً ولا مرجعاً لإصلاح المركبات."},
  vehicles:[
    {id:"demo-peugeot-206",make:"Peugeot",model:"206",generation:"T1",yearFrom:1998,yearTo:2012,market:"Global demo",engineIds:["demo-tu3"],label:"Peugeot 206"},
    {id:"demo-renault-clio2",make:"Renault",model:"Clio II",generation:"X65",yearFrom:1998,yearTo:2012,market:"Global demo",engineIds:["demo-k4m"],label:"Renault Clio II"},
    {id:"demo-toyota-corolla",make:"Toyota",model:"Corolla",generation:"E120",yearFrom:2000,yearTo:2007,market:"Global demo",engineIds:["demo-1zz"],label:"Toyota Corolla"}
  ],
  engines:[
    {id:"demo-tu3",code:"TU3 (demo)",displacement:"1.4 L",fuel:"Essence / Petrol",note:"Exemple de données — vérifier selon variante."},
    {id:"demo-k4m",code:"K4M (demo)",displacement:"1.6 L",fuel:"Essence / Petrol",note:"Exemple de données — vérifier selon variante."},
    {id:"demo-1zz",code:"1ZZ-FE (demo)",displacement:"1.8 L",fuel:"Essence / Petrol",note:"Exemple de données — vérifier selon variante."}
  ],
  systems:[
    {id:"engine",name:{ar:"المحرك",en:"Engine",fr:"Moteur"},desc:{ar:"أجزاء المحرك الرئيسية",en:"Main engine components",fr:"Composants principaux du moteur"},assemblyIds:["engine-top","engine-bottom"]},
    {id:"cooling",name:{ar:"نظام التبريد",en:"Cooling system",fr:"Refroidissement"},desc:{ar:"التبريد ودوران سائل التبريد",en:"Cooling and coolant circulation",fr:"Refroidissement et circulation"},assemblyIds:["cooling-demo"]},
    {id:"brakes",name:{ar:"نظام الفرامل",en:"Brake system",fr:"Freinage"},desc:{ar:"مكونات الفرملة الأساسية",en:"Basic braking components",fr:"Composants de freinage"},assemblyIds:["brakes-demo"]},
    {id:"transmission",name:{ar:"ناقل الحركة والقابض",en:"Transmission & clutch",fr:"Transmission et embrayage"},desc:{ar:"مجموعة نقل الحركة",en:"Drivetrain assembly",fr:"Ensemble de transmission"},assemblyIds:["trans-demo"]}
  ],
  assemblies:[
    {id:"engine-top",systemId:"engine",name:{ar:"الجزء العلوي للمحرك (مثال)",en:"Upper engine (demo)",fr:"Haut moteur (démo)"},diagramId:"engine-demo"},
    {id:"engine-bottom",systemId:"engine",name:{ar:"الجزء السفلي للمحرك (مثال)",en:"Lower engine (demo)",fr:"Bas moteur (démo)"},diagramId:"engine-demo"},
    {id:"cooling-demo",systemId:"cooling",name:{ar:"دورة التبريد (مثال)",en:"Cooling circuit (demo)",fr:"Circuit de refroidissement (démo)"},diagramId:"engine-demo"},
    {id:"brakes-demo",systemId:"brakes",name:{ar:"فرامل (مثال)",en:"Brakes (demo)",fr:"Freins (démo)"},diagramId:"engine-demo"},
    {id:"trans-demo",systemId:"transmission",name:{ar:"القابض وناقل الحركة (مثال)",en:"Clutch and transmission (demo)",fr:"Embrayage et transmission (démo)"},diagramId:"engine-demo"}
  ],
  parts:[
    {id:"p1",name:{ar:"غطاء علوي توضيحي",en:"Illustrative upper cover",fr:"Couvercle supérieur illustratif"},oem:null,systemId:"engine",function:{ar:"عنصر توضيحي لشرح واجهة التطبيق، وليس قطعة OEM محددة.",en:"Illustrative demo element, not a verified OEM part.",fr:"Élément de démonstration, pas une référence OEM vérifiée."},location:{ar:"الجزء العلوي من رسم تجريبي",en:"Upper area of demo drawing",fr:"Zone supérieure du schéma démo"},verified:false},
    {id:"p2",name:{ar:"مجموعة رأس المحرك توضيحية",en:"Illustrative cylinder-head assembly",fr:"Ensemble culasse illustratif"},oem:null,systemId:"engine",function:{ar:"عنصر توضيحي. التفاصيل الدقيقة تختلف حسب المحرك.",en:"Demo element. Exact details vary by engine.",fr:"Élément démo. Les détails varient selon le moteur."},location:{ar:"وسط الرسم التجريبي",en:"Center of demo drawing",fr:"Centre du schéma démo"},verified:false},
    {id:"p3",name:{ar:"مجموعة كتلة المحرك توضيحية",en:"Illustrative engine block assembly",fr:"Bloc moteur illustratif"},oem:null,systemId:"engine",function:{ar:"عنصر توضيحي لعرض تحديد العناصر.",en:"Demo element showing interactive selection.",fr:"Élément démo pour la sélection interactive."},location:{ar:"أسفل الرسم التجريبي",en:"Lower area of demo drawing",fr:"Zone inférieure du schéma démo"},verified:false},
    {id:"p4",name:{ar:"عنصر تبريد توضيحي",en:"Illustrative cooling component",fr:"Composant de refroidissement illustratif"},oem:null,systemId:"cooling",function:{ar:"عنصر تجريبي؛ لا تستخدمه لتحديد قطعة فعلية.",en:"Demo only; do not use to identify a real part.",fr:"Démo uniquement; ne pas utiliser pour identifier une pièce réelle."},location:{ar:"منطقة جانبية في الرسم",en:"Side area of demo drawing",fr:"Zone latérale du schéma démo"},verified:false},
    {id:"p5",name:{ar:"عنصر فرامل توضيحي",en:"Illustrative brake component",fr:"Composant de frein illustratif"},oem:null,systemId:"brakes",function:{ar:"عنصر تجريبي غير مطابق لمرجع سيارة محددة.",en:"Demo element not matched to a specific vehicle.",fr:"Élément démo non associé à un véhicule précis."},location:{ar:"منطقة سفلية جانبية",en:"Lower side area",fr:"Zone latérale inférieure"},verified:false},
    {id:"p6",name:{ar:"عنصر ناقل حركة توضيحي",en:"Illustrative transmission component",fr:"Composant de transmission illustratif"},oem:null,systemId:"transmission",function:{ar:"عنصر تجريبي لا يثبت التوافق.",en:"Demo element; no fitment is asserted.",fr:"Élément démo; aucune compatibilité affirmée."},location:{ar:"منطقة يمين الرسم",en:"Right area of drawing",fr:"Zone droite du schéma"},verified:false}
  ],
  diagrams:[{id:"engine-demo",title:"Demo schematic",assetUri:null,viewBox:"0 0 800 500",license:"Original illustrative SVG generated for this prototype",source:"AutoParts Explorer demo"}],
  diagramItems:[
    {id:"di1",diagramId:"engine-demo",partId:"p1",callout:1,x:400,y:82,shape:"rect",sx:285,sy:58,sw:230,sh:50},
    {id:"di2",diagramId:"engine-demo",partId:"p2",callout:2,x:400,y:205,shape:"rect",sx:270,sy:130,sw:260,sh:140},
    {id:"di3",diagramId:"engine-demo",partId:"p3",callout:3,x:400,y:355,shape:"rect",sx:290,sy:300,sw:220,sh:100},
    {id:"di4",diagramId:"engine-demo",partId:"p4",callout:4,x:620,y:170,shape:"rect",sx:570,sy:130,sw:100,sh:80},
    {id:"di5",diagramId:"engine-demo",partId:"p5",callout:5,x:180,y:335,shape:"rect",sx:125,sy:295,sw:110,sh:80},
    {id:"di6",diagramId:"engine-demo",partId:"p6",callout:6,x:620,y:350,shape:"rect",sx:565,sy:310,sw:110,sh:80}
  ]
};
const labels = {
 ar:{subtitle:"مرجع تقني لقطع السيارات",search:"ابحث عن شركة، سيارة، محرك أو قطعة...",vehicles:"السيارات",systems:"الأنظمة",diagram:"المخطط",favorites:"المفضلة",data:"البيانات",clear:"مسح",choose:"اختيار السيارة",empty:"لا توجد نتائج مطابقة.",selectVehicle:"اختر سيارة أولاً",diagramTitle:"مخطط تفاعلي",tap:"المس الأرقام لتحديد العنصر.",details:"تفاصيل القطعة",save:"حفظ",saved:"محفوظ",remove:"إزالة",source:"المصدر",notVerified:"غير متحقق",noOEM:"لا يوجد رقم OEM موثق",offline:"دون اتصال",online:"متصل",demo:"بيانات تجريبية",all:"الكل"},
 en:{subtitle:"Interactive automotive parts reference",search:"Search make, vehicle, engine or part...",vehicles:"Vehicles",systems:"Systems",diagram:"Diagram",favorites:"Favorites",data:"Data",clear:"Clear",choose:"Choose vehicle",empty:"No matching results.",selectVehicle:"Select a vehicle first",diagramTitle:"Interactive diagram",tap:"Tap a number to select an item.",details:"Part details",save:"Save",saved:"Saved",remove:"Remove",source:"Source",notVerified:"Unverified",noOEM:"No verified OEM number",offline:"Offline",online:"Online",demo:"Demo data",all:"All"},
 fr:{subtitle:"Référence interactive des pièces auto",search:"Rechercher marque, véhicule, moteur ou pièce...",vehicles:"Véhicules",systems:"Systèmes",diagram:"Schéma",favorites:"Favoris",data:"Données",clear:"Effacer",choose:"Choisir un véhicule",empty:"Aucun résultat.",selectVehicle:"Choisissez d’abord un véhicule",diagramTitle:"Schéma interactif",tap:"Touchez un numéro pour sélectionner un élément.",details:"Détails de la pièce",save:"Enregistrer",saved:"Enregistré",remove:"Retirer",source:"Source",notVerified:"Non vérifié",noOEM:"Aucune référence OEM vérifiée",offline:"Hors ligne",online:"En ligne",demo:"Données de démonstration",all:"Tout"}
};
let lang="ar", db, selectedVehicleId=null, selectedSystemId="engine", selectedPartId="p1", currentTab="vehicles", scale=1, tx=0,ty=0, drag=null;
const clone = x => JSON.parse(JSON.stringify(x));
function loadDB(){try{const v=localStorage.getItem("ape-db");db=v?JSON.parse(v):clone(demo)}catch{db=clone(demo)}}
function saveDB(){localStorage.setItem("ape-db",JSON.stringify(db))}
function tr(k){return labels[lang][k]||labels.ar[k]||k}
function localized(v){return typeof v==="string"?v:(v?.[lang]||v?.ar||v?.en||"")}
function selectedVehicle(){return db.vehicles.find(v=>v.id===selectedVehicleId)}
function vehicleEngine(v){return db.engines.find(e=>(v?.engineIds||[]).includes(e.id))}
function setTab(tab){currentTab=tab;$$(".tab").forEach(b=>b.classList.toggle("active",b.dataset.tab===tab));$$(".panel").forEach(p=>p.classList.toggle("active",p.id===tab));if(tab==="diagram")renderDiagram();if(tab==="favorites")renderFavorites()}
function filteredItems(){const q=$("#search").value.trim().toLowerCase();if(!q)return db.vehicles;return db.vehicles.filter(v=>[v.make,v.model,v.generation,v.market,v.label,...(v.engineIds||[]).map(id=>db.engines.find(e=>e.id===id)?.code)].join(" ").toLowerCase().includes(q))}
function renderVehicles(){const list=filteredItems();$("#vehicleCount").textContent=list.length;$("#vehicleList").innerHTML=list.length?list.map(v=>{const e=vehicleEngine(v);return `<button class="vehicle-card ${v.id===selectedVehicleId?"selected":""}" data-vehicle="${esc(v.id)}"><span class="make">${esc(v.make)}</span><h3>${esc(v.model)}</h3><p>${esc(v.generation||"")} · ${esc(v.yearFrom||"?")}–${esc(v.yearTo||"")}</p><p>${esc(e?.code||"Engine data unavailable")}</p></button>`}).join(""):`<div class="empty">${tr("empty")}</div>`;$$("[data-vehicle]").forEach(b=>b.onclick=()=>{selectedVehicleId=b.dataset.vehicle;renderVehicles();renderSystems();renderDiagram();setTab("systems")})}
function renderSystems(){const v=selectedVehicle();$("#selectedVehicleLabel").textContent=v?`${v.make} ${v.model} · ${v.yearFrom||"?"}–${v.yearTo||"?"}`:tr("selectVehicle");$("#systemList").innerHTML=db.systems.map(s=>`<div class="system-card"><h3>${esc(localized(s.name))}</h3><p>${esc(localized(s.desc))}</p><button data-system="${esc(s.id)}">عرض التجميعات (${(s.assemblyIds||[]).length})</button></div>`).join("");$$("[data-system]").forEach(b=>b.onclick=()=>{selectedSystemId=b.dataset.system;const s=db.systems.find(x=>x.id===selectedSystemId);const a=db.assemblies.find(x=>(s.assemblyIds||[]).includes(x.id));if(a)selectedPartId=db.parts.find(p=>p.systemId===s.id)?.id||selectedPartId;renderDiagram();setTab("diagram")})}
function diagramItems(){return db.diagramItems.filter(x=>x.diagramId==="engine-demo"||db.diagrams.some(d=>d.id===x.diagramId))}
function renderDiagram(){const svg=$("#diagramSvg");if(!svg)return;svg.innerHTML=`<defs><pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse"><path d="M 20 0 L 0 0 0 20" fill="none" stroke="#e0e6e8" stroke-width="1"/></pattern></defs><rect width="800" height="500" fill="url(#grid)"/><text x="400" y="30" text-anchor="middle" fill="#52616a" font-size="15">ILLUSTRATIVE DEMO — NOT AN OEM DRAWING</text><g id="diagramContent"></g>`;
const g=svg.querySelector("#diagramContent");
const items=diagramItems();
items.forEach(it=>{const p=db.parts.find(p=>p.id===it.partId);if(!p)return;const x=Number(it.sx??it.x-35),y=Number(it.sy??it.y-25),w=Number(it.sw??70),h=Number(it.sh??50);const rect=document.createElementNS("http://www.w3.org/2000/svg","rect");Object.entries({x,y,width:w,height:h,rx:10,fill:p.id===selectedPartId?"#c3eee8":"#dce5e9",stroke:p.id===selectedPartId?"#007d70":"#687d88","stroke-width":p.id===selectedPartId?4:2}).forEach(([k,v])=>rect.setAttribute(k,v));g.appendChild(rect);
const txt=document.createElementNS("http://www.w3.org/2000/svg","text");txt.setAttribute("x",x+w/2);txt.setAttribute("y",y+h/2+7);txt.setAttribute("text-anchor","middle");txt.setAttribute("font-size","21");txt.setAttribute("font-weight","800");txt.setAttribute("fill","#17343d");txt.textContent=it.callout;g.appendChild(txt);
const hit=document.createElementNS("http://www.w3.org/2000/svg","rect");Object.entries({x:x-8,y:y-8,width:w+16,height:h+16,fill:"transparent",cursor:"pointer"}).forEach(([k,v])=>hit.setAttribute(k,v));hit.addEventListener("click",()=>{selectedPartId=p.id;renderDiagram()});g.appendChild(hit);
});
const svgEl=svg.querySelector("#diagramContent");svgEl.setAttribute("transform",`translate(${tx} ${ty}) scale(${scale})`);renderPartDetails();renderDiagramParts()}
function renderPartDetails(){const p=db.parts.find(x=>x.id===selectedPartId);if(!p){$("#partDetails").innerHTML=`<h3>${tr("details")}</h3><p>${tr("empty")}</p>`;return}const fav=getFavs().includes(p.id);$("#partDetails").innerHTML=`<h3>${esc(localized(p.name))}</h3><div class="part-meta"><span class="tag">${p.oem?`OEM: ${esc(p.oem)}`:tr("noOEM")}</span><span class="tag">${p.verified?"Verified":"Demo / unverified"}</span></div><p><strong>EN:</strong> ${esc(localized(p.name).includes("Illustrative")?localized(p.name):p.name.en||"—")}</p><p><strong>FR:</strong> ${esc(p.name.fr||"—")}</p><p><strong>العربية:</strong> ${esc(p.name.ar||"—")}</p><p><strong>الوظيفة:</strong> ${esc(localized(p.function))}</p><p><strong>الموقع:</strong> ${esc(localized(p.location))}</p><p><strong>التوافق:</strong> غير متاح ما لم توثقه بيانات موثوقة.</p><button id="favBtn">${fav?tr("saved"):tr("save")} ★</button>`;$("#favBtn").onclick=()=>{const f=getFavs();localStorage.setItem("ape-favs",JSON.stringify(fav?f.filter(id=>id!==p.id):[...new Set([...f,p.id])]));renderPartDetails();renderFavorites()}}
function renderDiagramParts(){const items=diagramItems();$("#diagramParts").innerHTML=items.map(it=>{const p=db.parts.find(p=>p.id===it.partId);if(!p)return"";return `<div class="part-row"><span class="part-num">${esc(it.callout)}</span><div class="grow"><strong>${esc(localized(p.name))}</strong><small>${p.oem?esc(p.oem):tr("noOEM")}</small></div><button data-part="${esc(p.id)}">عرض</button></div>`}).join("");$$("[data-part]").forEach(b=>b.onclick=()=>{selectedPartId=b.dataset.part;renderDiagram()})}
function getFavs(){try{return JSON.parse(localStorage.getItem("ape-favs")||"[]")}catch{return[]}}
function renderFavorites(){const favs=getFavs(),parts=db.parts.filter(p=>favs.includes(p.id));$("#favoritesList").innerHTML=parts.length?parts.map(p=>`<div class="part-row"><div class="grow"><strong>${esc(localized(p.name))}</strong><small>${p.oem?esc(p.oem):tr("noOEM")}</small></div><button data-favpart="${esc(p.id)}">فتح</button><button data-remove="${esc(p.id)}" class="secondary">${tr("remove")}</button></div>`).join(""):`<div class="empty">لا توجد قطع محفوظة بعد.</div>`;$$("[data-favpart]").forEach(b=>b.onclick=()=>{selectedPartId=b.dataset.favpart;setTab("diagram");renderDiagram()});$$("[data-remove]").forEach(b=>b.onclick=()=>{localStorage.setItem("ape-favs",JSON.stringify(getFavs().filter(id=>id!==b.dataset.remove)));renderFavorites()})}
function esc(v){return String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
function applyLang(){document.documentElement.lang=lang;document.documentElement.dir=lang==="ar"?"rtl":"ltr";$$("[data-tab]").forEach(b=>b.textContent=tr(b.dataset.tab));$("#search").placeholder=tr("search");$("#clearSearch").textContent=tr("clear");renderVehicles();renderSystems();renderDiagram();renderFavorites()}
function applyTransform(){const g=$("#diagramContent");if(g)g.setAttribute("transform",`translate(${tx} ${ty}) scale(${scale})`)}
function init(){
 loadDB();selectedVehicleId=db.vehicles[0]?.id||null;
 $("#search").addEventListener("input",renderVehicles);$("#clearSearch").onclick=()=>{$("#search").value="";renderVehicles()};
 $$(".tab").forEach(b=>b.onclick=()=>setTab(b.dataset.tab));
 $("#langBtn").onclick=()=>{lang=lang==="ar"?"en":lang==="en"?"fr":"ar";applyLang()};
 $("#zoomIn").onclick=()=>{scale=Math.min(3,scale+.2);applyTransform()};$("#zoomOut").onclick=()=>{scale=Math.max(.6,scale-.2);applyTransform()};$("#zoomReset").onclick=()=>{scale=1;tx=ty=0;applyTransform()};
 const vp=$("#diagramViewport");vp.addEventListener("pointerdown",e=>{if(e.target.closest("text")||e.target.closest("rect")&&e.target.getAttribute("fill")==="transparent")return;drag={x:e.clientX-tx,y:e.clientY-ty};vp.setPointerCapture(e.pointerId)});vp.addEventListener("pointermove",e=>{if(!drag)return;tx=e.clientX-drag.x;ty=e.clientY-drag.y;applyTransform()});["pointerup","pointercancel"].forEach(ev=>vp.addEventListener(ev,()=>drag=null));
 $("#exportBtn").onclick=()=>download(JSON.stringify({db,favorites:getFavs()},null,2),"autoparts-backup.json","application/json");
 $("#importBtn").onclick=async()=>{const f=$("#importFile").files[0];if(!f){alert("اختر ملف JSON أولاً");return}try{const parsed=JSON.parse(await f.text());const incoming=parsed.db||parsed;if(!Array.isArray(incoming.vehicles)||!Array.isArray(incoming.parts)||!Array.isArray(incoming.systems)||!Array.isArray(incoming.diagramItems))throw new Error("ملف البيانات لا يحتوي على الحقول المطلوبة.");if(!confirm("سيتم استبدال قاعدة البيانات الحالية. هل تريد المتابعة؟"))return;db=incoming;saveDB();selectedVehicleId=db.vehicles[0]?.id||null;renderVehicles();renderSystems();renderDiagram();alert("تم استيراد البيانات.")}catch(e){alert("تعذر الاستيراد: "+e.message)}};
 $("#resetBtn").onclick=()=>{if(confirm("سيتم استبدال البيانات الحالية بالبيانات التجريبية. هل تريد المتابعة؟")){db=clone(demo);saveDB();selectedVehicleId=db.vehicles[0].id;localStorage.removeItem("ape-favs");renderVehicles();renderSystems();renderDiagram();renderFavorites()}};
 $("#offlineStatus").textContent=navigator.onLine?tr("online"):tr("offline");window.addEventListener("online",()=>$("#offlineStatus").textContent=tr("online"));window.addEventListener("offline",()=>$("#offlineStatus").textContent=tr("offline"));
 if("serviceWorker" in navigator && location.protocol.startsWith("http"))navigator.serviceWorker.register("./sw.js").catch(()=>{});
 applyLang();
}
function download(content,name,type){const a=document.createElement("a");const url=URL.createObjectURL(new Blob([content],{type}));a.href=url;a.download=name;a.click();URL.revokeObjectURL(url)}
init();
