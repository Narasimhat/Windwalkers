// Optional DOM integration check: install jsdom outside the game, then set NODE_PATH.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {createRequire} from 'node:module';
import {createRealModels} from '../real-models.js';
import {characterIdentity} from '../character-identity.js';
import {createHutVillage} from '../hut-village.js';
import {createStable} from '../stable.js';
import {createGarden} from '../garden.js';
import {createDayNight} from '../day-night.js';
import {createTreeHouse} from '../tree-house.js';
import {createBackgroundMusic} from '../background-music.js';
import * as RealThree from '../three.module.js';
import {restoreLearning,taskFor,subjects,review} from '../learning.js';
import {createRecreation} from '../recreation.js';
import {createCityTrip} from '../city-trip.js';
import {createSchoolLife} from '../school-life.js';
import {createCustomization} from '../customization.js';
import {createLearningUI} from '../learning-ui.js';
const {JSDOM}=createRequire(import.meta.url)('jsdom');
const html=fs.readFileSync(new URL('../index.html',import.meta.url),'utf8');
const source=fs.readFileSync(new URL('../game.js',import.meta.url),'utf8').replace(/^import .*;$/gm,'');
function boot(saved){
  const dom=new JSDOM(html,{url:'http://localhost:8000'}),{window}=dom;
  window.HTMLCanvasElement.prototype.getContext=()=>new Proxy({},{get:(o,k)=>o[k]??(()=>{})});
  globalThis.document=window.document;globalThis.window=window;
  if(saved)window.localStorage.setItem('windwalkers-3d',saved);
  const THREE={...RealThree,WebGLRenderer:class{constructor(){this.domElement=document.createElement('canvas');this.shadowMap={}}setPixelRatio(){}setSize(){}render(){}}};
  const context=vm.createContext({THREE,createRealModels,characterIdentity,createHutVillage,createStable,createGarden,createDayNight,createTreeHouse,createBackgroundMusic,restoreLearning,createLearningUI,createCustomization,createSchoolLife,createCityTrip,createRecreation,document:window.document,window,localStorage:window.localStorage,devicePixelRatio:1,innerWidth:1200,innerHeight:800,performance:{now:()=>0},requestAnimationFrame:()=>{}});
  vm.runInContext(source+'\nglobalThis.game={village,stable,garden:schoolGarden,dayNight,campusPeople,scene,sun,ambient,progress,learning,custom,treeHouse,humanBody,classTargets,schoolLife,cityTrip,recreation,cafeteriaTray,classroom,wolfBody,birdBody,doJump,exteriorDecorate,talk,clue,legacyLessonMenu,wardInteract,decorate,enter,setForm,update,held,pos,show,close,outTargets,schoolTargets};',context);
  const $=id=>window.document.getElementById(id),click=id=>{assert.ok($(id),`Missing #${id}`);$(id).click()};
  return {dom,window,game:context.game,$,click};
}
for(let level=0;level<3;level++)test(`DOM + real Three scene: full case at ${level}`,()=>{
  let b=boot();const {game,$,click}=b;
  assert.match($('card').textContent,/Welcome, Windwalker/);
  $('card').querySelector('[data-choice="1"]').click();
  game.learning.notebook();
  $('caseNotes').value='<img src=x onerror=alert(1)> I will check the channel.';$('caseNotes').dispatchEvent(new b.window.Event('input'));
  click('levelBtn');
  for(const select of $('card').querySelectorAll('[data-level]')){select.value=String(level);select.dispatchEvent(new b.window.Event('change'))}
  click('settingsDone');assert.equal($('caseNotes').value,game.progress.learning.notes);assert.equal($('caseNotes').querySelector('img'),null);
  game.learning.mission();
  while(game.progress.learning.stage<6){
    const stage=game.progress.learning.stage;
    if(stage===1){
      $('testVariable').value='volume';click('runTest');assert.match($('testFeedback').textContent,/Two things/);assert.equal($('testResult').textContent,'');
      $('testVariable').value='sample';$('testPrediction').value='same';click('runTest');assert.match($('testFeedback').textContent,/differed/);assert.match($('testResult').textContent,/18 mg/);click('interpretTest');
    }
    const q=taskFor(game.progress.learning);
    click('caseHint');assert.ok($('hintText').textContent);
    $('card').querySelector(`[data-case-answer="${(q.answer+1)%3}"]`).click();assert.equal(game.progress.learning.stage,stage);
    $('card').querySelector(`[data-case-answer="${q.answer}"]`).click();assert.equal(game.progress.learning.stage,stage+1);
    assert.equal(game.progress.learning.records[stage].attempts,2);
    click('caseNextBtn');
  }
  assert.match($('card').textContent,/CASE COMPLETE/);
  game.exteriorDecorate();assert.ok($('card').querySelector('[data-value="stones"]'));
  $('card').querySelector('[data-value="stones"]').click();assert.equal(game.progress.decor,'stones');
  game.learning.notebook();click('reviewBtn');$('card').querySelector(`[data-case-answer="${review.answer}"]`).click();assert.equal(game.progress.learning.reviewDone,true);
  const saved=b.window.localStorage.getItem('windwalkers-3d');
  b=boot(saved);assert.equal(b.game.progress.learning.stage,6);assert.equal(b.game.progress.learning.reviewDone,true);assert.equal(b.game.progress.decor,'stones');
  b.game.learning.notebook();assert.match(b.$('caseNotes').value,/check the channel/);
  for(const subject of subjects){b.game.learning.practice(subject);const q=taskFor(b.game.progress.learning,{Science:1,Mathematics:2,Latin:3,French:4}[subject]);b.$('card').querySelector(`[data-case-answer="${q.answer}"]`).click();assert.ok(b.$('caseNextBtn'));assert.equal(b.game.progress.learning.stage,6)}
  assert.equal(b.game.outTargets.some(t=>t.title.includes('Silent Stream')),true);
  assert.equal(b.game.schoolTargets.some(t=>t.title.includes('Latin')),true);
});
test('Original chapter remains completable; movement, interiors and forms initialize',()=>{
  const {game,$,click}=boot();$('card').querySelector('[data-choice="1"]').click();
  game.held.add('forward');const z=game.pos.z;game.update(.05);assert.ok(game.pos.z<z);game.held.clear();
  game.setForm('wolf');game.setForm('bird');game.enter('school');game.enter('hut');game.enter('forest');
  game.talk('rowan');['satchel','ledger','note'].forEach(id=>game.clue(id));
  const answers={Mathematics:[1,0,2],'Forest Science':[0,1,2],Languages:[0,0,2]};
  for(const [subject,list] of Object.entries(answers)){
    game.legacyLessonMenu(subject);$('card').querySelector('[data-choice]').click();
    for(const answer of list){$('card').querySelector(`[data-answer="${answer}"]`).click();$('card').querySelector('.primary').click()}
  }
  assert.equal(game.progress.lessons.length,3);game.talk('rowan');assert.equal(game.progress.authorized,true);game.wardInteract();assert.equal(game.progress.savedSchool,true);
  game.learning.notebook();click('originalCase');assert.match($('card').textContent,/The school is protected/);
});

test('Avatar, animal training and movable study furniture persist',()=>{
  const b=boot(),{game,$,click}=b;
  game.custom.creator(true);
  $('hairLength').value='long';$('hairLength').dispatchEvent(new b.window.Event('change'));
  $('groundAnimal').value='Fox';$('groundAnimal').dispatchEvent(new b.window.Event('change'));
  $('birdAnimal').value='Owl';$('birdAnimal').dispatchEvent(new b.window.Event('change'));
  click('avatarDone');assert.equal(game.progress.character.ground,'Fox');assert.equal(game.progress.character.bird,'Owl');
  game.custom.roomEditor();$('card').querySelector('[data-cell="-2,0"]').click();assert.equal(game.progress.furniture.length,2);
  $('bookSubject').value='Latin';$('bookSubject').dispatchEvent(new b.window.Event('change'));
  click('rotatePiece');$('card').querySelector('[data-cell="-1,1"]').click();
  assert.equal(game.progress.furniture.find(f=>f.type==='desk').x,-1);assert.equal(game.progress.furniture.find(f=>f.type==='desk').rotation,1);
  click('roomDone');assert.ok(game.outTargets.find(t=>t.title.includes('sand pit')));
  game.custom.lessonTraining();for(const a of [0,1,0,2,1]){$('card').querySelector(`[data-training="${a}"]`).click();click('nextTraining')}
  assert.equal(game.progress.trainingComplete,true);
  const resumed=boot(b.window.localStorage.getItem('windwalkers-3d'));
  assert.equal(resumed.game.progress.character.hair,'long');assert.equal(resumed.game.progress.furniture.find(f=>f.type==='desk').subject,'Latin');
  resumed.game.custom.roomEditor();resumed.$('card').querySelector('[data-cell="-1,1"]').click();resumed.click('removePiece');assert.equal(resumed.game.progress.furniture.length,1);
});

test('Species have distinct silhouettes; practical sand-pit training completes through real controls',()=>{
 const b=boot(),{game,$,click}=b;
 const signatures=[];
 for(const species of ['Wolf','Fox','Cat','Bear']){
   game.progress.character.ground=species;game.custom.appearance();
   const bounds=new RealThree.Box3().setFromObject(game.wolfBody).getSize(new RealThree.Vector3());
   signatures.push(bounds.toArray().map(n=>n.toFixed(2)).join(','));
 }
 assert.equal(new Set(signatures).size,4);
 const birdShapes=[];
 for(const species of ['Blue jay','Owl','Raven','Eagle']){
   game.progress.character.bird=species;game.custom.appearance();
   const bounds=new RealThree.Box3().setFromObject(game.birdBody).getSize(new RealThree.Vector3());birdShapes.push(bounds.toArray().map(n=>n.toFixed(2)).join(','));
 }
 assert.equal(new Set(birdShapes).size,4);
 const pit=game.outTargets.find(t=>t.title==='Train in the sand pit');assert.equal(pit.x,-10);assert.equal(pit.z,22);assert.ok(pit.r>=7);
 game.custom.startPractical();assert.equal($('trainingHud').hidden,false);game.setForm('wolf');game.update(.05);click('dodgeTraining');
 game.pos.set(-10,0,23);click('attackTraining');game.setForm('bird');game.update(.05);game.doJump();
 for(let i=0;i<200;i++)game.update(.05);
 assert.equal(game.progress.trainingComplete,true);assert.match($('card').textContent,/PRACTICE COMPLETE/);assert.equal($('trainingHud').hidden,true);
});

test('Pupils roam, class bell advances, and a classroom transforms together',()=>{
 const b=boot(),{game,$,click}=b;
 $('card').querySelector('[data-choice="1"]').click();
 const pupil=game.schoolLife.actors[0],z=pupil.root.position.z;
 for(let i=0;i<20;i++)game.update(.05);
 assert.notEqual(pupil.root.position.z,z);
 assert.equal(pupil.interaction.z,pupil.root.position.z);
 const before=game.schoolLife.period;game.schoolLife.bell();assert.equal(game.schoolLife.period,(before+1)%9);assert.match($('classStatus').textContent,/Biology/);
 game.schoolLife.classes();$('card').querySelector('[data-choice="4"]').click();
 assert.equal(game.schoolLife.subject,'Transformation');
 const group=game.schoolLife.actors.filter(a=>a.parent!==pupil.parent);assert.equal(group.length,7);assert.ok(group.some(a=>a.teacher));
 game.setForm('wolf');game.update(.05);assert.ok(group.every(a=>a.form==='wolf'&&a.ground.visible&&!a.person.visible));
 game.setForm('bird');game.update(.05);assert.ok(group.every(a=>a.form==='bird'&&a.bird.visible));
 game.setForm('human');game.update(.05);assert.ok(group.every(a=>a.person.visible&&!a.bird.visible));
 game.schoolLife.classes();$('card').querySelector('[data-choice="0"]').click();assert.equal(game.schoolLife.subject,'Mathematics');
 assert.equal(game.schoolLife.actors.filter(a=>a.teacher).length,1);
});

test('Cafeteria has plants, seated pupils, food and drink, and a working exit',()=>{
 const b=boot(),{game,$}=b;
 $('card').querySelector('[data-choice="1"]').click();game.schoolLife.classes();
 const visit=[...$('card').querySelectorAll('[data-choice]')].find(b=>b.textContent.includes('Visit the cafeteria'));visit.click();
 assert.equal(game.schoolLife.subject,'Cafeteria');
 assert.equal(game.classroom.children.filter(m=>m.userData.plant).length,14);
 assert.equal(game.schoolLife.actors.filter(a=>a.seated).length,6);
 game.schoolLife.cafeteriaMenu();$('card').querySelector('[data-choice="0"]').click();$('card').querySelector('[data-choice="3"]').click();
 $('card').querySelector('[data-choice="6"]').click();assert.equal(game.cafeteriaTray.visible,true);assert.equal(game.pos.z,3.8);
 const diner=game.schoolLife.actors.find(a=>a.name==='Leo'&&a.seated);assert.notEqual(diner.root.position.z,game.pos.z);
 game.held.add('forward');game.update(.05);game.held.clear();assert.equal(game.cafeteriaTray.visible,false);
 game.enter('school');assert.equal(game.classroom.visible,false);
 game.schoolLife.classes();$('card').querySelector('[data-choice="0"]').click();assert.equal(game.schoolLife.actors.some(a=>a.seated),false);
});

test('City requires a playable car journey, has crowds and traffic, and allows return by car',()=>{
 const b=boot(),{game,$}=b;
 $('card').querySelector('[data-choice="1"]').click();game.cityTrip.menu();$('card').querySelector('[data-choice="0"]').click();
 assert.equal(game.cityTrip.road.visible,true);assert.equal(game.cityTrip.city.visible,false);
 const start=game.pos.z;game.update(.05);assert.equal(game.pos.z,start);
 game.held.add('forward');for(let i=0;i<1000;i++)game.update(.05);game.held.clear();
 assert.equal(game.cityTrip.city.visible,true);assert.equal(game.cityTrip.road.visible,false);assert.equal(game.cityTrip.pedestrians.length,32);assert.equal(game.cityTrip.traffic.length,11);
 assert.ok(game.cityTrip.blocked(-15,10));assert.equal(game.cityTrip.blocked(-6,10),false);
 const pedestrian=game.cityTrip.pedestrians[0].mesh.position.z;game.update(.05);assert.notEqual(game.cityTrip.pedestrians[0].mesh.position.z,pedestrian);
 game.cityTrip.menu();$('card').querySelector('[data-choice="0"]').click();game.held.add('forward');for(let i=0;i<1000;i++)game.update(.05);game.held.clear();
 assert.equal(game.cityTrip.city.visible,false);assert.equal(game.cityTrip.road.visible,false);assert.match($('location').textContent,/Redcliff/);
});

test('City identity stays secret: visible transformations blocked, booth changes allowed, car needs human form',()=>{
 const b=boot(),{game,$}=b;$('card').querySelector('[data-choice="1"]').click();game.cityTrip.start();game.held.add('forward');
 for(let i=0;i<1000;i++)game.update(.05);game.held.clear();
 const witness=game.cityTrip.pedestrians[0];witness.mesh.position.set(-6,0,22);game.pos.set(-6,0,22);
 game.setForm('wolf');assert.equal(game.wolfBody.visible,false);assert.match($('toast').textContent,/identity secret/);
 game.pos.set(9,0,-8);game.setForm('wolf');assert.equal(game.wolfBody.visible,true);
 game.pos.set(-6,0,22);game.setForm('human');assert.equal(game.wolfBody.visible,true);
 game.cityTrip.start('forest');assert.equal(game.cityTrip.road.visible,false);assert.match($('toast').textContent,/inside a private booth/);
 game.pos.set(9,0,-8);game.setForm('human');assert.equal(game.wolfBody.visible,false);
 game.cityTrip.start('forest');assert.equal(game.cityTrip.road.visible,true);
});

test('Grocery store supports shelves, budgeted checkout, saved purchases, privacy and exit',()=>{
 const b=boot(),{game,$}=b;$('card').querySelector('[data-choice="1"]').click();game.cityTrip.start();game.held.add('forward');
 for(let i=0;i<1000;i++)game.update(.05);game.held.clear();
 game.cityTrip.targets.find(t=>t.title==='Enter Bay Basket grocery store').fn();assert.equal(game.cityTrip.store.root.visible,true);assert.equal(game.cityTrip.city.visible,false);
 assert.ok(game.cityTrip.store.blocked(-6,-4));assert.equal(game.cityTrip.store.blocked(0,3),false);
 game.setForm('wolf');assert.equal(game.wolfBody.visible,false);assert.match($('toast').textContent,/cashier/);
 game.cityTrip.store.checkout();$('card').querySelector('[data-choice="0"]').click();assert.equal(game.progress.shopping.coins,30);
 game.cityTrip.store.browse('apple');for(let i=0;i<2;i++)$('card').querySelector('[data-choice="0"]').click();
 game.cityTrip.store.browse('water');$('card').querySelector('[data-choice="0"]').click();game.cityTrip.store.checkout();$('card').querySelector('[data-choice="0"]').click();
 assert.equal(game.progress.shopping.coins,25);assert.equal(game.progress.shopping.items.apple,2);assert.equal(game.progress.shopping.items.water,1);
 const saved=b.window.localStorage.getItem('windwalkers-3d');
 for(const id of ['rice','milk']){game.cityTrip.store.browse(id);for(let i=0;i<5;i++)$('card').querySelector('[data-choice="0"]').click()}
 game.cityTrip.store.checkout();$('card').querySelector('[data-choice="0"]').click();assert.equal(game.progress.shopping.coins,25);assert.match($('toast').textContent,/more than you have/);
 game.cityTrip.store.targets.find(t=>t.title==='Leave grocery store').fn();assert.equal(game.cityTrip.store.root.visible,false);assert.equal(game.cityTrip.city.visible,true);
 const resumed=boot(saved);assert.equal(resumed.game.progress.shopping.coins,25);assert.equal(resumed.game.progress.shopping.items.apple,2);
});

test('Requested teacher roster appears in every classroom and teaches without errors',()=>{
 const b=boot(),{game,$}=b;
 const expected={French:'Madame Wenzel',Latin:'Miss Hilllbrecht',German:'Mister Hutter',Biology:'Miss Machanda',History:'Mister Hutter',Art:'Miss Krieg',Sport:'Frau Janz',Transformation:'Miss Janz'};
 for(const [subject,name] of Object.entries(expected)){
  game.schoolLife.classes();const button=[...$('card').querySelectorAll('[data-choice]')].find(b=>b.textContent.includes(subject+' classroom'));assert.ok(button.textContent.includes(name));button.click();
  const teacher=game.schoolLife.actors.find(a=>a.teacher);assert.equal(teacher.name,name);teacher.interaction.fn();assert.ok($('card').textContent.length>20);
 }
});

test('Playground rides and pool swimming have working entry, controls and exits',()=>{
 const b=boot(),{game,$}=b;$('card').querySelector('[data-choice="1"]').click();
 game.recreation.begin('swim');assert.equal(game.recreation.swimming,true);assert.equal($('recreationHud').hidden,false);
 const x=game.pos.x;game.held.add('right');for(let i=0;i<10;i++)game.update(.05);game.held.clear();assert.ok(game.pos.x>x);assert.ok(game.recreation.blocks(60,22));
 game.recreation.stop();assert.equal(game.pos.x,24);assert.equal(game.recreation.mode,null);assert.equal($('recreationHud').hidden,true);
 game.recreation.begin('swing');assert.ok(game.recreation.locksMovement);game.update(.05);assert.equal(game.pos.x,30);game.recreation.stop();
 game.recreation.begin('slide');for(let i=0;i<60;i++)game.update(.05);assert.equal(game.recreation.mode,null);assert.equal(game.pos.z,3);
 game.recreation.begin('roundabout');game.update(.05);assert.ok(game.recreation.locksMovement);game.enter('school');assert.equal(game.recreation.mode,null);assert.equal(game.pos.x,0);
 game.recreation.begin('swim');game.setForm('bird');assert.equal(game.recreation.mode,null);assert.equal(game.pos.x,24);assert.equal(game.birdBody.visible,true);
});

test('Shared hut has two distinct roommates, three bedrooms, and a persistent bed/desk/shelf planner',()=>{
 const b=boot(),{game,$}=b;$('card').querySelector('[data-choice="1"]').click();
 const hut=game.custom.hutLayout;assert.equal(hut.residents.length,2);assert.notEqual(game.progress.roommate,game.progress.roommate2);
 game.enter('hut');hut.gather();assert.ok(hut.residents.every(r=>r.root.position.z===7));
 hut.visitRoom(1);assert.equal(hut.residents[0].root.position.z,-7);assert.equal(game.pos.z,-1.5);
 hut.visitRoom(2);assert.equal(hut.residents[1].root.position.x,9);hut.visitRoom(0);assert.equal(game.pos.x,-9);
 game.custom.roomEditor();$('card').querySelector('[data-cell="-3,-3"]').click();$('card').querySelector('[data-cell="-2,-3"]').click();assert.equal(game.progress.furniture.find(f=>f.type==='bed').x,-2);
 $('rotatePiece').click();assert.equal(game.progress.furniture.find(f=>f.type==='bed').rotation,1);
 $('furnitureType').value='desk';$('furnitureType').dispatchEvent(new b.window.Event('change'));$('card').querySelector('[data-cell="2,0"]').click();
 $('deskItem').value='books';$('deskItem').dispatchEvent(new b.window.Event('change'));assert.equal(game.progress.furniture.find(f=>f.type==='desk').deskItem,'books');
 $('furnitureType').value='shelf';$('furnitureType').dispatchEvent(new b.window.Event('change'));$('card').querySelector('[data-cell="3,-2"]').click();$('rotatePiece').click();assert.equal(game.progress.furniture.find(f=>f.type==='shelf').rotation,1);
 const saved=b.window.localStorage.getItem('windwalkers-3d'),resumed=boot(saved);assert.equal(resumed.game.progress.furniture.find(f=>f.type==='bed').x,-2);assert.equal(resumed.game.progress.furniture.find(f=>f.type==='desk').deskItem,'books');
});

test('Cosy decorations fill free spaces, preserve the layout and save colours without duplicate filling',()=>{
 const b=boot(),{game,$}=b;$('card').querySelector('[data-choice="1"]').click();game.custom.roomEditor();
 const original=game.progress.furniture.map(f=>({...f}));$('cosyRoom').click();
 for(const f of original){const after=game.progress.furniture.find(a=>a.id===f.id);assert.equal(after.x,f.x);assert.equal(after.z,f.z);assert.equal(after.rotation,f.rotation)}
 for(const type of ['lamp','plant','poster','wardrobe','nightstand','beanbag','clock','chest','guitar','roundrug','starrug'])assert.ok(game.progress.furniture.some(f=>f.type===type));
 const count=game.progress.furniture.length;$('cosyRoom').click();assert.equal(game.progress.furniture.length,count);
 const lamp=game.progress.furniture.find(f=>f.type==='lamp');$('card').querySelector(`[data-cell="${lamp.x},${lamp.z}"]`).click();
 $('furnitureColour').value='#aabbcc';$('furnitureColour').dispatchEvent(new b.window.Event('input'));assert.equal(lamp.color,'#aabbcc');
 const saved=b.window.localStorage.getItem('windwalkers-3d'),resumed=boot(saved);assert.equal(resumed.game.progress.furniture.find(f=>f.type==='lamp').color,'#aabbcc');assert.equal(resumed.game.progress.furniture.length,count);
});

test('Couches and moved beds support rest and getting up; roommates walk with their interaction targets',()=>{
 const b=boot(),{game,$}=b;$('card').querySelector('[data-choice="1"]').click();game.enter('hut');
 const resident=game.custom.hutLayout.residents[0],start=resident.root.position.clone();for(let i=0;i<70;i++)game.update(.05);
 assert.ok(resident.root.position.distanceTo(start)>.1);assert.equal(resident.interaction.x,resident.root.position.x);assert.equal(resident.interaction.z,resident.root.position.z);
 game.custom.hutLayout.menu();[...$('card').querySelectorAll('[data-choice]')].find(b=>b.textContent==='Sit on the couch').click();
 assert.equal($('restHud').hidden,false);assert.equal(game.pos.x,-4);assert.equal(game.humanBody.position.y,.45);$('getUpBtn').click();assert.equal($('restHud').hidden,true);assert.equal(game.humanBody.position.y,0);
 const bed=game.progress.furniture.find(f=>f.type==='bed');bed.x=2;bed.z=-3;bed.rotation=1;game.custom.roomEditor();$('roomDone').click();
 game.custom.hutLayout.menu();[...$('card').querySelectorAll('[data-choice]')].find(b=>b.textContent==='Lie in my bed').click();
 assert.equal(game.humanBody.rotation.x,Math.PI/2);assert.equal(game.pos.x,bed.x-9+1.5);assert.equal($('restHud').hidden,false);
 game.held.add('forward');game.update(.05);game.held.clear();assert.equal($('restHud').hidden,true);assert.equal(game.humanBody.rotation.x,0);assert.equal(game.humanBody.position.y,0);
 game.custom.hutLayout.menu();[...$('card').querySelectorAll('[data-choice]')].find(b=>b.textContent==='Lie in my bed').click();game.enter('school');assert.equal($('restHud').hidden,true);assert.equal(game.humanBody.rotation.x,0);
});

test('Every classroom has a player desk that supports sitting, study and standing',()=>{
 const b=boot(),{game,$}=b;$('card').querySelector('[data-choice="1"]').click();
 for(const name of ['Mathematics','Biology','Latin','French','Transformation','German','History','Art','Sport']){
  game.schoolLife.classes();[...$('card').querySelectorAll('[data-choice]')].find(b=>b.textContent.includes(name+' classroom')).click();
  const desk=game.classTargets.find(t=>t.title==='Sit at your classroom desk');assert.ok(desk);desk.fn();
  assert.equal(game.pos.x,-8);assert.equal(game.pos.z,8);assert.equal($('restHud').hidden,false);assert.equal(game.humanBody.position.y,-.1);
  $('deskLessonBtn').click();assert.equal($('modal').hidden,false);game.close();$('getUpBtn').click();assert.equal($('restHud').hidden,true);assert.equal(game.humanBody.position.y,0);
 }
});

test('Tree house requires real bird flight and includes a usable kitchen, library, bathroom and chill area',()=>{
 const b=boot(),{game,$}=b;$('card').querySelector('[data-choice="1"]').click();game.treeHouse.guide();
 assert.equal(game.treeHouse.enter(),false);game.setForm('bird');assert.equal(game.treeHouse.enter(),false);
 game.doJump();for(let i=0;i<12;i++)game.update(.05);game.doJump();for(let i=0;i<12;i++)game.update(.05);game.doJump();for(let i=0;i<12;i++)game.update(.05);
 const entrance=game.outTargets.find(t=>t.title==='Fly into the tree house');assert.equal(entrance.aerial,true);assert.equal(game.treeHouse.enter(),true);assert.equal(game.treeHouse.root.visible,true);
 const find=text=>game.treeHouse.targets.find(t=>t.title.includes(text));
 find('kitchen').fn();$('card').querySelector('[data-choice="0"]').click();assert.equal(game.treeHouse.snack.visible,true);
 find('bibliothèque').fn();$('card').querySelector('[data-choice="0"]').click();assert.match($('card').textContent,/SCIENCE/);game.close();
 find('Wash').fn();assert.match($('card').textContent,/shower, mirror and toilet/);game.close();
 find('chill').fn();assert.equal($('restHud').hidden,false);$('getUpBtn').click();assert.equal($('restHud').hidden,true);
 find('hammock 1').fn();assert.equal(game.humanBody.rotation.x,Math.PI/2);assert.match($('restHud').textContent,/hammock/);for(let i=0;i<20;i++)game.update(.05);assert.notEqual(game.treeHouse.hammocks[0].rotation.z,0);$('getUpBtn').click();assert.equal(game.humanBody.position.x,0);assert.equal(game.humanBody.rotation.x,0);
 find('Fly back').fn();assert.equal(game.treeHouse.root.visible,false);assert.equal(game.birdBody.visible,true);
});


test('Day and night changes the sky and lamps, pauses in menus and keeps interiors bright',()=>{
 const {game,$,click}=boot();
 $('card').querySelector('[data-choice="1"]').click();
 game.dayNight.setTime(1320);game.update(.05);
 assert.match($('timeBtn').textContent,/22:00 · Night/);
 assert.equal(game.dayNight.stars.visible,true);
 assert.ok(game.dayNight.lamps[0].light.intensity>6);
 const nightColor=game.scene.background.getHex();
 const before=game.dayNight.minutes;game.update(.05);assert.ok(game.dayNight.minutes>before);
 click('timeBtn');const frozen=game.dayNight.minutes;game.update(.05);assert.equal(game.dayNight.minutes,frozen);
 $('card').querySelector('[data-choice="0"]').click();game.update(.05);
 assert.match($('timeBtn').textContent,/08:00 · Morning/);
 assert.notEqual(game.scene.background.getHex(),nightColor);
 assert.equal(game.dayNight.stars.visible,false);
 game.dayNight.setTime(1320);game.enter('hut');game.update(.05);
 assert.ok(game.ambient.intensity>=2);assert.equal(game.dayNight.stars.visible,false);
 game.dayNight.setTime(1439.99);game.update(.05);assert.ok(game.dayNight.minutes<1);
 assert.equal(game.progress.worldMinutes,game.dayNight.minutes);
});


test('At night the campus empties, classmates sleep in their own beds and morning restores school life',()=>{
 const {game,$,click}=boot();$('card').querySelector('[data-choice="1"]').click();
 game.dayNight.setTime(1320);game.update(.05);
 assert.ok(game.campusPeople.every(p=>!p.root.visible&&p.sleeping));
 assert.ok(game.schoolLife.actors.every(a=>!a.root.visible&&a.sleeping));
 assert.ok(game.outTargets.filter(t=>t.title.startsWith('Talk to')).every(t=>t.enabled===false));
 const period=game.schoolLife.period;game.schoolLife.tick(95);assert.equal(game.schoolLife.period,period);
 assert.match($('classStatus').textContent,/asleep/);
 game.schoolLife.open('French');assert.ok(game.schoolLife.actors.every(a=>!a.root.visible));
 assert.equal(game.classTargets.find(t=>t.title==='Talk to Madame Wenzel').enabled,false);
 game.enter('hut');game.update(.05);
 for(const r of game.custom.hutLayout.residents){assert.equal(r.sleeping,true);assert.equal(r.root.rotation.x,Math.PI/2);assert.equal(r.root.position.z,-9);assert.equal(r.interaction.enabled,false)}
 const before=game.pos.clone();game.held.add('forward');game.update(.05);game.held.clear();assert.notEqual(game.pos.z,before.z);
 game.dayNight.setTime(480);game.update(.05);
 assert.ok(game.campusPeople.every(p=>p.root.visible&&!p.sleeping));
 assert.ok(game.schoolLife.actors.every(a=>a.root.visible&&!a.sleeping));
 for(const r of game.custom.hutLayout.residents){assert.equal(r.sleeping,false);assert.equal(r.root.rotation.x,0);assert.equal(r.interaction.enabled,true)}
 game.schoolLife.tick(91);assert.notEqual(game.schoolLife.period,period);
});


test('Principal office opens from the school hall, supports Rowan’s story and respects bedtime',()=>{
 const {game,$}=boot();$('card').querySelector('[data-choice="1"]').click();game.dayNight.setTime(480);game.enter('school');
 game.schoolTargets.find(t=>t.title==='Enter principal’s office').fn();assert.equal(game.schoolLife.subject,'Principal’s office');
 const rowan=game.schoolLife.actors.find(a=>a.name==='Headmistress Rowan');assert.ok(rowan.root.visible);
 const conversation=game.classTargets.find(t=>t.title==='Talk to Headmistress Rowan');conversation.fn();assert.ok(game.progress.met);assert.match($('card').textContent,/Rowan|SIERRA|Sierra/);game.close();
 game.update(.05);assert.equal(conversation.z,-3);
 for(const [x,z] of [[0,1],[7,-4],[-7,-4]]){game.pos.set(x,0,z);for(let i=0;i<30;i++)game.update(.05);const expected=Math.atan2(-x,-(z+7));assert.ok(Math.cos(rowan.root.rotation.y-expected)>.99);assert.equal(rowan.root.position.z,-7)}
 game.dayNight.setTime(1320);assert.equal(rowan.root.visible,false);assert.equal(conversation.enabled,false);
 game.classTargets.find(t=>t.title==='Leave principal’s office').fn();assert.match($('location').textContent,/Learning Hall/);
});


test('Garden offers flowers and distinct crops with harvest, regrowth and a saved basket',()=>{
 const {game,$,click,window}=boot();$('card').querySelector('[data-choice="1"]').click();click('gardenBtn');assert.match($('card').textContent,/Your basket/);$('card').querySelector('[data-choice="0"]').click();assert.equal(game.pos.x,32);
 assert.equal(game.garden.crops.length,6);
 game.outTargets.find(t=>t.title==='Pick carrots').fn();$('card').querySelector('[data-choice="0"]').click();assert.equal(game.progress.garden.basket.Carrots,1);assert.equal(game.garden.crops[0].g.visible,false);
 game.outTargets.find(t=>t.title==='Water the garden').fn();assert.equal(game.garden.crops[0].g.visible,true);assert.equal(game.progress.garden.picked.length,0);
 assert.equal(JSON.parse(window.localStorage.getItem('windwalkers-3d')).garden.basket.Carrots,1);
 game.outTargets.find(t=>t.title==='Learn about garden flowers').fn();assert.match($('card').textContent,/pollen/);
});


test('Stable care gates riding, supports movement and safely dismounts on form changes',()=>{
 const {game,$,click,window}=boot();$('card').querySelector('[data-choice="1"]').click();click('stableBtn');$('card').querySelector('[data-choice="0"]').click();
 const horse=game.stable.horses[0];assert.equal(game.stable.mount(horse),false);
 game.stable.careMenu(horse);for(const i of [0,1,2,3])$('card').querySelector(`[data-choice="${i}"]`).click();assert.equal(horse.saddle.visible,true);assert.equal(horse.dirt.visible,false);
 assert.equal(game.stable.mount(horse),true);game.update(.05);assert.equal(game.humanBody.position.y,1.2);
 const z=game.pos.z;game.held.add('forward');game.update(.05);game.held.clear();assert.ok(game.pos.z<z);assert.equal(horse.root.position.z,game.pos.z);
 game.setForm('bird');assert.equal(game.stable.riding,null);assert.equal(horse.root.position.x,horse.home.x);assert.equal(game.humanBody.position.y,0);
 assert.equal(JSON.parse(window.localStorage.getItem('windwalkers-3d')).horses.Maple.clean,true);
});


test('Friends walk home at 20:00 and visitors can enter three new huts and see sleeping residents',()=>{
 const {game,$}=boot();$('card').querySelector('[data-choice="1"]').click();game.dayNight.setTime(1200);game.update(.05);
 assert.equal(game.village.huts.length,3);assert.ok(game.village.walkers.some(w=>w.root.visible));
 const walker=game.village.walkers[0],start=walker.root.position.clone();game.dayNight.setTime(1230);game.update(.05);assert.ok(walker.root.position.distanceTo(start)>1);
 game.dayNight.setTime(1320);game.update(.05);assert.ok(game.village.walkers.every(w=>!w.root.visible&&w.arrived));
 for(let i=0;i<3;i++){game.village.visit(i);assert.equal(game.village.root.visible,true);assert.ok(game.village.residents.length>0);assert.ok(game.village.residents.every(r=>r.root.visible));game.village.targets.find(t=>t.title.startsWith('Leave')).fn();assert.equal(game.village.root.visible,false)}
 game.dayNight.setTime(480);game.update(.05);assert.ok(game.village.walkers.every(w=>!w.root.visible));
});


test('Named classmates have distinct, consistent faces, hairstyles and builds',()=>{
 const {game,$}=boot();$('card').querySelector('[data-choice="1"]').click();game.dayNight.setTime(480);
 const pupil=game.schoolLife.actors.find(a=>a.name==='Lina'),profile=pupil.person.userData.identity;
 assert.equal(profile.hair,'braid');const felix=game.schoolLife.actors.find(a=>a.name==='Felix');assert.notEqual(pupil.person.scale.y,felix.person.scale.y);assert.notEqual(profile.skin,felix.person.userData.identity.skin);
 game.schoolLife.open('French');const again=game.schoolLife.actors.find(a=>a.name==='Lina');assert.deepEqual(again.person.userData.identity,profile);
 game.village.visit(0);const resident=game.village.residents.find(r=>r.name==='Lina');assert.deepEqual(resident.root.userData.identity,profile);
});
