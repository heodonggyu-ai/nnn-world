/* NNN 모션 코치 — 선 아이콘 모음 (24×24, currentColor) */
(function () {
  'use strict';
  const F = 'fill="currentColor" stroke="none"';
  const P = {
    phone: '<rect x="7" y="2.5" width="10" height="19" rx="2.5"/><path d="M11 18.5h2"/>',
    person: '<circle cx="12" cy="4.5" r="2"/><path d="M12 6.5v7M7.5 9.5l4.5-1.5 4.5 1.5M8.5 21l3.5-7.5 3.5 7.5"/><circle cx="7.5" cy="9.5" r=".6" ' + F + '/><circle cx="16.5" cy="9.5" r=".6" ' + F + '/>',
    scan: '<path d="M4 8V5.5A1.5 1.5 0 0 1 5.5 4H8M16 4h2.5A1.5 1.5 0 0 1 20 5.5V8M20 16v2.5a1.5 1.5 0 0 1-1.5 1.5H16M8 20H5.5A1.5 1.5 0 0 1 4 18.5V16"/><path d="M7.5 14.5l3-3 2.5 2.5 4-4.5"/>',
    diamond: '<path d="M12 3.5l8.5 8.5-8.5 8.5L3.5 12z" ' + F + '/>',
    keys: '<path d="M7 7l4 5-4 5-4-5z" ' + F + '/><path d="M17 7l4 5-4 5-4-5z"/><path d="M11 12h2"/>',
    camera: '<path d="M3.5 8.5A1.5 1.5 0 0 1 5 7h2.2l1.6-2.2h6.4L16.8 7H19a1.5 1.5 0 0 1 1.5 1.5V18A1.5 1.5 0 0 1 19 19.5H5A1.5 1.5 0 0 1 3.5 18z"/><circle cx="12" cy="13" r="3.6"/>',
    film: '<rect x="3" y="4" width="18" height="16" rx="2.5"/><path d="M7.5 4v16M16.5 4v16M3 9h4.5M3 15h4.5M16.5 9H21M16.5 15H21"/>',
    play: '<path d="M7.5 5.2v13.6a.8.8 0 0 0 1.2.7l11-6.8a.8.8 0 0 0 0-1.4l-11-6.8a.8.8 0 0 0-1.2.7z" ' + F + '/>',
    pause: '<rect x="6.5" y="5" width="4" height="14" rx="1.2" ' + F + '/><rect x="13.5" y="5" width="4" height="14" rx="1.2" ' + F + '/>',
    stepback: '<path d="M18 6.2v11.6a.7.7 0 0 1-1.1.6L9 12.6a.7.7 0 0 1 0-1.2l7.9-5.8a.7.7 0 0 1 1.1.6z" ' + F + '/><path d="M6 6v12"/>',
    stepfwd: '<path d="M6 6.2v11.6a.7.7 0 0 0 1.1.6L15 12.6a.7.7 0 0 0 0-1.2L7.1 5.6A.7.7 0 0 0 6 6.2z" ' + F + '/><path d="M18 6v12"/>',
    repeat: '<path d="M17 3l3 3-3 3"/><path d="M4 11.5V10a4 4 0 0 1 4-4h12"/><path d="M7 21l-3-3 3-3"/><path d="M20 12.5V14a4 4 0 0 1-4 4H4"/>',
    pencil: '<path d="M4 20l1-4.5L15.5 5a2.1 2.1 0 0 1 3 3L8 18.5z"/><path d="M13.5 7l3 3"/>',
    video: '<rect x="3" y="6" width="13" height="12" rx="2.5"/><path d="M16 10.5l4.2-2.6a.5.5 0 0 1 .8.4v7.4a.5.5 0 0 1-.8.4L16 13.5"/>',
    videooff: '<path d="M10 6h3.5A2.5 2.5 0 0 1 16 8.5v3M16 16a2.5 2.5 0 0 1-2.5 2H5.5A2.5 2.5 0 0 1 3 15.5v-7A2.5 2.5 0 0 1 5 6"/><path d="M16 10.5l4.2-2.6a.5.5 0 0 1 .8.4v7.4a.5.5 0 0 1-.8.4"/><path d="M3 3l18 18"/>',
    sliders: '<path d="M4 7h9M17 7h3M4 17h3M11 17h9"/><circle cx="15" cy="7" r="2.2"/><circle cx="9" cy="17" r="2.2"/>',
    zoom: '<circle cx="10.5" cy="10.5" r="6"/><path d="M15 15l5 5M8 10.5h5M10.5 8v5"/>',
    square: '<rect x="4.5" y="4.5" width="15" height="15" rx="3"/>',
    checkbox: '<rect x="4" y="4" width="16" height="16" rx="3.5"/><path d="M8 12.2l2.8 2.8L16 9.5"/>',
    reset: '<path d="M4.5 12a7.5 7.5 0 1 0 2.2-5.3"/><path d="M4 4v4.5h4.5"/>',
    download: '<path d="M12 4v11M7.5 10.5L12 15l4.5-4.5M5 20h14"/>',
    share: '<path d="M12 15V3.5M8 7.5l4-4 4 4"/><path d="M8 11H6.5A1.5 1.5 0 0 0 5 12.5v6A1.5 1.5 0 0 0 6.5 20h11a1.5 1.5 0 0 0 1.5-1.5v-6a1.5 1.5 0 0 0-1.5-1.5H16"/>',
    undo: '<path d="M9 14L4 9l5-5"/><path d="M4 9h10.5a5.5 5.5 0 0 1 0 11H11"/>',
    redo: '<path d="M15 14l5-5-5-5"/><path d="M20 9H9.5a5.5 5.5 0 0 0 0 11H13"/>',
    trash: '<path d="M4 7h16M10 11v6M14 11v6"/><path d="M6 7l.9 11.6A1.5 1.5 0 0 0 8.4 20h7.2a1.5 1.5 0 0 0 1.5-1.4L18 7M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>',
    check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
    up: '<path d="M12 19V5M6 11l6-6 6 6"/>',
    down: '<path d="M12 5v14M6 13l6 6 6-6"/>',
    left: '<path d="M19 12H5M11 6l-6 6 6 6"/>',
    right: '<path d="M5 12h14M13 6l6 6-6 6"/>',
    keyprev: '<path d="M16 6.5l5 5.5-5 5.5-5-5.5z" ' + F + '/><path d="M8 7l-5 5 5 5"/>',
    keynext: '<path d="M8 6.5l5 5.5-5 5.5-5-5.5z" ' + F + '/><path d="M16 7l5 5-5 5"/>',
    record: '<rect x="2.5" y="5" width="19" height="14" rx="3"/><circle cx="12" cy="12" r="3.2" ' + F + '/>',
    card: '<rect x="3" y="5" width="18" height="14" rx="2.5"/><circle cx="9" cy="10.5" r="2.2"/><path d="M5.6 16c.7-1.6 1.9-2.4 3.4-2.4s2.7.8 3.4 2.4M14.5 10h4M14.5 13.5h3"/>',
    cube: '<path d="M12 2.8l8 4.6v9.2l-8 4.6-8-4.6V7.4z"/><path d="M4 7.4l8 4.6 8-4.6M12 12v9.2"/>',
    sparkles: '<path d="M10 3.5l1.6 4.4 4.4 1.6-4.4 1.6L10 15.5l-1.6-4.4L4 9.5l4.4-1.6z"/><path d="M17.5 13.5l.9 2.1 2.1.9-2.1.9-.9 2.1-.9-2.1-2.1-.9 2.1-.9z"/>',
    copy: '<rect x="8.5" y="8.5" width="11.5" height="11.5" rx="2"/><path d="M15.5 8.5V6A1.5 1.5 0 0 0 14 4.5H6A1.5 1.5 0 0 0 4.5 6v8A1.5 1.5 0 0 0 6 15.5h2.5"/>',
    chat: '<path d="M12 4.5c4.7 0 8.5 2.9 8.5 6.5s-3.8 6.5-8.5 6.5c-.9 0-1.8-.1-2.6-.3L5 19.5l1.1-3.6C4.5 14.7 3.5 13 3.5 11c0-3.6 3.8-6.5 8.5-6.5z"/>',
    folder: '<path d="M3.5 7A1.5 1.5 0 0 1 5 5.5h4.2l2 2.2H19A1.5 1.5 0 0 1 20.5 9.2V17A1.5 1.5 0 0 1 19 18.5H5A1.5 1.5 0 0 1 3.5 17z"/>',
    cloud: '<path d="M7 18.5a4.2 4.2 0 0 1-.6-8.4 6 6 0 0 1 11.4 1.6 3.4 3.4 0 0 1-.3 6.8z"/><path d="M9.5 14l2 2 3.5-3.5"/>',
    save: '<path d="M5 4h11l3 3v12a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1z"/><path d="M8.5 4v4.5h6V4M8 20v-5.5h8V20"/>',
    bot: '<rect x="4.5" y="8" width="15" height="11" rx="3.5"/><path d="M12 4.5V8M9.5 13v1M14.5 13v1M2.5 12.5v2M21.5 12.5v2"/><circle cx="12" cy="4" r="1" ' + F + '/>',
    alert: '<path d="M10.3 4.5L2.8 17.6A2 2 0 0 0 4.5 20.5h15a2 2 0 0 0 1.7-2.9L13.7 4.5a2 2 0 0 0-3.4 0z"/><path d="M12 9.5v4.5M12 17.2v.1"/>',
    thumb: '<path d="M7.5 10.5v9H4.5v-9z"/><path d="M7.5 10.5l3.6-6.3a1.8 1.8 0 0 1 3.3 1.3L13.6 9.5H19a2 2 0 0 1 2 2.4l-1.3 6A2 2 0 0 1 17.8 19.5H7.5"/>',
    bolt: '<path d="M13 2.5L5 13.5h6l-1 8 8-11h-6z"/>',
    info: '<circle cx="12" cy="12" r="8.5"/><path d="M12 11v5.5M12 7.8v.1"/>',
    bulb: '<path d="M9 18h6M10 21h4"/><path d="M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2V16h5v-.1c0-.8.4-1.5 1-2A6 6 0 0 0 12 3z"/>'
  };
  function IC(name, cls) {
    const body = P[name] || P.info;
    return `<svg class="ic${cls ? ' ' + cls : ''}" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${body}</svg>`;
  }
  function hydrate(root) {
    (root || document).querySelectorAll('i[data-ic]').forEach(el => { el.outerHTML = IC(el.dataset.ic, el.dataset.cls); });
  }
  window.IC = IC;
  window.IC.hydrate = hydrate;
  hydrate();
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => hydrate());
})();
