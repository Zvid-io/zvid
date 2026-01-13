export default function calcImageRect(
  width: number,
  height: number,
  theta: number
) {
  // Convert theta to radians
  const thetaRad = (theta * Math.PI) / 180;

  // Calculate the new dimensions of the rectangle after rotation
  const boundX =
    Math.abs(width * Math.cos(thetaRad)) +
    Math.abs(height * Math.sin(thetaRad));
  const boundY =
    Math.abs(height * Math.cos(thetaRad)) +
    Math.abs(width * Math.sin(thetaRad));

  // Calculate the offsets to position the rotated image around the center
  const offsetX = (boundX - width) / 2;
  const offsetY = (boundY - height) / 2;

  return {
    width: Math.ceil(boundX),
    height: Math.ceil(boundY),
    offsetX: Math.ceil(offsetX),
    offsetY: Math.ceil(offsetY),
  };
}
