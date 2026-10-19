import {createBellAudio} from './bell-audio.js';
import {buildAnimalModels} from './animal-models.js?v=imported-models-34';
export function createSchoolLife(api){
 const {THREE,box,ball,cone,label,human,mat,outside,inside,classroom,outTargets,schoolTargets,classTargets,target,panel,close}=api;
 const $=id=>document.getElementById(id);
 const timetable=[['Mathematics','Ms Vale'],['Biology','Miss Machanda'],['Latin','Miss Hilllbrecht'],['French','Madame Wenzel'],['Transformation','Miss Janz'],['German','Mister Hutter'],['History','Mister Hutter'],['Art','Miss Krieg'],['Sport','Frau Janz']];
 let period=0,elapsed=0,clock=0,room=null;
 const actors=[];let sleeping=false;
 const girls=new Set(['Lina','Amelie','Nora','Zoe','Ms Vale','Miss Machanda','Miss Hilllbrecht','Madame Wenzel','Miss Janz','Miss Krieg','Frau Janz']);
 function actor(parent,name,x,z,color,route,teacher=false){
   const root=new THREE.Group();parent.add(root);root.position.set(x,0,z);
   const person=human(root,0,0,color,name,false);
   const tag=label(root,name+(teacher?' · teacher':''),0,2.6,0,teacher?3:2);
   const ground=new THREE.Group(),bird=new THREE.Group(),left=new THREE.Group(),right=new THREE.Group();root.add(ground,bird);ground.visible=bird.visible=false;
   const i=actors.length,entry={root,person,tag,ground,bird,left,right,route,index:0,form:'human',name,teacher,parent,groundName:['Fox','Bear','Cat','Wolf'][i%4],birdName:['Owl','Eagle','Raven','Blue jay'][i%4],built:false};actors.push(entry);root.visible=!sleeping;entry.sleeping=sleeping;return entry;
 }
 for(const [i,name] of ['Lina','Felix','Amelie','Oscar','Nora','Leo','Zoe','Ben'].entries()){
   const x=i%2?1.4:-1.4,z=-16+i*4;
   const pupil=actor(outside,name,x,z,['#aa7f9d','#799c87','#b89c67'][i%3],[[x,-17],[x,15],[x+(x>0?-1:1),15],[x+(x>0?-1:1),-17]]);
   target(outTargets,x,z,1.6,'Talk to '+name,()=>panel('REDCLIFF PUPIL',name,'“See you in class! Open Classes for our timetable. In Transformation class, try your ground form and your bird form — we’ll practise together.”'));
   pupil.interaction=outTargets.at(-1);
 }
 function form(actor,f){
   if(actor.form===f)return;
   if(f!=='human'&&!actor.built){buildAnimalModels({THREE,box,ball,cone,models:api.models},actor.groundName,actor.birdName,actor.ground,actor.bird,actor.left,actor.right);actor.built=true}
   actor.form=f;actor.person.visible=f==='human';actor.ground.visible=f==='wolf';actor.bird.visible=f==='bird';
   actor.tag.position.y=f==='human'?2.6:2;
 }
 let soundStatus='Bell sound is on. Use Test bell sound to check it.';
 const bellAudio=createBellAudio(window,status=>{soundStatus=status;const el=$('bellSoundStatus');if(el)el.textContent=status});
 const unlockSound=()=>{void bellAudio.unlock()};
 document.addEventListener('pointerdown',unlockSound,{capture:true});
 document.addEventListener('keydown',unlockSound,{capture:true});
 function chime(){return bellAudio.ring()}
 function notice(){if(sleeping){$('classStatus').textContent='☾ School is asleep · classes resume at 07:00';return}const [subject,teacher]=timetable[period];$('classStatus').textContent=`🔔 ${subject} · ${teacher} · ${Math.ceil(90-elapsed)}s to next class`}
 function bell(){if(sleeping){api.toast('Everyone is asleep. The school bell resumes at 07:00.');return}period=(period+1)%timetable.length;elapsed=0;chime();notice();api.toast('Class bell! '+timetable[period][0]+' with '+timetable[period][1]+'. Open Classes to join.');}
 function classes(){panel('REDCLIFF · CLASS TIMETABLE','A school full of life.',`${sleeping?'Everyone is in bed until 07:00. The classrooms are empty; you can study by yourself.':'Now: '+timetable[period][0]+' with '+timetable[period][1]+'.'} The bell rings every 90 seconds of active play during waking hours. You can visit any classroom. Transformation classmates copy your human, ground or bird form. <span id="bellSoundStatus" role="status">${soundStatus}</span>`,[
   ...timetable.map(([s,t])=>({title:s+' classroom',sub:t+(s==='Transformation'?' · transform together':' · study with your class'),fn:()=>{close();api.visit(s);}})),
   {title:'Visit the principal’s office',sub:'Headmistress Rowan · school guidance',fn:()=>{close();api.visit('Principal’s office')}},
   {title:'Visit the cafeteria',sub:'Food, drinks, plants & a quiet break',fn:()=>{close();api.visit('Cafeteria')}},
   {title:'Ring the next class bell',sub:'Advance the timetable now',fn:()=>{bell();classes()}},
   {title:'Test bell sound',sub:'Play the bell now without changing class',fn:()=>{bellAudio.setMuted(false);void chime()}},
   {title:bellAudio.muted?'Turn bell sound on':'Mute bell sound',sub:'The visual bell notice stays on',fn:()=>{bellAudio.setMuted(!bellAudio.muted);classes()}}
 ])}
 for(const [i,[s]] of timetable.entries()){
   const x=i%2?-11:11,z=-8+Math.floor(i/2)*4;
   box(inside,x,1.3,z,.12,2.6,1.7,'#708e79');label(inside,s,x,3,z,2.8);
   target(schoolTargets,x,z,1.8,'Enter '+s+' classroom',()=>api.visit(s));
 }
 box(inside,-11,1.3,8,.12,2.6,1.7,'#708e79');label(inside,'Cafeteria',-11,3,8,3);
 target(schoolTargets,-11,8,1.8,'Enter the cafeteria',()=>api.visit('Cafeteria'));
 let meal=null,drink=null;
 function cafeteriaMenu(){panel('REDCLIFF CAFETERIA','A break among the plants.',`Choose something to eat and drink, or sit with your classmates. ${meal?'Your food: '+meal+'. ':''}${drink?'Your drink: '+drink+'.':''}`, [
  ...['Vegetable soup & bread','Fruit & yogurt','Bean & rice bowl'].map(food=>({title:food,sub:'Choose lunch',fn:()=>{meal=food;api.toast('You collect '+food.toLowerCase()+' on a tray.');cafeteriaMenu()}})),
  ...['Water','Milk','Apple juice'].map(value=>({title:value,sub:'Choose a drink',fn:()=>{drink=value;api.toast('You fill your cup with '+value.toLowerCase()+'.');cafeteriaMenu()}})),
  {title:'Sit, eat & relax',sub:'Join a table by the plants',fn:()=>{close();api.relax(meal,drink)}},
 ])}
 function cafeteria(){
  box(classroom,0,-.2,0,24,.4,23,'#e3d6b9');
  box(classroom,0,2.5,-11,24,5,.2,'#d5e2bd');
  for(const x of [-12,12]){box(classroom,x,2.5,0,.2,5,23,'#d5e2bd');for(const z of [-6,0,6])box(classroom,x*.99,3,z,.08,2.3,3,'#b6dbe0')}
  label(classroom,'The Greenhouse Cafeteria',0,4.5,-10,7);
  const pot=(x,z,size=1)=>{const g=new THREE.Group();g.position.set(x,0,z);g.scale.setScalar(size);classroom.add(g);cone(g,0,.4,0,.5,.8,'#ac7558',8).rotation.z=Math.PI;box(g,0,1,0,.09,1.3,.09,'#6a8654');for(let i=0;i<6;i++){const a=i*Math.PI/3,m=ball(g,Math.cos(a)*.4,1.2+(i%2)*.4,Math.sin(a)*.4,.4,i%2?'#69945e':'#8cad6a');m.scale.set(1,.6,1)}g.userData.plant=true;return g};
  for(const x of [-10,10])for(const z of [-8,-3,3,8])pot(x,z,1.1);
  for(const x of [-3,3])pot(x,-10,.7);
  for(const x of [-2.6,2.6])for(const z of [0,7])pot(x,z,.85);
  box(classroom,0,.8,-8,14,1.6,1.4,'#b28d63');box(classroom,0,1.65,-8,14,.14,1.6,'#eee1c7');
  for(const [i,col] of ['#b9c578','#df9a67','#e1c981'].entries()){const x=-4+i*4;box(classroom,x,1.8,-8,2,.12,.9,'#738d80');for(let j=0;j<3;j++)ball(classroom,x-.5+j*.5,1.98,-8,.19,col)}
  label(classroom,'Lunch & drinks',0,3,-8,4);target(classTargets,0,-6,3,'Choose food & drinks',cafeteriaMenu);
  for(const [i,name] of ['Lina','Felix','Amelie','Oscar','Nora','Leo'].entries()){
   const x=i%2?-5:5,z=-3+Math.floor(i/2)*4;
   box(classroom,x,.85,z,2.5,.14,1.5,'#b28d63');for(const dx of [-.9,.9])box(classroom,x+dx,.4,z,.15,.8,.9,'#8d7151');
   box(classroom,x,.45,z-1.25,2,.12,.65,'#7c9d7b');for(const dx of [-.7,.7])box(classroom,x+dx,.22,z-1.25,.12,.45,.5,'#7c9d7b');
   box(classroom,x,.45,z+1.25,2,.12,.65,'#7c9d7b');for(const dx of [-.7,.7])box(classroom,x+dx,.22,z+1.25,.12,.45,.5,'#7c9d7b');
   const pupil=actor(classroom,name,x,z+1.2,['#aa7f9d','#799c87','#b89c67'][i%3],[[x,z+1.2]]);pupil.seated=true;pupil.person.position.y=-.27;
   for(const index of [3,6]){pupil.person.children[index].rotation.x=-Math.PI/2;pupil.person.children[index].position.z=-.22}
   ball(classroom,x,.99,z,.27,'#efdbb3').scale.set(1,.25,1);ball(classroom,x,1.06,z,.17,i%2?'#db9c6b':'#96b562');
   box(pupil.person.children[7],0,-.15,-.12,.16,.2,.16,'#f2e9cd');
   target(classTargets,x,z+1.2,1.8,'Relax with '+name,()=>panel('CAFETERIA CLASSMATE',name,'“It’s nice to take a break together. I like watching the plants grow. Shall we sit and have lunch?”',[{title:'Sit with my classmates',fn:()=>{close();api.relax(meal,drink)}}]));pupil.interaction=classTargets.at(-1);
  }
  label(classroom,'Exit to learning hall',0,2.8,10,4);target(classTargets,0,10,2.3,'Leave cafeteria',()=>api.leave());
 }
 function principalOffice(){
  box(classroom,0,-.2,0,24,.4,23,'#c8ad88');
  box(classroom,0,2.5,-11,24,5,.2,'#b8c9b3');
  for(const x of [-12,12]){box(classroom,x,2.5,0,.2,5,23,'#d8dfc8');for(const z of [-6,3])box(classroom,x*.99,3,z,.06,2.2,3,'#a9cfce')}
  label(classroom,'Principal’s office · Headmistress Rowan',0,4.3,-10,8);
  box(classroom,0,.035,-2,10,.06,9,'#91a69c');
  box(classroom,0,1,-5,5.5,.2,2.3,'#a58059');for(const x of [-2.3,2.3])box(classroom,x,.5,-5,.22,1,.22,'#876949');
  box(classroom,-1,1.14,-5,.9,.08,.65,'#eee6cd');box(classroom,.5,1.16,-5,.7,.12,.5,'#718e7c');
  box(classroom,1.8,1.45,-5,.08,.7,.08,'#6b7161');cone(classroom,1.8,1.85,-5,.45,.5,'#e5c584');
  box(classroom,0,.6,-7,.9,.12,.9,'#708d80');box(classroom,0,1.25,-7.4,.9,1.3,.15,'#708d80');
  const rowan=actor(classroom,'Headmistress Rowan',0,-7,'#566d86',[[0,-7]],true);
  target(classTargets,0,-3,2.5,'Talk to Headmistress Rowan',()=>api.principal());rowan.interaction=classTargets.at(-1);rowan.fixedInteraction=true;rowan.facePlayer=true;rowan.root.rotation.y=Math.PI;
  for(const x of [-8,8]){
   box(classroom,x,1.8,-8,3.2,3.6,.7,'#9d805c');
   for(const y of [.5,1.6,2.7]){box(classroom,x,y,-7.55,3,.1,.8,'#806746');for(let i=0;i<6;i++)box(classroom,x-1.2+i*.45,y+.4,-7.55,.3,.7,.35,['#889e79','#be9290','#91a9b3'][i%3])}
   cone(classroom,x,.4,5,.5,.8,'#b68e6b');ball(classroom,x,1.3,5,.9,'#7e9f6d');
  }
  for(const x of [-2,2]){box(classroom,x,.5,1,1.4,.15,1.2,'#9aafa1');box(classroom,x,1.1,1.55,1.4,1.2,.15,'#9aafa1');for(const dx of [-.5,.5])box(classroom,x+dx,.25,1,.12,.5,.8,'#876949')}
  box(classroom,7,2.6,-10.8,3,1.7,.12,'#9b815b');label(classroom,'Kindness · curiosity · courage',7,2.6,-10.6,4);
  target(classTargets,7,-8.5,2,'Read the principal’s noticeboard',()=>panel('PRINCIPAL’S NOTICEBOARD','Welcome to Redcliff.','Be kind to your classmates, stay curious, and protect our school’s secret. Classes start at 07:00. Everyone rests from 20:00 until morning. If you need help with the school mystery, speak to Headmistress Rowan during the day.'));
  label(classroom,'Exit to learning hall',0,2.8,10,4);target(classTargets,0,10,2.3,'Leave principal’s office',()=>api.leave());
  setSleeping(sleeping);
 }
 function open(subject){
   room=subject;
   for(let i=actors.length-1;i>=0;i--)if(actors[i].parent===classroom)actors.splice(i,1);
   classroom.traverse(m=>{m.geometry?.dispose();if(m.isSprite){m.material.map?.dispose();m.material.dispose()}});classroom.clear();classTargets.length=0;
   if(subject==='Cafeteria'){cafeteria();setSleeping(sleeping);return}
   if(subject==='Principal’s office'){principalOffice();return}
   const palette={Mathematics:'#a5c3cc',Biology:'#b3c79b',German:'#b8c8d5',History:'#cbbb9d',Art:'#d7b4ca',Sport:'#b2cbbd',Latin:'#c9b6d2',French:'#d7b4ab',Transformation:'#c4bc96'};
   box(classroom,0,-.2,0,24,.4,23,'#decaa5');box(classroom,0,2.4,-11,24,4.8,.2,palette[subject]);
   box(classroom,-12,2.4,0,.2,4.8,23,palette[subject]);box(classroom,12,2.4,0,.2,4.8,23,palette[subject]);
   box(classroom,0,2.4,-10.8,7,2,.12,'#365f4b');label(classroom,subject+' classroom',0,4,-10.5,6);
   const teacherName=timetable.find(([s])=>s===subject)[1];
   const teacher=actor(classroom,teacherName,0,-7,'#536e89',[[-3,-7],[3,-7]],true);
   target(classTargets,0,-7,2.5,'Talk to '+teacherName,()=>subject==='Transformation'?panel('TRANSFORMATION TEACHER',teacherName,'“Press 2 for your ground animal or 3 for your bird. Your classmates and I will transform too! Press 1 to return to human.”'):teach(subject,teacherName));teacher.interaction=classTargets.at(-1);
   for(const [i,name] of ['Lina','Felix','Amelie','Oscar','Nora','Leo'].entries()){
     const x=(i%3-1)*5,z=i<3?-2:4;
     if(subject!=='Transformation'){box(classroom,x,.65,z-1,2,1.3,1,'#a28056');box(classroom,x,.4,z+.7,.9,.8,.8,'#78958b')}
     const pupil=actor(classroom,name,x,z,['#aa7f9d','#799c87','#b89c67'][i%3],subject==='Transformation'?[[x,z],[x+1.2,z+1],[x,z+1.5]]:[[x,z],[x+.45,z+.4]]);
   }
   // A reserved player desk, separate from the six classmates' places.
   box(classroom,-8,.78,6.7,2.5,.14,1.3,'#ad865d');for(const x of [-8.9,-7.1])for(const z of [6.25,7.15])box(classroom,x,.36,z,.12,.72,.12,'#876b4d');
   box(classroom,-8,.5,8,.9,.12,.85,'#90a99c');box(classroom,-8,.95,8.4,.9,.85,.12,'#90a99c');
   box(classroom,-8.3,.9,6.7,.5,.08,.4,'#7a9d86');box(classroom,-7.6,.88,6.7,.5,.02,.4,'#f6edd7');
   label(classroom,'Your desk · sit & study',-8,2.8,6.7,3.8);
   target(classTargets,-8,8,2,'Sit at your classroom desk',()=>api.sitAtDesk(()=>subject==='Transformation'?panel('TRANSFORMATION CLASS',teacherName,'“Practise switching between human, ground animal and bird using 1, 2 and 3. Your classmates will practise with you.”'):teach(subject,teacherName)));
   label(classroom,'Exit to learning hall',0,2.8,10,4);target(classTargets,0,10,2.3,'Leave classroom',()=>api.leave());setSleeping(sleeping);
 }
 const introductions={
  German:['What does “Guten Morgen” mean?',['Good morning','Good night','Thank you'],0,'Guten Morgen means good morning. Guten Abend means good evening.'],
  History:['Which would be a primary source about a past event?',['A diary written by a witness at the time','A modern film imagining the event','A textbook summary written much later'],0,'A witness’s contemporary diary is a primary source. It still needs careful checking for viewpoint and accuracy.'],
  Art:['Which colour is opposite blue on a traditional artists’ colour wheel?',['Green','Orange','Purple'],1,'Blue and orange are complementary colours on the traditional red–yellow–blue colour wheel.'],
  Sport:['How should you begin a sports session?',['Start with your hardest sprint','Prepare with a gradual warm-up','Hold your breath'],1,'A gradual warm-up prepares you for the movements in the session. Follow your teacher’s instructions.']
 };
 function teach(subject,teacher){
  if(subject==='Biology')return api.study('Science');
  const q=introductions[subject];if(!q)return api.study(subject);
  panel(subject.toUpperCase()+' · '+teacher,q[0],'Think it through with your teacher.',q[1].map((answer,i)=>({title:answer,fn:()=>panel(subject.toUpperCase(),i===q[2]?'That’s right!':'Try thinking again.',i===q[2]?q[3]:'Read the question carefully, then choose another answer.',[{title:i===q[2]?'Practise again':'Try again',fn:()=>teach(subject,teacher)}])})));
 }
 function tick(dt){
   clock+=dt;if(!sleeping){elapsed+=dt;if(elapsed>=90)bell()}notice();
   const state=api.state();
   for(const a of actors){
     a.root.visible=!sleeping;a.sleeping=sleeping;if(a.interaction)a.interaction.enabled=!sleeping;
     if(sleeping)continue;
     const inClass=a.parent===classroom;
     if(inClass&&state.area!=='classroom'||!inClass&&state.area!=='forest')continue;
     const transform=inClass&&room==='Transformation';
     // Outside, pupils join a nearby player's transformation practice as well.
     const near=!inClass&&Math.hypot(a.root.position.x-state.pos.x,a.root.position.z-state.pos.z)<8;
     form(a,transform||near?state.form:'human');
     const [x,z]=a.route[a.index],dx=x-a.root.position.x,dz=z-a.root.position.z,d=Math.hypot(dx,dz);
     if(d<.12)a.index=(a.index+1)%a.route.length;
     else{const step=Math.min(d,dt*(inClass?.65:1.25));a.root.position.x+=dx/d*step;a.root.position.z+=dz/d*step;a.root.rotation.y=Math.atan2(-dx,-dz)}
     if(a.facePlayer){const dx=state.pos.x-a.root.position.x,dz=state.pos.z-a.root.position.z;if(Math.hypot(dx,dz)>.1){const angle=Math.atan2(-dx,-dz),delta=Math.atan2(Math.sin(angle-a.root.rotation.y),Math.cos(angle-a.root.rotation.y));a.root.rotation.y+=delta*(1-Math.exp(-dt*8))}}
     if(a.seated){a.person.children[7].rotation.x=-.35+Math.sin(clock*1.5+actors.indexOf(a))*.25}
     if(!a.seated&&!a.facePlayer){for(const [index,sign] of [[3,1],[6,-1],[4,-1],[7,1]])a.person.children[index].rotation.x=d>.12?Math.sin(clock*7+actors.indexOf(a))*.22*sign:0}a.person.rotation.z=Math.sin(clock*8+actors.indexOf(a))*.012;
     a.bird.position.y=a.form==='bird'?.65+Math.sin(clock*3)*.15:0;
     a.left.rotation.z=Math.sin(clock*10)*.35;a.right.rotation.z=-Math.sin(clock*10)*.35;
     if(a.interaction&&!a.fixedInteraction){a.interaction.x=a.root.position.x;a.interaction.z=a.root.position.z}
   }
 }
 function setSleeping(value){sleeping=value;for(const a of actors){a.root.visible=!value;a.sleeping=value;if(a.interaction)a.interaction.enabled=!value}notice()}
 notice();return {openPrincipal:()=>api.visit('Principal’s office'),setSleeping,classes,open,tick,bell,actors,cafeteriaMenu,get subject(){return room},get period(){return period}};
}
