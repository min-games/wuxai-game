import {test} from 'node:test';
import assert from 'node:assert/strict';
import {moveBody, overlaps, WORLD_WIDTH} from '../src/world';
test('falling player lands exactly on path without tunneling',()=>{const p={x:100,y:390,w:26,h:54,vx:0,vy:700,grounded:false};moveBody(p,.1);assert.equal(p.y,426);assert.equal(p.vy,0);assert.equal(p.grounded,true);});
test('platforms permit jumping upward through them',()=>{const p={x:600,y:385,w:26,h:54,vx:0,vy:-600,grounded:false};moveBody(p,.05);assert.ok(p.y<385);assert.equal(p.grounded,false);});
test('gaps remain fall-through and world edges clamp movement',()=>{const p={x:850,y:426,w:26,h:54,vx:0,vy:30,grounded:false};moveBody(p,.1);assert.ok(p.y>426);assert.equal(p.grounded,false);p.x=WORLD_WIDTH-10;p.vx=500;moveBody(p,.1);assert.equal(p.x,WORLD_WIDTH-p.w);});
test('hitboxes require intersection, not contact',()=>{assert.equal(overlaps({x:0,y:0,w:10,h:10},{x:10,y:0,w:10,h:10}),false);assert.equal(overlaps({x:0,y:0,w:10,h:10},{x:9,y:9,w:10,h:10}),true);});
