#!/usr/bin/env node
// Generator for Still Form SVG placeholder art.
// Slot → object kind mapping (kept in sync with productCodeToSlot):
//   product-1 = 머그 (mug with handle, warm wood)
//   product-2 = 글라스 (glass without handle, clear silhouette)
//   product-3 = 램프 (table lamp, dome + stem)
//   product-4 = 트레이 (oval tray with handles)
//   product-5 = 쿠션 (cushion, plain + weave variant)
//   product-6 = 디퓨저 (reed diffuser bottle + sticks)
//   product-7 = 펜 스탠드 (cylinder pen cup with pens)
//   product-8 = 북 스탠드 (L-shaped book stand with books)
import fs from 'node:fs';
import path from 'node:path';

const HERE = path.dirname(new URL(import.meta.url).pathname);
const WOOD = '#C9B08D';
const WOOD_D = '#A8916F';
const LINE = '#E4DCCE';
const INK = '#26221E';
const PAPER = '#F4F0E6';
const PAPER_TINT = '#EDE7D9';
const PAPER_GLASS = '#F8F4EA'; // slightly lighter for glass tint

function svg(viewBox, body, w, h) {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" width="${w}" height="${h}">${body}</svg>`;
}

// =========== PRODUCT-N.SVG (600×600) — 8 distinct still-life kinds ===========

// product-1: 머그 (stoneware mug with handle, warm wood body)
const product1 = svg('0 0 600 600',
    `<rect width="600" height="600" fill="${PAPER}"/>
     <ellipse cx="300" cy="440" rx="120" ry="6" fill="${LINE}"/>
     <path d="M210 230 L210 390 Q210 412 232 412 L368 412 Q390 412 390 390 L390 230 Z" fill="${WOOD}" stroke="${WOOD_D}" stroke-width="2"/>
     <ellipse cx="300" cy="230" rx="90" ry="14" fill="${WOOD_D}"/>
     <ellipse cx="300" cy="228" rx="80" ry="9" fill="${PAPER}" opacity="0.55"/>
     <path d="M390 260 Q446 260 446 320 Q446 380 390 380" fill="none" stroke="${WOOD_D}" stroke-width="6" stroke-linecap="round"/>
     <path d="M260 195 Q252 175 268 158 Q276 148 268 130" fill="none" stroke="${LINE}" stroke-width="3" stroke-linecap="round"/>
     <path d="M300 185 Q292 165 308 148 Q316 138 308 120" fill="none" stroke="${LINE}" stroke-width="3" stroke-linecap="round"/>
     <path d="M340 195 Q332 175 348 158 Q356 148 348 130" fill="none" stroke="${LINE}" stroke-width="3" stroke-linecap="round"/>`,
    600, 600);

// product-2: 글라스 (glass tumbler, no handle, clear silhouette via light fill + 1px outline)
const product2 = svg('0 0 600 600',
    `<rect width="600" height="600" fill="${PAPER}"/>
     <ellipse cx="300" cy="440" rx="90" ry="6" fill="${LINE}"/>
     <!-- glass body (no handle, slightly tapered cylinder) -->
     <path d="M222 200 L234 410 Q234 422 246 422 L354 422 Q366 422 366 410 L378 200 Z"
           fill="${PAPER_GLASS}" stroke="${INK}" stroke-width="1.5"/>
     <!-- rim ellipse -->
     <ellipse cx="300" cy="200" rx="78" ry="10" fill="none" stroke="${INK}" stroke-width="1.5"/>
     <ellipse cx="300" cy="200" rx="72" ry="7" fill="${PAPER}" opacity="0.6"/>
     <!-- water/liquid line -->
     <line x1="234" y1="270" x2="370" y2="270" stroke="${INK}" stroke-width="1" opacity="0.35"/>
     <!-- highlight -->
     <line x1="244" y1="220" x2="240" y2="370" stroke="${PAPER}" stroke-width="3" opacity="0.85"/>`,
    600, 600);

// product-3: 테이블 램프 (dome shade + stem + base)
const product3 = svg('0 0 600 600',
    `<rect width="600" height="600" fill="${PAPER}"/>
     <ellipse cx="300" cy="450" rx="120" ry="6" fill="${LINE}"/>
     <path d="M250 440 Q250 430 260 430 L340 430 Q350 430 350 440 L350 450 L250 450 Z" fill="${WOOD_D}"/>
     <rect x="260" y="425" width="80" height="6" fill="${INK}" opacity="0.6"/>
     <rect x="295" y="280" width="10" height="150" fill="${WOOD_D}"/>
     <path d="M210 280 Q210 200 300 180 Q390 200 390 280 Z" fill="${WOOD}" stroke="${WOOD_D}" stroke-width="2"/>
     <ellipse cx="300" cy="280" rx="90" ry="10" fill="${WOOD_D}"/>
     <ellipse cx="300" cy="295" rx="60" ry="14" fill="${PAPER_TINT}" opacity="0.7"/>`,
    600, 600);

// product-4: 우드 트레이 (oval tray with side handles, small mug on top)
const product4 = svg('0 0 600 600',
    `<rect width="600" height="600" fill="${PAPER}"/>
     <ellipse cx="300" cy="430" rx="190" ry="8" fill="${LINE}"/>
     <ellipse cx="300" cy="340" rx="170" ry="48" fill="${WOOD}" stroke="${WOOD_D}" stroke-width="2"/>
     <ellipse cx="300" cy="335" rx="150" ry="36" fill="${WOOD_D}" opacity="0.55"/>
     <path d="M110 320 Q70 340 110 360" fill="none" stroke="${WOOD_D}" stroke-width="6" stroke-linecap="round"/>
     <path d="M490 320 Q530 340 490 360" fill="none" stroke="${WOOD_D}" stroke-width="6" stroke-linecap="round"/>
     <!-- mug sitting on tray -->
     <path d="M260 290 L260 332 Q260 342 270 342 L330 342 Q340 342 340 332 L340 290 Z" fill="${PAPER}" stroke="${INK}" stroke-width="1.5"/>
     <ellipse cx="300" cy="290" rx="40" ry="6" fill="${INK}" opacity="0.6"/>`,
    600, 600);

// product-5: 쿠션 (rounded square cushion with seam + corner buttons, weave lines)
const product5 = svg('0 0 600 600',
    `<rect width="600" height="600" fill="${PAPER}"/>
     <ellipse cx="300" cy="445" rx="160" ry="8" fill="${LINE}"/>
     <rect x="170" y="220" width="260" height="220" rx="30" ry="30" fill="${WOOD}" stroke="${WOOD_D}" stroke-width="2"/>
     <rect x="190" y="240" width="220" height="180" rx="20" ry="20" fill="none" stroke="${WOOD_D}" stroke-width="1.5" stroke-dasharray="4 3"/>
     <circle cx="200" cy="240" r="4" fill="${WOOD_D}"/>
     <circle cx="400" cy="240" r="4" fill="${WOOD_D}"/>
     <circle cx="200" cy="420" r="4" fill="${WOOD_D}"/>
     <circle cx="400" cy="420" r="4" fill="${WOOD_D}"/>
     <line x1="170" y1="290" x2="430" y2="290" stroke="${WOOD_D}" stroke-width="1" opacity="0.4"/>
     <line x1="170" y1="330" x2="430" y2="330" stroke="${WOOD_D}" stroke-width="1" opacity="0.4"/>
     <line x1="170" y1="370" x2="430" y2="370" stroke="${WOOD_D}" stroke-width="1" opacity="0.4"/>`,
    600, 600);

// product-6: 리드 디퓨저 (square bottle + reed sticks + collar)
const product6 = svg('0 0 600 600',
    `<rect width="600" height="600" fill="${PAPER}"/>
     <ellipse cx="300" cy="445" rx="90" ry="6" fill="${LINE}"/>
     <line x1="270" y1="180" x2="250" y2="420" stroke="${WOOD_D}" stroke-width="3" stroke-linecap="round"/>
     <line x1="290" y1="170" x2="280" y2="420" stroke="${WOOD}" stroke-width="3" stroke-linecap="round"/>
     <line x1="310" y1="175" x2="305" y2="420" stroke="${WOOD_D}" stroke-width="3" stroke-linecap="round"/>
     <line x1="330" y1="170" x2="335" y2="420" stroke="${WOOD}" stroke-width="3" stroke-linecap="round"/>
     <rect x="240" y="290" width="120" height="140" rx="6" fill="${PAPER}" stroke="${INK}" stroke-width="1.5"/>
     <rect x="246" y="340" width="108" height="84" fill="${WOOD}" opacity="0.5"/>
     <rect x="275" y="270" width="50" height="22" fill="${PAPER}" stroke="${INK}" stroke-width="1.5"/>
     <rect x="270" y="265" width="60" height="8" fill="${WOOD_D}"/>
     <rect x="260" y="365" width="80" height="40" fill="none" stroke="${INK}" stroke-width="1"/>`,
    600, 600);

// product-7: 펜 스탠드 (cylinder pen cup with 4 pens inside)
const product7 = svg('0 0 600 600',
    `<rect width="600" height="600" fill="${PAPER}"/>
     <ellipse cx="300" cy="450" rx="90" ry="6" fill="${LINE}"/>
     <path d="M235 280 L235 440 Q235 455 250 455 L350 455 Q365 455 365 440 L365 280 Z" fill="${WOOD}" stroke="${WOOD_D}" stroke-width="2"/>
     <ellipse cx="300" cy="280" rx="65" ry="10" fill="${WOOD_D}"/>
     <ellipse cx="300" cy="280" rx="58" ry="6" fill="${INK}" opacity="0.7"/>
     <rect x="270" y="160" width="6" height="130" rx="3" fill="${INK}"/>
     <rect x="290" y="140" width="6" height="150" rx="3" fill="${WOOD_D}"/>
     <rect x="310" y="180" width="6" height="110" rx="3" fill="${INK}" opacity="0.85"/>
     <rect x="325" y="155" width="6" height="135" rx="3" fill="${WOOD_D}"/>
     <polygon points="270,160 273,150 276,160" fill="${WOOD_D}"/>
     <polygon points="290,140 293,130 296,140" fill="${INK}"/>
     <polygon points="310,180 313,170 316,180" fill="${WOOD_D}"/>
     <polygon points="325,155 328,145 331,155" fill="${INK}"/>`,
    600, 600);

// product-8: 북 스�드 (L-shape with stack of books)
const product8 = svg('0 0 600 600',
    `<rect width="600" height="600" fill="${PAPER}"/>
     <ellipse cx="300" cy="445" rx="140" ry="6" fill="${LINE}"/>
     <rect x="170" y="380" width="260" height="60" fill="${WOOD}" stroke="${WOOD_D}" stroke-width="2"/>
     <rect x="170" y="240" width="40" height="200" fill="${WOOD_D}"/>
     <rect x="220" y="320" width="200" height="14" fill="${PAPER}" stroke="${INK}" stroke-width="1.2"/>
     <rect x="225" y="306" width="190" height="14" fill="${PAPER}" stroke="${INK}" stroke-width="1.2"/>
     <rect x="230" y="292" width="180" height="14" fill="${PAPER}" stroke="${INK}" stroke-width="1.2"/>
     <line x1="220" y1="320" x2="220" y2="334" stroke="${INK}" stroke-width="1.2"/>
     <line x1="170" y1="400" x2="430" y2="400" stroke="${WOOD_D}" stroke-width="1" opacity="0.7"/>`,
    600, 600);

// product-fallback: simple plate
const productFallback = svg('0 0 600 600',
    `<rect width="600" height="600" fill="${PAPER}"/>
     <ellipse cx="300" cy="430" rx="140" ry="6" fill="${LINE}"/>
     <ellipse cx="300" cy="320" rx="140" ry="38" fill="${WOOD}" stroke="${WOOD_D}" stroke-width="2"/>
     <ellipse cx="300" cy="312" rx="118" ry="28" fill="${WOOD_D}" opacity="0.55"/>`,
    600, 600);

// =========== HERO + PROMO + CATEGORY (1200×600 / 800×600) ===========
// (Hero/promo/category SVGs already used still-life objects; keep as-is for visual continuity)

const hero1 = svg('0 0 1200 600',
    `<rect width="1200" height="600" fill="${PAPER}"/>
     <line x1="0" y1="430" x2="1200" y2="430" stroke="${LINE}" stroke-width="1"/>
     <line x1="120" y1="430" x2="1080" y2="430" stroke="${WOOD_D}" stroke-width="1.5" opacity="0.7"/>
     <g transform="translate(240,300)">
       <path d="M0 0 L0 130 Q0 145 14 145 L80 145 Q94 145 94 130 L94 0 Z" fill="${WOOD}" stroke="${WOOD_D}" stroke-width="2"/>
       <ellipse cx="47" cy="0" rx="47" ry="8" fill="${WOOD_D}"/>
       <ellipse cx="47" cy="0" rx="40" ry="5" fill="${PAPER}" opacity="0.7"/>
       <path d="M94 16 Q126 16 126 50 Q126 84 94 84" fill="none" stroke="${WOOD_D}" stroke-width="4" stroke-linecap="round"/>
     </g>
     <g transform="translate(440,360)">
       <ellipse cx="160" cy="50" rx="160" ry="32" fill="${WOOD}" stroke="${WOOD_D}" stroke-width="2"/>
       <ellipse cx="160" cy="46" rx="138" ry="24" fill="${WOOD_D}" opacity="0.55"/>
       <rect x="140" y="0" width="36" height="48" rx="4" fill="${PAPER}" stroke="${INK}" stroke-width="1.2"/>
       <rect x="150" y="-12" width="16" height="12" fill="${WOOD_D}"/>
     </g>
     <g transform="translate(820,310)">
       <rect x="0" y="0" width="220" height="120" rx="8" fill="${WOOD_D}"/>
       <rect x="10" y="10" width="200" height="100" rx="4" fill="${WOOD}"/>
       <line x1="20" y1="40" x2="200" y2="40" stroke="${WOOD_D}" stroke-width="1" opacity="0.6"/>
       <line x1="20" y1="60" x2="200" y2="60" stroke="${WOOD_D}" stroke-width="1" opacity="0.6"/>
       <line x1="20" y1="80" x2="200" y2="80" stroke="${WOOD_D}" stroke-width="1" opacity="0.6"/>
     </g>`,
    1200, 600);

const hero2 = svg('0 0 1200 600',
    `<rect width="1200" height="600" fill="${PAPER}"/>
     <line x1="0" y1="430" x2="1200" y2="430" stroke="${LINE}" stroke-width="1"/>
     <g transform="translate(820,160)">
       <path d="M40 0 Q40 -80 130 -100 Q220 -80 220 0 Z" fill="${WOOD}" stroke="${WOOD_D}" stroke-width="2"/>
       <ellipse cx="130" cy="0" rx="110" ry="10" fill="${WOOD_D}"/>
       <rect x="125" y="0" width="10" height="250" fill="${WOOD_D}"/>
       <path d="M80 250 Q80 240 90 240 L170 240 Q180 240 180 250 L180 270 L80 270 Z" fill="${WOOD_D}"/>
     </g>
     <g transform="translate(240,360)">
       <ellipse cx="180" cy="50" rx="180" ry="34" fill="${WOOD}" stroke="${WOOD_D}" stroke-width="2"/>
       <ellipse cx="180" cy="46" rx="158" ry="26" fill="${WOOD_D}" opacity="0.55"/>
       <rect x="155" y="-50" width="50" height="80" rx="6" fill="${PAPER}" stroke="${INK}" stroke-width="1.5"/>
       <rect x="155" y="-10" width="50" height="40" fill="${WOOD}" opacity="0.5"/>
       <rect x="170" y="-70" width="20" height="20" fill="${WOOD_D}"/>
       <line x1="170" y1="-110" x2="160" y2="-50" stroke="${WOOD_D}" stroke-width="2"/>
       <line x1="180" y1="-115" x2="178" y2="-50" stroke="${WOOD}" stroke-width="2"/>
       <line x1="190" y1="-108" x2="195" y2="-50" stroke="${WOOD_D}" stroke-width="2"/>
     </g>`,
    1200, 600);

const hero3 = svg('0 0 1200 600',
    `<rect width="1200" height="600" fill="${PAPER}"/>
     <line x1="0" y1="450" x2="1200" y2="450" stroke="${LINE}" stroke-width="1"/>
     <g transform="translate(260,180)">
       <rect x="0" y="120" width="220" height="40" rx="6" fill="${WOOD}" stroke="${WOOD_D}" stroke-width="2"/>
       <rect x="0" y="0" width="20" height="130" fill="${WOOD_D}"/>
       <rect x="6" y="160" width="8" height="100" fill="${WOOD_D}"/>
       <rect x="206" y="160" width="8" height="100" fill="${WOOD_D}"/>
       <rect x="20" y="110" width="180" height="30" rx="4" fill="${WOOD_D}" opacity="0.7"/>
     </g>
     <g transform="translate(720,240)">
       <rect x="0" y="120" width="280" height="40" fill="${WOOD}" stroke="${WOOD_D}" stroke-width="2"/>
       <rect x="0" y="40" width="20" height="120" fill="${WOOD_D}"/>
       <rect x="40" y="80" width="220" height="14" fill="${PAPER}" stroke="${INK}" stroke-width="1.2"/>
       <rect x="45" y="66" width="210" height="14" fill="${PAPER}" stroke="${INK}" stroke-width="1.2"/>
       <rect x="50" y="52" width="200" height="14" fill="${PAPER}" stroke="${INK}" stroke-width="1.2"/>
     </g>`,
    1200, 600);

const hero4 = svg('0 0 1200 600',
    `<rect width="1200" height="600" fill="${PAPER}"/>
     <line x1="0" y1="440" x2="1200" y2="440" stroke="${LINE}" stroke-width="1"/>
     <g transform="translate(420,200)">
       <rect x="0" y="0" width="360" height="220" rx="22" fill="${WOOD}" stroke="${WOOD_D}" stroke-width="2"/>
       <rect x="18" y="18" width="324" height="184" rx="14" fill="none" stroke="${WOOD_D}" stroke-width="1.2" stroke-dasharray="5 4"/>
       <circle cx="20" cy="20" r="3" fill="${WOOD_D}"/>
       <circle cx="340" cy="20" r="3" fill="${WOOD_D}"/>
       <circle cx="20" cy="200" r="3" fill="${WOOD_D}"/>
       <circle cx="340" cy="200" r="3" fill="${WOOD_D}"/>
     </g>
     <g transform="translate(200,300)">
       <rect x="0" y="60" width="80" height="100" rx="6" fill="${PAPER}" stroke="${INK}" stroke-width="1.5"/>
       <rect x="0" y="90" width="80" height="70" fill="${WOOD}" opacity="0.45"/>
       <rect x="22" y="40" width="36" height="22" fill="${WOOD_D}"/>
       <line x1="30" y1="-20" x2="20" y2="40" stroke="${WOOD_D}" stroke-width="2"/>
       <line x1="40" y1="-30" x2="38" y2="40" stroke="${WOOD}" stroke-width="2"/>
       <line x1="50" y1="-22" x2="55" y2="40" stroke="${WOOD_D}" stroke-width="2"/>
     </g>`,
    1200, 600);

const heroFallback = svg('0 0 1200 600',
    `<defs>
       <linearGradient id="hfG" x1="0" x2="0" y1="0" y2="1">
         <stop offset="0%" stop-color="${PAPER}"/>
         <stop offset="100%" stop-color="${PAPER_TINT}"/>
       </linearGradient>
     </defs>
     <rect width="1200" height="600" fill="url(#hfG)"/>
     <line x1="0" y1="430" x2="1200" y2="430" stroke="${WOOD_D}" stroke-width="1" opacity="0.4"/>`,
    1200, 600);

const promo = svg('0 0 1200 400',
    `<rect width="1200" height="400" fill="${PAPER}"/>
     <line x1="0" y1="280" x2="1200" y2="280" stroke="${LINE}" stroke-width="1"/>
     <g transform="translate(360,140)">
       <path d="M0 0 L0 130 Q0 145 14 145 L100 145 Q114 145 114 130 L114 0 Z" fill="${WOOD}" stroke="${WOOD_D}" stroke-width="2"/>
       <ellipse cx="57" cy="0" rx="57" ry="8" fill="${WOOD_D}"/>
       <ellipse cx="57" cy="0" rx="48" ry="5" fill="${PAPER}" opacity="0.7"/>
       <path d="M114 18 Q150 18 150 55 Q150 92 114 92" fill="none" stroke="${WOOD_D}" stroke-width="4" stroke-linecap="round"/>
     </g>
     <g transform="translate(560,200)">
       <rect x="0" y="0" width="180" height="100" rx="6" fill="${WOOD}" stroke="${WOOD_D}" stroke-width="2"/>
       <line x1="20" y1="30" x2="160" y2="30" stroke="${WOOD_D}" stroke-width="1" opacity="0.6"/>
       <line x1="20" y1="50" x2="160" y2="50" stroke="${WOOD_D}" stroke-width="1" opacity="0.6"/>
       <line x1="20" y1="70" x2="120" y2="70" stroke="${WOOD_D}" stroke-width="1" opacity="0.6"/>
     </g>
     <g transform="translate(820,140)">
       <rect x="0" y="60" width="80" height="140" rx="6" fill="${PAPER}" stroke="${INK}" stroke-width="1.5"/>
       <rect x="0" y="100" width="80" height="100" fill="${WOOD}" opacity="0.5"/>
       <rect x="22" y="40" width="36" height="22" fill="${WOOD_D}"/>
       <line x1="30" y1="-30" x2="20" y2="40" stroke="${WOOD_D}" stroke-width="2"/>
       <line x1="40" y1="-40" x2="38" y2="40" stroke="${WOOD}" stroke-width="2"/>
       <line x1="50" y1="-32" x2="55" y2="40" stroke="${WOOD_D}" stroke-width="2"/>
     </g>`,
    1200, 400);

// Category illustrations: keep as simplified category tile art
function catSvg(body) {
    return svg('0 0 800 600', body, 800, 600);
}

const catCups = catSvg(
    `<rect width="800" height="600" fill="${PAPER}"/>
     <ellipse cx="400" cy="440" rx="200" ry="8" fill="${LINE}"/>
     <!-- glass (no handle, clear silhouette) -->
     <g transform="translate(280,220)">
       <path d="M0 0 L8 200 Q8 212 20 212 L100 212 Q112 212 112 200 L120 0 Z"
             fill="${PAPER_GLASS}" stroke="${INK}" stroke-width="1.5"/>
       <ellipse cx="60" cy="0" rx="60" ry="8" fill="none" stroke="${INK}" stroke-width="1.5"/>
       <line x1="14" y1="80" x2="118" y2="80" stroke="${INK}" stroke-width="1" opacity="0.3"/>
     </g>
     <!-- mug (with handle) -->
     <g transform="translate(480,260)">
       <path d="M0 0 L0 160 Q0 172 12 172 L84 172 Q96 172 96 160 L96 0 Z" fill="${WOOD}" stroke="${WOOD_D}" stroke-width="2"/>
       <ellipse cx="48" cy="0" rx="48" ry="7" fill="${WOOD_D}"/>
       <path d="M96 24 Q132 24 132 70 Q132 116 96 116" fill="none" stroke="${WOOD_D}" stroke-width="5" stroke-linecap="round"/>
     </g>`
);

const catLighting = catSvg(
    `<rect width="800" height="600" fill="${PAPER}"/>
     <ellipse cx="400" cy="440" rx="120" ry="6" fill="${LINE}"/>
     <g transform="translate(330,150)">
       <path d="M40 0 Q40 -60 130 -80 Q220 -60 220 0 Z" fill="${WOOD}" stroke="${WOOD_D}" stroke-width="2"/>
       <ellipse cx="130" cy="0" rx="110" ry="10" fill="${WOOD_D}"/>
       <rect x="125" y="0" width="10" height="260" fill="${WOOD_D}"/>
       <path d="M80 260 Q80 250 90 250 L170 250 Q180 250 180 260 L180 280 L80 280 Z" fill="${WOOD_D}"/>
     </g>`
);

const catTrays = catSvg(
    `<rect width="800" height="600" fill="${PAPER}"/>
     <ellipse cx="400" cy="460" rx="220" ry="8" fill="${LINE}"/>
     <g transform="translate(220,280)">
       <ellipse cx="180" cy="100" rx="180" ry="40" fill="${WOOD}" stroke="${WOOD_D}" stroke-width="2"/>
       <ellipse cx="180" cy="96" rx="156" ry="32" fill="${WOOD_D}" opacity="0.55"/>
       <rect x="40" y="60" width="280" height="14" fill="${PAPER}" stroke="${INK}" stroke-width="1.2"/>
       <rect x="46" y="46" width="270" height="14" fill="${PAPER}" stroke="${INK}" stroke-width="1.2"/>
     </g>`
);

const catFabric = catSvg(
    `<rect width="800" height="600" fill="${PAPER}"/>
     <ellipse cx="400" cy="460" rx="200" ry="8" fill="${LINE}"/>
     <g transform="translate(220,200) rotate(-6 180 110)">
       <rect x="0" y="0" width="360" height="220" rx="22" fill="${WOOD}" stroke="${WOOD_D}" stroke-width="2"/>
       <line x1="20" y1="40" x2="340" y2="40" stroke="${WOOD_D}" stroke-width="1" opacity="0.6"/>
       <line x1="20" y1="80" x2="340" y2="80" stroke="${WOOD_D}" stroke-width="1" opacity="0.6"/>
       <line x1="20" y1="120" x2="340" y2="120" stroke="${WOOD_D}" stroke-width="1" opacity="0.6"/>
       <line x1="20" y1="160" x2="340" y2="160" stroke="${WOOD_D}" stroke-width="1" opacity="0.6"/>
       <line x1="80" y1="10" x2="80" y2="210" stroke="${WOOD_D}" stroke-width="1" opacity="0.6"/>
       <line x1="180" y1="10" x2="180" y2="210" stroke="${WOOD_D}" stroke-width="1" opacity="0.6"/>
       <line x1="280" y1="10" x2="280" y2="210" stroke="${WOOD_D}" stroke-width="1" opacity="0.6"/>
     </g>`
);

const catScent = catSvg(
    `<rect width="800" height="600" fill="${PAPER}"/>
     <ellipse cx="400" cy="460" rx="100" ry="6" fill="${LINE}"/>
     <g transform="translate(340,200)">
       <rect x="0" y="120" width="120" height="160" rx="8" fill="${PAPER}" stroke="${INK}" stroke-width="1.5"/>
       <rect x="0" y="180" width="120" height="100" fill="${WOOD}" opacity="0.5"/>
       <rect x="44" y="80" width="32" height="40" fill="${WOOD_D}"/>
       <line x1="52" y1="20" x2="42" y2="80" stroke="${WOOD_D}" stroke-width="2"/>
       <line x1="62" y1="10" x2="60" y2="80" stroke="${WOOD}" stroke-width="2"/>
       <line x1="72" y1="22" x2="78" y2="80" stroke="${WOOD_D}" stroke-width="2"/>
     </g>`
);

const catFurniture = catSvg(
    `<rect width="800" height="600" fill="${PAPER}"/>
     <ellipse cx="400" cy="470" rx="240" ry="8" fill="${LINE}"/>
     <g transform="translate(180,180)">
       <rect x="0" y="180" width="440" height="60" rx="6" fill="${WOOD}" stroke="${WOOD_D}" stroke-width="2"/>
       <rect x="0" y="0" width="20" height="240" fill="${WOOD_D}"/>
       <rect x="420" y="0" width="20" height="240" fill="${WOOD_D}"/>
       <rect x="6" y="240" width="8" height="50" fill="${WOOD_D}"/>
       <rect x="426" y="240" width="8" height="50" fill="${WOOD_D}"/>
       <rect x="40" y="170" width="360" height="20" rx="3" fill="${WOOD_D}" opacity="0.5"/>
     </g>`
);

const catDesk = catSvg(
    `<rect width="800" height="600" fill="${PAPER}"/>
     <ellipse cx="400" cy="470" rx="220" ry="8" fill="${LINE}"/>
     <g transform="translate(220,220)">
       <path d="M0 80 L0 240 Q0 255 14 255 L106 255 Q120 255 120 240 L120 80 Z" fill="${WOOD}" stroke="${WOOD_D}" stroke-width="2"/>
       <ellipse cx="60" cy="80" rx="60" ry="8" fill="${WOOD_D}"/>
       <rect x="34" y="0" width="5" height="80" rx="2" fill="${INK}"/>
       <rect x="50" y="-10" width="5" height="90" rx="2" fill="${WOOD_D}"/>
       <rect x="66" y="20" width="5" height="60" rx="2" fill="${INK}"/>
       <rect x="80" y="-5" width="5" height="85" rx="2" fill="${WOOD_D}"/>
     </g>
     <g transform="translate(440,260)">
       <rect x="0" y="120" width="240" height="40" fill="${WOOD}" stroke="${WOOD_D}" stroke-width="2"/>
       <rect x="0" y="40" width="18" height="120" fill="${WOOD_D}"/>
       <rect x="40" y="80" width="180" height="12" fill="${PAPER}" stroke="${INK}" stroke-width="1"/>
       <rect x="46" y="68" width="170" height="12" fill="${PAPER}" stroke="${INK}" stroke-width="1"/>
     </g>`
);

const catFallback = catSvg(
    `<rect width="800" height="600" fill="${PAPER}"/>
     <ellipse cx="400" cy="460" rx="180" ry="8" fill="${LINE}"/>
     <rect x="280" y="200" width="240" height="240" rx="14" fill="${WOOD}" stroke="${WOOD_D}" stroke-width="2"/>
     <rect x="310" y="230" width="180" height="180" rx="10" fill="${WOOD_D}" opacity="0.55"/>`,
    800, 600);

const files = {
    'hero-mood-1.svg': hero1,
    'hero-mood-2.svg': hero2,
    'hero-mood-3.svg': hero3,
    'hero-mood-4.svg': hero4,
    'hero-fallback.svg': heroFallback,
    'promo-fallback.svg': promo,
    'product-1.svg': product1,
    'product-2.svg': product2,
    'product-3.svg': product3,
    'product-4.svg': product4,
    'product-5.svg': product5,
    'product-6.svg': product6,
    'product-7.svg': product7,
    'product-8.svg': product8,
    'product-fallback.svg': productFallback,
    'category-cups.svg': catCups,
    'category-lighting.svg': catLighting,
    'category-trays.svg': catTrays,
    'category-fabric.svg': catFabric,
    'category-scent.svg': catScent,
    'category-furniture.svg': catFurniture,
    'category-desk.svg': catDesk,
    'category-fallback.svg': catFallback,
};

for (const [name, content] of Object.entries(files)) {
    fs.writeFileSync(path.join(HERE, name), content, 'utf8');
    console.log('wrote', name);
}
