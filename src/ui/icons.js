/** Icônes SVG inline minimalistes (pas de dépendance à une icon font externe). */

function svgIcon(pathD, viewBox) {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', viewBox || '0 0 24 24');
  svg.setAttribute('fill', 'currentColor');
  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  path.setAttribute('d', pathD);
  svg.append(path);
  return svg;
}

const Icons = {
  home: () => svgIcon('M12 3 2 12h3v8h5v-6h4v6h5v-8h3L12 3z'),
  map: () => svgIcon('M15 5.1 9 3 3 5v16l6-2.1 6 2.1 6-2V3l-6 2.1zM9 5.2l6-1.6v15.2l-6 1.6V5.2z'),
  groups: () => svgIcon('M16 11a3 3 0 1 0-3-3 3 3 0 0 0 3 3zm-8 0a3 3 0 1 0-3-3 3 3 0 0 0 3 3zm0 2c-2.3 0-7 1.2-7 3.5V19h8.1a5.6 5.6 0 0 1-.1-1v-1.5c0-1.1.4-2.1 1.2-3A12 12 0 0 0 8 13zm8 0c-.6 0-1.3.1-2 .2a5.7 5.7 0 0 1 2 4.3V19h7v-2.5c0-2.3-4.7-3.5-7-3.5z'),
  settings: () => svgIcon('M19.4 13a7.7 7.7 0 0 0 .1-1 7.7 7.7 0 0 0-.1-1l2.1-1.6a.5.5 0 0 0 .1-.6l-2-3.5a.5.5 0 0 0-.6-.2l-2.5 1a7.4 7.4 0 0 0-1.7-1l-.4-2.6a.5.5 0 0 0-.5-.4h-4a.5.5 0 0 0-.5.4l-.4 2.6a7.4 7.4 0 0 0-1.7 1l-2.5-1a.5.5 0 0 0-.6.2l-2 3.5a.5.5 0 0 0 .1.6L4.6 11a7.7 7.7 0 0 0 0 2l-2.1 1.6a.5.5 0 0 0-.1.6l2 3.5a.5.5 0 0 0 .6.2l2.5-1a7.4 7.4 0 0 0 1.7 1l.4 2.6a.5.5 0 0 0 .5.4h4a.5.5 0 0 0 .5-.4l.4-2.6a7.4 7.4 0 0 0 1.7-1l2.5 1a.5.5 0 0 0 .6-.2l2-3.5a.5.5 0 0 0-.1-.6zM12 15.5A3.5 3.5 0 1 1 15.5 12 3.5 3.5 0 0 1 12 15.5z'),
  flag: () => svgIcon('M5 3v18h2v-7h9l-1-3 1-3H7V3z'),
  questionMark: () => svgIcon('M11 18h2v-2h-2zm1-16a7 7 0 0 0-7 7h2a5 5 0 1 1 5 5 1 1 0 0 0-1 1v2h2v-1.3A7 7 0 0 0 12 2z'),
  star: () => svgIcon('m12 2 3.1 6.6 7.1.9-5.2 5 1.4 7.1-6.4-3.7-6.4 3.7 1.4-7.1-5.2-5 7.1-.9z'),
  search: () => svgIcon('M15.5 14h-.8l-.3-.3a6.5 6.5 0 1 0-.7.7l.3.3v.8l5 5 1.5-1.5zm-6 0a4.5 4.5 0 1 1 0-9 4.5 4.5 0 0 1 0 9z'),
  close: () => svgIcon('M19 6.4 17.6 5 12 10.6 6.4 5 5 6.4l5.6 5.6L5 17.6 6.4 19l5.6-5.6 5.6 5.6 1.4-1.4-5.6-5.6z'),
  chevronDown: () => svgIcon('M7 10l5 5 5-5z'),
  check: () => svgIcon('M9 16.2 4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4z'),
  add: () => svgIcon('M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6z'),
  delete: () => svgIcon('M6 7h12l-1 14H7zM9 4h6l1 2H8z'),
  groupOff: () => svgIcon('M3 4.3 4.3 3l17 17-1.3 1.3-2.6-2.6H2v-2.5c0-1.7 2.6-2.8 4.8-3.3zM16 11a3 3 0 1 0-2.2-5zm-8-3a3 3 0 0 0 3 3l.4 0L8.3 8z'),
  edit: () => svgIcon('M3 17.3V21h3.7L17.8 9.9l-3.7-3.7zM20.7 7a1 1 0 0 0 0-1.4L18.4 3.3a1 1 0 0 0-1.4 0L15.1 5.2l3.7 3.7z'),
  trophy: () => svgIcon('M19 3h-3V2H8v1H5a3 3 0 0 0-3 3v1a4 4 0 0 0 4 4 5.3 5.3 0 0 0 4.5 3.9V16H8v2h8v-2h-2.5v-2.1A5.3 5.3 0 0 0 18 9a4 4 0 0 0 4-4V4a3 3 0 0 0-3-3zM4 7V6a1 1 0 0 1 1-1h3v4a4 4 0 0 1-4-2zm16-1a1 1 0 0 1 1 1 2 2 0 0 1-2 2 2 2 0 0 1-2 0V5h3z'),
  medal: () => svgIcon('M12 2 6 6v5a6 6 0 0 0 12 0V6zm0 2.6L16 7v4a4 4 0 0 1-8 0V7zM9 22l3-2 3 2-1-4h-4z'),
  arrowBack: () => svgIcon('M20 11H7.8l4.6-4.6L11 5l-7 7 7 7 1.4-1.4L7.8 13H20z'),
  history: () => svgIcon('M13 3a9 9 0 0 0-9 9H1l3.9 3.9.1.1L9 12H6a7 7 0 1 1 2.1 5 1 1 0 0 0-1.4 1.4A9 9 0 1 0 13 3zm-1 5v5l4.3 2.5.7-1.2-3.5-2.1V8z'),
};
