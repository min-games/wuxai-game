import './style.css';
import {Game} from './game';
import {installCharacterScreen} from './character-screen';
import {chapters,type ChapterId} from './chapters';
document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
<header class="masthead"><a class="brand" href="#"><span class="seal">影</span><span>JIANGHU <i>OF</i> SHADOWS</span></a><div class="edition">A WUXIA TALE <span>／</span> TWO PLAYABLE CHAPTERS</div><button id="sound" class="quiet-button" aria-pressed="false">Sound off <span>◌</span></button></header>
<main><div class="chapter-heading"><div><div class="eyebrow"><span></span> THE JOURNEY BEGINS</div><h1>The Silent Pass<span>寂静山径</span></h1></div><p>One blade. A broken oath.<br>A mountain that remembers.</p></div>
<nav class="chapter-select" aria-label="Choose chapter"><button data-chapter="1" aria-pressed="true"><span>01</span> The Silent Pass</button><button data-chapter="2" aria-pressed="false"><span>02</span> Temple of Embers</button><small>CHOOSE A CHAPTER · OR FOLLOW THE STORY</small></nav>
<section class="game-frame" aria-label="Jianghu of Shadows game"><canvas id="game" width="1280" height="600" tabindex="0" aria-label="Game. Move with A and D, jump with Space, attack with J, heavy attack with K, parry with L, dash with Shift, chi with E, interact with F, pause with Escape, character and equipment with C."></canvas><div class="frame-corner tl"></div><div class="frame-corner tr"></div><div class="frame-corner bl"></div><div class="frame-corner br"></div>
<div id="overlay" class="overlay"><div class="overlay-inner"><div class="eyebrow">江湖 · CHAPTER I</div><h2>A debt written<br>in shadows.</h2><p>The mountain bell has fallen silent. Cross the abandoned<br class="desktop"> pass and confront the keeper who broke your oath.</p><button id="start" class="primary">Enter the jianghu <span>→</span></button><div class="overlay-note">A / D to move · SPACE to jump · J to draw your blade</div></div></div>
<div id="toast" class="toast" role="status" aria-live="polite"></div></section>
<div class="below-game"><div class="location"><span class="location-dot"></span><span id="location">MISTVEIL PASS</span><span class="divider">/</span><span id="objective">Reach the mountain bell</span></div><div class="game-tools"><button id="character">Character <kbd>C</kbd> <span id="character-level">LV 1</span></button><button id="guide">Controls & lore <span>↗</span></button><button id="pause">Pause <kbd>ESC</kbd></button><button id="restart">Restart <span>↺</span></button><button id="fullscreen" aria-label="Enter fullscreen">⛶</button></div></div>
<section class="controls" aria-label="Keyboard controls"><div><kbd>A</kbd><kbd>D</kbd><span>Move</span></div><div><kbd>SPACE</kbd><span>Jump / double jump</span></div><div><kbd>J</kbd><kbd>K</kbd><span>Light / heavy</span></div><div><kbd>L</kbd><span>Parry</span></div><div><kbd>SHIFT</kbd><span>Dash</span></div><div><kbd>E</kbd><span>Chi burst</span></div><div><kbd>F</kbd><span>Interact</span></div></section>
<div class="touch-controls" aria-label="Touch controls"><button data-key="KeyA" aria-label="Move left">◀</button><button data-key="KeyD" aria-label="Move right">▶</button><button data-key="Space">Jump</button><button data-key="KeyJ">Blade</button><button data-key="KeyK">Heavy</button><button data-key="KeyL">Parry</button><button data-key="ShiftLeft">Dash</button><button data-key="KeyE">Chi</button><button data-key="KeyF">Use</button></div>
<footer><span>「 心静如水，剑动如风 」 <i>A still heart. A blade like wind.</i></span><span>ORIGINAL PLAYABLE PROTOTYPE <b>v0.3</b></span></footer></main>
<dialog id="guide-dialog"><button id="close-guide" class="close" aria-label="Close controls">×</button><div class="eyebrow">THE WAY OF THE WANDERER</div><h2>Read the blade.</h2><p>Enemies glow amber before striking. Tap <b>L</b> just before the blow to parry, restore chi, and stagger your opponent. Hold your ground; then answer with <b>K</b>.</p><p>Press <b>Space</b> twice for a double jump. <b>Shift</b> dashes through danger. <b>E</b> spends 35 chi on a piercing wave. Chi replenishes slowly and through combat.</p><p>Rest at the red lantern with <b>F</b> to restore health and set your checkpoint. Seek the jade seal on the high path. Defeat the Keeper of the Bell, then ring the bell with <b>F</b> to enter Chapter II.</p><p><b>Temple of Embers:</b> spear guards have extra reach; acolyte bolts can be reflected. Furnace grates glow before erupting—use the upper galleries or jump over them. The Ashen Abbot alternates chi volleys with a staff sweep and low floor waves. Jump the waves, parry the orbs, and strike between attacks. His patterns accelerate below half health. Rest at either temple lantern, then reclaim the oath at the final altar with <b>F</b>.</p><p><b>The wanderer grows:</b> defeats grant XP and equipment. Each level increases health, chi, and damage and restores your resources. Press <b>C</b> or choose Character to inspect your stats and equip a weapon, robe, or charm. Gear and XP survive deaths and carry between chapters. Starting a fresh journey resets them.</p><p class="muted">A short fictional tale inspired by wuxia. All artwork is drawn in code. Headphones optional. Progress lasts for this session.</p></dialog>`;
const game = new Game(document.querySelector('#game')!);
const overlay = document.querySelector<HTMLDivElement>('#overlay')!;
const start = document.querySelector<HTMLButtonElement>('#start')!;
function showOverlay(title:string,copy:string,label:string) { overlay.style.display='flex'; overlay.querySelector('h2')!.innerHTML=title; overlay.querySelector('p')!.textContent=copy; start.innerHTML=label+' <span>→</span>'; }
game.onChapter = chapter => {
  const level=chapters[chapter];
  document.title='Jianghu of Shadows · '+level.title;
  document.body.classList.toggle('temple-theme',chapter===2);
  document.querySelector('h1')!.innerHTML=level.title+'<span>'+level.chinese+'</span>';
  document.querySelector('.chapter-heading p')!.innerHTML=level.subtitle.replace('\n','<br>');
  document.querySelector('.chapter-heading .eyebrow')!.innerHTML='<span></span> '+(chapter===1?'THE JOURNEY BEGINS':'BEYOND THE MOUNTAIN BELL');
  overlay.querySelector('.eyebrow')!.textContent='江湖 · CHAPTER '+level.roman;
  document.querySelectorAll<HTMLButtonElement>('[data-chapter]').forEach(button=>button.setAttribute('aria-pressed',String(Number(button.dataset.chapter)===chapter)));
  document.querySelector('#location')!.textContent=chapter===1?'MISTVEIL PASS':'THE INCENSE HALL';
  document.querySelector('#objective')!.textContent=chapter===1?'Reach the mountain bell':'Cross the temple · Reclaim the oath';
};
game.onState = state => {
  if(state==='title')showOverlay(game.chapter===1?'A debt written<br>in shadows.':'An oath beneath<br>the ashes.',game.level.intro,game.chapter===1?'Enter the jianghu':'Enter the temple');
  if(state==='playing') overlay.style.display='none';
  if(state==='paused') showOverlay('The world can wait.','Take a breath. Your journey will be here.','Continue the journey');
  if(state==='dead') showOverlay('Even shadows fall.','Return to the last lantern. Your oath still waits.','Rise again');
  if(state==='chapter-complete') showOverlay('Beyond the bell.','Chapter I complete. Its echo reveals the Temple of Embers. Spear guards, incense furnaces, and the Ashen Abbot await. Your level, equipment, jade seal, and journey time carry forward.','Enter Chapter II');
  if(state==='won') showOverlay('The oath is yours.','The Ashen Abbot is defeated. Journey completed in '+game.elapsedLabel()+' · '+game.deaths+' falls · '+game.seals.size+' jade seals collected · Level '+game.progression.level+'. The embers settle; the wanderer walks on.','Journey again');
  document.querySelector('#pause')!.innerHTML=(state==='paused'?'Resume':'Pause')+' <kbd>ESC</kbd>';
};
game.onChapter(1);
document.querySelectorAll<HTMLButtonElement>('[data-chapter]').forEach(button=>button.onclick=()=>{game.selectChapter(Number(button.dataset.chapter) as ChapterId);});
game.onToast = message => { const el=document.querySelector('#toast')!; el.textContent=message; el.classList.add('visible'); setTimeout(()=>el.classList.remove('visible'),4000); };
game.onLocation = (name,objective) => {document.querySelector('#location')!.textContent=name;document.querySelector('#objective')!.textContent=objective;};
start.onclick=()=>{game.start(); game.canvas.focus();};
document.querySelector<HTMLButtonElement>('#pause')!.onclick=()=>game.togglePause();
document.querySelector<HTMLButtonElement>('#restart')!.onclick=()=>{game.reset();game.start();game.canvas.focus();};
document.querySelector<HTMLButtonElement>('#sound')!.onclick=event=>{game.audio.enabled=!game.audio.enabled;const b=event.currentTarget as HTMLButtonElement;b.innerHTML=game.audio.enabled?'Sound on <span>♪</span>':'Sound off <span>◌</span>';b.setAttribute('aria-pressed',String(game.audio.enabled));game.audio.init();};
const dialog=document.querySelector<HTMLDialogElement>('#guide-dialog')!;
document.querySelector<HTMLButtonElement>('#guide')!.onclick=()=>{if(game.state==='playing')game.togglePause();dialog.showModal();};
document.querySelector<HTMLButtonElement>('#close-guide')!.onclick=()=>dialog.close();
dialog.addEventListener('click',e=>{if(e.target===dialog)dialog.close();});
document.querySelector<HTMLButtonElement>('#fullscreen')!.onclick=async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await document.querySelector('.game-frame')!.requestFullscreen();}catch{game.onToast('Fullscreen is unavailable in this browser.');}};
document.querySelectorAll<HTMLButtonElement>('[data-key]').forEach(button=>{const key=button.dataset.key!;button.onpointerdown=e=>{e.preventDefault();button.setPointerCapture(e.pointerId);game.press(key);};button.onpointerup=()=>game.release(key);button.onpointercancel=()=>game.release(key);button.onlostpointercapture=()=>game.release(key);});

installCharacterScreen(game);
