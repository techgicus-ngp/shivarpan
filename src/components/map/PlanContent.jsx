
// import React from 'react';
// import { pathWithHoles } from '../../lib/geometry';
// import { fittedNumberSize } from '../../lib/labels';
// import { STATUS, statusKeyOf } from '../../theme/status';
// import {
//   DIM_EDGE, DIM_FILL, DIM_INK,
//   KIND, MAPFONT, MONO, SANS, PLOT_STROKE, SEL_STROKE, SOCKET_FILL,
// } from '../../theme/tokens';

// /* EVERY plot on the layout, off-white. This replaces toneOf's per-block
//    master-plan tones outright — one plot reads the same as the next, so
//    the only colour anywhere on the plan is a sale colour, and a coloured
//    plot means something rather than being one more shade among twelve.

//    Roads, open spaces and amenities are untouched: their colours come
//    from KIND, not from here.

//    Change this one constant to recolour the whole layout. */
// const PLAIN_FILL = '#F1ECE2';

// /* ── THE LAYOUT BOUNDARY ─────────────────────────────────────────────
//    The outer edge of the whole site, carried down from Firestore's map
//    meta document as `layoutBoundary` and converted in buildLayout.js
//    through the same frame every plot corner goes through — so by the
//    time it reaches here it is already a plain ring of [x, y] points in
//    drawing-space metres, exactly like any feature's own `pts`. Not every
//    project has one, so this draws nothing when the field is absent
//    rather than guessing at an edge from the plots' own extent.

//    FILLED IN THE EXACT ROAD COLOUR (KIND.road.fill), NO STROKE — it's a
//    ground tone, not an outlined shape, matching how a road itself sits
//    on the sheet with no border of its own.

//    DRAWN FIRST, before plots, roads and every label, so it sits under
//    the whole layout as a backdrop rather than covering any of it. */
// export default function PlanContent({
//   layout, selected, matches, status, showNumbers, showStatus, hover, setHover, onPick,
// }) {
//   /* One reading of a plot's status, shared by the shape and its number:
//      they have to agree, or a plot ends up with dark ink on a red fill.

//      `status` is undefined for the first frames, before the Firestore
//      read lands, so it is guarded here rather than indexed raw. */
//   const stateOf = (name) => STATUS[statusKeyOf((status || {})[name])];

//   const layoutBoundary = layout.layoutBoundary;

//   return (
//     <g>
//       {layoutBoundary && layoutBoundary.length > 2 && (
//         <path
//           d={pathWithHoles(layoutBoundary)}
//           fill={KIND.road.fill}
//           fillRule="evenodd"
//           stroke="none"
//           style={{ pointerEvents: 'none' }}
//         />
//       )}

//       {layout.sorted.map((f) => {
//         const k = KIND[f.kind];
//         const isPlot = f.kind === 'plot';
//         const isSel = isPlot && selected === f.name;
//         const dim = isPlot && matches && !matches.has(f.name);

//         let fill = k.fill;
//         if (isPlot) {
//           /* Off-white unless the plot has a sale state AND the status
//              view is up. Nothing else colours a plot. */
//           const st = stateOf(f.name);
//           fill = (showStatus && st.fill) || PLAIN_FILL;
//         }
//         if (isSel) fill = SOCKET_FILL;   // the raised copy carries the real colour

//         return (
//           <path
//             key={f.i}
//             data-plot={isPlot ? f.name : undefined}
//             d={pathWithHoles(f.pts, f.holes)}
//             fill={fill}
//             fillRule="evenodd"
//             stroke={isSel ? '#E9C6F2' : k.stroke}
//             strokeWidth={isSel ? SEL_STROKE : PLOT_STROKE}
//             fillOpacity={dim ? DIM_FILL : 0.92}
//             strokeOpacity={dim ? DIM_EDGE : 1}
//             opacity={hover === f.name && isPlot ? 0.85 : 1}
//             onMouseEnter={() => isPlot && setHover(f.name)}
//             onClick={() => isPlot && onPick(f.name)}
//             style={{ cursor: isPlot ? 'pointer' : 'default' }}
//           />
//         );
//       })}

//       {showNumbers && layout.plots.map((f) => {
//         if (f.name === selected) return null;
//         const dim = matches && !matches.has(f.name);
//         const size = fittedNumberSize(f, 3.2);
//         if (size < 0.85) return null;   // smaller than this is a smudge, not a number
//         /* Dark ink vanishes on the red and blue fills, so the number
//            takes whatever the status says is legible on it — and stays
//            dark on an off-white plot, which has no status to ask. */
//         const st = showStatus ? stateOf(f.name) : null;
//         const ink = (st && st.fill && st.ink) || '#1A1208';
//         return (
//           <text
//             key={`n${f.i}`} x={f.lp[0]} y={f.lp[1]} textAnchor="middle" dy="0.35em"
//             fontFamily={MAPFONT} fontSize={size} fontWeight="600" fill={ink}
//             fillOpacity={dim ? DIM_INK : 1}
//             style={{ pointerEvents: 'none' }}
//           >
//             {f.name}
//           </text>
//         );
//       })}

//       {/* Roads, open spaces, amenities and utilities name themselves. A
//           road polygon is long and thin, so its longest edge is the
//           direction the name should run — which is how the CAD sheet set
//           "9 MT. WIDE ROAD" along each carriageway. */}
//       {layout.features.map((f) => {
//         if (f.kind === 'plot') return null;
//         const label = (f.title || f.name || '').trim();
//         if (!label) return null;

//         const isRoad = f.kind === 'road';
//         const size = Math.min(Math.max(f.ir * (isRoad ? 0.55 : 0.9), 1.2), isRoad ? 2.8 : 3.8);
//         if (size < 1.2) return null;

//         const ink = KIND[f.kind].ink;
//         const [x, y] = f.lp;

//         return (
//           <g
//             key={`l${f.i}`} style={{ pointerEvents: 'none' }} paintOrder="stroke"
//             stroke="rgba(0,0,0,0.45)" strokeWidth={size * 0.028}
//             transform={`rotate(${f.angle} ${x} ${y})`}
//           >
//             <text
//               x={x} y={isRoad ? y : y - size * 0.4} textAnchor="middle" dy="0.35em"
//               fontFamily={isRoad ? MAPFONT : SANS} fontSize={size}
//               letterSpacing={isRoad ? 0 : 0.5} fill={ink} fontWeight="600"
//             >
//               {label}
//             </text>
//             {!isRoad && f.area > 200 && (
//               <text
//                 x={x} y={y + size * 0.85} textAnchor="middle" dy="0.35em"
//                 fontFamily={MONO} fontSize={size * 0.62} fill={ink} opacity="0.85"
//               >
//                 {Math.round(f.area).toLocaleString('en-IN')} m²
//               </text>
//             )}
//           </g>
//         );
//       })}
//     </g>
//   );
// }

import React, { useMemo } from 'react';
import { pathWithHoles } from '../../lib/geometry';
import { fittedNumberSize } from '../../lib/labels';
import { STATUS, statusKeyOf } from '../../theme/status';
import {
  DIM_EDGE, DIM_FILL, DIM_INK,
  KIND, MAPFONT, MONO, SANS, PLOT_STROKE, SEL_STROKE, SOCKET_FILL,
} from '../../theme/tokens';
import space1 from "../../assets/space12.jpeg"   // check filename: maybe "space1.jpeg"?
import space3 from "../../assets/space3.jpeg"
import space2 from "../../assets/space2.jpeg"

/* EVERY plot on the layout, off-white. Change this one constant to
   recolour the whole layout. Sale colours are the only other colour. */
const PLAIN_FILL = '#F1ECE2';

/* ── OPEN-SPACE IMAGES ─────────────────────────────────────────────── */
const OPEN_KIND = 'open_space';

const OPEN_IMAGES = [
  space1,   // OPEN SPACE 1
  space2,   // OPEN SPACE 2
  space3,   // OPEN SPACE 3
];

const OPEN_IMAGE_BY_NAME = {
  'OPEN SPACE 1': space1,
  'OPEN SPACE 2': space2,
  'OPEN SPACE 3': space3,
};

/* Any feature whose label contains one of these words is treated as a
   space too (it only gets an image if one is given for it). */
const EXTRA_SPACE_WORDS = /nmrda/i;

/* Spaces listed here use the picture's proportions (width ÷ height). */
const IMAGE_RATIO = {
  'OPEN SPACE 1': 3200 / 1370,
};

/* Spaces listed here are COVERED completely (picture spread over the
   full extent, clipped to the outline).
     true  → cover the whole open space
     false → largest undistorted rectangle inside */
const COVER_SPACE = {
  'OPEN SPACE 1': true,
};

/* Force the picture's angle in degrees (0 = upright). */
const LOCK_ANGLE = {
  // 'OPEN SPACE 1': 0,
};

/* Nudge the final angle by a few degrees. */
const ROTATION_ADJUST = {
  'OPEN SPACE 1': 0,
};

/* Used only for spaces NOT listed in IMAGE_RATIO (they fill the shape). */
const TILT_ADJUST = {
  'OPEN SPACE 2': 0,
  'OPEN SPACE 3': 0,
};

const MIN_IMAGE_AREA = 100;   // m² — spaces smaller than this get no image

const DEBUG_SPACES = false;   // true → list every non-plot feature in the console

/* ── geometry helpers ───────────────────────────────────────────────── */

// point-in-polygon (ray casting)
function pip(x, y, poly) {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const xi = poly[i][0], yi = poly[i][1];
    const xj = poly[j][0], yj = poly[j][1];
    if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}

// does a w×h rectangle centred on (cx,cy), turned by (c,s), sit fully inside the polygon?
function rectFits(poly, cx, cy, w, h, c, s) {
  const S = 5;   // was 8
  for (let k = 0; k <= S; k++) {
    const t = k / S;
    const pts = [
      [-w / 2 + t * w, -h / 2],
      [-w / 2 + t * w, h / 2],
      [-w / 2, -h / 2 + t * h],
      [w / 2, -h / 2 + t * h],
    ];
    for (const [lx, ly] of pts) {
      if (!pip(cx + lx * c - ly * s, cy + lx * s + ly * c, poly)) return false;
    }
  }
  // no corner of the polygon may poke into the rectangle
  for (const p of poly) {
    const dx = p[0] - cx, dy = p[1] - cy;
    const lx = dx * c + dy * s;
    const ly = -dx * s + dy * c;
    if (Math.abs(lx) < w / 2 && Math.abs(ly) < h / 2) return false;
  }
  return true;
}

/* Largest rectangle of a given width÷height that fits fully inside the
   polygon. Tries the directions of the longest edges (and their
   perpendiculars), so the picture lines up with the open space. */
function bestRect(pts, ratio, lockDeg) {
  const xs = pts.map((p) => p[0]);
  const ys = pts.map((p) => p[1]);
  const minX = Math.min(...xs), maxX = Math.max(...xs);
  const minY = Math.min(...ys), maxY = Math.max(...ys);
  const bw = maxX - minX, bh = maxY - minY;

  let thetas;
  if (lockDeg != null) {
    thetas = [(lockDeg * Math.PI) / 180];
  } else {
    const edges = [];
    for (let i = 0; i < pts.length; i++) {
      const a = pts[i], b = pts[(i + 1) % pts.length];
      let deg = (Math.atan2(b[1] - a[1], b[0] - a[0]) * 180) / Math.PI;
      deg = ((deg % 180) + 180) % 180;
      edges.push({ len: Math.hypot(b[0] - a[0], b[1] - a[1]), deg });
    }
    edges.sort((p, q) => q.len - p.len);
    const degs = [];
    for (const e of edges) {
      if (degs.length >= 3) break;
      if (!degs.some((d) => Math.abs((((d - e.deg + 90) % 180) + 180) % 180 - 90) < 2)) degs.push(e.deg);
    }
    thetas = degs.flatMap((d) => [d, d + 90]).map((d) => (d * Math.PI) / 180);
  }

  const G = 9;   // was 14
  let best = { w: 0 };
  for (const th of thetas) {
    const c = Math.cos(th), s = Math.sin(th);
    for (let gi = 0; gi < G; gi++) {
      for (let gj = 0; gj < G; gj++) {
        const cx = minX + ((gi + 0.5) / G) * bw;
        const cy = minY + ((gj + 0.5) / G) * bh;
        if (!pip(cx, cy, pts)) continue;
        // skip centres that cannot beat the best so far
        if (best.w && !rectFits(pts, cx, cy, best.w * 1.01, (best.w * 1.01) / ratio, c, s)) continue;
        let lo = best.w || 0;
        let hi = Math.max(bw, bh) * 1.2;
        for (let it = 0; it < 8; it++) {   // was 10
          const mid = (lo + hi) / 2;
          if (rectFits(pts, cx, cy, mid, mid / ratio, c, s)) lo = mid; else hi = mid;
        }
        if (lo > best.w) best = { w: lo, cx, cy, th };
      }
    }
  }
  if (!best.w) return null;

  const w = best.w * 0.985;   // a hair smaller so the edge never touches the outline
  let deg = (best.th * 180) / Math.PI;
  while (deg > 90) deg -= 180;
  while (deg <= -90) deg += 180;
  return { cx: best.cx, cy: best.cy, w, h: w / ratio, deg };
}

/* The rectangle, turned by `deg`, that covers the WHOLE polygon. */
function coverRect(pts, deg) {
  const rad = (deg * Math.PI) / 180;
  const c = Math.cos(rad), s = Math.sin(rad);
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  for (const p of pts) {
    const lx = p[0] * c + p[1] * s;
    const ly = -p[0] * s + p[1] * c;
    if (lx < minX) minX = lx;
    if (lx > maxX) maxX = lx;
    if (ly < minY) minY = ly;
    if (ly > maxY) maxY = ly;
  }
  const mx = (minX + maxX) / 2;
  const my = (minY + maxY) / 2;
  return {
    cx: mx * c - my * s,
    cy: mx * s + my * c,
    w: maxX - minX,
    h: maxY - minY,
    deg,
  };
}

/* Smallest tilted rectangle that covers the polygon (spaces that fill
   their shape). */
function orientedBox(pts) {
  let best = null;
  for (let i = 0; i < pts.length; i++) {
    const a = pts[i];
    const b = pts[(i + 1) % pts.length];
    const th = Math.atan2(b[1] - a[1], b[0] - a[0]);
    const c = Math.cos(-th), s = Math.sin(-th);

    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    for (const p of pts) {
      const rx = p[0] * c - p[1] * s;
      const ry = p[0] * s + p[1] * c;
      if (rx < minX) minX = rx;
      if (rx > maxX) maxX = rx;
      if (ry < minY) minY = ry;
      if (ry > maxY) maxY = ry;
    }
    const w = maxX - minX, h = maxY - minY;
    if (!best || w * h < best.area) best = { area: w * h, th, w, h, minX, minY };
  }

  const mx = best.minX + best.w / 2;
  const my = best.minY + best.h / 2;
  const c = Math.cos(best.th), s = Math.sin(best.th);
  const cx = mx * c - my * s;
  const cy = mx * s + my * c;

  let deg = (best.th * 180) / Math.PI;
  const w = best.w, h = best.h;
  while (deg > 90) deg -= 180;
  while (deg <= -90) deg += 180;

  return { cx, cy, w, h, deg };
}

const labelOf = (f) => `${f.title || ''} ${f.name || ''}`.trim();

// is this feature one that should get an image?
const isSpace = (f) =>
  f.kind !== 'plot' &&
  f.kind !== 'road' &&
  (f.kind === OPEN_KIND ||
    /open\s*space/i.test(labelOf(f)) ||
    EXTRA_SPACE_WORDS.test(labelOf(f)));

// "OPEN SPACE 2" → 2. Spaces with no number (like the NMRDA land) go last.
const numOf = (f) => {
  const m = labelOf(f).match(/\d+/);
  return m ? parseInt(m[0], 10) : 999;
};

const ROAD_FONT_BOOST = 2;

/* One reading of a plot's status, shared by the shape and its number:
   they have to agree, or a plot ends up with dark ink on a red fill.
   `status` is undefined for the first frames, so it is guarded. */
const stateOf = (status, name) => STATUS[statusKeyOf((status || {})[name])];

/* ── single plot / feature shape: re-renders only if its own props change ── */
const Shape = React.memo(function Shape({
  d, plotName, fill, stroke, strokeWidth, fillOpacity, strokeOpacity, opacity,
}) {
  return (
    <path
      data-plot={plotName}
      d={d}
      fill={fill}
      fillRule="evenodd"
      stroke={stroke}
      strokeWidth={strokeWidth}
      fillOpacity={fillOpacity}
      strokeOpacity={strokeOpacity}
      opacity={opacity}
      style={{ cursor: plotName ? 'pointer' : 'default' }}
    />
  );
});

/* ── open-space pictures: depend only on layout + showImages ── */
const ImagesLayer = React.memo(function ImagesLayer({ spaces }) {
  return spaces.map((s) => {
    const clipId = `os-clip-${s.id}`;

    // largest undistorted rectangle inside the shape (no clip)
    if (s.mode === 'fit') {
      const p = s.p;
      return (
        <image
          key={`img${s.id}`}
          href={s.src}
          x={p.cx - p.w / 2}
          y={p.cy - p.h / 2}
          width={p.w}
          height={p.h}
          preserveAspectRatio="none"
          transform={`rotate(${p.deg} ${p.cx} ${p.cy})`}
          style={{ pointerEvents: 'none' }}
        />
      );
    }

    // 'cover' = spread over the whole space, 'fill' = fill the shape; both clipped
    const isCover = s.mode === 'cover';
    const r = isCover ? s.r : s.box;
    const tilt = isCover ? r.deg : s.tilt;

    return (
      <g key={`img${s.id}`} style={{ pointerEvents: 'none' }}>
        <defs>
          <clipPath id={clipId}>
            <path d={s.d} clipRule="evenodd" />
          </clipPath>
        </defs>
        <g clipPath={`url(#${clipId})`}>
          <image
            href={s.src}
            x={r.cx - r.w / 2}
            y={r.cy - r.h / 2}
            width={r.w}
            height={r.h}
            preserveAspectRatio={isCover ? 'none' : 'xMidYMid slice'}
            transform={`rotate(${tilt} ${r.cx} ${r.cy})`}
            opacity={isCover ? undefined : 0.95}
          />
        </g>
      </g>
    );
  });
});

/* ── plot numbers: sizes are precomputed per layout ── */
const NumbersLayer = React.memo(function NumbersLayer({
  plots, sizes, selected, matches, status, showStatus,
}) {
  return plots.map((f, i) => {
    if (f.name === selected) return null;
    const size = sizes[i];
    if (size < 0.85) return null;   // smaller than this is a smudge, not a number
    const dim = matches && !matches.has(f.name);
    /* Dark ink vanishes on the red and blue fills, so the number takes
       whatever the status says is legible on it — and stays dark on an
       off-white plot, which has no status to ask. */
    const st = showStatus ? stateOf(status, f.name) : null;
    const ink = (st && st.fill && st.ink) || '#1A1208';
    return (
      <text
        key={`n${f.i}`} x={f.lp[0]} y={f.lp[1]} textAnchor="middle" dy="0.35em"
        fontFamily={MAPFONT} fontSize={size} fontWeight="600" fill={ink}
        fillOpacity={dim ? DIM_INK : 1}
        style={{ pointerEvents: 'none' }}
      >
        {f.name}
      </text>
    );
  });
});

/* ── road / space / amenity names: depend only on layout ──
   A road polygon is long and thin, so its longest edge is the direction
   the name should run, like "9 MT. WIDE ROAD" on the CAD sheet. */
const FeatureLabels = React.memo(function FeatureLabels({ features }) {
  return features.map((f) => {
    if (f.kind === 'plot') return null;
    const label = (f.title || f.name || '').trim();
    if (!label) return null;

    const isRoad = f.kind === 'road';
    const baseSize = Math.min(Math.max(f.ir * (isRoad ? 0.55 : 0.9), 1.2), isRoad ? 2.8 : 3.8);
    const size = isRoad ? baseSize + ROAD_FONT_BOOST : baseSize;
    if (size < 1.2) return null;

    const ink = KIND[f.kind].ink;
    const [x, y] = f.lp;

    return (
      <g
        key={`l${f.i}`} style={{ pointerEvents: 'none' }} paintOrder="stroke"
        stroke="rgba(0,0,0,0.45)" strokeWidth={size * 0.028}
        transform={`rotate(${f.angle} ${x} ${y})`}
      >
        <text
          x={x} y={isRoad ? y : y - size * 0.4} textAnchor="middle" dy="0.35em"
          fontFamily={isRoad ? MAPFONT : SANS} fontSize={size}
          letterSpacing={isRoad ? 0 : 0.5} fill={ink} fontWeight="600"
        >
          {label}
        </text>
        {!isRoad && f.area > 200 && (
          <text
            x={x} y={y + size * 0.85} textAnchor="middle" dy="0.35em"
            fontFamily={MONO} fontSize={size * 0.62} fill={ink} opacity="0.85"
          >
            {Math.round(f.area).toLocaleString('en-IN')} m²
          </text>
        )}
      </g>
    );
  });
});

/* ── THE LAYOUT BOUNDARY ─────────────────────────────────────────────
   Outer edge of the whole site (`layoutBoundary`), already a ring of
   [x, y] points in drawing-space metres. Draws nothing when absent.
   Filled in the exact road colour, no stroke, and drawn FIRST so it
   sits under the whole layout as a backdrop. */
export default function PlanContent({
  layout, selected, matches, status, showNumbers, showStatus, hover, setHover, onPick,
  showImages = true,   // set false to hide open-space images
}) {
  /* ── everything below depends only on `layout`, so it runs once ── */
  const boundaryD = useMemo(() => {
    const b = layout.layoutBoundary;
    return b && b.length > 2 ? pathWithHoles(b) : null;
  }, [layout]);

  const pathById = useMemo(() => {
    const m = {};
    layout.features.forEach((f) => { m[f.i] = pathWithHoles(f.pts, f.holes); });
    return m;
  }, [layout]);

  const numberSizes = useMemo(
    () => layout.plots.map((f) => fittedNumberSize(f, 3.2)),
    [layout]
  );

  const spaces = useMemo(() => {
    const list = layout.features.filter(isSpace).sort((a, b) => numOf(a) - numOf(b));

    if (DEBUG_SPACES) {
      console.log(
        'non-plot features [kind, label, area]:',
        layout.features.filter((f) => f.kind !== 'plot').map((f) => [f.kind, labelOf(f), f.area])
      );
      console.log('spaces that get an image:', list.map(labelOf));
    }

    return list
      .map((f, idx) => {
        if (f.area != null && f.area < MIN_IMAGE_AREA) return null;

        const nameKey = (f.title || f.name || '').trim();
        const isNmrda = EXTRA_SPACE_WORDS.test(labelOf(f));
        const src =
          f.image ||
          OPEN_IMAGE_BY_NAME[nameKey] ||
          (isNmrda ? null : OPEN_IMAGES[idx % OPEN_IMAGES.length]);

        // no picture for this space (e.g. the NMRDA land): draw nothing
        if (!src) return null;

        const base = { id: f.i, src, d: pathById[f.i] };

        // picture placed by its proportions (open space 1)
        const ratio = IMAGE_RATIO[nameKey];
        if (ratio) {
          const p = bestRect(f.pts, ratio, LOCK_ANGLE[nameKey]);
          if (p) {
            const deg = p.deg + (ROTATION_ADJUST[nameKey] || 0);
            if (COVER_SPACE[nameKey]) {
              return { ...base, mode: 'cover', r: coverRect(f.pts, deg) };
            }
            return { ...base, mode: 'fit', p: { ...p, deg } };
          }
        }

        // fill the shape, clipped to it
        const box = orientedBox(f.pts);
        return { ...base, mode: 'fill', box, tilt: box.deg + (TILT_ADJUST[nameKey] || 0) };
      })
      .filter(Boolean);
  }, [layout, pathById]);

  /* ── one delegated handler pair instead of two closures per plot ── */
  const handleOver = (e) => {
    const n = e.target.getAttribute && e.target.getAttribute('data-plot');
    if (n) setHover(n);
  };
  const handleClick = (e) => {
    const n = e.target.getAttribute && e.target.getAttribute('data-plot');
    if (n) onPick(n);
  };

  return (
    <g>
      {boundaryD && (
        <path
          d={boundaryD}
          fill={KIND.road.fill}
          fillRule="evenodd"
          stroke="none"
          style={{ pointerEvents: 'none' }}
        />
      )}

      <g onMouseOver={handleOver} onClick={handleClick}>
        {layout.sorted.map((f) => {
          const k = KIND[f.kind];
          const isPlot = f.kind === 'plot';
          const isSel = isPlot && selected === f.name;
          const dim = isPlot && matches && !matches.has(f.name);

          let fill = k.fill;
          if (isPlot) {
            /* Off-white unless the plot has a sale state AND the status
               view is up. Nothing else colours a plot. */
            const st = stateOf(status, f.name);
            fill = (showStatus && st.fill) || PLAIN_FILL;
          }
          if (isSel) fill = SOCKET_FILL;   // the raised copy carries the real colour

          return (
            <Shape
              key={f.i}
              d={pathById[f.i]}
              plotName={isPlot ? f.name : undefined}
              fill={fill}
              stroke={isSel ? '#E9C6F2' : k.stroke}
              strokeWidth={isSel ? SEL_STROKE : PLOT_STROKE}
              fillOpacity={dim ? DIM_FILL : 0.92}
              strokeOpacity={dim ? DIM_EDGE : 1}
              opacity={hover === f.name && isPlot ? 0.85 : 1}
            />
          );
        })}
      </g>

      {showImages && <ImagesLayer spaces={spaces} />}

      {showNumbers && (
        <NumbersLayer
          plots={layout.plots}
          sizes={numberSizes}
          selected={selected}
          matches={matches}
          status={status}
          showStatus={showStatus}
        />
      )}

      <FeatureLabels features={layout.features} />
    </g>
  );
}