import {createGroceryStore} from './grocery-store.js';
import {hasWitness} from './city-privacy.js';
export function createCityTrip(api){
 const $=id=>document.getElementById(id);
 const {THREE,box,ball,cone,label,human,scene,target,outTargets,panel,close,toast}=api;
 const city=new THREE.Group(),road=new THREE.Group();scene.add(city,road);city.visible=road.visible=false;
 const targets=[],buildings=[],privacyScreens=[],booths=[],pedestrians=[],traffic=[];let destination='city',speed=0,time=0;
 const car=(group,x,z,color)=>{const g=new THREE.Group();g.position.set(x,0,z);group.add(g);box(g,0,.55,0,1.6,.6,3,color);box(g,0,1.05,-.1,1.35,.55,1.5,'#b4d6dc');box(g,0,1.4,-.1,1.4,.12,1.6,color);for(const sx of [-.83,.83])for(const sz of [-.9,.9])ball(g,sx,.3,sz,.3,'#34424b');for(const sx of [-.55,.55])box(g,sx,.65,-1.51,.3,.18,.05,'#fff2bb');return g};
 const schoolCar=car(api.outside,0,30,'#b87350');label(api.outside,'Car trip · San Francisco',0,3,30,5);
 target(outTargets,0,30,3.5,'Take the car to San Francisco',()=>menu());
 box(road,0,-.15,-20,90,.3,210,'#91aa7e');box(road,0,.03,-20,10,.1,190,'#54616a');
 for(let z=-100;z<=65;z+=7)box(road,0,.1,z,.15,.03,3,'#f2e5ac');
 for(const x of [-12,12])for(let z=-90;z<65;z+=15){cone(road,x,2,z,2.5,4,'#587b64');box(road,x,.6,z,.35,1.2,.35,'#806044')}
 const citySign=label(road,'SAN FRANCISCO →',0,4,-80,7),schoolSign=label(road,'REDCLIFF →',0,4,-80,7);schoolSign.visible=false;label(road,'Coastal road · drive ahead',0,4,30,7);
 const playerCar=car(road,0,40,'#b87350');
 const ahead=car(road,-2,-8,'#7e9bab');
 box(city,0,-.3,0,90,.5,100,'#d4d4bb');box(city,0,.01,0,9,.08,84,'#4c5963');
 for(const z of [-20,0,20])box(city,0,.03,z,70,.08,7,'#4c5963');
 for(const x of [-6,6])box(city,x,.12,0,2.7,.2,82,'#ece1c8');
 for(const z of [-20,20])for(let x=-4;x<=4;x+=1.2)box(city,x,.1,z,.55,.03,3,'#fff7db');
 const colors=['#c28d82','#a4bdab','#d5b875','#a7b8ce','#e6ccb0'];
 for(const x of [-15,15,-27,27])for(const [i,z] of [-31,-10,10,31].entries()){
  const h=4+(i%3)*2,g=new THREE.Group();g.position.set(x,0,z);city.add(g);box(g,0,h/2,0,8,h,10,colors[(i+(x>0?1:0))%5]);cone(g,0,h+.7,0,5,1.4,'#775e55',4).rotation.y=Math.PI/4;
  for(const wx of [-2,0,2])for(let y=1.5;y<h;y+=2)box(g,wx,y,5.05,1,1,.08,'#a5d4db');buildings.push({x,z,w:8,d:10});
 }
 // Curtain-front booths provide a screened place to change forms.
 for(const [x,z] of [[9,-8],[-9,8]]){
  booths.push({x,z});
  for(const [dx,dz,w,d,curtain] of [[-1.4,0,.12,2.8,true],[1.4,0,.12,2.8,false],[0,-1.4,2.8,.12,false],[0,1.4,2.8,.12,false]]){
   const r={x:x+dx*Math.sign(x),z:z+dz,w,d};privacyScreens.push(r);if(!curtain)buildings.push(r);
   box(city,r.x,1.4,r.z,w,2.8,d,curtain?'#7c9c82':'#aaa98b');
  }
  box(city,x,2.85,z,3,.12,3,'#aaa98b');label(city,'Private changing booth',x,3.6,z,3.4);
  target(targets,x-1.6*Math.sign(x),z,2,'About the private changing booth',()=>panel('KEEP YOUR SECRET','Change behind the curtain.','Walk through the green curtain and into the booth before changing forms. Its screens hide you from pedestrians and drivers. Outside, a wolf or bird looks like an ordinary animal — but nobody must see you transform.'));
 }
 function transformationAllowed(next){
  const state=api.state();if(next===state.form)return true;
  if(state.area==='store'){toast('Keep your secret! The cashier and shoppers could see you transform.');return false}
  if(state.area!=='city')return true;
  const witnesses=[...pedestrians.map(p=>p.mesh.position),...traffic.map(c=>c.mesh.position)];
  if(hasWitness(state.pos,witnesses,[...buildings,...privacyScreens])){
   toast('Keep your Windwalker identity secret! Someone can see you. Change inside a private booth.');
   $('secretStatus').textContent='Secret protected · transformation blocked: witnesses nearby';return false;
  }
  $('secretStatus').textContent='Secret safe · you changed out of sight';return true;
 }
 // A stylized neighborhood rather than a street-accurate map.
 label(city,'San Francisco · City Walk',0,7,-33,8);
 label(city,'Painted houses',-15,8,10,5);label(city,'Neighborhood café',15,7,10,5);
 box(city,0,.05,-45,85,.1,8,'#75aeb7');
 for(const x of [-10,10]){box(city,x,5,-43,.7,10,.7,'#bf6145');box(city,x,9,-43,5,.5,.7,'#bf6145')}
 box(city,0,3,-43,30,.35,2,'#bf6145');label(city,'The bay',-22,3,-40,4);
 const parked=car(city,-6,25,'#b87350');target(targets,-6,22,3,'Return to your car',()=>menu());
 for(let i=0;i<32;i++){
  const x=i%2?6:-6,z=-35+(i%16)*4.5,p=human(city,x,z,colors[i%5],'City resident '+i,false);
  pedestrians.push({mesh:p,x,z,dir:i%3?1:-1});
 }
 for(let i=0;i<10;i++){const lane=i%2?2:-2,g=car(city,lane,-36+i*8,colors[i%5]);g.rotation.y=lane>0?Math.PI:0;traffic.push({mesh:g,dir:lane>0?1:-1})}
 const cable=car(city,2,0,'#d1a84e');box(cable,0,1.8,0,1.7,.15,3.2,'#af6841');traffic.push({mesh:cable,dir:1});
 target(targets,-6,-17,2.3,'Read the city walking guide',()=>panel('CITY WALK','A busy day in San Francisco.','Keep your Windwalker identity secret: never change forms in front of city people. Use the screened private booths to transform. Explore the sidewalks, painted houses and neighborhood café. Cars and a cable car pass along the road. Use the marked crossings and wait for a gap. This is an imagined, compact city neighborhood.'));
 target(targets,6,10,2.2,'Relax at the city café',()=>panel('NEIGHBORHOOD CAFÉ','A little city break.','You pause beside the café, watch the crowds and enjoy a glass of water. Your car is parked at the southern end of the sidewalk.'));
 const store=createGroceryStore({...api,enter:()=>{city.visible=false;road.visible=false;api.enterStore()},leave:()=>{city.visible=true;api.leaveStore()}});
 box(city,10.95,1.5,31,.12,3,1.9,'#66866c');label(city,'Bay Basket · Grocery Store',10.7,6,31,5);
 target(targets,8.8,31,2.4,'Enter Bay Basket grocery store',()=>{if(api.state().form!=='human'){toast('Change back to human in a private booth before entering the store.');return}store.enter()});
 function menu(){if(api.state().area==='drive')return panel('CAR TRIP','On the coastal road.','Keep driving towards the destination sign, or cancel the trip and return to school.',[{title:'Continue driving',fn:close},{title:'Cancel trip & return to Redcliff',fn:()=>{close();hide();api.returnSchool()}}]);const inCity=['city','store'].includes(api.state().area);panel('CAR TRIP',inCity?'Ready to go back?':'Visit San Francisco.',inCity?'Your car is parked nearby. Drive the coastal road back to Redcliff.':'First drive to the city, then park and explore its crowded streets on foot. Use Up / W to accelerate, Down / S to brake, and Left / Right to steer. Release Up to slow down.',[{title:inCity?'Drive back to Redcliff':'Drive to San Francisco',sub:'A short playable car journey',fn:()=>start(inCity?'forest':'city')},...(inCity?[{title:'Where is the grocery store?',sub:'Bay Basket · east sidewalk, south end',fn:()=>panel('CITY GUIDE','Find Bay Basket.','The grocery store is at the south end of the east sidewalk, beside the painted building. Walk to its green door and tap Interact. Enter in human form to keep your secret.')}]:[])])}
 function start(to='city'){if(['city','store'].includes(api.state().area)&&api.state().form!=='human'){toast('Keep your secret: change back to human inside a private booth before getting in the car.');return}destination=to;speed=0;store.root.visible=false;close();api.beginDrive();road.visible=true;city.visible=false;api.state().pos.set(0,0,40);playerCar.position.set(0,0,40);labelDirection();toast('Hold ↑ / W to drive. ↓ / S brakes. Reach the sign at the end of the road.')}
 function labelDirection(){citySign.visible=destination==='city';schoolSign.visible=destination!=='city';api.location(destination==='city'?'Coastal road → San Francisco':'Coastal road → Redcliff')}
 function tick(dt){
  const s=api.state();time+=dt;
  if(s.area==='drive'){
   const accelerate=s.held.has('forward'),brake=s.held.has('back');speed=Math.max(0,Math.min(14,speed+(accelerate?7:-4)*dt-(brake?14*dt:0)));
   const steering=(s.held.has('right')?1:0)-(s.held.has('left')?1:0);s.pos.x=Math.max(-3,Math.min(3,s.pos.x+steering*dt*3));
   if(Math.abs(s.pos.x-ahead.position.x)<1.6&&s.pos.z>ahead.position.z&&s.pos.z-ahead.position.z<5)speed=Math.min(speed,3);
   s.pos.z-=speed*dt;playerCar.position.set(s.pos.x,0,s.pos.z);playerCar.rotation.z=-steering*.04;
   ahead.position.z-=3*dt;if(ahead.position.z< -100)ahead.position.z=25;
   api.location(`Coastal road → ${destination==='city'?'San Francisco':'Redcliff'} · ${Math.max(0,Math.ceil(s.pos.z+80))} m to arrival`);
   if(s.pos.z<=-80){road.visible=false;speed=0;if(destination==='city'){city.visible=true;api.arriveCity();toast('You parked in San Francisco! Keep your identity secret. Only transform out of sight; private booths are marked.')}else{city.visible=false;api.returnSchool()}}
  }
  $('secretStatus').hidden=!['city','store'].includes(s.area);
  if(s.area==='store')$('secretStatus').textContent='Secret safe · stay human around the cashier';
  if(s.area!=='city')return;
  const watched=hasWitness(s.pos,[...pedestrians.map(p=>p.mesh.position),...traffic.map(c=>c.mesh.position)],[...buildings,...privacyScreens]);
  $('secretStatus').textContent=watched?'Secret safe · witnesses nearby: stay in your current form':'Out of sight · safe to transform';
  for(const p of pedestrians){p.mesh.position.z+=p.dir*dt*(.7+(pedestrians.indexOf(p)%4)*.15);if(p.mesh.position.z>38)p.dir=-1;if(p.mesh.position.z< -38)p.dir=1;p.mesh.rotation.y=p.dir>0?Math.PI:0;p.mesh.rotation.z=Math.sin(time*8+pedestrians.indexOf(p))*.035}
  for(const c of traffic){c.mesh.position.z+=c.dir*dt*4;if(c.mesh.position.z>42)c.mesh.position.z=-42;if(c.mesh.position.z< -42)c.mesh.position.z=42}
 }
 function blocked(x,z){return Math.abs(x)>34||Math.abs(z)>39||buildings.some(b=>Math.abs(x-b.x)<b.w/2+.35&&Math.abs(z-b.z)<b.d/2+.35)||traffic.some(c=>Math.abs(x-c.mesh.position.x)<1.3&&Math.abs(z-c.mesh.position.z)<2.2)}
 function hide(){store.root.visible=false;$('secretStatus').hidden=true;city.visible=road.visible=false;speed=0}
 return {store,menu,start,tick,blocked,hide,transformationAllowed,booths,targets,city,road,pedestrians,traffic};
}
