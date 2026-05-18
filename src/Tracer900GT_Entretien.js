import { useState, useEffect } from "react";

// ─── DONNÉES ─────────────────────────────────────────────────────────────────
// Intervalles extraits du manuel Yamaha Tracer 900 GT 2019 :
//   Paliers km  : 1 000 · 10 000 · 20 000 · 30 000 · 40 000 (puis on répète)
//   Contrôle annuel : indépendamment des km, chaque année
// Les items marqués "annual" sont à faire chaque année SI le palier km
// n'a pas déjà été atteint dans l'année.

const MAINTENANCE_ITEMS = [
  // ── Contrôle des émissions ──
  {
    id: 1, category: "emission", icon: "⛽",
    label: "Ligne de carburant",
    description: "Vérifier les durites pour fissures ou dommages. Remplacer si nécessaire.",
    intervals: [10000, 20000, 30000, 40000],
    annual: false,
    estimatedCost: 0,
    costNote: "Inspection gratuite / Remplacement ~30–60 €",
  },
  {
    id: 2, category: "emission", icon: "🔩",
    label: "Bougies d'allumage",
    description: "Vérifier l'état, ajuster l'écartement et nettoyer. Remplacer si nécessaire.",
    intervals: [10000, 20000, 30000, 40000],
    annual: false,
    estimatedCost: 40,
    costNote: "~40 € (jeu de 3 bougies NGK)",
  },
  {
    id: 3, category: "emission", icon: "🔧",
    label: "Jeu aux soupapes",
    description: "Vérifier et ajuster le jeu aux soupapes.",
    intervals: [20000, 40000],
    annual: false,
    estimatedCost: 150,
    costNote: "~100–200 € (main-d'œuvre + pièces si réglage requis)",
  },
  {
    id: 4, category: "emission", icon: "💉",
    label: "Injection / Ralenti",
    description: "Vérifier le régime de ralenti et synchronisation des papillons.",
    intervals: [1000, 10000, 20000, 30000, 40000],
    annual: true,
    estimatedCost: 60,
    costNote: "~50–80 € (prestation atelier)",
  },
  {
    id: 5, category: "emission", icon: "💨",
    label: "Système d'échappement",
    description: "Vérifier l'absence de fuite. Serrer ou remplacer les joints si nécessaire.",
    intervals: [1000, 10000, 20000, 30000, 40000],
    annual: true,
    estimatedCost: 0,
    costNote: "Inspection gratuite / Joints ~20 €",
  },
  {
    id: 6, category: "emission", icon: "🌿",
    label: "Système d'évaporation",
    description: "Vérifier le système de contrôle pour dommages. Remplacer si nécessaire.",
    intervals: [10000, 20000, 30000, 40000],
    annual: false,
    estimatedCost: 0,
    costNote: "Inspection gratuite",
  },
  {
    id: 7, category: "emission", icon: "💧",
    label: "Système d'induction d'air",
    description: "Vérifier la valve d'arrêt d'air, la valve à roseau et les durites pour dommages. Remplacer si nécessaire.",
    intervals: [10000, 20000, 30000, 40000],
    annual: false,
    estimatedCost: 0,
    costNote: "Inspection gratuite / Pièces ~30–60 €",
  },
  // ── Entretien général ──
  {
    id: 8, category: "general", icon: "🖥️",
    label: "Diagnostic électronique",
    description: "Inspection dynamique avec l'outil de diagnostic Yamaha. Vérifier les codes erreur.",
    intervals: [1000, 10000, 20000, 30000, 40000],
    annual: true,
    estimatedCost: 50,
    costNote: "~40–60 € (prestation atelier)",
  },
  {
    id: 9, category: "general", icon: "🌬️",
    label: "Filtre à air",
    description: "Remplacer l'élément filtrant (filtre à huile non soufflable à l'air comprimé).",
    intervals: [20000, 40000],
    annual: false,
    estimatedCost: 35,
    costNote: "~25–40 € (filtre + pose)",
  },
  {
    id: 10, category: "general", icon: "🤝",
    label: "Embrayage",
    description: "Vérifier le fonctionnement et ajuster.",
    intervals: [1000, 10000, 20000, 30000, 40000],
    annual: true,
    estimatedCost: 0,
    costNote: "Réglage gratuit / câble ~30 € si remplacement",
  },
  {
    id: 11, category: "general", icon: "🛑",
    label: "Frein avant",
    description: "Vérifier fonctionnement, niveau de liquide, fuites. Remplacer plaquettes si nécessaire.",
    intervals: [1000, 10000, 20000, 30000, 40000],
    annual: true,
    estimatedCost: 40,
    costNote: "~30–50 € (plaquettes) / liquide ~10 €",
  },
  {
    id: 12, category: "general", icon: "🛑",
    label: "Frein arrière",
    description: "Vérifier fonctionnement, niveau de liquide, fuites. Remplacer plaquettes si nécessaire.",
    intervals: [1000, 10000, 20000, 30000, 40000],
    annual: true,
    estimatedCost: 30,
    costNote: "~20–40 € (plaquettes) / liquide ~10 €",
  },
  {
    id: 13, category: "general", icon: "🔗",
    label: "Durites de frein",
    description: "Vérifier fissures et dommages. Remplacer toutes les 4 ans.",
    intervals: [40000],
    annual: false,
    estimatedCost: 80,
    costNote: "~60–100 € (kit durites aviation)",
  },
  {
    id: 14, category: "general", icon: "🧴",
    label: "Liquide de frein",
    description: "Changer le liquide de frein (tous les 2 ans ou 20 000 km).",
    intervals: [20000, 40000],
    annual: false,
    estimatedCost: 30,
    costNote: "~20–40 € (liquide DOT4 + main-d'œuvre)",
  },
  {
    id: 15, category: "general", icon: "⭕",
    label: "Roues",
    description: "Vérifier le voile et dommages. Remplacer si nécessaire.",
    intervals: [10000, 20000, 30000, 40000],
    annual: false,
    estimatedCost: 0,
    costNote: "Inspection gratuite / jante ~200–400 € si remplacement",
  },
  {
    id: 16, category: "general", icon: "🏍️",
    label: "Pneus",
    description: "Vérifier profondeur de la bande de roulement, dommages et pression.",
    intervals: [1000, 10000, 20000, 30000, 40000],
    annual: true,
    estimatedCost: 0,
    costNote: "Pneus ~100–200 € pièce (Michelin Road 6, etc.)",
  },
  {
    id: 17, category: "general", icon: "⚙️",
    label: "Roulements de roues",
    description: "Vérifier jeu excessif ou dommages.",
    intervals: [20000, 40000],
    annual: false,
    estimatedCost: 60,
    costNote: "~50–80 € (roulements + main-d'œuvre)",
  },
  {
    id: 18, category: "general", icon: "⚙️",
    label: "Roulements de bras oscillant",
    description: "Vérifier fonctionnement et jeu excessif. Graisser à la graisse lithium.",
    intervals: [20000, 40000],
    annual: false,
    estimatedCost: 80,
    costNote: "~60–100 € (roulements + graisse lithium + pose)",
  },
  {
    id: 19, category: "general", icon: "🔗",
    label: "Chaîne de transmission",
    description: "Vérifier tension, alignement et état. Ajuster et lubrifier avec lubrifiant O-ring spécial.",
    intervals: "every_ride",
    annual: false,
    estimatedCost: 15,
    costNote: "~10–20 € (lubrifiant chaîne O-ring) / Kit chaîne ~150 €",
  },
  {
    id: 20, category: "general", icon: "🧭",
    label: "Roulements de direction",
    description: "Vérifier jeu des roulements. Repack modéré avec graisse lithium.",
    intervals: [20000, 40000],
    annual: false,
    estimatedCost: 70,
    costNote: "~50–90 € (roulements + graisse + main-d'œuvre)",
  },
  {
    id: 21, category: "general", icon: "🔩",
    label: "Fixations châssis",
    description: "Vérifier que tous les écrous, boulons et vis sont correctement serrés.",
    intervals: [1000, 10000, 20000, 30000, 40000],
    annual: true,
    estimatedCost: 0,
    costNote: "Inclus dans la révision",
  },
  {
    id: 22, category: "general", icon: "🦯",
    label: "Béquille / Pivots de frein & embrayage",
    description: "Vérifier fonctionnement. Lubrifier avec graisse lithium/silicone.",
    intervals: [10000, 20000, 30000, 40000],
    annual: false,
    estimatedCost: 5,
    costNote: "~5 € (graisse)",
  },
  {
    id: 23, category: "general", icon: "🔌",
    label: "Contacteur de béquille latérale",
    description: "Vérifier le fonctionnement et remplacer si nécessaire.",
    intervals: [1000, 10000, 20000, 30000, 40000],
    annual: true,
    estimatedCost: 20,
    costNote: "~15–30 € (contacteur)",
  },
  {
    id: 24, category: "general", icon: "🏗️",
    label: "Fourche avant",
    description: "Vérifier fonctionnement et fuites d'huile. Remplacer si nécessaire.",
    intervals: [10000, 20000, 30000, 40000],
    annual: false,
    estimatedCost: 0,
    costNote: "Inspection gratuite / joints spi ~80–150 € si remplacement",
  },
  {
    id: 25, category: "general", icon: "🏗️",
    label: "Amortisseur arrière",
    description: "Vérifier fonctionnement et fuites d'huile.",
    intervals: [10000, 20000, 30000, 40000],
    annual: false,
    estimatedCost: 0,
    costNote: "Inspection gratuite / révision ~100–200 €",
  },
  {
    id: 26, category: "general", icon: "🔗",
    label: "Biellettes de suspension arrière",
    description: "Vérifier fonctionnement des points de pivot des bras et biellettes arrière.",
    intervals: [20000, 40000],
    annual: false,
    estimatedCost: 0,
    costNote: "Inspection gratuite",
  },
  {
    id: 27, category: "general", icon: "🛢️",
    label: "Huile moteur + filtre",
    description: "Vidange (moteur chaud). Vérifier niveau et absence de fuite. Remplacer le filtre à huile.",
    intervals: [1000, 10000, 20000, 30000, 40000],
    annual: true,
    estimatedCost: 50,
    costNote: "~40–60 € (huile 10W40 Yamalube + filtre + vidange)",
  },
  {
    id: 28, category: "general", icon: "🌡️",
    label: "Système de refroidissement",
    description: "Vérifier niveau de liquide de refroidissement et fuites. Changer tous les 2 ans.",
    intervals: [20000, 40000],
    annual: false,
    estimatedCost: 30,
    costNote: "~20–40 € (antigel Yamaha + main-d'œuvre)",
  },
  {
    id: 29, category: "general", icon: "💡",
    label: "Contacteurs de frein av/arr",
    description: "Vérifier le fonctionnement des contacteurs de frein.",
    intervals: [1000, 10000, 20000, 30000, 40000],
    annual: true,
    estimatedCost: 0,
    costNote: "Inclus dans la révision",
  },
  {
    id: 30, category: "general", icon: "🪝",
    label: "Pièces mobiles & câbles",
    description: "Lubrifier toutes les pièces mobiles et câbles.",
    intervals: [10000, 20000, 30000, 40000],
    annual: false,
    estimatedCost: 15,
    costNote: "~10–20 € (lubrifiant câbles)",
  },
  {
    id: 31, category: "general", icon: "🎮",
    label: "Poignée des gaz & câble",
    description: "Vérifier fonctionnement, jeu libre. Lubrifier le boîtier, le câble et le fil de chauffage.",
    intervals: [1000, 10000, 20000, 30000, 40000],
    annual: true,
    estimatedCost: 10,
    costNote: "~5–15 € (lubrifiant) / câble ~30 € si remplacement",
  },
  {
    id: 32, category: "general", icon: "💡",
    label: "Éclairage, signaux & commutateurs",
    description: "Vérifier le fonctionnement et régler le faisceau du phare.",
    intervals: [1000, 10000, 20000, 30000, 40000],
    annual: true,
    estimatedCost: 0,
    costNote: "Inclus dans la révision / ampoule LED ~20–50 €",
  },
];

// ─── Plans par palier km ──────────────────────────────────────────────────────

const KM_PLANS = [
  { km: 1000,  label: "Rodage",          type: "Contrôle initial",   color: "#00b4ff", icon: "🔰" },
  { km: 10000, label: "Révision",        type: "Entretien standard", color: "#a78bfa", icon: "🔧" },
  { km: 20000, label: "Révision +",      type: "Entretien majeur",   color: "#f59e0b", icon: "⭐" },
  { km: 30000, label: "Révision",        type: "Entretien standard", color: "#a78bfa", icon: "🔧" },
  { km: 40000, label: "Grande révision", type: "Entretien complet",  color: "#ef4444", icon: "🏆" },
];

function getItemsForKm(km) {
  return MAINTENANCE_ITEMS.filter(
    (item) => item.intervals !== "every_ride" && item.intervals.includes(km)
  );
}

function getAnnualItems() {
  return MAINTENANCE_ITEMS.filter((item) => item.annual && item.intervals !== "every_ride");
}

// ─── Storage ─────────────────────────────────────────────────────────────────

const STORAGE_KEY = "tracer900gt_v3_log";
function loadLog() {
  try { const r = localStorage.getItem(STORAGE_KEY); return r ? JSON.parse(r) : {}; }
  catch { return {}; }
}
function saveLog(log) { localStorage.setItem(STORAGE_KEY, JSON.stringify(log)); }

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getStatus(item, currentKm, log) {
  if (item.intervals === "every_ride") return log[item.id]?.done ? "ok" : "due";
  const lastKm = log[item.id]?.km ?? 0;
  const diff   = (lastKm + Math.min(...item.intervals)) - currentKm;
  if (diff <= 0) return "overdue";
  if (diff <= 1000) return "soon";
  return "ok";
}

function getNextKm(item, log) {
  if (item.intervals === "every_ride") return "Chaque utilisation";
  const lastKm = log[item.id]?.km ?? 0;
  return `${(lastKm + Math.min(...item.intervals)).toLocaleString("fr-FR")} km`;
}

const SC = {
  ok:      { label: "OK",        color: "#22c55e", bg: "rgba(34,197,94,0.12)"  },
  soon:    { label: "Bientôt",   color: "#f59e0b", bg: "rgba(245,158,11,0.12)" },
  overdue: { label: "En retard", color: "#ef4444", bg: "rgba(239,68,68,0.12)"  },
  due:     { label: "À faire",   color: "#f59e0b", bg: "rgba(245,158,11,0.12)" },
};

// ─── Composant principal ─────────────────────────────────────────────────────

export default function Tracer900GTMaintenance() {
  const [currentKm, setCurrentKm]       = useState(0);
  const [log, setLog]                   = useState(loadLog);
  const [tab, setTab]                   = useState("suivi");
  const [filter, setFilter]             = useState("all");
  const [search, setSearch]             = useState("");
  const [expanded, setExpanded]         = useState(null);
  const [expandedPlan, setExpandedPlan] = useState(null);
  const [annualOpen, setAnnualOpen]     = useState(false);
  const [showModal, setShowModal]       = useState(null);
  const [modalKm, setModalKm]           = useState("");

  useEffect(() => {
    const s = localStorage.getItem("tracer900gt_km");
    if (s) setCurrentKm(Number(s));
  }, []);
  useEffect(() => { saveLog(log); }, [log]);

  function handleKmChange(val) {
    const n = parseInt(val.replace(/\D/g, ""), 10) || 0;
    setCurrentKm(n);
    localStorage.setItem("tracer900gt_km", n);
  }

  function openModal(item) { setShowModal(item); setModalKm(currentKm.toString()); }

  function confirmDone() {
    if (!showModal) return;
    const km = parseInt(modalKm.replace(/\D/g, ""), 10) || currentKm;
    setLog((p) => ({ ...p, [showModal.id]: { km, date: new Date().toLocaleDateString("fr-FR"), done: true } }));
    setShowModal(null);
  }

  function resetItem(id) {
    setLog((p) => { const n = { ...p }; delete n[id]; return n; });
  }

  const filtered = MAINTENANCE_ITEMS.filter((item) => {
    const st = getStatus(item, currentKm, log);
    if (filter === "overdue" && st !== "overdue") return false;
    if (filter === "soon"    && st !== "soon" && st !== "due") return false;
    if (filter === "ok"      && st !== "ok") return false;
    if (search && !item.label.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const stats = {
    ok:      MAINTENANCE_ITEMS.filter((i) => getStatus(i, currentKm, log) === "ok").length,
    soon:    MAINTENANCE_ITEMS.filter((i) => ["soon","due"].includes(getStatus(i, currentKm, log))).length,
    overdue: MAINTENANCE_ITEMS.filter((i) => getStatus(i, currentKm, log) === "overdue").length,
  };

  const nextPlan = KM_PLANS.find((p) => p.km > currentKm);

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div style={s.root}>

      {/* ══ HEADER ══ */}
      <header style={s.header}>
        <div style={s.headerLeft}>
          <div style={s.motoEmoji}>🏍️</div>
          <div>
            <div style={s.brand}>YAMAHA</div>
            <div style={s.model}>TRACER 900 GT</div>
            <div style={s.sub}>Carnet d'entretien numérique · 2019</div>
          </div>
        </div>
        <div style={s.kmBox}>
          <div style={s.kmLabel}>Kilométrage actuel</div>
          <div style={s.kmInputWrap}>
            <input
              type="text"
              value={currentKm.toLocaleString("fr-FR")}
              onChange={(e) => handleKmChange(e.target.value)}
              style={s.kmInput}
            />
            <span style={s.kmUnit}>km</span>
          </div>
          {nextPlan && (
            <div style={s.nextHint}>
              Prochain palier :&nbsp;
              <strong style={{ color: nextPlan.color }}>{nextPlan.km.toLocaleString("fr-FR")} km</strong>
              &nbsp;—&nbsp;
              <strong style={{ color: "#fff" }}>dans {(nextPlan.km - currentKm).toLocaleString("fr-FR")} km</strong>
            </div>
          )}
        </div>
      </header>

      {/* ══ TABS ══ */}
      <div style={s.tabBar}>
        <button style={{ ...s.tabBtn, ...(tab === "suivi" ? s.tabOn : {}) }} onClick={() => setTab("suivi")}>📋 Suivi entretien</button>
        <button style={{ ...s.tabBtn, ...(tab === "plans" ? s.tabOn : {}) }} onClick={() => setTab("plans")}>📅 Plans par km</button>
      </div>

      {/* ════════════ TAB SUIVI ════════════ */}
      {tab === "suivi" && (
        <>
          <div style={s.statsRow}>
            {[["ok","✅","À jour"],["soon","⏰","À venir"],["overdue","🚨","En retard"]].map(([k,ic,lb]) => (
              <div key={k}
                style={{ ...s.statCard, borderColor: SC[k==="soon"?"soon":k].color, cursor:"pointer", outline: filter===k ? `2px solid ${SC[k==="soon"?"soon":k].color}` : "none" }}
                onClick={() => setFilter(filter===k ? "all" : k)}>
                <div style={s.statIco}>{ic}</div>
                <div style={{ ...s.statNum, color: SC[k==="soon"?"soon":k].color }}>{stats[k]}</div>
                <div style={s.statLbl}>{lb}</div>
              </div>
            ))}
          </div>

          <div style={s.toolbar}>
            <input type="text" placeholder="🔍  Rechercher…" value={search} onChange={(e) => setSearch(e.target.value)} style={s.searchInput} />
            {["all","overdue","soon","ok"].map((f) => (
              <button key={f} style={{ ...s.fBtn, ...(filter===f ? s.fOn : {}) }} onClick={() => setFilter(f)}>
                {{ all:"Tous", overdue:"En retard", soon:"Bientôt", ok:"OK" }[f]}
              </button>
            ))}
          </div>

          <div style={s.list}>
            {filtered.length === 0 && <div style={s.empty}>Aucun entretien trouvé.</div>}
            {filtered.map((item) => {
              const st    = getStatus(item, currentKm, log);
              const cfg   = SC[st];
              const entry = log[item.id];
              const open  = expanded === item.id;
              return (
                <div key={item.id} style={{ ...s.card, borderLeft: `4px solid ${cfg.color}` }}>
                  <div style={s.cardTop} onClick={() => setExpanded(open ? null : item.id)}>
                    <span style={s.cIcon}>{item.icon}</span>
                    <div style={s.cMain}>
                      <div style={s.cTitle}>
                        {item.label}
                        {item.annual && <span style={s.annualTag}>📅 Annuel</span>}
                      </div>
                      <div style={s.cMeta}>
                        <span style={{ ...s.badge, background: cfg.bg, color: cfg.color }}>{cfg.label}</span>
                        <span style={s.cNext}>Prochain : {getNextKm(item, log)}</span>
                        {entry && <span style={s.cLast}>Dernier : {entry.km.toLocaleString("fr-FR")} km — {entry.date}</span>}
                      </div>
                    </div>
                    <div style={s.costBadge}>{item.estimatedCost > 0 ? `~${item.estimatedCost} €` : "Gratuit"}</div>
                    <div style={s.chev}>{open ? "▲" : "▼"}</div>
                  </div>
                  {open && (
                    <div style={s.cDetail}>
                      <p style={s.dDesc}>{item.description}</p>
                      <div style={s.dCost}>💶 <strong>Coût estimé :</strong> {item.costNote}</div>
                      {item.intervals !== "every_ride" && (
                        <div style={s.dInter}>
                          📅 <strong>Intervalles :</strong> {item.intervals.map((i) => `${i.toLocaleString("fr-FR")} km`).join(" · ")}
                          {item.annual && " · et chaque année"}
                        </div>
                      )}
                      <div style={s.dActions}>
                        <button style={s.btnDone} onClick={() => openModal(item)}>✓ Marquer comme fait</button>
                        {entry && <button style={s.btnReset} onClick={() => resetItem(item.id)}>↺ Réinitialiser</button>}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* ════════════ TAB PLANS PAR KM ════════════ */}
      {tab === "plans" && (
        <div style={s.planWrap}>

          <div style={s.planIntro}>
            Intervalles officiels Yamaha Tracer 900 GT 2019 :&nbsp;
            <strong style={{ color: "#00b4ff" }}>1 000 · 10 000 · 20 000 · 30 000 · 40 000 km</strong>,
            puis on répète à partir de 50 000 km. Les items marqués <span style={s.annualTag}>📅 Annuel</span> doivent
            aussi être effectués <strong>chaque année</strong> même si le palier km n'est pas atteint.
          </div>

          {/* Timeline */}
          <div style={s.tlRow}>
            {KM_PLANS.map((plan, idx) => {
              const done    = currentKm >= plan.km;
              const current = !done && (idx === 0 || currentKm >= KM_PLANS[idx-1].km);
              return (
                <div key={plan.km} style={s.tlStep}>
                  {idx > 0 && <div style={{ ...s.tlLine, background: KM_PLANS[idx-1].km <= currentKm ? KM_PLANS[idx-1].color : "#2a2d3a" }} />}
                  <div
                    style={{ ...s.tlDot, border: `3px solid ${plan.color}`, background: done ? plan.color : current ? plan.color+"33" : "#1a1d27", boxShadow: current ? `0 0 14px ${plan.color}66` : "none" }}
                    onClick={() => setExpandedPlan(expandedPlan === plan.km ? null : plan.km)}
                  >
                    {done ? "✓" : plan.icon}
                  </div>
                  <div style={{ ...s.tlKm,   color: done ? "#5a6080" : current ? "#fff" : "#7a80a0", fontWeight: current ? 800 : 400 }}>{plan.km.toLocaleString("fr-FR")} km</div>
                  <div style={{ ...s.tlName, color: plan.color }}>{plan.label}</div>
                </div>
              );
            })}
          </div>

          {/* Plan cards */}
          {KM_PLANS.map((plan) => {
            const items     = getItemsForKm(plan.km);
            const totalCost = items.reduce((a, i) => a + i.estimatedCost, 0);
            const done      = currentKm >= plan.km;
            const isOpen    = expandedPlan === plan.km;
            const doneItems = items.filter((item) => { const e = log[item.id]; return e && e.km >= plan.km - 2000; });
            const progress  = items.length ? Math.round((doneItems.length / items.length) * 100) : 0;

            return (
              <div key={plan.km} style={{ ...s.planCard, borderLeft: `4px solid ${plan.color}`, opacity: done ? 0.7 : 1 }}>
                <div style={s.planHead} onClick={() => setExpandedPlan(isOpen ? null : plan.km)}>
                  <div style={{ ...s.planHeadIcon, color: plan.color }}>{plan.icon}</div>
                  <div style={s.planHeadInfo}>
                    <div style={s.planHeadTop}>
                      <span style={s.planKm}>{plan.km.toLocaleString("fr-FR")} km</span>
                      <span style={{ ...s.planType, color: plan.color }}>{plan.type}</span>
                      {done && <span style={s.doneBadge}>✓ Passé</span>}
                    </div>
                    <div style={s.planName}>{plan.label}</div>
                    <div style={s.planSubRow}>
                      <span style={s.planCount}>{items.length} opérations</span>
                      <span style={{ ...s.planTotalCost, color: plan.color }}>~{totalCost} € estimés</span>
                    </div>
                    <div style={s.pbWrap}>
                      <div style={s.pbBg}><div style={{ ...s.pbFill, width: `${progress}%`, background: plan.color }} /></div>
                      <span style={s.pbTxt}>{doneItems.length}/{items.length} fait{doneItems.length > 1 ? "s" : ""}</span>
                    </div>
                  </div>
                  <div style={s.chev}>{isOpen ? "▲" : "▼"}</div>
                </div>

                {isOpen && (
                  <div style={s.planBody}>
                    {items.map((item) => {
                      const entry    = log[item.id];
                      const itemDone = entry && entry.km >= plan.km - 2000;
                      return (
                        <div key={item.id} style={{ ...s.opRow, opacity: itemDone ? 0.5 : 1 }}>
                          <div style={s.opLeft}>
                            <span style={s.opIcon}>{item.icon}</span>
                            <div style={s.opInfo}>
                              <div style={{ ...s.opLabel, textDecoration: itemDone ? "line-through" : "none" }}>
                                {item.label}
                                {item.annual && <span style={{ ...s.annualTag, marginLeft: 6 }}>📅 Annuel</span>}
                              </div>
                              <div style={s.opDesc}>{item.description}</div>
                              <div style={s.opCost}>💶 {item.costNote}</div>
                            </div>
                          </div>
                          <div style={s.opRight}>
                            {itemDone
                              ? <span style={s.opDone}>✓ {entry.km.toLocaleString("fr-FR")} km</span>
                              : <button style={{ ...s.btnSmall, borderColor: plan.color, color: plan.color }} onClick={() => openModal(item)}>✓ Fait</button>
                            }
                          </div>
                        </div>
                      );
                    })}

                    {/* Cost breakdown */}
                    <div style={s.costSummary}>
                      <div style={s.csTit}>💰 Récapitulatif des coûts</div>
                      <div style={s.csGrid}>
                        {items.filter((i) => i.estimatedCost > 0).map((i) => (
                          <div key={i.id} style={s.csRow}>
                            <span style={s.csLabel}>{i.icon} {i.label}</span>
                            <span style={s.csVal}>~{i.estimatedCost} €</span>
                          </div>
                        ))}
                        <div style={{ ...s.csRow, borderTop: "1px solid #2a2d3a", paddingTop: 8, marginTop: 4, fontWeight: 800, fontSize: 13 }}>
                          <span style={{ color: "#e8eaf0" }}>TOTAL ESTIMÉ</span>
                          <span style={{ color: plan.color }}>~{totalCost} €</span>
                        </div>
                      </div>
                      <div style={s.csNote}>* Pièces + main-d'œuvre indicatifs. Variable selon atelier et état de la moto.</div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {/* ── Contrôle ANNUEL ── */}
          <div style={s.annualCard}>
            <div style={s.annualHead} onClick={() => setAnnualOpen(!annualOpen)}>
              <div style={s.annualIcon}>📅</div>
              <div style={s.annualInfo}>
                <div style={s.annualTitle}>Contrôle annuel</div>
                <div style={s.annualSub}>
                  {getAnnualItems().length} opérations à effectuer <strong>chaque année</strong>,
                  indépendamment du kilométrage (si le palier km annuel n'a pas été atteint).
                </div>
              </div>
              <div style={s.chev}>{annualOpen ? "▲" : "▼"}</div>
            </div>
            {annualOpen && (
              <div style={s.planBody}>
                {getAnnualItems().map((item) => {
                  const entry = log[item.id];
                  return (
                    <div key={item.id} style={s.opRow}>
                      <div style={s.opLeft}>
                        <span style={s.opIcon}>{item.icon}</span>
                        <div style={s.opInfo}>
                          <div style={s.opLabel}>{item.label}</div>
                          <div style={s.opDesc}>{item.description}</div>
                          <div style={s.opCost}>💶 {item.costNote}</div>
                          <div style={{ fontSize: 11, color: "#5a6080", marginTop: 3 }}>
                            Aussi aux paliers : {item.intervals.map((i) => `${i.toLocaleString("fr-FR")} km`).join(" · ")}
                          </div>
                        </div>
                      </div>
                      <div style={s.opRight}>
                        {entry
                          ? <span style={s.opDone}>✓ {entry.km.toLocaleString("fr-FR")} km</span>
                          : <button style={{ ...s.btnSmall, borderColor: "#00b4ff", color: "#00b4ff" }} onClick={() => openModal(item)}>✓ Fait</button>
                        }
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Always-do */}
          <div style={s.alwaysBox}>
            <div style={s.alwaysTit}>🔗 À faire à chaque utilisation</div>
            <div style={s.alwaysRow}>
              <span style={{ fontSize: 20 }}>🔗</span>
              <div>
                <strong style={{ color: "#d0d4e8" }}>Chaîne de transmission</strong>
                <div style={s.alwaysDesc}>Vérifier tension, alignement et état. Ajuster et lubrifier avec lubrifiant chaîne O-ring spécial.</div>
                <div style={s.alwaysCost}>💶 ~10–20 € (lubrifiant) / Kit chaîne complet ~150 €</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══ MODAL ══ */}
      {showModal && (
        <div style={s.overlay} onClick={() => setShowModal(null)}>
          <div style={s.modal} onClick={(e) => e.stopPropagation()}>
            <div style={s.mTitle}>✓ Entretien effectué</div>
            <div style={s.mItem}>{showModal.icon} {showModal.label}</div>
            <div style={s.mLabel}>Kilométrage au moment de l'entretien :</div>
            <input type="text" value={modalKm} onChange={(e) => setModalKm(e.target.value)} style={s.mInput} autoFocus />
            <div style={s.mCost}>{showModal.costNote}</div>
            <div style={s.mActions}>
              <button style={s.btnCancel}  onClick={() => setShowModal(null)}>Annuler</button>
              <button style={s.btnConfirm} onClick={confirmDone}>Confirmer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── STYLES ──────────────────────────────────────────────────────────────────

const s = {
  root:        { fontFamily: "'Segoe UI', system-ui, sans-serif", background: "#0d0f14", minHeight: "100vh", color: "#e8eaf0", paddingBottom: 60 },
  header:      { background: "linear-gradient(135deg,#1a1d27,#12141c)", borderBottom: "1px solid #2a2d3a", padding: "24px 28px", display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16 },
  headerLeft:  { display: "flex", alignItems: "center", gap: 18 },
  motoEmoji:   { fontSize: 40, filter: "drop-shadow(0 0 12px rgba(0,180,255,.4))" },
  brand:       { fontSize: 11, letterSpacing: "0.25em", color: "#00b4ff", fontWeight: 700, textTransform: "uppercase" },
  model:       { fontSize: 22, fontWeight: 800, color: "#fff", letterSpacing: "0.05em" },
  sub:         { fontSize: 12, color: "#5a6080", marginTop: 2 },
  kmBox:       { textAlign: "right" },
  kmLabel:     { fontSize: 11, color: "#5a6080", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 6 },
  kmInputWrap: { display: "flex", alignItems: "center", gap: 8, background: "#1e2130", border: "1px solid #2e3347", borderRadius: 8, padding: "8px 14px" },
  kmInput:     { background: "transparent", border: "none", outline: "none", color: "#00b4ff", fontSize: 22, fontWeight: 700, width: 120, textAlign: "right" },
  kmUnit:      { color: "#5a6080", fontSize: 14, fontWeight: 600 },
  nextHint:    { fontSize: 11, color: "#5a6080", marginTop: 6 },
  tabBar:      { display: "flex", padding: "0 28px", borderBottom: "1px solid #2a2d3a", background: "#12141c" },
  tabBtn:      { background: "transparent", border: "none", borderBottom: "3px solid transparent", color: "#5a6080", padding: "14px 20px", fontSize: 13, fontWeight: 600, cursor: "pointer" },
  tabOn:       { borderBottomColor: "#00b4ff", color: "#00b4ff" },
  statsRow:    { display: "flex", gap: 12, padding: "20px 28px 0", flexWrap: "wrap" },
  statCard:    { flex: 1, minWidth: 100, background: "#1a1d27", border: "1px solid #2a2d3a", borderRadius: 10, padding: "14px 16px", display: "flex", flexDirection: "column", alignItems: "center", gap: 4 },
  statIco:     { fontSize: 20 },
  statNum:     { fontSize: 28, fontWeight: 800 },
  statLbl:     { fontSize: 11, color: "#5a6080", textTransform: "uppercase", letterSpacing: "0.08em" },
  toolbar:     { display: "flex", gap: 8, padding: "16px 28px", flexWrap: "wrap", alignItems: "center" },
  searchInput: { flex: 1, minWidth: 180, background: "#1a1d27", border: "1px solid #2a2d3a", borderRadius: 8, padding: "9px 14px", color: "#e8eaf0", fontSize: 13, outline: "none" },
  fBtn:        { background: "#1a1d27", border: "1px solid #2a2d3a", borderRadius: 7, color: "#7a80a0", padding: "8px 14px", fontSize: 12, cursor: "pointer", fontWeight: 600 },
  fOn:         { background: "#00b4ff22", borderColor: "#00b4ff", color: "#00b4ff" },
  list:        { padding: "0 28px", display: "flex", flexDirection: "column", gap: 8 },
  empty:       { textAlign: "center", padding: 40, color: "#3a3f55", fontSize: 14 },
  card:        { background: "#1a1d27", borderRadius: 10, overflow: "hidden", border: "1px solid #2a2d3a" },
  cardTop:     { display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", cursor: "pointer", userSelect: "none" },
  cIcon:       { fontSize: 20, width: 28, textAlign: "center" },
  cMain:       { flex: 1 },
  cTitle:      { fontWeight: 700, fontSize: 14, color: "#d0d4e8", marginBottom: 4, display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" },
  cMeta:       { display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" },
  badge:       { fontSize: 10, fontWeight: 800, padding: "2px 8px", borderRadius: 20, textTransform: "uppercase", letterSpacing: "0.06em" },
  annualTag:   { fontSize: 9, fontWeight: 700, padding: "2px 7px", borderRadius: 20, background: "rgba(0,180,255,0.12)", color: "#00b4ff", letterSpacing: "0.05em" },
  cNext:       { fontSize: 11, color: "#5a6080" },
  cLast:       { fontSize: 11, color: "#3d8f6d" },
  costBadge:   { fontSize: 12, fontWeight: 700, color: "#f0c040", background: "rgba(240,192,64,.1)", padding: "3px 10px", borderRadius: 20, whiteSpace: "nowrap" },
  chev:        { color: "#3a3f55", fontSize: 12, marginLeft: 4 },
  cDetail:     { borderTop: "1px solid #2a2d3a", padding: "16px 16px 16px 60px", background: "#161820" },
  dDesc:       { color: "#9098b8", fontSize: 13, margin: "0 0 10px 0", lineHeight: 1.5 },
  dCost:       { fontSize: 13, color: "#c0c8e0", marginBottom: 6 },
  dInter:      { fontSize: 13, color: "#c0c8e0", marginBottom: 14 },
  dActions:    { display: "flex", gap: 10, flexWrap: "wrap" },
  btnDone:     { background: "linear-gradient(135deg,#00b4ff,#0070cc)", border: "none", borderRadius: 7, color: "#fff", padding: "9px 18px", fontSize: 13, fontWeight: 700, cursor: "pointer" },
  btnReset:    { background: "transparent", border: "1px solid #3a3f55", borderRadius: 7, color: "#7a80a0", padding: "9px 14px", fontSize: 13, cursor: "pointer" },
  planWrap:    { padding: "20px 28px", display: "flex", flexDirection: "column", gap: 14 },
  planIntro:   { fontSize: 13, color: "#7a80a0", background: "#1a1d27", border: "1px solid #2a2d3a", borderRadius: 8, padding: "12px 16px", lineHeight: 1.7 },
  tlRow:       { display: "flex", alignItems: "flex-start", padding: "4px 0 8px", overflowX: "auto" },
  tlStep:      { display: "flex", flexDirection: "column", alignItems: "center", flex: 1, minWidth: 70, position: "relative", paddingTop: 4 },
  tlLine:      { position: "absolute", top: 22, right: "50%", width: "100%", height: 3, zIndex: 0 },
  tlDot:       { width: 38, height: 38, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, fontWeight: 700, color: "#fff", zIndex: 1, cursor: "pointer" },
  tlKm:        { fontSize: 10, marginTop: 6, textAlign: "center", fontWeight: 600 },
  tlName:      { fontSize: 9, textAlign: "center", textTransform: "uppercase", letterSpacing: "0.06em", marginTop: 2 },
  planCard:    { background: "#1a1d27", borderRadius: 10, border: "1px solid #2a2d3a", overflow: "hidden" },
  planHead:    { display: "flex", alignItems: "center", gap: 14, padding: "16px 18px", cursor: "pointer", userSelect: "none" },
  planHeadIcon:{ fontSize: 28, width: 36, textAlign: "center", flexShrink: 0 },
  planHeadInfo:{ flex: 1 },
  planHeadTop: { display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap", marginBottom: 2 },
  planKm:      { fontSize: 18, fontWeight: 800, color: "#fff" },
  planType:    { fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em" },
  doneBadge:   { fontSize: 10, fontWeight: 800, padding: "2px 8px", borderRadius: 20, background: "rgba(34,197,94,.12)", color: "#22c55e" },
  planName:    { fontSize: 13, color: "#9098b8", marginBottom: 6 },
  planSubRow:  { display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap", marginBottom: 6 },
  planCount:   { fontSize: 12, color: "#5a6080" },
  planTotalCost:{ fontSize: 13, fontWeight: 800 },
  pbWrap:      { display: "flex", alignItems: "center", gap: 8 },
  pbBg:        { flex: 1, height: 4, background: "#2a2d3a", borderRadius: 4, overflow: "hidden" },
  pbFill:      { height: "100%", borderRadius: 4, transition: "width .4s" },
  pbTxt:       { fontSize: 10, color: "#5a6080", whiteSpace: "nowrap" },
  planBody:    { borderTop: "1px solid #2a2d3a" },
  opRow:       { display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, padding: "12px 18px", borderBottom: "1px solid #161820" },
  opLeft:      { display: "flex", gap: 12, flex: 1 },
  opIcon:      { fontSize: 18, marginTop: 2, flexShrink: 0 },
  opInfo:      { flex: 1 },
  opLabel:     { fontSize: 13, fontWeight: 700, color: "#d0d4e8", marginBottom: 3, display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" },
  opDesc:      { fontSize: 12, color: "#7a80a0", lineHeight: 1.4, marginBottom: 3 },
  opCost:      { fontSize: 11, color: "#f0c040" },
  opRight:     { display: "flex", alignItems: "center", flexShrink: 0, paddingTop: 2 },
  opDone:      { fontSize: 11, color: "#3d8f6d", fontWeight: 700 },
  btnSmall:    { background: "transparent", border: "1px solid", borderRadius: 6, padding: "5px 12px", fontSize: 12, fontWeight: 700, cursor: "pointer" },
  costSummary: { margin: "0 18px 14px", background: "#161820", borderRadius: 8, padding: "14px 16px" },
  csTit:       { fontSize: 12, fontWeight: 800, color: "#7a80a0", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 10 },
  csGrid:      { display: "flex", flexDirection: "column", gap: 5 },
  csRow:       { display: "flex", justifyContent: "space-between", fontSize: 12, color: "#9098b8" },
  csLabel:     { flex: 1 },
  csVal:       { fontWeight: 700, color: "#c0c8e0" },
  csNote:      { fontSize: 10, color: "#3a3f55", marginTop: 10 },
  // Annual card
  annualCard:  { background: "#1a1d27", border: "1px solid #2a2d3a", borderLeft: "4px solid #00b4ff", borderRadius: 10, overflow: "hidden" },
  annualHead:  { display: "flex", alignItems: "center", gap: 14, padding: "16px 18px", cursor: "pointer", userSelect: "none" },
  annualIcon:  { fontSize: 28, width: 36, textAlign: "center", flexShrink: 0 },
  annualInfo:  { flex: 1 },
  annualTitle: { fontSize: 15, fontWeight: 800, color: "#00b4ff", marginBottom: 4 },
  annualSub:   { fontSize: 13, color: "#7a80a0", lineHeight: 1.5 },
  alwaysBox:   { background: "#1a1d27", border: "1px solid #2a2d3a", borderRadius: 10, padding: "16px 18px" },
  alwaysTit:   { fontSize: 12, fontWeight: 800, color: "#7a80a0", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 10 },
  alwaysRow:   { display: "flex", gap: 12, lineHeight: 1.5 },
  alwaysDesc:  { fontSize: 13, color: "#9098b8", lineHeight: 1.5, marginTop: 3 },
  alwaysCost:  { fontSize: 11, color: "#f0c040", marginTop: 4 },
  overlay:     { position: "fixed", inset: 0, background: "rgba(0,0,0,.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, backdropFilter: "blur(4px)" },
  modal:       { background: "#1e2130", border: "1px solid #2e3347", borderRadius: 14, padding: "28px 30px", width: "100%", maxWidth: 380, boxShadow: "0 20px 60px rgba(0,0,0,.5)" },
  mTitle:      { fontSize: 18, fontWeight: 800, color: "#00b4ff", marginBottom: 12 },
  mItem:       { fontSize: 15, fontWeight: 700, color: "#d0d4e8", marginBottom: 18 },
  mLabel:      { fontSize: 12, color: "#5a6080", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 },
  mInput:      { width: "100%", background: "#161820", border: "1px solid #2e3347", borderRadius: 8, color: "#e8eaf0", fontSize: 18, fontWeight: 700, padding: "10px 14px", outline: "none", boxSizing: "border-box", marginBottom: 12 },
  mCost:       { fontSize: 12, color: "#f0c040", background: "rgba(240,192,64,.08)", borderRadius: 7, padding: "8px 12px", marginBottom: 20 },
  mActions:    { display: "flex", gap: 10, justifyContent: "flex-end" },
  btnCancel:   { background: "transparent", border: "1px solid #3a3f55", borderRadius: 8, color: "#7a80a0", padding: "10px 18px", fontSize: 14, cursor: "pointer" },
  btnConfirm:  { background: "linear-gradient(135deg,#00b4ff,#0070cc)", border: "none", borderRadius: 8, color: "#fff", padding: "10px 22px", fontSize: 14, fontWeight: 700, cursor: "pointer" },
};