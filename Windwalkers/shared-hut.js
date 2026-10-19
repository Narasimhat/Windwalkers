export function createSharedHut(api){
 const {THREE,hutInside,hutTargets,box,ball,label,human,target,progress,panel,close}=api;
 const walls=[],residents=[],doors=[];let lastNames='',sleeping=false;
 const names=()=>['Your bedroom',progress.roommate,progress.roommate2];
 progress.roommate2=['Mira','Theo','Jun'].includes(progress.roommate2)&&progress.roommate2!==progress.roommate?progress.roommate2:['Mira','Theo','Jun'].find(n=>n!==progress.roommate);
 box(hutInside,0,-.2,0,28,.4,25,'#c6a581');box(hutInside,0,2.2,-12.5,28,4.4,.2,'#d9dfbf');
 for(const x of [-14,14])box(hutInside,x,2.2,0,.2,4.4,25,'#d5d9b5');
 const wall=(x,z,w,d)=>{box(hutInside,x,.55,z,w,1.1,d,'#c4cfae');walls.push({x,z,w,d})};
 for(const x of [-4.5,4.5])wall(x,-5.7,.2,13.4);
 for(const [a,b] of [[-14,-10.2],[-7.8,-1.2],[1.2,7.8],[10.2,14]])wall((a+b)/2,1,b-a,.2);
 label(hutInside,'Gemeinschaftsraum · shared living room',0,3.6,6,7);
 box(hutInside,0,.03,6,10,.05,7,'#99ada0');box(hutInside,0,.5,5,3,.9,1.8,'#a17e59');
 for(const x of [-4,4]){target(hutTargets,x+(x<0?1.2:-1.2),5,2,'Sit on the couch',()=>api.rest('couch',{x,z:5}));box(hutInside,x,.5,5,2.4,1,3.5,'#91a6a0');box(hutInside,x+(x<0?-.9:.9),1.1,5,.3,1,3.5,'#91a6a0')}
 for(const x of [-11,11]){ball(hutInside,x,1.2,8,.8,'#7f9c69');box(hutInside,x,.4,8,.7,.8,.7,'#b58c66')}
 for(const [i,x] of [-9,0,9].entries()){
  const tag=label(hutInside,names()[i],x,2.8,-.2,3.8);doors.push(tag);
  target(hutTargets,x,1.3,2,'Enter '+names()[i],()=>visitRoom(i));doors.push(hutTargets.at(-1));
  if(i>0){box(hutInside,x-2,.4,-8,1.6,.8,3,'#876d54');box(hutInside,x-2,.85,-8,1.5,.15,2.9,i===1?'#c39aa7':'#8eafbc');box(hutInside,x+2,.8,-7,2,1.6,1,'#ac835a');box(hutInside,x+2,1.9,-10,2,3,.5,'#aa8d64')}
 }
 for(let i=1;i<=2;i++){
  const root=human(hutInside,i===1?-3:3,7,'#a586ac',names()[i],false);const tag=label(root,names()[i],0,2.7,0,2.5);let interaction;
  target(hutTargets,root.position.x,root.position.z,2,'Talk to '+names()[i],()=>api.talk(names()[i].toLowerCase()));interaction=hutTargets.at(-1);
  residents.push({root,tag,interaction,index:i,step:0,wait:0,route:i===1?[[-2,8],[-2,2],[0,2],[0,-1],[0,-7],[0,-1],[0,2],[-2,2],[-2,8]]:[[2,8],[7,8],[7,2],[9,2],[9,-1],[9,-7],[9,-1],[9,2],[7,2],[7,8],[2,8]]});
 }
 target(hutTargets,-10,8,2,'Arrange your bedroom',()=>api.edit());label(hutInside,'Room planner',-10,2.7,8,3.5);
 label(hutInside,'Exit to forest',0,2.8,11,3.5);target(hutTargets,0,11,2,'Leave hut',()=>api.enter('forest'));
 function refresh(){
  if(progress.roommate2===progress.roommate)progress.roommate2=['Mira','Theo','Jun'].find(n=>n!==progress.roommate);
  const key=names().join('|');if(key===lastNames)return;lastNames=key;
  for(let i=0;i<3;i++){const old=doors[i*2],n=label(hutInside,names()[i],[-9,0,9][i],2.8,-.2,3.8);old.material.map.dispose();old.material.dispose();hutInside.remove(old);doors[i*2]=n;doors[i*2+1].title='Enter '+names()[i]}
  for(const r of residents){if(r.root.userData.identity?.name!==names()[r.index]){const oldRoot=r.root;r.root=human(hutInside,oldRoot.position.x,oldRoot.position.z,'#a586ac',names()[r.index],false);hutInside.remove(oldRoot)}if(r.sleepTag){r.sleepTag.material.map.dispose();r.sleepTag.material.dispose();hutInside.remove(r.sleepTag);r.sleepTag=null}r.tag.material.map.dispose();r.tag.material.dispose();r.root.remove(r.tag);r.tag=label(r.root,names()[r.index],0,2.7,0,2.5);r.interaction.title='Talk to '+names()[r.index];
   }
 }
 function gather(){refresh();if(sleeping){setSleeping(true);return}for(const r of residents){r.root.position.set(r.index===1?-3:3,0,7);r.interaction.x=r.root.position.x;r.interaction.z=7;r.step=0;r.wait=1.5}}
 function visitRoom(i){refresh();if(i>0&&!sleeping){const r=residents[i-1];r.root.position.set(i===1?0:9,0,-7);r.interaction.x=r.root.position.x;r.interaction.z=-7;r.step=4;r.wait=3}api.move([-9,0,9][i],-1.5);api.toast(i===0?'Your bedroom. Use Room planner to move your furniture.':names()[i]+' has this bedroom. Each resident has their own room.')}
 function menu(){panel('YOUR SHARED HUT','Three bedrooms. One Gemeinschaftsraum.','Share the living room with your two roommates, then return to your own bedroom.',[
  {title:sleeping?'Go quietly into the Gemeinschaftsraum':'Gather in the Gemeinschaftsraum',fn:()=>{close();api.enter('hut');gather()}},
  ...names().map((name,i)=>({title:name,fn:()=>{close();api.enter('hut');visitRoom(i)}})),
  {title:'Sit on the couch',fn:()=>{close();api.enter('hut');api.rest('couch',{x:-4,z:5})}},
  {title:'Lie in my bed',fn:()=>{close();api.enter('hut');const bed=progress.furniture.find(f=>f.type==='bed');if(bed)api.rest('bed',{x:bed.x-9,z:bed.z-5,rotation:bed.rotation})}},
  {title:'Arrange my bed, desk & shelf',fn:()=>api.edit()}
 ])}
 let walkTime=0;
 function tick(dt){
  const s=api.trainingState();if(s.area!=='hut')return;walkTime+=dt;
  for(const r of residents){
   if(sleeping)continue;
   if(r.wait>0){r.wait-=dt;continue}
   const [x,z]=r.route[r.step],dx=x-r.root.position.x,dz=z-r.root.position.z,d=Math.hypot(dx,dz);
   if(d<.08){r.step=(r.step+1)%r.route.length;r.wait=1.5;continue}
   if(Math.hypot(r.root.position.x-s.pos.x,r.root.position.z-s.pos.z)<1.1)continue;
   const step=Math.min(d,dt*.95);r.root.position.x+=dx/d*step;r.root.position.z+=dz/d*step;r.root.rotation.y=Math.atan2(-dx,-dz);
   r.root.children[3].rotation.x=Math.sin(walkTime*7)*.18;r.root.children[6].rotation.x=-Math.sin(walkTime*7)*.18;
   r.interaction.x=r.root.position.x;r.interaction.z=r.root.position.z;
  }
 }
 function setSleeping(value){
  const changed=value!==sleeping;sleeping=value;
  for(const r of residents){
   r.sleeping=value;r.interaction.enabled=!value;
   if(value){
    r.root.position.set((r.index===1?0:9)-2,.95,-9);r.root.rotation.set(Math.PI/2,0,0);
    for(const i of [3,6])r.root.children[i].rotation.x=0;
    r.tag.visible=false;
    if(!r.sleepTag)r.sleepTag=label(hutInside,names()[r.index]+' · asleep',r.root.position.x,2.5,-8,2.8);
    r.sleepTag.visible=true;
   }else if(changed){r.root.rotation.set(0,0,0);r.root.position.set(r.index===1?-3:3,0,7);r.step=0;r.wait=1.5;r.tag.visible=true;if(r.sleepTag)r.sleepTag.visible=false}
   r.interaction.x=r.root.position.x;r.interaction.z=r.root.position.z;
  }
 }
 refresh();return {setSleeping,tick,menu,refresh,gather,visitRoom,residents,walls,blocked:(x,z)=>walls.some(w=>Math.abs(x-w.x)<w.w/2+.25&&Math.abs(z-w.z)<w.d/2+.25)};
}
