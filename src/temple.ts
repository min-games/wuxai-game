import {type Chapter} from './chapters';
import {type Rect} from './world';

function polygon(c:CanvasRenderingContext2D,points:number[][],color:string|CanvasGradient){c.fillStyle=color;c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.fill();}
export function drawTempleBackground(c:CanvasRenderingContext2D,camera:number,time:number){
 const sky=c.createLinearGradient(0,0,0,600);sky.addColorStop(0,'#181b25');sky.addColorStop(.55,'#493b38');sky.addColorStop(1,'#251f26');c.fillStyle=sky;c.fillRect(0,0,1280,600);
 // Far wall: carved alcoves and pools of cool moonlight.
 const wallOffset=camera*.18;
 for(let i=Math.floor(wallOffset/310)-1;i<Math.floor(wallOffset/310)+6;i++){
  const x=i*310-wallOffset;c.fillStyle='#24252d';c.fillRect(x+25,106,245,365);c.strokeStyle='#76655a40';c.lineWidth=2;c.strokeRect(x+34,115,227,355);
  c.fillStyle='#6b818433';c.beginPath();c.arc(x+148,175,56,Math.PI,0);c.lineTo(x+204,289);c.lineTo(x+92,289);c.fill();
  c.strokeStyle='#78918b44';c.lineWidth=2;for(let k=0;k<5;k++){c.beginPath();c.moveTo(x+103+k*22,145);c.lineTo(x+103+k*22,288);c.stroke();}c.beginPath();c.moveTo(x+92,206);c.lineTo(x+204,206);c.stroke();
  const ray=c.createLinearGradient(x+100,200,x+250,480);ray.addColorStop(0,'#d8d9b318');ray.addColorStop(1,'#d8d9b300');polygon(c,[[x+95,200],[x+150,200],[x+280,480],[x+85,480]],ray);
  // Abstract guardian carving, rather than a representation of a specific sacred figure.
  c.fillStyle='#5c574a';c.beginPath();c.arc(x+148,330,15,0,Math.PI*2);c.fill();polygon(c,[[x+130,347],[x+166,347],[x+181,412],[x+115,412]],'#514c43');c.fillStyle='#72614c';c.fillRect(x+110,414,77,9);
 }
 // Middle layer: lacquered columns, ceiling beams, embroidered banners.
 const midOffset=camera*.55;
 for(let i=Math.floor(midOffset/430)-1;i<Math.floor(midOffset/430)+5;i++){
  const x=i*430-midOffset;c.fillStyle='#2b2429';c.fillRect(x+4,50,36,430);c.fillStyle='#685040';c.fillRect(x,73,44,9);c.fillRect(x-4,450,52,16);c.fillStyle='#78544150';c.fillRect(x+11,90,5,350);
  polygon(c,[[x+130,62],[x+215,62],[x+215,239],[x+172,217],[x+130,239]],'#643e36');c.strokeStyle='#b491574d';c.strokeRect(x+140,73,65,136);c.fillStyle='#c6a36c88';c.font='22px serif';c.textAlign='center';c.fillText('誓',x+172,121);c.fillText('影',x+172,162);
  c.strokeStyle='#9e825560';c.lineWidth=1;c.beginPath();c.moveTo(x+323,72);c.lineTo(x+323,222);c.stroke();flame(c,x+323,235,time,1.2);c.fillStyle='#897454';c.fillRect(x+309,246,28,4);
 }
 c.fillStyle='#302930';c.fillRect(0,60,1280,22);c.fillStyle='#8d6a4544';c.fillRect(0,81,1280,3);c.fillRect(0,101,1280,2);
 // Smoke and glowing dust drift independently from camera movement.
 for(let i=0;i<20;i++){const x=((i*131+time*7-camera*.36)%1400+1400)%1400,y=110+(i*67+time*9)%360;c.fillStyle=i%3===0?'#efb87466':'#d1c1a022';c.fillRect(x,y,i%3===0?2:1,2);}
}
export function furnacePhase(time:number,index:number){const phase=(time+index*1.1)%4;return phase<1?'warning':phase<2?'active':'idle';}
export function flame(c:CanvasRenderingContext2D,x:number,y:number,time:number,scale=1){
 c.save();c.translate(x,y);c.scale(scale,scale);const flicker=Math.sin(time*15+x)*3;
 const glow=c.createRadialGradient(0,-8,0,0,-8,70);glow.addColorStop(0,'#e8ac5155');glow.addColorStop(1,'#e8ac5100');c.fillStyle=glow;c.fillRect(-70,-78,140,140);
 polygon(c,[[-8,0],[-11,-11],[-4,-27-flicker],[1,-16],[5,-35+flicker],[12,-10],[8,0]],'#ce794d');polygon(c,[[-4,0],[-5,-12],[2,-24-flicker],[7,-9],[4,0]],'#f1c77e');c.restore();
}
export function drawFurnace(c:CanvasRenderingContext2D,h:Rect,time:number,index:number){
 const phase=furnacePhase(time,index);c.fillStyle='#29242a';c.fillRect(h.x-6,476,h.w+12,14);c.strokeStyle='#967954';c.lineWidth=2;c.strokeRect(h.x-6,474,h.w+12,8);
 for(let j=0;j<5;j++){const x=h.x+8+j*16;c.fillStyle=phase==='idle'?'#7c503f':'#df995f';c.fillRect(x,476,9,3);if(phase==='active')flame(c,x+4,475,time+j,.9+(j%2)*.25);}
 if(phase==='warning'){c.fillStyle='#edb97488';c.fillRect(h.x,h.y,h.w,h.h);c.fillStyle='#edc482';c.font='9px sans-serif';c.textAlign='center';c.fillText('FURNACE · JUMP',h.x+h.w/2,h.y-9);}
}
export function drawTempleWorld(c:CanvasRenderingContext2D,chapter:Chapter,time:number){
 for(const p of chapter.platforms){c.fillStyle=p.h>30?'#302a2c':'#564638';c.fillRect(p.x,p.y,p.w,p.h);c.fillStyle='#a28961';c.fillRect(p.x,p.y,p.w,3);c.fillStyle='#675743';c.fillRect(p.x,p.y+5,p.w,6);
 for(let x=p.x+12;x<p.x+p.w-10;x+=48){c.strokeStyle='#b1966740';c.strokeRect(x,p.y+15,38,12);if(p.h>30){c.strokeStyle='#73625633';c.strokeRect(x,p.y+37,38,31);c.fillStyle='#181c2288';c.fillRect(x+6,p.y+81,28,50);}else{c.fillStyle='#b49968';c.fillRect(x+12,p.y+7,9,3);}}
 }
 for(const x of [330,920,1810,2590,3100,3870,4480,5120]){c.fillStyle='#342931';c.fillRect(x,85,23,395);c.fillStyle='#785340';c.fillRect(x+4,110,3,325);c.fillStyle='#8e704f';c.fillRect(x-5,80,33,10);c.fillRect(x-7,465,37,15);}
 for(const x of [350,1260,2490,3420,4180,4960]){c.fillStyle='#8f7555';c.fillRect(x-7,428,14,52);c.fillRect(x-16,421,32,7);flame(c,x,421,time);}
 chapter.hazards.forEach((h,i)=>drawFurnace(c,h,time,i));
 // The sealed oath at the far altar becomes the chapter's final interaction.
 const x=chapter.exit;c.fillStyle='#654a3b';c.fillRect(x-58,452,116,28);c.fillStyle='#bea071';c.fillRect(x-65,449,130,5);c.fillStyle='#bc9b62';c.fillRect(x-25,395,50,54);c.strokeStyle='#e1c38e';c.strokeRect(x-19,401,38,43);c.font='20px serif';c.fillStyle='#4b352c';c.textAlign='center';c.fillText('誓',x,429);
 for(const side of [-1,1]){c.fillStyle='#b49465';c.fillRect(x+side*77-3,413,6,35);flame(c,x+side*77,413,time,.6);}
}
export function drawTempleForeground(c:CanvasRenderingContext2D,camera:number){
 const offset=camera*1.24;c.save();c.globalAlpha=.8;
 for(let i=Math.floor(offset/680)-1;i<Math.floor(offset/680)+3;i++){const x=i*680-offset+65;c.fillStyle='#151820';c.fillRect(x,505,50,95);c.fillStyle='#725743';c.fillRect(x-7,505,64,9);polygon(c,[[x-16,505],[x+66,505],[x+52,487],[x-2,487]],'#201e26');}
 c.restore();
}
