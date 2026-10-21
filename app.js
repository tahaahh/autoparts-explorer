const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];
const clone = (value) => JSON.parse(JSON.stringify(value));
const DB_NAME = "auto-parts-explorer";
const DB_STORE = "catalog";
const DB_KEY = "active";
const MAX_PACK_BYTES = 25 * 1024 * 1024;
const MAX_RECORDS_PER_TABLE = 250000;
const DEFAULT_VIEWBOX = "0 0 800 500";
let vehicleLimit = 100;

// Deliberately illustrative only. No OEM numbers, real diagrams, or fitment are asserted.
const demo = {
  meta: { name: "AutoParts Explorer demo", version: 1, notice: "بيانات توضيحية تجريبية؛ ليست كتالوجاً عالمياً ولا مرجعاً لإصلاح المركبات.", demo: true },
  vehicles: [
    { id: "demo-peugeot-206", make: "Peugeot", model: "206", generation: "T1", yearFrom: 1998, yearTo: 2012, market: "Demo", engineIds: ["demo-tu3"], label: "Peugeot 206" },
    { id: "demo-renault-clio2", make: "Renault", model: "Clio II", generation: "X65", yearFrom: 1998, yearTo: 2012, market: "Demo", engineIds: ["demo-k4m"], label: "Renault Clio II" },
    { id: "demo-toyota-corolla", make: "Toyota", model: "Corolla", generation: "E120", yearFrom: 2000, yearTo: 2007, market: "Demo", engineIds: ["demo-1zz"], label: "Toyota Corolla" }
  ],
  engines: [
    { id: "demo-tu3", code: "TU3 (demo)", displacement: "1.4 L", fuel: "Petrol", note: "Demo only; verify by variant." },
    { id: "demo-k4m", code: "K4M (demo)", displacement: "1.6 L", fuel: "Petrol", note: "Demo only; verify by variant." },
    { id: "demo-1zz", code: "1ZZ-FE (demo)", displacement: "1.8 L", fuel: "Petrol", note: "Demo only; verify by variant." }
  ],
  systems: [
    { id: "engine", name: { ar: "المحرك", en: "Engine", fr: "Moteur" }, desc: { ar: "أجزاء المحرك الرئيسية", en: "Main engine components", fr: "Composants principaux du moteur" }, assemblyIds: ["engine-top", "engine-bottom"] },
    { id: "cooling", name: { ar: "نظام التبريد", en: "Cooling system", fr: "Refroidissement" }, desc: { ar: "التبريد ودوران سائل التبريد", en: "Cooling and coolant circulation", fr: "Refroidissement et circulation" }, assemblyIds: ["cooling-demo"] },
    { id: "brakes", name: { ar: "نظام الفرامل", en: "Brake system", fr: "Freinage" }, desc: { ar: "مكونات الفرملة الأساسية", en: "Basic braking components", fr: "Composants de freinage" }, assemblyIds: ["brakes-demo"] },
    { id: "transmission", name: { ar: "ناقل الحركة والقابض", en: "Transmission & clutch", fr: "Transmission et embrayage" }, desc: { ar: "مجموعة نقل الحركة", en: "Drivetrain assembly", fr: "Ensemble de transmission" }, assemblyIds: ["trans-demo"] }
  ],
  assemblies: [
    { id: "engine-top", systemId: "engine", name: { ar: "الجزء العلوي للمحرك (مثال)", en: "Upper engine (demo)", fr: "Haut moteur (démo)" }, diagramId: "engine-demo" },
    { id: "engine-bottom", systemId: "engine", name: { ar: "الجزء السفلي للمحرك (مثال)", en: "Lower engine (demo)", fr: "Bas moteur (démo)" }, diagramId: "engine-demo" },
    { id: "cooling-demo", systemId: "cooling", name: { ar: "دورة التبريد (مثال)", en: "Cooling circuit (demo)", fr: "Circuit de refroidissement (démo)" }, diagramId: "engine-demo" },
    { id: "brakes-demo", systemId: "brakes", name: { ar: "فرامل (مثال)", en: "Brakes (demo)", fr: "Freins (démo)" }, diagramId: "engine-demo" },
    { id: "trans-demo", systemId: "transmission", name: { ar: "القابض وناقل الحركة (مثال)", en: "Clutch and transmission (demo)", fr: "Embrayage et transmission (démo)" }, diagramId: "engine-demo" }
  ],
  parts: [
    { id: "p1", name: { ar: "غطاء علوي توضيحي", en: "Illustrative upper cover", fr: "Couvercle supérieur illustratif" }, oem: null, systemId: "engine", function: { ar: "عنصر توضيحي لشرح الواجهة، وليس قطعة OEM محددة.", en: "Illustrative element, not a verified OEM part.", fr: "Élément illustratif, pas une référence OEM vérifiée." }, location: { ar: "الجزء العلوي من رسم تجريبي", en: "Upper area of demo drawing", fr: "Zone supérieure du schéma démo" }, verified: false },
    { id: "p2", name: { ar: "مجموعة رأس المحرك توضيحية", en: "Illustrative cylinder-head assembly", fr: "Ensemble culasse illustratif" }, oem: null, systemId: "engine", function: { ar: "عنصر توضيحي؛ التفاصيل الدقيقة تختلف حسب المحرك.", en: "Demo element; exact details vary by engine.", fr: "Élément de démo; les détails varient selon le moteur." }, location: { ar: "وسط الرسم التجريبي", en: "Center of demo drawing", fr: "Centre du schéma démo" }, verified: false },
    { id: "p3", name: { ar: "مجموعة كتلة المحرك توضيحية", en: "Illustrative engine block assembly", fr: "Bloc moteur illustratif" }, oem: null, systemId: "engine", function: { ar: "عنصر توضيحي لعرض تحديد العناصر.", en: "Demo element showing interactive selection.", fr: "Élément de démo montrant la sélection interactive." }, location: { ar: "أسفل الرسم التجريبي", en: "Lower area of demo drawing", fr: "Zone inférieure du schéma démo" }, verified: false },
    { id: "p4", name: { ar: "عنصر تبريد توضيحي", en: "Illustrative cooling component", fr: "Composant de refroidissement illustratif" }, oem: null, systemId: "cooling", function: { ar: "عنصر تجريبي؛ لا تستخدمه لتحديد قطعة فعلية.", en: "Demo only; not for identifying a real part.", fr: "Démo uniquement; ne permet pas d'identifier une pièce réelle." }, location: { ar: "منطقة جانبية في الرسم", en: "Side area of demo drawing", fr: "Zone latérale du schéma démo" }, verified: false },
    { id: "p5", name: { ar: "عنصر فرامل توضيحي", en: "Illustrative brake component", fr: "Composant de frein illustratif" }, oem: null, systemId: "brakes", function: { ar: "عنصر تجريبي غير مطابق لمرجع سيارة محددة.", en: "Demo element not matched to a specific vehicle.", fr: "Élément de démo non associé à un véhicule précis." }, location: { ar: "منطقة سفلية جانبية", en: "Lower side area", fr: "Zone latérale inférieure" }, verified: false },
    { id: "p6", name: { ar: "عنصر ناقل حركة توضيحي", en: "Illustrative transmission component", fr: "Composant de transmission illustratif" }, oem: null, systemId: "transmission", function: { ar: "عنصر تجريبي لا يثبت التوافق.", en: "Demo element; no fitment is asserted.", fr: "Élément de démo; aucune compatibilité n'est affirmée." }, location: { ar: "منطقة يمين الرسم", en: "Right area of drawing", fr: "Zone droite du schéma" }, verified: false }
  ],
  diagrams: [{ id: "engine-demo", title: "Demo schematic", assetUri: null, viewBox: DEFAULT_VIEWBOX, license: "Original illustrative SVG generated for this prototype", source: "AutoParts Explorer demo" }],
  diagramItems: [
    { id: "di1", diagramId: "engine-demo", partId: "p1", callout: 1, x: 400, y: 82, shape: "rect", sx: 285, sy: 58, sw: 230, sh: 50 },
    { id: "di2", diagramId: "engine-demo", partId: "p2", callout: 2, x: 400, y: 205, shape: "rect", sx: 270, sy: 130, sw: 260, sh: 140 },
    { id: "di3", diagramId: "engine-demo", partId: "p3", callout: 3, x: 400, y: 355, shape: "rect", sx: 290, sy: 300, sw: 220, sh: 100 },
    { id: "di4", diagramId: "engine-demo", partId: "p4", callout: 4, x: 620, y: 170, shape: "rect", sx: 570, sy: 130, sw: 100, sh: 80 },
    { id: "di5", diagramId: "engine-demo", partId: "p5", callout: 5, x: 180, y: 335, shape: "rect", sx: 125, sy: 295, sw: 110, sh: 80 },
    { id: "di6", diagramId: "engine-demo", partId: "p6", callout: 6, x: 620, y: 350, shape: "rect", sx: 565, sy: 310, sw: 110, sh: 80 }
  ]
};

const words = {
  ar: {
    subtitle: "مرجع تقني تفاعلي لقطع السيارات", search: "ابحث عن شركة، سيارة، محرك، قطعة أو رقم...", vehicles: "السيارات", systems: "الأنظمة", diagram: "المخطط", favorites: "المفضلة", data: "البيانات", clear: "مسح", choose: "اختيار السيارة", empty: "لا توجد نتائج مطابقة.", selectVehicle: "اختر سيارة أولاً", diagramTitle: "مخطط تفاعلي", tap: "المس الأرقام لتحديد العنصر. اسحب للتحريك، واستخدم التكبير.", details: "تفاصيل القطعة", save: "حفظ", saved: "محفوظ", remove: "إزالة", source: "المصدر", notVerified: "غير متحقق", noOEM: "لا يوجد رقم OEM موثق", offline: "دون اتصال", online: "متصل", demo: "بيانات تجريبية", all: "الكل", assemblies: "التجميعات الفرعية", open: "فتح", function: "الوظيفة", location: "الموقع", references: "الأرقام المتقاطعة", fitment: "التوافق الموثق", noFitment: "لا توجد بيانات توافق موثقة لهذه القطعة.", images: "صور القطعة", noImages: "لا توجد صور مرخصة مرفقة.", favoriteVehicle: "حفظ السيارة", favoriteDiagram: "حفظ المخطط", savedVehicle: "السيارة محفوظة", savedDiagram: "المخطط محفوظ", back: "رجوع", verified: "موثق", unverified: "غير متحقق", import: "استيراد الحزمة", export: "تصدير نسخة", reset: "استعادة المثال", importHelp: "ملف JSON محلي حتى 25 ميغابايت. لا تستورد بيانات دون ترخيص.", sourceWarning: "بيانات المثال لا تحدد قطعة فعلية ولا تثبت التوافق.", demoNotice: "نموذج تجريبي: لا يحتوي على كتالوج OEM عالمي أو أرقام قطع موثقة.", resultVehicles: "مركبات", resultParts: "قطع", part: "قطعة", vehicle: "مركبة", lang: "اللغة"
  },
  en: {
    subtitle: "Interactive automotive parts reference", search: "Search make, vehicle, engine, part or number...", vehicles: "Vehicles", systems: "Systems", diagram: "Diagram", favorites: "Favorites", data: "Data", clear: "Clear", choose: "Choose vehicle", empty: "No matching results.", selectVehicle: "Select a vehicle first", diagramTitle: "Interactive diagram", tap: "Tap a number to select an item. Drag to pan and use zoom controls.", details: "Part details", save: "Save", saved: "Saved", remove: "Remove", source: "Source", notVerified: "Unverified", noOEM: "No verified OEM number", offline: "Offline", online: "Online", demo: "Demo data", all: "All", assemblies: "Subassemblies", open: "Open", function: "Function", location: "Location", references: "Cross-references", fitment: "Verified fitment", noFitment: "No verified fitment data for this part.", images: "Part images", noImages: "No licensed images attached.", favoriteVehicle: "Save vehicle", favoriteDiagram: "Save diagram", savedVehicle: "Vehicle saved", savedDiagram: "Diagram saved", back: "Back", verified: "Verified", unverified: "Unverified", import: "Import data pack", export: "Export backup", reset: "Restore demo data", importHelp: "Local JSON file up to 25 MB. Do not import data without redistribution rights.", sourceWarning: "Demo data does not identify a real part or establish fitment.", demoNotice: "Demo prototype: no global OEM catalog or verified part numbers are included.", resultVehicles: "vehicles", resultParts: "parts", part: "Part", vehicle: "Vehicle", lang: "Language"
  },
  fr: {
    subtitle: "Référence interactive des pièces automobiles", search: "Rechercher marque, véhicule, moteur, pièce ou référence...", vehicles: "Véhicules", systems: "Systèmes", diagram: "Schéma", favorites: "Favoris", data: "Données", clear: "Effacer", choose: "Choisir un véhicule", empty: "Aucun résultat correspondant.", selectVehicle: "Choisissez d’abord un véhicule", diagramTitle: "Schéma interactif", tap: "Touchez un numéro pour choisir un élément. Faites glisser pour déplacer.", details: "Détails de la pièce", save: "Enregistrer", saved: "Enregistré", remove: "Retirer", source: "Source", notVerified: "Non vérifié", noOEM: "Aucune référence OEM vérifiée", offline: "Hors ligne", online: "En ligne", demo: "Données de démonstration", all: "Tout", assemblies: "Sous-ensembles", open: "Ouvrir", function: "Fonction", location: "Emplacement", references: "Références croisées", fitment: "Compatibilité vérifiée", noFitment: "Aucune compatibilité vérifiée pour cette pièce.", images: "Images de la pièce", noImages: "Aucune image sous licence jointe.", favoriteVehicle: "Enregistrer le véhicule", favoriteDiagram: "Enregistrer le schéma", savedVehicle: "Véhicule enregistré", savedDiagram: "Schéma enregistré", back: "Retour", verified: "Vérifié", unverified: "Non vérifié", import: "Importer un paquet", export: "Exporter une sauvegarde", reset: "Restaurer les données démo", importHelp: "Fichier JSON local de 25 Mo maximum. N’importez pas de données sans droit de redistribution.", sourceWarning: "Les données démo n’identifient pas une pièce réelle et ne prouvent pas la compatibilité.", demoNotice: "Prototype démo : aucun catalogue OEM mondial ni référence vérifiée n’est inclus.", resultVehicles: "véhicules", resultParts: "pièces", part: "Pièce", vehicle: "Véhicule", lang: "Langue"
  }
};

let lang = "ar";
let db;
let selectedVehicleId = null;
let selectedSystemId = "engine";
let selectedAssemblyId = "engine-top";
let selectedPartId = "p1";
let currentTab = "vehicles";
let scale = 1;
let tx = 0;
let ty = 0;
let pointerMap = new Map();
let drag = null;
let pinchStart = null;
let imageIndex = 0;
let databasePromise;

function tr(key) { return words[lang]?.[key] || words.ar[key] || key; }
function localized(value) {
  if (typeof value === "string") return value;
  if (!value || typeof value !== "object") return "";
  return value[lang] || value.ar || value.en || value.fr || "";
}
function safeText(value) { return String(value ?? "").replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[character])); }
function safeAsset(value) {
  if (typeof value !== "string") return "";
  if (value.length <= 500 && /^https:\/\//i.test(value)) return value;
  if (value.length <= 12 * 1024 * 1024 && /^data:image\/(?:png|jpeg|webp|gif);base64,[A-Za-z0-9+/=]+$/i.test(value)) return value;
  if (/^(?:\.\/|\.\.\/|\/)?[\w./-]+\.(?:png|jpe?g|webp|gif)$/i.test(value) && !value.includes("..")) return value;
  return "";
}
function openDatabase() {
  if (databasePromise) return databasePromise;
  databasePromise = new Promise((resolve) => {
    if (!("indexedDB" in window)) return resolve(null);
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      const store = request.result.objectStoreNames.contains(DB_STORE)
        ? request.transaction.objectStore(DB_STORE)
        : request.result.createObjectStore(DB_STORE, { keyPath: "id" });
      if (!store.indexNames.contains("id")) store.createIndex("id", "id", { unique: true });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => resolve(null);
  });
  return databasePromise;
}
async function loadDB() {
  const idb = await openDatabase();
  if (idb) {
    const stored = await new Promise((resolve) => {
      const tx = idb.transaction(DB_STORE, "readonly");
      const request = tx.objectStore(DB_STORE).get(DB_KEY);
      request.onsuccess = () => resolve(request.result?.value || null);
      request.onerror = () => resolve(null);
    });
    if (stored && isValidData(stored).valid) { db = stored; return; }
  }
  try {
    const legacy = localStorage.getItem("ape-db");
    const parsed = legacy ? JSON.parse(legacy) : null;
    db = parsed && isValidData(parsed).valid ? parsed : clone(demo);
  } catch { db = clone(demo); }
  await saveDB();
}
async function saveDB() {
  const idb = await openDatabase();
  if (idb) {
    const saved = await new Promise((resolve) => {
      const tx = idb.transaction(DB_STORE, "readwrite");
      tx.objectStore(DB_STORE).put({ id: DB_KEY, value: db, savedAt: new Date().toISOString() });
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => resolve(false);
      tx.onabort = () => resolve(false);
    });
    if (saved) { localStorage.removeItem("ape-db"); return true; }
  }
  try { localStorage.setItem("ape-db", JSON.stringify(db)); return true; }
  catch { showToast("Storage is full. Import a smaller data pack."); return false; }
}
function selectedVehicle() { return db.vehicles.find((vehicle) => vehicle.id === selectedVehicleId); }
function selectedAssembly() { return db.assemblies.find((assembly) => assembly.id === selectedAssemblyId); }
function currentDiagram() {
  const assembly = selectedAssembly();
  return db.diagrams.find((diagram) => diagram.id === assembly?.diagramId) || db.diagrams[0] || null;
}
function currentDiagramItems() {
  const diagram = currentDiagram();
  return diagram ? db.diagramItems.filter((item) => item.diagramId === diagram.id) : [];
}
function setTab(tab) {
  currentTab = tab;
  $$(".tab").forEach((button) => button.classList.toggle("active", button.dataset.tab === tab));
  $$(".panel").forEach((panel) => panel.classList.toggle("active", panel.id === tab));
  if (tab === "diagram") renderDiagram();
  if (tab === "favorites") renderFavorites();
}
function cleanQuery(value) { return String(value ?? "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase().trim(); }
function engineForVehicle(vehicle) { return db.engines.find((engine) => (vehicle?.engineIds || []).includes(engine.id)); }
function vehicleMetaLabel(vehicle) {
  const values = [];
  if (vehicle?.generation) values.push(vehicle.generation);
  if (vehicle?.yearFrom != null || vehicle?.yearTo != null) values.push(`${vehicle.yearFrom ?? "?"}–${vehicle.yearTo ?? "?"}`);
  if (vehicle?.market) values.push(vehicle.market);
  return values.join(" · ") || { ar: "بيانات السنوات والأجيال غير متاحة", en: "Years and generations unavailable", fr: "Années et générations indisponibles" }[lang];
}
function engineMetaLabel(engine) { return engine?.code || { ar: "بيانات المحرك غير متاحة", en: "Engine data unavailable", fr: "Données moteur indisponibles" }[lang]; }
function allSearchText(entity) {
  const strings = [];
  const add = (value) => {
    if (typeof value === "string" || typeof value === "number") strings.push(String(value));
    else if (value && typeof value === "object") Object.values(value).forEach(add);
  };
  add(entity);
  return cleanQuery(strings.join(" "));
}
function renderVehicles() {
  const query = cleanQuery($("#search").value);
  const list = db.vehicles.filter((vehicle) => !query || allSearchText({ ...vehicle, engine: engineForVehicle(vehicle) }).includes(query));
  const visible = list.slice(0, vehicleLimit);
  $("#vehicleCount").textContent = list.length;
  const cards = visible.map((vehicle) => {
    const engine = engineForVehicle(vehicle);
    return `<button class="vehicle-card ${vehicle.id === selectedVehicleId ? "selected" : ""}" data-vehicle="${safeText(vehicle.id)}"><span class="make">${safeText(vehicle.make)}</span><h3>${safeText(vehicle.model)}</h3><p>${safeText(vehicleMetaLabel(vehicle))}</p><p>${safeText(engineMetaLabel(engine))}</p></button>`;
  }).join("");
  const moreText = { ar: `عرض المزيد (${visible.length} من ${list.length})`, en: `Show more (${visible.length} of ${list.length})`, fr: `Afficher plus (${visible.length} sur ${list.length})` }[lang];
  $("#vehicleList").innerHTML = list.length ? cards + (visible.length < list.length ? `<button id="loadMoreVehicles" class="secondary load-more">${safeText(moreText)}</button>` : "") : `<div class="empty">${tr("empty")}</div>`;
  $("#loadMoreVehicles")?.addEventListener("click", () => { vehicleLimit += 100; renderVehicles(); });
  $$('[data-vehicle]').forEach((button) => button.addEventListener("click", () => {
    selectedVehicleId = button.dataset.vehicle;
    renderVehicles(); renderSystems(); setTab("systems");
  }));
}
function matchingParts(query) {
  if (!query) return [];
  const q = cleanQuery(query);
  return db.parts.filter((part) => allSearchText({
    ...part,
    partNumbers: part.partNumbers || [],
    crossReferences: part.crossReferences || [],
    name: part.name,
    function: part.function,
    location: part.location
  }).includes(q)).slice(0, 8);
}
function matchingVehicles(query) {
  if (!query) return [];
  const q = cleanQuery(query);
  return db.vehicles.filter((vehicle) => allSearchText({ ...vehicle, engine: engineForVehicle(vehicle) }).includes(q)).slice(0, 8);
}
function renderSearchResults() {
  const query = $("#search").value.trim();
  const box = $("#searchResults");
  if (!query) { box.hidden = true; box.innerHTML = ""; return; }
  const vehicles = matchingVehicles(query);
  const parts = matchingParts(query);
  if (!vehicles.length && !parts.length) { box.hidden = true; box.innerHTML = ""; return; }
  box.hidden = false;
  box.innerHTML = `<div class="search-group"><strong>${tr("resultVehicles")}</strong>${vehicles.map((vehicle) => `<button class="search-result" data-result-vehicle="${safeText(vehicle.id)}"><span>${safeText(vehicle.make)} ${safeText(vehicle.model)}</span><small>${safeText(vehicleMetaLabel(vehicle))}</small></button>`).join("")}</div><div class="search-group"><strong>${tr("resultParts")}</strong>${parts.map((part) => `<button class="search-result" data-result-part="${safeText(part.id)}"><span>${safeText(localized(part.name))}</span><small>${safeText(part.oem || tr("noOEM"))}</small></button>`).join("")}</div>`;
  $$('[data-result-vehicle]').forEach((button) => button.addEventListener("click", () => {
    selectedVehicleId = button.dataset.resultVehicle; $("#searchResults").hidden = true; renderVehicles(); renderSystems(); setTab("systems");
  }));
  $$('[data-result-part]').forEach((button) => button.addEventListener("click", () => {
    selectedPartId = button.dataset.resultPart;
    const part = db.parts.find((item) => item.id === selectedPartId);
    const item = db.diagramItems.find((diagramItem) => diagramItem.partId === part?.id);
    const diagram = db.diagrams.find((entry) => entry.id === item?.diagramId);
    selectedAssemblyId = db.assemblies.find((assembly) => assembly.diagramId === diagram?.id)?.id || selectedAssemblyId;
    $("#searchResults").hidden = true; setTab("diagram");
  }));
}
function childAssemblies(systemId, parentId = null) {
  return db.assemblies.filter((assembly) => assembly.systemId === systemId && (assembly.parentId || null) === parentId).sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
}
function renderAssemblyTree(systemId, parentId = null, depth = 0) {
  return childAssemblies(systemId, parentId).map((assembly) => {
    const children = renderAssemblyTree(systemId, assembly.id, depth + 1);
    return `<div class="assembly-node" style="--depth:${Math.min(depth, 4)}"><div class="assembly-row"><span>${safeText(localized(assembly.name))}</span><button data-assembly="${safeText(assembly.id)}">${tr("open")}</button></div>${children}</div>`;
  }).join("");
}
function renderSystems() {
  const vehicle = selectedVehicle();
  $("#selectedVehicleLabel").textContent = vehicle ? `${vehicle.make} ${vehicle.model} · ${vehicleMetaLabel(vehicle)}` : tr("selectVehicle");
  const favButton = $("#vehicleFavoriteBtn");
  if (favButton) { favButton.textContent = isFavorite("vehicle", vehicle?.id) ? tr("savedVehicle") : tr("favoriteVehicle"); favButton.disabled = !vehicle; }
  const noSystems = { ar: "لا توجد أنظمة أو قطع موثقة في هذه الحزمة لهذا الطراز.", en: "This pack contains no documented systems or parts for this model.", fr: "Ce paquet ne contient aucun système ou pièce documenté pour ce modèle." }[lang];
  $("#systemList").innerHTML = db.systems.length ? db.systems.map((system) => `<article class="system-card"><h3>${safeText(localized(system.name))}</h3><p>${safeText(localized(system.desc))}</p><h4>${tr("assemblies")}</h4><div class="assembly-list">${renderAssemblyTree(system.id)}</div></article>`).join("") : `<div class="empty">${safeText(noSystems)}</div>`;
  $$('[data-assembly]').forEach((button) => button.addEventListener("click", () => {
    selectedAssemblyId = button.dataset.assembly;
    const assembly = selectedAssembly();
    selectedSystemId = assembly?.systemId || selectedSystemId;
    const diagram = currentDiagram();
    const firstItem = diagram && db.diagramItems.find((item) => item.diagramId === diagram.id);
    if (firstItem) selectedPartId = firstItem.partId;
    scale = 1; tx = 0; ty = 0; setTab("diagram");
  }));
  if (favButton) favButton.onclick = () => { const id = selectedVehicle()?.id; if (id) toggleFavorite("vehicle", id); renderSystems(); renderFavorites(); };
}
function renderDiagram() {
  const svg = $("#diagramSvg");
  if (!svg) return;
  const diagram = currentDiagram();
  const viewBox = typeof diagram?.viewBox === "string" && /^[\d. -]{3,60}$/.test(diagram.viewBox) ? diagram.viewBox : DEFAULT_VIEWBOX;
  svg.setAttribute("viewBox", viewBox);
  svg.innerHTML = `<defs><pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse"><path d="M 20 0 L 0 0 0 20" fill="none" stroke="#e0e6e8" stroke-width="1"/></pattern></defs><rect width="800" height="500" fill="url(#grid)"/><text id="diagramWarning" x="400" y="30" text-anchor="middle" fill="#52616a" font-size="15"></text><g id="diagramContent"></g>`;
  const warning = svg.querySelector("#diagramWarning");
  const noDiagram = { ar: "لا يوجد مخطط موثق لهذه الحزمة.", en: "No documented diagram is included in this pack.", fr: "Aucun schéma documenté n’est inclus dans ce paquet." }[lang];
  warning.textContent = diagram ? (db.meta?.demo ? "ILLUSTRATIVE DEMO — NOT AN OEM DRAWING" : (diagram.title || "")) : noDiagram;
  const group = svg.querySelector("#diagramContent");
  const asset = safeAsset(diagram?.assetUri);
  if (asset) {
    const image = document.createElementNS("http://www.w3.org/2000/svg", "image");
    image.setAttribute("href", asset); image.setAttribute("x", "0"); image.setAttribute("y", "0"); image.setAttribute("width", "800"); image.setAttribute("height", "500"); image.setAttribute("preserveAspectRatio", "xMidYMid meet");
    group.appendChild(image);
  }
  currentDiagramItems().forEach((item) => {
    const part = db.parts.find((entry) => entry.id === item.partId);
    if (!part) return;
    const x = Number(item.sx ?? item.x - 35); const y = Number(item.sy ?? item.y - 25);
    const width = Number(item.sw ?? 70); const height = Number(item.sh ?? 50);
    const shape = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    [["x", x], ["y", y], ["width", width], ["height", height], ["rx", 10], ["fill", part.id === selectedPartId ? "#c3eee8" : "#dce5e9"], ["stroke", part.id === selectedPartId ? "#007d70" : "#687d88"], ["stroke-width", part.id === selectedPartId ? 4 : 2]].forEach(([name, value]) => shape.setAttribute(name, value));
    group.appendChild(shape);
    const label = document.createElementNS("http://www.w3.org/2000/svg", "text");
    label.setAttribute("x", x + width / 2); label.setAttribute("y", y + height / 2 + 7); label.setAttribute("text-anchor", "middle"); label.setAttribute("font-size", "21"); label.setAttribute("font-weight", "800"); label.setAttribute("fill", "#17343d"); label.textContent = String(item.callout ?? "");
    group.appendChild(label);
    const hit = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    [["x", x - 8], ["y", y - 8], ["width", width + 16], ["height", height + 16], ["fill", "transparent"], ["cursor", "pointer"], ["data-hit", "true"]].forEach(([name, value]) => hit.setAttribute(name, value));
    hit.setAttribute("aria-label", `${tr("part")} ${item.callout}: ${localized(part.name)}`);
    hit.addEventListener("click", () => { selectedPartId = part.id; renderDiagram(); });
    group.appendChild(hit);
  });
  const content = svg.querySelector("#diagramContent");
  content.setAttribute("transform", `translate(${tx} ${ty}) scale(${scale})`);
  const assembly = selectedAssembly();
  $("#selectedAssemblyLabel").textContent = assembly ? localized(assembly.name) : diagram?.title || tr("diagramTitle");
  const favoriteButton = $("#diagramFavoriteBtn");
  if (favoriteButton) { favoriteButton.textContent = diagram && isFavorite("diagram", diagram.id) ? tr("savedDiagram") : tr("favoriteDiagram"); favoriteButton.disabled = !diagram; }
  if (favoriteButton) favoriteButton.onclick = () => { const id = currentDiagram()?.id; if (id) toggleFavorite("diagram", id); renderDiagram(); renderFavorites(); };
  renderPartDetails(); renderDiagramParts();
}
function makeRow(label, value) {
  if (!value) return "";
  return `<p><strong>${safeText(label)}:</strong> ${safeText(value)}</p>`;
}
function renderPartDetails() {
  const part = db.parts.find((entry) => entry.id === selectedPartId);
  const box = $("#partDetails");
  if (!part) { box.innerHTML = `<h3>${tr("details")}</h3><p>${tr("empty")}</p>`; return; }
  const isVerified = part.verificationStatus === "verified" || part.verified === true;
  const numbers = [...(part.partNumbers || []), ...(part.oem ? [{ value: part.oem, type: "OEM", verificationStatus: part.verified ? "verified" : "unverified" }] : [])];
  const numberHtml = numbers.length ? numbers.map((number) => `<span class="tag">${safeText(number.type || "REF")}: ${safeText(number.value || number.number || "")} · ${safeText(number.verificationStatus === "verified" ? tr("verified") : tr("unverified"))}</span>`).join("") : `<span class="tag">${tr("noOEM")}</span>`;
  const references = (part.crossReferences || []).map((reference) => typeof reference === "string" ? reference : reference.value || reference.number || "").filter(Boolean);
  const fitments = (part.fitments || []).filter((fitment) => fitment.verificationStatus === "verified" || fitment.verified === true);
  const fav = isFavorite("part", part.id);
  const names = part.name || {};
  const images = part.images || [];
  imageIndex = Math.min(imageIndex, Math.max(0, images.length - 1));
  const currentImage = images[imageIndex];
  const imageSrc = safeAsset(typeof currentImage === "string" ? currentImage : currentImage?.src || currentImage?.path);
  const imageHtml = imageSrc ? `<div class="part-gallery"><img src="${safeText(imageSrc)}" alt="${safeText(localized(currentImage?.caption || names) || localized(names))}" loading="lazy"><div class="gallery-controls"><button id="imagePrev" ${images.length < 2 ? "disabled" : ""}>‹</button><span>${imageIndex + 1} / ${images.length}</span><button id="imageNext" ${images.length < 2 ? "disabled" : ""}>›</button></div><small>${safeText(currentImage?.source || part.imageSource || "")}${currentImage?.license ? ` · ${safeText(currentImage.license)}` : ""}</small></div>` : `<p class="muted">${tr("noImages")}</p>`;
  box.innerHTML = `<h3>${safeText(localized(names) || tr("part"))}</h3><div class="part-meta">${numberHtml}<span class="tag">${isVerified ? tr("verified") : tr("unverified")}</span></div><div class="language-names">${makeRow("العربية", names.ar)}${makeRow("English", names.en)}${makeRow("Français", names.fr)}</div>${makeRow(tr("function"), localized(part.function))}${makeRow(tr("location"), localized(part.location))}<h4>${tr("references")}</h4><p>${references.length ? references.map(safeText).join(" · ") : "—"}</p><h4>${tr("fitment")}</h4>${fitments.length ? fitments.map((fitment) => `<p class="verified-fitment">${safeText(fitment.vehicle || fitment.vehicleId || "")} ${safeText(fitment.engine || fitment.engineCode || "")} · ${safeText(fitment.source || "")}</p>`).join("") : `<p class="muted">${tr("noFitment")}</p>`}<h4>${tr("images")}</h4>${imageHtml}<p class="source-line">${tr("source")}: ${safeText(part.source || part.sourceUrl || "—")}</p><button id="partFavBtn" class="favorite-btn">${fav ? tr("saved") : tr("save")} ★</button>`;
  $("#partFavBtn").onclick = () => { toggleFavorite("part", part.id); renderPartDetails(); renderFavorites(); };
  $("#imagePrev")?.addEventListener("click", () => { imageIndex = (imageIndex - 1 + images.length) % images.length; renderPartDetails(); });
  $("#imageNext")?.addEventListener("click", () => { imageIndex = (imageIndex + 1) % images.length; renderPartDetails(); });
}
function renderDiagramParts() {
  const items = currentDiagramItems();
  $("#diagramParts").innerHTML = items.map((item) => {
    const part = db.parts.find((entry) => entry.id === item.partId);
    if (!part) return "";
    return `<button class="part-row part-row-button" data-part="${safeText(part.id)}"><span class="part-num">${safeText(item.callout)}</span><span class="grow"><strong>${safeText(localized(part.name))}</strong><small>${safeText(part.oem || tr("noOEM"))}</small></span></button>`;
  }).join("") || `<div class="empty">${safeText(({ ar: "لا توجد أرقام مرتبطة بهذا المخطط.", en: "No callouts are linked to this diagram.", fr: "Aucun repère n’est lié à ce schéma." })[lang])}</div>`;
  $$('[data-part]').forEach((button) => button.addEventListener("click", () => { selectedPartId = button.dataset.part; renderDiagram(); }));
}
function readFavorites() {
  try {
    const value = JSON.parse(localStorage.getItem("ape-favs") || "[]");
    return value.map((item) => typeof item === "string" ? { type: "part", id: item } : item).filter((item) => item && typeof item.id === "string");
  } catch { return []; }
}
function getFavs() { return readFavorites(); }
function isFavorite(type, id) { return Boolean(id) && getFavs().some((item) => item.type === type && item.id === id); }
function toggleFavorite(type, id) {
  if (!id) return;
  let favorites = getFavs();
  favorites = isFavorite(type, id) ? favorites.filter((item) => !(item.type === type && item.id === id)) : [...favorites, { type, id }];
  localStorage.setItem("ape-favs", JSON.stringify(favorites));
}
function renderFavorites() {
  const favorites = getFavs();
  const rows = favorites.map((favorite) => {
    if (favorite.type === "vehicle") {
      const vehicle = db.vehicles.find((item) => item.id === favorite.id);
      return vehicle ? `<div class="part-row"><span class="grow"><strong>${safeText(vehicle.make)} ${safeText(vehicle.model)}</strong><small>${safeText(vehicleMetaLabel(vehicle))}</small></span><button data-open-vehicle="${safeText(vehicle.id)}">${tr("open")}</button><button data-remove-favorite="vehicle|${safeText(vehicle.id)}" class="secondary">${tr("remove")}</button></div>` : "";
    }
    if (favorite.type === "diagram") {
      const diagram = db.diagrams.find((item) => item.id === favorite.id);
      const assembly = db.assemblies.find((item) => item.diagramId === favorite.id);
      return diagram ? `<div class="part-row"><span class="grow"><strong>${safeText(assembly ? localized(assembly.name) : diagram.title)}</strong><small>${safeText(diagram.source || "")}</small></span><button data-open-diagram="${safeText(diagram.id)}">${tr("open")}</button><button data-remove-favorite="diagram|${safeText(diagram.id)}" class="secondary">${tr("remove")}</button></div>` : "";
    }
    const part = db.parts.find((item) => item.id === favorite.id);
    return part ? `<div class="part-row"><span class="grow"><strong>${safeText(localized(part.name))}</strong><small>${safeText(part.oem || tr("noOEM"))}</small></span><button data-open-part="${safeText(part.id)}">${tr("open")}</button><button data-remove-favorite="part|${safeText(part.id)}" class="secondary">${tr("remove")}</button></div>` : "";
  }).join("");
  $("#favoritesList").innerHTML = rows || `<div class="empty">${tr("empty")}</div>`;
  $$('[data-open-vehicle]').forEach((button) => button.addEventListener("click", () => { selectedVehicleId = button.dataset.openVehicle; renderSystems(); setTab("systems"); }));
  $$('[data-open-part]').forEach((button) => button.addEventListener("click", () => { selectedPartId = button.dataset.openPart; setTab("diagram"); }));
  $$('[data-open-diagram]').forEach((button) => button.addEventListener("click", () => { const diagram = db.diagrams.find((item) => item.id === button.dataset.openDiagram); selectedAssemblyId = db.assemblies.find((item) => item.diagramId === diagram?.id)?.id || selectedAssemblyId; setTab("diagram"); }));
  $$('[data-remove-favorite]').forEach((button) => button.addEventListener("click", () => { const [type, id] = button.dataset.removeFavorite.split("|"); toggleFavorite(type, id); renderFavorites(); renderSystems(); renderDiagram(); }));
}
function validateUniqueIds(records, name) {
  if (!Array.isArray(records)) return `${name} must be an array`;
  if (records.length > MAX_RECORDS_PER_TABLE) return `${name} exceeds the maximum record count`;
  const seen = new Set();
  for (const row of records) {
    if (!row || typeof row !== "object" || typeof row.id !== "string" || !row.id.trim()) return `${name} contains a record without an id`;
    if (seen.has(row.id)) return `${name} contains duplicate id ${row.id}`;
    seen.add(row.id);
  }
  return "";
}
function isValidData(incoming) {
  if (!incoming || typeof incoming !== "object") return { valid: false, error: "Invalid data object" };
  const required = ["vehicles", "engines", "systems", "assemblies", "parts", "diagrams", "diagramItems"];
  for (const key of required) {
    const error = validateUniqueIds(incoming[key], key);
    if (error) return { valid: false, error };
  }
  const ids = Object.fromEntries(required.map((key) => [key, new Set(incoming[key].map((item) => item.id))]));
  for (const vehicle of incoming.vehicles) {
    if (vehicle.engineIds && !Array.isArray(vehicle.engineIds)) return { valid: false, error: `Vehicle ${vehicle.id} engineIds must be an array` };
    for (const id of vehicle.engineIds || []) if (!ids.engines.has(id)) return { valid: false, error: `Vehicle ${vehicle.id} refers to missing engine ${id}` };
  }
  for (const system of incoming.systems) {
    if (system.assemblyIds && !Array.isArray(system.assemblyIds)) return { valid: false, error: `System ${system.id} assemblyIds must be an array` };
    for (const id of system.assemblyIds || []) if (!ids.assemblies.has(id)) return { valid: false, error: `System ${system.id} refers to missing assembly ${id}` };
  }
  for (const assembly of incoming.assemblies) if (!ids.systems.has(assembly.systemId) || !ids.diagrams.has(assembly.diagramId)) return { valid: false, error: `Assembly ${assembly.id} has a broken system or diagram reference` };
  const assembliesById = new Map(incoming.assemblies.map((assembly) => [assembly.id, assembly]));
  for (const assembly of incoming.assemblies) {
    if (assembly.parentId && (!assembliesById.has(assembly.parentId) || assembliesById.get(assembly.parentId).systemId !== assembly.systemId)) return { valid: false, error: `Assembly ${assembly.id} has an invalid parent` };
    const seen = new Set([assembly.id]);
    let parentId = assembly.parentId;
    while (parentId) {
      if (seen.has(parentId)) return { valid: false, error: `Assembly hierarchy contains a cycle at ${assembly.id}` };
      seen.add(parentId); parentId = assembliesById.get(parentId)?.parentId;
    }
  }
  for (const item of incoming.diagramItems) if (!ids.diagrams.has(item.diagramId) || !ids.parts.has(item.partId)) return { valid: false, error: `Diagram item ${item.id} has a broken diagram or part reference` };
  for (const part of incoming.parts) {
    if (part.images && !Array.isArray(part.images)) return { valid: false, error: `Part ${part.id} images must be an array` };
    if (part.fitments && !Array.isArray(part.fitments)) return { valid: false, error: `Part ${part.id} fitments must be an array` };
    if (part.images?.some((image) => !safeAsset(typeof image === "string" ? image : image?.src || image?.path))) return { valid: false, error: `Part ${part.id} has an unsupported image path` };
    if (part.images?.some((image) => !image || typeof image === "string" || !(image.license || image.licenseName) || !(image.source || image.sourceId || image.sourceUrl))) return { valid: false, error: `Part ${part.id} has an image without license and source information` };
    if ((part.fitments || []).some((fitment) => (fitment.verificationStatus === "verified" || fitment.verified === true) && !(fitment.source && fitment.evidenceUrl))) return { valid: false, error: `Part ${part.id} has a verified fitment without source evidence` };
  }
  for (const diagram of incoming.diagrams) {
    if (diagram.assetUri && !safeAsset(diagram.assetUri)) return { valid: false, error: `Diagram ${diagram.id} has an unsupported image path` };
    if (!(diagram.license || diagram.licenseName) || !(diagram.source || diagram.sourceId || diagram.sourceUrl)) return { valid: false, error: `Diagram ${diagram.id} is missing license or source information` };
  }
  return { valid: true, error: "" };
}
function showToast(message) {
  const box = $("#toast");
  if (!box) return;
  box.textContent = message; box.hidden = false;
  window.clearTimeout(showToast.timer); showToast.timer = window.setTimeout(() => { box.hidden = true; }, 3200);
}
function download(content, name, type) {
  const anchor = document.createElement("a"); const url = URL.createObjectURL(new Blob([content], { type }));
  anchor.href = url; anchor.download = name; anchor.click(); window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
async function importDataPack() {
  const file = $("#importFile").files[0];
  if (!file) { showToast("Choose a JSON file first."); return; }
  if (file.size > MAX_PACK_BYTES) { showToast("File is larger than 25 MB."); return; }
  try {
    const parsed = JSON.parse(await file.text());
    if (parsed.manifest?.schemaVersion && Number(parsed.manifest.schemaVersion) > 1) throw new Error("This pack requires a newer schema version.");
    if (parsed.manifest && parsed.manifest.kind !== "backup") {
      const sources = parsed.manifest.sources;
      if (!parsed.manifest.packId || !parsed.manifest.version || !Array.isArray(sources) || !sources.length) throw new Error("Pack manifest is missing its id, version, or data sources.");
      if (sources.some((source) => !source.name || !source.url || !source.license)) throw new Error("Each source must include its name, URL, and redistribution license.");
    }
    const incoming = parsed.db || parsed.data || parsed;
    const result = isValidData(incoming);
    if (!result.valid) throw new Error(result.error);
    const count = incoming.vehicles.length;
    if (!window.confirm(`Replace the local catalog with this validated pack (${count} vehicles)? Export a backup first if needed.`)) return;
    db = incoming;
    selectedVehicleId = db.vehicles[0]?.id || null;
    selectedSystemId = db.systems[0]?.id || null;
    selectedAssemblyId = db.assemblies[0]?.id || null;
    selectedPartId = db.parts[0]?.id || null;
    $("#search").value = ""; vehicleLimit = 100; $("#searchResults").hidden = true;
    if (parsed.manifest?.kind === "backup" && Array.isArray(parsed.favorites)) {
      const allowed = { vehicle: new Set(db.vehicles.map((item) => item.id)), part: new Set(db.parts.map((item) => item.id)), diagram: new Set(db.diagrams.map((item) => item.id)), assembly: new Set(db.assemblies.map((item) => item.id)) };
      const favorites = parsed.favorites.filter((item) => item && Object.prototype.hasOwnProperty.call(allowed, item.type) && allowed[item.type].has(item.id));
      localStorage.setItem("ape-favs", JSON.stringify(favorites));
    }
    await saveDB(); renderVehicles(); renderSystems(); renderDiagram(); renderFavorites();
    showToast(`Imported ${count} vehicles. Data stays on this device.`);
  } catch (error) { showToast(`Import rejected: ${error.message}`); }
}
async function loadVehiclesPack() {
  const button = $("#loadVehiclesPackBtn");
  button.disabled = true;
  try {
    const response = await fetch("./data/packs/vehiclesdb-open-cars.json");
    if (!response.ok) throw new Error("Bundled vehicle pack could not be loaded.");
    const parsed = await response.json();
    const sources = parsed.manifest?.sources;
    if (!parsed.manifest?.packId || !Array.isArray(sources) || !sources.length || sources.some((source) => !source.name || !source.url || !source.license)) throw new Error("Vehicle pack source manifest is invalid.");
    const incoming = parsed.db;
    const result = isValidData(incoming);
    if (!result.valid) throw new Error(result.error);
    const vehicleCount = new Intl.NumberFormat(lang).format(incoming.vehicles.length);
    const makeCount = new Intl.NumberFormat(lang).format(new Set(incoming.vehicles.map((vehicle) => vehicle.make)).size);
    const confirmText = {
      ar: `ستستبدل هذه الحزمة قاعدة البيانات المحلية بأسماء ${vehicleCount} طرازاً من ${makeCount} شركة. لا تتضمن قطعاً أو سنوات أو أجيالاً أو محركات. متابعة؟`,
      en: `Replace the local database with ${vehicleCount} nameplates from ${makeCount} makes? This pack has no parts, years, generations, or engines. Continue?`,
      fr: `Remplacer la base locale par ${vehicleCount} modèles de ${makeCount} marques ? Ce paquet ne contient ni pièces, années, générations ou moteurs. Continuer ?`
    }[lang];
    if (!window.confirm(confirmText)) return;
    db = incoming;
    selectedVehicleId = db.vehicles[0]?.id || null;
    selectedSystemId = null; selectedAssemblyId = null; selectedPartId = null;
    $("#search").value = ""; vehicleLimit = 100; $("#searchResults").hidden = true;
    const vehicleIds = new Set(db.vehicles.map((vehicle) => vehicle.id));
    localStorage.setItem("ape-favs", JSON.stringify(getFavs().filter((item) => item.type === "vehicle" && vehicleIds.has(item.id))));
    await saveDB(); renderVehicles(); renderSystems(); renderDiagram(); renderFavorites(); applyLanguage();
    showToast({ ar: "تم تحميل قاعدة أسماء السيارات. لا توجد بيانات قطع ضمن هذه الحزمة.", en: "Vehicle name catalog loaded. This pack contains no parts data.", fr: "Catalogue des noms chargé. Ce paquet ne contient aucune donnée de pièces." }[lang]);
  } catch (error) { showToast(`Pack rejected: ${error.message}`); }
  finally { button.disabled = false; }
}
function applyLanguage() {
  document.documentElement.lang = lang;
  document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
  const staticLabels = {
    ar: { subtitle: "مرجع تقني تفاعلي لقطع السيارات", vehiclesHeading: "اختيار السيارة", vehiclesHelp: "اختر مركبة لعرض الأنظمة والتجميعات المتاحة في الحزمة المحلية.", systemsHeading: "أنظمة السيارة", diagramHeading: "مخطط تفاعلي", resetView: "إعادة العرض", calloutList: "قائمة أرقام المخطط", favoritesHeading: "المفضلة", favoritesHelp: "تُحفظ محلياً على هذا الجهاز.", dataHelp: "استورد حزم بيانات مرخصة ومتحققاً من مصدرها.", importHeading: "استيراد حزمة JSON", backupHeading: "نسخة احتياطية", backupHelp: "صدّر قاعدة البيانات والمفضلة للاحتفاظ بها أو نقلها.", sourcesHeading: "مصادر بيانات للاستكشاف", legalNotice: "لا تستورد رسومات أو كتالوجات محمية دون إذن. الرقم والتوافق غير مؤكدين إلا إذا وثقهما مصدر موثوق.", demoVersion: "إصدار تجريبي", install: "تثبيت التطبيق" },
    en: { subtitle: "Interactive automotive parts reference", vehiclesHeading: "Choose a vehicle", vehiclesHelp: "Select a vehicle to browse the systems and assemblies in the local pack.", systemsHeading: "Vehicle systems", diagramHeading: "Interactive diagram", resetView: "Reset view", calloutList: "Diagram callouts", favoritesHeading: "Favorites", favoritesHelp: "Saved locally on this device.", dataHelp: "Import licensed data packs with traceable sources.", importHeading: "Import JSON data pack", backupHeading: "Backup", backupHelp: "Export your local catalog and favorites.", sourcesHeading: "Data sources to explore", legalNotice: "Do not import copyrighted catalogs or drawings without permission. Part numbers and fitment are unverified unless backed by a trusted source.", demoVersion: "Demo version", install: "Install app" },
    fr: { subtitle: "Référence interactive des pièces automobiles", vehiclesHeading: "Choisir un véhicule", vehiclesHelp: "Choisissez un véhicule pour parcourir les systèmes et sous-ensembles locaux.", systemsHeading: "Systèmes du véhicule", diagramHeading: "Schéma interactif", resetView: "Réinitialiser", calloutList: "Repères du schéma", favoritesHeading: "Favoris", favoritesHelp: "Enregistrés localement sur cet appareil.", dataHelp: "Importez des paquets de données sous licence et avec source traçable.", importHeading: "Importer un paquet JSON", backupHeading: "Sauvegarde", backupHelp: "Exportez le catalogue local et les favoris.", sourcesHeading: "Sources de données à explorer", legalNotice: "N’importez pas de catalogues ou dessins protégés sans autorisation. Les références et la compatibilité restent non vérifiées sans source fiable.", demoVersion: "Version démo", install: "Installer l’application" }
  };
  const packLabels = {
    ar: { vehiclesPackHeading: "قاعدة أسماء المركبات المجانية", vehiclesPackHelp: "تتضمن 5,541 اسماً لطراز سيارات من قاعدة VehiclesDB؛ لا تحتوي على أجيال أو سنوات أو محركات أو قطع أو مخططات.", loadVehiclesPack: "تحميل بيانات أسماء السيارات", downloadVehiclesPack: "تنزيل ملف الحزمة" },
    en: { vehiclesPackHeading: "Free vehicle-name catalog", vehiclesPackHelp: "Includes 5,541 car nameplates from VehiclesDB; no generations, years, engines, parts, or diagrams are included.", loadVehiclesPack: "Load car name data", downloadVehiclesPack: "Download pack file" },
    fr: { vehiclesPackHeading: "Catalogue gratuit des noms de véhicules", vehiclesPackHelp: "Comprend 5 541 modèles automobiles de VehiclesDB ; sans générations, années, moteurs, pièces ni schémas.", loadVehiclesPack: "Charger les noms de voitures", downloadVehiclesPack: "Télécharger le paquet" }
  };
  $$('[data-i18n]').forEach((element) => { const key = element.dataset.i18n; const translated = staticLabels[lang]?.[key] || packLabels[lang]?.[key]; if (translated) element.textContent = translated; });
  $$("[data-tab]").forEach((button) => { button.textContent = tr(button.dataset.tab); });
  $("#search").placeholder = tr("search");
  $("#search").setAttribute("aria-label", tr("search"));
  $("#clearSearch").textContent = tr("clear");
  $("#diagramHint").textContent = tr("tap");
  $("#demoNotice").textContent = db.meta?.demo ? tr("demoNotice") : (localized(db.meta?.notice) || tr("demoNotice"));
  const attribution = $("#dataAttribution");
  if (attribution) {
    const fromVehiclesDB = String(db.meta?.sourceId || "").startsWith("vehiclesdb:");
    attribution.hidden = !fromVehiclesDB;
    attribution.innerHTML = fromVehiclesDB ? `Vehicle data by <a href="https://vehiclesdb.com" target="_blank" rel="noopener noreferrer">VehiclesDB</a> · CC BY 4.0 · ${safeText(lang === "ar" ? "احتفظ بإشعارات المصادر الأصلية في ملف ATTRIBUTION المرفق." : lang === "fr" ? "Conservez les avis des sources dans le fichier ATTRIBUTION fourni." : "Retain source notices in the included ATTRIBUTION file.")}` : "";
  }
  $("#dataTitle").textContent = tr("data");
  $("#importBtn").textContent = tr("import");
  $("#exportBtn").textContent = tr("export");
  $("#resetBtn").textContent = tr("reset");
  $("#importHelp").textContent = tr("importHelp");
  renderVehicles(); renderSearchResults(); renderSystems(); renderDiagram(); renderFavorites();
}
function transformDiagram() {
  const content = $("#diagramContent");
  if (content) content.setAttribute("transform", `translate(${tx} ${ty}) scale(${scale})`);
}
function zoomAt(nextScale, clientX, clientY) {
  const viewport = $("#diagramViewport");
  const bounds = viewport.getBoundingClientRect();
  const px = clientX - bounds.left - bounds.width / 2;
  const py = clientY - bounds.top - bounds.height / 2;
  const factor = nextScale / scale;
  tx = px - (px - tx) * factor;
  ty = py - (py - ty) * factor;
  scale = nextScale;
  transformDiagram();
}
function setZoom(value) { scale = Math.max(0.55, Math.min(4, value)); transformDiagram(); }
function setupDiagramGestures() {
  const viewport = $("#diagramViewport");
  viewport.addEventListener("pointerdown", (event) => {
    if (event.target.closest("[data-hit]")) return;
    viewport.setPointerCapture(event.pointerId);
    pointerMap.set(event.pointerId, { x: event.clientX, y: event.clientY });
    if (pointerMap.size === 1) drag = { x: event.clientX - tx, y: event.clientY - ty };
    if (pointerMap.size === 2) {
      const points = [...pointerMap.values()];
      pinchStart = { distance: Math.hypot(points[0].x - points[1].x, points[0].y - points[1].y), scale };
      drag = null;
    }
  });
  viewport.addEventListener("pointermove", (event) => {
    if (!pointerMap.has(event.pointerId)) return;
    pointerMap.set(event.pointerId, { x: event.clientX, y: event.clientY });
    if (pointerMap.size === 2 && pinchStart) {
      const points = [...pointerMap.values()];
      const distance = Math.hypot(points[0].x - points[1].x, points[0].y - points[1].y);
      setZoom(pinchStart.scale * distance / Math.max(pinchStart.distance, 1));
    } else if (drag && pointerMap.size === 1) {
      tx = event.clientX - drag.x; ty = event.clientY - drag.y; transformDiagram();
    }
  });
  ["pointerup", "pointercancel", "lostpointercapture"].forEach((eventName) => viewport.addEventListener(eventName, (event) => {
    pointerMap.delete(event.pointerId);
    if (pointerMap.size < 2) pinchStart = null;
    if (pointerMap.size === 1) { const point = [...pointerMap.values()][0]; drag = { x: point.x - tx, y: point.y - ty }; }
    else drag = null;
  }));
  viewport.addEventListener("wheel", (event) => {
    event.preventDefault(); zoomAt(Math.max(0.55, Math.min(4, scale * (event.deltaY < 0 ? 1.12 : 0.89))), event.clientX, event.clientY);
  }, { passive: false });
  $("#zoomIn").addEventListener("click", () => setZoom(scale + 0.2));
  $("#zoomOut").addEventListener("click", () => setZoom(scale - 0.2));
  $("#zoomReset").addEventListener("click", () => { scale = 1; tx = 0; ty = 0; transformDiagram(); });
}
async function initialize() {
  await loadDB();
  selectedVehicleId = db.vehicles[0]?.id || null;
  selectedAssemblyId = db.assemblies[0]?.id || null;
  selectedPartId = db.parts[0]?.id || null;
  $("#search").addEventListener("input", () => { vehicleLimit = 100; renderVehicles(); renderSearchResults(); });
  $("#clearSearch").addEventListener("click", () => { $("#search").value = ""; vehicleLimit = 100; renderVehicles(); renderSearchResults(); $("#search").focus(); });
  $$(".tab").forEach((button) => button.addEventListener("click", () => setTab(button.dataset.tab)));
  $("#langBtn").addEventListener("click", () => { lang = lang === "ar" ? "en" : lang === "en" ? "fr" : "ar"; applyLanguage(); });
  $("#exportBtn").addEventListener("click", () => download(JSON.stringify({ manifest: { kind: "backup", packId: "local-backup", version: "1.0.0", schemaVersion: 1, exportedAt: new Date().toISOString() }, db, favorites: getFavs() }, null, 2), "autoparts-backup.json", "application/json"));
  $("#importBtn").addEventListener("click", importDataPack);
  $("#loadVehiclesPackBtn").addEventListener("click", loadVehiclesPack);
  $("#resetBtn").addEventListener("click", async () => {
    if (!window.confirm("Replace the local database with the illustrative demo data?")) return;
    db = clone(demo); selectedVehicleId = db.vehicles[0].id; selectedAssemblyId = db.assemblies[0].id; selectedPartId = db.parts[0].id;
    $("#search").value = ""; vehicleLimit = 100; $("#searchResults").hidden = true;
    await saveDB(); renderVehicles(); renderSystems(); renderDiagram(); renderFavorites();
  });
  setupDiagramGestures();
  $("#offlineStatus").textContent = navigator.onLine ? tr("online") : tr("offline");
  window.addEventListener("online", () => { $("#offlineStatus").textContent = tr("online"); });
  window.addEventListener("offline", () => { $("#offlineStatus").textContent = tr("offline"); });
  window.addEventListener("beforeinstallprompt", (event) => { event.preventDefault(); const button = $("#installBtn"); button.hidden = false; button.onclick = async () => { event.prompt(); await event.userChoice; button.hidden = true; }; });
  if ("serviceWorker" in navigator && (location.protocol === "https:" || location.hostname === "localhost")) navigator.serviceWorker.register("./sw.js").catch(() => {});
  applyLanguage();
}

initialize().catch((error) => { console.error(error); showToast("Unable to load local catalog."); });
