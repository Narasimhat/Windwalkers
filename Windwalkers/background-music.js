// Original, procedurally played instrumental music. No downloads or external audio.
export function createBackgroundMusic(host,button){
 let enabled=true,volume=.25,context=null,master=null,timer=null,nextTime=0,beat=0,generation=0;
 const voices=new Set();
 try{const saved=JSON.parse(host.localStorage.getItem('windwalkers-music')||'null');if(saved){enabled=typeof saved.enabled==='boolean'?saved.enabled:true;volume=typeof saved.volume==='number'&&Number.isFinite(saved.volume)?Math.max(0,Math.min(1,saved.volume)):.25}}catch{}
 const melody=[72,null,76,null,79,null,76,null,69,null,72,null,76,null,72,null,69,null,72,null,77,null,76,null,71,null,74,null,79,null,74,null];
 const chords=[[48,60,64,67],[45,57,60,64],[41,57,60,65],[43,55,59,62]];
 function display(){button.textContent=enabled?'♫ Music on':'♫ Music off';button.setAttribute('aria-pressed',String(enabled));button.title=enabled?'Pause background music':'Play background music'}
 function save(){try{host.localStorage.setItem('windwalkers-music',JSON.stringify({enabled,volume}))}catch{}display()}
 function tone(midi,at,duration,gain,type='sine'){
  const oscillator=context.createOscillator(),envelope=context.createGain();oscillator.type=type;oscillator.frequency.value=440*Math.pow(2,(midi-69)/12);
  envelope.gain.setValueAtTime(.0001,at);envelope.gain.exponentialRampToValueAtTime(gain,at+.09);envelope.gain.exponentialRampToValueAtTime(.0001,at+duration);
  oscillator.connect(envelope);envelope.connect(master);voices.add(oscillator);oscillator.onended=()=>{voices.delete(oscillator);oscillator.disconnect();envelope.disconnect()};oscillator.start(at);oscillator.stop(at+duration+.03);
 }
 function schedule(){
  if(!enabled||!context||context.state!=='running')return;
  if(nextTime<context.currentTime)nextTime=context.currentTime+.04;
  const step=60/76;
  while(nextTime<context.currentTime+.4){
   const chord=chords[Math.floor(beat/8)%4];
   if(beat%8===0){tone(chord[0],nextTime,step*7,.12);for(const note of chord.slice(1))tone(note,nextTime,step*7,.035)}
   const note=melody[beat%melody.length];if(note!==null)tone(note,nextTime,step*1.6,.08,'triangle');
   beat++;nextTime+=step;
  }
 }
 async function play(){
  enabled=true;save();const request=++generation;
  try{
   const Audio=host.AudioContext||host.webkitAudioContext;if(!Audio){button.textContent='♫ Audio unavailable';button.dataset.state='unavailable';return false}
   if(!context||context.state==='closed'){context=new Audio();master=context.createGain();master.connect(context.destination)}
   master.gain.setValueAtTime(volume,context.currentTime);
   if(context.state!=='running')await context.resume();
   if(!enabled||request!==generation)return false;
   if(context.state!=='running'){button.textContent='♫ Tap for music';button.dataset.state='blocked';return false}
   if(timer===null){nextTime=context.currentTime+.08;beat=0;schedule();timer=host.setInterval(schedule,180)}
   button.dataset.state='playing';return true;
  }catch{button.textContent='♫ Tap for music';button.dataset.state='blocked';return false}
 }
 function pause(){button.dataset.state='paused';enabled=false;generation++;if(timer!==null){host.clearInterval(timer);timer=null}for(const oscillator of voices){try{oscillator.stop()}catch{}}voices.clear();save()}
 function setVolume(value){volume=Math.max(0,Math.min(1,Number(value)||0));if(master)master.gain.setValueAtTime(volume,context.currentTime);save()}
 const activate=()=>{if(enabled&&timer===null)void play()};
 host.document.addEventListener('pointerdown',activate,{capture:true});host.document.addEventListener('keydown',activate,{capture:true});
 button.onclick=()=>{if(enabled)pause();else void play()};
 display();
 return {play,pause,setVolume,get enabled(){return enabled},get volume(){return volume},dispose(){pause();host.document.removeEventListener('pointerdown',activate,true);host.document.removeEventListener('keydown',activate,true)}};
}
