import {GLTFLoader} from './vendor/GLTFLoader.js';
import {clone as cloneRig} from './vendor/SkeletonUtils.js';
// Imported meshes are independent of the small invisible pose/control proxies.
export function createRealModels(THREE,{enabled=true,onError=()=>{},loadModel}={}){
 const active=new WeakMap(),requests=new WeakMap();
 function clear(root){requests.set(root,{});const old=active.get(root);if(old){old.active=false;root.remove(old.wrap);active.delete(root)}}
 const records=[],cache=new Map(),loader=new GLTFLoader();
 const load=file=>{if(!cache.has(file))cache.set(file,loadModel?Promise.resolve().then(()=>loadModel(file)):loader.loadAsync(new URL('./assets/models/'+file,import.meta.url).href));return cache.get(file)};
 const girls=/^(Mira|Lina|Amelie|Nora|Zoe|Camille|Headmistress|Madame|Miss |Ms |Frau)/;
 function visible(root){for(let n=root;n;n=n.parent){if(!n.visible)return false;if(n.isScene)return true}return false}
 function normalize(model,height){model.updateMatrixWorld(true);const bounds=new THREE.Box3().setFromObject(model);const scale=height/(bounds.max.y-bounds.min.y);const wrap=new THREE.Group();model.scale.multiplyScalar(scale);model.position.y-=bounds.min.y*scale;wrap.add(model);return wrap}
 function hideProxy(root){for(const c of root.children)if(!c.isSprite)c.visible=false}
 function direction(bone,child,desired){if(!bone||!child)return;bone.updateWorldMatrix(true,true);const a=bone.getWorldPosition(new THREE.Vector3()),b=child.getWorldPosition(new THREE.Vector3()).sub(a).normalize();const delta=new THREE.Quaternion().setFromUnitVectors(b,desired.clone().normalize());const world=bone.getWorldQuaternion(new THREE.Quaternion()).premultiply(delta),parent=bone.parent.getWorldQuaternion(new THREE.Quaternion()).invert();bone.quaternion.copy(parent.multiply(world));bone.updateWorldMatrix(false,true)}
 function human(root,{name,identity,appearance}={}){
  if(!enabled)return;const female=!name||girls.test(name),hair=appearance?.()?.hair||identity?.hair,file=female?(['long','braid','ponytail'].includes(hair)?'brunette.glb':'Human3.glb'):(/Mister|supervisor/.test(name)?'Human2.glb':'Human1.glb');
  const request={};requests.set(root,request);load(file).then(g=>{
   if(!root.parent||requests.get(root)!==request)return;const model=cloneRig(g.scene),bones={};model.traverse(m=>{if(m.isBone)bones[m.name.replace(/^mixamorig:/,'')]=m;if(m.isMesh){m.material=Array.isArray(m.material)?m.material.map(v=>v.clone()):m.material.clone();m.castShadow=true;m.frustumCulled=false;if(identity&&/head$/i.test(m.name)){m.geometry=m.geometry.clone();const a=m.geometry.attributes.position;for(let i=0;i<a.count;i++)a.setX(i,a.getX(i)*identity.face);m.geometry.computeVertexNormals()}}});
   model.updateMatrixWorld(true);
   direction(bones.LeftArm,bones.LeftForeArm,new THREE.Vector3(.08,-1,.03));direction(bones.RightArm,bones.RightForeArm,new THREE.Vector3(-.08,-1,.03));
   direction(bones.LeftForeArm,bones.LeftHand,new THREE.Vector3(0,-1,.08));direction(bones.RightForeArm,bones.RightHand,new THREE.Vector3(0,-1,.08));
   const rest={};for(const [n,b]of Object.entries(bones))rest[n]=b.quaternion.clone();
   const wrap=normalize(model,2.02);wrap.rotation.y=Math.PI;hideProxy(root);root.add(wrap);root.userData.realModel=file;
   const old=active.get(root);if(old){old.active=false;root.remove(old.wrap)}
   const record={type:'human',active:true,name,file,root,wrap,model,bones,rest,identity,appearance,lastAppearance:'',lastPos:root.getWorldPosition(new THREE.Vector3()),walk:0};records.push(record);active.set(root,record);updateHuman(record,0);
  }).catch(e=>onError(file,e));
 }
 function updateHuman(r,dt){
  const {root,bones,rest}=r;const p=r.appearance?.()||r.identity||{},signature=JSON.stringify(p);
  if(signature!==r.lastAppearance){r.lastAppearance=signature;
   if(r.appearance){const desired=['long','braid','ponytail'].includes(p.hair)?'brunette.glb':'Human3.glb';if(desired!==r.file&&!r.switching){r.switching=true;human(root,{name:r.name,identity:r.identity,appearance:r.appearance})}}
   r.model.traverse(m=>{
   if(!m.isMesh)return;const material=m.material,n=(material.name||'').toLowerCase();
   if(n.includes('beard'))m.visible=/Mister/.test(r.identity?.name||'');
   if(n.includes('glasses'))m.visible=!!p.glasses;
   if(!material.userData.tintSetup&&(n.includes('outfit')||n.includes('hair'))){material.userData.tintSetup=true;material.onBeforeCompile=shader=>{shader.fragmentShader=shader.fragmentShader.replace('#include <map_fragment>','#include <map_fragment>\n#ifdef USE_MAP\ndiffuseColor.rgb=diffuse*(0.50+0.50*dot(sampledDiffuseColor.rgb,vec3(0.299,0.587,0.114)));\n#endif')};material.needsUpdate=true}
   if(n.includes('outfit_top')&&p.shirt)material.color.set(p.shirt);
   if(n.includes('outfit_bottom')&&p.pants)material.color.set(p.pants);
   if(n.includes('hair')&&(p.hairColor))material.color.set(p.hairColor);
   if(n.includes('skin')&&p.skin)material.color.set(p.skin).lerp(new THREE.Color('#ffffff'),.65);
  })}
  const at=root.getWorldPosition(new THREE.Vector3()),moved=at.distanceTo(r.lastPos);r.lastPos.copy(at);const walking=dt>0&&moved>.002&&moved<2;r.walk+=walking?dt*7:0;
  const pose=(name,angle)=>{const bone=bones[name];if(bone){bone.quaternion.copy(rest[name]);bone.rotateX(angle)}};
  const seated=Math.abs(root.children[3]?.rotation.x||0)>1;
  r.wrap.position.y=seated?-.45:0;
  const left=seated?-Math.PI/2:walking?Math.sin(r.walk)*.38:0,right=seated?-Math.PI/2:-left;
  pose('LeftUpLeg',left);pose('RightUpLeg',right);pose('LeftLeg',seated?Math.PI/2:Math.max(0,-left)*-.65);pose('RightLeg',seated?Math.PI/2:Math.max(0,-right)*-.65);
  pose('LeftArm',walking?-left*.6:0);pose('RightArm',walking?-right*.6:0);
 }
 const animals={Wolf:['Wolf.gltf',1.55],Fox:['Fox.gltf',1.3],Horse:['Horse.gltf',2.65],Horse_White:['Horse_White.gltf',2.65]};
 function animal(root,species){
  if(!enabled||!animals[species])return;const [file,height]=animals[species],request={};requests.set(root,request);load(file).then(g=>{
   if(!root.parent||requests.get(root)!==request)return;const model=cloneRig(g.scene);model.traverse(m=>{if(m.isMesh){m.material=m.material.clone();if(root.userData.coat&&/^Main/.test(m.material.name)){m.material.color.set(root.userData.coat);if(m.material.name==='Main_Dark')m.material.color.multiplyScalar(.75);if(m.material.name==='Main_Light')m.material.color.multiplyScalar(1.1)}m.castShadow=true;m.frustumCulled=false}});const wrap=normalize(model,height);wrap.rotation.y=Math.PI;
   hideProxy(root);root.add(wrap);root.userData.realModel=file;if(root.userData.saddle){root.userData.saddle.visible=root.userData.horseCare.saddled}
   const mixer=new THREE.AnimationMixer(model),idleClip=g.animations.find(c=>c.name==='Idle'),walkClip=g.animations.find(c=>c.name==='Walk');
   const idle=idleClip?mixer.clipAction(idleClip).play():null,walk=walkClip?mixer.clipAction(walkClip).play():null;if(walk)walk.setEffectiveWeight(0);
   const old=active.get(root);if(old){old.active=false;root.remove(old.wrap)}
   const record={type:'animal',active:true,root,wrap,model,mixer,idle,walk,lastPos:root.getWorldPosition(new THREE.Vector3())};records.push(record);active.set(root,record);
  }).catch(e=>onError(file,e));
 }
 return {human,animal,clear,records,tick(dt){for(const r of records){if(r.active===false||!visible(r.root))continue;if(r.type==='human')updateHuman(r,dt);else{const at=r.root.getWorldPosition(new THREE.Vector3()),d=at.distanceTo(r.lastPos);r.lastPos.copy(at);const walking=d>.003&&d<3;r.idle?.setEffectiveWeight(walking?0:1);r.walk?.setEffectiveWeight(walking?1:0);r.mixer.update(dt)}}}};
}
