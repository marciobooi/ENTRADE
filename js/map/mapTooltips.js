/**
 * Everything tooltip-related: the trade "pop-card" (mouse hover and keyboard
 * focus on a partner arc/marker), the plain country-name label (mouse hover
 * and keyboard focus on any country), and the shared viewport-clamped
 * positioning helper both use.
 */
import { getPathCountryCode } from './mapUtils.js';

/**
 * Places a tooltip element at a desired point, then clamps it to stay fully
 * within the viewport. Tooltips were anchored purely relative to the cursor
 * (mouse) or straight above the focused country (keyboard), so near any edge
 * - especially the top, since the keyboard tooltip anchors above its country
 * - they could render partly or entirely off-screen.
 */
export function positionTooltip(tooltipContainer, desiredLeft, desiredTop) {
  if (!tooltipContainer) return;

  const margin = 10;
  const tipRect = tooltipContainer.getBoundingClientRect();
  const minLeft = window.scrollX + margin;
  const maxLeft = window.scrollX + window.innerWidth - tipRect.width - margin;
  const minTop = window.scrollY + margin;
  const maxTop = window.scrollY + window.innerHeight - tipRect.height - margin;

  // If the tooltip is taller/wider than the viewport has room for, prefer
  // pinning it to the top/left margin over letting it overflow.
  const left = maxLeft >= minLeft ? Math.min(Math.max(desiredLeft, minLeft), maxLeft) : minLeft;
  const top = maxTop >= minTop ? Math.min(Math.max(desiredTop, minTop), maxTop) : minTop;

  tooltipContainer.style.left = left + 'px';
  tooltipContainer.style.top = top + 'px';
}

export function lineTooltip(partnerCountry, value, countryName) {
  const labels = languageNameSpace?.labels || {};
  const title = labels[REF.trade] || labels[REF.dataset] || 'Trade';
  const labelFuel = labels[REF.fuel] || REF.fuel || 'Natural gas';
  const unit = labels[`abr_${REF.unit}`] || REF.unit || 'TJ';
  const partnerLabel = labels[partnerCountry] || partnerCountry;
  const countryLabel = labels[countryName] || countryName;
  const countryOne = REF.trade === 'imp' ? partnerLabel : countryLabel;
  const countryTwo = REF.trade === 'imp' ? countryLabel : partnerLabel;
  const countryValue = Number(value).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  const icon = REF.fuel || 'gas';

  return `
  <div class="pop-card pop-card--solid">
    <div class="pop-card__header">
      <div class="pop-card__icon-wrap">
        <img src="img/fuel-family/${icon}.png" alt="${labelFuel}">
      </div>
      <div class="pop-card__titles">
        <span class="pop-card__label">${title.toUpperCase()}</span>
        <span class="pop-card__fuel">${labelFuel}</span>
      </div>
    </div>
    <div class="pop-card__body">
      <div class="pop-card__route">
        <span class="pop-card__country">${countryOne}</span>
        <span class="pop-card__arrow">
          <svg width="24" height="12" viewBox="0 0 24 12" fill="none">
            <path d="M0 6h20m0 0l-4-4m4 4l-4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </span>
        <span class="pop-card__country">${countryTwo}</span>
      </div>
      <div class="pop-card__value-wrap">
        <span class="pop-card__value">${countryValue}</span>
        <span class="pop-card__unit">${unit}</span>
      </div>
    </div>
  </div>`;
}

/**
 * Hovering any country (not just the ~40 selectable ones, and not just an
 * active selection's partners) shows its name - the old Leaflet map did this
 * natively via its own tooltip layer, but eurostat-map has no equivalent, so
 * this was silently lost in the migration. A separate, lighter tooltip
 * element from #entradeMapTooltip's trade pop-card, since the two can be
 * visible for genuinely different targets (a country's fill vs. a flow
 * arc/marker) and shouldn't share markup meant for the richer card layout.
 */
export function attachCountryNameTooltips() {
  const worldrg = document.querySelector('#em-worldrg');
  if (!worldrg || worldrg.__nameTooltipAttached) return;
  worldrg.__nameTooltipAttached = true;

  let nameTooltip = document.querySelector('#entradeCountryNameTooltip');
  if (!nameTooltip) {
    nameTooltip = document.createElement('div');
    nameTooltip.id = 'entradeCountryNameTooltip';
    nameTooltip.style.display = 'none';
    document.body.appendChild(nameTooltip);
  }

  // rAF-throttled: raw mousemove can fire 100+ times/sec (especially while
  // dragging to pan, when it's competing with D3's own zoom mousemove
  // handler on the same events), and positionTooltip's getBoundingClientRect
  // call forces a synchronous layout flush - running that on every single
  // event, on top of the pan transform update pending in the same tick, was
  // the other half of the drag/click-select jank alongside the flow-layer
  // rescale observer (see attachZoomScaling in mapAnimation.js). Coalescing
  // to one update per animation frame keeps the tooltip just as responsive
  // while cutting the forced-layout count to match the screen's actual
  // repaint rate.
  // Hover fill highlight. reapplyCountryColors (mapDrawing.js) sets each
  // country's fill inline via style.setProperty(..., 'important') - an
  // inline !important always wins over a stylesheet !important regardless
  // of selector specificity, so a plain CSS :hover rule would never actually
  // show through it. Overriding/restoring the same inline property here,
  // piggybacked on the same rAF-throttled mousemove tracking used for the
  // name tooltip, keeps it in sync with whatever color that path is
  // "really" supposed to be (selected/partner/EU/other) once un-hovered.
  const HOVER_FILL = 'rgb(81 94 138)';
  let hoveredPath = null;
  function setHoverFill(path) {
    if (hoveredPath === path) return;
    if (hoveredPath) {
      const restore = hoveredPath.dataset.hoverOrigFill;
      if (restore !== undefined) hoveredPath.style.setProperty('fill', restore, 'important');
      delete hoveredPath.dataset.hoverOrigFill;
    }
    hoveredPath = path;
    if (hoveredPath) {
      hoveredPath.dataset.hoverOrigFill = hoveredPath.style.getPropertyValue('fill');
      hoveredPath.style.setProperty('fill', HOVER_FILL, 'important');
    }
  }

  let pendingMouseEvent = null;
  let mouseMoveScheduled = false;
  worldrg.addEventListener('mousemove', (event) => {
    pendingMouseEvent = event;
    if (mouseMoveScheduled) return;
    mouseMoveScheduled = true;
    requestAnimationFrame(() => {
      mouseMoveScheduled = false;
      const e = pendingMouseEvent;
      const path = e.target.closest('path');
      const code = path ? getPathCountryCode(path) : null;
      // Only the EU/reportable countries (defGeos) get the hover fill - non-EU
      // partners (e.g. US, Russia, Qatar) still show the name tooltip below,
      // just without the highlight.
      setHoverFill(code && defGeos.includes(code) ? path : null);
      if (!code) {
        nameTooltip.style.display = 'none';
        return;
      }
      const labels = (languageNameSpace && languageNameSpace.labels) || {};
      nameTooltip.textContent = labels[code] || code;
      nameTooltip.style.display = 'block';
      positionTooltip(nameTooltip, e.pageX + 15, e.pageY + 15);
    });
  });

  worldrg.addEventListener('mouseleave', () => {
    setHoverFill(null);
    nameTooltip.style.display = 'none';
  });
}

/** Shows the same pop-card mouse hover uses, anchored to a keyboard-focused country instead of the cursor. */
export function showKeyboardTooltip(anchorPath, partnerCode, value) {
  const tooltipContainer = document.querySelector('#entradeMapTooltip');
  if (!tooltipContainer) return;
  tooltipContainer.innerHTML = lineTooltip(partnerCode, value, REF.geo);
  tooltipContainer.style.display = 'block'; // needs to be visible before measuring its real size below

  const rect = anchorPath.getBoundingClientRect();
  const tipRect = tooltipContainer.getBoundingClientRect();
  const desiredLeft = rect.left + rect.width / 2 + window.scrollX - tipRect.width / 2; // centered on the country
  const desiredTop = rect.top + window.scrollY - tipRect.height - 12; // above it
  positionTooltip(tooltipContainer, desiredLeft, desiredTop);
}

export function hideKeyboardTooltip() {
  const tooltipContainer = document.querySelector('#entradeMapTooltip');
  if (tooltipContainer) tooltipContainer.style.display = 'none';
}

/** Keyboard-focus counterpart to attachCountryNameTooltips' mouse hover - same plain name label, anchored to the focused country instead of the cursor. */
export function showCountryNameTooltipForFocus(anchorPath, code) {
  const nameTooltip = document.querySelector('#entradeCountryNameTooltip');
  if (!nameTooltip) return;
  const labels = (languageNameSpace && languageNameSpace.labels) || {};
  nameTooltip.textContent = labels[code] || code;
  nameTooltip.style.display = 'block';

  const rect = anchorPath.getBoundingClientRect();
  const tipRect = nameTooltip.getBoundingClientRect();
  const desiredLeft = rect.left + rect.width / 2 + window.scrollX - tipRect.width / 2;
  const desiredTop = rect.top + window.scrollY - tipRect.height - 10;
  positionTooltip(nameTooltip, desiredLeft, desiredTop);
}

export function hideCountryNameTooltipForFocus() {
  const nameTooltip = document.querySelector('#entradeCountryNameTooltip');
  if (nameTooltip) nameTooltip.style.display = 'none';
}
