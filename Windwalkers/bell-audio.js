// Unlock Web Audio on a user gesture; schedule notes only after resume finishes.
export function createBellAudio(host,onStatus=()=>{}){
 let context=null,muted=false;
 async function unlock(){
  try{
   const Audio=host.AudioContext||host.webkitAudioContext;
   if(!Audio){onStatus('Bell audio is unavailable in this browser.');return false}
   if(!context||context.state==='closed')context=new Audio();
   if(context.state!=='running')await context.resume();
   if(context.state!=='running'){onStatus('Tap Test bell sound to enable audio.');return false}
   return true;
  }catch{onStatus('Audio could not start. Tap Test bell sound to try again.');return false}
 }
 async function ring(){
  if(muted){onStatus('Bell sound is muted.');return false}
  if(!await unlock())return false;
  if(muted)return false;
  const start=context.currentTime+.04;
  // Two clear bell strikes with fading harmonics, at a moderate master level.
  for(const offset of [0,.8])for(const [hz,level] of [[784,.2],[1568,.08],[2117,.035]]){
   const tone=context.createOscillator(),gain=context.createGain(),at=start+offset;
   tone.type='sine';tone.frequency.value=hz;
   gain.gain.setValueAtTime(.0001,at);gain.gain.exponentialRampToValueAtTime(level,at+.012);gain.gain.exponentialRampToValueAtTime(.0001,at+1.5);
   tone.connect(gain);gain.connect(context.destination);tone.onended=()=>{tone.disconnect();gain.disconnect()};tone.start(at);tone.stop(at+1.6);
  }
  onStatus('Bell sound played. If you cannot hear it, check your device volume and whether this tab is muted.');return true;
 }
 return {unlock,ring,setMuted(value){muted=!!value;onStatus(muted?'Bell sound is muted.':'Bell sound is on.')},get muted(){return muted}};
}
