export function createGarden(api){
 const {THREE,outside,box,ball,cone,cylinder,label,target,outTargets,panel,close,progress,save,toast}=api;
 const root=new THREE.Group();root.position.set(32,0,-25);outside.add(root);
 progress.garden??={basket:{},picked:[]};
 const crops=[];
 box(outside,16,.025,-17,32,.06,2.5,'#d9c89a');box(outside,32,.025,-21,2.5,.06,8,'#d9c89a');
 box(root,0,.015,0,22,.05,20,'#9bb47c');box(root,0,.06,0,2,.08,19,'#decb9e');box(root,0,.06,1,21,.08,2,'#decb9e');
 label(root,'Redcliff Garden · grow & discover',0,4,-8,7);
 function flower(x,z,color){cylinder(root,x,.5,z,.035,1,'#577b45');const leaf=ball(root,x+.14,.4,z,.2,'#6e9957');leaf.scale.set(1,.25,.5);for(let i=0;i<5;i++){const a=i*Math.PI*2/5;ball(root,x+Math.cos(a)*.2,1,z+Math.sin(a)*.2,.16,color)}ball(root,x,1.06,z,.12,'#efd276')}
 for(const x of [-9,9])for(let j=0;j<12;j++)flower(x+(j%2)*.65,-7+j*1.1,['#d58ba8','#eee5bc','#a58cc4','#e5ad67'][j%4]);
 function crop(name,x,z,fact,draw){
  const g=new THREE.Group();root.add(g);draw(g,x,z);const entry={name,g,fact};crops.push(entry);g.visible=!progress.garden.picked.includes(name);
  label(root,name,x,2.5,z,2.8);
  target(outTargets,32+x,-25+z+2.3,1.8,'Pick '+name.toLowerCase(),()=>panel('GARDEN · '+name.toUpperCase(),name,fact,[{title:'Pick '+name.toLowerCase(),fn:()=>{if(progress.garden.picked.includes(name)){toast('Already picked. Water the garden to grow a fresh crop.');return}progress.garden.picked.push(name);progress.garden.basket[name]=(progress.garden.basket[name]||0)+1;g.visible=false;save();close();toast('You picked '+name.toLowerCase()+'! Open Garden to see your basket.')}}]));
 }
 for(const x of [-5,5])for(const z of [-4,5]){box(root,x,.18,z,5,.35,3,'#96734e');box(root,x,.37,z,4.6,.06,2.6,'#6c523b')}
 crop('Carrots',-5,-4,'Carrots store food in an underground taproot. The green leaves use sunlight to make sugars.',(g,x,z)=>{for(let i=0;i<6;i++){const px=x-1.6+(i%3)*1.6,pz=z-.5+Math.floor(i/3);cone(g,px,.6,pz,.18,.6,'#e39952').rotation.z=Math.PI;for(let j=0;j<3;j++)cone(g,px+(j-1)*.1,1,pz,.12,.65,'#74954c')}});
 crop('Lettuce',5,-4,'Lettuce is a leafy vegetable. Its leaves use sunlight, water and carbon dioxide in photosynthesis.',(g,x,z)=>{for(let i=0;i<6;i++){const px=x-1.5+(i%3)*1.5,pz=z-.5+Math.floor(i/3);for(let j=0;j<4;j++){const a=j*Math.PI/2;ball(g,px+Math.cos(a)*.2,.65,pz+Math.sin(a)*.2,.35,j%2?'#8bb868':'#6c9958')}}});
 crop('Tomatoes',-5,5,'A tomato is botanically a fruit: it grows from a flower and contains seeds. In cooking, it is usually treated as a vegetable.',(g,x,z)=>{for(let i=0;i<3;i++){const px=x-1.5+i*1.5;cylinder(g,px,1,z,.05,1.3,'#6e8c4b');ball(g,px,1.5,z,.4,'#6d9b50');for(const dx of [-.22,.22])ball(g,px+dx,1,z-.25,.19,'#d66d56')}});
 crop('Strawberries',5,5,'Strawberry flowers are visited by pollinators. The tiny specks on a strawberry’s outside are small fruits, each containing a seed.',(g,x,z)=>{for(let i=0;i<6;i++){const px=x-1.5+(i%3)*1.5,pz=z-.5+Math.floor(i/3);ball(g,px,.6,pz,.35,'#709653');cone(g,px,.68,pz-.3,.18,.3,'#ca627a').rotation.z=Math.PI}});
 for(const [x,z,name,color] of [[-5,-8,'Apples','#cd7257'],[5,-8,'Pears','#d4c576']]){
  cylinder(root,x,1.3,z,.25,2.6,'#896a4d');ball(root,x,3,z,1.5,'#72975e');
  crop(name,x,z,name==='Apples'?'Apple seeds can grow into new trees. Bees help pollinate apple blossoms before the fruit develops.':'Pears grow on trees. Roots absorb water and minerals, while leaves capture sunlight.',(g,x,z)=>{for(let i=0;i<6;i++){const a=i*Math.PI/3,m=ball(g,x+Math.cos(a),2.8+(i%2)*.4,z+Math.sin(a),.22,color);if(name==='Pears')m.scale.y=1.4}});
 }
 target(outTargets,32,-22,2,'Water the garden',()=>{progress.garden.picked=[];crops.forEach(c=>c.g.visible=true);save();toast('You watered the garden. Fresh crops are ready — plants grow faster here than in real life!')});
 target(outTargets,23,-24,2,'Learn about garden flowers',()=>panel('FLOWER GARDEN','Flowers help the garden thrive.','Many insects visit flowers for nectar and pollen. As they move between flowers, they can transfer pollen, helping plants produce seeds and fruit. Leave these flowers growing for the pollinators.'));
 function menu(){panel('REDCLIFF GARDEN','Flowers, fruit & vegetables.',`Explore flower borders, apple and pear trees, and beds of carrots, lettuce, tomatoes and strawberries. Pick a crop to learn about it. Watering grows a fresh crop quickly in this game.<br><br><b>Your basket:</b> ${Object.entries(progress.garden.basket).map(([n,v])=>n+': '+v).join(' · ')||'Ready for your first harvest.'}`,[{title:'Visit the garden',fn:()=>{close();api.visit(32,-15)}},{title:'Study plant science',fn:()=>api.study('Science')}])}
 return {menu,root,crops};
}
