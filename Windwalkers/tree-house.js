export function createTreeHouse(api){
 const {THREE,scene,outside,box,ball,cone,cylinder,label,target,outTargets,block,panel,close,toast}=api;
 const root=new THREE.Group();root.visible=false;scene.add(root);const targets=[],walls=[];
 // A broad oak supports a raised house and an open flight balcony.
 cylinder(outside,-24,3,-13,1,6,'#886648');block(-24,-13,2,2);
 for(const [x,z] of [[-28,-15],[-20,-15],[-24,-18]])ball(outside,x,9,z,4,'#6d9361');
 box(outside,-24,5,-13,11,.4,8,'#b18b5e');box(outside,-24,6.5,-15,10,3,4,'#cfbd8f');cone(outside,-24,8.8,-15,7,2.5,'#74876a',4).rotation.y=Math.PI/4;
 for(const x of [-29.3,-18.7])box(outside,x,5.6,-11,.12,1.2,4,'#8d7352');
 box(outside,-24,5.6,-17,.12,1.2,.12,'#8d7352');label(outside,'Tree house · fly to the balcony',-24,9,-10,6);
 target(outTargets,-24,-8.5,4,'Fly into the tree house',()=>enter());outTargets.at(-1).aerial=true;
 target(outTargets,-24,-5,2.8,'How to reach the tree house',()=>panel('TREE HOUSE','Fly up in your bird form.','Switch to your bird with 3, then tap Flap / Space repeatedly to gain height. Fly towards the balcony and tap Interact when the entrance appears. A kitchen, chill area, bibliothèque and bathroom await.'));
 box(root,0,-.2,0,24,.4,22,'#c5a47c');box(root,0,2.4,-11,24,4.8,.2,'#d5dfbb');
 for(const x of [-12,12]){box(root,x,2.4,0,.2,4.8,22,'#d5dfbb');for(const z of [-6,0,6])box(root,x*.99,2.8,z,.06,2,2.8,'#a7cfcb')}
 label(root,'The Canopy · our tree house',0,4,-9,7);
 cylinder(root,-1,2.5,-1,.55,5,'#8b6c4a');ball(root,-1,4.6,-1,1.5,'#91aa76');
 // Kitchen, snack counter and sink.
 for(const x of [-9,-6,-3]){box(root,x,.9,-8,2.8,1.8,1.6,'#9eaa88');box(root,x,1.85,-8,3,.15,1.8,'#eee2c5')}
 box(root,-9,1.96,-8,1.2,.08,.9,'#8ea9ae');box(root,-9,2.2,-8.5,.08,.5,.08,'#6d8d91');
 box(root,-6,1.96,-8,1.5,.06,1,'#52645e');for(const x of [-6.4,-5.7])ball(root,x,2.01,-8,.25,'#8b9e94').scale.y=.05;
 const snack=ball(root,-3,2.06,-8,.25,'#dca47c');snack.visible=false;
 label(root,'Kitchen',-7,3.2,-8,3);target(targets,-6,-5.8,2.5,'Make a snack in the kitchen',()=>panel('CANOPY KITCHEN','Something to eat or drink?','Take a little break in the tree tops.',['Fruit & bread','Hot chocolate','A cup of tea'].map(food=>({title:food,fn:()=>{snack.visible=true;close();toast('You prepare '+food.toLowerCase()+' in the tree-house kitchen.')}}))));
 // Chill corner with cushions, coffee table and plants.
 box(root,-7,.5,5,5,1,2,'#91aaa3');box(root,-7,1.1,5.8,5,.9,.25,'#91aaa3');for(const x of [-8.5,-5.5])ball(root,x,1.1,5,.35,'#c5a6b9');
 box(root,-7,.45,2.5,2.8,.9,1.5,'#a88560');box(root,-7,.03,4,7,.05,7,'#afbb9c');label(root,'Chill area',-7,3,5,3.5);
 target(targets,-7,3.5,2,'Sit in the tree-house chill area',()=>api.relax());
 for(const x of [-10,10]){cone(root,x,.4,-1,.45,.8,'#b08b65',8);ball(root,x,1.25,-1,.8,'#7f9e68')}
 // Two fabric hammocks with a shallow sag and a gentle suspended sway.
 const hammocks=[];let hammockTime=0;
 for(const [i,x] of [-8,-4].entries()){
  const frame=new THREE.Group();frame.position.set(x,0,-2);root.add(frame);
  for(const z of [-1.9,1.9]){box(frame,0,1.25,z,.15,2.5,.15,'#937451');box(frame,0,.08,z,.95,.15,.55,'#937451')}
  const sling=new THREE.Group();sling.position.y=2.4;frame.add(sling);
  for(let j=0;j<9;j++){const z=-1.4+j*.35,y=-1.25+.2*z*z;const strip=box(sling,0,y,z,1.1,.06,.38,j%2?(i?'#b8a3cc':'#91b6ac'):'#f3dfbc');strip.rotation.x=-Math.atan(.4*z)}
  for(const z of [-1.7,1.7]){const rope=box(sling,0,-.5,z,.04,1,.04,'#d4c5a2');rope.rotation.x=z*.12}
  box(sling,0,-.85,-1.2,.8,.18,.4,'#f6ead4');hammocks.push(sling);
  label(root,'Hammock '+(i+1),x,3,-2,2.7);
  target(targets,x,-.5,1.7,'Lie in hammock '+(i+1),()=>api.hammock({x,z:-2,index:i}));
 }
 function tick(dt){if(!root.visible)return;hammockTime+=dt;hammocks.forEach((sling,i)=>{const angle=Math.sin(hammockTime*.85+i*.6)*.055;sling.rotation.z=angle;api.sway(i,angle)})}
 // Small bibliothèque with a reading desk and four subject choices.
 for(const x of [4,7,10]){box(root,x,1.7,-9,2.3,3.4,.7,'#9d7d56');for(const y of [.5,1.5,2.5])for(let i=0;i<5;i++)box(root,x-.85+i*.4,y+.3,-8.58,.25,.6,.25,['#8ca874','#c08b8a','#7b9cac','#d2b57d'][i%4])}
 box(root,7,.8,-4,4,1.6,1.6,'#b28d65');box(root,7,1.68,-4,1,.08,.7,'#ece1bf');label(root,'Bibliothèque · little library',7,3,-7,5.3);
 target(targets,7,-2,2.5,'Read in the bibliothèque',()=>panel('CANOPY BIBLIOTHÈQUE','Choose a book.','Settle into the reading corner and learn something new.',['Science','Mathematics','Latin','French'].map(subject=>({title:subject,fn:()=>api.study(subject)}))));
 // Bathroom separated from the main room, with an open doorway.
 const wall=(x,z,w,d)=>{box(root,x,1,z,w,2,d,'#b8c9b1');walls.push({x,z,w,d})};
 wall(7.8,1,8.4,.15);wall(3.6,2.2,.15,2.4);wall(3.6,8.2,.15,4.6);
 box(root,7.8,.02,6,8,.05,9.8,'#b7d2c9');box(root,6,.9,2.2,1.6,1.8,1,'#f0e9d6');ball(root,6,1.85,2.2,.5,'#9abcc2').scale.set(1,.15,.6);box(root,6,2.7,1.12,1.4,1.3,.05,'#abcbd0');
 box(root,10,.1,3,2,.15,2,'#eee8d7');box(root,10,2.3,2,.08,3.8,.08,'#779c9e');box(root,10,4.1,2.3,.5,.12,.6,'#779c9e');
 box(root,9,.4,8,1,.8,1.4,'#eee8d7');box(root,9,.9,8.5,1,.9,.35,'#eee8d7');label(root,'Bathroom',8,3.4,6,3);
 target(targets,6,3.8,2,'Wash your hands',()=>panel('TREE-HOUSE BATHROOM','A fresh little bathroom.','You wash your hands at the basin. There is a shower, mirror and toilet, too. Ready to go back to the big room?'));
 label(root,'Balcony · back to the forest',0,2.8,9,5);target(targets,0,9,2.3,'Fly back down to the forest',()=>{root.visible=false;api.leave();toast('Back beneath the tree house. You can fly up again whenever you like.')});
 function enter(){const s=api.state();if(s.area!=='forest'||s.form!=='bird'||s.jump<4){toast('Use bird form and flap up to the tree-house balcony first.');return false}root.visible=true;api.enter();return true}
 function guide(){close();api.find();toast('Look up! Use bird form, flap several times and fly towards the balcony. Then Interact.')}
 function blocked(x,z){return Math.abs(x)>11.5||Math.abs(z)>10.5||walls.some(w=>Math.abs(x-w.x)<w.w/2+.3&&Math.abs(z-w.z)<w.d/2+.3)}
 return {tick,hammocks,root,targets,enter,guide,blocked,snack};
}
