export function createStable(api){
 const {THREE,outside,box,ball,cone,cylinder,label,target,outTargets,progress,panel,close,save,toast}=api;
 const horses=[];let riding=null,time=0;
 progress.horses??={};
 const hud=document.createElement('section');hud.id='stableHud';hud.hidden=true;hud.style.cssText='position:fixed;right:20px;top:300px;background:#fff9e8;color:#294332;padding:15px;border-radius:14px;z-index:3';document.body.appendChild(hud);
 hud.innerHTML='<b>Horse riding</b><p>Arrows / WASD to ride in the paddock.</p><button id="dismountHorse">Dismount</button>';hud.querySelector('button').onclick=()=>stop();
 box(outside,-29,.02,39,25,.08,23,'#b6ac7f');box(outside,-24,.03,28,3,.06,12,'#d9c89a');
 label(outside,'Redcliff Stables · care & ride',-29,4.8,31,7);
 for(const x of [-41,-17])for(let z=29;z<=50;z+=3){cylinder(outside,x,.7,z,.08,1.4,'#9b7850');box(outside,x,.7,z,.1,.12,3,'#b5976c')}
 for(const z of [28,50])box(outside,-29,.7,z,24,.12,.12,'#b5976c');
 for(const [i,name,color,mane] of [[0,'Maple','#a97951','#493a31'],[1,'Snowdrop','#e3ded0','#a59e94'],[2,'Midnight','#4b4a50','#292c32']]){
  const x=-36+i*7,z=32;
  box(outside,x,1.5,29,6,3,.15,'#bb9b70');for(const dx of [-3,3])box(outside,x+dx,1,32,.15,2,6,'#bb9b70');box(outside,x,3.2,32,6.5,.2,6.5,'#8a9873');
  box(outside,x-2,.25,34,.7,.5,.7,'#7d9fac');box(outside,x+2,.3,30.5,1,.6,.8,'#d6bc74');
  const root=new THREE.Group();outside.add(root);root.position.set(x,0,z);root.userData.organic=true;
  const body=ball(root,0,1.25,0,.8,color);body.scale.set(.65,.8,1.2);
  const neck=box(root,0,1.75,-.65,.48,1.2,.5,color);neck.rotation.x=-.25;
  const head=ball(root,0,2.3,-.95,.4,color);head.scale.set(.75,1,1.5);
  box(root,0,2.08,-1.35,.45,.35,.45,color);for(const side of [-1,1]){ball(root,side*.16,2.13,-1.56,.045,'#3c3633');ball(root,side*.27,2.41,-1.08,.018,'#fff7df');}for(let j=0;j<9;j++){const strand=box(root,(j%2)*.025,2.42-j*.08,-.45+j*.025,.10,.24,.13,mane);strand.rotation.x=.2}
  for(const dx of [-.16,.16])cone(root,dx,2.75,-.85,.1,.4,color);
  box(root,0,2.05,-.37,.16,1,.18,mane);const tail=box(root,0,1.05,.98,.2,.95,.2,mane);tail.rotation.x=.3;
  for(const dx of [-.3,.3])ball(root,dx,2.4,-1.05,.045,'#252b2b');
  const legs=[];for(const dx of [-.35,.35])for(const dz of [-.6,.6]){const leg=new THREE.Group();leg.position.set(dx,1,dz);root.add(leg);leg.userData.organic=true;box(leg,0,-.42,0,.17,.85,.2,color);box(leg,0,-.84,-.03,.22,.14,.28,'#403e3b');legs.push(leg)}
  const saddle=new THREE.Group();root.add(saddle);box(saddle,0,1.9,.1,.9,.15,.8,'#805839');box(saddle,0,1.8,.1,1,.08,1.2,['#b48a9d','#849f9d','#a098b2'][i]);
  const dirt=box(root,.43,1.4,.15,.04,.4,.5,'#796b4d');
  const tag=label(outside,name,x,3,35,2.8);
  const care=progress.horses[name]??={clean:false,fed:false,watered:false,saddled:false};saddle.visible=care.saddled;dirt.visible=!care.clean;
  const h={name,root,legs,saddle,dirt,care,home:{x,z},tag};horses.push(h);root.userData.coat=color;root.userData.saddle=saddle;root.userData.horseCare=care;api.models?.animal(root,i===1?'Horse_White':'Horse');
  target(outTargets,x,36,2.6,'Care for '+name,()=>careMenu(h));
 }
 function careMenu(h){const c=h.care;panel('REDCLIFF STABLES',h.name,`A gentle horse who enjoys patient care.<br>Coat: ${c.clean?'brushed':'needs brushing'} · Hay: ${c.fed?'given':'needed'} · Water: ${c.watered?'fresh':'needed'} · Saddle: ${c.saddled?'on':'off'}`,[
  {title:'Brush & clean',fn:()=>{c.clean=true;h.dirt.visible=false;save();toast('You gently brush '+h.name+' and clean the coat.');careMenu(h)}},
  {title:'Give hay',fn:()=>{c.fed=true;save();careMenu(h)}},
  {title:'Fill fresh water',fn:()=>{c.watered=true;save();careMenu(h)}},
  {title:c.saddled?'Remove saddle':'Saddle up',fn:()=>{c.saddled=!c.saddled;h.saddle.visible=c.saddled;save();careMenu(h)}},
  {title:'Ride '+h.name,sub:'Brush, feed, water and saddle first',fn:()=>mount(h)},
 ])}
 function mount(h){if(!h.care.clean||!h.care.fed||!h.care.watered||!h.care.saddled){toast('Brush, give hay, fill water and saddle '+h.name+' before riding.');return false}close();api.prepare();riding=h;h.tag.visible=false;api.state().pos.set(-29,0,44);hud.hidden=false;toast('Riding '+h.name+'! Use arrows / WASD. Dismount when you are ready.');return true}
 function stop(){if(!riding)return;const h=riding;riding=null;h.root.position.set(h.home.x,0,h.home.z);h.root.rotation.set(0,0,0);h.legs.forEach(l=>l.rotation.x=0);h.tag.visible=true;hud.hidden=true;api.resetPose();if(api.state().area==='forest')api.state().pos.set(h.home.x,0,36);toast('You dismount '+h.name+'. You can remove the saddle and brush again.')}
 function tick(dt){time+=dt;if(!riding)return;const s=api.state();if(s.area!=='forest'){stop();return}s.pos.x=Math.max(-39,Math.min(-19,s.pos.x));s.pos.z=Math.max(38,Math.min(48,s.pos.z));riding.root.position.set(s.pos.x,0,s.pos.z);riding.root.rotation.y=s.rotation();const moving=s.held.size>0;riding.legs.forEach((leg,i)=>leg.rotation.x=moving?Math.sin(time*8+i*Math.PI)*.3:0);api.ridePose()}
 function menu(){panel('REDCLIFF STABLES','Choose your horse.','Meet Maple, Snowdrop and Midnight. Brush their coats, give hay and fresh water, then saddle up for a ride in the paddock.',[{title:'Visit the stable',fn:()=>{close();api.visit(-29,37)}},...horses.map(h=>({title:h.name,sub:'Choose & care for this horse',fn:()=>{api.visit(h.home.x,36);careMenu(h)}}))])}
 return {menu,tick,stop,mount,horses,careMenu,get riding(){return riding}};
}
