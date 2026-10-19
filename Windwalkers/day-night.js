// Twelve real minutes make one full game day. Time pauses in menus.
export function skyAt(minutes){
 const hour=((minutes%1440)+1440)%1440/60;
 const daylight=Math.max(0,Math.sin((hour-6)/12*Math.PI));
 const twilight=Math.max(0,1-Math.min(Math.abs(hour-6),Math.abs(hour-18))/1.5);
 const phase=hour<5||hour>=20?'Night':hour<10?'Morning':hour<17?'Day':hour<20?'Sunset':'Night';
 return {hour,daylight,twilight,phase,night:daylight<.15};
}
export function createDayNight({THREE,scene,sun,ambient,outside,box,cylinder,button,state,progress,save,panel,close,layout,onTimeChange=()=>{}}){
 let minutes=Number.isFinite(progress.worldMinutes)?((progress.worldMinutes%1440)+1440)%1440:540;
 let paused=false,lastSaved=minutes,lastLabel='';
 const lamps=[];
 for(const [x,z] of [[-5,-17],[-18,10],[8,20],[-24,-8]]){
  cylinder(outside,x,1.6,z,.09,3.2,'#645b49');
  box(outside,x,3.25,z,.7,.1,.7,'#645b49');
  const glass=box(outside,x,2.95,z,.45,.5,.45,'#f9dc99');
  glass.material=new THREE.MeshStandardMaterial({color:'#f9dc99',emissive:'#ffd18a',emissiveIntensity:0});
  const light=new THREE.PointLight('#ffd18a',0,13,1.5);light.position.set(x,3,z);outside.add(light);lamps.push({glass,light});
 }
 const stars=new THREE.Group();scene.add(stars);
 const starMaterial=new THREE.MeshBasicMaterial({color:'#f9f4dc'});
 for(let i=0;i<65;i++){
  const angle=i*2.399963,ring=30+(i%7)*3;
  const star=new THREE.Mesh(new THREE.SphereGeometry(.055+(i%3)*.025,4,4),starMaterial);
  star.position.set(Math.cos(angle)*ring,12+(i%11)*2,Math.sin(angle)*ring);stars.add(star);
 }
 const nightSky=new THREE.Color('#18283f'),daySky=new THREE.Color('#c8dfcf'),sunsetSky=new THREE.Color('#e0a489');
 function apply(){
  const s=skyAt(minutes),{area,pos}=state(),outdoors=['forest','city','drive'].includes(area);
  onTimeChange(s);
  const brightness=Math.min(1,s.daylight*1.6);
  button.ownerDocument.body.classList.toggle('night-time',s.night);
  scene.background.copy(nightSky).lerp(daySky,brightness).lerp(sunsetSky,s.twilight*.65);
  scene.fog.color.copy(scene.background);
  ambient.intensity=outdoors?.7+brightness*1.7:2.25;
  ambient.color.set(outdoors&&s.night?'#acbcdf':'#ffefcf');
  sun.intensity=outdoors?.35+s.daylight*2.75:2.3;
  sun.color.set(s.night?'#b3caff':s.twilight>.2?'#ffd0a0':'#fff0ce');
  const angle=(s.hour-6)/12*Math.PI;
  sun.position.set(pos.x+Math.cos(angle)*28,12+Math.abs(Math.sin(angle))*24,pos.z+14);
  sun.target.position.set(pos.x,0,pos.z);
  lamps.forEach(({glass,light})=>{light.intensity=(1-brightness)*7;glass.material.emissiveIntensity=(1-brightness)*1.6});
  stars.visible=outdoors&&s.night;stars.position.set(pos.x,0,pos.z);
  const text=`${s.night?'☾':'☀'} ${String(Math.floor(s.hour)).padStart(2,'0')}:${String(Math.floor(minutes%60)).padStart(2,'0')} · ${s.phase}`;
  if(text!==lastLabel){button.textContent=text;lastLabel=text}
  return s;
 }
 function setTime(value){minutes=((value%1440)+1440)%1440;progress.worldMinutes=minutes;lastSaved=minutes;save();apply();layout()}
 function menu(){panel('DAY & NIGHT','Time at Redcliff','A full day takes 12 minutes. Time pauses while a menu is open. Choose a time to explore, or keep the clock where it is.',[
  {title:'Morning · 08:00',fn:()=>{setTime(480);close()}},
  {title:'Sunset · 18:00',fn:()=>{setTime(1080);close()}},
  {title:'Going home · 20:00',fn:()=>{setTime(1200);close()}},
  {title:'Night · 22:00',fn:()=>{setTime(1320);close()}},
  {title:paused?'Resume day & night cycle':'Pause the clock',fn:()=>{paused=!paused;close()}},
 ])}
 button.onclick=menu;apply();
 return {setTime,menu,lamps,stars,get minutes(){return minutes},tick(dt){const s=state();if(s.started&&!s.modalOpen&&!paused){minutes=(minutes+dt*2)%1440;progress.worldMinutes=minutes;if(Math.abs(minutes-lastSaved)>=30){save();lastSaved=minutes}}return apply()}};
}
