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

// import React, { useCallback, useEffect, useState } from "react";
// import { Link } from "react-router-dom";

// import { fetchMaps } from "../services/mapsService";
// import logo from "../assets/logo.png";
// import gauriNagar from "../assets/gaurinagar.png";
// import maheshNagar from "../assets/maheshnagar.png";
// import shivgad from "../assets/shivgad.jpeg";
// import vaibhavNagar1 from "../assets/vaibhavnagar1.jpeg";
// import vaibhavNagar2 from "../assets/vaibhavnagar2.png";

// /* Must read exactly as the name printed in the logo. */
// const BRAND = import.meta.env.VITE_SITE_NAME || "Shivarpan Developer";

// const ARROW = "M5 12h14M13 6l6 6-6 6";
// const mapUrl = (m) => `/maps/${encodeURIComponent(m.id)}`;

// /* Picture for each map, matched against the map's name (lower-case).
//    A map's own `imageUrl` in Firestore always wins over this list. */
// const COVERS = [
//   ["ghuri", gauriNagar],
//   ["shivgarh", shivgad],
//   ["wardha 2", maheshNagar],
//   ["wardha 3", vaibhavNagar1],
//   ["wardha 4", vaibhavNagar2],
// ];
// const coverFor = (m) => {
//   const name = (m.name || "").toLowerCase();
//   return COVERS.find(([key]) => name.includes(key))?.[1];
// };
// const coverStyle = (m) => ({
//   backgroundImage: `url(${JSON.stringify(
//     m.imageUrl || m.thumbnail || coverFor(m) || logo,
//   )})`,
// });

// /* Drops a trailing timestamp like " 2026-10-26T18:51:58.031141" and
//    capitalises the first letter. */
// const cleanName = (name) => {
//   const n = (name || "Layout map")
//     .replace(/\s*\d{4}-\d{2}-\d{2}T[\d:.]+\s*$/, "")
//     .trim();
//   return n.charAt(0).toUpperCase() + n.slice(1);
// };

// /* "PILKATOWN, Pilkapar, Khasra No. 59/3" -> project name + location line. */
// const splitName = (name) => {
//   const n = cleanName(name);
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
//             <div className="pub-feature-img" style={coverStyle(single)} />
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
//                 <div className="pub-card-img" style={coverStyle(m)} />
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
// .pub-card-img { aspect-ratio: 16 / 10; padding: 20px; background-color: #fff; background-size: contain;
//   background-repeat: no-repeat; background-position: center; background-origin: content-box; }
// .pub-card-body { padding: 16px 18px 18px; }
// .pub-card-body h3 { font-family: Georgia, 'Times New Roman', serif; font-weight: 500; font-size: 19px; }
// .pub-card-body .pub-card-sub { margin-top: 4px; font-size: 14px; color: var(--muted); }
// .pub-card-cta { display: inline-flex; align-items: center; gap: 6px; margin-top: 10px; color: var(--accent); font-weight: 600; font-size: 14px; }

// .pub-feature { display: grid; grid-template-columns: 1.25fr 1fr; background: var(--surface);
//   border: 1px solid var(--line); border-radius: 24px; overflow: hidden;
//   box-shadow: 0 24px 48px -32px rgba(90,42,58,.35); transition: transform 160ms ease, box-shadow 160ms ease; }
// .pub-feature:hover { transform: translateY(-3px); box-shadow: 0 30px 56px -30px rgba(90,42,58,.45); }
// .pub-feature:hover .pub-btn { background: var(--accent); }
// .pub-feature-img { min-height: 360px; padding: 32px; background-color: #fff; background-size: contain;
//   background-repeat: no-repeat; background-position: center; background-origin: content-box; }
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



// import React, { useCallback, useEffect, useState } from "react";
// import { Link } from "react-router-dom";

// import { fetchMaps } from "../services/mapsService";
// import logo from "../assets/logo.png";
// import gauriNagar from "../assets/gaurinagar.png";
// import maheshNagar from "../assets/maheshnagar.png";
// import shivgad from "../assets/shivgad.jpeg";
// import vaibhavNagar1 from "../assets/vaibhavnagar1.jpeg";
// import vaibhavNagar2 from "../assets/vaibhavnagar2.png";

// /* Must read exactly as the name printed in the logo. */
// const BRAND = import.meta.env.VITE_SITE_NAME || "Shivarpan Developer";

// const ARROW = "M5 12h14M13 6l6 6-6 6";
// const mapUrl = (m) => `/maps/${encodeURIComponent(m.id)}`;

// /* Picture for each map, matched against the map's name (lower-case).
//    A map's own `imageUrl` in Firestore always wins over this list. */
// const COVERS = [
//   ["ghuri", gauriNagar],
//   ["shivgarh", shivgad],
//   ["wardha 2", maheshNagar],
//   ["wardha 3", vaibhavNagar1],
//   ["wardha 4", vaibhavNagar2],
// ];
// const coverFor = (m) => {
//   const name = (m.name || "").toLowerCase();
//   return COVERS.find(([key]) => name.includes(key))?.[1];
// };
// const coverStyle = (m) => ({
//   backgroundImage: `url(${JSON.stringify(
//     m.imageUrl || m.thumbnail || coverFor(m) || logo,
//   )})`,
// });

// /* Drops a trailing timestamp like " 2026-10-26T18:51:58.031141" and
//    capitalises the first letter. */
// const cleanName = (name) => {
//   const n = (name || "Layout map")
//     .replace(/\s*\d{4}-\d{2}-\d{2}T[\d:.]+\s*$/, "")
//     .trim();
//   return n.charAt(0).toUpperCase() + n.slice(1);
// };

// /* "PILKATOWN, Pilkapar, Khasra No. 59/3" -> project name + location line. */
// const splitName = (name) => {
//   const n = cleanName(name);
//   const i = n.indexOf(",");
//   return i > 0 ? [n.slice(0, i).trim(), n.slice(i + 1).trim()] : [n, ""];
// };

// function Arrow({ size = 18 }) {
//   return (
//     <svg
//       width={size}
//       height={size}
//       viewBox="0 0 24 24"
//       fill="none"
//       stroke="currentColor"
//       strokeWidth="1.8"
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
//             <div className="pub-plate" style={coverStyle(single)} />
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
//                 View layout <Arrow size={16} />
//               </span>
//             </div>
//           </Link>
//         )}

//         {state === "ready" && maps.length > 1 && (
//           <div className="pub-grid">
//             {maps.map((m, i) => (
//               <Link
//                 className="pub-card"
//                 to={mapUrl(m)}
//                 key={m.id}
//                 style={{ animationDelay: `${i * 80}ms` }}
//               >
//                 <div className="pub-plate" style={coverStyle(m)} />
//                 <div className="pub-card-body">
//                   <div className="pub-card-text">
//                     <h3>{splitName(m.name)[0]}</h3>
//                     {splitName(m.name)[1] && (
//                       <p className="pub-card-sub">{splitName(m.name)[1]}</p>
//                     )}
//                   </div>
//                   <span className="pub-go" aria-hidden="true">
//                     <Arrow />
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
// .pub { --bg: #130C10; --text: #F7EEEC; --muted: #B8A2A9; --accent: #F6D3D3; --ink: #2A1219;
//   --line: rgba(246,211,211,.13);
//   position: fixed; inset: 0; overflow-x: hidden; overflow-y: auto; -webkit-overflow-scrolling: touch;
//   -webkit-text-size-adjust: 100%;
//   color: var(--text); line-height: 1.55;
//   background:
//     radial-gradient(900px 520px at 12% -8%, rgba(123,59,82,.5), transparent 60%),
//     radial-gradient(700px 420px at 100% 0%, rgba(246,211,211,.09), transparent 55%),
//     var(--bg);
//   font-family: system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif; }
// .pub * { box-sizing: border-box; }
// .pub a, .pub button { -webkit-tap-highlight-color: transparent; touch-action: manipulation; }
// .pub a { color: inherit; text-decoration: none; }
// .pub h2, .pub h3, .pub p { margin: 0; }
// .pub :focus-visible { outline: 2px solid var(--accent); outline-offset: 3px; }
// .pub-wrap { max-width: 1080px; margin: 0 auto; padding-left: max(24px, env(safe-area-inset-left));
//   padding-right: max(24px, env(safe-area-inset-right)); }

// .pub-top { position: sticky; top: 0; z-index: 10; padding-top: env(safe-area-inset-top, 0px); background: rgba(19,12,16,.72);
//   backdrop-filter: blur(14px); -webkit-backdrop-filter: blur(14px); border-bottom: 1px solid var(--line); }
// .pub-top-in { display: flex; align-items: center; height: 96px; }
// .pub-brand { display: inline-flex; align-items: center; padding: 8px 18px; border-radius: 16px; background: #FFFBFA;
//   box-shadow: 0 8px 24px -10px rgba(0,0,0,.6); }
// .pub-brand img { display: block; height: 64px; width: auto; max-width: min(260px, 60vw); object-fit: contain; }

// .pub-maps { padding-top: 64px; padding-bottom: 72px; }
// .pub h2 { font-family: Georgia, 'Times New Roman', serif; font-weight: 500; font-size: clamp(30px, 4.6vw, 44px);
//   line-height: 1.1; letter-spacing: .005em; }
// .pub h2::after { content: ''; display: block; width: 56px; height: 2px; margin-top: 16px;
//   background: linear-gradient(90deg, var(--accent), transparent); }
// .pub .pub-lead { margin: 16px 0 40px; color: var(--muted); font-size: 16px; max-width: 46ch; }

// .pub-btn { display: inline-flex; align-items: center; gap: 8px; min-height: 48px; padding: 0 26px; border: 0;
//   border-radius: 999px; background: var(--accent); color: var(--ink); font: 600 15px system-ui, sans-serif;
//   cursor: pointer; transition: transform 160ms ease, filter 160ms ease; }

// /* the artwork sits on a pearl plate so wordmarks read cleanly on dark */
// .pub-plate { background-color: #FFFBFA; background-size: contain; background-repeat: no-repeat;
//   background-position: center; background-origin: content-box; }

// .pub-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 24px; }

// .pub-card { position: relative; display: flex; flex-direction: column; padding: 10px; border-radius: 24px;
//   background: linear-gradient(180deg, #25161C 0%, #1A1016 100%); border: 1px solid var(--line);
//   box-shadow: 0 20px 40px -28px rgba(0,0,0,.8);
//   animation: pubUp .6s cubic-bezier(.16,1,.3,1) both;
//   transition: transform 220ms ease, border-color 220ms ease, box-shadow 220ms ease; }
// .pub-card .pub-plate { aspect-ratio: 16 / 10; padding: 22px; border-radius: 16px; }
// .pub-card-body { display: flex; align-items: center; justify-content: space-between; gap: 14px; padding: 18px 8px 8px 10px; }
// .pub-card-text { min-width: 0; }
// .pub-card-body h3 { font-family: Georgia, 'Times New Roman', serif; font-weight: 500; font-size: 22px; line-height: 1.2; }
// .pub-card-sub { margin-top: 4px; font-size: 13.5px; color: var(--muted); display: -webkit-box;
//   -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
// .pub-go { flex: 0 0 auto; display: grid; place-items: center; width: 46px; height: 46px; border-radius: 50%;
//   border: 1px solid var(--line); color: var(--accent); transition: background 220ms ease, color 220ms ease, transform 220ms ease; }

// .pub-feature { display: grid; grid-template-columns: 1.2fr 1fr; padding: 12px; border-radius: 28px;
//   background: linear-gradient(180deg, #25161C 0%, #1A1016 100%); border: 1px solid var(--line);
//   box-shadow: 0 30px 60px -34px rgba(0,0,0,.85); transition: transform 220ms ease, border-color 220ms ease; }
// .pub-feature .pub-plate { min-height: 360px; padding: 36px; border-radius: 20px; }
// .pub-feature-body { display: flex; flex-direction: column; justify-content: center; gap: 12px; padding: 36px 36px 36px 40px; }
// .pub-feature-body h3 { font-family: Georgia, 'Times New Roman', serif; font-weight: 500;
//   font-size: clamp(30px, 3.6vw, 42px); line-height: 1.08; }
// .pub-feature-sub { font-size: 17px; font-weight: 600; color: var(--accent); }
// .pub-feature-text { font-size: 15px; color: var(--muted); max-width: 36ch; }
// .pub-feature-body .pub-btn { align-self: flex-start; margin-top: 14px; }

// .pub-skel { min-height: 300px; border: 1px solid var(--line);
//   background: linear-gradient(100deg, #1C1217 30%, #2A1B22 50%, #1C1217 70%); background-size: 200% 100%;
//   animation: pubShimmer 1.4s linear infinite; }
// .pub-note { text-align: center; padding: 44px 16px; border: 1px dashed var(--line); border-radius: 20px; color: var(--muted); }
// .pub-note .pub-btn { margin-top: 16px; }

// @media (hover: hover) {
//   .pub-btn:hover { filter: brightness(1.06); }
//   .pub-card:hover { transform: translateY(-5px); border-color: rgba(246,211,211,.4);
//     box-shadow: 0 30px 60px -26px rgba(246,211,211,.28), 0 0 0 1px rgba(246,211,211,.08); }
//   .pub-card:hover .pub-go { background: var(--accent); color: var(--ink); transform: translateX(3px); }
//   .pub-feature:hover { transform: translateY(-4px); border-color: rgba(246,211,211,.4); }
// }
// .pub-card:active, .pub-feature:active { transform: scale(.985); }
// .pub-card:active .pub-go { background: var(--accent); color: var(--ink); }
// .pub-btn:active { transform: scale(.97); }

// @keyframes pubUp { from { opacity: 0; transform: translateY(18px); } to { opacity: 1; transform: none; } }
// @keyframes pubShimmer { to { background-position: -200% 0; } }

// /* tablet */
// @media (max-width: 1023px) {
//   .pub-wrap { padding-left: max(28px, env(safe-area-inset-left)); padding-right: max(28px, env(safe-area-inset-right)); }
//   .pub-top-in { height: 88px; }
//   .pub-brand img { height: 58px; }
//   .pub-maps { padding-top: 52px; padding-bottom: 64px; }
//   .pub-grid { grid-template-columns: repeat(2, 1fr); gap: 22px; }
//   .pub-card-body h3 { font-size: 23px; }
//   .pub-card-sub { font-size: 14px; }
//   .pub-go { width: 48px; height: 48px; }
// }
// /* portrait tablet and large phones: the single featured layout stacks */
// @media (max-width: 860px) {
//   .pub-feature { grid-template-columns: 1fr; }
//   .pub-feature .pub-plate { min-height: 300px; }
//   .pub-feature-body { padding: 28px 24px 22px; }
//   .pub-feature-body .pub-btn { align-self: stretch; justify-content: center; }
// }
// /* phone */
// @media (max-width: 720px) {
//   .pub-wrap { padding-left: max(16px, env(safe-area-inset-left)); padding-right: max(16px, env(safe-area-inset-right)); }
//   .pub-top-in { height: 76px; }
//   .pub-brand { padding: 6px 12px; border-radius: 13px; }
//   .pub-brand img { height: 50px; max-width: min(220px, 62vw); }
//   .pub-maps { padding-top: 36px; padding-bottom: calc(40px + env(safe-area-inset-bottom, 0px)); }
//   .pub .pub-lead { margin: 14px 0 26px; font-size: 15.5px; }
//   .pub-grid { grid-template-columns: 1fr; gap: 16px; }
//   .pub-card { padding: 8px; border-radius: 22px; }
//   .pub-card .pub-plate { padding: 18px; border-radius: 15px; }
//   .pub-card-body { padding: 16px 6px 8px 8px; }
//   .pub-card-body h3 { font-size: 21px; }
//   .pub-go { width: 44px; height: 44px; }
//   .pub-feature { padding: 8px; border-radius: 24px; }
//   .pub-feature .pub-plate { min-height: 220px; padding: 24px; }
//   .pub-feature-body { padding: 22px 12px 14px; }
//   .pub-skel { min-height: 240px; }
// }
// @media (max-width: 360px) {
//   .pub-top-in { height: 68px; }
//   .pub-brand img { height: 44px; }
// }
// /* landscape phones and short windows: the header must not eat the page */
// @media (max-height: 480px) and (orientation: landscape) {
//   .pub-top-in { height: 60px; }
//   .pub-brand { padding: 4px 12px; }
//   .pub-brand img { height: 42px; }
//   .pub-maps { padding-top: 28px; padding-bottom: 36px; }
// }
// @media (prefers-reduced-motion: reduce) {
//   .pub-card { animation: none; }
//   .pub-skel { animation: none; }
//   .pub-card, .pub-feature, .pub-go, .pub-btn { transition: none; }
// }
// `;

import React, { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

import { fetchMaps } from "../services/mapsService";
import logo from "../assets/logo.png";
import banner from "../assets/banner.jpeg"; // save the Shivarpan Builders banner image here
import gauriNagar from "../assets/gaurinagar.png";
import maheshNagar from "../assets/maheshnagar.png";
import shivgad from "../assets/shivgad.jpeg";
import vaibhavNagar1 from "../assets/vaibhavnagar1.jpeg";
import vaibhavNagar2 from "../assets/vaibhavnagar2.png";
import footerBg from "../assets/footer.jpg"; // bottom strip cropped from the banner

const BRAND = import.meta.env.VITE_SITE_NAME || "Shivarpan Builders";
const ARROW = "M5 12h14M13 6l6 6-6 6";
const SHARE =
  "M4 12v7a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-7M16 6l-4-4-4 4M12 2v14";
const mapUrl = (map) => `/maps/${encodeURIComponent(map.id)}`;


// const COVERS = [
//   ["ghuri", gauriNagar],
//   ["shivgarh", shivgad],
//   ["wardha 2", maheshNagar],
//   ["wardha 3", vaibhavNagar1],
//   ["wardha 4", vaibhavNagar2],
// ];
const COVERS = [
  ["ghuri", gauriNagar],
  ["mahesh", maheshNagar],
  ["shivgarh", shivgad],
  ["vaibhav nagar 1", vaibhavNagar1],
  ["vaibhav nagar 2", vaibhavNagar2],
];

const coverFor = (map) => {
  const name = (map.name || "").toLowerCase();
  return COVERS.find(([key]) => name.includes(key))?.[1];
};

const coverStyle = (map) => {
  const image = map.imageUrl || map.thumbnail || coverFor(map) || logo;
  return { backgroundImage: `url(${JSON.stringify(image)})` };
};

const cleanName = (name) => {
  const value = (name || "Layout map").replace(/\s*\d{4}-\d{2}-\d{2}T[\d:.]+\s*$/, "").trim();
  return value.charAt(0).toUpperCase() + value.slice(1);
};

const splitName = (name) => {
  const value = cleanName(name);
  const comma = value.indexOf(",");
  return comma > 0 ? [value.slice(0, comma).trim(), value.slice(comma + 1).trim()] : [value, ""];
};

// Marks the element once it scrolls into view, so cards reveal one time.
function useInView() {
  const ref = useRef(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const node = ref.current;
    if (!node) return undefined;
    if (!("IntersectionObserver" in window)) {
      setSeen(true);
      return undefined;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setSeen(true);
          io.disconnect();
        }
      },
      { threshold: 0.08, rootMargin: "0px 0px -20px 0px" }
    );
    io.observe(node);
    return () => io.disconnect();
  }, []);
  return [ref, seen];
}

function Icon({ path, size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={path} />
    </svg>
  );
}

function LoadingState() {
  return (
    <div className="pub-grid" aria-label="Loading layouts" aria-busy="true">
      {[0, 1, 2].map((i) => (
        <div className="pub-skel" key={i}>
          <div className="pub-skel-img pub-shimmer" />
          <div className="pub-skel-line pub-shimmer" />
          <div className="pub-skel-line short pub-shimmer" />
        </div>
      ))}
    </div>
  );
}

function LayoutCard({ map, index }) {
  const [ref, seen] = useInView();
  const [copied, setCopied] = useState(false);
  const [title, location] = splitName(map.name);

  const share = async () => {
    const url = `${window.location.origin}${mapUrl(map)}`;
    try {
      if (navigator.share) {
        await navigator.share({ title, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // Share cancelled or clipboard blocked.
    }
  };

  return (
    <article ref={ref} className={`pub-card${seen ? " is-in" : ""}`} style={{ "--i": index % 3 }}>
      <Link className="pub-card-media" to={mapUrl(map)} tabIndex={-1} aria-label={`Open ${title}`}>
        <span className="pub-card-img" style={coverStyle(map)} />
        <span className="pub-badge">
          <span className="pub-dot" /> Interactive layout
        </span>
      </Link>

      <div className="pub-card-body">
        <h3 className="pub-card-title">
          <Link to={mapUrl(map)}>{title}</Link>
        </h3>
        {location && (
          <p className="pub-card-location">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 21s7-6.2 7-11.5A7 7 0 0 0 5 9.5C5 14.8 12 21 12 21Z" />
              <circle cx="12" cy="9.5" r="2.4" />
            </svg>
            <span>{location}</span>
          </p>
        )}
        <div className="pub-actions">
          <Link className="pub-button pub-button-main" to={mapUrl(map)}>
            <span>View layout</span> <Icon path={ARROW} />
          </Link>
          <button type="button" className="pub-button pub-button-ghost" onClick={share} aria-live="polite">
            <Icon path={SHARE} size={15} />
            <span>{copied ? "Copied" : "Share"}</span>
          </button>
        </div>
      </div>
    </article>
  );
}

export default function PublicHome() {
  const [maps, setMaps] = useState([]);
  const [state, setState] = useState("loading"); // loading | ready | error

  const load = useCallback(async () => {
    setState("loading");
    try {
      const result = await fetchMaps();
      setMaps(Array.isArray(result) ? result : []);
      setState("ready");
    } catch (error) {
      console.error("Error loading maps:", error);
      setState("error");
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="pub">
      <style>{CSS}</style>

      {/* Banner only, no app bar */}
      <section className="pub-banner">
        <img src={banner} alt={BRAND} />
      </section>

      <main className="pub-wrap pub-main">
        <div className="pub-head">
          <h1>Our plot layouts</h1>
          <p>Pick a project to explore plots, sizes and availability on the interactive map.</p>
        </div>

        {state === "loading" && <LoadingState />}

        {state === "error" && (
          <div className="pub-state" role="alert">
            <div className="pub-state-icon" aria-hidden="true">!</div>
            <h2>We couldn’t load the layouts</h2>
            <p>Check your internet connection and try again.</p>
            <button type="button" className="pub-button pub-button-main" onClick={load}>
              <span>Try again</span> <Icon path={ARROW} />
            </button>
          </div>
        )}

        {state === "ready" && maps.length === 0 && (
          <div className="pub-state">
            <div className="pub-state-icon" aria-hidden="true">⌂</div>
            <h2>New layouts are on the way</h2>
            <p>Project layouts will appear here once they are published.</p>
          </div>
        )}

        {state === "ready" && maps.length > 0 && (
          <section className="pub-grid" aria-label="Available project layouts">
            {maps.map((map, i) => (
              <LayoutCard map={map} index={i} key={map.id} />
            ))}
          </section>
        )}
      </main>

      <footer className="pub-footer" style={{ backgroundImage: `url(${footerBg})` }}>
        <span>{BRAND}</span>
        <span className="pub-footer-sep" />
        <span>Explore every plot with confidence</span>
      </footer>
    </div>
  );
}

const CSS = `
.pub {
  --bg: #f8f5ee;
  --card: #ffffff;
  --ink: #12352e;
  --muted: #5f716c;
  --teal: #0f5b4d;
  --teal-dark: #0b4a3e;
  --gold: #b99a5b;
  --line: rgba(18, 53, 46, .12);
  --ease: cubic-bezier(.22, 1, .36, 1);
  --gutter: clamp(16px, 4vw, 40px);
  --gap: clamp(18px, 2.4vw, 28px);
  min-height: 100vh;
  min-height: 100dvh;
  color: var(--ink);
  background: var(--bg);
  font-family: Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif;
  line-height: 1.5;
  overflow-x: hidden;
  -webkit-text-size-adjust: 100%;
  -webkit-tap-highlight-color: transparent;
}
.pub * { box-sizing: border-box; }
.pub a { color: inherit; text-decoration: none; }
.pub h1, .pub h2, .pub h3, .pub p { margin: 0; }
.pub :focus-visible { outline: 2px solid var(--gold); outline-offset: 3px; }
.pub-wrap {
  width: 100%;
  max-width: 1240px;
  margin: 0 auto;
  padding-left: max(var(--gutter), env(safe-area-inset-left));
  padding-right: max(var(--gutter), env(safe-area-inset-right));
}

/* banner: full image is shown (no side cropping) and only capped on very tall screens */
.pub-banner { position: relative; width: 100%; overflow: hidden; background: #f3efe6; }
.pub-banner img { display: block; width: 100%; height: auto; max-height: 72vh; object-fit: cover; object-position: center; transform: scale(1.04); animation: pubSettle 1.8s var(--ease) forwards; }
.pub-banner::after { content: ""; position: absolute; inset: auto 0 0; height: clamp(36px, 8vw, 90px); background: linear-gradient(180deg, transparent, var(--bg)); pointer-events: none; }

/* heading */
.pub-main { padding-top: clamp(12px, 2vw, 22px); padding-bottom: 0; }
.pub-head { margin-bottom: clamp(20px, 3vw, 32px); animation: pubFade 700ms 200ms var(--ease) both; }
.pub-head h1 { font-family: Georgia, "Times New Roman", serif; font-size: clamp(26px, 4.2vw, 42px); font-weight: 400; line-height: 1.15; letter-spacing: -.025em; }
.pub-head p { max-width: 52ch; margin-top: 8px; color: var(--muted); font-size: clamp(14px, 1.6vw, 15.5px); }

/* grid: 1 column phones, 2 tablets, 3 desktop */
.pub-grid { display: grid; grid-template-columns: minmax(0, 1fr); gap: var(--gap); }
@media (min-width: 620px) { .pub-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
@media (min-width: 1024px) { .pub-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); } }

/* cards */
.pub-card { display: flex; flex-direction: column; min-width: 0; overflow: hidden; border: 1px solid var(--line); border-radius: 20px; background: var(--card); opacity: 0; transform: translateY(20px); transition: opacity 600ms var(--ease), transform 600ms var(--ease), box-shadow 350ms var(--ease); transition-delay: calc(var(--i) * 70ms); }
.pub-card.is-in { opacity: 1; transform: none; }
.pub-card-media { position: relative; display: block; aspect-ratio: 16 / 10; overflow: hidden; background: #fff9f6; border-bottom: 1px solid var(--line); }
.pub-card-img { position: absolute; inset: 0; background-position: center; background-repeat: no-repeat; background-size: contain; transition: transform 900ms var(--ease); }
.pub-badge { position: absolute; top: 12px; left: 12px; display: inline-flex; align-items: center; gap: 7px; max-width: calc(100% - 24px); padding: 6px 11px; border-radius: 999px; color: var(--teal); background: rgba(255, 255, 255, .95); box-shadow: 0 6px 18px -10px rgba(0,0,0,.4); font-size: 11px; font-weight: 700; letter-spacing: .02em; line-height: 1.2; white-space: nowrap; }
.pub-dot { flex: 0 0 7px; width: 7px; height: 7px; border-radius: 50%; background: #2fb26b; animation: pubPulse 2s ease-out infinite; }

.pub-card-body { display: flex; flex: 1; flex-direction: column; padding: clamp(16px, 2.2vw, 22px); }
.pub-card-title { font-family: Georgia, "Times New Roman", serif; font-size: clamp(21px, 2.4vw, 25px); font-weight: 400; line-height: 1.2; letter-spacing: -.02em; overflow-wrap: anywhere; }
.pub-card-title a { background: linear-gradient(currentColor, currentColor) 0 100% / 0 1px no-repeat; transition: background-size 400ms var(--ease), color 200ms; }
.pub-card-location { display: flex; align-items: flex-start; gap: 7px; margin-top: 8px; color: var(--muted); font-size: 14px; overflow-wrap: anywhere; }
.pub-card-location svg { flex: 0 0 15px; width: 15px; height: 15px; margin-top: 3px; fill: none; stroke: var(--gold); stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round; }
.pub-actions { display: flex; gap: 10px; margin-top: auto; padding-top: 20px; }

/* buttons */
.pub-button {
  --btn-text: #ffffff;
  position: relative; isolation: isolate; overflow: hidden;
  display: inline-flex; align-items: center; justify-content: center; gap: 9px;
  min-height: 46px; padding: 0 20px;
  border: 1.5px solid transparent; border-radius: 999px;
  color: var(--btn-text);
  background: linear-gradient(135deg, #14705e 0%, #0f5b4d 55%, #0b4a3e 100%);
  box-shadow: 0 10px 22px -12px rgba(15, 91, 77, .75), inset 0 1px 0 rgba(255,255,255,.18);
  font-family: inherit; font-size: 14px; font-weight: 700; line-height: 1; letter-spacing: .02em;
  white-space: nowrap; cursor: pointer; appearance: none; -webkit-appearance: none;
  touch-action: manipulation;
  transition: transform 250ms var(--ease), box-shadow 300ms var(--ease), color 250ms, background 300ms, border-color 250ms;
}
/* light sweep that glides across the button */
.pub-button::before {
  content: ""; position: absolute; z-index: -1; top: 0; bottom: 0; left: -60%; width: 40%;
  background: linear-gradient(100deg, transparent, rgba(255,255,255,.35), transparent);
  transform: skewX(-20deg);
  animation: pubSweep 4.5s ease-in-out infinite;
}
/* beats ".pub a { color: inherit }" so link buttons really get the button text color */
.pub a.pub-button, .pub button.pub-button { color: var(--btn-text); }
.pub-button svg { flex: 0 0 auto; transition: transform 350ms var(--ease); }
.pub-button-main svg { padding: 3px; box-sizing: content-box; width: 16px; height: 16px; border-radius: 50%; color: #0b4a3e; background: #e9cf8f; }
.pub-button:active { transform: scale(.96); box-shadow: 0 4px 10px -8px rgba(15, 91, 77, .8); }
.pub-actions .pub-button { min-width: 0; }
.pub-button-main { flex: 1.5 1 0; }
.pub-button-ghost {
  --btn-text: #0b4a3e;
  flex: 1 1 0;
  border-color: var(--gold);
  background: #fffaf0;
  box-shadow: none;
}
.pub-button-ghost::before { display: none; }
.pub-button-ghost svg { color: var(--gold); }
.pub-state .pub-button { flex: none; min-width: 170px; margin-top: 22px; }

/* hover only on devices that can hover, so touch screens never get stuck states */
@media (hover: hover) and (pointer: fine) {
  .pub-card.is-in:hover { transform: translateY(-5px); box-shadow: 0 26px 48px -30px rgba(15, 91, 77, .45); transition-delay: 0ms; }
  .pub-card:hover .pub-card-img { transform: scale(1.05); }
  .pub-card:hover .pub-card-title a { color: var(--teal); background-size: 100% 1px; }
  .pub-button:hover { transform: translateY(-3px); box-shadow: 0 16px 28px -12px rgba(15, 91, 77, .8), inset 0 1px 0 rgba(255,255,255,.22); }
  .pub-button-main:hover svg { transform: translateX(4px) rotate(-8deg); }
  .pub-button-ghost:hover { --btn-text: #0b4a3e; background: linear-gradient(135deg, #e9cf8f, #c9a85f); border-color: #c9a85f; box-shadow: 0 14px 24px -14px rgba(185, 154, 91, .9); }
  .pub-button-ghost:hover svg { color: #0b4a3e; transform: translateY(-2px); }
}

/* states */
.pub-state { display: flex; flex-direction: column; align-items: center; padding: clamp(36px, 8vw, 58px) 20px; border: 1px solid var(--line); border-radius: 20px; background: var(--card); text-align: center; animation: pubFade 600ms var(--ease) both; }
.pub-state-icon { display: grid; width: 44px; height: 44px; place-items: center; margin-bottom: 16px; border: 1px solid var(--gold); border-radius: 50%; color: var(--teal); font-size: 20px; }
.pub-state h2 { font-family: Georgia, serif; font-size: clamp(21px, 3vw, 26px); font-weight: 400; line-height: 1.25; }
.pub-state p { max-width: 420px; margin-top: 9px; color: var(--muted); font-size: 14px; }
.pub-skel { display: flex; flex-direction: column; gap: 12px; }
.pub-skel-img { aspect-ratio: 16 / 10; border-radius: 20px; }
.pub-skel-line { width: 70%; height: 18px; border-radius: 8px; }
.pub-skel-line.short { width: 45%; }
.pub-shimmer { background-color: #ece8de; background-image: linear-gradient(100deg, transparent 25%, rgba(255,255,255,.75) 48%, transparent 70%); background-size: 200% 100%; animation: pubShimmer 1.5s linear infinite; }

.pub-footer {
  display: flex; align-items: center; justify-content: center; gap: 12px;
  margin-top: clamp(36px, 6vw, 70px);
  padding: clamp(90px, 16vw, 170px) max(var(--gutter), env(safe-area-inset-left)) calc(24px + env(safe-area-inset-bottom));
  background-color: #0b4a3e;
  background-position: center bottom;
  background-repeat: no-repeat;
  background-size: cover;
  color: #f7e9c4;
  font-size: 12px; letter-spacing: .02em; text-align: center;
}
.pub-footer > span:first-child { color: #fff; font-weight: 700; }
.pub-footer-sep { flex: 0 0 3px; width: 3px; height: 3px; border-radius: 50%; background: #e9cf8f; }

@keyframes pubSweep { 0%, 55% { left: -60%; } 100% { left: 130%; } }
@keyframes pubSettle { to { transform: scale(1); } }
@keyframes pubFade { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: none; } }
@keyframes pubShimmer { to { background-position: -200% 0; } }
@keyframes pubPulse { 0% { box-shadow: 0 0 0 0 rgba(47,178,107,.55); } 80%, 100% { box-shadow: 0 0 0 8px rgba(47,178,107,0); } }

/* phones */
@media (max-width: 619px) {
  .pub-banner img { min-height: 150px; }
  .pub-card { border-radius: 18px; }
  .pub-button { min-height: 48px; }
  .pub-footer { flex-wrap: wrap; gap: 6px 10px; text-align: center; }
}
/* very small phones: stack the two buttons */
@media (max-width: 340px) {
  .pub-actions { flex-direction: column; }
  .pub-button-main, .pub-button-ghost { flex: none; width: 100%; }
}
/* large screens: keep the banner from getting oversized */
@media (min-width: 1400px) {
  .pub-banner img { max-height: 640px; }
}
@media (prefers-reduced-motion: reduce) {
  .pub-button::before { display: none; }
  .pub *, .pub *::before, .pub *::after { animation-duration: .01ms !important; animation-delay: 0ms !important; transition-duration: .01ms !important; transition-delay: 0ms !important; }
  .pub-card { opacity: 1; transform: none; }
  .pub-banner img { transform: none; }
}
`;
