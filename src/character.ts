import {clamp} from './world';

type Point = [number, number];
export type CharacterMotion = {
  vx: number; vy: number; grounded: boolean; stride: number;
  attack: number; heavy: boolean; parry: number; dash: number;
  landing: number; hurt: number; cast: number;
};
export type CharacterKind = 'player' | 'swordsman' | 'archer' | 'shade' | 'boss' | 'spear' | 'acolyte' | 'abbot';

/** A small articulated rig. Its run cycle follows distance travelled, not a wall clock. */
export function drawCharacter(
  c: CanvasRenderingContext2D, x: number, y: number, dir: number,
  kind: CharacterKind, motion: CharacterMotion, time: number,
  wind = false, flash = false, stunned = false,
  appearance?:{robe:string;blade:string;charm:string},
) {
  const player = kind === 'player';
  const boss = kind === 'boss' || kind === 'abbot';
  const temple = kind === 'spear' || kind === 'acolyte' || kind === 'abbot';
  const running = motion.grounded && Math.abs(motion.vx) > 12;
  const speed = clamp(Math.abs(motion.vx) / 245, 0, 1);
  const stride = Math.sin(motion.stride);
  const airborne = !motion.grounded;
  const landing = clamp(motion.landing / .15, 0, 1);
  const dash = motion.dash > 0;
  const attacking = motion.attack > 0;
  const attackProgress = clamp(1 - motion.attack / (motion.heavy ? .4 : .23), 0, 1);
  const swing = Math.sin(attackProgress * Math.PI);
  const breathing = Math.sin(time * 2.7 + x * .01);
  let bob = running ? -Math.abs(Math.cos(motion.stride)) * 2.7 : breathing * .55;
  let lean = running ? .11 * speed : 0;
  if (airborne) { bob = -1; lean = motion.vy < 0 ? -.07 : .12; }
  if (dash) { bob = 7; lean = .42; }
  if (attacking) lean = -.18 + swing * .4;
  if (motion.hurt > 0) lean = -.25;
  bob += landing * 4;

  const robe = flash ? '#fff6c9' : player ? (appearance?.robe??'#e2e4c8') : kind === 'shade' ? '#668f86' : kind === 'abbot' ? '#c08852' : kind === 'spear' ? '#884b43' : kind === 'acolyte' ? '#aaa387' : boss ? '#a96b5d' : '#84907a';
  const trousers = player ? '#36584f' : '#273d38';
  const trim = player ? '#ad5c47' : '#c2a36c';
  const skin = flash ? '#fff6c9' : '#ceb996';
  const polygon = (points: Point[], color: string) => {
    c.fillStyle = color; c.beginPath();
    points.forEach(([px, py], i) => i ? c.lineTo(px, py) : c.moveTo(px, py));
    c.closePath(); c.fill();
  };
  const limb = (points: Point[], color: string, width: number) => {
    c.strokeStyle = color; c.lineWidth = width; c.lineCap = 'round'; c.lineJoin = 'round';
    c.beginPath(); points.forEach(([px, py], i) => i ? c.lineTo(px, py) : c.moveTo(px, py)); c.stroke();
  };
  c.save(); c.translate(x, y); c.scale(dir * (boss ? 1.35 : player ? 1.12 : 1), boss ? 1.35 : player ? 1.12 : 1);
  // Feet lift independently; the grounded foot stays planted while its knee bends.
  const leg = (side: number) => {
    const cycle = stride * side;
    let foot: Point = [side * 5 + cycle * 12 * speed, -1 - Math.max(0, cycle) * 8 * speed];
    let knee: Point = [side * 5 + cycle * 4 * speed, -12 - Math.max(0, cycle) * 3];
    if (!running) { foot = [side * 7, -1]; knee = [side * 5, -12]; }
    if (airborne) {
      foot = side === 1 ? [13, motion.vy < 0 ? -12 : -5] : [-13, -6];
      knee = side === 1 ? [14, -23] : [-11, -17];
    }
    if (dash) { foot = side === 1 ? [15, -3] : [-19, -3]; knee = side === 1 ? [17, -11] : [-14, -14]; }
    if (attacking && motion.grounded) { foot = [side === 1 ? 18 : -12, -1]; knee = [side === 1 ? 10 : -9, -10]; }
    const hip: Point = [side * 4, -23 + bob];
    limb([hip, knee, foot], side === -1 ? '#223e38' : trousers, 6);
    limb([[foot[0] - 2, foot[1]], [foot[0] + 5, foot[1]]], '#172e2a', 4);
    limb([[knee[0], knee[1] + 4], [foot[0], foot[1] - 2]], '#809687', 2);
  };
  leg(-1);
  c.save(); c.translate(0, bob); c.rotate(lean);
  // Scarf, hair ribbon, and split robe tails react to speed and vertical motion.
  const flutter = Math.sin(time * 10 + motion.stride * .5);
  const trailing = 8 + speed * 13 + (dash ? 15 : 0);
  polygon([[-7,-43],[-15,-40],[-trailing-9,-36+flutter*3],[-trailing-2,-29+flutter*4],[-14,-34]], player ? '#75a995' : '#455d50');
  polygon([[-8,-25],[-13-speed*5,-12+stride*2],[-2,-17],[0,-25]], '#a9beac');
  polygon([[0,-25],[12+speed*2,-14-stride*2],[7,-13],[3,-25]], robe);
  const rearHand: Point = dash ? [-22,-35] : airborne ? [-19,-38] : [-12-stride*6,-29+stride*3];
  limb([[-6,-41],[-13,-35],rearHand], player ? '#9ab8a4' : robe, 5);
  polygon([[-9,-45],[7,-45],[11,-27],[3,-22],[-11,-27]], robe);
  polygon([[-7,-43],[-3,-39],[-7,-27],[-10,-29]], player ? '#b8ccba' : '#647762');
  limb([[1,-43],[-2,-36],[4,-30]], '#f0e7c755', 1.5);
  polygon([[-10,-29],[10,-29],[11,-25],[-11,-25]], trim);
  polygon([[7,-26],[12,-25],[16+flutter*2,-15],[9,-18]], trim);
  if(player&&appearance){limb([[5,-26],[8,-20]],'#b9a475',1);c.fillStyle=appearance.charm;c.beginPath();c.arc(8,-19,2.3,0,Math.PI*2);c.fill();}
  // Neck, face, headband, and straw hat bob with the torso.
  c.fillStyle = skin; c.fillRect(-3,-48,6,5);
  c.beginPath(); c.ellipse(0,-51,6.5,7,0,0,Math.PI*2); c.fill();
  polygon([[-7,-55],[3,-58],[7,-52],[-2,-53],[-6,-48]], '#203831');
  c.fillStyle = '#21362e'; c.fillRect(3,-52,2,1.3);
  limb([[-7,-54],[6,-54]], trim, 2);
  limb([[-7,-53],[-16-speed*8,-50+flutter*2]], trim, 1.5);
  if(temple){
    c.fillStyle=kind==='spear'?'#565c55':'#d5b78f';c.beginPath();c.arc(0,-54,7,Math.PI,Math.PI*2);c.fill();
    if(kind==='abbot'){polygon([[-7,-58],[-7,-68],[0,-73],[7,-68],[7,-58]],'#bd8e50');limb([[-5,-66],[5,-66]],'#e8c587',2);}
    if(kind==='spear'){polygon([[-8,-55],[-8,-62],[0,-66],[8,-62],[8,-55]],'#69726a');limb([[0,-64],[0,-71]],'#c27557',3);}
    for(let i=0;i<5;i++){c.fillStyle='#d2b17a';c.beginPath();c.arc(-5+i*2.4,-41+Math.sin(i/4*Math.PI)*5,1.3,0,Math.PI*2);c.fill();}
  }else{polygon([[-16,-57],[0,-65],[17,-57],[6,-55],[-8,-55]], player ? '#416354' : '#334c40');limb([[-16,-57],[17,-57]], '#91a18a', 1);}

  let elbow: Point = [13,-36], hand: Point = [17,-28];
  let swordAngle = -.65;
  if (running) { elbow = [12,-35-stride*3]; hand = [16+stride*4,-29-stride*5]; swordAngle += stride*.15; }
  if (airborne) { elbow = [13,-42]; hand = [22,-39]; swordAngle = -.9; }
  if (dash) { elbow = [16,-35]; hand = [24,-33]; swordAngle = .08; }
  if (wind) { elbow = [9,-48]; hand = [7,-59]; swordAngle = -2; }
  if (attacking) {
    swordAngle = -2.3 + attackProgress * 3.7;
    elbow = [10 + swing*6, -41 + swing*6];
    hand = [13 + swing*14, -46 + attackProgress*17];
  }
  if (motion.parry > 0) { elbow = [14,-43]; hand = [21,-40]; swordAngle = -1.2; }
  if (motion.cast > 0) { elbow = [18,-38]; hand = [28,-39]; swordAngle = -.2; }
  limb([[5,-42],elbow,hand], robe, 5.5);
  c.fillStyle = skin; c.beginPath(); c.arc(hand[0],hand[1],2.7,0,Math.PI*2); c.fill();
  if (kind === 'archer') {
    c.strokeStyle = '#c5a76d'; c.lineWidth = 2; c.beginPath(); c.arc(hand[0]+4,hand[1]-5,18,-1.4,1.4); c.stroke();
    limb([[hand[0]+7,hand[1]-23],[hand[0]+7,hand[1]+13]], '#e0d5b8', 1);
  } else if(kind==='spear'||kind==='abbot'||kind==='acolyte') {
    c.save();c.translate(hand[0],hand[1]);c.rotate(kind==='acolyte'?-.9:wind?-1.3:attacking?-.15:-.5);
    limb([[-27,0],[kind==='spear'?58:42,0]],'#b59965',2.5);
    if(kind==='spear')polygon([[58,-4],[71,0],[58,4],[61,0]],'#e3ddbd');
    else{c.strokeStyle=kind==='abbot'?'#efbb70':'#cbd8b0';c.lineWidth=2;c.beginPath();c.arc(44,0,7,0,Math.PI*2);c.stroke();c.fillStyle=wind?'#ffe4a3':'#dc9860';c.beginPath();c.arc(44,0,3,0,Math.PI*2);c.fill();}
    c.restore();
  } else {
    c.save(); c.translate(hand[0],hand[1]); c.rotate(swordAngle);
    limb([[-7,0],[1,0]], '#79674a', 3);
    limb([[2,-4],[2,4]], '#d0b37a', 2);
    polygon([[3,-1.8],[boss?42:32,-1],[boss?48:37,0],[boss?42:32,1.5],[3,1.8]], wind ? '#f4cf91' : player ? (appearance?.blade??'#e4e9ce') : '#e4e9ce');
    limb([[4,-1],[boss?41:31,-.5]], '#fbffe9', .7);
    c.restore();
  }
  c.restore(); leg(1);
  if (stunned) { c.fillStyle='#e1cf92'; c.fillRect(-9,-73,3,3); c.fillRect(8,-70,3,3); }
  c.restore();
}
