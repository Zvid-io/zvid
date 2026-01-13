import { ImageItem } from '../../types/items.type';
import { fileToDataUrl } from '../../utils/localFileToBase64';

export default async function buildHtmlContent(
  imageItem: ImageItem & {
    actualWidth?: number; // optional: intrinsic image width in px
    actualHeight?: number; // optional: intrinsic image height in px
  }
) {
  const {
    width: viewportW,
    height: viewportH,
    src,
    cropParams,
    radius,
    filter,
  } = imageItem;

  // Defaults (no crop): stretch image to viewport (like your old behavior)
  let imgWidthRule = `${viewportW}px`;
  let imgHeightRule = `${viewportH}px`;
  let transformRule = 'none';
  let objectFitRule = 'cover';

  if (cropParams) {
    const { x = 0, y = 0, width: cropW, height: cropH } = cropParams;

    // Scale factors so that the crop rect becomes exactly the viewport
    const scaleX = (viewportW as number) / cropW;
    const scaleY = (viewportH as number) / cropH;

    // We want translation in original px before scaling; put scale first so translation is scaled:
    // transform = scale(scaleX, scaleY) translate(-x, -y)
    transformRule = `scale(${scaleX}, ${scaleY}) translate(${-x}px, ${-y}px)`;

    // Keep the image at its intrinsic size, let transform handle sizing
    imgWidthRule = 'auto';
    imgHeightRule = 'auto';
    objectFitRule = 'unset';
  }

  // If radius exists, construct border-radius string with px suffix
  let borderRadiusRule = '0';
  if (radius) {
    const { tl = 0, tr = 0, br = 0, bl = 0 } = radius;
    borderRadiusRule = `${tl}px ${tr}px ${br}px ${bl}px`;
  }

  const imgSrc = await fileToDataUrl(src);

  return /* html */ `
<head>
  <meta charset="utf-8" />
  <style>
    * { margin:0; padding:0; box-sizing:content-box; background:transparent; }
    .container {
      width: ${viewportW}px;
      height: ${viewportH}px;
      overflow: hidden;
      border-radius: ${borderRadiusRule};
      position: relative;
    }
    #image {
      width: ${imgWidthRule};
      height: ${imgHeightRule};
      object-fit: ${objectFitRule};
      transform-origin: top left;
      transform: ${transformRule};
      display: block;
      will-change: transform;
    }
  </style>
</head>
<body>
  <div class="container">
    <img id="image" src="${imgSrc}" alt="Image" />
  </div>
</body>
</html>
`;
}
