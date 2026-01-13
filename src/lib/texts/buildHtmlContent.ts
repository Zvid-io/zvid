import { buildGoogleFontUrl } from '../../utils/downloadGoogleFont';
import axios from 'axios';
import type * as CSS from 'csstype';

type TextTemplate = CSS.Properties & {
  html?: string;
  text?: string;
  width: number;
  height: number;
};

async function getFontFaces({ fontFamily }: { fontFamily: string }) {
  const fontUrl = buildGoogleFontUrl({
    fontFamily,
  });

  try {
    const response = await axios.get(fontUrl);
    return [response.data];
  } catch (error) {
    console.warn(`Failed to load font ${fontFamily}:`, error);
    return [];
  }
}

export default async function buildHtmlContent(textProps: TextTemplate) {
  const { html, text, fontFamily = 'Poppins', ...rest } = textProps;

  const fontFaces = await getFontFaces({ fontFamily });

  if (!rest.fontSize) rest.fontSize = '42px';

  // Filter out only valid CSS properties (skip html/text etc.)
  const cssProps = Object.entries(rest)
    .map(([key, value]) => {
      if (value === undefined || value === null) return '';
      // Convert camelCase to kebab-case for CSS
      const cssKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();
      return `${cssKey}: ${value};`;
    })
    .join('\n');

  return /* html */ `
<html>
<head>
  <style>
    ${fontFaces.join('\n')}
    * {
      margin: 0;
      padding: 0;
      box-sizing: content-box;
      background: transparent; 
    }
    .container {
      font-family: ${fontFamily};
      ${cssProps}
      ${!rest.width ? 'width: fit-content;' : ''}

    }
  </style>
</head>
<body>
  <div class="container">${html ?? text}</div>
</body>
</html>
`;
}
