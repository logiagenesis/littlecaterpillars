/**
 * The hand-written half of the gallery.
 *
 * Every one of the 102 unique source images was opened and sorted by what is
 * actually in the frame, not by filename or by which email batch it arrived in.
 * `n` is the position in the sorted source-image list; tools/build-manifest.js
 * resolves it back to a filename, so the alt text below can never drift onto
 * the wrong photo.
 *
 * Alt text rule (§5.3): descriptive and specific, never "image", never a
 * filename, never a child's name.
 */

export const CATEGORIES = [
  { slug: 'baby-centre', title: 'Baby Centre', blurb: 'The Butterfly Class — our three-month-olds up.' },
  { slug: 'messy-play', title: 'Messy & Sensory Play', blurb: 'Foam, paint, water and a great deal of coloured spaghetti.' },
  { slug: 'outdoors', title: 'Outdoors & Playground', blurb: 'Slides, sand, ride-ons and the run of the garden.' },
  { slug: 'learning', title: 'Everyday Learning & Creating', blurb: 'Letters, books, crayons and finished work held up proudly.' },
  { slug: 'celebrations', title: 'Celebrations & Dress-Up', blurb: 'Valentine’s, Easter, Heritage Day, Shavathon and every excuse for a costume.' },
  { slug: 'sport', title: 'Sports, Swimming & Movement', blurb: 'Swimming lessons, ball skills and getting the wiggles out.' },
  { slug: 'paint-your-principal', title: 'Paint Your Principal Day', blurb: 'Exactly what it sounds like. She was a very good sport.' },
  { slug: 'our-spaces', title: 'Our Spaces', blurb: 'The classrooms, the play areas and the garden they belong to.' }
]

/** n -> { c: category slug, alt } */
export const PUBLISHED = {
  // --- Baby Centre (6) -----------------------------------------------------
  8:  { c: 'baby-centre', alt: 'A baby stands at a glass door, waving, beside a wall decal of a Dr Seuss quote' },
  18: { c: 'baby-centre', alt: 'A baby in a blue knitted suit crawls across the lawn beside the play structure' },
  19: { c: 'baby-centre', alt: 'A baby laughs through the window of the plastic playhouse' },
  23: { c: 'baby-centre', alt: 'A baby in a red cardigan crawls across the patterned indoor mat' },
  36: { c: 'baby-centre', alt: 'A baby in a patterned romper sits up in a travel cot' },
  61: { c: 'baby-centre', alt: 'A baby sits in a low red chair turning a stacking peg over in both hands' },

  // --- Messy & Sensory Play (18) -------------------------------------------
  9:  { c: 'messy-play', alt: 'A baby sits in a tray of orange and green cooked spaghetti, pulling a strand up to look at it' },
  21: { c: 'messy-play', alt: 'A boy grins over a tray of white shaving foam, hands and cheeks covered' },
  22: { c: 'messy-play', alt: 'A toddler kneels on the grass and reaches into a tray of purple water play' },
  24: { c: 'messy-play', alt: 'A toddler in a turquoise smock, green paint across both cheeks, mid-laugh' },
  25: { c: 'messy-play', alt: 'A toddler at the water table holds up a hand covered in green paint from the mixing bowls' },
  26: { c: 'messy-play', alt: 'A toddler in dungarees pushes green paint across the surface of the water table' },
  38: { c: 'messy-play', alt: 'A boy pours from a plastic jug into a bubble-filled water table on the playground' },
  39: { c: 'messy-play', alt: 'A toddler stands on the lawn with foam down the front of a red T-shirt' },
  40: { c: 'messy-play', alt: 'A toddler tips a yellow beaker of water back into the play table' },
  41: { c: 'messy-play', alt: 'A girl leans over a tray of shaving foam, arms buried past the elbow' },
  42: { c: 'messy-play', alt: 'A girl holds up two handfuls of shaving foam from a blue tray on the grass' },
  43: { c: 'messy-play', alt: 'A boy stands on the play mat with both hands on his head, coloured spaghetti around his feet' },
  44: { c: 'messy-play', alt: 'A baby on the road-print play mat lifts a fistful of green spaghetti towards their mouth' },
  45: { c: 'messy-play', alt: 'A baby sits inside a tyre filled with coloured spaghetti in front of the Little Caterpillars banner' },
  46: { c: 'messy-play', alt: 'A toddler sits cross-legged on the play mat, working through a pile of orange and green spaghetti' },
  47: { c: 'messy-play', alt: 'A baby in a spotted bib kneels over a spread of green spaghetti on the play mat' },
  59: { c: 'messy-play', alt: 'A child paints broad strokes of blue across a sheet of newspaper with a long brush' },
  63: { c: 'messy-play', alt: 'A girl in a bucket hat, face and arms covered in shaving foam, laughing' },

  // --- Outdoors & Playground (12) ------------------------------------------
  3:  { c: 'outdoors', alt: 'A toddler lies along the top of the green slide, grinning down at the camera' },
  5:  { c: 'outdoors', alt: 'A boy sits on the jungle gym deck with a water bottle in both hands' },
  6:  { c: 'outdoors', alt: 'A girl kneels in the sandpit, scooping sand with a yellow spade' },
  7:  { c: 'outdoors', alt: 'A girl crouches in the corner of the sandpit with a red scoop and a blue spade' },
  11: { c: 'outdoors', alt: 'A girl balances on the outdoor climbing frame with the palms behind her' },
  12: { c: 'outdoors', alt: 'Two girls lie side by side on the lawn, heads together over their toys' },
  17: { c: 'outdoors', alt: 'A toddler pushes a green ride-on toy across the artificial grass' },
  27: { c: 'outdoors', alt: 'A boy reaches the bottom of the yellow slide, arms out' },
  30: { c: 'outdoors', alt: 'A girl rides the orange seesaw beside the sandpit wall' },
  31: { c: 'outdoors', alt: 'Three children stacked on the green slide, all three mid-laugh' },
  53: { c: 'outdoors', alt: 'A boy in a flat cap steers a scooter across the lawn' },
  60: { c: 'outdoors', alt: 'A girl looks up from under the bars of the climbing frame' },

  // --- Everyday Learning & Creating (12) -----------------------------------
  10: { c: 'learning', alt: 'A boy sits on the grass beside an open lunch box, sorting through it' },
  13: { c: 'learning', alt: 'A toddler sits on a purple mat with a picture book open across both knees' },
  14: { c: 'learning', alt: 'A toddler kneels on the mat turning the pages of a large activity book' },
  15: { c: 'learning', alt: 'A child in a woolly hat and gown reads a Jungle IQ book on the mat' },
  20: { c: 'learning', alt: 'A girl holds up her open drawing book to show a page of pink and green crayon work' },
  28: { c: 'learning', alt: 'A child holds up a drawn-and-decorated Easter egg dotted with green pom-poms' },
  49: { c: 'learning', alt: 'A boy laughs as he holds up a small paper craft he has just finished' },
  52: { c: 'learning', alt: 'A child holds up a worksheet showing the letter A drawn as a sliced apple' },
  54: { c: 'learning', alt: 'A boy with a gold star on his forehead holds up a completed spelling worksheet' },
  68: { c: 'learning', alt: 'A pair of hands turns a green-painted craft over a sheet of paint-covered newspaper' },
  69: { c: 'learning', alt: 'A child paints an egg-carton caterpillar green, brush held in a careful grip' },
  70: { c: 'learning', alt: 'A boy holds up a whiteboard of three-letter words marked “well done”' },

  // --- Celebrations & Dress-Up (12) ----------------------------------------
  1:  { c: 'celebrations', alt: 'A boy in a red shirt and a paper crown in front of a Happy Valentine’s Day wall display' },
  4:  { c: 'celebrations', alt: 'A child in sunglasses stands between two large Easter bunnies under a Happy Easter banner' },
  16: { c: 'celebrations', alt: 'A child peers through a pair of star-shaped novelty glasses' },
  32: { c: 'celebrations', alt: 'A baby in sequinned bunny ears smiles up from the classroom mat' },
  33: { c: 'celebrations', alt: 'A girl models an Easter bonnet loaded with eggs, carrots and a small rabbit' },
  35: { c: 'celebrations', alt: 'A boy with spray-dyed green hair holds a baby in front of a Shavathon banner' },
  37: { c: 'celebrations', alt: 'A baby in a striped party hat, both hands at their mouth, mid-giggle' },
  48: { c: 'celebrations', alt: 'A baby dressed as a chef in a checked headscarf and white jacket' },
  50: { c: 'celebrations', alt: 'A boy in an astronaut suit and a girl in a dress-up gown pose together in the garden' },
  51: { c: 'celebrations', alt: 'Two girls hug, one in a bear mask and one in a cat mask' },
  62: { c: 'celebrations', alt: 'A girl in traditional beaded dress and a yellow pleated skirt for Heritage Day' },
  66: { c: 'celebrations', alt: 'A girl in a bright pink tutu holds the skirt wide' },

  // --- Sports, Swimming & Movement (6) -------------------------------------
  29: { c: 'sport', alt: 'A girl bounces across the lawn on a pogo hopper' },
  34: { c: 'sport', alt: 'A boy runs the ball down the lawn, shadow stretched out beside him' },
  55: { c: 'sport', alt: 'A girl in a swimming costume sits on the pool edge with both feet in the water' },
  56: { c: 'sport', alt: 'A girl kicks up a sheet of spray from the side of the pool' },
  57: { c: 'sport', alt: 'A girl in a swimming cap holds a blue pool noodle in front of her' },
  58: { c: 'sport', alt: 'A girl works across the pool on a noodle while the swimming teacher stays alongside' },

  // --- Paint Your Principal Day (6) ----------------------------------------
  71: { c: 'paint-your-principal', alt: 'The principal sits on the lawn in a paint-covered shirt and leggings, laughing' },
  72: { c: 'paint-your-principal', alt: 'The principal, covered head to toe in paint, sits on the grass with two children' },
  75: { c: 'paint-your-principal', alt: 'Children crowd around the principal with paint pots, adding handprints to her shirt' },
  78: { c: 'paint-your-principal', alt: 'The back of the principal’s shirt, signed by the children with “Best Teacher” and “I love you”' },
  79: { c: 'paint-your-principal', alt: 'The principal and a child pull a face for the camera, both faces painted' },
  80: { c: 'paint-your-principal', alt: 'The principal squeezes in between two children for a paint-covered photograph' },

  // --- Our Spaces (12) -----------------------------------------------------
  82: { c: 'our-spaces', alt: 'A classroom of low tables and primary-coloured chairs, work pinned along the wall' },
  83: { c: 'our-spaces', alt: 'Two backlit wall panels, a butterfly and a ladybird, above a low display board' },
  84: { c: 'our-spaces', alt: 'A bright classroom with tables set out and a wall of trailing greenery' },
  85: { c: 'our-spaces', alt: 'A classroom looking out to the playground, stacked mats along the far wall' },
  86: { c: 'our-spaces', alt: 'A brick wall of paper bees counting up to twenty, beside a chalkboard' },
  87: { c: 'our-spaces', alt: 'The classroom doorway under an alphabet frieze, tables set out beyond it' },
  88: { c: 'our-spaces', alt: 'The sandpit, freshly raked, with a bucket and a sifter left on the ledge' },
  91: { c: 'our-spaces', alt: 'A shaded play area with a rocker and a raised planter along the back fence' },
  92: { c: 'our-spaces', alt: 'The main play structure with its slide, swings and a nest swing under the trees' },
  93: { c: 'our-spaces', alt: 'A classroom with a whiteboard, book corner and labelled storage cubbies' },
  94: { c: 'our-spaces', alt: 'The Butterfly Class room, tables set out in front of the door to the garden' },
  95: { c: 'our-spaces', alt: 'The entrance arch into the Butterfly Class, notices pinned on either side' }
}

/** n -> reason. Cut from the gallery; the originals are untouched. */
export const CUTS = {
  2:  'Second frame of the same Valentine’s wall display as #1 — near-duplicate subject, weaker of the two.',
  64: 'Two toddlers seated indoors; flat light and no activity in frame. Weakest of the everyday set.',
  65: 'Two babies asleep in bouncers. Cut on judgement: sleeping children are the least appropriate frame to publish.',
  67: 'Studio-backdrop portrait with no activity; the same backdrop is already represented by #62 and #66.',
  73: 'Wide group shot of Paint Your Principal Day, subjects small and partly cropped at the frame edge.',
  74: 'Paint Your Principal Day from behind — the activity is legible but no faces and no focal point.',
  76: 'Paint Your Principal Day; the foreground child is cropped through the head.',
  77: 'Near-duplicate of #78 — same signed shirt, less of the writing readable.',
  81: 'Third selfie in the same series as #79 and #80; the set is already represented.',
  89: 'Rack of ride-on toys against the wall. Storage, not a space children use.',
  90: 'Garden wide shot dominated by a neighbouring roofline rather than the school.',
  96: 'Playhouse corner; overlaps #91 and #92 and adds nothing they do not already show.'
}

/** n -> where the file actually belongs. These are documents, not photographs. */
export const DOCUMENTS = {
  97:  { use: 'routine', note: 'Class Routine poster (earlier variant). Superseded by #102; times differ.' },
  98:  { use: 'weekly-b', note: 'Weekly Program poster — the variant transcribed as Weekly programme B.' },
  99:  { use: 'weekly-a', note: 'Weekly Program poster — the variant transcribed as Weekly programme A.' },
  100: { use: 'menu-baby', note: 'Baby Menu poster, 3–7 months.' },
  101: { use: 'menu-general', note: 'Menu poster, 7 months upward.' },
  102: { use: 'routine', note: 'Class Routine poster dated 16 September 2026. Canonical version of the daily routine.' }
}

/** Filenames excluded before anything else runs. */
export const EXACT_DUPLICATES = {
  'IMG-20260916-WA0101_1.jpg': 'Byte-identical to IMG-20260916-WA0101.jpg (same MD5); the attachment is listed twice in email batch 2.'
}
