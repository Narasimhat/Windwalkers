// Smooth, species-specific silhouettes with layered feathers, paws and facial details.
export function buildAnimalModels({THREE,box,ball,cone,models},ground,bird,groundRoot,birdRoot,wingL,wingR){
  const clear=g=>{g.traverse(m=>m.geometry?.dispose());g.clear();g.scale.setScalar(1)};
  models?.clear(groundRoot);clear(groundRoot);clear(birdRoot);clear(wingL);clear(wingR);birdRoot.add(wingL,wingR);
  groundRoot.userData.legs=[];groundRoot.userData.species=ground;birdRoot.userData.species=bird;
  // Rounded volumes replace rectangular limbs, wings and tails.
  box=(g,x,y,z,w,h,d,color)=>{const m=new THREE.Mesh(new THREE.SphereGeometry(1,12,8),new THREE.MeshStandardMaterial({color,roughness:.85}));m.position.set(x,y,z);m.scale.set(w/2,h/2,d/2);m.castShadow=true;g.add(m);return m};
  const oval=(g,x,y,z,r,color,sx,sy,sz)=>{const m=ball(g,x,y,z,r,color);m.scale.set(sx,sy,sz);return m};
  const eye=(g,x,y,z,r=.045)=>{const e=ball(g,x,y,z,r,'#17272a');ball(g,x+r*.25,y+r*.3,z-r*.8,r*.22,'#fff7df');return e};
  const ears=(height,width,color,round=false)=>{for(const x of [-width,width]){if(round)ball(groundRoot,x,height,-.56,.17,color);else cone(groundRoot,x,height,-.66,.12,.28,color,4)}};
  const legs=(spread,height,length,color)=>{for(const x of [-spread,spread])for(const z of [-length,length]){
   const joint=new THREE.Group();joint.position.set(x,height,z);groundRoot.add(joint);groundRoot.userData.legs.push(joint);
   const thigh=new THREE.Mesh(new THREE.CylinderGeometry(.065,.075,height*.48,10),new THREE.MeshStandardMaterial({color,roughness:.9}));thigh.position.y=-height*.24;thigh.castShadow=true;joint.add(thigh);
   const shin=new THREE.Mesh(new THREE.CylinderGeometry(.055,.04,height*.45,10),thigh.material);shin.position.set(0,-height*.69,.015);shin.castShadow=true;joint.add(shin);
   oval(joint,0,-height+.07,-.05,.10,color,.9,.65,1.4);
   
  }};
  if(ground==='Bear'){
    oval(groundRoot,0,.85,.05,.75,'#795137',1.05,1.05,1.35);oval(groundRoot,0,1.2,-.7,.47,'#896345',1.1,1,1);ears(1.6,.32,'#795137',true);legs(.45,.55,.5,'#5e402e');oval(groundRoot,0,1.05,-1.07,.23,'#c2a07b',1,.7,.8);eye(groundRoot,0,1.12,-1.25,.09);ball(groundRoot,0,.91,1,.13,'#795137');
  }else if(ground==='Cat'){
    oval(groundRoot,0,.52,0,.4,'#c4a88b',.8,.85,1.6);ball(groundRoot,0,.84,-.55,.3,'#c4a88b');ears(1.18,.18,'#967f6c');legs(.2,.4,.33,'#c4a88b');
    const tail=new THREE.Group();groundRoot.add(tail);tail.position.set(0,.55,.58);const curve=new THREE.CatmullRomCurve3([new THREE.Vector3(0,0,0),new THREE.Vector3(.05,.3,.1),new THREE.Vector3(.10,.6,.12),new THREE.Vector3(.22,.7,.1)]);tail.add(new THREE.Mesh(new THREE.TubeGeometry(curve,12,.055,8,false),new THREE.MeshStandardMaterial({color:'#967f6c'})));oval(tail,.12,.64,.12,.16,'#967f6c',1.2,.6,.5);
    for(const side of [-1,1])for(const y of [.72,.8])box(groundRoot,side*.24,y,-.8,.36,.025,.025,'#f6eddb');ball(groundRoot,0,.77,-.85,.045,'#d49799');
  }else{
    const fox=ground==='Fox',color=fox?'#d47632':'#788895';
    oval(groundRoot,0,fox?.76:.96,0,.45,color,fox?.65:.72,fox?.75:.82,1.9);oval(groundRoot,0,fox?1.07:1.30,-.68,.27,color,.85,1,1.12);oval(groundRoot,0,fox?.90:1.12,-.48,.25,color,.85,1.35,1);ears(fox?1.43:1.67,fox?.18:.16,color);legs(fox?.22:.25,fox?.59:.77,.50,fox?'#44352c':'#566674');
    oval(groundRoot,0,fox?.99:1.20,-1.00,.19,fox?'#fff0d3':'#b6c1c8',.65,.6,1.55);eye(groundRoot,0,fox?.99:1.20,-1.26,.05);
    const tail=oval(groundRoot,0,fox?.65:.80,1.02,fox?.30:.22,color,.65,.65,2.2);tail.rotation.x=-.42;
    if(fox)oval(groundRoot,0,.48,1.48,.24,'#fff0d3',1,1,1.3);else oval(groundRoot,0,.96,-.43,.26,'#aab5bd',.65,1.2,.65);
  }
  const ey=ground==='Bear'?1.3:ground==='Cat'?.9:ground==='Fox'?1.12:1.35,ez=ground==='Bear'?-.99:ground==='Cat'?-.8:-.87;
  for(const x of [-.16,.16])eye(groundRoot,x,ey,ez);
  const owl=bird==='Owl',eagle=bird==='Eagle',jay=bird==='Blue jay',color=owl?'#9b7953':eagle?'#795235':jay?'#468ec2':'#283342';
  oval(birdRoot,0,.73,0,owl?.46:.34,color,owl?1:.9,owl?1.2:1.15,owl?.85:1.5);
  ball(birdRoot,0,owl?1.15:1.04,-.25,owl?.4:.25,eagle?'#f3edd7':color);
  if(owl){for(const x of [-.19,.19]){oval(birdRoot,x,1.19,-.55,.19,'#eadbbc',1,1,.3);ball(birdRoot,x,1.2,-.61,.09,'#e6b843');eye(birdRoot,x,1.2,-.68,.045)}for(const x of [-.23,.23])cone(birdRoot,x,1.53,-.2,.12,.28,color,4)}
  else {for(const x of [-.13,.13])eye(birdRoot,x,1.11,-.46,.035);if(jay)cone(birdRoot,0,1.36,-.2,.13,.35,'#326b9f',4)}
  cone(birdRoot,0,.98,owl?-.68:-.58,owl?.07:.11,eagle?.35:.23,eagle||owl?'#d7af49':jay?'#35414b':'#17212b',4).rotation.x=-Math.PI/2;
  if(eagle)cone(birdRoot,0,.88,-.69,.07,.18,'#d7af49',4).rotation.z=Math.PI;
  const span=eagle?1.35:owl?.65:jay?.8:1;
  for(const [wing,sign] of [[wingL,-1],[wingR,1]]){
    wing.position.set(sign*.26,.79,0);oval(wing,sign*span*.45,0,.02,.4,color,span*1.6,.15,owl?1.3:1);
    for(let j=0;j<4;j++)oval(wing,sign*(.15+j*.14),.025,-.10,.17,color,1.25,.25,1.5);
    for(let i=0;i<(eagle?7:5);i++){const feather=box(wing,sign*(span*.65+i*.08),0,.13+i*.1,.26,.055,.42,jay?(i%2?'#e7eff3':'#2b517a'):color);feather.rotation.y=sign*i*.13}
  }
  for(let i=0;i<3;i++)box(birdRoot,(i-1)*.11,.62,owl?.4:.65,.13,.06,owl?.25:jay?.65:.52,jay?'#285780':color);
  for(const x of [-.13,.13]){box(birdRoot,x,.35,0,.06,.22,.06,'#c7a150');for(const dx of [-.06,0,.06])box(birdRoot,x+dx,.24,-.08,.025,.025,.22,'#b49353')}
  models?.animal(groundRoot,ground);
}
