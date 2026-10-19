import test from 'node:test';
import assert from 'node:assert/strict';
import {createBellAudio} from '../bell-audio.js';
test('Bell waits for suspended audio to resume before scheduling and respects mute',async()=>{
 const notes=[],statuses=[];let resumes=0;
 class AudioContext{
  state='suspended';currentTime=0;destination={};
  async resume(){resumes++;await Promise.resolve();this.state='running';this.currentTime=9}
  createOscillator(){return {frequency:{},connect(){},disconnect(){},start(at){notes.push(at)},stop(){}}}
  createGain(){return {gain:{setValueAtTime(){},exponentialRampToValueAtTime(){}},connect(){},disconnect(){}}}
 }
 const audio=createBellAudio({AudioContext},s=>statuses.push(s));
 assert.equal(await audio.ring(),true);assert.equal(resumes,1);assert.equal(notes.length,6);assert.ok(notes.every(at=>at>9));
 audio.setMuted(true);assert.equal(await audio.ring(),false);assert.equal(notes.length,6);
 audio.setMuted(false);assert.equal(await audio.ring(),true);assert.equal(resumes,1);assert.equal(notes.length,12);
 assert.match(statuses.at(-1),/sound played/);
});
test('Unavailable or rejected audio gives feedback instead of failing silently',async()=>{
 let status='';const unsupported=createBellAudio({},s=>status=s);assert.equal(await unsupported.ring(),false);assert.match(status,/unavailable/);
 const blocked=createBellAudio({AudioContext:class{state='suspended';resume(){return Promise.reject(new Error('blocked'))}}},s=>status=s);
 assert.equal(await blocked.ring(),false);assert.match(status,/could not start/);
});
