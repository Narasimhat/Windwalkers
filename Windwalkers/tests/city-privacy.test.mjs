import test from 'node:test';
import assert from 'node:assert/strict';
import {hasWitness,segmentCrossesRect} from '../city-privacy.js';
test('Witnesses require range and an unobstructed sight line',()=>{
 const p={x:0,z:0},screen={x:3,z:0,w:1,d:4};
 assert.equal(hasWitness(p,[{x:6,z:0}],[]),true);
 assert.equal(hasWitness(p,[{x:16,z:0}],[]),false);
 assert.equal(hasWitness(p,[{x:6,z:0}],[screen]),false);
 assert.equal(hasWitness(p,[{x:6,z:0},{x:-6,z:0}],[screen]),true);
 assert.equal(segmentCrossesRect(p,{x:6,z:6},screen),false);
 assert.equal(segmentCrossesRect(p,{x:6,z:0},screen),true);
});
