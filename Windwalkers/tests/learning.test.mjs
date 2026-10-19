import test from 'node:test';
import assert from 'node:assert/strict';
import {freshLearning,restoreLearning,taskFor,submitAnswer,subjects} from '../learning.js';
for(let level=0;level<3;level++)test(`Complete, resume and prevent skipping at level ${level}`,()=>{
  let state=freshLearning();subjects.forEach(s=>state.levels[s]=level);
  state.notes='<script>notes remain plain text</script>';
  assert.equal(submitAnswer(state,3,0),false);
  while(state.stage<6){
    const stage=state.stage,q=taskFor(state);
    assert.equal(submitAnswer(state,stage,99),false);
    if(stage===1){assert.equal(submitAnswer(state,stage,q.answer),false);state.experiment={variable:'sample',prediction:'same'}}
    assert.equal(submitAnswer(state,stage,(q.answer+1)%3),false);
    assert.equal(state.stage,stage);
    assert.equal(submitAnswer(state,stage,q.answer),true);
    assert.equal(submitAnswer(state,stage,q.answer),false);
    state=restoreLearning(JSON.parse(JSON.stringify(state)));
    assert.equal(state.stage,stage+1);
    assert.equal(state.records[stage].attempts,2);
  }
  assert.equal(state.stage,6);assert.equal(state.notes,'<script>notes remain plain text</script>');
});
test('Old and malformed saves cannot manufacture case completion',()=>{
  assert.equal(restoreLearning(undefined).stage,0);
  const s=restoreLearning({stage:6,levels:{Latin:9,French:-1},records:{2:{completed:true}},notes:42,experiment:{variable:'wrong'}});
  assert.equal(s.stage,0);assert.equal(s.levels.Latin,0);assert.equal(s.notes,'');assert.equal(s.experiment,null);
});
test('Save partial attempts and hints; retain independent subject levels',()=>{
  const s=freshLearning();s.levels.Latin=2;s.levels.French=1;
  submitAnswer(s,0,0);s.records[0].hints=2;
  const resumed=restoreLearning(s);
  assert.equal(resumed.records[0].attempts,1);assert.equal(resumed.records[0].hints,2);
  assert.deepEqual(resumed.levels,{Science:0,Mathematics:0,Latin:2,French:1});
});
