export function createGroceryStore(api){
 const {THREE,scene,box,ball,label,human,target,panel,close,toast,progress,save}=api;
 const root=new THREE.Group();root.visible=false;scene.add(root);const targets=[],obstacles=[];
 const goods=[['apple','Apples',2,'#d58e67'],['carrot','Carrots',2,'#dfa24f'],['bread','Bread',3,'#c6a369'],['rice','Rice',4,'#eee0b7'],['milk','Milk',3,'#c6dbe2'],['water','Water',1,'#91c5d1']];
 const old=progress.shopping;progress.shopping={coins:Number.isInteger(old?.coins)&&old.coins>=0?Math.min(old.coins,10000):30,items:Object.fromEntries(goods.map(([id])=>[id,Number.isInteger(old?.items?.[id])&&old.items[id]>=0?Math.min(old.items[id],999):0]))};
 let basket=[];
 const total=()=>basket.reduce((sum,id)=>sum+goods.find(g=>g[0]===id)[2],0);
 box(root,0,-.2,0,24,.4,23,'#e9dec4');box(root,0,2.6,-11,24,5.2,.2,'#d1dfbd');
 for(const x of [-12,12])box(root,x,2.6,0,.2,5.2,23,'#d1dfbd');
 label(root,'Bay Basket · Grocery Store',0,4.5,-10,7);
 box(root,0,.8,-7,7,1.6,1.5,'#a78158');box(root,2,1.9,-7,1,.6,.6,'#527064');
 human(root,0,-9,'#799d7f','Sam · cashier');target(targets,0,-5,3,'Checkout your groceries',()=>checkout());
 for(const [i,[id,name,price,color]] of goods.entries()){
  const x=i%2?6:-6,z=-4+Math.floor(i/2)*5;
  box(root,x,1,z,2,2,2.2,'#aa8d64');obstacles.push({x,z,w:2,d:2.2});
  for(const y of [.5,1.2,1.9]){box(root,x,y,z,2.2,.1,2.4,'#d9bf91');for(const dx of [-.6,0,.6]){if(id==='apple'||id==='carrot')ball(root,x+dx,y+.22,z,.2,color);else box(root,x+dx,y+.22,z,.35,.35,.45,color)}}
  label(root,name+' · '+price+' coins',x,3,z,3.3);target(targets,x+(x<0?1.8:-1.8),z,1.8,'Browse '+name,()=>browse(id));
 }
 label(root,'Exit to San Francisco',0,2.8,10,4.5);target(targets,0,10,2.3,'Leave grocery store',()=>{root.visible=false;api.leave()});
 function browse(id){
  const [,name,price]=goods.find(g=>g[0]===id),count=basket.filter(v=>v===id).length;
  panel('BAY BASKET · GAME COINS',name,`${price} game coins each. In your basket: ${count}. Basket total: ${total()} coins. You have ${progress.shopping.coins} coins.`,[
   {title:'Add one to basket',sub:count>=5?'Maximum 5 of each item':'Choose groceries before paying',fn:()=>{if(count>=5){toast('You can carry up to 5 of each item.');return}basket.push(id);browse(id)}},
   {title:'Remove one',fn:()=>{const index=basket.indexOf(id);if(index>=0)basket.splice(index,1);browse(id)}},
   {title:'Review basket & checkout',fn:checkout}
  ]);
 }
 function checkout(){
  const cost=total(),lines=goods.filter(([id])=>basket.includes(id)).map(([id,name,price])=>`${name}: ${basket.filter(v=>v===id).length} × ${price} coins`).join('<br>');
  panel('BAY BASKET · CHECKOUT','Your shopping basket.',`${lines||'Your basket is empty.'}<br><br>Total: ${cost} coins. Available: ${progress.shopping.coins} coins.<br>These are game coins. Your groceries save in this browser.`,[
   {title:`Pay ${cost} game coins`,fn:()=>{
    if(!basket.length){toast('Browse a shelf and add groceries first.');return}
    if(cost>progress.shopping.coins){toast('Your basket costs more than you have. Remove an item and try again.');return}
    progress.shopping.coins-=cost;for(const id of basket)progress.shopping.items[id]++;basket=[];save();
    panel('PURCHASE COMPLETE','Thanks for shopping!',`Sam packs your groceries. You have ${progress.shopping.coins} game coins left. Your purchases are saved.`,[{title:'See my groceries',fn:inventory}]);
   }},
   {title:'Edit basket',fn:catalogue},
   {title:'Empty basket',fn:()=>{basket=[];checkout()}},
   {title:'See my purchased groceries',fn:inventory}
  ]);
 }
 function inventory(){panel('YOUR GROCERIES','What you bought.',goods.map(([id,name])=>`${name}: ${progress.shopping.items[id]}`).join('<br>')+`<br><br>Game coins remaining: ${progress.shopping.coins}.`,[{title:'Back to shelves',fn:catalogue}])}
 function catalogue(){panel('BAY BASKET','Choose an aisle.',`Welcome! You have ${progress.shopping.coins} game coins. Browse the shelves or choose below. Keep your Windwalker identity secret while shopping.`,goods.map(([id,name,price])=>({title:name,sub:price+' game coins',fn:()=>browse(id)})).concat([{title:'Checkout',fn:checkout},{title:'My purchased groceries',fn:inventory}]))}
 function enter(){root.visible=true;api.enter();toast('Welcome to Bay Basket! Browse shelves, then visit Sam to pay with game coins.')}
 function blocked(x,z){return Math.abs(x)>11.5||Math.abs(z)>10.8||obstacles.some(b=>Math.abs(x-b.x)<b.w/2+.35&&Math.abs(z-b.z)<b.d/2+.35)||Math.abs(x)<3.8&&Math.abs(z+7)<1.1}
 return {root,targets,enter,blocked,catalogue,browse,checkout,inventory};
}
