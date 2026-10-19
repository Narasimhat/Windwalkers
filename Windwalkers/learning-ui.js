import {subjects,levels,stages,evidence,taskFor,submitAnswer,review} from './learning.js';

export function createLearningUI({state,show,panel,close,persist,chapterOne,legacyLesson}) {
  const $=id=>document.getElementById(id);
  let stopSpeech=()=>{};
  function save(){persist()}
  function button(title,sub,fn){return {title,sub,fn}}
  function speak(text) {
    if(!('speechSynthesis' in window))return;
    speechSynthesis.cancel();
    const utterance=new SpeechSynthesisUtterance(text);
    utterance.lang='fr-FR';utterance.rate=.82;
    const voice=speechSynthesis.getVoices().find(v=>v.lang.startsWith('fr'));
    if(voice)utterance.voice=voice;
    utterance.onerror=()=>{const status=$('audioStatus');if(status)status.textContent='Audio is unavailable on this device. Use the transcript above.'};
    speechSynthesis.speak(utterance);
  }
  stopSpeech=()=>{if('speechSynthesis' in window)speechSynthesis.cancel()};
  function settings(){
    stopSpeech();
    show(`<small>YOUR LEARNING PATH</small><h2>A different level for every subject.</h2><p>Explorer: supported foundations. Investigator: several steps. Scholar: deeper reasoning. Choose what suits you; change it at any time. No countdowns or penalties.</p><div class="subject-settings">${subjects.map(s=>`<label>${s}<select data-level="${s}">${levels.map((l,i)=>`<option value="${i}" ${state.levels[s]===i?'selected':''}>${l}</option>`).join('')}</select></label>`).join('')}</div><p>Your choices and notebook save in this browser. Changing a level keeps completed evidence.</p><button class="primary" id="settingsDone">Back to notebook</button>`);
    $('card').querySelectorAll('[data-level]').forEach(select=>select.onchange=()=>{state.levels[select.dataset.level]=Number(select.value);save()});
    $('settingsDone').onclick=notebook;
  }
  function notebook(){
    stopSpeech();
    const finished=state.stage===6;
    show(`<small>DETECTIVE NOTEBOOK · CHAPTER TWO</small><h2>The Silent Stream</h2><p>${finished?'You connected the clues. Rowan has arranged repeat tests and a planted buffer strip. The stream needs time to recover. Who threatened the school remains unknown.':'Why have the animals left the stream? Observe, test, calculate and translate before drawing a conclusion. Start here or visit the blue stream southeast of the school path.'}</p><ol class="investigation-steps">${stages.map((s,i)=>`<li ${i===state.stage?'aria-current="step"':''}>${i<state.stage?'✓':i+1} · ${s}${i===state.stage?' · next':''}</li>`).join('')}</ol><div class="choices"><button class="primary" id="continueCase">${finished?'Revisit the case':'Continue: '+stages[state.stage]+' →'}</button><button class="choice" id="evidenceBtn">Evidence & skill record · ${state.stage}/6</button><button class="choice" id="levelBtn">Subject levels <small>${subjects.map(s=>`${s}: ${levels[state.levels[s]]}`).join(' · ')}</small></button>${finished?`<button class="choice" id="reviewBtn">${state.reviewDone?'Revisit':'Try'} a new situation: the greenhouse</button>`:''}</div><label class="notes-label" for="caseNotes">My ideas and next steps</label><textarea id="caseNotes" maxlength="3000" rows="3" placeholder="What do I know? What should I check next?"></textarea><p id="notesStatus" role="status">Notes save automatically on this browser.</p><button class="primary" id="notebookClose">Back to adventure →</button>`);
    $('caseNotes').value=state.notes;
    $('caseNotes').oninput=()=>{state.notes=$('caseNotes').value;save();$('notesStatus').textContent='Notes saved on this browser.'};
    const extra=document.createElement('div');extra.className='choices';
    extra.innerHTML='<button class="choice" id="practiceBtn">Subject practice · science, mathematics, Latin & French</button><button class="choice" id="originalCase">The school ward mystery · chapter one</button>';
    $('levelBtn').after(extra);
    $('practiceBtn').onclick=practiceMenu;$('originalCase').onclick=chapterOne;
    $('continueCase').onclick=()=>finished?evidencePage():mission();
    $('evidenceBtn').onclick=evidencePage;$('levelBtn').onclick=settings;
    if(finished)$('reviewBtn').onclick=()=>question(review,true);
    $('notebookClose').onclick=close;
  }
  function evidencePage(){
    show(`<small>OBSERVATIONS → EXPLANATIONS</small><h2>What the evidence supports</h2>${evidence.slice(0,state.stage).map((e,i)=>`<article class="evidence-entry"><h3>${e[1]}</h3><p>${e[2]}</p><small>${i===0||i===5?'Reasoning':taskFor(state,i).subject} · ${levels[state.records[i]?.level??0]} · ${state.records[i]?.attempts??1} attempt(s) · ${state.records[i]?.hints??0} hint(s)</small></article>`).join('')||'<p>No evidence yet. Begin with an observation.</p>'}<p>These records describe this adventure. They are not an IQ test or a measure of everyday attention.${state.reviewDone?' You also applied a fair-test strategy to the greenhouse case.':''}</p><button class="primary" id="evidenceBack">Back to notebook</button>`);
    $('evidenceBack').onclick=notebook;
  }
  function experiment(){
    show(`<small>SCIENCE LAB · PLAN → TEST → EXPLAIN</small><h2>Compare the two samples.</h2><p>These are fictional samples and readings. To compare sampling locations fairly, change the location while keeping water volume and the nitrate kit the same.</p><label class="notes-label" for="testVariable">What will you change?</label><select id="testVariable"><option value="sample">Sample location only</option><option value="volume">Location and water volume</option><option value="kit">Location and test kit</option></select><label class="notes-label" for="testPrediction">Predict before testing (a prediction can be wrong)</label><select id="testPrediction"><option value="east">East channel will have more nitrate</option><option value="same">The readings will be the same</option><option value="upstream">Upstream will have more nitrate</option></select><div class="choices"><button class="primary" id="runTest">Run comparison</button></div><p id="testFeedback" role="status"></p><div id="testResult"></div><button class="close" id="labBack">Save & return to notebook</button>`);
    if(state.experiment){$('testVariable').value=state.experiment.variable;$('testPrediction').value=state.experiment.prediction}
    $('runTest').onclick=()=>{
      const variable=$('testVariable').value,prediction=$('testPrediction').value;
      if(variable!=='sample'){$('testFeedback').textContent='Two things would change together. We could not tell whether the sample or the method explained the result. Try changing location only.';$('testResult').replaceChildren();return}
      state.experiment={variable,prediction};save();
      $('testFeedback').textContent=prediction==='east'?'Your prediction matched this comparison. Now check what the results can tell us.':'The results differed from your prediction. Revising an idea after testing is good science.';
      $('testResult').innerHTML='<table class="results"><caption>Simulated nitrate test</caption><thead><tr><th scope="col">Sample</th><th scope="col">Volume</th><th scope="col">Nitrate</th></tr></thead><tbody><tr><th scope="row">Upstream</th><td>10 mL</td><td>2 mg/L</td></tr><tr><th scope="row">East channel</th><td>10 mL</td><td>18 mg/L</td></tr></tbody></table><p>Same kit for both samples. These numbers are learning examples, not drinking-water safety advice.</p><button class="primary" id="interpretTest">Interpret the evidence →</button>';
      $('interpretTest').onclick=()=>question(taskFor(state));$('interpretTest').focus();
    };
    $('labBack').onclick=notebook;
  }
  function mission(){stopSpeech();if(state.stage>=6)return notebook();if(state.stage===1)return experiment();question(taskFor(state))}
  function practice(subject){
    const step={Science:1,Mathematics:2,Latin:3,French:4}[subject];
    question(taskFor(state,step),'practice');
  }
  function practiceMenu(){panel('REDCLIFF STUDY CLUB','Choose a subject.','Practise at your selected level with explanations and hints. Change levels in your notebook. Practice is separate from the case evidence.',subjects.map(s=>button(s,levels[state.levels[s]],()=>subjectMenu(s))))}
  function subjectMenu(subject){
    panel('REDCLIFF LEARNING HALL',subject,`Your level: ${levels[state.levels[subject]]}. Apply your knowledge in the stream investigation or practise a challenge here.`,[
      button('Practise '+subject,'One explained challenge · hints available',()=>practice(subject)),
      button('Continue the Silent Stream','Follow the investigation in order',mission),
      button('Choose subject levels','Adjust each subject separately',settings),
      ...(subject==='Latin'?[]:[button('School ward lesson','Original chapter-one subject badge',()=>legacyLesson(subject==='Science'?'Forest Science':subject==='French'?'Languages':subject))])
    ]);
  }
  function question(q,mode=false){
    const isReview=mode===true,isPractice=mode==='practice',standalone=isReview||isPractice;
    stopSpeech();
    const stage=state.stage;
    let hintCount=0,answered=false;
    const french=q.subject==='French';
    show(`<small>${isReview?'TRANSFER CHALLENGE':isPractice?`${q.subject.toUpperCase()} · ${levels[state.levels[q.subject]]} PRACTICE`:`THE SILENT STREAM · ${stage+1}/6 · ${q.subject.toUpperCase()}`}</small><h2>${q.title}</h2><p>${q.context}</p>${french?'<div class="audio-controls"><button class="choice" id="listenFrench">▶ Listen in French</button><button class="choice" id="stopFrench">Stop audio</button></div><p id="audioStatus" role="status">The transcript above is always available. Audio uses your device’s speech voice.</p>':''}<h3>${q.question}</h3><div class="choices">${q.options.map((o,i)=>`<button class="choice" data-case-answer="${i}">${o}</button>`).join('')}</div><p id="caseFeedback" role="status"></p><div class="choices"><button class="choice" id="caseHint">Help me think · 3 hints available</button></div><p id="hintText" role="status"></p><div id="caseNext"></div><button class="close" id="caseBack">Save & return to notebook</button>`);
    if(french){
      const sentence=state.levels.French===2?'J’ai vu de l’eau trouble près du jardin après la pluie, mais je n’ai vu personne ouvrir la vanne.':'Après la pluie, l’eau du jardin coule dans le canal.';
      $('listenFrench').disabled=!('speechSynthesis' in window);
      if($('listenFrench').disabled)$('audioStatus').textContent='Audio is unavailable here. Use the transcript above.';
      $('listenFrench').onclick=()=>speak(sentence);$('stopFrench').onclick=stopSpeech;
    }
    $('caseHint').onclick=()=>{
      $('hintText').textContent=q.hints[Math.min(hintCount,2)];hintCount++;
      $('caseHint').textContent=hintCount<3?'Another hint · '+(3-hintCount)+' left':'All hints shown';$('caseHint').disabled=hintCount>=3;
      if(!standalone){const r=state.records[stage]??={attempts:0,hints:0,level:state.levels[q.subject]};r.hints=Math.max(r.hints,hintCount);save()}
    };
    $('card').querySelectorAll('[data-case-answer]').forEach(b=>b.onclick=()=>{
      if(answered)return;
      const answer=Number(b.dataset.caseAnswer),correct=standalone?answer===q.answer:submitAnswer(state,stage,answer);
      save();
      if(!correct){$('caseFeedback').textContent='Check that against the evidence. You can revise your answer or use a hint.';b.disabled=true;return}
      answered=true;stopSpeech();
      $('card').querySelectorAll('[data-case-answer]').forEach(a=>a.disabled=true);$('caseHint').disabled=true;
      if(isReview){state.reviewDone=true;save()}
      $('caseFeedback').textContent=q.explanation;
      $('caseNext').innerHTML=`<button class="primary" id="caseNextBtn">${standalone?'Back to notebook':state.stage===6?'Meet Rowan: your conclusion →':'Evidence recorded · next step →'}</button>`;
      $('caseNextBtn').onclick=()=>{if(standalone)notebook();else if(state.stage===6)celebrate();else mission()};$('caseNextBtn').focus();
    });
    $('caseBack').onclick=()=>{stopSpeech();notebook()};
  }
  function celebrate(){
    panel('THE SILENT STREAM · CASE COMPLETE','Evidence, not accusations.','Rowan listens to your explanation. “The garden runoff is a likely source. We’ll repeat the tests, inspect the channel and plant a buffer strip. We still don’t know who threatened the school.” You earn a Stream Investigator badge and a river-stone garden for your hut. The stream’s recovery begins with follow-up work, not an instant cure.',[button('Try your strategy somewhere new','Investigate the greenhouse',()=>question(review,true)),button('Open detective notebook','Evidence, notes and subject levels',notebook)]);
  }
  return {notebook,mission,settings,practice,subjectMenu,stopSpeech};
}
