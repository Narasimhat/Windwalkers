import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const base=new URL('../assets/models/',import.meta.url);
function readModel(name){
 const bytes=fs.readFileSync(new URL(name,base));
 if(name.endsWith('.gltf'))return JSON.parse(bytes.toString());
 assert.equal(bytes.toString('ascii',0,4),'glTF');
 assert.equal(bytes.readUInt32LE(4),2);
 assert.equal(bytes.readUInt32LE(8),bytes.length,'GLB must be complete');
 return JSON.parse(bytes.toString('utf8',20,20+bytes.readUInt32LE(12)).trim());
}
for(const name of ['Human1.glb','Human2.glb','Human3.glb','brunette.glb','Wolf.gltf','Fox.gltf','Horse.gltf','Horse_White.gltf']){
 test(`Imported ${name} has a usable rig and bundled resources`,()=>{
  const gltf=readModel(name);
  assert.equal(gltf.asset.version,'2.0');
  assert.ok(gltf.skins?.some(s=>s.joints.length>10));
  assert.ok(gltf.meshes?.length);
  for(const resource of [...gltf.buffers||[],...gltf.images||[]]){
   if(resource.uri)assert.ok(resource.uri.startsWith('data:'),'Models must not need remote resources');
  }
  if(name.endsWith('.gltf')){
   for(const clip of ['Idle','Walk'])assert.ok(gltf.animations.some(a=>a.name===clip));
  }else{
   for(const joint of ['LeftArm','RightArm','LeftUpLeg','RightUpLeg'])assert.ok(gltf.nodes.some(n=>n.name?.endsWith(joint)),joint);
   assert.ok(gltf.images?.length,'Human faces and clothes must have textures');
  }
 });
}

import * as THREE from '../three.module.js';
import {createRealModels} from '../real-models.js';
const settle=()=>new Promise(resolve=>setImmediate(resolve));
function sample(){const scene=new THREE.Group();scene.add(new THREE.Mesh(new THREE.BoxGeometry(1,1,1),new THREE.MeshStandardMaterial()));return {scene,animations:[]}}
test('Changing animal while files load cannot attach the previous species',async()=>{
 const pending=new Map(),scene=new THREE.Scene(),root=new THREE.Group();scene.add(root);
 const models=createRealModels(THREE,{loadModel:file=>new Promise(resolve=>pending.set(file,resolve))});
 models.animal(root,'Wolf');await settle();models.clear(root);models.animal(root,'Fox');await settle();
 pending.get('Fox.gltf')(sample());await settle();pending.get('Wolf.gltf')(sample());await settle();
 assert.equal(root.userData.realModel,'Fox.gltf');assert.equal(root.children.length,1);
 models.clear(root);assert.equal(root.children.length,0);
 assert.equal(models.records.every(record=>record.active===false),true);
});
test('Clearing an animal for an unsupported form cancels its pending mesh',async()=>{
 let finish;const scene=new THREE.Scene(),root=new THREE.Group();scene.add(root);
 const models=createRealModels(THREE,{loadModel:()=>new Promise(resolve=>finish=resolve)});
 models.animal(root,'Wolf');await settle();models.clear(root);models.animal(root,'Cat');finish(sample());await settle();
 assert.equal(root.children.length,0);
});
