import { SVGItem } from '../../types/items.type';

export default function buildHtmlContent(svgItem: SVGItem) {
  const { width, height, src } = svgItem;

  return /*html*/ `
<html>
<head>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: content-box;
        }
        .container {
            width: ${width}px;
            background: transparent; 
            height: ${height}px;
        }
        .img {
            width: ${width}px;
            height: ${height}px;
        }

    </style>
</head>
<body>
    <div class="container">
       <img class="img" src="${src}" alt="svg" >
    </div>
</body>
</html>
`;
}
