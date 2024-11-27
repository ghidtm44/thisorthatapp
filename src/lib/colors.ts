// Predefined colors for voting options
export const colorPalette = [
  '#FF6B6B', // Coral Red
  '#4ECDC4', // Turquoise
  '#45B7D1', // Sky Blue
  '#96CEB4', // Sage Green
  '#FFEEAD', // Cream Yellow
  '#D4A5A5', // Dusty Rose
  '#9B5DE5', // Purple
  '#F15BB5', // Pink
  '#00BBF9', // Bright Blue
  '#00F5D4', // Mint
  '#FF9F1C', // Orange
  '#2EC4B6', // Teal
  '#E71D36', // Bright Red
  '#FF3366', // Rose
  '#4D8B31'  // Forest Green
];

export function getRandomColor(usedColors: string[] = []): string {
  const availableColors = colorPalette.filter(color => !usedColors.includes(color));
  if (availableColors.length === 0) return colorPalette[0];
  const randomIndex = Math.floor(Math.random() * availableColors.length);
  return availableColors[randomIndex];
}