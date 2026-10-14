import type {EnemyKind} from './chapters';

export type EquipmentSlot = 'weapon' | 'robe' | 'charm';
export type Stats = {
  maxHealth:number; maxChi:number; lightDamage:number; heavyDamage:number;
  chiDamage:number; armor:number; chiRegen:number; dashCost:number;
};
export type ItemId = keyof typeof equipment;
export type Item = {
  name:string;slot:EquipmentSlot;rarity:'common'|'fine'|'legendary';
  description:string;bonus:Partial<Stats>;color:string;
};
export const equipment = {
  'traveler-blade':{name:'Traveler’s Jian',slot:'weapon',rarity:'common',description:'A plain blade. An unbroken promise.',bonus:{},color:'#e4e9ce'},
  'travel-robes':{name:'Wanderer’s Robes',slot:'robe',rarity:'common',description:'Light cloth, weathered by the mountain road.',bonus:{},color:'#e2e4c8'},
  'red-thread':{name:'Red Thread',slot:'charm',rarity:'common',description:'A reminder of the home you left behind.',bonus:{},color:'#c5745d'},
  'river-jian':{name:'Riversteel Jian',slot:'weapon',rarity:'fine',description:'A tempered edge taken from a fallen swordsman.',bonus:{lightDamage:4,heavyDamage:7},color:'#b8e0dc'},
  'reed-cloak':{name:'Reedwoven Cloak',slot:'robe',rarity:'fine',description:'Layered reeds soften the sting of a strike.',bonus:{maxHealth:18,armor:2},color:'#a6c5ac'},
  'wind-knot':{name:'Wind Knot',slot:'charm',rarity:'fine',description:'A silk knot that carries the breath of the pass.',bonus:{chiRegen:.7,dashCost:-3},color:'#9bd7c1'},
  'moon-jian':{name:'Moonkeeper’s Jian',slot:'weapon',rarity:'legendary',description:'The Keeper’s blade, awakened by the mountain bell.',bonus:{lightDamage:7,heavyDamage:12,chiDamage:3},color:'#f3dfaa'},
  'iron-brocade':{name:'Iron Brocade',slot:'robe',rarity:'fine',description:'Temple silk stitched around thin iron scales.',bonus:{maxHealth:32,armor:4},color:'#c29577'},
  'ember-bead':{name:'Ember Bead',slot:'charm',rarity:'fine',description:'A warm bead holding the acolytes’ inner fire.',bonus:{maxChi:18,chiDamage:7},color:'#ecb06e'},
  'jade-pendant':{name:'Jade Pendant',slot:'charm',rarity:'fine',description:'The hidden seal becomes a well of inner power.',bonus:{maxChi:24,chiRegen:.5},color:'#b4dab4'},
  'ashen-jian':{name:'Oath of Embers',slot:'weapon',rarity:'legendary',description:'The Abbot’s final gift: a blade for the road ahead.',bonus:{lightDamage:10,heavyDamage:16,chiDamage:8},color:'#ffc391'},
} as const satisfies Record<string,Item>;
export const slots:EquipmentSlot[]=['weapon','robe','charm'];
export const statNames:Record<keyof Stats,string>={maxHealth:'Max health',maxChi:'Max chi',lightDamage:'Light damage',heavyDamage:'Heavy damage',chiDamage:'Chi damage',armor:'Armor',chiRegen:'Chi / second',dashCost:'Dash chi cost'};
export const MAX_LEVEL=8;
export const xpRequired=(level:number)=>80+(level-1)*40;
export const enemyRewards:Record<EnemyKind,{xp:number;drop:ItemId}>={
 swordsman:{xp:30,drop:'river-jian'},archer:{xp:25,drop:'reed-cloak'},shade:{xp:35,drop:'wind-knot'},
 spear:{xp:45,drop:'iron-brocade'},acolyte:{xp:40,drop:'ember-bead'},boss:{xp:150,drop:'moon-jian'},abbot:{xp:240,drop:'ashen-jian'},
};
export class Progression {
 level=1;xp=0;totalXP=0;kills=0;
 inventory=new Set<ItemId>(['traveler-blade','travel-robes','red-thread']);
 equipped:Record<EquipmentSlot,ItemId>={weapon:'traveler-blade',robe:'travel-robes',charm:'red-thread'};
 get nextXP(){return xpRequired(this.level);}
 get rank(){return this.level<3?'Wayfarer':this.level<5?'Disciple':this.level<7?'Sword Adept':'Jianghu Master';}
 get stats():Stats{
  const growth=this.level-1;
  const result:Stats={maxHealth:100+growth*12,maxChi:100+growth*8,lightDamage:18+growth*2,heavyDamage:34+growth*3,chiDamage:38+growth*3,armor:0,chiRegen:4+growth*.3,dashCost:12};
  for(const slot of slots)for(const [stat,bonus] of Object.entries(equipment[this.equipped[slot]].bonus))result[stat as keyof Stats]+=bonus;
  result.chiRegen=Math.round(result.chiRegen*10)/10;
  return result;
 }
 get appearance(){return {robe:equipment[this.equipped.robe].color,blade:equipment[this.equipped.weapon].color,charm:equipment[this.equipped.charm].color};}
 gainXP(amount:number){
  if(!Number.isFinite(amount)||amount<=0)return 0;
  this.totalXP+=amount;this.xp+=amount;let gained=0;
  while(this.level<MAX_LEVEL&&this.xp>=this.nextXP){this.xp-=this.nextXP;this.level++;gained++;}
  if(this.level===MAX_LEVEL)this.xp=0;
  return gained;
 }
 discover(id:ItemId){if(this.inventory.has(id))return false;this.inventory.add(id);return true;}
 reward(kind:EnemyKind){const reward=enemyRewards[kind];this.kills++;const levels=this.gainXP(reward.xp);const drop=this.discover(reward.drop)?reward.drop:null;return {xp:reward.xp,levels,drop};}
 equip(id:ItemId){if(!this.inventory.has(id)||this.equipped[equipment[id].slot]===id)return false;this.equipped[equipment[id].slot]=id;return true;}
}
export function itemBonuses(item:Item){const values=Object.entries(item.bonus);return values.length?values.map(([key,value])=>`${value>0?'+':''}${value} ${statNames[key as keyof Stats].toLowerCase()}`).join(' · '):'Starting equipment';}
