export const GENRES = [
  'All Genres',
  'house', 'deep house', 'underground house', 'garage', 'uk garage',
  'speed garage', 'minimal house', 'soulful house', 'organ house',
  'hard groove', 'microhouse', 'progressive house', 'dub techno crossover',
  'jazzy house', 'lo-fi house', 'tribal house', 'afro house',
  'latin house', 'breaks crossover', 'ambient house',
] as const

export const VIBES = [
  'Warm Up', 'Groove Builder', 'Deep', 'Rollers', 'Heads Down',
  'Hypnotic', 'Late Night', 'Warehouse', 'Peak Time', 'Dancefloor Weapon',
  'Afters', 'Sunrise', 'Soulful', 'Minimal', 'Percussive',
  'Dark', 'Bassline Heavy', 'Organ Groove', 'Vocal Hook',
] as const

export const SCENES = [
  'Deep House', 'UK Garage', 'Soulful House', 'Minimal House',
  'Hard Groove', 'Organ House', 'Afro House', 'Progressive House',
] as const

export const GENRE_GROUPS = {
  'House': ['house', 'deep house', 'underground house', 'lo-fi house', 'ambient house', 'progressive house'],
  'Garage': ['garage', 'uk garage', 'speed garage', 'breaks crossover'],
  'Flavours': ['soulful house', 'organ house', 'jazzy house', 'afro house', 'latin house', 'tribal house'],
  'Minimal': ['minimal house', 'microhouse', 'dub techno crossover', 'hard groove'],
} as const
