export const WORLD_WIDTH = 4800;
export const GRAVITY = 1650;
export type Rect = { x: number; y: number; w: number; h: number };
export const platforms: Rect[] = [
  {x:0,y:480,w:780,h:150},{x:920,y:480,w:620,h:150},
  {x:1660,y:480,w:870,h:150},{x:2680,y:480,w:2120,h:150},
  {x:550,y:380,w:170,h:20},{x:800,y:310,w:140,h:20},
  {x:1080,y:350,w:170,h:20},{x:1350,y:285,w:180,h:20},
  {x:1570,y:365,w:150,h:20},{x:1860,y:370,w:170,h:20},
  {x:2110,y:300,w:150,h:20},{x:2350,y:375,w:150,h:20},
  {x:2550,y:320,w:170,h:20},{x:2920,y:370,w:180,h:20},
];
export const overlaps = (a: Rect,b: Rect) => a.x < b.x+b.w && a.x+a.w > b.x && a.y < b.y+b.h && a.y+a.h > b.y;
export const clamp = (n:number,min:number,max:number) => Math.max(min,Math.min(max,n));
export function moveBody(body: Rect & {vx:number;vy:number;grounded:boolean},dt:number,surfaces:Rect[]=platforms,width=WORLD_WIDTH) {
  body.x = clamp(body.x + body.vx*dt, 0, width-body.w);
  const oldBottom = body.y+body.h;
  body.vy += GRAVITY*dt;
  body.y += body.vy*dt;
  body.grounded = false;
  for (const p of surfaces) {
    if (body.vy >= 0 && oldBottom <= p.y+1 && body.y+body.h >= p.y && body.x+body.w>p.x && body.x<p.x+p.w) {
      body.y=p.y-body.h; body.vy=0; body.grounded=true;
    }
  }
}
