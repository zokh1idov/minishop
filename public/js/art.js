// Иллюстрации товаров: единый стиль (графит, красный, слоновая кость), без внешних файлов.
// Ключ — поле "art" в server/products.json. Чтобы заменить рисунок настоящим фото,
// добавьте товару поле "image": "img/hoodie.jpg" (файл в public/img/).

const shadow = '<ellipse cx="100" cy="182" rx="56" ry="7" style="fill:var(--ground, rgba(0,0,0,.38))"/>';

const ART = {
  // ---------- Худи ----------
  hoodie: `
    <defs>
      <linearGradient id="hd-b" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ef3946"/><stop offset="1" stop-color="#8a1020"/></linearGradient>
      <linearGradient id="hd-s" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#7a0f1d"/><stop offset=".5" stop-color="#b8192b"/><stop offset="1" stop-color="#7a0f1d"/></linearGradient>
      <linearGradient id="hd-h" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ff5360"/><stop offset="1" stop-color="#b3192a"/></linearGradient>
    </defs>
    ${shadow}
    <path d="M58 70C38 78 26 104 20 142l24 7c4-22 10-40 18-52z" fill="url(#hd-s)"/>
    <path d="M142 70c20 8 32 34 38 72l-24 7c-4-22-10-40-18-52z" fill="url(#hd-s)"/>
    <path d="M20 142l24 7-3 12-24-7z" fill="#5c0a15"/><path d="M180 142l-24 7 3 12 24-7z" fill="#5c0a15"/>
    <path d="M58 70h84l10 104q-52 14-104 0z" fill="url(#hd-b)"/>
    <path d="M47 168q53 14 106 0l1 10q-54 16-108 0z" fill="#6d0c19"/>
    <path d="M70 140h60l8 28H62z" fill="#a8172a"/><path d="M70 140h60l8 28H62z" fill="none" stroke="#5c0a15" stroke-width="2" stroke-linejoin="round"/>
    <path d="M70 140l-6 28M130 140l6 28" stroke="#5c0a15" stroke-width="2"/>
    <path d="M66 66C64 36 136 36 134 66c0 16-14 26-34 26S66 82 66 66z" fill="url(#hd-h)"/>
    <path d="M78 66c2-14 42-14 44 0 0 10-10 17-22 17S78 76 78 66z" fill="#2a0509"/>
    <path d="M90 88l-3 30M110 88l3 30" stroke="#f6eeef" stroke-width="3" stroke-linecap="round"/>
    <circle cx="87" cy="121" r="3.2" fill="#f6eeef"/><circle cx="113" cy="121" r="3.2" fill="#f6eeef"/>
`,

  // ---------- Футболка ----------
  tee: `
    <defs>
      <linearGradient id="te-b" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f7f1ee"/><stop offset="1" stop-color="#c8bcb8"/></linearGradient>
      <linearGradient id="te-s" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".14"/></linearGradient>
    </defs>
    ${shadow}
    <path d="M68 30Q100 50 132 30L178 54 162 98 140 88V170H60V88L38 98 22 54Z" fill="url(#te-b)"/>
    <path d="M68 30Q100 50 132 30L178 54 162 98 140 88V170H60V88L38 98 22 54Z" fill="url(#te-s)"/>
    <path d="M70 31Q100 64 130 31" fill="none" stroke="#a3968f" stroke-width="6" stroke-linecap="round"/>
    <path d="M60 160h80" stroke="#000" stroke-opacity=".08" stroke-width="3"/>
    <path d="M26 62l-2-8M174 62l2-8" stroke="#000" stroke-opacity=".08" stroke-width="2"/>
    <g transform="translate(100 104)">
      <circle r="24" fill="#d9202f"/>
      <polygon points="4,-16 -12,4 -2,4 -6,16 12,-5 2,-5" fill="#fff"/>
    </g>`,

  // ---------- Кепка ----------
  cap: `
    <defs>
      <linearGradient id="cp-d" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#3a3a42"/><stop offset="1" stop-color="#121216"/></linearGradient>
      <linearGradient id="cp-b" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f23c4a"/><stop offset="1" stop-color="#9c1424"/></linearGradient>
    </defs>
    ${shadow}
    <path d="M38 120C36 72 78 46 110 54c32 8 52 36 50 66z" fill="url(#cp-d)"/>
    <path d="M100 52c-14 18-18 44-12 68M100 52c18 14 34 40 40 68" stroke="#000" stroke-opacity=".35" stroke-width="1.6" fill="none"/>
    <circle cx="100" cy="51" r="5" fill="#d9202f"/>
    <path d="M26 124c34-14 96-14 152 4-20 18-90 20-152-4z" fill="url(#cp-b)"/>
    <path d="M26 124c34-14 96-14 152 4" stroke="#fff" stroke-opacity=".35" stroke-width="2" fill="none"/>
    <path d="M38 120c40-6 86-6 122 0" stroke="#000" stroke-opacity=".5" stroke-width="3" fill="none"/>
    <path d="M70 70c8-10 22-16 34-16" stroke="#fff" stroke-opacity=".16" stroke-width="3" fill="none" stroke-linecap="round"/>
    <g transform="translate(92 98) rotate(8)"><rect x="-9" y="-9" width="18" height="18" rx="3" fill="#d9202f" transform="rotate(45)"/></g>`,

  // ---------- Рюкзак ----------
  backpack: `
    <defs>
      <linearGradient id="bp-b" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#3a3a43"/><stop offset="1" stop-color="#15151a"/></linearGradient>
      <linearGradient id="bp-p" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#2e2e36"/><stop offset="1" stop-color="#1b1b21"/></linearGradient>
    </defs>
    ${shadow}
    <path d="M82 50C82 20 118 20 118 50" fill="none" stroke="#1b1b21" stroke-width="9" stroke-linecap="round"/>
    <path d="M48 70C48 44 152 44 152 70l6 100q-58 16-116 0z" fill="url(#bp-b)"/>
    <path d="M46 96c-12 10-12 56 0 70l8-4V100z" fill="#101014"/><path d="M154 96c12 10 12 56 0 70l-8-4V100z" fill="#101014"/>
    <path d="M60 78q40-14 80 0" fill="none" stroke="#d9202f" stroke-width="3" stroke-linecap="round"/>
    <path d="M60 114q40-10 80 0l4 52q-44 10-88 0z" fill="url(#bp-p)" stroke="#000" stroke-opacity=".4" stroke-width="1.5"/>
    <path d="M62 120q38-9 76 0" fill="none" stroke="#d9202f" stroke-width="3.5" stroke-linecap="round"/>
    <rect x="95" y="116" width="10" height="16" rx="3" fill="#d9202f"/>
    <rect x="86" y="86" width="28" height="12" rx="3" fill="#d9202f"/>
    <path d="M64 56c6-6 14-10 22-12" stroke="#fff" stroke-opacity=".16" stroke-width="3" fill="none" stroke-linecap="round"/>`,

  // ---------- Стикеры ----------
  stickers: `
    ${shadow}
    <g transform="translate(70 82) rotate(-14)">
      <rect x="-42" y="-42" width="84" height="84" rx="20" fill="#f3ecea" stroke="#f3ecea" stroke-width="5"/>
      <rect x="-38" y="-38" width="76" height="76" rx="16" fill="#d9202f"/>
      <polygon points="0,-24 6,-8 23,-7 9,3 14,20 0,10 -14,20 -9,3 -23,-7 -6,-8" fill="#fff"/>
    </g>
    <g transform="translate(132 96) rotate(10)">
      <rect x="-40" y="-40" width="80" height="80" rx="40" fill="#f3ecea" stroke="#f3ecea" stroke-width="5"/>
      <circle r="35" fill="#16161a"/>
      <polygon points="5,-24 -15,5 -2,5 -7,24 16,-8 3,-8" fill="#ff4552"/>
    </g>
    <g transform="translate(96 132) rotate(-4)">
      <rect x="-44" y="-30" width="88" height="60" rx="16" fill="#f3ecea" stroke="#f3ecea" stroke-width="5"/>
      <rect x="-40" y="-26" width="80" height="52" rx="12" fill="#2a1519"/>
      <path d="M0 14C-24 -2-16 -22 0-10 16-22 24-2 0 14z" fill="#d9202f"/>
    </g>`,

  // ---------- Чехол для наушников ----------
  case: `
    <defs>
      <linearGradient id="cs-b" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#3b3b44"/><stop offset="1" stop-color="#16161b"/></linearGradient>
    </defs>
    ${shadow}
    <path d="M142 62c14-14 36-6 28 12-5 11-18 14-26 8" fill="none" stroke="#9a8f93" stroke-width="5" stroke-linecap="round"/>
    <rect x="38" y="64" width="124" height="86" rx="43" fill="url(#cs-b)"/>
    <path d="M56 92q44-26 88 0" fill="none" stroke="#e8e0de" stroke-width="3" stroke-dasharray="3 3.5" stroke-linecap="round"/>
    <path d="M56 92q44-26 88 0" fill="none" stroke="#000" stroke-opacity=".35" stroke-width="7" stroke-linecap="round" transform="translate(0 2)" opacity=".4"/>
    <rect x="94" y="72" width="12" height="20" rx="4" fill="#d9202f" transform="rotate(-4 100 82)"/>
    <circle cx="100" cy="78" r="2.6" fill="#fff" opacity=".7"/>
    <path d="M58 118q42 14 84 0" stroke="#fff" stroke-opacity=".08" stroke-width="2" fill="none"/>
    <path d="M50 110c0-18 10-30 26-36" stroke="#fff" stroke-opacity=".18" stroke-width="3" fill="none" stroke-linecap="round"/>`,

  // ---------- Кружка ----------
  mug: `
    <defs>
      <linearGradient id="mg-b" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#d7cdc9"/><stop offset=".35" stop-color="#fbf6f3"/><stop offset="1" stop-color="#c3b7b2"/></linearGradient>
      <linearGradient id="mg-r" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#9c1424"/><stop offset=".4" stop-color="#e52a39"/><stop offset="1" stop-color="#8a1020"/></linearGradient>
    </defs>
    ${shadow}
    <path d="M139 80c36-4 36 56 0 54" fill="none" stroke="#b3182a" stroke-width="10" stroke-linecap="round"/>
    <path d="M62 62v88q0 16 16 16h44q16 0 16-16V62z" fill="url(#mg-b)"/>
    <path d="M62 100h76v18H62z" fill="url(#mg-r)"/>
    <ellipse cx="100" cy="62" rx="38" ry="10" fill="#efe7e3"/>
    <ellipse cx="100" cy="63" rx="33" ry="7.5" fill="#3a2016"/>
    <ellipse cx="100" cy="62" rx="30" ry="5" fill="#5a3322" opacity=".6"/>
    <path d="M88 44c-6-8 6-12 0-20M104 42c-6-8 6-12 0-20M120 44c-6-8 6-12 0-20" fill="none" stroke="#f3ecea" stroke-opacity=".45" stroke-width="3" stroke-linecap="round"/>
    <path d="M70 74v70" stroke="#fff" stroke-opacity=".7" stroke-width="3" stroke-linecap="round"/>`,

  // ---------- Термос ----------
  thermos: `
    <defs>
      <linearGradient id="th-b" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#7d0f1d"/><stop offset=".3" stop-color="#ee3543"/><stop offset=".55" stop-color="#c11a2b"/><stop offset="1" stop-color="#6c0b18"/></linearGradient>
      <linearGradient id="th-c" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#101013"/><stop offset=".4" stop-color="#3b3b44"/><stop offset="1" stop-color="#0d0d10"/></linearGradient>
    </defs>
    ${shadow}
    <g transform="translate(100 110) scale(1.16) translate(-100 -110)">
    <rect x="72" y="56" width="56" height="118" rx="16" fill="url(#th-b)"/>
    <rect x="72" y="118" width="56" height="8" fill="#16161a"/>
    <rect x="72" y="158" width="56" height="16" rx="8" fill="#16161a" opacity=".9"/>
    <rect x="76" y="28" width="48" height="32" rx="10" fill="url(#th-c)"/>
    <path d="M84 36v18M92 36v18M100 36v18M108 36v18M116 36v18" stroke="#fff" stroke-opacity=".12" stroke-width="2"/>
    <path d="M92 28c0-12 16-12 16 0" fill="none" stroke="#3b3b44" stroke-width="5" stroke-linecap="round"/>
    <path d="M84 70v44M84 132v22" stroke="#fff" stroke-opacity=".55" stroke-width="4" stroke-linecap="round"/>
    </g>`,

  // ---------- Блокнот ----------
  notebook: `
    <defs>
      <linearGradient id="nb-c" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#3b3b44"/><stop offset="1" stop-color="#17171c"/></linearGradient>
    </defs>
    ${shadow}
    <g transform="rotate(-5 100 100)">
      <rect x="58" y="34" width="96" height="140" rx="8" fill="#e8e0dc"/>
      <path d="M154 44v122M150 40v130" stroke="#bdb2ae" stroke-width="1.5"/>
      <rect x="52" y="30" width="96" height="140" rx="8" fill="url(#nb-c)"/>
      <rect x="52" y="30" width="12" height="140" rx="6" fill="#0f0f13"/>
      <rect x="124" y="30" width="9" height="140" fill="#d9202f"/>
      <rect x="124" y="30" width="9" height="140" fill="#fff" opacity=".12"/>
      <rect x="74" y="54" width="38" height="14" rx="3" fill="none" stroke="#d9202f" stroke-width="2"/>
      <path d="M74 80h30M74 88h22" stroke="#fff" stroke-opacity=".2" stroke-width="2" stroke-linecap="round"/>
      <path d="M96 170v22l7-6 7 6v-22z" fill="#d9202f"/>
    </g>`,
};

/** SVG-иллюстрация по ключу или null, если такого рисунка нет. */
export function art(key) {
  const body = ART[key];
  return body ? `<svg class="art" viewBox="0 0 200 200" role="img" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">${body}</svg>` : null;
}
