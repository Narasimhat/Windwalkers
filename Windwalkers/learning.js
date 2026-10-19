// Content and save-state rules are independent of the renderer.
export const subjects = ['Science', 'Mathematics', 'Latin', 'French'];
export const levels = ['Explorer', 'Investigator', 'Scholar'];
export const stages = ['Observe', 'Experiment', 'Calculate', 'Translate', 'Interview', 'Conclude'];
export const evidence = [
  ['observation', 'Stream survey', 'Few animals were seen at the stream today. This observation alone does not tell us why.'],
  ['experiment', 'Controlled sample test', 'With equal water volumes and the same kit, the upstream sample measured 2 mg/L nitrate and the east-channel sample 18 mg/L. These fictional readings show a difference, not its cause.'],
  ['mathematics', 'Flow calculation', 'The measurements show the east channel carries water into the stream.'],
  ['latin', 'Maintenance inscription', 'Aqua ex horto fluit. = Water flows from the garden. Aqua is the subject; ex horto means from the garden; fluit means flows.'],
  ['french', 'Camille’s account', 'Camille says rain carried water from the garden to the canal. This is a witness account to check against the other evidence.'],
  ['conclusion', 'Supported explanation', 'Garden runoff is a likely source of the elevated nitrate. The evidence does not identify a saboteur or establish intent.']
];
export function freshLearning() {
  return {version:1, levels:Object.fromEntries(subjects.map(s=>[s,0])), stage:0, notes:'', records:{}, experiment:null, reviewDone:false};
}
export function restoreLearning(raw) {
  const state=freshLearning();
  if(!raw || typeof raw!=='object') return state;
  for(const subject of subjects) if(Number.isInteger(raw.levels?.[subject]) && raw.levels[subject]>=0 && raw.levels[subject]<3) state.levels[subject]=raw.levels[subject];
  // Only retain a consecutive run of completed steps; stale or malformed saves cannot skip tasks.
  for(let i=0;i<6;i++) {
    const record=raw.records?.[i];
    if(!record || record.completed!==true) break;
    state.records[i]={completed:true, attempts:Math.max(1,Math.min(999,Number(record.attempts)||1)), hints:Math.max(0,Math.min(3,Number(record.hints)||0)), level:Math.max(0,Math.min(2,Number(record.level)||0))};
    state.stage=i+1;
  }
  if(state.stage<6 && raw.records?.[state.stage] && typeof raw.records[state.stage]==='object'){
    const record=raw.records[state.stage];
    state.records[state.stage]={attempts:Math.max(0,Math.min(999,Math.floor(Number(record.attempts)||0))),hints:Math.max(0,Math.min(3,Math.floor(Number(record.hints)||0))),level:state.levels[taskFor(state).subject]};
  }
  state.notes=typeof raw.notes==='string'?raw.notes.slice(0,3000):'';
  if(raw.experiment && ['sample','volume','kit'].includes(raw.experiment.variable) && ['east','same','upstream'].includes(raw.experiment.prediction)) state.experiment={variable:raw.experiment.variable,prediction:raw.experiment.prediction};
  state.reviewDone=state.stage===6 && raw.reviewDone===true;
  return state;
}
const task=(subject,title,context,question,options,answer,explanation,hints)=>({subject,title,context,question,options,answer,explanation,hints});
const science=[
  task('Science','A fair comparison','You have an upstream sample and an east-channel sample. The test used 10 mL of each sample and the same nitrate kit. Results: upstream 2 mg/L; east channel 18 mg/L.','Which statement follows from this test?',['The east sample has more nitrate; its source needs investigation.','A classmate definitely poisoned the water.','The east sample has less nitrate.'],0,'18 is greater than 2. A controlled comparison establishes a difference; it does not identify a person or prove what caused it.',['Compare the two readings.','Separate a measured result from a guess about its cause.','The test supports a difference in nitrate, not an accusation.']),
  task('Science','Separate result from cause','Both samples were tested with 10 mL water and the same nitrate kit. Upstream: 2 mg/L; east channel: 18 mg/L. This was one test.','What is the best next scientific step?',['Accuse whoever was last near the canal.','Repeat with fresh samples and investigate possible sources.','Change the kit and the water volume together.'],1,'Repeat measurements to check consistency, then investigate sources while controlling other variables. A single comparison cannot establish causation.',['How could you check that the result is reliable?','Keep the method consistent when repeating.','Repeat first, then test possible sources.']),
  task('Science','Evaluate the evidence','Equal-volume samples tested using one kit gave 2 mg/L upstream and 18 mg/L in the east channel. No repeat samples have yet been taken.','Which is the strongest interpretation?',['A difference is observed; replication and source tracing are needed before a causal claim.','Nitrate must be the only reason animals left.','The garden owner is proven responsible.'],0,'The result is consistent with elevated nitrate in the channel. Replicates, kit checks and source tracing strengthen the inference; alternative explanations remain possible.',['What does one measurement leave uncertain?','Distinguish association, cause and intent.','Support the observed difference and request replication.'])
];
const maths=[
  task('Mathematics','Measure the channel','An empty measuring tank collects 12 litres in 3 minutes. The flow remains steady.','How much water enters in 5 minutes?',['15 litres','20 litres','60 litres'],1,'12 ÷ 3 = 4 litres per minute. At a steady rate, 4 × 5 = 20 litres.',['Find the amount collected in one minute.','Divide 12 by 3, then multiply by 5.','4 litres each minute for 5 minutes.']),
  task('Mathematics','Mixing streams','The upstream flow is 6 L/min at 2 mg/L nitrate. The channel adds 2 L/min at 18 mg/L. Assume complete mixing and no nitrate loss.','What is the mixed nitrate concentration?',['10 mg/L','6 mg/L','20 mg/L'],1,'Nitrate per minute: 6 × 2 + 2 × 18 = 48 mg/min. Total flow: 8 L/min. Concentration: 48 ÷ 8 = 6 mg/L. A simple average ignores the unequal flows.',['Calculate how many milligrams arrive from each source per minute.','Divide the combined nitrate mass rate by the combined water flow.','(6 × 2 + 2 × 18) ÷ (6 + 2).']),
  task('Mathematics','An unknown flow','Upstream: 6 L/min at 2 mg/L. Channel: x L/min at 18 mg/L. The mixed water measures 6 mg/L. Assume steady flow, complete mixing and no loss.','Solve (12 + 18x) / (6 + x) = 6. What is x?',['1 L/min','3 L/min','2 L/min'],2,'12 + 18x = 36 + 6x, so 12x = 24 and x = 2 L/min. Check: (12 + 36) ÷ 8 = 6 mg/L.',['Multiply both sides by 6 + x.','Move the x terms to one side and constants to the other.','18x − 6x = 36 − 12.'])
];
const latin=[
  task('Latin','The old water channel','The stone reads: “Aqua ex horto fluit.” Word bank: aqua = water; ex = from; hortus = garden; fluit = flows. After ex, hortus becomes horto (ablative).','What does the inscription say?',['Water flows from the garden.','The garden has no water.','Water flows towards the school.'],0,'Aqua is the subject. Ex horto means “from the garden”; fluit means “flows”. The inscription describes a route, not a culprit.',['Find the verb: fluit.','Ex describes movement from a place.','Water + from the garden + flows.']),
  task('Latin','Read the case ending','“Aqua ex horto fluit.” Aqua = water; ex = from; fluit = flows. Hortus (garden) appears as horto here.','Why is horto in the ablative case?',['It is the subject of fluit.','The preposition ex takes the ablative.','All Latin nouns end in -o.'],1,'Ex governs the ablative: ex horto, “from the garden”. Aqua is nominative because it is the subject of fluit.',['Look at the word immediately before horto.','Some prepositions require a particular case.','Ex takes the ablative.']),
  task('Latin','Compare two records','“Aqua ex horto fluit. Discipuli aquam ad rivum ducunt.” Vocabulary: discipuli = pupils; rivus = stream; ducunt = lead.','Which analysis is correct?',['Aquam is the subject; discipuli is the object.','Ex horto and ad rivum both use the ablative.','Discipuli is the subject; aquam is the object; ad rivum expresses movement towards the stream.'],2,'Discipuli is nominative plural; aquam is accusative singular, the direct object of ducunt. Ad takes the accusative (rivum); ex takes the ablative (horto).',['Identify who performs ducunt.','Compare the subject ending in discipuli with the object ending in aquam.','Ad + accusative means towards; ex + ablative means from.'])
];
const french=[
  task('French','Listen to Camille','Camille says: « Après la pluie, l’eau du jardin coule dans le canal. » Word bank: après = after; pluie = rain; jardin = garden; coule = flows; canal = channel.','What did Camille observe?',['After rain, garden water flows into the channel.','Before rain, the channel is empty.','Someone broke the school ward.'],0,'Après la pluie = after the rain; l’eau du jardin = water from the garden; coule dans le canal = flows into the channel. This account supports a possible route.',['Listen again or use the transcript.','Start with après la pluie.','Camille describes water moving from the garden into the channel.']),
  task('French','Ask a useful follow-up','Camille: « Après la pluie, l’eau du jardin coule dans le canal. » You want to know when she saw this.','Choose the relevant question.',['Quelle est ta couleur préférée ?','Quand as-tu vu cela ?','Combien coûte ce livre ?'],1,'Quand as-tu vu cela ? means “When did you see that?” It asks about the timing of the observation. The other questions ask about a favourite colour and a book price.',['Find the French word for when.','Quand asks about time.','Choose the question beginning with Quand.']),
  task('French','Check meaning and certainty','Camille: « J’ai vu de l’eau trouble près du jardin après la pluie, mais je n’ai vu personne ouvrir la vanne. » Vocabulary: trouble = cloudy; vanne = valve.','Which summary preserves what she actually said?',['She saw someone open the valve.','She saw cloudy water before the rain.','She saw cloudy water after rain, but did not see anyone open the valve.'],2,'J’ai vu = I saw. Après la pluie = after the rain. Je n’ai vu personne = I saw nobody. Preserve the negation: her account cannot identify who opened a valve.',['Watch for après and the negative phrase.','Ne … personne means nobody.','She reports cloudy water, but no person opening the valve.'])
];
export const observation=task('Science','The Silent Stream','Today the stream is cloudy and few animals are visible. Yesterday it looked clearer. Theo thinks someone used a potion; Mira wonders whether rain washed soil into it.','Which entry belongs in your notebook as an observation?',['A villain poisoned the stream.','Today the water looks cloudy and few animals are visible.','Rain is definitely the cause.'],1,'Record what you observed separately from explanations. Cloudy water and fewer visible animals are observations; both proposed causes need testing.',['Which statement could you directly see?','An observation describes; a hypothesis proposes an explanation.','Choose the description of the water and animals.']);
export const conclusion=task('Science','Make the evidence fit','Evidence: the channel sample has more nitrate; the channel flows into the stream; the inscription places its origin in the garden; Camille reports runoff after rain.','Which explanation is best supported?',['The unknown visitor is proven guilty.','Every garden is dangerous.','Garden runoff is a likely nitrate source; repeat tests and check the garden before assigning blame.'],2,'Several clues support garden runoff as a likely source. They do not establish intent or identify a saboteur. Rowan will arrange repeat tests and a planted buffer strip; recovery will take time.',['Connect the measurement with the route and witness account.','A likely source is different from proof of guilt.','Choose the explanation that fits the clues and acknowledges uncertainty.']);
export const review=task('Science','A new case: the greenhouse','One greenhouse tray grows taller plants than another. The trays had different light, water and soil.','Can you conclude that extra water caused the difference?',['Yes, because taller plants prove it.','No. Repeat with matched light and soil, changing only water.','No. Change every condition again.'],1,'Several variables changed, so the cause is uncertain. To test water, match the other conditions and vary water. You have applied the stream investigation strategy to a new situation.',['How many things differed between the trays?','Choose one variable to test and keep the others matched.','Keep light and soil the same; change water.']);
export function taskFor(state,stage=state.stage) {
  if(stage===0)return observation;
  if(stage===5)return conclusion;
  const bank={1:science,2:maths,3:latin,4:french}[stage];
  const subject={1:'Science',2:'Mathematics',3:'Latin',4:'French'}[stage];
  return bank?.[state.levels[subject]];
}
export function submitAnswer(state,stage,answer) {
  if(stage!==state.stage || stage<0 || stage>5) return false;
  if(stage===1 && state.experiment?.variable!=='sample')return false;
  const question=taskFor(state,stage);
  if(!Number.isInteger(answer)||answer<0||answer>=question.options.length)return false;
  const record=state.records[stage]??={attempts:0,hints:0,level:state.levels[question.subject]};
  record.level=state.levels[question.subject];
  record.attempts++;
  if(answer!==question.answer)return false;
  record.completed=true;
  state.stage++;
  return true;
}
