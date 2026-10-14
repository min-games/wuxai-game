import type {Game} from './game';
import {drawCharacter} from './character';
import {equipment,slots,statNames,itemBonuses,MAX_LEVEL,type Item,type ItemId,type EquipmentSlot,type Stats} from './progression';

function icon(slot:EquipmentSlot){
 const paths=slot==='weapon'?'<path d="m10 34 22-22 5-2-2 5-22 22M8 29l11 11M7 41l5-5"/>':slot==='robe'?'<path d="m18 10-9 7-5 12 8 4 4-8-2 17h21l-2-17 4 8 8-4-5-12-9-7-4 8zM16 30h17"/>':'<path d="M18 7q6 16 12 0M24 18v5"/><circle cx="24" cy="32" r="10"/><path d="m24 26 5 6-5 6-5-6z"/>';
 return `<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths}</svg>`;
}
function comparison(candidate:Item,current:Item){
 const keys=new Set([...Object.keys(candidate.bonus),...Object.keys(current.bonus)] as (keyof Stats)[]);
 return [...keys].map(stat=>{
  const delta=Math.round(((candidate.bonus[stat]??0)-(current.bonus[stat]??0))*10)/10;
  if(!delta)return '';
  const better=stat==='dashCost'?delta<0:delta>0;
  return `<span class="${better?'stat-gain':'stat-loss'}">${delta>0?'+':''}${delta} ${statNames[stat].toLowerCase()}</span>`;
 }).filter(Boolean).join(' · ');
}
export function installCharacterScreen(game:Game){
 const dialog=document.createElement('dialog');dialog.id='character-dialog';dialog.setAttribute('aria-labelledby','character-title');dialog.innerHTML='<button class="close" id="close-character" aria-label="Close character">×</button><div id="character-content"></div>';
 document.querySelector('.game-frame')!.append(dialog);
 let resume=false,filter:EquipmentSlot='weapon';
 const render=()=>{
  const rpg=game.progression,stats=rpg.stats;
  const equippedCards=slots.map(slot=>{const item=equipment[rpg.equipped[slot]];return `<div class="equipped-slot ${item.rarity}"><div class="item-symbol" style="color:${item.color}">${icon(slot)}</div><div><small>${slot}</small><strong>${item.name}</strong><span>${itemBonuses(item)}</span></div></div>`;}).join('');
  const inventory=[...rpg.inventory].filter(id=>equipment[id].slot===filter);
  const items=inventory.map(id=>{
   const item=equipment[id],active=rpg.equipped[item.slot]===id;
   return `<article class="inventory-item ${item.rarity}"><div class="inventory-item-heading"><div class="item-symbol" style="color:${item.color}">${icon(item.slot)}</div><div><span class="rarity">${item.rarity==='legendary'?'Heirloom':item.rarity==='fine'?'Fine':'Common'} ${item.slot}</span><h4>${item.name}</h4></div></div><p>${item.description}</p><div class="item-bonuses">${itemBonuses(item)}</div><div class="item-comparison">${active?'Currently equipped':comparison(item,equipment[rpg.equipped[item.slot]])||'Same stats as your equipped item'}</div><button data-equip="${id}" ${active?'disabled':''}>${active?'Equipped ✓':'Equip '+item.name}</button></article>`;
  }).join('');
  document.querySelector('#character-content')!.innerHTML=`
  <div class="character-topline"><div class="eyebrow">THE WAY OF THE WANDERER</div><span>PROGRESS SAVED THROUGH DEATHS · THIS JOURNEY</span></div>
  <div class="character-layout"><aside class="character-summary"><div class="portrait-frame"><canvas id="portrait" width="280" height="220" aria-label="Your character wearing equipped gear"></canvas><span class="portrait-level">LV ${rpg.level}</span></div><div class="character-rank">${rpg.rank}</div><h2 id="character-title">The Wanderer</h2><div class="character-xp-label"><span>${rpg.level===MAX_LEVEL?'Mastery attained':'Next level'}</span><span>${rpg.level===MAX_LEVEL?'MAX':rpg.xp+' / '+rpg.nextXP+' XP'}</span></div><progress value="${rpg.level===MAX_LEVEL?1:rpg.xp}" max="${rpg.level===MAX_LEVEL?1:rpg.nextXP}" aria-label="Experience toward next level"></progress>
  <dl class="character-stats"><div><dt>Health</dt><dd>${Math.ceil(game.player.hp)} <small>/ ${stats.maxHealth}</small></dd></div><div><dt>Chi</dt><dd>${Math.floor(game.player.chi)} <small>/ ${stats.maxChi}</small></dd></div>${(['lightDamage','heavyDamage','chiDamage','armor','chiRegen','dashCost'] as const).map(stat=>`<div><dt>${statNames[stat]}</dt><dd>${stats[stat]}</dd></div>`).join('')}</dl><div class="journey-record"><span>${rpg.kills} opponents defeated</span><span>${rpg.totalXP} total XP · ${game.seals.size} jade seals</span></div></aside>
  <section class="character-equipment"><div class="section-label">EQUIPPED <span>ONE ITEM PER SLOT</span></div><div class="equipped-slots">${equippedCards}</div><div class="inventory-heading"><h3>Your inventory</h3><span>${rpg.inventory.size} items</span></div><div class="inventory-tabs" role="group" aria-label="Filter equipment">${slots.map(slot=>`<button data-slot="${slot}" aria-pressed="${slot===filter}">${slot==='weapon'?'Weapons':slot==='robe'?'Robes':'Charms'} <span>${[...rpg.inventory].filter(id=>equipment[id].slot===slot).length}</span></button>`).join('')}</div><div class="inventory-grid">${items}</div><p class="inventory-note">Defeat enemies for XP and gear. Find jade seals for a charm. Equip items here to change your stats; swapping gear does not heal you.</p></section></div>
  <div class="character-bottomline"><span>LEVEL UP: +12 HEALTH · +8 CHI · MORE DAMAGE · FULL RESTORE</span><button id="return-to-journey">${resume?'Return to the journey':'Close character'} <kbd>ESC</kbd></button></div>`;
  const canvas=document.querySelector<HTMLCanvasElement>('#portrait')!,c=canvas.getContext('2d')!;
  const bg=c.createRadialGradient(140,120,15,140,120,150);bg.addColorStop(0,'#456250');bg.addColorStop(1,'#162620');c.fillStyle=bg;c.fillRect(0,0,280,220);c.strokeStyle='#bca77744';c.lineWidth=1;c.beginPath();c.arc(140,107,77,0,Math.PI*2);c.stroke();c.beginPath();c.arc(140,107,70,0,Math.PI*2);c.stroke();c.save();c.translate(140,190);c.scale(2.2,2.2);drawCharacter(c,0,0,1,'player',{vx:0,vy:0,grounded:true,stride:0,attack:0,heavy:false,parry:0,dash:0,landing:0,hurt:0,cast:0},0,false,false,false,rpg.appearance);c.restore();
  dialog.querySelectorAll<HTMLButtonElement>('[data-slot]').forEach(button=>button.onclick=()=>{filter=button.dataset.slot as EquipmentSlot;render();dialog.querySelector<HTMLButtonElement>(`[data-slot="${filter}"]`)!.focus({preventScroll:true});});
  dialog.querySelectorAll<HTMLButtonElement>('[data-equip]').forEach(button=>button.onclick=()=>{const id=button.dataset.equip as ItemId;game.equip(id);dialog.querySelector<HTMLButtonElement>(`[data-slot="${filter}"]`)!.focus({preventScroll:true});});
  dialog.querySelector<HTMLButtonElement>('#return-to-journey')!.onclick=()=>dialog.close();
 };
 const open=()=>{
  if(dialog.open){dialog.close();return;}
  resume=game.state==='playing';if(resume)game.togglePause();render();dialog.showModal();
 };
 game.onCharacter=open;
 document.querySelector<HTMLButtonElement>('#character')!.onclick=open;
 game.onProgress=()=>{document.querySelector('#character-level')!.textContent='LV '+game.progression.level;if(dialog.open)render();};
 game.onProgress();
 dialog.querySelector<HTMLButtonElement>('#close-character')!.onclick=()=>dialog.close();
 dialog.addEventListener('click',event=>{if(event.target===dialog)dialog.close();});
 dialog.addEventListener('keydown',event=>{if(event.code==='KeyC'&&!event.repeat){event.preventDefault();dialog.close();}});
 dialog.addEventListener('close',()=>{if(resume&&game.state==='paused')game.togglePause();resume=false;game.canvas.focus();});
}
