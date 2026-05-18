// nbadraft.net scouting grades for Lakers targets
// Scale: 1–10 per attribute. null = no grade data available.
// Attributes (12): Athleticism, Size, Defense, Strength, Quickness,
//   Leadership, Jump Shot, NBA Ready, Ball Handling, Potential, Passing, Intangibles

export const RADAR_ATTRS = [
  'Athleticism',
  'Size',
  'Defense',
  'Strength',
  'Quickness',
  'Leadership',
  'Jump Shot',
  'NBA Ready',
  'Ball Handling',
  'Potential',
  'Passing',
  'Intangibles',
];

// Short labels for the chart (space is tight at 12 spokes)
export const RADAR_LABELS = [
  'ATH',
  'SIZE',
  'DEF',
  'STR',
  'QCK',
  'LDR',
  'JMP',
  'NBA',
  'BH',
  'POT',
  'PASS',
  'INT',
];

export const RADAR_GRADES = {
  'Cameron Carr': [9, 9, 7, 7, 9, 7, 8, 8, 7, 9, 7, 7],
  'Joshua Jefferson': [7, 8, 7, 8, 7, 8, 7, 8, 7, 7, 9, 8],
  'Isaiah Evans': [8, 8, 8, 6, 7, 8, 9, 8, 7, 8, 7, 8],
  'Tarris Reed Jr.': [7, 7, 7, 9, 7, 8, 7, 8, 8, 6, 8, 8],
};
