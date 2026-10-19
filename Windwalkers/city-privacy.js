// A witness sees a transformation unless an opaque building or privacy screen
// intersects the line from that witness to the player's position.
export function segmentCrossesRect(a,b,r){
 let low=0,high=1;
 for(const [axis,center,size] of [['x',r.x,r.w],['z',r.z,r.d]]){
  const delta=b[axis]-a[axis],min=center-size/2,max=center+size/2;
  if(Math.abs(delta)<1e-9){if(a[axis]<min||a[axis]>max)return false;continue}
  const t1=(min-a[axis])/delta,t2=(max-a[axis])/delta;
  low=Math.max(low,Math.min(t1,t2));high=Math.min(high,Math.max(t1,t2));
  if(low>high)return false;
 }
 return high>.001&&low<.999;
}
export function hasWitness(position,witnesses,obstacles,radius=14){
 return witnesses.some(w=>Math.hypot(w.x-position.x,w.z-position.z)<=radius&&!obstacles.some(r=>segmentCrossesRect(position,w,r)));
}
