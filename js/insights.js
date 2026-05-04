/**
 * insights.js
 * Renders the country insights panel — a data-driven "factsheet" view
 * showing core, change and structural metrics for the selected country,
 * energy product and reference year.
 *
 * Depends on globals:  REF, languageNameSpace, barChartSeries,
 *                      barchartdata(), chartApiCall(), getTitle(),
 *                      formatNumber() (table.js),
 *                      showChartLoader(), hideChartLoader(),
 *                      showNoDataPopup(), showNoDataInChartContainer()
 */

async function createInsightsChart() {
  REF.chart = 'insightsChart';

  const chartContainer = document.getElementById('chartContainer');
  chartContainer.textContent = '';
  showChartLoader();

  try {
    const L = languageNameSpace.labels; // shorthand

    /* ------------------------------------------------------------------ */
    /* 1. Fetch current-year data (always use "all" partners for metrics)  */
    /* ------------------------------------------------------------------ */
    const savedFilter = REF.filter;
    REF.filter = 'all';
    await barchartdata();
    const currentSeries = [...barChartSeries];

    /* ------------------------------------------------------------------ */
    /* 2. Fetch previous-year data                                         */
    /* ------------------------------------------------------------------ */
    const savedYear  = REF.year;
    const prevYear   = String(parseInt(REF.year, 10) - 1);
    REF.year = prevYear;
    await barchartdata();
    const prevSeries = [...barChartSeries];

    /* Restore state */
    REF.year   = savedYear;
    REF.filter = savedFilter;
    barChartSeries = currentSeries; // restore global

    if (!currentSeries.length) {
      showNoDataPopup(L['NODATA']);
      showNoDataInChartContainer(L['NODATA']);
      return;
    }

    /* ------------------------------------------------------------------ */
    /* 3. Compute core metrics                                             */
    /* ------------------------------------------------------------------ */
    const othLabel   = L['OTH'];
    const partners   = currentSeries.filter(d => d.name !== othLabel);
    const total      = currentSeries.reduce((s, d) => s + d.y, 0);
    const prevTotal  = prevSeries.reduce((s, d) => s + d.y, 0);

    const topPartner      = partners[0] || null;
    const topPartnerShare = (topPartner && total > 0) ? (topPartner.y / total * 100) : 0;
    const top3Share       = total > 0
      ? (partners.slice(0, 3).reduce((s, d) => s + d.y, 0) / total * 100)
      : 0;
    const partnersTotal = partners.reduce((s, d) => s + d.y, 0);
    const othersShare   = total > 0 ? ((total - partnersTotal) / total * 100) : 0;
    const visiblePartners = partners.length;

    /* ------------------------------------------------------------------ */
    /* 4. Structural metrics (HHI / diversification)                      */
    /* ------------------------------------------------------------------ */
    // Herfindahl-Hirschman Index over all non-Others partners (0–10 000)
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
    let fullChurnNew     = 0;
    let fullChurnGone    = 0;

    const hasPrev = prevSeries.length > 0;

    if (hasPrev) {
      const prevPartners = prevSeries.filter(d => d.name !== othLabel);
      const prevByName   = new Map(
        prevPartners.map((d, i) => [d.name, { value: d.y, rank: i + 1 }])
      );
      const currNames = new Set(partners.map(d => d.name));
      const prevNames = new Set(prevPartners.map(d => d.name));

      /* Partner churn across the full list */
      fullChurnNew  = partners.filter(d => !prevNames.has(d.name)).length;
      fullChurnGone = prevPartners.filter(d => !currNames.has(d.name)).length;

      /* Biggest movers (absolute TJ change per partner) */
      const changes = partners.map(d => {
        const prev = prevByName.get(d.name);
        return { name: d.name, change: prev != null ? d.y - prev.value : d.y };
      });
      biggestIncrease = changes.reduce(
        (best, d) => !best || d.change > best.change ? d : best, null
      );
      biggestDecrease = changes.reduce(
        (best, d) => !best || d.change < best.change ? d : best, null
      );

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
    const unitLabel  = L['abr_' + REF.unit] || L[REF.unit] || REF.unit;
    const NBSP       = '\u202F'; // narrow no-break space before unit

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
    /* 7. Build HTML sub-sections                                         */
    /* ------------------------------------------------------------------ */

    /* Rank movement pills */
    const rankMoveHtml = rankMovements.map(m => {
      let arrow = '';
      if (m.diff == null)
        arrow = `<span class="insight-rank-new">&#9733;&nbsp;${L['INS_NEW'] || 'new'}</span>`;
      else if (m.diff > 0)
        arrow = `<span class="insight-rank-up">&#9650;${m.diff}</span>`;
      else if (m.diff < 0)
        arrow = `<span class="insight-rank-down">&#9660;${Math.abs(m.diff)}</span>`;
      else
        arrow = '<span class="insight-rank-same">&mdash;</span>';
      return `<span class="insight-rank-item">${m.rank}.&nbsp;${m.name}&nbsp;${arrow}</span>`;
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
    /* 8. Render                                                           */
    /* ------------------------------------------------------------------ */
    const panel = document.createElement('div');
    panel.className = 'insights-panel';
    panel.setAttribute('role', 'region');
    panel.setAttribute('aria-label', L['insightsChart'] || 'Country insights');

    panel.innerHTML = `
      <h2 class="insights-title">${getTitle()}</h2>

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
              <div class="insight-card__label">${L['INS_VISIBLE'] || 'Visible partners'}</div>
              <div class="insight-card__value">${visiblePartners}</div>
            </div>
            <div class="insight-card">
              <div class="insight-card__label">${L['INS_OTHERS_SHARE'] || 'Others share'}</div>
              <div class="insight-card__value">${fmtPct(othersShare)}</div>
            </div>
          </div>

          <div class="insights-rank-table-wrapper">
            <table class="ecl-table insights-rank-table"
                   aria-label="${L['INS_CORE'] || 'Core metrics'}">
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
                <div class="insight-card insight-card--positive">
                  <div class="insight-card__label">${L['INS_BIG_INC'] || 'Biggest increase'}</div>
                  <div class="insight-card__value">${biggestIncrease ? biggestIncrease.name : '–'}</div>
                  <div class="insight-card__sub">${biggestIncrease ? fmtChg(biggestIncrease.change) : ''}</div>
                </div>
                <div class="insight-card insight-card--negative">
                  <div class="insight-card__label">${L['INS_BIG_DEC'] || 'Biggest decrease'}</div>
                  <div class="insight-card__value">${biggestDecrease ? biggestDecrease.name : '–'}</div>
                  <div class="insight-card__sub">${biggestDecrease ? fmtChg(biggestDecrease.change) : ''}</div>
                </div>
                <div class="insight-card">
                  <div class="insight-card__label">${L['INS_NEW_TOP5'] || 'New top-5 entrant'}</div>
                  <div class="insight-card__value">${newEntrants.length ? newEntrants.join(', ') : '–'}</div>
                </div>
                <div class="insight-card">
                  <div class="insight-card__label">${L['INS_DROPPED'] || 'Dropped from top 5'}</div>
                  <div class="insight-card__value">${droppedOut.length ? droppedOut.join(', ') : '–'}</div>
                </div>
              </div>
              <div class="insights-rank-movement">
                <p class="insights-rank-movement__label">
                  <strong>${L['INS_RANK_MOVE'] || 'Rank movement (top 5)'}:</strong>
                </p>
                <div class="insights-rank-movement__items">${rankMoveHtml || '–'}</div>
              </div>`
          }
        </section>

        <!-- ═══ STRUCTURAL METRICS ═══ -->
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
            </div>
            <div class="insight-card">
              <div class="insight-card__label">${L['INS_DIV'] || 'Diversification score'}</div>
              <div class="insight-card__value">${diversification}</div>
              <div class="insight-card__sub">${L['INS_EFF_PARTNERS'] || 'effective equal partners'}</div>
            </div>
            ${hasPrev ? `
            <div class="insight-card">
              <div class="insight-card__label">${L['INS_CHURN'] || 'Partner churn'}</div>
              <div class="insight-card__value">
                ${fullChurnNew}&nbsp;${L['INS_IN'] || 'in'}
                &bull;
                ${fullChurnGone}&nbsp;${L['INS_OUT'] || 'out'}
              </div>
              <div class="insight-card__sub">${L['INS_VS_PREV'] || 'vs'}&nbsp;${prevYear}</div>
            </div>
            <div class="insight-card">
              <div class="insight-card__label">${L['INS_STABILITY'] || 'Top partner stability'}</div>
              <div class="insight-card__value">
                ${topPartnerStable
                  ? `<span class="insight-stable">${L['INS_STABLE']  || '&#10003; Stable'}</span>`
                  : `<span class="insight-changed">${L['INS_CHANGED'] || '&#8597; Changed'}</span>`}
              </div>
              <div class="insight-card__sub">${L['INS_SAME_AS'] || 'same #1 as'}&nbsp;${prevYear}?</div>
            </div>` : ''}
          </div>
        </section>

      </div><!-- /.insights-sections -->
    `;

    chartContainer.appendChild(panel);
  } finally {
    hideChartLoader();
  }
}
