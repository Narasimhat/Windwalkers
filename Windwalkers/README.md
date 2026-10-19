# Windwalkers: The Secret of Redcliff

A single-player 3D school adventure with two playable investigations and subject challenges for ages 10–15.

## Run locally

This is a buildless HTML/JavaScript game using the bundled Three.js r170 module.
No npm installation, API keys, backend, or external CDN are required.
With Python 3 installed, run this command from this folder:

    python3 -m http.server 8000

Open http://localhost:8000 in a browser with WebGL enabled. Use an HTTP server;
opening index.html directly as a file may block ES module loading.

## Files

- index.html: page layout, HUD, touch buttons, dialogue container, responsive CSS.
- game.js: 3D scenes, movement, characters, lessons, decoration and story logic.
- learning.js: four-subject challenge content, levels, and save-state rules.
- learning-ui.js: detective notebook, experiments, practice, hints and French audio.
- three.module.js: bundled third-party rendering dependency (MIT, see its header).
- tests/: progression and DOM integration checks.

## Existing gameplay

Walk in a forest using onscreen arrows, WASD or arrow keys. Use E or Interact
near doors, classmates, desks and clues. Q/R or camera buttons rotate the view.
1 = human (opens doors), 2 = wolf (runs faster), 3 = blue jay (can fly).
Space = jump/flap. Enter the school and a shared hut. Meet Mira, Theo and Jun.
Study Mathematics, Forest Science and French (nine questions total). Customize
hut walls, roof, garden and hut mate. Gather three clues, report to Rowan,
and restore the protective ward. The villain's identity remains unknown.
Progress and hut choices save to browser localStorage under windwalkers-3d.
Browser saves are separate on each device/origin and are not included here.

## The Silent Stream

Enter the forest and select Notebook. Choose Subject levels to independently
set Science, Mathematics, Latin and French to Explorer, Investigator or Scholar.
Select Continue: Observe to begin. The blue stream's field station southeast
of the main path also opens the case. No chapter-one completion is required.

Six steps connect observations, a controlled sample comparison, water-flow
mathematics, a Latin maintenance record, Camille's French account and an
evidence-based conclusion. The experiment requires choosing a fair comparison
and making a prediction before seeing a result. Wrong predictions are allowed.
Each challenge includes three progressive hints and an explanation. There are
no countdowns or lost lives. Subject practice is available separately in the
notebook and at the school desks; Camille and the inscription add French and
Latin practice inside the school. Original badge lessons remain available from
the subject menus, and the chapter-one journal remains in the notebook.

The notebook stores evidence, personal notes, completed challenge levels,
attempts and hints. Completion unlocks a Stream Investigator badge (represented
by the completed case and HUD title), river-stone hut decoration, and a greenhouse
challenge applying the fair-test strategy to a new situation. It does not
identify the school saboteur or claim the stream instantly recovers. All nitrate
readings are fictional learning examples. This is a small educational prototype,
not a complete curriculum, standardized assessment or validated IQ intervention.

French listening uses the browser's speech synthesis and prefers a French voice.
Voice quality and availability depend on the device; written transcripts remain
available and audio can be stopped. Existing browser progress is retained and
extended under the original localStorage key. Notes are inserted as plain text.

## Verification

Dependency-free state checks (Node.js 22 or later):

    node --test tests/learning.test.mjs

Optional full DOM/Three.js simulation (test dependency only):

    npm install --prefix /tmp/windwalkers-test jsdom@26 --no-audit --no-fund
    NODE_PATH=/tmp/windwalkers-test/node_modules node --test tests/game-flow.test.mjs

Nine checks passed: all three case levels, incorrect answers, fair-test gating,
hints, partial and completed save restoration, malformed saves, subject practice,
reward unlock, original chapter completion, and basic movement/interior/form
initialization. The DOM tests use real Three.js scene objects with a mocked
renderer. Desktop Chrome was separately checked for actual 3D startup, notebook
layout and subject settings. Mobile rendering/performance and audible French
pronunciation have not been manually verified. The game requires no npm packages.

## Existing live version

https://sierra-windwalkers.hearty-lemur-9056.chatgpt.site

This standalone export omits host-specific deployment metadata and credentials.
Local edits will not automatically update the existing hosted game.

## Avatar, training and furniture update

At the welcome screen choose **Choose my avatar & animals**. The Avatar button
reopens the creator later. Hair length and hair/skin/shirt/pants colours are saved;
Sierra restores the default look. Ground choices: wolf, fox, cat and bear. Bird
choices: blue jay, owl, raven and eagle. Primitive models change colour, size,
ears/tail or wingspan; all ground forms share running controls and all birds fly.

The sand pit southwest of spawn offers five untimed, cue-based sparring and
transformation steps against a padded dummy. Interact near its southern edge.
This is a guided training lesson, not a real-time combat system.

In the hut interact with **Decorate your hut**, then **Arrange furniture & study
books**. Place up to 24 desks with computers, shelves, book stacks, chairs and
rugs on the floor grid. Select a placed piece to move, rotate or remove it. Choose
its study subject, then interact with the desk/shelf/books in the 3D hut to study.
Beds and the built-in hut structure remain fixed. Furniture and avatar settings
save alongside existing adventure progress. Ten automated checks pass, including
customization persistence, furniture placement/movement/removal and training.

## Distinct animal models and practical sand-pit fix

Each of the eight animal choices now builds its own low-poly silhouette: wolf
muzzle and ruff, fox bushy white-tipped tail, cat whiskers and upright curled tail,
bear round ears and heavy body, jay crest and barred wings, owl face discs and
short tail, raven long beak/tail, eagle white head and broad fingered wings.

The sand-pit interaction now covers the whole pit. **Train → Start practical
training** also takes you directly there. An on-screen guide asks you to use your
actual ground form, Dodge, approach and Paw tap the dummy, then change into your
bird, flap above the target and land. It records completion after the physical
sequence. Leaving the area ends the session; training can be restarted. The
old untimed text lesson remains available separately. Eleven automated checks
pass, including distinct model bounds and a full practical training sequence.

## School life

Eight additional named pupils walk along the forest paths and can be spoken to.
Open **Classes** or use the labelled doors in the learning hall to visit separate
Mathematics, Science, Latin, French and Transformation classroom scenes. Each
contains a teacher and six classmates. Walk near the teacher and Interact to
study. Leave through the rear exit to return to the learning hall.

The class bell advances the timetable every 90 seconds of active play (paused
in dialogues). The visual notice always works; synthesized bell audio depends
on browser audio support. The Classes menu can ring the bell or mute its sound.
Joining a scheduled class is optional; the game does not forcibly teleport you.
In Transformation class, teacher and pupils copy your 1/2/3 form controls using
their own animals. Nearby roaming pupils also join your transformations. Girls
and the named female teachers have long hair. Twelve automated checks pass,
including walking interaction targets, timetable advancement, classroom changes
and group transformations back and forth between all three forms.

## Greenhouse Cafeteria

Open **Classes → Visit the cafeteria**, or enter through the Cafeteria door in
the school hall. Fourteen leafy planters surround six tables with seated pupils,
food and cups. Interact at the lunch counter to choose a meal and a drink, then
choose **Sit, eat & relax**. Your avatar sits with a lunch tray; move or transform
to stand up. Talk to seated classmates to join them for a break. The labelled exit
returns to the school hall. Fifteen automated checks pass, including cafeteria
plants, pupils, selecting food/drinks, sitting, standing and room changes.

## San Francisco city trip

Choose **City trip → Drive to San Francisco** or interact with the car south of
spawn. Drive with Up/W to accelerate, Down/S to brake, Left/Right to steer. The
coastal road must be completed before entering the city. The car parks on arrival
and you can walk the sidewalks, pass 32 pedestrians, watch ten cars and a cable
car, visit the café and see painted houses and a stylized bay landmark. Buildings
and nearby traffic block walking. This is an imagined compact neighborhood, not
an accurate city map. Return to the parked car, or choose City trip again, to
drive back. During a drive the menu can cancel the trip and return to school.
Sixteen checks pass, including driving rather than instantaneous city access,
walking boundaries, crowd motion and the return trip. Browser verification also
completed the drive and walked along the city sidewalk.

## Secret identity in the city

City pedestrians and drivers must never see a transformation. Form changes are
blocked if a witness is within 14 world units with an unobstructed view. Buildings
and screened private changing booths block sight lines. Walk through a booth's
green curtain before changing forms; the city status tells you when you are out
of sight. Public animal forms appear ordinary; change back privately before
boarding the car. School classmates and teachers remain trusted Windwalkers.
Eighteen checks pass, covering witness range, sight obstructions, private changes,
blocked public changes, and the requirement to return to human form for the car.
Browser verification also showed a public change blocked while the player stayed
human and the secret remained safe.

## Bay Basket grocery store

After driving to San Francisco, find Bay Basket's green door at the south end of
the east sidewalk. Walk near the door and Interact in human form. Browse the six
shelves (apples, carrots, bread, rice, milk, water), add/remove items, then visit
Sam's checkout. You begin with 30 game coins. Checkout rejects an empty basket or
an unaffordable total and saves purchased quantities and the remaining balance.
There are no real payments. Purchased groceries can be reviewed at checkout.
Transformations are blocked inside to protect your identity. Exit at the back of
the room to return to the city. The City trip menu also gives store directions.
Nineteen automated checks pass, including store entry/exit, shelf collision,
privacy, basket totals, insufficient funds and saved purchases.

## Requested teacher roster

French — Madame Wenzel; Latin — Miss Hilllbrecht; German — Mister Hutter;
Biology — Miss Machanda; History — Mister Hutter; Art — Miss Krieg;
Sport — Frau Janz; Transformation — Miss Janz. Biology uses the science practice
content. German, History, Art and Sport have introductory teacher questions.
All nine classrooms (including Mathematics) appear in the timetable and have
reachable doors in the hall. Twenty automated checks pass, including opening
each named teacher's classroom and interacting with its lesson.

## Playground and big swimming pool

Use **Free time → Visit the playground / Visit the pool**, or follow the east
path. The playground has a swing, slide, roundabout, benches and pupils. Interact
near a ride to begin, and use Stop ride to leave; the slide finishes automatically.
The large pool has a deck, lane floats, ladder, plants and supervisor. Interact
at the ladder, enter the water and swim with arrows/WASD. Leave pool returns you
to the deck. Changing forms also leaves the activity and resets the avatar pose.
Twenty-one automated checks pass, including swimming boundaries, all three rides
and leaving an activity for another scene. Browser verification entered the pool
and moved the swimming avatar through the water.

## Bigger shared huts and private bedrooms

Use **Hut** to gather in the Gemeinschaftsraum, visit any of three bedrooms, or
arrange your own bedroom. There are three residents: the player and two distinct
roommates. Each has an assigned bedroom. Roommates gather in the common room;
visiting a roommate's bedroom moves them into their room. The interior is now
28 by 25 world units, with room dividers, separate doorways, sofas and plants.
The exterior huts are also larger.

The private-room planner now covers a 9×9 grid. Your bed can be moved and rotated
and uses two cells; placement and rotation protect furniture space and the door.
Desks, shelves, books, chairs and rugs can be placed and rotated. Select a desk to
choose a computer, books, a plant or an empty desktop, and choose a study subject.
Existing furniture saves move into the player's private bedroom. These controls
supersede the earlier fixed-bed layout. Changes save automatically; Save & see my
bedroom opens the bedroom in 3D. Twenty-two automated checks pass, including
roommate assignments, room visits, bed movement/rotation, desk contents, shelf
rotation and save restoration. Browser review checked the shared living room
and the expanded bedroom planner.

## Cosy bedroom decorations

The room catalogue now includes floor lamps, leafy plants, framed posters,
wardrobes, bedside tables, beanbags, clocks, storage chests, guitar stands, and
striped, round and star rugs. Select an item to choose its accent colour. The
planner supports up to 36 pieces. **Add cosy touches** adds missing decoration
types to free squares without moving existing pieces; repeated use does not
create duplicate decoration types. Each added piece can be moved, rotated,
recoloured or removed. Twenty-three checks pass, including preservation of the
existing layout, duplicate-free filling and saving/restoring decoration colours.
Browser review added 11 cosy touches and displayed the decorated bedroom in 3D.

## Resting and active roommates

Interact near either common-room couch to sit, or near your own bed to lie down.
The Hut menu also offers **Sit on the couch** and **Lie in my bed**. The bed action
uses its saved position and rotation. Move, jump or use Stand up / Get out of bed
to leave; changing forms, editing furniture or changing rooms resets the pose.
Roommates now walk between their bedrooms and the common room, pausing along
routes through the doors and around the sofas and table. Their conversation
interaction targets move with them. Walking pauses during dialogue. Twenty-four
checks pass, including rest poses, moved beds, getting up and moving conversation
targets. Browser verification sat on the couch, stood up and lay in the bed.

## Your classroom desk

Each of the nine classrooms has an additional reserved player desk and chair at
the back left, labelled **Your desk · sit & study**. Walk to it and Interact to
sit. The seated controls let you study with the teacher or stand up. Moving also
stands you up. Transformation class offers its form-practice instructions from
the desk. Twenty-five automated checks pass, including sitting, starting a
lesson and standing in every classroom.

## Background music

An original gentle instrumental loop plays through Web Audio after the first
click or key press. **Music** toggles it; **Sound** opens playback and volume
controls. Preferences save under windwalkers-music. No external audio files or
services are needed. Audio is resumed before notes are scheduled, and pausing
stops the scheduler and active notes. Twenty-seven automated checks pass,
including music startup, duplicate-loop prevention, preferences and pausing
during startup. Browser review checked the music and volume controls with no
reported audio startup errors.

## The canopy tree house

Use **Tree house** to find the oak. Transform into your bird, flap several times
to reach the raised balcony, then **Interact** to enter. Inside is a large shared
room with a snack kitchen, a chill area with a couch and two gently swaying
hammocks, a bibliothèque for Science, Mathematics, Latin and French, and a
bathroom. Walk near a hammock and Interact to lie down; move or use **Get out
of hammock** to stand. The entrance inside lets you fly back to the forest.

All 28 automated checks pass, including flight-only entry, snacks, books,
bathroom, couch, hammock animation and getting up. Browser verification flew
into the house and lay in a hammock with no reported console errors.

## Day and night

A full game day takes 12 minutes of active play. The clock pauses in menus,
remembers your time, and offers morning, sunset, night and pause/resume controls.
Sunlight and sky colours change smoothly; path lanterns glow at night. Indoor
rooms retain comfortable lighting. All 29 automated checks pass, including
time progression, menu pausing, midnight rollover and indoor lighting.

From 20:00 until 07:00, the Redcliff pupils, teachers and other campus characters
go to bed. School rooms, the cafeteria, playground and paths are empty, their
conversation prompts disappear, and the class bell pauses. Your two roommates
lie in their own bedroom beds, with sleeping labels. You remain free to explore
and study. Morning restores the characters, roommate walks and class schedule.
All 30 automated checks pass, including sleeping poses, empty classrooms,
disabled nighttime conversations and the return to daytime routines.

## Principal’s office

Enter the labelled door at the back of the learning hall, or choose **Classes →
Visit the principal’s office**. Headmistress Rowan now works at her office desk
instead of standing in the hall. The room includes bookshelves, visitor chairs,
plants and a readable noticeboard. Speak to Rowan across the desk to continue
her existing mystery conversations. She leaves at bedtime and returns in the
morning. All 31 automated checks pass; browser review verified office entry and
the desk interaction prompt without console errors.

## School garden

Use **Garden → Visit the garden** or follow the path east of school. Flower
borders surround apple and pear trees and beds of carrots, lettuce, tomatoes
and strawberries. Interact near crops to read a plant fact and pick food into
your saved garden basket. Interact at the central watering spot to grow fresh
crops instantly (a game shortcut). Flowers remain for pollinators. All 32 tests
pass, including collecting crops, regrowth and basket persistence. Browser
verification checked garden entry and tomato picking without console errors.

## Horse stable

Use **Stable** to meet Maple, Snowdrop and Midnight in their stalls southwest of
the huts. Choose a horse, brush and clean it, give hay, fill fresh water and put
on the saddle. Then ride in the fenced paddock with arrows/WASD. **Dismount**
returns the horse to its stall; you can remove the saddle and brush it again.
Care progress saves per horse. Changing form or entering another area ends the
ride and resets the rider’s pose. All 33 tests pass, including care requirements,
mounted movement, dismounting and saved care. Browser review verified mounting
Midnight and the riding controls without console errors.

## Visiting friends’ huts and walking home

Three additional huts — Willow, Clover and Cedar — are west of the existing
huts. Use **Friends’ huts** or their entrance doors to visit. Each has a shared
room, a guest book and beds for its named residents. At 20:00, campus characters
walk along the paths toward their assigned huts; by 21:00 they are indoors in
bed. Your roommates return to your own hut. The clock menu includes **Going
home · 20:00** to watch the routine. Morning brings school life back. The new
integration check verifies walking, arrival and visits to all three huts;
browser verification opened Clover Hut and showed sleeping residents.

## Compact options menu

All former top-right shortcuts now live under one **Menu** button. Selecting an
option closes the dropdown; clicking outside or pressing Escape also closes it.
The dropdown scrolls on short screens and preserves every existing action.
Browser verification opened the options and selected Garden successfully; the
principal-office integration check still passes.

## More natural people and animals

People use shaped torsos, smooth capsule limbs, smaller oval heads, necks, ears,
noses, eyebrows, eye highlights and smiles. Clothing, hair and skin choices
remain editable; walking swings arms and legs. Animal bodies, muzzles, tails,
legs and bird feathers use smooth forms, including a curved cat tail. Horses
also have rounded necks and legs. The visual style remains illustrated. All 34
gameplay checks pass, including saved appearances, species silhouettes,
transformations, furniture rest poses and horse riding. Browser review checked
human and wolf models without console errors.

## Individual character identities

Named classmates have consistent individual faces, skin and eye colours, hair
colours/styles, heights, builds and clothing. Styles include bobs, braids, curls,
ponytails, buns and swept hair; some characters wear glasses. Rowan has a grey
bun and glasses. School actors, walking-home figures and hut residents share
the same identity by name. City pedestrians and hall extras also vary. The
player’s saved avatar choices remain in control of the avatar editor. All 35
checks pass, including identity consistency between class, campus and huts.

The combined style was refined after visual feedback: faces use fewer layered
pieces, curls are smaller, and wolf/fox silhouettes use slimmer bodies, longer
tapered legs and smaller ears. Individual identities and animated leg joints
remain. Focused species and identity checks pass, and the updated wolf was
reviewed in the browser.

Human proportions were compared with full-body photographic references. Heads
and facial features are smaller relative to the body; arms and legs now use
shaped profiles, with smaller hands, fingers and feet. Neck length and shoulder
sleeves were corrected after visual review. The game still uses simplified 3D
models. The 35 gameplay checks passed before the final neck/sleeve adjustment;
that visual adjustment was checked in the browser.

## Imported character models

The current version replaces visible human proxies with locally bundled, textured Ready Player Me rigs. It lowers the arms from the bind pose, drives walking and sitting through bones, and applies appearance colours to individual materials. Wolves, foxes and horses use Quaternius skinned models and their original idle/walk clips. Invisible proxies preserve existing movement and furniture controls. Cats, bears and birds still use procedural geometry. Female hair currently switches between a long style and a bob rather than reproducing every former hair shape.

See [model credits and licence restrictions](assets/models/CREDITS.md). Ready Player Me content is intended for this personal noncommercial game; the animal models are CC0. No model requests go to third-party services during play.

The imported human and wolf were inspected in the running game. After the browser connection recovered, clothing colours, sitting, lying in bed, and riding Snowdrop were also checked without console errors. The sitting rig was corrected to bend the knees forward and lower the pelvis to the seat. All 35 gameplay checks passed; after asynchronous-swap and horse-coat fixes, the four affected gameplay checks passed again. Ten asset/integration checks passed, including cancelling stale loads when switching species. Preview screenshots are in screenshots/imported-people.png and screenshots/imported-horse.png.
