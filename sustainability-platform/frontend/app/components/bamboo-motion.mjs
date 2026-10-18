// Shared SVG coordinates keep the falling water attached to the moving lip.
export const bambooPivot = { x: 145, y: 130 };
export const bambooRestAngle = -12;
export function bambooOutlet(angle) {
  const radians = angle * Math.PI / 180;
  const offsetX = 205;
  const offsetY = 19;
  return {
    x: bambooPivot.x + offsetX * Math.cos(radians) - offsetY * Math.sin(radians),
    y: bambooPivot.y + offsetX * Math.sin(radians) + offsetY * Math.cos(radians),
  };
}
