import {createSharedHut} from './shared-hut.js?v=identities-30';
import {buildAnimalModels} from './animal-models.js?v=imported-models-34';
export function createCustomization(api){
  const {THREE,progress,show,panel,close,save,box,ball,cone,mat,humanBody,wolfBody,birdBody,hutInside,hutTargets,outside,outTargets,target,label,setForm}=api;
  const $=id=>document.getElementById(id);
  const base={preset:'Sierra',hair:'medium',hairColor:'#554336',shirt:'#8d819e',pants:'#485c55',skin:'#dba77f',ground:'Wolf',bird:'Blue jay'};
  const animals={Wolf:['#7c8790',1,1],Fox:['#ce7840',.85,1.3],Cat:['#c3a085',.7,.8],Bear:['#805b42',1.4,.5]};
  const birds={'Blue jay':'#4c99c4',Owl:'#987c58',Raven:'#333b4c',Eagle:'#8c6546'};
  const p={...base,...progress.character};
  for(const [key,opts] of Object.entries({hair:['short','medium','long'],ground:Object.keys(animals),bird:Object.keys(birds),preset:['Sierra','Custom']}))if(!opts.includes(p[key]))p[key]=base[key];
  for(const key of ['hairColor','shirt','pants','skin'])if(!/^#[0-9a-f]{6}$/i.test(p[key]))p[key]=base[key];
  progress.character=p;
  const types={bed:'Bed',desk:'Desk',shelf:'Bookshelf',books:'Study books',chair:'Chair',rug:'Striped rug',roundrug:'Round rug',starrug:'Star rug',lamp:'Floor lamp',plant:'Leafy plant',poster:'Framed poster',wardrobe:'Wardrobe',nightstand:'Bedside table',beanbag:'Beanbag',clock:'Clock',chest:'Storage chest',guitar:'Guitar stand'};
  const validCell=(x,z)=>Number.isInteger(x)&&Number.isInteger(z)&&x>=-4&&x<=4&&z>=-4&&z<=4&&!(x===0&&z>=3);
  progress.furniture=(Array.isArray(progress.furniture)?progress.furniture:[]).filter((f,i,a)=>f&&types[f.type]&&validCell(f.x,f.z)&&a.findIndex(g=>g?.x===f.x&&g?.z===f.z)===i).slice(0,36).map((f,i)=>({...f,id:i+1,rotation:[0,1,2,3].includes(f.rotation)?f.rotation:0,subject:['Science','Mathematics','Latin','French'].includes(f.subject)?f.subject:'Science',color:/^#[0-9a-f]{6}$/i.test(f.color)?f.color:'#b79ac0',deskItem:['computer','books','plant','empty'].includes(f.deskItem)?f.deskItem:'computer'}));
  if(!progress.furniture.some(f=>f.type==='bed'))progress.furniture.push({id:Math.max(0,...progress.furniture.map(f=>f.id))+1,type:'bed',x:-3,z:-3,rotation:0,subject:'Science'});
  const cells=f=>f.type==='bed'?[[f.x,f.z],[f.x+[0,1,0,-1][f.rotation],f.z+[1,0,-1,0][f.rotation]]]:[[f.x,f.z]];
  const fits=(f)=>cells(f).every(([x,z])=>validCell(x,z)&&!progress.furniture.some(other=>other.id!==f.id&&cells(other).some(([ox,oz])=>ox===x&&oz===z)));
  const hair=new THREE.Group();hair.userData.personModel=true;humanBody.add(hair);
  let lastGround,lastBird;
  function appearance(){
    humanBody.traverse(m=>{if(m.userData.skinPart)m.material=mat(p.skin);if(m.userData.hairPart)m.material=mat(p.hairColor);if(m.userData.shirtPart)m.material=mat(p.shirt)});
    const c=humanBody.children;c[0].material=mat(p.shirt);c[1].material=mat(p.skin);c[2].material=mat(p.hairColor);
    for(const i of [3,6])c[i].material=mat(p.pants);
    for(const i of [4,7])c[i].material=mat(p.skin);
    while(hair.children.length){const m=hair.children[0];m.geometry?.dispose();hair.remove(m)}
    if(p.hair!=='short')box(hair,0,p.hair==='long'?1.64:1.77,.12,.31,p.hair==='long'?.61:.28,.14,p.hairColor);
    if(lastGround!==p.ground||lastBird!==p.bird){buildAnimalModels(api,p.ground,p.bird,wolfBody,birdBody,api.wingL,api.wingR);lastGround=p.ground;lastBird=p.bird}
    document.querySelector('[data-form="wolf"]').innerHTML=`🐾<span>2 · ${p.ground}</span>`;
    document.querySelector('[data-form="bird"]').innerHTML=`🪶<span>3 · ${p.bird}</span>`;
    save();
  }
  function creator(start=false){
    show(`<small>MAKE YOUR WINDWALKER</small><h2>Your look. Your two animals.</h2><p>Keep Sierra or create your own character. Choose one ground animal and one bird. Your choices appear in the 3D world and save here.</p><div class="choices"><button class="choice" id="sierraPreset">Use Sierra · wolf & blue jay</button></div><div class="subject-settings"><label>Hair length<select id="hairLength">${['short','medium','long'].map(v=>`<option ${p.hair===v?'selected':''}>${v}</option>`).join('')}</select></label>${[['hairColor','Hair colour'],['skin','Skin tone'],['shirt','Shirt colour'],['pants','Pants colour']].map(([k,n])=>`<label>${n}<input type="color" data-color="${k}" value="${p[k]}"></label>`).join('')}<label>Ground animal<select id="groundAnimal">${Object.keys(animals).map(v=>`<option ${p.ground===v?'selected':''}>${v}</option>`).join('')}</select></label><label>Bird<select id="birdAnimal">${Object.keys(birds).map(v=>`<option ${p.bird===v?'selected':''}>${v}</option>`).join('')}</select></label></div><div id="avatarPreview" aria-label="Avatar preview"></div><p id="avatarSummary" role="status"></p><button class="primary" id="avatarDone">${start?'Start my adventure →':'Save & return →'}</button>`);
    const preview=()=>{
      $('avatarSummary').textContent=`${p.preset} · ${p.hair} hair · ${p.ground} & ${p.bird}`;
      $('avatarPreview').innerHTML=`<svg viewBox="0 0 180 160" role="img" aria-label="Your character colours and hair"><rect width="180" height="160" rx="16" fill="#e3ead6"/><path d="M65 55h50v${p.hair==='long'?62:p.hair==='medium'?32:10}H65z" fill="${p.hairColor}"/><circle cx="90" cy="47" r="21" fill="${p.skin}"/><path d="M69 44q0-35 42 0v-10q-21-30-42 0z" fill="${p.hairColor}"/><rect x="67" y="70" width="46" height="40" rx="8" fill="${p.shirt}"/><path d="M70 110h17v36H70zm23 0h17v36H93z" fill="${p.pants}"/><circle cx="83" cy="48" r="2"/><circle cx="97" cy="48" r="2"/></svg>`;
    };
    const change=(key,value)=>{p[key]=value;p.preset='Custom';appearance();preview()};
    $('hairLength').onchange=e=>change('hair',e.target.value);$('groundAnimal').onchange=e=>change('ground',e.target.value);$('birdAnimal').onchange=e=>change('bird',e.target.value);
    $('card').querySelectorAll('[data-color]').forEach(el=>el.oninput=()=>change(el.dataset.color,el.value));
    $('sierraPreset').onclick=()=>{Object.assign(p,base);appearance();creator(start)};
    $('avatarDone').onclick=()=>{appearance();if(start)api.start();else close()};preview();
  }
  const furnishing=new THREE.Group();hutInside.add(furnishing);let placedTargets=[];
  const hutLayout=createSharedHut({...api,edit:()=>roomEditor(),move:(x,z)=>api.move(x,z),talk:api.talk});
  function rebuild(){
    furnishing.traverse(m=>m.geometry?.dispose());furnishing.clear();
    for(const t of placedTargets){const index=hutTargets.indexOf(t);if(index>=0)hutTargets.splice(index,1)}placedTargets=[];
    for(const f of progress.furniture){
      const g=new THREE.Group();g.position.set(f.x-9,0,f.z-5);g.rotation.y=f.rotation*Math.PI/2;furnishing.add(g);
      const accent=f.color||'#b79ac0';
      if(f.type==='bed'){box(g,0,.35,.45,.95,.7,1.8,'#876d54');box(g,0,.75,.45,.9,.15,1.7,accent);box(g,0,.87,-.08,.8,.1,.4,'#f4ead6')}else if(f.type==='desk'){
        box(g,0,.9,0,.95,.12,.8,accent);for(const x of [-.35,.35])for(const z of [-.25,.25])box(g,x,.43,z,.1,.86,.1,'#796047');
        if((f.deskItem||'computer')==='computer'){box(g,0,1.25,-.2,.62,.44,.09,'#344b50');box(g,0,1.26,-.14,.52,.33,.02,'#8ac9c1');box(g,0,1,.15,.55,.04,.2,'#52676b')}
        else if(f.deskItem==='books'){for(let i=0;i<3;i++)box(g,0,1.02+i*.1,0,.55,.1,.4,['#71936a','#b88477','#819fbc'][i])}
        else if(f.deskItem==='plant'){box(g,0,1.08,0,.25,.25,.25,'#b78d68');ball(g,0,1.4,0,.3,'#8aac69')}
      }else if(f.type==='shelf'){
        box(g,0,1,0,.95,2,.5,accent);for(const y of [.4,1,1.6]){box(g,0,y,.28,.9,.08,.1,'#d0ac7a');for(let i=0;i<4;i++)box(g,-.32+i*.21,y+.23,.23,.13,.38,.15,['#7e9b6a','#b68574','#6f98b2','#b7a35d'][i])}
      }else if(f.type==='books'){for(let i=0;i<3;i++)box(g,0,.08+i*.1,0,.65,.1,.5,['#779b6a','#b68574','#6f98b2'][i])}
      else if(f.type==='chair'){box(g,0,.5,0,.65,.1,.65,accent);box(g,0,.9,.28,.65,.8,.1,accent);for(const x of [-.23,.23])for(const z of [-.23,.23])box(g,x,.25,z,.08,.5,.08,'#796047')}
      else if(f.type==='wardrobe'){box(g,0,1.15,0,.9,2.3,.8,'#aa8761');for(const x of [-.23,.23]){box(g,x,1.15,.42,.42,2.1,.04,accent);ball(g,x*.25,1.15,.47,.035,'#e4c885')}}
      else if(f.type==='nightstand'){box(g,0,.5,0,.85,1,.75,'#aa8761');box(g,0,.65,.4,.7,.3,.04,accent);ball(g,0,.65,.44,.045,'#e4c885');box(g,0,1.05,0,.8,.08,.7,'#d9bd93')}
      else if(f.type==='lamp'){ball(g,0,.08,0,.32,'#7b8b7b').scale.y=.2;box(g,0,.85,0,.06,1.6,.06,'#7b8b7b');cone(g,0,1.8,0,.42,.55,accent,10);ball(g,0,1.62,0,.14,'#fff0b4')}
      else if(f.type==='plant'){cone(g,0,.3,0,.3,.6,'#b08766',8).rotation.z=Math.PI;box(g,0,.8,0,.05,1,.05,'#5e845b');for(let i=0;i<5;i++){const a=i*Math.PI*.4;const leaf=ball(g,Math.cos(a)*.22,.8+i*.12,Math.sin(a)*.22,.25,i%2?'#89aa6c':'#5c885d');leaf.scale.set(1,.5,1)}}
      else if(f.type==='beanbag'){ball(g,0,.35,0,.48,accent).scale.set(1,.7,1);ball(g,0,.65,.18,.32,accent).scale.set(1,.8,.7)}
      else if(f.type==='poster'){box(g,0,1.4,0,.92,1.25,.1,'#a8865e');box(g,0,1.4,.06,.8,1.1,.025,accent);ball(g,0,1.65,.09,.17,'#f9df93').scale.z=.1;cone(g,-.15,1.2,.1,.24,.4,'#eef1df',3).scale.z=.1;box(g,0,.55,0,.07,1.1,.07,'#a8865e')}
      else if(f.type==='clock'){ball(g,0,1.7,0,.4,accent).scale.z=.2;ball(g,0,1.7,.085,.34,'#faf2df').scale.z=.1;box(g,0,1.83,.13,.035,.23,.02,'#42594a');box(g,.1,1.7,.13,.2,.035,.02,'#42594a');box(g,0,.75,0,.06,1.5,.06,'#a8865e')}
      else if(f.type==='chest'){box(g,0,.35,0,.9,.7,.7,'#a68660');box(g,0,.74,0,.95,.1,.75,accent);box(g,0,.4,-.36,.14,.14,.04,'#e4c885')}
      else if(f.type==='guitar'){ball(g,0,.55,0,.33,accent).scale.set(.85,1,.3);ball(g,0,.83,0,.23,accent).scale.set(.9,1,.4);box(g,0,1.25,0,.12,.75,.1,'#a47b50');ball(g,0,.7,.1,.09,'#4d4b3d').scale.z=.1;box(g,0,.12,.12,.6,.1,.4,'#6f7768')}
      else if(f.type==='roundrug'){ball(g,0,.025,0,.48,accent).scale.y=.045;ball(g,0,.04,0,.32,'#f0dcc5').scale.y=.045}
      else if(f.type==='starrug'){box(g,0,.025,0,.9,.035,.9,accent);for(let i=0;i<5;i++){const a=i*Math.PI*.4;const star=cone(g,Math.sin(a)*.18,.05,Math.cos(a)*.18,.16,.035,'#fff0b5',3);star.rotation.y=a}}
      else{box(g,0,.025,0,.95,.04,.95,accent);for(const x of [-.3,0,.3])box(g,x,.05,0,.1,.01,.85,'#f0dcc5')}

      if(f.type==='bed'){target(hutTargets,f.x-9,f.z-5,1.8,'Lie in your bed',()=>api.rest('bed',{x:f.x-9,z:f.z-5,rotation:f.rotation}));placedTargets.push(hutTargets.at(-1))}
      if(['desk','shelf','books'].includes(f.type)){target(hutTargets,f.x-9,f.z-5,1.15,`Study ${f.subject} · ${types[f.type]}`,()=>api.study(f.subject));placedTargets.push(hutTargets.at(-1))}
    }
    save();
  }
  let selected=null,addType='desk';
  function roomEditor(){
    api.stand();
    const current=progress.furniture.find(f=>f.id===selected);
    show(`<small>YOUR HUT · ROOM PLANNER</small><h2>Make room for your ideas.</h2><p>Choose furniture, then tap an empty square to place it. Tap a filled square to select it, then an empty square to move it. This is your private bedroom. The bottom is the door. Beds use two squares; shelves and desks can be rotated. Your two roommates each have their own bedroom. Up to 36 pieces. Add cosy touches to fill free squares without moving your things.</p><div class="choices"><button class="choice" id="cosyRoom">Add cosy touches · keep my furniture where it is</button></div><label class="notes-label" for="furnitureType">Add furniture</label><select id="furnitureType">${Object.entries(types).map(([k,v])=>`<option value="${k}" ${addType===k?'selected':''}>${v}</option>`).join('')}</select><div class="room-grid" role="group" aria-label="Hut floor plan">${Array.from({length:81},(_,i)=>{const x=i%9-4,z=Math.floor(i/9)-4,f=progress.furniture.find(f=>cells(f).some(([cx,cz])=>cx===x&&cz===z));return `<button ${validCell(x,z)?'':'disabled'} data-cell="${x},${z}" aria-label="${x}, ${z}: ${f?types[f.type]:'empty'}" class="${f?.id===selected?'picked':''}">${!validCell(x,z)?'×':f?{bed:'🛏',desk:'🖥',shelf:'▤',books:'📚',chair:'🪑',rug:'◇',roundrug:'◉',starrug:'★',lamp:'☀',plant:'🌿',poster:'▧',wardrobe:'▥',nightstand:'▣',beanbag:'●',clock:'◷',chest:'▰',guitar:'♪'}[f.type]:'·'}</button>`}).join('')}</div><p id="roomStatus" role="status">${current?'Selected: '+types[current.type]+' · facing '+['north','east','south','west'][current.rotation]:'Choose a square to place '+types[addType]+'.'}</p>${current?'<div class="swatches"><button id="rotatePiece">Rotate ↻</button><button id="removePiece">Remove selected</button></div><label class="notes-label" for="bookSubject">Study subject / books on this furniture</label><select id="bookSubject">'+['Science','Mathematics','Latin','French'].map(s=>`<option ${current.subject===s?'selected':''}>${s}</option>`).join('')+'</select>':''}<div id="colourOptions"></div><div id="deskOptions"></div><div class="choices"><button class="primary" id="roomDone">Save & see my bedroom →</button></div>`);
    $('cosyRoom').onclick=()=>{
      let added=0;for(const type of ['lamp','plant','wardrobe','nightstand','beanbag','poster','clock','chest','guitar','roundrug','starrug']){
       if(progress.furniture.some(f=>f.type===type))continue;
       for(const [x,z] of [[-4,-4],[4,-4],[4,0],[-4,0],[-2,1],[2,1],[3,3],[-3,3],[1,-2],[-1,-2],[2,0],[-2,0],[-4,3],[4,3],[1,1],[-1,1]]){
        const f={id:Math.max(0,...progress.furniture.map(f=>f.id))+1,type,x,z,rotation:0,subject:'Science',color:['#b79ac0','#84ada0','#d2a070'][added%3]};
        if(progress.furniture.length<36&&fits(f)){progress.furniture.push(f);added++;break}
       }
      }rebuild();roomEditor();$('roomStatus').textContent=added?`Added ${added} cosy touches. You can move, rotate or remove each one.`:'No free space for more decorations. Move or remove something first.';
    };
    if(current){$('colourOptions').innerHTML='<label class="notes-label" for="furnitureColour">Decoration colour / accent</label><input id="furnitureColour" type="color" value="'+(current.color||'#b79ac0')+'">';$('furnitureColour').oninput=()=>{current.color=$('furnitureColour').value;rebuild()}}
    $('furnitureType').onchange=()=>{addType=$('furnitureType').value;selected=addType==='bed'?progress.furniture.find(f=>f.type==='bed')?.id:null;roomEditor()};
    $('card').querySelectorAll('[data-cell]').forEach(b=>b.onclick=()=>{const [x,z]=b.dataset.cell.split(',').map(Number),occupied=progress.furniture.find(f=>cells(f).some(([cx,cz])=>cx===x&&cz===z));if(occupied){selected=occupied.id;roomEditor();return}if(current){const candidate={...current,x,z};if(!fits(candidate)){$('roomStatus').textContent='That piece needs more space. Keep the doorway clear.';return}current.x=x;current.z=z}else{if(progress.furniture.length>=36){$('roomStatus').textContent='Your room has 36 pieces. Move or remove one first.';return}const f={id:Math.max(0,...progress.furniture.map(f=>f.id))+1,type:addType,x,z,rotation:0,subject:'Science',deskItem:'computer'};if(!fits(f)){$('roomStatus').textContent='That piece needs more space. Keep the doorway clear.';return}progress.furniture.push(f);selected=f.id}rebuild();roomEditor()});
    if(current){if(current.type==='bed'){$('removePiece').disabled=true;$('removePiece').textContent='Move your bed instead of removing it'}$('rotatePiece').onclick=()=>{const rotation=(current.rotation+1)%4;if(!fits({...current,rotation})){$('roomStatus').textContent='Not enough space to rotate here. Move the piece first.';return}current.rotation=rotation;rebuild();roomEditor()};$('removePiece').onclick=()=>{progress.furniture=progress.furniture.filter(f=>f.id!==selected);selected=null;rebuild();roomEditor()};$('bookSubject').onchange=()=>{current.subject=$('bookSubject').value;rebuild()}}
    if(current?.type==='desk'){$('deskOptions').innerHTML='<label class="notes-label" for="deskItem">On my desk</label><select id="deskItem">'+['computer','books','plant','empty'].map(item=>`<option ${current.deskItem===item?'selected':''}>${item}</option>`).join('')+'</select>';$('deskItem').onchange=()=>{current.deskItem=$('deskItem').value;rebuild()}}
    $('roomDone').onclick=()=>{rebuild();close();hutLayout.visitRoom(0)};
  }
  // Non-contact sparring uses a padded dummy: observe a cue, choose a response.
  box(outside,-10,.04,22,10,.12,9,'#d8bc83');label(outside,'Sand pit · animal training',-10,3,22,5);
  const dummy=new THREE.Group();dummy.position.set(-10,0,22);outside.add(dummy);box(dummy,0,.8,0,.7,1.6,.7,'#b29569');ball(dummy,0,1.9,0,.45,'#dfc797');
  target(outTargets,-10,22,7,'Train in the sand pit',()=>training());
  let round=0;
  function lessonTraining(){round=0;trainingRound()}
  function training(){panel('SAND PIT','Practise with your actual animal forms.','Start practical training to travel to the sand pit. Transform, dodge, tap the padded dummy, fly and land using the game controls.',[{title:'Start practical training',fn:startPractical},{title:'Read the guided lesson',fn:lessonTraining}])}
  let practice=-1,flash=0;
  const trainingHud=document.createElement('section');trainingHud.id='trainingHud';trainingHud.hidden=true;document.body.appendChild(trainingHud);
  const instructions=['Use 2 or your ground-animal button to transform.','The dummy swings high. Press Dodge to step aside.','Move close to the dummy, then press Paw tap.','Use 3 or your bird button to transform.','Use Flap / Space to fly above the dummy.','Stop flapping and land inside the sand pit.'];
  function drawTraining(message=''){
    trainingHud.hidden=false;
    trainingHud.innerHTML=`<small>SAND PIT · ${practice+1}/6</small><b>${instructions[practice]}</b><p role="status">${message}</p><div><button id="dodgeTraining">Dodge</button><button id="attackTraining">Paw tap</button><button id="exitTraining">Leave training</button></div>`;
    $('dodgeTraining').onclick=()=>{if(practice!==1)return;const s=api.trainingState();s.pos.x+=2;dummy.rotation.z=.4;practice++;drawTraining('Good dodge. Now approach the padded target.')};
    $('attackTraining').onclick=()=>{const s=api.trainingState();if(practice!==2)return;if(s.form!=='wolf'||Math.hypot(s.pos.x+10,s.pos.z-22)>3){drawTraining('Stay in your ground form and move closer to the dummy.');return}flash=1;dummy.rotation.z=-.5;practice++;drawTraining('Controlled tap! Now take flight.')};
    $('exitTraining').onclick=()=>{practice=-1;trainingHud.hidden=true;dummy.rotation.z=0};
  }
  function startPractical(){api.trainingStart();close();setForm('human');practice=0;drawTraining()}
  function tick(dt){
    if(flash>0){flash-=dt;dummy.rotation.z=-.5*Math.max(0,flash)}
    if(practice<0)return;
    const s=api.trainingState();
    if(s.area!=='forest'||Math.hypot(s.pos.x+10,s.pos.z-22)>10){practice=-1;trainingHud.hidden=true;return}
    if(practice===0&&s.form==='wolf'||practice===3&&s.form==='bird'||practice===4&&s.form==='bird'&&s.jump>1.6){practice++;drawTraining()}
    else if(practice===5&&s.jump<.05){practice=-1;trainingHud.hidden=true;dummy.rotation.z=0;progress.trainingComplete=true;save();panel('SAND PIT · PRACTICE COMPLETE','You trained in your animal forms!','You transformed, dodged, tapped the padded dummy, flew and landed. Return any time to practise again.')}
  }
  function trainingRound(){
    const steps=[['Transform into your ground animal.',[p.ground,p.bird,'Human'],0,()=>setForm('wolf'),'You are ready for ground practice.'],['The padded dummy swings high. What is the safe response?',['Rush straight in','Duck and step aside','Close your eyes'],1,()=>{dummy.rotation.z=.25},'You avoided the swing. Watch the cue before responding.'],['The dummy is still and its padded target is open.',['Controlled paw tap, then step back','Keep charging','Strike a classmate'],0,()=>{dummy.rotation.z=-.25},'A controlled practice tap! We only practise on padded targets.'],['Now transform for aerial practice.',[p.ground,'Human',p.bird],2,()=>setForm('bird'),'Your bird form is ready.'],['A low rope crosses your practice route.',['Dive into it','Flap above it, then land in the clear area','Keep your eyes closed'],1,()=>{dummy.rotation.z=0},'Good route planning. Use Flap outside this lesson to practise flying.']];
    if(round>=steps.length){progress.trainingComplete=true;save();return panel('SAND PIT · TRAINING COMPLETE','Control before speed.','You practised transformation, observing a cue, evasion and a controlled attack on a padded dummy. Your training badge is saved. You can repeat this untimed lesson whenever you like.')}
    const [q,choices,right,action,explanation]=steps[round];
    show(`<small>SAND PIT · ${round+1}/${steps.length}</small><h2>${q}</h2><p>Friendly, non-contact animal training. No injuries, lives lost or countdowns.</p><div class="choices">${choices.map((c,i)=>`<button class="choice" data-training="${i}">${c}</button>`).join('')}</div><p id="trainingFeedback" role="status"></p><div id="trainingNext"></div><button class="close" id="leaveTraining">Back to adventure</button>`);
    $('card').querySelectorAll('[data-training]').forEach(b=>b.onclick=()=>{if(Number(b.dataset.training)!==right){$('trainingFeedback').textContent='Look at the cue again. Choose a controlled, safe response.';return}action();$('trainingFeedback').textContent=explanation;$('card').querySelectorAll('[data-training]').forEach(b=>b.disabled=true);$('trainingNext').innerHTML='<button class="primary" id="nextTraining">Continue →</button>';$('nextTraining').onclick=()=>{round++;trainingRound()}});$('leaveTraining').onclick=close;
  }
  appearance();rebuild();return {hutLayout,refreshHut:()=>hutLayout.refresh(),creator,roomEditor,training,lessonTraining,startPractical,tick,appearance};
}
