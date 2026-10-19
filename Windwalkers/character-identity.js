// A name always has the same identity, in class, on the paths and at home.
export function characterIdentity(name){
 const key=(name||'').split(' · ')[0];let hash=0;for(const c of key)hash=(hash*31+c.charCodeAt(0))>>>0;
 const presets={
  Mira:{hair:'long',hairColor:'#70432e',skin:'#d5a17c',height:1.02,width:.94,face:1.02,eyes:'#547858',shirt:'#b77d97'},
  Theo:{hair:'short',hairColor:'#c19a59',skin:'#e2b18a',height:1.10,width:.94,face:.91,eyes:'#667f96',shirt:'#b89b64'},
  Jun:{hair:'swept',hairColor:'#292b32',skin:'#c49370',height:.96,width:1.04,face:1.08,eyes:'#493f34',shirt:'#71979f'},
  Lina:{hair:'braid',hairColor:'#604437',skin:'#dfb18d',height:1.02,width:.90,face:.92,eyes:'#617c65',shirt:'#a97f9e'},
  Felix:{hair:'curls',hairColor:'#573829',skin:'#b9845d',height:.95,width:1.10,face:1.10,eyes:'#594d36',shirt:'#73937c',glasses:true},
  Amelie:{hair:'bob',hairColor:'#b27143',skin:'#ecc3a0',height:.98,width:.97,face:1.05,eyes:'#6b8198',shirt:'#b18d9a'},
  Oscar:{hair:'short',hairColor:'#45352d',skin:'#8d5e44',height:1.12,width:1.08,face:.96,eyes:'#3f342d',shirt:'#b59b70'},
  Nora:{hair:'curls',hairColor:'#352922',skin:'#a66e4c',height:1.04,width:1.04,face:1.06,eyes:'#423b2f',shirt:'#7f9c89',long:true},
  Leo:{hair:'swept',hairColor:'#b99156',skin:'#d8a67f',height:.94,width:.91,face:.93,eyes:'#788a6d',shirt:'#8098a8'},
  Zoe:{hair:'ponytail',hairColor:'#422f29',skin:'#c38b66',height:1.06,width:.95,face:.94,eyes:'#6f5840',shirt:'#ac849d'},
  Ben:{hair:'curls',hairColor:'#6f4a30',skin:'#d2a17d',height:1.01,width:1.12,face:1.09,eyes:'#576e74',shirt:'#8b9e75'},
  'Headmistress Rowan':{hair:'bun',hairColor:'#8c8277',skin:'#d7ad8c',height:1.13,width:1.06,face:.96,eyes:'#526c65',shirt:'#566d86',glasses:true},
 };
 const result={hair:['short','swept','bob','ponytail','curls','bun'][hash%6],hairColor:['#40332b','#91633e','#b59b70','#333039','#836b5a'][hash%5],skin:['#d9a67e','#ac7957','#edc49f','#8e634b'][hash%4],height:.95+(hash%7)*.025,width:.92+(hash%5)*.045,face:.94+(hash%4)*.045,eyes:['#4e6050','#635246','#627d91'][hash%3],shirt:['#8c9e86','#a4859b','#788f9f','#b29a79'][hash%4],glasses:hash%7===0,...presets[key]};
 if(/Madame|Miss |Ms |Frau/.test(key)&&!presets[key])result.hair=['long','bun','braid'][hash%3];
 return {name:key,...result};
}
