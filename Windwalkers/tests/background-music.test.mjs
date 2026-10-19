import test from 'node:test';
import assert from 'node:assert/strict';
import {createBackgroundMusic} from '../background-music.js';
function setup(){
 let timers=0,cleared=0,notes=0,stops=0;const saved=new Map(),button={dataset:{},setAttribute(){}};
 class AudioContext{
  state='suspended';currentTime=0;destination={};
  async resume(){await Promise.resolve();this.state='running';this.currentTime=4}
  createGain(){return {gain:{setValueAtTime(){},exponentialRampToValueAtTime(){}},connect(){},disconnect(){}}}
  createOscillator(){return {frequency:{},connect(){},disconnect(){},start(at){assert.ok(at>4);notes++},stop(){stops++}}}
 }
 const host={AudioContext,localStorage:{getItem:k=>saved.get(k),setItem:(k,v)=>saved.set(k,v)},document:{addEventListener(){},removeEventListener(){}},setInterval(){timers++;return timers},clearInterval(){cleared++}};
 return {host,button,saved,get timers(){return timers},get cleared(){return cleared},get notes(){return notes},get stops(){return stops}};
}
test('Music starts after audio resumes, avoids duplicate loops and saves controls',async()=>{
 const s=setup(),music=createBackgroundMusic(s.host,s.button);assert.equal(await music.play(),true);assert.ok(s.notes>0);assert.equal(s.button.dataset.state,'playing');
 await music.play();assert.equal(s.timers,1);music.setVolume(.7);assert.equal(JSON.parse(s.saved.get('windwalkers-music')).volume,.7);
 music.pause();assert.equal(s.cleared,1);assert.equal(s.button.dataset.state,'paused');assert.equal(JSON.parse(s.saved.get('windwalkers-music')).enabled,false);
 const restored=createBackgroundMusic(s.host,s.button);assert.equal(restored.enabled,false);assert.equal(restored.volume,.7);
});
test('Pausing during audio startup prevents late playback',async()=>{
 const s=setup(),music=createBackgroundMusic(s.host,s.button),pending=music.play();music.pause();assert.equal(await pending,false);assert.equal(s.timers,0);assert.equal(s.notes,0);
});
