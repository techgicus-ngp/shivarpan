// import React, { useEffect, useMemo, useState } from 'react';
// import { motion } from 'framer-motion';
// import { useNavigate } from 'react-router-dom';

// import { useAuth } from '../context/Authcontext';
// import { useIsWide } from '../hooks/useMediaQuery';
// import { fetchMaps, watchEmployeeQuotations } from '../services/Quotationservice';
// import { userUid } from '../lib/Quote';
// import { shareMap } from '../lib/share';
// import { QuotationCard, MapCard } from '../components/Cards';
// import {
//   Avatar, DocIcon, EmptyState, FilterChip, HomePartsStyles, MapIcon,
//   NavRail, SearchBar, SignOutIcon, StatBar,
// } from '../components/HomeParts';
// import { ACCENT, HAIR, PANEL } from '../theme/tokens';
// import '../styles/home.css';

// /* Lazy, so the file stays out of the main bundle until the tab is
//    actually turned on. It is commented out of TABS for now but is
//    coming back, and PANES below is keyed by tab so the two cannot
//    drift apart in the meantime. */
// const SiteVisitTab = React.lazy(() => import('./SiteVisitTab'));

// /* Icons are ELEMENTS, not strings: the rail and the phone tab strip
//    both render `t.icon` directly, so they stay identical without either
//    knowing what an icon is made of. Emoji were the previous approach and
//    render as a different glyph on every platform — colour on one,
//    monochrome on another, off the baseline on a third. */
// const TABS = [
//   { key: 'maps', label: 'Layout maps', icon: <MapIcon /> },
//   // { key: 'quotations', label: 'Quotations', icon: <DocIcon /> },
//   // { key: 'visits', label: 'Site visit', icon: <CameraIcon /> },
// ];

// /* Lives here rather than in HomeParts only because it is the one icon
//    nothing else uses yet; move it across if a second caller appears. */
// function ShareIcon() {
//   return (
//     <svg
//       width="16"
//       height="16"
//       viewBox="0 0 24 24"
//       fill="none"
//       stroke="currentColor"
//       strokeWidth="1.8"
//       strokeLinecap="round"
//       strokeLinejoin="round"
//       aria-hidden="true"
//     >
//       <circle cx="18" cy="5" r="3" />
//       <circle cx="6" cy="12" r="3" />
//       <circle cx="18" cy="19" r="3" />
//       <path d="M8.6 13.5l6.8 4M15.4 6.5l-6.8 4" />
//     </svg>
//   );
// }

// /* Kept beside the markup it styles instead of in home.css, so the whole
//    share affordance is one import away from being removed again. */
// function ShareStyles() {
//   return (
//     <style>{`
//       .cardwrap { position: relative; }
//       .sharebtn {
//         position: absolute; top: 10px; right: 10px; z-index: 2;
//         display: grid; place-items: center;
//         width: 32px; height: 32px;
//         border: 1px solid var(--hp-hair, #232A33);
//         border-radius: 8px;
//         background: var(--hp-panel, #141A21);
//         color: var(--hp-accent, #C8A24B);
//         cursor: pointer; opacity: 0.85;
//         transition: opacity 120ms linear;
//       }
//       .sharebtn:hover { opacity: 1; }
//       /* Nothing hovers on a phone, so the button has to be visible there
//          from the start rather than waiting for a pointer that never comes. */
//       @media (hover: none) { .sharebtn { opacity: 1; } }
//       @media (prefers-reduced-motion: reduce) { .sharebtn { transition: none; } }
//     `}</style>
//   );
// }

// export default function EmployeeHome() {
//   const { user, signOut } = useAuth();
//   const navigate = useNavigate();
//   const isWide = useIsWide();

//   const [tab, setTab] = useState(0);

//   /* One rule for the id, shared with everything that writes or reads a
//      quotation — so an auth-shape change is one edit, not five. */
//   const uid = userUid(user);

//   // ── Quotations (live) ────────────────────────────────────────────────
//   const [quotations, setQuotations] = useState([]);
//   const [quotesLoading, setQuotesLoading] = useState(true);
//   const [quotesError, setQuotesError] = useState(null);
//   const [quoteSearch, setQuoteSearch] = useState('');

//   useEffect(() => {
//     if (!uid) return undefined;
//     setQuotesLoading(true);
//     return watchEmployeeQuotations(
//       uid,
//       (list) => { setQuotations(list); setQuotesLoading(false); setQuotesError(null); },
//       (err) => {
//         console.error('[quotations]', err);
//         /* failed-precondition is always the missing composite index on
//            (createdByUid asc, quotationDate desc). Firestore's own
//            message carries a link that creates it, so the console is
//            where the fix is — say so rather than showing a raw code. */
//         setQuotesError(
//           err?.code === 'failed-precondition'
//             ? 'This list needs a Firestore index that does not exist yet. The browser console has a link that creates it.'
//             : err?.message || 'Could not load quotations.',
//         );
//         setQuotesLoading(false);
//       },
//     );
//   }, [uid]);

//   // ── Maps (one-shot, with pull-to-refresh equivalent) ─────────────────
//   const [maps, setMaps] = useState([]);
//   const [mapsLoading, setMapsLoading] = useState(true);
//   const [mapSearch, setMapSearch] = useState('');
//   const [mapFilter, setMapFilter] = useState('All');

//   const loadMaps = async () => {
//     setMapsLoading(true);
//     try {
//       setMaps(await fetchMaps());
//     } catch (err) {
//       console.error('Error loading maps:', err);
//     } finally {
//       setMapsLoading(false);
//     }
//   };

//   useEffect(() => { loadMaps(); }, []);

//   // ── Derived lists ────────────────────────────────────────────────────
//   const filteredQuotes = useMemo(() => {
//     const q = quoteSearch.trim().toLowerCase();
//     if (!q) return quotations;
//     return quotations.filter((x) => (
//       x.customerName.toLowerCase().includes(q)
//       || x.plotNumber.toLowerCase().includes(q)
//       || x.projectName.toLowerCase().includes(q)
//     ));
//   }, [quotations, quoteSearch]);

//   const filteredMaps = useMemo(() => {
//     const q = mapSearch.trim().toLowerCase();
//     if (!q) return maps;
//     return maps.filter((m) => (m.name || '').toLowerCase().includes(q));
//   }, [maps, mapSearch]);

//   const totalValue = useMemo(
//     () => quotations.reduce((acc, q) => acc + q.finalTotalAmount, 0),
//     [quotations],
//   );

//   const openMap = (map) => navigate(`/maps/${map.id}`);
//   const openQuotation = (q) => navigate(`/quotations/${q.id}`);

//   /* The card underneath has its own click handler, so the share tap has
//      to be stopped here — without this you hand over a link and navigate
//      away from the list at the same time. */
//   const onShare = (e, map) => {
//     e.stopPropagation();
//     e.preventDefault();
//     shareMap(map);
//   };

//   /* The rail shows a count beside Quotations, so TABS is rebuilt here
//      rather than held at module scope — the count is state. */
//   const railTabs = useMemo(() => TABS.map((t) => (
//     t.key === 'quotations' ? { ...t, count: quotations.length } : t
//   )), [quotations.length]);

//   const stats = (
//     <StatBar
//       quotationCount={quotations.length}
//       totalValue={totalValue}
//       mapCount={maps.length}
//     />
//   );

//   // ── Tab bodies ───────────────────────────────────────────────────────
//   const mapsTab = (
//     <div className="tabpane">
//       <div className="tabpane-controls">
//         <SearchBar
//           value={mapSearch}
//           onChange={setMapSearch}
//           placeholder="Search maps"
//         />
//         <div className="chiprow">
//           {['All', 'Recent', 'Large', 'Small'].map((f) => (
//             <FilterChip
//               key={f}
//               label={f}
//               value={f}
//               selected={mapFilter}
//               onSelect={setMapFilter}
//             />
//           ))}
//         </div>
//         <div className="tabpane-meta">
//           <span>{filteredMaps.length} map{filteredMaps.length === 1 ? '' : 's'}</span>
//           <button type="button" className="linkbtn" onClick={loadMaps}>Refresh</button>
//         </div>
//       </div>

//       {mapsLoading ? <Spinner /> : filteredMaps.length === 0 ? (
//         <EmptyState
//           searching={!!mapSearch}
//           title={mapSearch ? 'No maps match that search' : 'No maps yet'}
//           body={mapSearch
//             ? 'Try a shorter or different term.'
//             : 'Maps appear here once an admin publishes them.'}
//         />
//       ) : (
//         <div className="cardgrid">
//           {filteredMaps.map((m, i) => (
//             /* MapCard is left untouched: the share button is layered over
//                it here, so the card keeps one job and the list keeps the
//                link-building. */
//             <div className="cardwrap" key={m.id}>
//               <MapCard map={m} index={i} onOpen={() => openMap(m)} />
//               <button
//                 type="button"
//                 className="sharebtn"
//                 title="Share map link"
//                 aria-label={`Share ${m.name || 'map'}`}
//                 onClick={(e) => onShare(e, m)}
//               >
//                 <ShareIcon />
//               </button>
//             </div>
//           ))}
//         </div>
//       )}
//     </div>
//   );

//   const quotationsTab = (
//     <div className="tabpane">
//       <div className="tabpane-controls">
//         <SearchBar
//           value={quoteSearch}
//           onChange={setQuoteSearch}
//           placeholder="Search by customer, project or plot"
//         />
//         <div className="tabpane-meta">
//           <span>{filteredQuotes.length} quotation{filteredQuotes.length === 1 ? '' : 's'}</span>
//           {/* <span className="tabpane-hint">Select one to see the full breakdown</span> */}
//         </div>
//       </div>

//       {quotesError ? (
//         <EmptyState
//           title="Quotations didn’t load"
//           body={quotesError}
//         />
//       ) : quotesLoading ? <Spinner /> : filteredQuotes.length === 0 ? (
//         <EmptyState
//           searching={!!quoteSearch}
//           title={quoteSearch ? 'No quotations match that search' : 'No quotations yet'}
//           body={quoteSearch
//             ? 'Try a shorter or different term.'
//             : 'Build one from a plot in any layout map.'}
//         />
//       ) : (
//         <div className="cardgrid">
//           {filteredQuotes.map((q, i) => (
//             <QuotationCard
//               key={q.id}
//               quotation={q}
//               index={i}
//               onOpen={() => openQuotation(q)}
//             />
//           ))}
//         </div>
//       )}
//     </div>
//   );

//   /* Keyed to TABS, not a positional array. The old version was a
//      three-item array against a two-item TABS, so SiteVisitTab was built
//      on every render for a tab nobody could reach. This way an
//      unreachable pane is never constructed, and uncommenting the tab
//      above is the only edit needed to bring it back. */
//   const PANES = {
//     maps: mapsTab,
//     quotations: quotationsTab,
//     visits: (
//       <React.Suspense fallback={<Spinner />}>
//         <SiteVisitTab user={user} />
//       </React.Suspense>
//     ),
//   };

//   const pane = PANES[TABS[tab]?.key] || mapsTab;

//   /* Theme tokens handed to the CSS in HomePartsStyles, which reads them
//      as variables with fallbacks rather than importing them itself. */
//   const theme = { '--hp-accent': ACCENT, '--hp-panel': PANEL, '--hp-hair': HAIR };

//   // ── Shells ───────────────────────────────────────────────────────────
//   if (isWide) {
//     return (
//       <>
//         <HomePartsStyles />
//         <ShareStyles />
//         <div className="shell shell--wide" style={theme}>
//           <NavRail
//             tabs={railTabs}
//             active={tab}
//             onSelect={setTab}
//             userName={user?.name || ''}
//             userRole={user?.role}
//             onSignOut={signOut}
//           />
//           <main className="shell-main">
//             <div className="shell-strip">{stats}</div>
//             <div className="shell-content">{pane}</div>
//           </main>
//         </div>
//       </>
//     );
//   }

//   return (
//     <>
//       <HomePartsStyles />
//       <ShareStyles />
//       <div className="shell" style={theme}>
//         <motion.header
//           className="phone-head"
//           initial={{ opacity: 0, y: -18 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
//         >
//           <div className="phone-head-top">
//             <Avatar name={user?.name || ''} />
//             <div className="phone-head-who">
//               <span>Welcome back,</span>
//               <strong>{user?.name}</strong>
//             </div>
//             <img
//               className="phone-head-logo"
//               src="/images/saraswati_mark.png"
//               alt=""
//               onError={(e) => { e.currentTarget.style.display = 'none'; }}
//             />
//             <button
//               type="button"
//               className="iconbtn"
//               onClick={signOut}
//               aria-label="Sign out"
//             >
//               <SignOutIcon />
//             </button>
//           </div>

//           {stats}

//           <div className="segmented" role="tablist">
//             {TABS.map((t, i) => (
//               <button
//                 key={t.key}
//                 type="button"
//                 role="tab"
//                 aria-selected={tab === i}
//                 className={`segmented-tab${tab === i ? ' is-on' : ''}`}
//                 onClick={() => setTab(i)}
//               >
//                 <span className="segmented-icon" aria-hidden="true">{t.icon}</span>
//                 {t.label}
//               </button>
//             ))}
//           </div>
//         </motion.header>

//         <main className="shell-content">{pane}</main>
//       </div>
//     </>
//   );
// }

// function Spinner() {
//   return <div className="spinner" role="status" aria-label="Loading" />;
// }

// Public home: the list of layout maps. No sign-in, no quotations.

// import React, { useEffect, useMemo, useState } from 'react';
// import { motion } from 'framer-motion';
// import { useNavigate } from 'react-router-dom';

// import { useIsWide } from '../hooks/useMediaQuery';
// import { fetchMaps } from '../services/mapsService';
// import { shareMap } from '../lib/share';
// import { SITE_NAME } from '../config/site';
// import { MapCard } from '../components/Cards';
// import {
//   EmptyState, FilterChip, HomePartsStyles, MapIcon, NavRail, SearchBar,
// } from '../components/HomeParts';
// import { ACCENT, HAIR, PANEL } from '../theme/tokens';
// import logo from '../assets/logo.png';
// import '../styles/home.css';

// const TABS = [{ key: 'maps', label: 'Layout maps', icon: <MapIcon /> }];

// function ShareIcon() {
//   return (
//     <svg
//       width="16" height="16" viewBox="0 0 24 24" fill="none"
//       stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"
//       strokeLinejoin="round" aria-hidden="true"
//     >
//       <circle cx="18" cy="5" r="3" />
//       <circle cx="6" cy="12" r="3" />
//       <circle cx="18" cy="19" r="3" />
//       <path d="M8.6 13.5l6.8 4M15.4 6.5l-6.8 4" />
//     </svg>
//   );
// }

// function ShareStyles() {
//   return (
//     <style>{`
//       .cardwrap { position: relative; }
//       .sharebtn {
//         position: absolute; top: 10px; right: 10px; z-index: 2;
//         display: grid; place-items: center;
//         width: 32px; height: 32px;
//         border: 1px solid var(--hp-hair, #232A33);
//         border-radius: 8px;
//         background: var(--hp-panel, #141A21);
//         color: var(--hp-accent, #C8A24B);
//         cursor: pointer; opacity: 0.85;
//         transition: opacity 120ms linear;
//       }
//       .sharebtn:hover { opacity: 1; }
//       @media (hover: none) { .sharebtn { opacity: 1; } }
//       @media (prefers-reduced-motion: reduce) { .sharebtn { transition: none; } }
//     `}</style>
//   );
// }

// function Spinner() {
//   return <div className="spinner" role="status" aria-label="Loading" />;
// }

// export default function EmployeeHome() {
//   const navigate = useNavigate();
//   const isWide = useIsWide();

//   const [maps, setMaps] = useState([]);
//   const [mapsLoading, setMapsLoading] = useState(true);
//   const [mapSearch, setMapSearch] = useState('');
//   const [mapFilter, setMapFilter] = useState('All');

//   const loadMaps = async () => {
//     setMapsLoading(true);
//     try {
//       setMaps(await fetchMaps());
//     } catch (err) {
//       console.error('Error loading maps:', err);
//     } finally {
//       setMapsLoading(false);
//     }
//   };

//   useEffect(() => { loadMaps(); }, []);

//   const filteredMaps = useMemo(() => {
//     const q = mapSearch.trim().toLowerCase();
//     if (!q) return maps;
//     return maps.filter((m) => (m.name || '').toLowerCase().includes(q));
//   }, [maps, mapSearch]);

//   const openMap = (map) => navigate(`/maps/${encodeURIComponent(map.id)}`);

//   /* The card has its own click handler, so the share tap must not reach it. */
//   const onShare = (e, map) => {
//     e.stopPropagation();
//     e.preventDefault();
//     shareMap(map);
//   };

//   const pane = (
//     <div className="tabpane">
//       <div className="tabpane-controls">
//         <SearchBar value={mapSearch} onChange={setMapSearch} placeholder="Search maps" />
//         <div className="chiprow">
//           {['All', 'Recent', 'Large', 'Small'].map((f) => (
//             <FilterChip
//               key={f} label={f} value={f}
//               selected={mapFilter} onSelect={setMapFilter}
//             />
//           ))}
//         </div>
//         <div className="tabpane-meta">
//           <span>{filteredMaps.length} map{filteredMaps.length === 1 ? '' : 's'}</span>
//           <button type="button" className="linkbtn" onClick={loadMaps}>Refresh</button>
//         </div>
//       </div>

//       {mapsLoading ? <Spinner /> : filteredMaps.length === 0 ? (
//         <EmptyState
//           searching={!!mapSearch}
//           title={mapSearch ? 'No maps match that search' : 'No maps yet'}
//           body={mapSearch ? 'Try a shorter or different term.' : 'Maps will appear here once published.'}
//         />
//       ) : (
//         <div className="cardgrid">
//           {filteredMaps.map((m, i) => (
//             <div className="cardwrap" key={m.id}>
//               <MapCard map={m} index={i} onOpen={() => openMap(m)} />
//               <button
//                 type="button"
//                 className="sharebtn"
//                 title="Share map link"
//                 aria-label={`Share ${m.name || 'map'}`}
//                 onClick={(e) => onShare(e, m)}
//               >
//                 <ShareIcon />
//               </button>
//             </div>
//           ))}
//         </div>
//       )}
//     </div>
//   );

//   const theme = { '--hp-accent': ACCENT, '--hp-panel': PANEL, '--hp-hair': HAIR };

//   if (isWide) {
//     return (
//       <>
//         <HomePartsStyles />
//         <ShareStyles />
//         <div className="shell shell--wide" style={theme}>
//           <NavRail tabs={TABS} active={0} onSelect={() => {}} />
//           <main className="shell-main">
//             <div className="shell-content">{pane}</div>
//           </main>
//         </div>
//       </>
//     );
//   }

//   return (
//     <>
//       <HomePartsStyles />
//       <ShareStyles />
//       <div className="shell" style={theme}>
//         <motion.header
//           className="phone-head"
//           initial={{ opacity: 0, y: -18 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
//         >
//           <div className="phone-head-top">
//             <div className="phone-head-who">
//               <span>Welcome to</span>
//               <strong>{SITE_NAME}</strong>
//             </div>
//             <img className="phone-head-logo" src={logo} alt="" />
//           </div>
//         </motion.header>
//         <main className="shell-content">{pane}</main>
//       </div>
//     </>
//   );
// }

// Public home: layout maps, project features, and a contact footer. Light theme.

// import React, { useCallback, useEffect, useState } from "react";
// import { Link } from "react-router-dom";

// import { fetchMaps } from "../services/mapsService";
// import logo from "../assets/logo.png";

// /* Must read exactly as the name printed in the logo. */
// const BRAND = import.meta.env.VITE_SITE_NAME || "Shivarpan Developer";

// const ARROW = "M5 12h14M13 6l6 6-6 6";
// const mapUrl = (m) => `/maps/${encodeURIComponent(m.id)}`;
// const cover = (m) =>
//   `url(${JSON.stringify(m.imageUrl || m.thumbnail || logo)})`;

// /* "PILKATOWN, Pilkapar, Khasra No. 59/3" -> project name + location line. */
// const splitName = (name) => {
//   const n = (name || "Layout map").trim();
//   const i = n.indexOf(",");
//   return i > 0 ? [n.slice(0, i).trim(), n.slice(i + 1).trim()] : [n, ""];
// };

// function Arrow() {
//   return (
//     <svg
//       width="16"
//       height="16"
//       viewBox="0 0 24 24"
//       fill="none"
//       stroke="currentColor"
//       strokeWidth="1.7"
//       strokeLinecap="round"
//       strokeLinejoin="round"
//       aria-hidden="true"
//     >
//       <path d={ARROW} />
//     </svg>
//   );
// }

// export default function PublicHome() {
//   const [maps, setMaps] = useState([]);
//   const [state, setState] = useState("loading"); // loading | ready | error

//   const load = useCallback(async () => {
//     setState("loading");
//     try {
//       setMaps(await fetchMaps());
//       setState("ready");
//     } catch (err) {
//       console.error("Error loading maps:", err);
//       setState("error");
//     }
//   }, []);

//   useEffect(() => {
//     load();
//   }, [load]);

//   const single = maps.length === 1 ? maps[0] : null;

//   return (
//     <div className="pub">
//       <style>{CSS}</style>

//       <header className="pub-top">
//         <div className="pub-wrap pub-top-in">
//           <div className="pub-brand">
//             <img src={logo} alt={BRAND} />
//             <span>{BRAND}</span>
//           </div>
//         </div>
//       </header>

//       <section className="pub-wrap pub-maps">
//         <h2>Layout maps</h2>
//         <p className="pub-lead">
//           Select a layout to view plots, sizes and availability.
//         </p>

//         {state === "loading" && (
//           <div className="pub-grid">
//             {[0, 1, 2].map((i) => (
//               <div className="pub-card pub-skel" key={i} />
//             ))}
//           </div>
//         )}

//         {state === "error" && (
//           <div className="pub-note">
//             <p>We could not load the layouts. Please check your connection.</p>
//             <button type="button" className="pub-btn" onClick={load}>
//               Try again
//             </button>
//           </div>
//         )}

//         {state === "ready" && maps.length === 0 && (
//           <div className="pub-note">
//             <p>Layouts will appear here soon.</p>
//           </div>
//         )}

//         {state === "ready" && single && (
//           <Link className="pub-feature" to={mapUrl(single)}>
//             <div
//               className="pub-feature-img"
//               style={{ backgroundImage: cover(single) }}
//             />
//             <div className="pub-feature-body">
//               <h3>{splitName(single.name)[0]}</h3>
//               {splitName(single.name)[1] && (
//                 <p className="pub-feature-sub">{splitName(single.name)[1]}</p>
//               )}
//               <p className="pub-feature-text">
//                 Explore every plot, its size and availability on the interactive
//                 layout map.
//               </p>
//               <span className="pub-btn">
//                 View layout <Arrow />
//               </span>
//             </div>
//           </Link>
//         )}

//         {state === "ready" && maps.length > 1 && (
//           <div className="pub-grid">
//             {maps.map((m) => (
//               <Link className="pub-card" to={mapUrl(m)} key={m.id}>
//                 <div
//                   className="pub-card-img"
//                   style={{ backgroundImage: cover(m) }}
//                 />
//                 <div className="pub-card-body">
//                   <h3>{splitName(m.name)[0]}</h3>
//                   {splitName(m.name)[1] && (
//                     <p className="pub-card-sub">{splitName(m.name)[1]}</p>
//                   )}
//                   <span className="pub-card-cta">
//                     View layout <Arrow />
//                   </span>
//                 </div>
//               </Link>
//             ))}
//           </div>
//         )}
//       </section>
//     </div>
//   );
// }

// const CSS = `
// .pub { --pearl: #FFFBFA; --plum: #5A2A3A;
//   --bg: var(--pearl); --surface: #FFFFFF; --ink: var(--plum); --muted: #7A5A66;
//   --line: #F0DCDC; --accent: #7B3B52;
//   position: fixed; inset: 0; overflow-y: auto; -webkit-overflow-scrolling: touch;
//   background: var(--bg); color: var(--ink); line-height: 1.55;
//   font-family: system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif; }
// .pub * { box-sizing: border-box; }
// .pub a { color: inherit; text-decoration: none; }
// .pub h2, .pub h3, .pub p { margin: 0; }
// .pub :focus-visible { outline: 2px solid var(--accent); outline-offset: 3px; }
// .pub-wrap { max-width: 1080px; margin: 0 auto; padding: 0 24px; }
// .pub h2 { font-family: Georgia, 'Times New Roman', serif; font-weight: 500; font-size: clamp(26px, 4vw, 34px); }
// .pub .pub-lead { margin: 10px 0 36px; color: var(--muted); font-size: 16px; }

// .pub-top { position: sticky; top: 0; z-index: 10; background: rgba(255,251,250,.92);
//   backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px); border-bottom: 1px solid var(--line); }
// .pub-top-in { display: flex; align-items: center; height: 72px; }
// .pub-brand { display: flex; align-items: center; gap: 14px; min-width: 0; }
// .pub-brand img { height: 48px; width: auto; max-width: 160px; object-fit: contain; }
// .pub-brand span { font-family: Georgia, 'Times New Roman', serif; font-size: 20px; letter-spacing: .02em; }

// .pub-btn { display: inline-flex; align-items: center; gap: 8px; min-height: 46px; padding: 0 24px; border: 0;
//   border-radius: 999px; background: var(--ink); color: #fff; font: 600 15px system-ui, sans-serif; cursor: pointer; }
// .pub-btn:hover { background: var(--accent); }

// .pub-maps { padding-top: 56px; padding-bottom: 64px; }
// .pub-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 24px; }

// .pub-card { display: block; background: var(--surface); border: 1px solid var(--line); border-radius: 18px;
//   overflow: hidden; transition: transform 160ms ease, box-shadow 160ms ease; }
// .pub-card:hover { transform: translateY(-3px); box-shadow: 0 18px 36px -22px rgba(90,42,58,.3); }
// .pub-card-img { aspect-ratio: 16 / 10; background-size: cover; background-position: center; background-color: #F6E3E3; }
// .pub-card-body { padding: 16px 18px 18px; }
// .pub-card-body h3 { font-family: Georgia, 'Times New Roman', serif; font-weight: 500; font-size: 19px; }
// .pub-card-body .pub-card-sub { margin-top: 4px; font-size: 14px; color: var(--muted); }
// .pub-card-cta { display: inline-flex; align-items: center; gap: 6px; margin-top: 10px; color: var(--accent); font-weight: 600; font-size: 14px; }

// .pub-feature { display: grid; grid-template-columns: 1.25fr 1fr; background: var(--surface);
//   border: 1px solid var(--line); border-radius: 24px; overflow: hidden;
//   box-shadow: 0 24px 48px -32px rgba(90,42,58,.35); transition: transform 160ms ease, box-shadow 160ms ease; }
// .pub-feature:hover { transform: translateY(-3px); box-shadow: 0 30px 56px -30px rgba(90,42,58,.45); }
// .pub-feature:hover .pub-btn { background: var(--accent); }
// .pub-feature-img { min-height: 360px; background-size: cover; background-position: center; background-color: #F6E3E3; }
// .pub-feature-body { padding: 44px 40px; display: flex; flex-direction: column; justify-content: center; gap: 12px; }
// .pub-feature-body h3 { font-family: Georgia, 'Times New Roman', serif; font-weight: 500;
//   font-size: clamp(28px, 3.4vw, 38px); line-height: 1.1; letter-spacing: .01em; }
// .pub-feature-sub { font-size: 17px; color: var(--accent); font-weight: 600; }
// .pub-feature-text { font-size: 15px; color: var(--muted); max-width: 36ch; }
// .pub-feature-body .pub-btn { align-self: flex-start; margin-top: 14px; }

// .pub-skel { min-height: 260px; background: linear-gradient(100deg, #F8E6E6 30%, #FDF2F2 50%, #F8E6E6 70%);
//   background-size: 200% 100%; animation: pubShimmer 1.4s linear infinite; }
// .pub-note { text-align: center; padding: 40px 16px; border: 1px dashed var(--line); border-radius: 16px; color: var(--muted); }
// .pub-note .pub-btn { margin-top: 16px; }

// @keyframes pubShimmer { to { background-position: -200% 0; } }

// @media (max-width: 720px) {
//   .pub-top-in { height: 64px; }
//   .pub-brand img { height: 40px; }
//   .pub-brand span { font-size: 17px; }
//   .pub-maps { padding-top: 40px; padding-bottom: 48px; }
//   .pub-feature { grid-template-columns: 1fr; }
//   .pub-feature-img { min-height: 220px; }
//   .pub-feature-body { padding: 26px 22px 28px; }
// }
// @media (prefers-reduced-motion: reduce) {
//   .pub-skel { animation: none; }
//   .pub-card, .pub-feature { transition: none; }
// }
// `;

import React, { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { fetchMaps } from "../services/mapsService";
import logo from "../assets/logo.png";
import gauriNagar from "../assets/gaurinagar.png";
import maheshNagar from "../assets/maheshnagar.png";
import shivgad from "../assets/shivgad.jpeg";
import vaibhavNagar1 from "../assets/vaibhavnagar1.jpeg";
import vaibhavNagar2 from "../assets/vaibhavnagar2.png";

/* Must read exactly as the name printed in the logo. */
const BRAND = import.meta.env.VITE_SITE_NAME || "Shivarpan Developer";

const ARROW = "M5 12h14M13 6l6 6-6 6";
const mapUrl = (m) => `/maps/${encodeURIComponent(m.id)}`;

/* Picture for each map, matched against the map's name (lower-case).
   A map's own `imageUrl` in Firestore always wins over this list. */
const COVERS = [
  ["ghuri", gauriNagar],
  ["shivgarh", shivgad],
  ["wardha 2", maheshNagar],
  ["wardha 3", vaibhavNagar1],
  ["wardha 4", vaibhavNagar2],
];
const coverFor = (m) => {
  const name = (m.name || "").toLowerCase();
  return COVERS.find(([key]) => name.includes(key))?.[1];
};
const coverStyle = (m) => ({
  backgroundImage: `url(${JSON.stringify(
    m.imageUrl || m.thumbnail || coverFor(m) || logo,
  )})`,
});

/* Drops a trailing timestamp like " 2026-10-26T18:51:58.031141" and
   capitalises the first letter. */
const cleanName = (name) => {
  const n = (name || "Layout map")
    .replace(/\s*\d{4}-\d{2}-\d{2}T[\d:.]+\s*$/, "")
    .trim();
  return n.charAt(0).toUpperCase() + n.slice(1);
};

/* "PILKATOWN, Pilkapar, Khasra No. 59/3" -> project name + location line. */
const splitName = (name) => {
  const n = cleanName(name);
  const i = n.indexOf(",");
  return i > 0 ? [n.slice(0, i).trim(), n.slice(i + 1).trim()] : [n, ""];
};

function Arrow() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={ARROW} />
    </svg>
  );
}

export default function PublicHome() {
  const [maps, setMaps] = useState([]);
  const [state, setState] = useState("loading"); // loading | ready | error

  const load = useCallback(async () => {
    setState("loading");
    try {
      setMaps(await fetchMaps());
      setState("ready");
    } catch (err) {
      console.error("Error loading maps:", err);
      setState("error");
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const single = maps.length === 1 ? maps[0] : null;

  return (
    <div className="pub">
      <style>{CSS}</style>

      <header className="pub-top">
        <div className="pub-wrap pub-top-in">
          <div className="pub-brand">
            <img src={logo} alt={BRAND} />
          </div>
        </div>
      </header>

      <section className="pub-wrap pub-maps">
        <h2>Layout maps</h2>
        <p className="pub-lead">
          Select a layout to view plots, sizes and availability.
        </p>

        {state === "loading" && (
          <div className="pub-grid">
            {[0, 1, 2].map((i) => (
              <div className="pub-card pub-skel" key={i} />
            ))}
          </div>
        )}

        {state === "error" && (
          <div className="pub-note">
            <p>We could not load the layouts. Please check your connection.</p>
            <button type="button" className="pub-btn" onClick={load}>
              Try again
            </button>
          </div>
        )}

        {state === "ready" && maps.length === 0 && (
          <div className="pub-note">
            <p>Layouts will appear here soon.</p>
          </div>
        )}

        {state === "ready" && single && (
          <Link className="pub-feature" to={mapUrl(single)}>
            <div className="pub-feature-img" style={coverStyle(single)} />
            <div className="pub-feature-body">
              <h3>{splitName(single.name)[0]}</h3>
              {splitName(single.name)[1] && (
                <p className="pub-feature-sub">{splitName(single.name)[1]}</p>
              )}
              <p className="pub-feature-text">
                Explore every plot, its size and availability on the interactive
                layout map.
              </p>
              <span className="pub-btn">
                View layout <Arrow />
              </span>
            </div>
          </Link>
        )}

        {state === "ready" && maps.length > 1 && (
          <div className="pub-grid">
            {maps.map((m) => (
              <Link className="pub-card" to={mapUrl(m)} key={m.id}>
                <div className="pub-card-img" style={coverStyle(m)} />
                <div className="pub-card-body">
                  <h3>{splitName(m.name)[0]}</h3>
                  {splitName(m.name)[1] && (
                    <p className="pub-card-sub">{splitName(m.name)[1]}</p>
                  )}
                  <span className="pub-card-cta">
                    View layout <Arrow />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

const CSS = `
.pub { --pearl: #FFFBFA; --plum: #5A2A3A;
  --bg: var(--pearl); --surface: #FFFFFF; --ink: var(--plum); --muted: #7A5A66;
  --line: #F0DCDC; --accent: #7B3B52;
  position: fixed; inset: 0; overflow-y: auto; -webkit-overflow-scrolling: touch;
  background: var(--bg); color: var(--ink); line-height: 1.55;
  font-family: system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif; }
.pub * { box-sizing: border-box; }
.pub a { color: inherit; text-decoration: none; }
.pub h2, .pub h3, .pub p { margin: 0; }
.pub :focus-visible { outline: 2px solid var(--accent); outline-offset: 3px; }
.pub-wrap { max-width: 1080px; margin: 0 auto; padding: 0 24px; }
.pub h2 { font-family: Georgia, 'Times New Roman', serif; font-weight: 500; font-size: clamp(26px, 4vw, 34px); }
.pub .pub-lead { margin: 10px 0 36px; color: var(--muted); font-size: 16px; }

.pub-top { position: sticky; top: 0; z-index: 10; background: rgba(255,251,250,.92);
  backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px); border-bottom: 1px solid var(--line); }
.pub-top-in { display: flex; align-items: center; height: 72px; }
.pub-brand { display: flex; align-items: center; gap: 14px; min-width: 0; }
.pub-brand img { height: 48px; width: auto; max-width: 160px; object-fit: contain; }
.pub-brand span { font-family: Georgia, 'Times New Roman', serif; font-size: 20px; letter-spacing: .02em; }

.pub-btn { display: inline-flex; align-items: center; gap: 8px; min-height: 46px; padding: 0 24px; border: 0;
  border-radius: 999px; background: var(--ink); color: #fff; font: 600 15px system-ui, sans-serif; cursor: pointer; }
.pub-btn:hover { background: var(--accent); }

.pub-maps { padding-top: 56px; padding-bottom: 64px; }
.pub-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 24px; }

.pub-card { display: block; background: var(--surface); border: 1px solid var(--line); border-radius: 18px;
  overflow: hidden; transition: transform 160ms ease, box-shadow 160ms ease; }
.pub-card:hover { transform: translateY(-3px); box-shadow: 0 18px 36px -22px rgba(90,42,58,.3); }
.pub-card-img { aspect-ratio: 16 / 10; padding: 20px; background-color: #fff; background-size: contain;
  background-repeat: no-repeat; background-position: center; background-origin: content-box; }
.pub-card-body { padding: 16px 18px 18px; }
.pub-card-body h3 { font-family: Georgia, 'Times New Roman', serif; font-weight: 500; font-size: 19px; }
.pub-card-body .pub-card-sub { margin-top: 4px; font-size: 14px; color: var(--muted); }
.pub-card-cta { display: inline-flex; align-items: center; gap: 6px; margin-top: 10px; color: var(--accent); font-weight: 600; font-size: 14px; }

.pub-feature { display: grid; grid-template-columns: 1.25fr 1fr; background: var(--surface);
  border: 1px solid var(--line); border-radius: 24px; overflow: hidden;
  box-shadow: 0 24px 48px -32px rgba(90,42,58,.35); transition: transform 160ms ease, box-shadow 160ms ease; }
.pub-feature:hover { transform: translateY(-3px); box-shadow: 0 30px 56px -30px rgba(90,42,58,.45); }
.pub-feature:hover .pub-btn { background: var(--accent); }
.pub-feature-img { min-height: 360px; padding: 32px; background-color: #fff; background-size: contain;
  background-repeat: no-repeat; background-position: center; background-origin: content-box; }
.pub-feature-body { padding: 44px 40px; display: flex; flex-direction: column; justify-content: center; gap: 12px; }
.pub-feature-body h3 { font-family: Georgia, 'Times New Roman', serif; font-weight: 500;
  font-size: clamp(28px, 3.4vw, 38px); line-height: 1.1; letter-spacing: .01em; }
.pub-feature-sub { font-size: 17px; color: var(--accent); font-weight: 600; }
.pub-feature-text { font-size: 15px; color: var(--muted); max-width: 36ch; }
.pub-feature-body .pub-btn { align-self: flex-start; margin-top: 14px; }

.pub-skel { min-height: 260px; background: linear-gradient(100deg, #F8E6E6 30%, #FDF2F2 50%, #F8E6E6 70%);
  background-size: 200% 100%; animation: pubShimmer 1.4s linear infinite; }
.pub-note { text-align: center; padding: 40px 16px; border: 1px dashed var(--line); border-radius: 16px; color: var(--muted); }
.pub-note .pub-btn { margin-top: 16px; }

@keyframes pubShimmer { to { background-position: -200% 0; } }

@media (max-width: 720px) {
  .pub-top-in { height: 64px; }
  .pub-brand img { height: 40px; }
  .pub-brand span { font-size: 17px; }
  .pub-maps { padding-top: 40px; padding-bottom: 48px; }
  .pub-feature { grid-template-columns: 1fr; }
  .pub-feature-img { min-height: 220px; }
  .pub-feature-body { padding: 26px 22px 28px; }
}
@media (prefers-reduced-motion: reduce) {
  .pub-skel { animation: none; }
  .pub-card, .pub-feature { transition: none; }
}
`;
