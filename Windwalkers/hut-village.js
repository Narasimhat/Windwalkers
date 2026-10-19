export function createHutVillage(api){
 const {THREE,scene,outside,box,ball,cone,label,human,target,outTargets,panel,close,progress}=api;
 const huts=[{name:'Willow Hut',x:-49,z:-18},{name:'Clover Hut',x:-49,z:-2},{name:'Cedar Hut',x:-49,z:14}];
 for(const h of huts)api.block(h.x,h.z,9,8);
 const root=new THREE.Group();scene.add(root);root.visible=false;const targets=[],residents=[],walkers=[];
 const names=['Lina','Felix','Amelie','Oscar','Nora','Leo','Zoe','Ben','Mira','Theo','Jun','Camille','Headmistress Rowan','Ms Vale','Miss Machanda','Miss Hilllbrecht','Madame Wenzel','Miss Janz','Mister Hutter','Miss Krieg','Frau Janz','Pool supervisor'];
 const residentNames=names;
 let visiting=null,night=false;
 for(const [i,h] of huts.entries()){
  box(outside,h.x,1.6,h.z,9,3.2,8,['#a4b58c','#c2a3a3','#99b6bf'][i]);cone(outside,h.x,4.4,h.z,7,2.5,'#7d8466',4).rotation.y=Math.PI/4;
  box(outside,h.x,1.2,h.z+4.05,1.6,2.4,.1,'#80664e');for(const dx of [-2.7,2.7])box(outside,h.x+dx,1.8,h.z+4.08,1.4,1.4,.1,'#dfdcb1');
  label(outside,h.name,h.x,5.6,h.z+3,3.5);
  box(outside,-42,.03,h.z+5,14,.06,2,'#d9c89a');
  target(outTargets,h.x,h.z+5.5,2.6,'Visit '+h.name,()=>visit(i));
 }
 box(outside,-42,.03,-1,2,.06,40,'#d9c89a');box(outside,-33,.03,11,18,.06,2,'#d9c89a');
 for(const [i,name] of residentNames.entries()){
  const hut=[progress.roommate,progress.roommate2].includes(name)?-1:i%3,group=new THREE.Group();outside.add(group);const walker=human(group,0,-17,'#8b9e91',name),tag=label(walker,'Going home',0,3,0,2);
  walker.visible=false;walkers.push({name,root:walker,tag,hut,arrived:false,start:null,route:[]});
 }
 function origins(){return api.people().map(p=>({name:p.name,position:p.root.position.clone()}))}
 function startNight(){const sources=origins();for(const w of walkers){const found=sources.find(p=>p.name?.split(' · ')[0]===w.name);const p=found?.position??{x:0,z:-17};w.start={x:p.x,z:p.z};const h=w.hut<0?{x:-24,z:7}:huts[w.hut];w.route=[[p.x,p.z],[0,p.z],[0,11],[-42,11],[-42,h.z+5],[h.x,h.z+5]];w.arrived=false}}
 function sync(minutes){
  const hour=minutes/60,isNight=hour>=20||hour<7;if(isNight&&!night)startNight();night=isNight;
  const fraction=hour>=20&&hour<21?(minutes-1200)/60:1;
  for(const w of walkers){
   w.root.visible=false;if(!isNight){w.arrived=false;continue}
   if(!w.start)startNight();
   const lengths=w.route.slice(1).map((p,i)=>Math.hypot(p[0]-w.route[i][0],p[1]-w.route[i][1]));
   let remaining=fraction*lengths.reduce((a,b)=>a+b,0);w.arrived=fraction>=1;
   for(let i=0;i<lengths.length;i++){if(remaining>lengths[i]){remaining-=lengths[i];continue}const a=w.route[i],b=w.route[i+1],f=lengths[i]?remaining/lengths[i]:1;w.root.position.set(a[0]+(b[0]-a[0])*f,0,a[1]+(b[1]-a[1])*f);w.root.rotation.y=Math.atan2(a[0]-b[0],a[1]-b[1]);break}
   w.root.visible=!w.arrived;
   if(w.root.visible){w.root.children[3].rotation.x=Math.sin(minutes*4)*.2;w.root.children[6].rotation.x=-Math.sin(minutes*4)*.2}
  }
  for(const r of residents){r.root.visible=!!(night&&walkers.find(w=>w.name===r.name)?.arrived);r.tag.visible=r.root.visible}
  if(hour>=20&&hour<21)document.getElementById('classStatus').textContent='☾ 20:00 · everyone is walking home to their huts';
 }
 function visit(i){visiting=i;api.enter();root.clear();targets.length=0;residents.length=0;root.visible=true;const h=huts[i];
  box(root,0,-.2,0,24,.4,22,'#d1b28b');box(root,0,2,-11,24,4,.2,'#c9d8bd');for(const x of [-12,12])box(root,x,2,0,.2,4,22,'#d4ddc7');
  label(root,h.name+' · visiting friends',0,3.8,-10,7);
  box(root,0,.025,5,8,.05,5,'#9fb5a4');box(root,0,.6,5,4,1.2,1.5,'#9bada5');box(root,0,1.2,5.7,4,1,.2,'#9bada5');
  for(const [j,w] of walkers.filter(w=>w.hut===i).entries()){
   const x=-8+(j%4)*5.3,z=-7+Math.floor(j/4)*6;
   box(root,x,.4,z,1.7,.8,3,'#937450');box(root,x,.85,z,1.6,.15,2.9,'#aab6ce');box(root,x,1,z-1,.95,.2,.5,'#efe4cb');
   const person=human(root,x,z-1,'#8b9e91',w.name);person.rotation.x=Math.PI/2;person.position.y=.96;
   label(root,w.name+' · asleep',x,2,z,2.5);const sleepTag=root.children.at(-1);residents.push({name:w.name,root:person,tag:sleepTag});
  }
  target(targets,0,10,2.5,'Leave '+h.name,()=>{root.visible=false;api.leave(h.x,h.z+5.5)});
  target(targets,0,3,2,'Read the hut guest book',()=>panel('VISITING FRIENDS',h.name,'Welcome! '+walkers.filter(w=>w.hut===i).map(w=>w.name).join(', ')+' live here. At 20:00 everyone walks home. They settle into bed by 21:00. Please visit quietly at night.'));
  api.location(h.name);sync(progress.worldMinutes??540);
 }
 function menu(){panel('REDCLIFF HUT VILLAGE','Visit your friends.','Three more huts are west of your own hut. Everyone starts walking home at 20:00 and is in bed by 21:00.',huts.map((h,i)=>({title:'Visit '+h.name,sub:walkers.filter(w=>w.hut===i).map(w=>w.name).join(' · '),fn:()=>{close();visit(i)}})))}
 return {root,huts,walkers,residents,targets,sync,visit,menu,get visiting(){return visiting}};
}
