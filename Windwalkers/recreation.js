export function createRecreation(api){
 const {THREE,outside,box,ball,cone,label,human,target,outTargets,panel,close,toast}=api;
 let mode=null,time=0,elapsed=0;const pool={x:36,z:22,w:20,d:12};
 const hud=document.createElement('section');hud.id='recreationHud';hud.hidden=true;document.body.appendChild(hud);
 box(outside,25,.05,11,28,.1,3,'#d9c89a');box(outside,36,.04,8,3,.1,34,'#d9c89a');
 box(outside,36,.05,-2,20,.1,17,'#c7b28c');label(outside,'Redcliff Playground',36,4,-2,6);
 // Swing frame and moving seat.
 const swing=new THREE.Group();swing.position.set(30,0,-3);outside.add(swing);
 for(const x of [-2,2])for(const z of [-1,1]){const leg=box(swing,x,1.7,z,.16,3.4,.16,'#7d8b73');leg.rotation.x=z*.22}
 box(swing,0,3.4,0,4.5,.2,.2,'#7d8b73');const swingPivot=new THREE.Group();swingPivot.position.y=3.3;swing.add(swingPivot);
 for(const x of [-.6,.6])box(swingPivot,x,-1.25,0,.04,2.5,.04,'#566773');box(swingPivot,0,-2.55,0,1.6,.15,.65,'#bd825c');
 target(outTargets,30,-1,2.5,'Ride the swing',()=>begin('swing'));
 // Slide tower, ladder and chute.
 box(outside,37,1.5,-4,3,.15,3,'#a77c53');for(const x of [36,38])box(outside,x,.7,-5,.15,1.4,.15,'#7b9368');
 for(let i=0;i<5;i++)box(outside,37,.3+i*.27,-5.7,.9,.09,.3,'#e7bf6d');
 const slide=box(outside,37,.85,-.9,1.5,.12,4.8,'#80b1c1');slide.rotation.x=.3;
 for(const x of [36.2,37.8]){const rail=box(outside,x,1.1,-.9,.12,.3,4.8,'#dab567');rail.rotation.x=.3}
 target(outTargets,37,-6,2.2,'Go down the slide',()=>begin('slide'));
 // Roundabout and benches.
 const roundabout=new THREE.Group();roundabout.position.set(42,.3,2);outside.add(roundabout);ball(roundabout,0,0,0,1.6,'#b8a1bf').scale.set(1,.12,1);
 for(const x of [-.8,.8]){box(roundabout,x,.5,0,.1,1,.1,'#7c8b81');box(roundabout,x,.9,0,.1,.1,1.4,'#7c8b81')}
 target(outTargets,42,4,2,'Ride the roundabout',()=>begin('roundabout'));
 for(const x of [27,44]){box(outside,x,.5,7,3,.15,.7,'#8d9d78');box(outside,x,.85,7.4,3,.7,.12,'#8d9d78')}
 human(outside,28,5,'#ba91a7','Zoe');human(outside,40,-6,'#7e9fb0','Ben');
 // Large pool with deck, lanes, ladder and poolside plants.
 box(outside,36,.03,22,24,.1,16,'#e8dfc8');const water=box(outside,36,.12,22,20,.1,12,'#69bbc9');
 for(const x of [25.7,46.3])box(outside,x,.27,22,.6,.4,12.6,'#f7efdc');for(const z of [15.7,28.3])box(outside,36,.27,z,20.6,.4,.6,'#f7efdc');
 for(const x of [31,36,41])for(let z=17;z<=27;z++)ball(outside,x,.22,z,.09,z%2?'#f8e5a1':'#e5a6a2');
 for(const z of [21.5,22.5])box(outside,25.5,.6,z,.08,1.1,.08,'#718d96');
 label(outside,'Redcliff Pool · swim & relax',36,3.7,22,7);
 for(const x of [26,46]){cone(outside,x,.35,30,.45,.7,'#ac7859',8);ball(outside,x,1,30,.7,'#7c9e64')}
 human(outside,26,17,'#ac7f59','Pool supervisor');
 target(outTargets,24,22,2.7,'Enter the swimming pool',()=>panel('REDCLIFF POOL','Time for a swim.', 'Use the arrow buttons or WASD to swim. The pool has a supervisor and no countdown. Use Leave pool whenever you want.',[{title:'Enter the water',fn:()=>begin('swim')} ]));
 target(outTargets,26,17,2,'Talk to the pool supervisor',()=>panel('POOL SUPERVISOR','Enjoy your break.','Use the ladder entrance to begin swimming. You can leave whenever you like. The playground is just north of the pool.'));
 function display(){hud.hidden=false;hud.innerHTML=`<b>${mode==='swim'?'Swimming · arrows / WASD to move':mode==='swing'?'On the swing':mode==='slide'?'Down the slide!':'On the roundabout'}</b><p>${mode==='swim'?'Relax and explore the water.':'Enjoy the ride. You can stop at any time.'}</p><button id="leaveRecreation">${mode==='swim'?'Leave pool':'Stop ride'}</button>`;document.getElementById('leaveRecreation').onclick=stop}
 function begin(activity){api.prepare();close();mode=activity;elapsed=0;display();if(activity==='swim'){api.state().pos.set(28,0,22);toast('Use arrows / WASD to swim. Leave pool gets you back to the deck.')}else api.state().held.clear()}
 function stop(){if(!mode)return;const previous=mode;mode=null;hud.hidden=true;api.resetPose();const s=api.state();s.held.clear();s.pos.set(...(previous==='swim'?[24,0,22]:previous==='swing'?[30,0,-1]:previous==='slide'?[37,0,3]:[42,0,4]));toast(previous==='swim'?'Back on the pool deck.':'That was fun! Try another activity.')}
 function tick(dt){
  time+=dt;const s=api.state();
  if(mode&&s.area!=='forest'){mode=null;hud.hidden=true;api.resetPose()}
  swingPivot.rotation.x=Math.sin(time*1.5)*(mode==='swing'?.55:.12);roundabout.rotation.y+=dt*(mode==='roundabout'?1.5:.12);
  if(!mode)return;elapsed+=dt;
  if(mode==='swim'){
   api.swimPose(time);s.pos.x=Math.max(pool.x-8.5,Math.min(pool.x+8.5,s.pos.x));s.pos.z=Math.max(pool.z-4,Math.min(pool.z+4,s.pos.z));
  }else if(mode==='swing'){
   const a=swingPivot.rotation.x;s.pos.set(30,.65+2.55*(1-Math.cos(a)),-3-2.55*Math.sin(a));api.seatPose();
  }else if(mode==='slide'){
   const t=Math.min(1,elapsed/2.5);s.pos.set(37,1.2*(1-t),-3+6*t);api.seatPose();if(t===1)stop();
  }else{s.pos.set(42+Math.sin(roundabout.rotation.y)*.8,.25,2+Math.cos(roundabout.rotation.y)*.8);api.seatPose()}
 }
 function blocks(x,z){if(mode==='swim')return Math.abs(x-pool.x)>8.5||Math.abs(z-pool.z)>4;return Math.abs(x-pool.x)<10.4&&Math.abs(z-pool.z)<6.4}
 function menu(){panel('REDCLIFF · FREE TIME','Playground & big pool.','The playground and pool are east of the main school path. Choose where to go.',[{title:'Visit the playground',fn:()=>{close();api.visit(36,9)}},{title:'Visit the pool',fn:()=>{close();api.visit(24,22)}}])}
 return {menu,begin,stop,tick,blocks,pool,water,get mode(){return mode},get locksMovement(){return mode&&mode!=='swim'},get swimming(){return mode==='swim'}};
}
