export default function isUrl(urlStr: string) {
  try {
    new URL(urlStr);
    return true;
  } catch (error) {
    return false;
  }
}
