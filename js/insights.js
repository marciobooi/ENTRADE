/**
 * insights.js
 * Renders the country insights panel — a data-driven "factsheet" view
 * showing core, change and structural metrics for the selected country,
 * energy product and reference year.
 *
 * Depends on globals:  REF, languageNameSpace, barChartSeries,
 *                      barchartdata(), getTitle(), formatNumber() (table.js),
 *                      showChartLoader(), hideChartLoader(),
 *                      showNoDataPopup(), showNoDataInChartContainer()
 */

/* ── Narrative summary ─────────────────────────────────────────────────── */
function buildInsightNarrative({
  geoLabel, tradeLabel, productLabel, year, prevYear,
  topPartner, topPartnerShare, top3Share, hhiConc,
  changePct, biggestIncrease, biggestDecrease, L
}) {
  if (!topPartner) return '';

  const trendText = changePct == null
    ? ''
    : changePct > 0
      ? ` ${L['INS_NAR_INCREASED'] || 'Compared with'} ${prevYear}, ${L['INS_NAR_TRADE_ROSE'] || 'total trade increased by'} ${Math.abs(changePct).toFixed(1)}%.`
      : changePct < 0
        ? ` ${L['INS_NAR_COMPARED'] || 'Compared with'} ${prevYear}, ${L['INS_NAR_TRADE_FELL'] || 'total trade fell by'} ${Math.abs(changePct).toFixed(1)}%.`
        : ` ${L['INS_NAR_COMPARED'] || 'Compared with'} ${prevYear}, ${L['INS_NAR_UNCHANGED'] || 'total trade was unchanged.'}`;

  const moversText = biggestIncrease && biggestDecrease
    ? ` ${L['INS_NAR_LARGEST_INC'] || 'The largest increase came from'} ${biggestIncrease.name}, ${L['INS_NAR_WHILE'] || 'while'} ${biggestDecrease.name} ${L['INS_NAR_LARGEST_DEC'] || 'showed the largest decrease.'}`
    : biggestIncrease
      ? ` ${L['INS_NAR_LARGEST_INC'] || 'The largest increase came from'} ${biggestIncrease.name}.`
      : biggestDecrease
        ? ` ${biggestDecrease.name} ${L['INS_NAR_LARGEST_DEC'] || 'showed the largest decrease.'}`
        : '';

  const partners2to3 = ''; // placeholder — could list 2nd/3rd name if needed
  return `${geoLabel}'s ${productLabel} ${tradeLabel.toLowerCase()} ${L['INS_NAR_IN'] || 'in'} ${year} ${L['INS_NAR_LED'] || 'were led by'} ${topPartner.name}, ${L['INS_NAR_WHICH'] || 'which accounted for'} ${topPartnerShare.toFixed(1)}% ${L['INS_OF_TOTAL'] || 'of total trade'}. ${L['INS_NAR_TOP3'] || 'The top 3 partners represented'} ${top3Share.toFixed(1)}%, ${L['INS_NAR_INDICATING'] || 'indicating'} ${hhiConc.toLowerCase()}.${trendText}${moversText}`;
}

/* ── Main render function ───────────────────────────────────────────────── */
async function createInsightsChart() {
  REF.chart = 'insightsChart';

  const chartContainer = document.getElementById('chartContainer');
  chartContainer.textContent = '';
  chartContainer.setAttribute('aria-busy', 'true');
  showChartLoader();

  // Snapshot full REF state so we can restore it safely in finally block
  const snapshot = { year: REF.year, filter: REF.filter, chart: REF.chart };

  try {
    const L = languageNameSpace.labels; // shorthand

    /* ------------------------------------------------------------------ */
    /* 1. Fetch current-year data (always use "all" partners for metrics)  */
    /* ------------------------------------------------------------------ */
    REF.filter = 'all';
    REF.chart  = 'insightsChart'; // keep chart set for correct getTitle()
    await barchartdata();
    const currentSeries = [...barChartSeries];

    /* ------------------------------------------------------------------ */
    /* 2. Fetch previous-year data                                         */
    /* ------------------------------------------------------------------ */
    const prevYear = String(parseInt(snapshot.year, 10) - 1);
    REF.year = prevYear;
    await barchartdata();
    const prevSeries = [...barChartSeries];

    /* Restore state — also done in finally, but do it here so getTitle()  */
    /* uses the correct year for the panel header.                         */
    REF.year   = snapshot.year;
    REF.filter = snapshot.filter;
    barChartSeries = currentSeries; // restore global for other consumers

    if (!currentSeries.length) {
      showNoDataPopup(L['NODATA']);
      showNoDataInChartContainer(L['NODATA']);
      return;
    }

    /* ------------------------------------------------------------------ */
    /* 3. Compute core metrics                                             */
    /* ------------------------------------------------------------------ */
    const othLabel  = L['OTH'];
    const partners  = currentSeries.filter(d => d.name !== othLabel);
    const total     = currentSeries.reduce((s, d) => s + d.y, 0);
    const prevTotal = prevSeries.reduce((s, d) => s + d.y, 0);

    const topPartner      = partners[0] || null;
    const topPartnerShare = (topPartner && total > 0) ? (topPartner.y / total * 100) : 0;
    const top3Share       = total > 0
      ? (partners.slice(0, 3).reduce((s, d) => s + d.y, 0) / total * 100)
      : 0;
    const reportedPartners = partners.length;

    // Others share — only meaningful when an explicit Others row is present
    const othersRow   = currentSeries.find(d => d.name === othLabel);
    const othersShare = (othersRow && total > 0) ? (othersRow.y / total * 100) : null;

    /* ------------------------------------------------------------------ */
    /* 4. Structural metrics (HHI / diversification)                      */
    /* ------------------------------------------------------------------ */
    // Herfindahl-Hirschman Index over named partners (0–10 000)
    const hhi = Math.round(
      partners.reduce((s, d) => {
        const pct = total > 0 ? (d.y / total * 100) : 0;
        return s + pct * pct;
      }, 0)
    );
    const diversification = hhi > 0 ? (10000 / hhi).toFixed(1) : '–';
    const hhiConc = hhi < 1500
      ? (L['INS_CONC_LOW']  || 'Low concentration')
      : hhi < 2500
        ? (L['INS_CONC_MOD']  || 'Moderate concentration')
        : (L['INS_CONC_HIGH'] || 'High concentration');

    /* ------------------------------------------------------------------ */
    /* 5. Change metrics (requires previous-year data)                    */
    /* ------------------------------------------------------------------ */
    const changeTotal = prevTotal > 0 ? total - prevTotal : null;
    const changePct   = prevTotal > 0 ? ((total - prevTotal) / prevTotal * 100) : null;

    let biggestIncrease  = null;
    let biggestDecrease  = null;
    let newEntrants      = [];
    let droppedOut       = [];
    let rankMovements    = [];
    let topPartnerStable = null;
    let churnNew         = 0;
    let churnGone        = 0;

    const hasPrev = prevSeries.length > 0;

    if (hasPrev) {
      const prevPartners = prevSeries.filter(d => d.name !== othLabel);
      const prevByName   = new Map(
        prevPartners.map((d, i) => [d.name, { value: d.y, rank: i + 1 }])
      );
      const currNames = new Set(partners.map(d => d.name));
      const prevNames = new Set(prevPartners.map(d => d.name));

      /* Partner churn (all visible partners) */
      churnNew  = partners.filter(d => !prevNames.has(d.name)).length;
      churnGone = prevPartners.filter(d => !currNames.has(d.name)).length;

      /* Biggest movers — only report genuine positive/negative changes */
      const changes = partners.map(d => {
        const prev = prevByName.get(d.name);
        return { name: d.name, change: prev != null ? d.y - prev.value : d.y };
      });
      const positiveChanges = changes.filter(d => d.change > 0);
      const negativeChanges = changes.filter(d => d.change < 0);
      biggestIncrease = positiveChanges.length
        ? positiveChanges.reduce((best, d) => d.change > best.change ? d : best)
        : null;
      biggestDecrease = negativeChanges.length
        ? negativeChanges.reduce((best, d) => d.change < best.change ? d : best)
        : null;

      /* Top-5 entrants / dropouts */
      const currTop5Names = new Set(partners.slice(0, 5).map(d => d.name));
      const prevTop5Names = new Set(prevPartners.slice(0, 5).map(d => d.name));
      newEntrants = partners.slice(0, 5)
        .filter(d => !prevTop5Names.has(d.name))
        .map(d => d.name);
      droppedOut  = prevPartners.slice(0, 5)
        .filter(d => !currTop5Names.has(d.name))
        .map(d => d.name);

      /* Rank movements (top-5) */
      rankMovements = partners.slice(0, 5).map((d, i) => {
        const prev = prevByName.get(d.name);
        const diff = prev != null ? prev.rank - (i + 1) : null;
        return { name: d.name, rank: i + 1, diff };
      });

      topPartnerStable = prevPartners.length > 0
        && prevPartners[0].name === topPartner?.name;
    }

    /* ------------------------------------------------------------------ */
    /* 6. Formatting helpers                                               */
    /* ------------------------------------------------------------------ */
    const unitLabel = L['abr_' + REF.unit] || L[REF.unit] || REF.unit;
    const NBSP      = '\u202F'; // narrow no-break space before unit

    const fmtVal = v =>
      v != null ? formatNumber(v) + NBSP + unitLabel : '–';

    const fmtPct = v =>
      v != null ? v.toFixed(1) + '%' : '–';

    const fmtChg = v => {
      if (v == null) return '–';
      const sign = v >= 0 ? '+' : '\u2212';
      return sign + formatNumber(Math.abs(v)) + NBSP + unitLabel;
    };

    const fmtChgPct = v => {
      if (v == null) return '–';
      const sign = v >= 0 ? '+' : '\u2212';
      return sign + Math.abs(v).toFixed(1) + '%';
    };

    /* ------------------------------------------------------------------ */
    /* 7. Narrative summary                                                */
    /* ------------------------------------------------------------------ */
    const tradeLabel   = L[REF.trade] || REF.trade;
    const productLabel = L[REF.siec]  || REF.siec;
    const geoLabel     = L[REF.geo]   || REF.geo;
    const narrative    = buildInsightNarrative({
      geoLabel, tradeLabel, productLabel,
      year: snapshot.year, prevYear,
      topPartner, topPartnerShare, top3Share, hhiConc,
      changePct, biggestIncrease, biggestDecrease, L
    });

    /* ------------------------------------------------------------------ */
    /* 8. Build HTML sub-sections                                         */
    /* ------------------------------------------------------------------ */

    /* Rank movement pills */
    const rankMoveHtml = rankMovements.map(m => {
      let badge;
      if (m.diff == null)
        badge = `<span class="insight-badge insight-rank-new">&#9733; ${L['INS_NEW'] || 'new'}</span>`;
      else if (m.diff > 0)
        badge = `<span class="insight-badge insight-rank-up">&#9650;${m.diff}</span>`;
      else if (m.diff < 0)
        badge = `<span class="insight-badge insight-rank-down">&#9660;${Math.abs(m.diff)}</span>`;
      else
        badge = '<span class="insight-badge insight-rank-same">&mdash;</span>';
      return `<span class="insight-rank-item"><span class="insight-rank-num">${m.rank}</span>${m.name}${badge}</span>`;
    }).join('');

    /* Rank table rows */
    const rankTableHtml = partners.map((d, i) => `
      <tr class="ecl-table__row">
        <td class="ecl-table__cell">${i + 1}</td>
        <td class="ecl-table__cell">${d.name}</td>
        <td class="ecl-table__cell">${formatNumber(d.y)}${NBSP}${unitLabel}</td>
        <td class="ecl-table__cell">${total > 0 ? (d.y / total * 100).toFixed(1) : 0}%</td>
      </tr>`).join('');

    const changeClass = (changeTotal != null && changeTotal >= 0)
      ? 'insight-card--positive'
      : 'insight-card--negative';

    /* ------------------------------------------------------------------ */
    /* 9. Render                                                           */
    /* ------------------------------------------------------------------ */
    const titleId = 'insights-panel-title';
    const noteId = 'insights-panel-note';
    const panel = document.createElement('div');
    panel.id = 'insights-panel';
    panel.className = 'insights-panel';
    panel.tabIndex = 0;
    panel.setAttribute('role', 'region');
    panel.setAttribute('aria-labelledby', titleId);
    panel.setAttribute('aria-describedby', noteId);

    panel.innerHTML = `
      <h2 class="insights-title" id="${titleId}">${getTitle()}</h2>

      ${narrative
        ? `<p class="insights-summary">${narrative}</p>`
        : ''}

      <p class="insights-note" id="${noteId}">
        <i class="fas fa-info-circle" aria-hidden="true"></i>
        ${L['INS_DATA_NOTE'] || 'Metrics are calculated using all available partner countries for the selected year.'}
      </p>

      <div class="insights-sections">

        <!-- ═══ CORE METRICS ═══ -->
        <section class="insights-section" aria-labelledby="ins-core-heading">
          <h3 class="insights-section__title" id="ins-core-heading">
            <i class="fas fa-tachometer-alt" aria-hidden="true"></i>
            ${L['INS_CORE'] || 'Core metrics'}
          </h3>

          <div class="insights-cards">
            <div class="insight-card">
              <div class="insight-card__label">${L['INS_TOTAL'] || 'Total trade value'}</div>
              <div class="insight-card__value">${fmtVal(total)}</div>
            </div>
            <div class="insight-card">
              <div class="insight-card__label">${L['INS_TOP_PARTNER'] || 'Top partner'}</div>
              <div class="insight-card__value">${topPartner ? topPartner.name : '–'}</div>
              <div class="insight-card__sub">${fmtPct(topPartnerShare)}&nbsp;${L['INS_OF_TOTAL'] || 'of total'}</div>
            </div>
            <div class="insight-card">
              <div class="insight-card__label">${L['INS_TOP3'] || 'Top 3 share'}</div>
              <div class="insight-card__value">${fmtPct(top3Share)}</div>
            </div>
            <div class="insight-card">
              <div class="insight-card__label">${L['INS_REPORTED'] || 'Partners with reported trade'}</div>
              <div class="insight-card__value">${reportedPartners}</div>
            </div>
            ${othersShare != null ? `
            <div class="insight-card">
              <div class="insight-card__label">${L['INS_OTHERS_SHARE'] || 'Others share'}</div>
              <div class="insight-card__value">${fmtPct(othersShare)}</div>
            </div>` : ''}
          </div>

          <div class="insights-rank-table-wrapper">
            <table class="ecl-table insights-rank-table"
                   aria-label="${L['INS_RANK_LIST'] || 'Partner ranking'}">
              <thead class="ecl-table__head">
                <tr class="ecl-table__row">
                  <th class="ecl-table__header" scope="col">#</th>
                  <th class="ecl-table__header" scope="col">${L['INS_PARTNER'] || 'Partner'}</th>
                  <th class="ecl-table__header" scope="col">${L['INS_VALUE'] || 'Value'}</th>
                  <th class="ecl-table__header" scope="col">${L['INS_SHARE'] || 'Share'}</th>
                </tr>
              </thead>
              <tbody class="ecl-table__body">${rankTableHtml}</tbody>
            </table>
          </div>
        </section>

        <!-- ═══ CHANGE METRICS ═══ -->
        <section class="insights-section" aria-labelledby="ins-change-heading">
          <h3 class="insights-section__title" id="ins-change-heading">
            <i class="fas fa-exchange-alt" aria-hidden="true"></i>
            ${L['INS_CHANGE'] || 'Change metrics'}
            <span class="insights-year-label">${L['INS_VS_PREV'] || 'vs'}&nbsp;${prevYear}</span>
          </h3>

          ${!hasPrev
            ? `<p class="insights-no-prev">${L['INS_NO_PREV'] || 'No previous year data available.'}</p>`
            : `<div class="insights-cards">
                <div class="insight-card ${changeClass}">
                  <div class="insight-card__label">${L['INS_CHANGE_VS'] || 'Change vs'}&nbsp;${prevYear}</div>
                  <div class="insight-card__value">${fmtChg(changeTotal)}</div>
                  <div class="insight-card__sub">${fmtChgPct(changePct)}</div>
                </div>
                <div class="insight-card ${biggestIncrease ? 'insight-card--positive' : ''}">
                  <div class="insight-card__label">${L['INS_BIG_INC'] || 'Biggest increase'}</div>
                  <div class="insight-card__value">${biggestIncrease ? biggestIncrease.name : '\u2013'}</div>
                  <div class="insight-card__sub">${biggestIncrease ? fmtChg(biggestIncrease.change) : (L['INS_NONE_INC'] || 'No partner increased')}</div>
                </div>
                <div class="insight-card ${biggestDecrease ? 'insight-card--negative' : ''}">
                  <div class="insight-card__label">${L['INS_BIG_DEC'] || 'Biggest decrease'}</div>
                  <div class="insight-card__value">${biggestDecrease ? biggestDecrease.name : '\u2013'}</div>
                  <div class="insight-card__sub">${biggestDecrease ? fmtChg(biggestDecrease.change) : (L['INS_NONE_DEC'] || 'No partner decreased')}</div>
                </div>
                <div class="insight-card">
                  <div class="insight-card__label">${L['INS_NEW_TOP5'] || 'New top-5 entrant'}</div>
                  <div class="insight-card__value">${newEntrants.length ? newEntrants.join(', ') : '\u2013'}</div>
                </div>
                <div class="insight-card">
                  <div class="insight-card__label">${L['INS_DROPPED'] || 'Dropped from top 5'}</div>
                  <div class="insight-card__value">${droppedOut.length ? droppedOut.join(', ') : '\u2013'}</div>
                </div>
                <div class="insight-card">
                  <div class="insight-card__label">${L['INS_STABILITY'] || 'Top partner stability'}</div>
                  <div class="insight-card__value">
                    ${topPartnerStable
                      ? `<span class="insight-stable">${L['INS_STABLE']  || '&#10003; Stable'}</span>`
                      : `<span class="insight-changed">${L['INS_CHANGED'] || '&#8597; Changed'}</span>`}
                  </div>
                  <div class="insight-card__sub">${L['INS_SAME_AS'] || 'same #1 as'}&nbsp;${prevYear}</div>
                </div>
              </div>
              <div class="insights-rank-movement">
                <p class="insights-rank-movement__label">
                  <strong>${L['INS_RANK_MOVE'] || 'Rank movement (top 5)'}:</strong>
                </p>
                <div class="insights-rank-movement__items">${rankMoveHtml || '\u2013'}</div>
              </div>`
          }
        </section>

        <!-- \u2550\u2550\u2550 STRUCTURAL METRICS \u2550\u2550\u2550 -->
        <section class="insights-section" aria-labelledby="ins-struct-heading">
          <h3 class="insights-section__title" id="ins-struct-heading">
            <i class="fas fa-sitemap" aria-hidden="true"></i>
            ${L['INS_STRUCT'] || 'Structural metrics'}
          </h3>
          <div class="insights-cards">
            <div class="insight-card">
              <div class="insight-card__label">${L['INS_HHI'] || 'Concentration score (HHI)'}</div>
              <div class="insight-card__value">${hhi.toLocaleString()}</div>
              <div class="insight-card__sub">${hhiConc}</div>
              <div class="insight-card__note">${L['INS_HHI_NOTE'] || 'Higher values indicate more dependence on fewer partners.'}</div>
            </div>
            <div class="insight-card">
              <div class="insight-card__label">${L['INS_DIV'] || 'Diversification score'}</div>
              <div class="insight-card__value">${diversification}</div>
              <div class="insight-card__sub">${L['INS_EFF_PARTNERS_FULL'] || 'Equivalent to about'}&nbsp;${diversification}&nbsp;${L['INS_EFF_EQUAL'] || 'equally sized partners'}</div>
            </div>
            ${hasPrev ? `
            <div class="insight-card">
              <div class="insight-card__label">${L['INS_CHURN_NEW'] || 'New partners'}&nbsp;${L['INS_VS_PREV'] || 'vs'}&nbsp;${prevYear}</div>
              <div class="insight-card__value">${churnNew}</div>
            </div>
            <div class="insight-card">
              <div class="insight-card__label">${L['INS_CHURN_GONE'] || 'No longer present'}&nbsp;${L['INS_VS_PREV'] || 'vs'}&nbsp;${prevYear}</div>
              <div class="insight-card__value">${churnGone}</div>
            </div>` : ''}
          </div>
        </section>

      </div><!-- /.insights-sections -->
    `;

    chartContainer.appendChild(panel);
    chartContainer.setAttribute('aria-busy', 'false');
    panel.focus();
  } finally {
    // Always restore REF to its pre-insights state
    REF.year   = snapshot.year;
    REF.filter = snapshot.filter;
    REF.chart  = snapshot.chart;
    chartContainer.setAttribute('aria-busy', 'false');
    hideChartLoader();
  }
}
