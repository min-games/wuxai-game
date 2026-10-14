import {platforms, type Rect} from './world';
import type {CharacterKind} from './character';
export type ChapterId = 1 | 2;
export type EnemyKind = Exclude<CharacterKind, 'player'>;
export type EnemySpawn = {x:number;floor:number;kind:EnemyKind};
export type Chapter = {
 id:ChapterId;roman:string;title:string;chinese:string;subtitle:string;intro:string;
 width:number;platforms:Rect[];enemies:EnemySpawn[];checkpoints:number[];
 seal:Rect;exit:number;boss:EnemyKind;bossName:string;hazards:Rect[];
};
export const chapters:Record<ChapterId,Chapter> = {
 1:{id:1,roman:'I',title:'The Silent Pass',chinese:'寂静山径',subtitle:'One blade. A broken oath.\nA mountain that remembers.',intro:'Cross the abandoned mountain pass, defeat the Keeper, and ring the bell to open the temple road.',width:4800,platforms,
 enemies:[{x:630,floor:480,kind:'swordsman'},{x:1130,floor:350,kind:'archer'},{x:1460,floor:480,kind:'shade'},{x:1940,floor:480,kind:'swordsman'},{x:2190,floor:300,kind:'archer'},{x:2790,floor:480,kind:'shade'},{x:3180,floor:480,kind:'swordsman'},{x:4070,floor:480,kind:'boss'}],
 checkpoints:[1810],seal:{x:1395,y:230,w:30,h:55},exit:4570,boss:'boss',bossName:'KEEPER OF THE BELL',hazards:[]},
 2:{id:2,roman:'II',title:'Temple of Embers',chinese:'余烬古殿',subtitle:'Beyond the bell, a hidden temple.\nAn oath beneath the ashes.',intro:'Enter the candlelit halls. Cross the incense furnaces, break the temple guard, and reclaim the oath from the Ashen Abbot.',width:5600,
 platforms:[{x:0,y:480,w:1000,h:150},{x:1120,y:480,w:930,h:150},{x:2220,y:480,w:930,h:150},{x:3280,y:480,w:2320,h:150},
 {x:460,y:375,w:180,h:22},{x:740,y:300,w:170,h:22},{x:1020,y:350,w:170,h:22},
 {x:1280,y:345,w:230,h:22},{x:1610,y:280,w:180,h:22},{x:1900,y:365,w:180,h:22},
 {x:2130,y:310,w:160,h:22},{x:2680,y:370,w:200,h:22},{x:2950,y:285,w:190,h:22},
 {x:3180,y:350,w:180,h:22},{x:3520,y:360,w:190,h:22}],
 enemies:[{x:530,floor:480,kind:'spear'},{x:800,floor:300,kind:'acolyte'},
 {x:1210,floor:480,kind:'shade'},{x:1530,floor:480,kind:'spear'},{x:1690,floor:280,kind:'acolyte'},
 {x:2340,floor:480,kind:'spear'},{x:2790,floor:370,kind:'archer'},{x:2980,floor:480,kind:'shade'},
 {x:3420,floor:480,kind:'spear'},{x:3590,floor:360,kind:'acolyte'},
 {x:3950,floor:480,kind:'swordsman'},{x:4740,floor:480,kind:'abbot'}],
 checkpoints:[2480,4170],seal:{x:3030,y:230,w:30,h:55},exit:5350,boss:'abbot',bossName:'THE ASHEN ABBOT',
 hazards:[{x:1390,y:432,w:85,h:48},{x:2760,y:432,w:85,h:48},{x:3670,y:432,w:85,h:48}]},
};
