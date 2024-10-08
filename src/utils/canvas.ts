import Canvas from "canvas";

export async function canvasPfp(url: string) {
  const canvas = Canvas.createCanvas(576, 576);

  const ctx = canvas.getContext("2d");
  const pfpImage = await Canvas.loadImage(url);

  const sx =
    pfpImage.width > pfpImage.height
      ? (pfpImage.width - pfpImage.height) / 2
      : 0;
  const sy =
    pfpImage.height > pfpImage.width
      ? (pfpImage.height - pfpImage.width) / 2
      : 0;
  const sWidth = Math.min(pfpImage.width, pfpImage.height);
  const sHeight = Math.min(pfpImage.width, pfpImage.height);

  ctx.drawImage(pfpImage, sx, sy, sWidth, sHeight, 0, 0, 576, 576); // Draw the image with 1:1 aspect ratio

  const grd = ctx.createLinearGradient(0, 576 / 2, 576, 576 / 2);
  grd.addColorStop(0, "rgba(255, 255, 255, 1)");
  grd.addColorStop(0.65, "rgba(255, 255, 255, 1)");
  grd.addColorStop(1, "rgba(255, 255, 255, 0)");

  // Apply gradient as globalCompositeOperation to create fade out effect
  ctx.globalCompositeOperation = "destination-in";
  ctx.fillStyle = grd;
  ctx.fillRect(0, 0, 576, 576);
  return canvas;
}
