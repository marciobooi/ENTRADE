/**
 * Vertical icon toolbar docked to the right edge of the map (home / zoom in /
 * zoom out / fullscreen / help / clear) and the map navigation help modal it
 * opens.
 */
import { map, MAP_INITIAL_POSITION } from './mapState.js';
import { clearMap } from './mapDrawing.js';
import { announceToScreenReader } from './mapKeyboardNav.js';

/**
 * Vertical icon toolbar docked to the right edge of the map: reset view (home),
 * zoom in/out, fullscreen toggle, and clear map - matching the original tool's
 * webtools-provided control bar, rebuilt natively since eurostat-map only
 * ships bare +/- buttons. Reuses the original wt-button-* ids and HOME/ZIN/
 * ZOUT/FULL/CLEAR translation keys so language.js's existing relabeling logic
 * (see updatePageLabels) keeps working on language switch, unmodified.
 */
export function buildMapToolbar() {
  // Idempotent: rebuild cleanly on every map.build() (e.g. window resize).
  document.querySelectorAll('.entrade-map-toolbar').forEach(el => el.remove());

  const mapElem = document.querySelector('#map');
  if (!mapElem) return;

  const labels = (languageNameSpace && languageNameSpace.labels) || {};
  const homeLabel = labels['HOME'] || 'Home';
  const zoomInLabel = labels['ZIN'] || 'Zoom in';
  const zoomOutLabel = labels['ZOUT'] || 'Zoom out';
  const fullscreenLabel = labels['FULL'] || 'Fullscreen';
  const clearLabel = labels['CLEAR'] || labels['btn7'] || 'Clear map';

  const toolbar = document.createElement('div');
  toolbar.className = 'entrade-map-toolbar';
  toolbar.setAttribute('role', 'toolbar');
  toolbar.setAttribute('aria-label', labels['MAP_TOOLS'] || 'Map controls');

  const makeBtn = (id, icon, label, onClick) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.id = id;
    btn.className = 'entrade-map-toolbar__btn';
    btn.setAttribute('aria-label', label);
    btn.title = label;
    btn.innerHTML = `<i class="fas ${icon}" aria-hidden="true"></i>`;
    btn.addEventListener('click', onClick);
    toolbar.appendChild(btn);
    return btn;
  };

  makeBtn('wt-button-home', 'fa-home', homeLabel, () => {
    if (map && typeof map.position === 'function') {
      map.position(MAP_INITIAL_POSITION);
    }
  });

  makeBtn('wt-button-zoomin', 'fa-plus', zoomInLabel, () => {
    if (map && map.svg_ && map.__zoomBehavior) {
      map.svg_.transition().duration(200).call(map.__zoomBehavior.scaleBy, 1.6);
    }
  });

  makeBtn('wt-button-zoomout', 'fa-minus', zoomOutLabel, () => {
    if (map && map.svg_ && map.__zoomBehavior) {
      map.svg_.transition().duration(200).call(map.__zoomBehavior.scaleBy, 1 / 1.6);
    }
  });

  makeBtn('wt-button-fullscreen', 'fa-expand', fullscreenLabel, () => {
    if (!document.fullscreenElement) {
      mapElem.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
  });

  if (!document.__entradeFullscreenListenerAttached) {
    document.__entradeFullscreenListenerAttached = true;
    document.addEventListener('fullscreenchange', () => {
      const icon = document.querySelector('#wt-button-fullscreen i');
      if (!icon) return;
      const isFs = document.fullscreenElement === document.querySelector('#map');
      icon.className = isFs ? 'fas fa-compress' : 'fas fa-expand';
    });
  }

  makeBtn('wt-button-help', 'fa-question-circle', labels['MAP_HELP_BTN'] || 'Map navigation help', openMapHelpModal);

  makeBtn('wt-button-clear', 'fa-eraser', clearLabel, () => {
    const countryInfo = document.querySelector('#countryInfo');
    if (countryInfo) countryInfo.remove();

    REF.geo = '';
    REF.chart = 'map';

    clearMap();
    announceToScreenReader(clearLabel);
    if (window.dataNameSpace && typeof dataNameSpace.setRefURL === 'function') {
      dataNameSpace.setRefURL();
    }
  });

  mapElem.appendChild(toolbar);
}

/**
 * Opens the map navigation help modal - reuses the same ECL <dialog> pattern
 * and trapFocusInModal() helper (defined in iframe.js) as the existing
 * share/embed modal, so it behaves and looks consistent with the rest of
 * the tool rather than introducing a second, bespoke popup mechanism.
 */
export function openMapHelpModal() {
  const modal = document.querySelector('#mapHelpModal');
  if (!modal) return;
  const labels = (languageNameSpace && languageNameSpace.labels) || {};
  const t = (key, fallback) => labels[key] || fallback;

  const headerContent = modal.querySelector('.ecl-modal__header-content');
  if (headerContent) headerContent.textContent = t('MAP_HELP_TITLE', 'Map navigation');

  const closeLabel = t('MAP_HELP_CLOSE', 'Close');
  const closeLabelEl = modal.querySelector('.mapHelpCloseLabel');
  if (closeLabelEl) closeLabelEl.textContent = closeLabel;
  const closeBtnEl = modal.querySelector('.mapHelpCloseBtn');
  if (closeBtnEl) closeBtnEl.textContent = closeLabel;

  const body = modal.querySelector('.mapHelpContent');
  if (body) {
    const section = (titleKey, titleFallback, itemKeys) => `
      <h3>${t(titleKey, titleFallback)}</h3>
      <ul>${itemKeys.map(([key, fallback]) => `<li>${t(key, fallback)}</li>`).join('')}</ul>`;

    body.innerHTML = `
      <p>${t('MAP_HELP_INTRO', 'Explore the map using your mouse or keyboard.')}</p>
      ${section('MAP_HELP_MOUSE_TITLE', 'Mouse', [
        ['MAP_HELP_MOUSE_1', 'Click a country to see its trade partners.'],
        ['MAP_HELP_MOUSE_2', 'Scroll to zoom in or out.'],
        ['MAP_HELP_MOUSE_3', 'Drag the map to pan.'],
        ['MAP_HELP_MOUSE_4', 'Use the +/− buttons to zoom, or the home button to reset the view.'],
      ])}
      ${section('MAP_HELP_KEYBOARD_TITLE', 'Keyboard', [
        ['MAP_HELP_KEYBOARD_1', 'Press Tab to reach the map, then Enter to start.'],
        ['MAP_HELP_KEYBOARD_2', 'Use the arrow keys to pan, and + or − to zoom.'],
        ['MAP_HELP_KEYBOARD_3', 'Press Tab to move between countries, and Enter or Space to select one.'],
        ['MAP_HELP_KEYBOARD_4', 'Press Escape to clear a selection, or press it again to leave the map.'],
      ])}`;
  }

  modal.showModal();
  if (typeof ECL !== 'undefined' && ECL.autoInit) ECL.autoInit();
  if (typeof trapFocusInModal === 'function') trapFocusInModal(modal);
}
