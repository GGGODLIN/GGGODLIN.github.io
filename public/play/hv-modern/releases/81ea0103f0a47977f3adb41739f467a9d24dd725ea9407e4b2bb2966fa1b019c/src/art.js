import {RELEASE} from './release.js';

// Original grid-native glyphs. Integer coordinates, filled cells and crisp edges
// keep the icon language pixel-based at every size; accessible names live on the
// enclosing real controls. No glyph is a source of game state or item statistics.
const glyphs = {
 sword:'M11 1h4v4h-2v2h-2v2H9v2H7v2H5v2H2v-3h2v-2H2V8h2v2h2V8h2V6h2V4h1Z',
 shield:'M3 1h10v2h2v7h-2v2h-2v2H9v1H7v-1H5v-2H3v-2H1V3h2Zm2 3v5h2v2h2V9h2V4Z',
 flame:'M8 1h2v4h2v3h2v5h-2v2H4v-2H2V8h2V5h2v4h2Zm0 8v2H6v2h4V9Z',
 spark:'M7 1h2v4h2v2h4v2h-4v2H9v4H7v-4H5V9H1V7h4V5h2Z',
 eye:'M5 3h6v2h2v2h2v2h-2v2h-2v2H5v-2H3V9H1V7h2V5h2Zm0 4v2h2v2h2V9h2V7H9V5H7v2Z',
 heart:'M2 2h4v2h4V2h4v2h2v6h-2v2h-2v2h-2v2H6v-2H4v-2H2v-2H0V4h2Z',
 drop:'M7 1h2v3h2v3h2v3h1v3h-2v2H4v-2H2v-3h1V7h2V4h2Zm-2 9v3h2v-3Z',
 moon:'M5 1h5v2H7v2H5v6h2v2h6v-2h2v3h-2v2H5v-2H3v-2H1V5h2V3h2Z',
 bag:'M5 1h6v2h2v3h2v9H1V6h2V3h2Zm0 3v2h6V4Zm2 5v3h2V9Z',
 book:'M1 2h5v1h4V2h5v12h-5v1H6v-1H1Zm2 2v8h3V4Zm5 1v8h1V5Zm2-1v8h3V4Z',
 arrow:'M9 2h2v2h2v2h2v4h-2v2h-2v2H9v-4H1V6h8Z',
 chevron:'M5 2h2v2h2v2h2v4H9v2H7v2H5v-3h2V9h2V7H7V5H5Z',
 camp:'M7 1h2v3h2v3h2v3h2v5H1v-5h2V7h2V4h2Zm0 8v4h2V9Z',
 person:'M5 1h6v2h2v5h-2v2H5V8H3V3h2ZM3 11h10v2h2v3H1v-3h2Z',
 coin:'M4 1h8v2h2v2h1v6h-1v2h-2v2H4v-2H2v-2H1V5h1V3h2Zm3 3v2H5v4h4v1H5v2h3v-2h3V7H7V6h4V4Z',
 gear:'M6 0h4v3h2V2h2v2h-1v2h3v4h-3v2h1v2h-2v-1h-2v3H6v-3H4v1H2v-2h1v-2H0V6h3V4H2V2h2v1h2Zm0 6v4h4V6Z',
 close:'M2 1h2v2h2v2h4V3h2V1h2v3h-2v2h-2v4h2v2h2v3h-2v-2h-2v-2H6v2H4v2H2v-3h2v-2h2V6H4V4H2Z',
 check:'M12 2h3v3h-2v2h-2v2H9v2H7v2H4v-2H2V9H0V6h3v2h2v2h1V8h2V6h2V4h2Z',
 lock:'M5 0h6v2h2v4h2v10H1V6h2V2h2Zm0 3v3h6V3Zm2 6v4h2V9Z',
 download:'M6 1h4v7h3v2h-2v2H9v2H7v-2H5v-2H3V8h3ZM0 11h2v3h12v-3h2v5H0Z',
 upload:'M7 1h2v2h2v2h2v2h-3v7H6V7H3V5h2V3h2ZM0 11h2v3h12v-3h2v5H0Z',
 clock:'M4 1h8v2h2v2h1v6h-1v2h-2v2H4v-2H2v-2H1V5h1V3h2Zm0 3v8h8V4ZM7 4h2v4h3v2H7Z',
 list:'M1 2h2v2H1Zm4 0h10v2H5ZM1 7h2v2H1Zm4 0h10v2H5ZM1 12h2v2H1Zm4 0h10v2H5Z',
 star:'M7 0h2v4h2v1h5v3h-3v2h-1v5H9v-2H7v2H4v-5H3V8H0V5h5V4h2Z',
 info:'M4 1h8v2h2v2h1v6h-1v2h-2v2H4v-2H2v-2H1V5h1V3h2Zm0 3v8h8V4ZM7 4h2v2H7Zm0 4h2v4H7Z',
 reset:'M5 1h7v2h2v2h1v6h-1v2h-2v2H5v-2H3v-2h3v2h5v-2h2V5h-2V3H6v2h2v2H1V0h2v4h2Z',
 wand:'M12 3h3v3h-2v2h-2v2H9v2H7v2H5v2H2v-3h2v-2h2V9h2V7h2V5h2ZM3 0h2v2h2v2H5v2H3V4H1V2h2Z',
};
export function icon(name, cls='') {
  return `<svg class="icon ${cls}" viewBox="0 0 16 16" fill="currentColor" shape-rendering="crispEdges" aria-hidden="true" focusable="false"><path fill-rule="evenodd" d="${glyphs[name]||glyphs.spark}"/></svg>`;
}

// Compact item illustrations are original editable pixel maps, not scaled-down
// copies of the earlier smooth SVG art. Every occupied cell is a whole pixel.
const items={
 blade:[
 '................','...........ssss.','..........shhs..','.........shhs...','........shhs....','.......shhs.....','......shhs......','.....shhs.......','....shhs........','...shhs.........','..gsss..........','..ggg...........','...bgg..........','..bb.g..........','.bb.............','.g..............'],
 staff:[
 '......gggg......','.....gpphpg.....','....gpphpppg....','....gpphpppg....','.....gppppg.....','......gggg......','.......bb.......','.......bb.......','.......gb.......','.......bg.......','.......bb.......','.......bb.......','.......gb.......','.......bg.......','.......bb.......','.......gg.......'],
 shield:[
 '..gggggggggggg..','.gssssssssssssg.','.gssddddddddssg.','.gsddddggddddsg.','.gsddddggddddsg.','.gsddggggggddsg.','.gsddddggddddsg.','.gsddddggddddsg.','.gsddddppddddsg.','..gsdddppdddsg..','..gssddddddssg..','...gssddddssg...','....gssddssg....','.....gss s g....','......gssg......','.......gg.......'],
 armor:[
 '....gg....gg....','..gsssg..gsssg..','.gsssssggsssssg.','gssssssggssssssg','gsssdsdggdsdsssg','gssd.sdddds.dssg','ggg..sdddds..ggg','.....sggggs.....','.....sgddgs.....','.....sgppgs.....','.....sgppgs.....','.....sgddgs.....','.....sggggs.....','....gssssssg....','....gssssssg....','.....gggggg.....']
};
export function itemArt(item,large=false) {
 const type=item.slot==='body'?'armor':item.slot==='offhand'?'shield':(item.magic>item.attack?'staff':'blade');
 const quality=item.quality==='Superior'?'#74c6ed':item.quality==='Exquisite'?'#b392f2':'#f1cc7c';
 const palette={g:quality,s:'#7888a7',h:'#eff7e8',d:'#233653',p:'#9063cd',b:'#976440'};
 const cells=items[type].flatMap((row,y)=>[...row].flatMap((cell,x)=>palette[cell]?[`<rect x="${x}" y="${y}" width="1" height="1" fill="${palette[cell]}"/>`]:[])).join('');
 return `<svg class="item-art ${large?'large':''}" viewBox="0 0 16 16" shape-rendering="crispEdges" aria-hidden="true" focusable="false">${cells}</svg>`;
}
export function portrait(){return `<img class="portrait-art pixel-portrait-art" src="${RELEASE.base}public/assets/pixel/pixel-portrait.png" alt="" draggable="false">`;}
export function enemyArt(kind){
 // Explicit URLs keep the content-addressed release graph fully verifiable.
 const sources={wolf:`${RELEASE.base}public/assets/pixel/pixel-wolf.png`,wraith:`${RELEASE.base}public/assets/pixel/pixel-wraith.png`,golem:`${RELEASE.base}public/assets/pixel/pixel-golem.png`};
 return `<img src="${sources[kind]||sources.wolf}" alt="" draggable="false">`;
}
export function battleHero(){return `<div class="battle-hero" aria-hidden="true"><img src="${RELEASE.base}public/assets/pixel/pixel-hero.png" alt="" draggable="false"></div>`;}
