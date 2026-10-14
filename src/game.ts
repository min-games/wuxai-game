import {Progression,equipment,type ItemId,MAX_LEVEL} from './progression';
import {drawCharacter, type CharacterMotion} from './character';
import {clamp, moveBody, overlaps, type Rect} from './world';
import {chapters, type ChapterId, type EnemyKind} from './chapters';
import {drawTempleBackground,drawTempleWorld,drawTempleForeground,furnacePhase} from './temple';
type State = 'title'|'playing'|'paused'|'dead'|'chapter-complete'|'won';
type Enemy = Rect & CharacterMotion & {vx:number;vy:number;grounded:boolean;kind:EnemyKind;spawnY:number;cycle:number;hp:number;max:number;home:number;dir:number;timer:number;wind:number;stun:number;flash:number;dead:boolean;tagged:boolean};
type Particle={x:number;y:number;vx:number;vy:number;life:number;max:number;color:string;size:number};
type Shot=Rect & {vx:number;vy?:number;life:number;friendly:boolean;damage:number};
export class Sound {
 enabled=false;context:AudioContext|null=null;
 init(){if(!this.context)this.context=new AudioContext();void this.context.resume();}
 play(frequency:number,duration=.12,type:OscillatorType='sine',gain=.05){if(!this.enabled)return;this.init();const c=this.context!,o=c.createOscillator(),g=c.createGain();o.type=type;o.frequency.setValueAtTime(frequency,c.currentTime);o.frequency.exponentialRampToValueAtTime(Math.max(30,frequency*.45),c.currentTime+duration);g.gain.setValueAtTime(gain,c.currentTime);g.gain.exponentialRampToValueAtTime(.001,c.currentTime+duration);o.connect(g);g.connect(c.destination);o.start();o.stop(c.currentTime+duration);}
}
export class Game {
 canvas:HTMLCanvasElement;ctx:CanvasRenderingContext2D;state:State='title';audio=new Sound();
 progression=new Progression();levelUpTimer=0;levelUpCount=0;rewardTexts:{x:number;y:number;text:string;life:number}[]=[];
 onProgress:()=>void=()=>{};onCharacter:()=>void=()=>{};
 chapter:ChapterId=1;seals=new Set<ChapterId>();
 get level(){return chapters[this.chapter];}
 get boss(){return this.enemies.find(e=>e.kind===this.level.boss)!;}
 onChapter:(chapter:ChapterId)=>void=()=>{};
 onState:(state:State)=>void=()=>{};onToast:(message:string)=>void=()=>{};onLocation:(name:string,objective:string)=>void=()=>{};
 keys=new Set<string>();pressed=new Set<string>();enemies:Enemy[]=[];particles:Particle[]=[];shots:Shot[]=[];
 player={x:110,y:410,w:26,h:54,vx:0,vy:0,grounded:false,dir:1,hp:100,chi:100,inv:0,dash:0,dashCD:0,attack:0,attackCD:0,heavy:false,parry:0,parryCD:0,jumps:0,coyote:0,jumpBuffer:0,stride:0,landing:0,hurt:0,cast:0};
 camera=0;clock=0;elapsed=0;last=0;checkpoint=110;secret=false;rested=false;shake=0;attackHits=new Set<Enemy>();location='';deaths=0;
 constructor(canvas:HTMLCanvasElement){this.canvas=canvas;this.ctx=canvas.getContext('2d')!;this.reset();window.addEventListener('keydown',e=>{if((e.target as HTMLElement).closest('dialog'))return;if(e.code==='KeyC'&&!e.repeat){this.onCharacter();return;}if(e.code==='Escape'){this.togglePause();return;}if((e.target as HTMLElement).closest('button,a,input'))return;if(['Space','ArrowLeft','ArrowRight','ArrowUp','ShiftLeft','ShiftRight'].includes(e.code))e.preventDefault();if(!e.repeat)this.press(e.code);});window.addEventListener('keyup',e=>this.release(e.code));window.addEventListener('blur',()=>{this.keys.clear();this.pressed.clear();if(this.state==='playing')this.togglePause();});document.addEventListener('visibilitychange',()=>{if(document.hidden&&this.state==='playing')this.togglePause();});requestAnimationFrame(t=>this.frame(t));}
 press(key:string){this.keys.add(key);this.pressed.add(key);}release(key:string){this.keys.delete(key);}
 reset(chapter:ChapterId=this.chapter,carryJourney=false){
  this.chapter=chapter;
  this.enemies=this.level.enemies.map(spawn=>{
   const boss=spawn.kind==='boss'||spawn.kind==='abbot';
   const max=spawn.kind==='abbot'?360:boss?240:spawn.kind==='spear'?85:spawn.kind==='shade'?40:60;
   const h=boss?76:54;
   return {x:spawn.x,y:spawn.floor-h,w:boss?46:28,h,vx:0,vy:0,grounded:false,kind:spawn.kind,hp:max,max,home:spawn.x,spawnY:spawn.floor-h,cycle:0,dir:-1,timer:1.3,wind:0,stun:0,flash:0,dead:false,tagged:false,stride:0,landing:0,hurt:0,cast:0,attack:0,heavy:boss,parry:0,dash:0};
  });
  Object.assign(this.player,{x:110,y:410,vx:0,vy:0,grounded:false,hp:100,chi:100,inv:0,dash:0,dashCD:0,attack:0,attackCD:0,parry:0,parryCD:0,jumps:0,coyote:0,jumpBuffer:0,stride:0,landing:0,hurt:0,cast:0});
  this.state='title';this.camera=0;this.checkpoint=110;this.secret=false;this.rested=false;this.restedAt.clear();this.shots=[];this.particles=[];this.keys.clear();this.pressed.clear();this.attackHits.clear();this.location='';this.shake=0;
  if(!carryJourney){this.elapsed=0;this.deaths=0;this.seals.clear();this.progression=new Progression();}
  this.player.hp=this.progression.stats.maxHealth;this.player.chi=this.progression.stats.maxChi;this.levelUpTimer=0;this.levelUpCount=0;this.rewardTexts=[];this.onProgress();
  this.onChapter(chapter);
 }
 restedAt=new Set<number>();
 selectChapter(chapter:ChapterId){this.reset(chapter);this.setState('title');}
 start(){
  if(this.state==='chapter-complete'){this.reset(2,true);this.onToast('Chapter II · Temple of Embers · Beware the glowing furnace grates.');}
  else if(this.state==='won'){this.reset(1);}
  else if(this.state==='dead'){
   Object.assign(this.player,{x:this.checkpoint,y:410,hp:100,chi:100,vx:0,vy:0,grounded:false,jumps:0,coyote:0,jumpBuffer:0,inv:2,attack:0,dash:0,parry:0,stride:0,landing:0,hurt:0,cast:0});this.shots=[];
   for(const e of this.enemies)if(!e.dead){e.x=e.home;e.y=e.spawnY;e.vx=0;e.vy=0;e.hp=e.max;e.wind=0;e.timer=1.3;e.stun=0;e.attack=0;e.cycle=0;}
  }
  this.player.hp=this.state==='dead'?this.progression.stats.maxHealth:this.player.hp;this.player.chi=this.state==='dead'?this.progression.stats.maxChi:this.player.chi;
  this.setState('playing');
 }
 setState(s:State){this.state=s;this.keys.clear();this.pressed.clear();this.onState(s);}
 togglePause(){if(this.state==='playing')this.setState('paused');else if(this.state==='paused')this.setState('playing');}
 elapsedLabel(){return `${Math.floor(this.elapsed/60)}:${String(Math.floor(this.elapsed%60)).padStart(2,'0')}`;}
 frame(t:number){const dt=Math.min((t-this.last)/1000||0,.033);this.last=t;if(this.state==='playing'||this.state==='title')this.clock+=dt;if(this.state==='playing')this.update(dt);this.render();requestAnimationFrame(time=>this.frame(time));}
 burst(x:number,y:number,color:string,n=14){for(let i=0;i<n;i++){const a=(i/n)*Math.PI*2;const speed=70+(i%5)*32;this.particles.push({x,y,vx:Math.cos(a)*speed,vy:Math.sin(a)*speed,life:.35+(i%3)*.12,max:.6,color,size:2+i%3});}}
 damage(amount:number,dir:number){const p=this.player;if(p.inv>0||p.dash>0)return;if(p.parry>0){p.chi=clamp(p.chi+22,0,this.progression.stats.maxChi);p.inv=.25;this.burst(p.x+13,p.y+23,'#ece8ad',26);this.audio.play(960,.25,'triangle');this.shake=4;return;}p.hp=Math.max(0,p.hp-Math.max(1,amount-this.progression.stats.armor));p.hurt=.28;p.inv=1;p.vx=dir*260;p.vy=-190;this.burst(p.x+13,p.y+25,'#b76755');this.shake=7;this.audio.play(100,.2,'sawtooth');if(p.hp<=0){this.deaths++;this.setState('dead');}}
 equip(id:ItemId){
  if(!this.progression.equip(id))return false;
  const stats=this.progression.stats;this.player.hp=Math.min(this.player.hp,stats.maxHealth);this.player.chi=Math.min(this.player.chi,stats.maxChi);
  this.onProgress();this.audio.play(520,.15,'triangle');return true;
 }
 defeatEnemy(e:Enemy){
  if(e.dead)return;
  e.dead=true;const reward=this.progression.reward(e.kind);
  this.rewardTexts.push({x:e.x+e.w/2,y:e.y-10,text:`+${reward.xp} XP`,life:1.5});
  this.burst(e.x+e.w/2,e.y+e.h/2,'#dcc787',18);
  if(reward.levels>0){
   this.levelUpTimer=2.6;this.levelUpCount=reward.levels;this.player.hp=this.progression.stats.maxHealth;this.player.chi=this.progression.stats.maxChi;this.player.inv=Math.max(this.player.inv,.6);
   this.burst(this.player.x+13,this.player.y+25,'#f5dda0',48);
   this.audio.play(880,.7,'sine',.09);
  }
  if(reward.drop)this.onToast(`Found ${equipment[reward.drop].name} · C to view & equip`);
  if(e.kind===this.level.boss)this.onToast((this.chapter===1?'The Keeper falls · Ring the bell with F.':'The Abbot falls · Reclaim the oath with F.')+` ${equipment[reward.drop??(this.chapter===1?'moon-jian':'ashen-jian')].name} added to inventory.`);
  this.onProgress();
 }
 hitEnemy(e:Enemy,amount:number){
  if(e.dead)return;e.tagged=true;e.hp-=amount;e.flash=.15;e.hurt=.2;e.stun=(e.kind==='boss'||e.kind==='abbot')?.15:.45;e.x=clamp(e.x+this.player.dir*12,0,this.level.width-e.w);
  this.burst(e.x+e.w/2,e.y+25,'#d8c58c');this.player.chi=clamp(this.player.chi+6,0,this.progression.stats.maxChi);this.audio.play(240,.08,'triangle');this.shake=3;
  if(e.hp<=0)this.defeatEnemy(e);
 }
 update(dt:number){this.elapsed+=dt;this.levelUpTimer=Math.max(0,this.levelUpTimer-dt);for(const text of this.rewardTexts){text.y-=dt*25;text.life-=dt;}this.rewardTexts=this.rewardTexts.filter(t=>t.life>0);const p=this.player,stats=this.progression.stats;for(const key of ['inv','dash','dashCD','attack','attackCD','parry','parryCD','coyote','jumpBuffer','landing','hurt','cast'] as const)p[key]=Math.max(0,p[key]-dt);p.chi=clamp(p.chi+dt*stats.chiRegen,0,stats.maxChi);this.shake=Math.max(0,this.shake-dt*25);
 const has=(...keys:string[])=>keys.some(k=>this.keys.has(k));const tap=(...keys:string[])=>keys.some(k=>this.pressed.has(k));
 if(p.grounded){p.jumps=0;p.coyote=.1;}if(tap('Space','ArrowUp','KeyW'))p.jumpBuffer=.13;
 if(p.jumpBuffer>0&&(p.coyote>0||p.jumps<2)){p.vy=-610;p.jumps=p.coyote>0?1:p.jumps+1;p.coyote=0;p.jumpBuffer=0;this.burst(p.x+13,p.y+54,'#87a994',8);this.audio.play(410,.12);}
 if(p.dash<=0){const direction=Number(has('KeyD','ArrowRight'))-Number(has('KeyA','ArrowLeft'));if(p.hurt<.12){p.vx=direction*245;if(direction)p.dir=direction;}}
 if(tap('ShiftLeft','ShiftRight')&&p.dashCD===0&&p.chi>=stats.dashCost){p.dash=.18;p.dashCD=.6;p.chi-=stats.dashCost;this.audio.play(130,.15,'triangle');}
 if(p.dash>0){p.vx=p.dir*720;p.vy=0;this.particles.push({x:p.x+13,y:p.y+28,vx:0,vy:0,life:.25,max:.25,color:'#b6d6bc',size:12});}
 if(tap('KeyL')&&p.parryCD===0){p.parry=.23;p.parryCD=.52;this.audio.play(700,.1);}
 if(tap('KeyJ','KeyK')&&p.attackCD===0){p.heavy=tap('KeyK');p.attack=p.heavy?.4:.23;p.attackCD=p.heavy?.62:.3;this.attackHits.clear();this.audio.play(p.heavy?150:330,.16,'triangle');}
 if(tap('KeyE')&&p.chi>=35){p.chi-=35;p.cast=.3;this.shots.push({x:p.x+13,y:p.y+12,w:54,h:36,vx:p.dir*660,life:1.25,friendly:true,damage:stats.chiDamage});this.audio.play(550,.4,'sine');this.burst(p.x,p.y+25,'#a1e5c8',15);}
 const oldX=p.x, wasGrounded=p.grounded, fallingSpeed=p.vy, oldStride=p.stride;
 moveBody(p,dt,this.level.platforms,this.level.width);
 if(p.grounded){p.stride+=Math.abs(p.x-oldX)*.07;if(!wasGrounded&&fallingSpeed>150){p.landing=.15;this.burst(p.x+13,p.y+p.h,'#8ca28c',9);}else if(Math.floor(p.stride/Math.PI)!==Math.floor(oldStride/Math.PI)&&p.dash<=0){this.particles.push({x:p.x+13,y:p.y+p.h-2,vx:-p.dir*25,vy:-25,life:.25,max:.25,color:'#bbc5a866',size:3});}}
 if(p.y>680){p.hp=0;this.deaths++;this.setState('dead');return;}
 const attackBox={x:p.dir===1?p.x+p.w-6:p.x-(p.heavy?94:69),y:p.y-4,w:p.heavy?100:75,h:66};
 for(const e of this.enemies){
  if(e.dead)continue;
  if(p.attack>0&&p.attack<(p.heavy?.3:.19)&&overlaps(attackBox,e)&&!this.attackHits.has(e)){this.attackHits.add(e);this.hitEnemy(e,p.heavy?stats.heavyDamage:stats.lightDamage);}
  if(!e.dead)this.updateEnemy(e,dt);
  if(this.state!=='playing')return;
 }
 this.level.hazards.forEach((h,i)=>{if(furnacePhase(this.clock,i)==='active'&&overlaps(p,h))this.damage(18,p.dir);});
 if(this.state!=='playing')return;
 for(const s of this.shots){s.x+=s.vx*dt;s.y+=(s.vy??0)*dt;s.life-=dt;if(s.friendly){for(const e of this.enemies)if(!e.dead&&overlaps(s,e)){this.hitEnemy(e,s.damage);s.life=0;break;}}else if(overlaps(s,p)){const parrying=p.parry>0;this.damage(s.damage,s.vx>0?1:-1);if(this.state!=='playing')return;if(parrying){s.friendly=true;s.vx=-s.vx;s.vy=-(s.vy??0);s.damage=stats.chiDamage;}else s.life=0;}}
 this.shots=this.shots.filter(s=>s.life>0);for(const a of this.particles){a.x+=a.vx*dt;a.y+=a.vy*dt;a.vy+=160*dt;a.life-=dt;}this.particles=this.particles.filter(a=>a.life>0);
 if(!this.secret&&overlaps(p,this.level.seal)){this.secret=true;this.seals.add(this.chapter);p.chi=this.progression.stats.maxChi;p.hp=clamp(p.hp+25,0,this.progression.stats.maxHealth);this.progression.discover('jade-pendant');this.onProgress();this.burst(this.level.seal.x+15,this.level.seal.y+25,'#abd9b1',30);this.onToast('Jade seal found · Jade Pendant added to inventory · C to equip');this.audio.play(880,.5);}
 if(tap('KeyF')){
  const lantern=this.level.checkpoints.find(x=>Math.abs(p.x-x)<95);
  if(lantern!==undefined){this.checkpoint=lantern-30;this.rested=true;this.restedAt.add(lantern);p.hp=this.progression.stats.maxHealth;p.chi=this.progression.stats.maxChi;this.onToast('Lantern kindled · Checkpoint set · Health & chi restored');this.audio.play(660,.5);}
  if(Math.abs(p.x-this.level.exit)<100){
   if(!this.boss.dead)this.onToast(this.chapter===1?'The Keeper guards this bell. Defeat him first.':'The Abbot guards the oath. Defeat him first.');
   else{this.audio.play(220,2,'sine',.12);this.setState(this.chapter===1?'chapter-complete':'won');return;}
  }
 }
 const next=this.chapter===1?(p.x<1650?'MISTVEIL PASS':p.x<3400?'THE LANTERN PATH':'COURT OF THE SILENT BELL'):(p.x<2200?'THE INCENSE HALL':p.x<4200?'GALLERY OF BROKEN OATHS':'THE EMBER SANCTUM');
 if(this.location!==next){this.location=next;this.onLocation(next,this.chapter===1?(p.x<3400?'Reach the mountain bell':'Defeat the Keeper · Ring the bell'):(p.x<4200?'Cross the halls · Beware the furnaces':'Defeat the Abbot · Reclaim the oath'));}
 this.camera+=(clamp(p.x-340,0,this.level.width-1280)-this.camera)*Math.min(1,dt*5);this.pressed.clear();
 }
 updateEnemy(e:Enemy,dt:number){
  const p=this.player;
  for(const key of ['flash','attack','hurt','stun','cast'] as const)e[key]=Math.max(0,e[key]-dt);
  const dx=p.x-e.x,boss=e.kind==='boss'||e.kind==='abbot',ranged=e.kind==='archer'||e.kind==='acolyte';
  const fury=e.kind==='abbot'&&e.hp<=e.max/2;
  if(e.wind<=0)e.dir=dx>=0?1:-1;
  e.vx=0;
  if(e.stun<=0){
   if(e.wind>0){
    e.wind-=dt;
    if(e.wind<=0){
     e.attack=boss?.4:.23;e.cast=ranged||e.kind==='abbot'?.3:0;
     if(ranged){
      const speed=e.kind==='acolyte'?290:360;
      const dy=e.kind==='acolyte'?clamp((p.y+25-(e.y+20))/Math.max(100,Math.abs(dx))*speed,-190,190):0;
      this.shots.push({x:e.x+14,y:e.y+20,w:e.kind==='acolyte'?18:26,h:e.kind==='acolyte'?18:5,vx:e.dir*speed,vy:dy,life:3,friendly:false,damage:15});
     }else if(e.kind==='abbot'&&e.cycle%2===0){
      // A slow, aimed volley: jump through its spacing or reflect individual orbs.
      const dy=clamp((p.y+25-(e.y+26))/Math.max(100,Math.abs(dx))*310,-150,150);
      for(const spread of fury?[-110,-55,0,55,110]:[-65,0,65])this.shots.push({x:e.x+e.w/2,y:e.y+26,w:20,h:20,vx:e.dir*(fury?350:300),vy:dy+spread,life:3,friendly:false,damage:17});
      this.audio.play(180,.25,'triangle');
     }else{
      const reach=e.kind==='spear'?125:boss?145:73;
      const box={x:e.dir>0?e.x-8:e.x-reach,y:e.y-5,w:reach+e.w+8,h:e.h+10};
      if(overlaps(box,p)){
       const parrying=p.parry>0&&p.inv<=0&&p.dash<=0;
       this.damage(boss?24:e.kind==='spear'?18:14,e.dir);
       if(parrying){this.hitEnemy(e,12);e.stun=1.1;}
      }
      if(e.kind==='abbot'){
       // Floor waves are explicitly low: double jump to evade, or parry / dash through.
       for(const direction of [-1,1])this.shots.push({x:e.x+e.w/2,y:452,w:44,h:26,vx:direction*(fury?440:340),life:2.2,friendly:false,damage:20});
      }else if(e.kind==='boss'&&e.hp<120)this.shots.push({x:e.x,y:446,w:45,h:28,vx:e.dir*390,life:2,friendly:false,damage:16});
     }
     e.cycle++;e.timer=e.kind==='abbot'?(fury?.7:1.15):e.kind==='boss'?.9:ranged?1.65:1.4;
    }
   }else{
    const near=Math.abs(dx)<(boss?600:480);if(near)e.timer-=dt;
    const range=e.kind==='abbot'?380:ranged?440:e.kind==='spear'?132:e.kind==='boss'?125:73;
    if(near&&Math.abs(dx)<range&&Math.abs(p.y-e.y)<(e.kind==='abbot'?260:ranged?280:110)&&e.timer<=0){
     e.wind=e.kind==='abbot'?(fury?.55:.8):e.kind==='spear'?.7:boss?.65:ranged?.7:.48;
    }else if(near&&!ranged){
     e.vx=Math.abs(dx)>range-12?e.dir*(e.kind==='shade'?112:e.kind==='abbot'?(fury?125:85):boss?95:68):0;
     const ahead=e.x+(e.dir>0?e.w+16:-16);
     if(e.grounded&&!this.level.platforms.some(f=>ahead>=f.x&&ahead<f.x+f.w&&Math.abs(f.y-(e.y+e.h))<10))e.vx=0;
    }
   }
  }
  const oldX=e.x;moveBody(e,dt,this.level.platforms,this.level.width);
  if(e.grounded)e.stride+=Math.abs(e.x-oldX)*.07;
  if(e.y>680){if(e.tagged)this.defeatEnemy(e);else e.dead=true;}
 }
 polygon(points:number[][],color:string){const c=this.ctx;c.fillStyle=color;c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.fill();}
 render(){const c=this.ctx,t=this.clock,cam=this.camera;c.clearRect(0,0,1280,600);if(this.chapter===2)drawTempleBackground(c,cam,t);else{
const sky=c.createLinearGradient(0,0,0,600);sky.addColorStop(0,'#20383e');sky.addColorStop(.58,'#65887d');sky.addColorStop(1,'#243f3a');c.fillStyle=sky;c.fillRect(0,0,1280,600);
 c.fillStyle='#d5d5af';c.globalAlpha=.65;c.beginPath();c.arc(982-cam*.025,112,43,0,Math.PI*2);c.fill();c.globalAlpha=1;
 // Atmospheric perspective: pale far peaks, sharp near ridges, all anchored in world space.
 for(let layer=0;layer<3;layer++){
   const offset=cam*[.08,.22,.43][layer], spacing=370;
   const color=['#55796e','#3c6355','#274c3e'][layer];
   const first=Math.floor(offset/spacing)-1;
   for(let i=first;i<first+7;i++){
     const x=i*spacing-offset,variant=((i%3)+3)%3,y=185+layer*72;
     this.polygon([[x-170,530],[x+20,y+60],[x+90,y-70+variant*40],[x+145,y-35],[x+230,y+115],[x+340,540]],color);
     this.polygon([[x+70,y-45+variant*35],[x+90,y-70+variant*40],[x+118,y-42],[x+104,y+20]],['#91a999','#628576','#3b6350'][layer]);
   }
 }
 for(let i=0;i<7;i++){const x=((i*247+t*(4+i%3)-cam*.12)%1600+1600)%1600-180;const mist=c.createRadialGradient(x,340+i%3*55,5,x,340+i%3*55,260);mist.addColorStop(0,'#c2d5bb18');mist.addColorStop(1,'#c2d5bb00');c.fillStyle=mist;c.fillRect(x-260,100,520,440);}
 // Distant monastery, pine boughs, and bridge silhouettes.
 c.save();c.translate(800-cam*.29,258);c.globalAlpha=.65;this.pagoda(0,0,1.2);c.restore();
 for(let i=Math.floor(cam*.58/170)-1;i<Math.floor(cam*.58/170)+10;i++){const x=i*170-cam*.58;this.bamboo(x,405+(i%3)*20,170+(i%4)*24,'#23483899',true);}
 // A river catches horizontal glints behind the playable path.
 c.fillStyle='#8cb4a31b';for(let i=0;i<14;i++){const x=((i*147-cam*.48+t*5)%1400+1400)%1400;c.fillRect(x,435+(i%5)*6,45+i%3*20,1);}
 }
 c.save();if(this.shake>0)c.translate(Math.sin(t*91)*this.shake,Math.cos(t*73)*this.shake*.5);c.translate(-cam,0);
 if(this.chapter===2)drawTempleWorld(c,this.level,t);else{
 // Paths and stone ledges.
 for(const p of this.level.platforms){c.fillStyle='#182c2a';c.fillRect(p.x,p.y,p.w,p.h);c.fillStyle='#43594b';c.fillRect(p.x,p.y,p.w,6);c.fillStyle='#72826a';c.fillRect(p.x,p.y,p.w,2);for(let x=p.x+8;x<p.x+p.w;x+=44){c.strokeStyle='#61705b28';c.strokeRect(x,p.y+10,38,14);c.fillStyle='#7b8d6c';c.fillRect(x,p.y-4,2,5);c.fillRect(x+4,p.y-2,1,3);}if(p.h>30){for(let x=p.x+18;x<p.x+p.w;x+=100)this.polygon([[x,p.y+28],[x+44,p.y+38],[x+62,p.y+95],[x+10,p.y+76]],'#213832');}}
 this.gate(350,480);this.gate(3440,480);
 for(const x of [90,220,970,1735,2300,2840,3290,4700])this.bamboo(x,480,200+(x%80),'#142e28',true);
 this.lantern(440,410,false);this.bell(this.level.exit,480);
 }
 for(const x of this.level.checkpoints){this.lantern(x,400,this.restedAt.has(x));if(Math.abs(this.player.x-x)<110){c.fillStyle='#d4b781';c.font='10px sans-serif';c.textAlign='center';c.fillText('F · REST AT LANTERN',x,355);}}
 if(!this.secret){const seal=this.level.seal;c.save();c.translate(seal.x+15,seal.y+22+Math.sin(t*2)*5);c.shadowColor='#b4dfb5';c.shadowBlur=15;c.strokeStyle='#a3c8a2';c.lineWidth=3;c.strokeRect(-7,-7,14,14);c.strokeRect(-3,-3,6,6);c.restore();}
 if(Math.abs(this.player.x-this.level.exit)<130){c.fillStyle='#d8c18d';c.font='10px sans-serif';c.textAlign='center';c.fillText(this.chapter===1?'F · RING THE BELL':'F · RECLAIM THE OATH',this.level.exit,315);}
 for(const e of this.enemies){if(e.dead)continue;drawCharacter(c,e.x+e.w/2,e.y+e.h,e.dir,e.kind,e,this.clock,e.wind>0,e.flash>0,e.stun>0);if(e.hp<e.max&&e.kind!=='boss'){c.fillStyle='#142824';c.fillRect(e.x-4,e.y-17,36,3);c.fillStyle='#b66f56';c.fillRect(e.x-4,e.y-17,36*e.hp/e.max,3);}if(e.wind>0){c.fillStyle='#dfb373';c.font='bold 20px serif';c.fillText('!',e.x+e.w/2,e.y-21);}}
 const p=this.player;
 if(this.levelUpTimer>0){
  const progress=1-this.levelUpTimer/2.6;
  c.save();c.translate(p.x+13,p.y+30);c.globalAlpha=Math.min(1,this.levelUpTimer);c.strokeStyle='#f6dda0';c.lineWidth=2;c.shadowColor='#f4d28a';c.shadowBlur=18;
  for(let i=0;i<2;i++){c.beginPath();c.ellipse(0,0,26+progress*48+i*8,12+progress*35+i*8,progress*Math.PI,0,Math.PI*2);c.stroke();}
  for(let i=0;i<12;i++){const angle=i*Math.PI/6+progress*2;c.fillStyle='#ffe8ad';c.fillRect(Math.cos(angle)*(25+progress*60),Math.sin(angle)*(25+progress*60),3,7);}
  c.restore();
 }
 for(const text of this.rewardTexts){c.globalAlpha=Math.min(1,text.life);c.fillStyle='#f2d79a';c.font='bold 13px sans-serif';c.textAlign='center';c.fillText(text.text,text.x,text.y);}c.globalAlpha=1;
 if(p.dash>0){for(let i=3;i>0;i--){c.globalAlpha=.1+(3-i)*.07;drawCharacter(c,p.x+13-p.dir*i*24,p.y+p.h,p.dir,'player',p,t,false,false,false,this.progression.appearance);}c.globalAlpha=1;}
 if(p.inv<=0||Math.floor(t*14)%2===0)drawCharacter(c,p.x+13,p.y+p.h,p.dir,'player',p,t,false,false,false,this.progression.appearance);
 if(p.cast>0){c.fillStyle='#c4edd4';c.shadowColor='#9cdbb9';c.shadowBlur=14;c.beginPath();c.arc(p.x+13+p.dir*30,p.y+22,4+p.cast*15,0,Math.PI*2);c.fill();c.shadowBlur=0;}
 if(p.parry>0){c.strokeStyle='#eadbb0';c.lineWidth=3;c.beginPath();c.arc(p.x+13+p.dir*15,p.y+26,35,-1.3,1.3);c.stroke();}
 if(p.attack>0){const progress=1-p.attack/(p.heavy?.4:.23);c.save();c.translate(p.x+13,p.y+23);if(p.dir<0)c.scale(-1,1);c.strokeStyle=p.heavy?'#e7d2a6':'#c9e3ce';c.shadowColor='#e6eccb';c.shadowBlur=12;c.lineWidth=p.heavy?10:5;c.beginPath();c.arc(0,0,p.heavy?90:65,-1.6+progress*.3,.9+progress*.6);c.stroke();c.restore();}
 for(const s of this.shots){c.fillStyle=s.friendly?'#bdebd1':'#e2b07b';c.shadowColor=c.fillStyle;c.shadowBlur=s.friendly?20:5;if(s.friendly){c.beginPath();c.ellipse(s.x+s.w/2,s.y+s.h/2,10,25,.4,0,Math.PI*2);c.fill();}else if(this.chapter===2&&s.h>10){c.fillStyle='#efae70';c.beginPath();c.ellipse(s.x+s.w/2,s.y+s.h/2,s.w/2,s.h/2,0,0,Math.PI*2);c.fill();c.fillStyle='#ffe6b0';c.beginPath();c.arc(s.x+s.w/2,s.y+s.h/2,Math.min(s.w,s.h)/4,0,Math.PI*2);c.fill();}else c.fillRect(s.x,s.y,s.w,s.h);c.shadowBlur=0;}
 for(const a of this.particles){c.globalAlpha=clamp(a.life/a.max,0,1);c.fillStyle=a.color;c.fillRect(a.x,a.y,a.size,a.size);}c.globalAlpha=1;c.restore();
 if(this.chapter===2)drawTempleForeground(c,cam);else{
 // Fast, sparse foreground plants frame the path without hiding the character.
 c.save();c.globalAlpha=.65;
 const nearOffset=cam*1.28;
 for(let i=Math.floor(nearOffset/510)-1;i<Math.floor(nearOffset/510)+4;i++){
   const x=i*510-nearOffset+120;
   this.bamboo(x,635,135+(i%3)*18,'#0b211d',true);
 }
 c.restore();
 // Foreground leaves and vignette.
 for(let i=0;i<13;i++){const x=((i*151+t*16-cam*1.12)%1400+1400)%1400;const y=(i*73+t*(10+i%3))%600;c.save();c.translate(x,y);c.rotate(t*.3+i);c.fillStyle='#b2bd872e';c.beginPath();c.ellipse(0,0,5,1.4,0,0,Math.PI*2);c.fill();c.restore();}
 }
 const v=c.createRadialGradient(640,290,170,640,290,740);v.addColorStop(0,'#07171b00');v.addColorStop(1,'#051115a0');c.fillStyle=v;c.fillRect(0,0,1280,600);
 this.hud();
 }
 bamboo(x:number,y:number,h:number,color:string,leaves:boolean){const c=this.ctx;c.strokeStyle=color;c.lineWidth=3;c.beginPath();c.moveTo(x,y);c.lineTo(x+10,y-h);c.stroke();for(let i=25;i<h;i+=24){c.fillStyle=color;c.fillRect(x+i/h*10-3,y-i,8,2);if(leaves){for(let j=-2;j<=2;j++){c.save();c.translate(x+8,y-i);c.rotate(j*.4-.5);c.beginPath();c.ellipse(j*9,-14,3,19,.7,0,Math.PI*2);c.fill();c.restore();}}}}
 pagoda(x:number,y:number,s:number){const c=this.ctx;c.save();c.translate(x,y);c.scale(s,s);c.fillStyle='#294c43';c.fillRect(-30,0,60,85);for(let i=0;i<3;i++){const top=i*27;this.polygon([[-60+10*i,top+7],[-22,top-2],[0,top-17],[22,top-2],[60-10*i,top+7]],'#213f38');c.fillRect(-25,top+6,50,22);}c.restore();}
 gate(x:number,y:number){const c=this.ctx;c.fillStyle='#3f4e3c';c.fillRect(x-65,y-164,10,164);c.fillRect(x+55,y-164,10,164);c.fillStyle='#5b6050';c.fillRect(x-74,y-150,148,12);this.polygon([[x-100,y-163],[x-60,y-172],[x,y-189],[x+60,y-172],[x+100,y-163]],'#23382e');c.fillStyle='#b19f72';c.font='16px serif';c.textAlign='center';c.fillText('山 門',x,y-141);}
 lantern(x:number,y:number,lit:boolean){const c=this.ctx;c.strokeStyle='#534e35';c.lineWidth=4;c.beginPath();c.moveTo(x+20,480);c.lineTo(x+20,y-25);c.lineTo(x,y-25);c.stroke();const glow=c.createRadialGradient(x,y,2,x,y,lit?65:42);glow.addColorStop(0,'#e9af6155');glow.addColorStop(1,'#e9af6100');c.fillStyle=glow;c.fillRect(x-70,y-70,140,140);c.fillStyle=lit?'#cd8560':'#a15e44';c.beginPath();c.ellipse(x,y,11,17,0,0,Math.PI*2);c.fill();c.fillStyle='#e1c48b';c.fillRect(x-10,y-12,20,2);c.fillRect(x-10,y+10,20,2);c.fillRect(x-1,y+17,2,12);}
 bell(x:number,y:number){const c=this.ctx;c.fillStyle='#4a4e39';c.fillRect(x-59,y-154,10,154);c.fillRect(x+49,y-154,10,154);this.polygon([[x-85,y-151],[x-55,y-166],[x,y-182],[x+55,y-166],[x+85,y-151]],'#233c31');c.strokeStyle='#95805c';c.lineWidth=3;c.beginPath();c.moveTo(x,y-155);c.lineTo(x,y-117);c.stroke();this.polygon([[x-15,y-117],[x+15,y-117],[x+27,y-73],[x-27,y-73]],'#a59566');c.fillStyle='#c0ad78';c.fillRect(x-29,y-76,58,5);c.fillStyle='#5b654a';c.fillRect(x-17,y-109,34,2);c.fillRect(x-21,y-95,42,2);}
 hud(){const c=this.ctx,p=this.player,rpg=this.progression,stats=rpg.stats;
 c.fillStyle='#0f2221d0';c.fillRect(26,24,266,116);c.strokeStyle='#9d976448';c.strokeRect(26,24,266,116);
 c.fillStyle='#c9d2b9';c.font='12px sans-serif';c.textAlign='left';c.fillText('THE WANDERER',44,47);c.textAlign='right';c.fillStyle='#ead39b';c.fillText('LV '+rpg.level,274,47);
 c.textAlign='left';c.fillStyle='#8fa88f';c.font='9px sans-serif';c.fillText('HEALTH',44,66);c.fillText('CHI',44,87);c.fillText('XP',44,108);
 c.fillStyle='#30433a';c.fillRect(97,59,177,7);c.fillRect(97,80,177,5);c.fillRect(97,101,177,5);
 c.fillStyle='#be8b6c';c.fillRect(97,59,177*clamp(p.hp/stats.maxHealth,0,1),7);c.fillStyle='#88b8a4';c.fillRect(97,80,177*clamp(p.chi/stats.maxChi,0,1),5);
 c.fillStyle='#d2b574';c.fillRect(97,101,177*(rpg.level===MAX_LEVEL?1:rpg.xp/rpg.nextXP),5);
 c.fillStyle='#9ea991';c.font='8px sans-serif';c.fillText(rpg.level===MAX_LEVEL?'MASTERY ATTAINED':`${rpg.xp} / ${rpg.nextXP} XP`,97,122);c.textAlign='right';c.fillText('C · CHARACTER',274,122);
 c.fillStyle='#c5c9ac';c.font='11px sans-serif';c.fillText(`CHAPTER ${this.level.roman}  /  ${this.level.title.toUpperCase()}`,1248,40);c.fillStyle='#8da697';c.font='10px sans-serif';c.fillText(`${this.elapsedLabel()}  ·  ${this.secret?'JADE SEAL COLLECTED':'JADE SEAL —'}  ·  ${this.deaths} FALLS`,1248,59);
 if(this.levelUpTimer>0){c.save();c.globalAlpha=Math.min(1,this.levelUpTimer);c.fillStyle='#182921dd';c.fillRect(468,83,344,64);c.strokeStyle='#c7aa70';c.strokeRect(468,83,344,64);c.textAlign='center';c.fillStyle='#f1d99e';c.font='22px Georgia';c.fillText(`LEVEL ${rpg.level} · ${rpg.rank.toUpperCase()}`,640,111);c.fillStyle='#c6d2b6';c.font='10px sans-serif';c.fillText(`+${12*this.levelUpCount} health · +${8*this.levelUpCount} chi · Stronger blade & chi · Fully restored`,640,132);c.restore();}

 const boss=this.boss;if(p.x>(this.chapter===1?3400:4200)&&!boss.dead){c.fillStyle='#142824dd';c.fillRect(400,540,480,36);c.fillStyle='#d1be91';c.textAlign='center';c.font='11px serif';c.fillText(this.level.bossName+(this.chapter===2&&boss.hp<=boss.max/2?' · EMBER FURY':''),640,554);c.fillStyle='#563e36';c.fillRect(420,563,440,4);c.fillStyle='#bd765e';c.fillRect(420,563,440*boss.hp/boss.max,4);}else if(this.state==='playing'&&p.x<430){c.fillStyle='#e1d9b9';c.textAlign='center';c.font='11px sans-serif';c.fillText(this.chapter===1?'A / D  move     SPACE  double jump     J  strike     L  parry the amber flash':'TEMPLE OF EMBERS · Jump furnace grates · Parry chi bolts · Rest at lanterns with F',640,556);}}
}
