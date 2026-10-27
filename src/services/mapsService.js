// import { doc, getDoc } from 'firebase/firestore';
// import { db } from '../firebase/config';
// import { MAP_IDS } from '../config/site';

// /** The maps the home page lists, read from maps/{id}. A map whose
//     document has isEnabled === false is hidden. */
// export async function fetchMaps() {
//   const snaps = await Promise.all(MAP_IDS.map((id) => getDoc(doc(db, 'maps', id))));
//   return snaps
//     .filter((s) => s.exists())
//     .map((s) => ({ id: s.id, ...s.data() }))
//     .filter((m) => m.isEnabled !== false);
// }


import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { MAP_IDS } from '../config/site';

export async function fetchMaps() {
  
  const snaps = await Promise.all(MAP_IDS.map((id) => getDoc(doc(db, 'maps', id))));
  snaps.forEach((s, i) => {
    if (!s.exists()) console.warn(`maps/${MAP_IDS[i]} was not found`);
    else if (s.data().isEnabled === false) console.warn(`maps/${MAP_IDS[i]} is disabled`);
  });
  return snaps
    .filter((s) => s.exists())
    .map((s) => ({ id: s.id, ...s.data() }))
    .filter((m) => m.isEnabled !== false);
}