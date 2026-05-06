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

const INSIGHT_PRESENT_THRESHOLD = 0.05;
const INSIGHT_SHORT_NAME_BY_CODE = Object.freeze({
  US: 'United States'
});
const INSIGHT_PROSE_ARTICLE_CODES = new Set(['NL', 'US', 'UK']);

function getInsightLanguage() {
  return (REF?.language || 'EN').toUpperCase();
}

function capitalizeFirst(text) {
  if (typeof text !== 'string' || !text.length) {
    return text;
  }

  return text.charAt(0).toUpperCase() + text.slice(1);
}

function toSentenceCaseLabel(label) {
  if (typeof label !== 'string' || !label.length) {
    return label;
  }

  const language = getInsightLanguage();
  if (![ 'EN', 'FR' ].includes(language) || !/[a-z]/.test(label)) {
    return label;
  }

  return label.charAt(0).toLowerCase() + label.slice(1);
}

function getInsightPartnerDisplayName(partner) {
  if (!partner) {
    return '';
  }

  const rawName = partner.name || partner.code || '';
  if (getInsightLanguage() === 'EN' && partner.code && INSIGHT_SHORT_NAME_BY_CODE[partner.code]) {
    return INSIGHT_SHORT_NAME_BY_CODE[partner.code];
  }

  return rawName;
}

function getInsightPartnerProseName(partner) {
  const displayName = getInsightPartnerDisplayName(partner);

  if (!displayName) {
    return '';
  }

  if (getInsightLanguage() === 'EN' && partner?.code && INSIGHT_PROSE_ARTICLE_CODES.has(partner.code)) {
    return `the ${displayName}`;
  }

  return displayName;
}

function formatSignedPpValue(value, ppLabel) {
  if (value == null) {
    return '–';
  }

  const sign = value >= 0 ? '+' : '\u2212';
  return `${sign}${Math.abs(value).toFixed(1)} ${ppLabel}`;
}

function formatInsightsPanelTitle(title) {
  if (typeof title !== 'string') {
    return title;
  }

  const separatorIndex = title.indexOf(',');
  if (separatorIndex === -1) {
    return title;
  }

  return `${title.slice(0, separatorIndex)} -${title.slice(separatorIndex + 1)}`;
}

function getRankMoveAriaLabel(labels, direction, count) {
  const placeWord = count === 1
    ? (labels['INS_RANK_PLACE_SINGULAR'] || 'place')
    : (labels['INS_RANK_PLACE_PLURAL'] || 'places');
  const defaultTemplate = direction === 'up'
    ? 'Moved up {count} {placeWord}'
    : 'Moved down {count} {placeWord}';
  const template = labels[direction === 'up' ? 'INS_RANK_UP_ARIA' : 'INS_RANK_DOWN_ARIA'] || defaultTemplate;

  return template
    .replace('{count}', count)
    .replace('{placeWord}', placeWord);
}

function isInsightPresentValue(value) {
  const numericValue = Number(value);
  return !Number.isNaN(numericValue) && numericValue >= INSIGHT_PRESENT_THRESHOLD;
}

function formatThresholdValue(value) {
  return value.toFixed(2).replace(/\.0+$|0+$/g, '').replace(/\.$/, '');
}

/* ── Narrative summary ─────────────────────────────────────────────────── */
function buildInsightNarrative({
  geoLabel, tradeLabel, productLabel, year, prevYear,
  topPartner, secondPartner, topPartnerShare, top3Share,
  leadOverSecondPct, changePct, hhiDelta,
  biggestShareGainer, biggestShareLoser, L, ppLabel, ppFullLabel, totalMetricLabel
}) {
  if (!topPartner) return '';

  if (getInsightLanguage() === 'EN') {
    const productText = toSentenceCaseLabel(productLabel);
    const tradeText = toSentenceCaseLabel(tradeLabel);
    const totalMetricText = capitalizeFirst(toSentenceCaseLabel(totalMetricLabel));
    const topPartnerName = topPartner.displayName || getInsightPartnerDisplayName(topPartner);
    const secondPartnerName = secondPartner
      ? (secondPartner.proseName || getInsightPartnerProseName(secondPartner))
      : '';
    const sentences = [
      secondPartner && leadOverSecondPct != null
        ? `${geoLabel}'s ${productText} ${tradeText} in ${year} were led by ${topPartnerName} (${topPartnerShare.toFixed(1)}%), ${leadOverSecondPct.toFixed(1)} ${ppFullLabel} ahead of ${secondPartnerName}.`
        : `${geoLabel}'s ${productText} ${tradeText} in ${year} were led by ${topPartnerName} (${topPartnerShare.toFixed(1)}%).`,
      `The top 3 partners accounted for ${top3Share.toFixed(1)}% of ${tradeText}.`
    ];

    const trendText = changePct == null
      ? ''
      : changePct > 0
        ? `${totalMetricText} increased by ${Math.abs(changePct).toFixed(1)}% versus ${prevYear}`
        : changePct < 0
          ? `${totalMetricText} fell by ${Math.abs(changePct).toFixed(1)}% versus ${prevYear}`
          : `${totalMetricText} were unchanged versus ${prevYear}`;
    const concentrationText = hhiDelta == null
      ? ''
      : hhiDelta > 0
        ? 'concentration increased'
        : hhiDelta < 0
          ? 'concentration eased'
          : 'concentration was stable';

    if (trendText && concentrationText) {
      sentences.push(`${trendText}, while ${concentrationText}.`);
    } else if (trendText) {
      sentences.push(`${trendText}.`);
    } else if (concentrationText) {
      sentences.push(`${capitalizeFirst(concentrationText)} versus ${prevYear}.`);
    }

    if (biggestShareGainer && biggestShareLoser) {
      const gainerName = biggestShareGainer.proseName || getInsightPartnerProseName(biggestShareGainer);
      const loserName = biggestShareLoser.proseName || getInsightPartnerProseName(biggestShareLoser);
      sentences.push(`The largest share gain came from ${gainerName} (${formatSignedPpValue(biggestShareGainer.change, ppLabel)}), and the largest share loss came from ${loserName} (${formatSignedPpValue(biggestShareLoser.change, ppLabel)}).`);
    } else if (biggestShareGainer) {
      const gainerName = biggestShareGainer.proseName || getInsightPartnerProseName(biggestShareGainer);
      sentences.push(`The largest share gain came from ${gainerName} (${formatSignedPpValue(biggestShareGainer.change, ppLabel)}).`);
    } else if (biggestShareLoser) {
      const loserName = biggestShareLoser.proseName || getInsightPartnerProseName(biggestShareLoser);
      sentences.push(`The largest share loss came from ${loserName} (${formatSignedPpValue(biggestShareLoser.change, ppLabel)}).`);
    }

    return sentences.filter(Boolean).join(' ');
  }

  const leaderText = secondPartner && leadOverSecondPct != null
    ? `${topPartner.displayName || topPartner.name} (${topPartnerShare.toFixed(1)}%), ${leadOverSecondPct.toFixed(1)} ${ppFullLabel} ${L['INS_NAR_AHEAD_OF'] || 'ahead of'} ${secondPartner.proseName || secondPartner.name}`
    : `${topPartner.displayName || topPartner.name} (${topPartnerShare.toFixed(1)}%)`;

  const trendText = changePct == null
    ? ''
    : changePct > 0
      ? `${L['INS_NAR_TRADE_ROSE'] || 'total trade increased by'} ${Math.abs(changePct).toFixed(1)}% ${L['INS_NAR_VS'] || 'vs'} ${prevYear}`
      : changePct < 0
        ? `${L['INS_NAR_TRADE_FELL'] || 'total trade fell by'} ${Math.abs(changePct).toFixed(1)}% ${L['INS_NAR_VS'] || 'vs'} ${prevYear}`
        : `${L['INS_NAR_UNCHANGED'] || 'total trade was unchanged'} ${L['INS_NAR_VS'] || 'vs'} ${prevYear}`;

  const concentrationText = hhiDelta == null
    ? ''
    : hhiDelta > 0
      ? `${L['INS_NAR_CONC_UP'] || 'concentration increased'} ${L['INS_NAR_VS'] || 'vs'} ${prevYear}`
      : hhiDelta < 0
        ? `${L['INS_NAR_CONC_DOWN'] || 'concentration eased'} ${L['INS_NAR_VS'] || 'vs'} ${prevYear}`
        : `${L['INS_NAR_CONC_FLAT'] || 'concentration was stable'} ${L['INS_NAR_VS'] || 'vs'} ${prevYear}`;

  const moversText = [
    biggestShareGainer
      ? `${L['INS_NAR_SHARE_GAIN'] || 'largest share gain'} ${L['INS_NAR_CAME_FROM'] || 'came from'} ${biggestShareGainer.displayName || biggestShareGainer.name} (${formatSignedPpValue(biggestShareGainer.change, ppLabel)})`
      : '',
    biggestShareLoser
      ? `${L['INS_NAR_SHARE_LOSS'] || 'largest share loss'} ${L['INS_NAR_CAME_FROM'] || 'came from'} ${biggestShareLoser.displayName || biggestShareLoser.name} (${formatSignedPpValue(biggestShareLoser.change, ppLabel)})`
      : ''
  ].filter(Boolean).join('; ');

  return [
    `${geoLabel}'s ${productLabel} ${tradeLabel.toLowerCase()} ${L['INS_NAR_IN'] || 'in'} ${year} ${L['INS_NAR_LED'] || 'were led by'} ${leaderText}`,
    `${L['INS_NAR_TOP3'] || 'the top 3 partners represented'} ${top3Share.toFixed(1)}%`,
    [trendText, concentrationText].filter(Boolean).join(', '),
    moversText
  ].filter(Boolean).join('; ') + '.';
}

function calculateMedian(values) {
  if (!values.length) {
    return null;
  }

  const sorted = [...values].sort((a, b) => a - b);
  const middleIndex = Math.floor(sorted.length / 2);

  if (sorted.length % 2 === 1) {
    return sorted[middleIndex];
  }

  return (sorted[middleIndex - 1] + sorted[middleIndex]) / 2;
}

function getRankChangeBadge(diff, hasPreviousYear, labels) {
  if (!hasPreviousYear) {
    return `<span class="insight-badge insight-rank-same" aria-label="${labels['INS_RANK_SAME_ARIA'] || 'No rank change'}">&mdash;</span>`;
  }

  if (diff == null) {
    return `<span class="insight-badge insight-rank-new" aria-label="${labels['INS_RANK_NEW_ARIA'] || 'New entrant'}">&#9733; ${labels['INS_NEW'] || 'new'}</span>`;
  }

  if (diff > 0) {
    return `<span class="insight-badge insight-rank-up" aria-label="${getRankMoveAriaLabel(labels, 'up', diff)}">&#9650;${diff}</span>`;
  }

  if (diff < 0) {
    return `<span class="insight-badge insight-rank-down" aria-label="${getRankMoveAriaLabel(labels, 'down', Math.abs(diff))}">&#9660;${Math.abs(diff)}</span>`;
  }

  return `<span class="insight-badge insight-rank-same" aria-label="${labels['INS_RANK_SAME_ARIA'] || 'No rank change'}">&mdash;</span>`;
}

function buildHistorySparkline(entries, selectedYear, labels, totalMetricLabel) {
  if (entries.length < 2) {
    return '';
  }

  const width = 320;
  const height = 78;
  const paddingX = 12;
  const paddingY = 10;
  const baselineY = height - paddingY;
  const values = entries.map(entry => entry.total);
  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);
  const range = maxValue - minValue || 1;

  const points = entries.map((entry, index) => {
    const x = paddingX + (index / (entries.length - 1)) * (width - paddingX * 2);
    const y = baselineY - ((entry.total - minValue) / range) * (height - paddingY * 2);

    return {
      year: entry.year,
      x: Number(x.toFixed(1)),
      y: Number(y.toFixed(1))
    };
  });

  const selectedPoint = points.find(point => point.year === String(selectedYear)) || points[points.length - 1];
  const peakPoint = points[values.indexOf(maxValue)] || null;
  const linePoints = points.map(point => `${point.x},${point.y}`).join(' ');
  const areaPoints = `${paddingX},${baselineY} ${linePoints} ${points[points.length - 1].x},${baselineY}`;

  const trendAriaLabel = getInsightLanguage() === 'EN'
    ? `Historical ${toSentenceCaseLabel(totalMetricLabel)} trend`
    : (labels['INS_HISTORY_TREND_ARIA'] || 'Historical total trade trend');

  return `
    <div class="insights-sparkline" role="img" aria-label="${trendAriaLabel}">
      <svg class="insights-sparkline__svg" viewBox="0 0 ${width} ${height}" preserveAspectRatio="none" aria-hidden="true" focusable="false">
        <polygon class="insights-sparkline__area" points="${areaPoints}"></polygon>
        <polyline class="insights-sparkline__line" points="${linePoints}"></polyline>
        ${peakPoint ? `<circle class="insights-sparkline__point insights-sparkline__point--peak" cx="${peakPoint.x}" cy="${peakPoint.y}" r="3"></circle>` : ''}
        <circle class="insights-sparkline__point" cx="${selectedPoint.x}" cy="${selectedPoint.y}" r="4"></circle>
      </svg>
      <div class="insights-sparkline__axis" aria-hidden="true">
        <span>${entries[0].year}</span>
        <span>${entries[entries.length - 1].year}</span>
      </div>
    </div>`;
}

function buildHistoricalYearSummaries(dataset, labels) {
  const partners = dataset?.Dimension('partner').id || [];
  const years = dataset?.Dimension('time').id || [];

  if (!partners.length || !years.length) {
    return [];
  }

  return years.map((year, yearIndex) => {
    const series = partners
      .map((partnerCode, partnerIndex) => {
        if (excludedPartners.includes(partnerCode)) {
          return null;
        }

        const value = dataset.value[partnerIndex * years.length + yearIndex] || 0;
        if (!isInsightPresentValue(value)) {
          return null;
        }

        return {
          code: partnerCode,
          name: labels[partnerCode] || partnerCode,
          y: value
        };
      })
      .filter(Boolean)
      .sort((a, b) => b.y - a.y);

    return {
      year,
      total: series.reduce((sum, entry) => sum + entry.y, 0),
      series,
      topPartner: series[0] || null
    };
  }).filter(entry => entry.series.length > 0);
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
    barChartSeries = currentSeries;

    /* ------------------------------------------------------------------ */
    /* 2. Fetch full history for the same REF selection                    */
    /* ------------------------------------------------------------------ */
    const selectedYear = parseInt(snapshot.year, 10);
    const prevYear = String(selectedYear - 1);
    const historicalDataset = await chartApiCall();
    const historicalEntries = buildHistoricalYearSummaries(historicalDataset, L)
      .filter(entry => parseInt(entry.year, 10) <= selectedYear);
    const prevSummary = historicalEntries.find(entry => entry.year === prevYear);
    const currentSummary = historicalEntries.find(entry => entry.year === snapshot.year);
    const prevSeries = prevSummary ? prevSummary.series : [];

    if (!currentSeries.length) {
      showNoDataPopup(L['NODATA']);
      showNoDataInChartContainer(L['NODATA']);
      return;
    }

    /* ------------------------------------------------------------------ */
    /* 3. Compute core metrics                                             */
    /* ------------------------------------------------------------------ */
    const othLabel  = L['OTH'];
    const ppLabel   = L['INS_PP'] || 'pp';
    const ppFullLabel = L['INS_PP_FULL'] || 'percentage points';
    const snapshotPartners = currentSeries
      .filter(d => d.name !== othLabel && isInsightPresentValue(d.y))
      .map(partner => ({
        ...partner,
        displayName: getInsightPartnerDisplayName(partner),
        proseName: getInsightPartnerProseName(partner)
      }));
    const partners  = (currentSummary?.series?.length ? currentSummary.series : snapshotPartners)
      .map(partner => ({
        ...partner,
        displayName: getInsightPartnerDisplayName(partner),
        proseName: getInsightPartnerProseName(partner)
      }));
    const prevPartners = prevSeries
      .filter(d => d.name !== othLabel)
      .map(partner => ({
        ...partner,
        displayName: getInsightPartnerDisplayName(partner),
        proseName: getInsightPartnerProseName(partner)
      }));

    if (!partners.length) {
      showNoDataPopup(L['NODATA']);
      showNoDataInChartContainer(L['NODATA']);
      return;
    }

    const total     = currentSummary?.total ?? currentSeries.reduce((s, d) => s + d.y, 0);
    const prevTotal = prevSummary?.total ?? prevSeries.reduce((s, d) => s + d.y, 0);

    const topPartner      = partners[0] || null;
    const secondPartner   = partners[1] || null;
    const topPartnerShare = (topPartner && total > 0) ? (topPartner.y / total * 100) : 0;
    const secondPartnerShare = (secondPartner && total > 0) ? (secondPartner.y / total * 100) : null;
    const leadOverSecondPct = secondPartnerShare != null ? topPartnerShare - secondPartnerShare : null;
    const top3Share       = total > 0
      ? (partners.slice(0, 3).reduce((s, d) => s + d.y, 0) / total * 100)
      : 0;
    const top5Share       = total > 0
      ? (partners.slice(0, 5).reduce((s, d) => s + d.y, 0) / total * 100)
      : 0;
    const medianPartnerShare = calculateMedian(
      partners.map(partner => total > 0 ? (partner.y / total * 100) : 0)
    );
    const reportedPartners = partners.length;

    // Others share — only meaningful when an explicit Others row is present
    const othersRow   = currentSeries.find(d => d.name === othLabel && isInsightPresentValue(d.y));
    const othersShare = (othersRow && total > 0) ? (othersRow.y / total * 100) : null;

    const euCountryCodes = typeof EU_MEMBER_COUNTRY_CODES !== 'undefined' ? EU_MEMBER_COUNTRY_CODES : [];
    const nonMemberCountryCodes = typeof NON_MEMBER_COUNTRY_CODES !== 'undefined' ? NON_MEMBER_COUNTRY_CODES : [];
    const hasPartnerCodes = partners.some(partner => partner.code);
    let euShare = null;
    let nonEuShare = null;
    let hasMeaningfulEuNonEuSplit = false;

    if (hasPartnerCodes && total > 0 && euCountryCodes.length > 0 && nonMemberCountryCodes.length > 0) {
      const euValue = partners.reduce((sum, partner) => sum + (euCountryCodes.includes(partner.code) ? partner.y : 0), 0);
      const nonEuValue = partners.reduce((sum, partner) => sum + (nonMemberCountryCodes.includes(partner.code) ? partner.y : 0), 0);

      if (euValue > 0 && nonEuValue > 0) {
        euShare = euValue / total * 100;
        nonEuShare = nonEuValue / total * 100;
        hasMeaningfulEuNonEuSplit = true;
      }
    }

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
    const prevHhi = prevTotal > 0
      ? Math.round(
          prevPartners.reduce((sum, partner) => {
            const pct = prevTotal > 0 ? (partner.y / prevTotal * 100) : 0;
            return sum + pct * pct;
          }, 0)
        )
      : null;
    const hhiDelta = prevHhi != null ? hhi - prevHhi : null;
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

    const currentHistoryIndex = historicalEntries.findIndex(entry => entry.year === snapshot.year);
    const currentHistory = currentSummary || null;

    let firstHistoryYear   = null;
    let lastHistoryYear    = null;
    let peakEntry          = null;
    let currentVsPeakPct   = null;
    let recentAverage      = null;
    let currentVsRecentPct = null;
    let recentWindow       = [];
    let topPartnerStreak   = null;
    let topPartnerSince    = null;

    if (historicalEntries.length > 0) {
      firstHistoryYear = historicalEntries[0].year;
      lastHistoryYear = historicalEntries[historicalEntries.length - 1].year;
      peakEntry = historicalEntries.reduce((best, entry) => {
        if (!best || entry.total > best.total) {
          return entry;
        }
        return best;
      }, null);
    }

    if (currentHistory && peakEntry?.total > 0) {
      currentVsPeakPct = ((currentHistory.total - peakEntry.total) / peakEntry.total) * 100;
    }

    if (currentHistoryIndex >= 0) {
      recentWindow = historicalEntries.slice(Math.max(0, currentHistoryIndex - 4), currentHistoryIndex + 1);

      if (currentHistory && recentWindow.length >= 3) {
        recentAverage = recentWindow.reduce((sum, entry) => sum + entry.total, 0) / recentWindow.length;
        if (recentAverage > 0) {
          currentVsRecentPct = ((currentHistory.total - recentAverage) / recentAverage) * 100;
        }
      }

      const currentTopPartnerCode = currentHistory?.topPartner?.code;
      if (currentTopPartnerCode) {
        topPartnerStreak = 0;
        for (let index = currentHistoryIndex; index >= 0; index -= 1) {
          const yearTopPartnerCode = historicalEntries[index].topPartner?.code;
          if (yearTopPartnerCode !== currentTopPartnerCode) {
            break;
          }
          topPartnerStreak += 1;
          topPartnerSince = historicalEntries[index].year;
        }
      }
    }

    const getPartnerKey = partner => partner.code || partner.name;
    const prevByKey = new Map(
      prevPartners.map((partner, index) => [
        getPartnerKey(partner),
        {
          ...partner,
          rank: index + 1,
          share: prevTotal > 0 ? (partner.y / prevTotal * 100) : 0
        }
      ])
    );
    const currByKey = new Map(
      partners.map((partner, index) => [
        getPartnerKey(partner),
        {
          ...partner,
          rank: index + 1,
          share: total > 0 ? (partner.y / total * 100) : 0
        }
      ])
    );

    let biggestShareGainer = null;
    let biggestShareLoser  = null;
    let biggestAbsoluteGainer = null;
    let biggestAbsoluteLoser = null;
    let newEntrants      = [];
    let droppedOut       = [];
    let rankMovements    = [];
    let churnNew         = 0;
    let churnGone        = 0;

    const hasPrev = prevPartners.length > 0;

    if (hasPrev) {
      const currNames = new Set(partners.map(d => d.name));
      const prevNames = new Set(prevPartners.map(d => d.name));
      const allPartnerKeys = Array.from(new Set([...currByKey.keys(), ...prevByKey.keys()]));

      /* Partner churn (all visible partners) */
      churnNew  = partners.filter(d => !prevNames.has(d.name)).length;
      churnGone = prevPartners.filter(d => !currNames.has(d.name)).length;

      /* Biggest share movers — compare share change in percentage points */
      const shareChanges = allPartnerKeys.map(key => {
        const currentPartner = currByKey.get(key);
        const previousPartner = prevByKey.get(key);

        return {
          key,
          name: currentPartner?.name || previousPartner?.name || key,
          displayName: currentPartner?.displayName || previousPartner?.displayName || currentPartner?.name || previousPartner?.name || key,
          proseName: currentPartner?.proseName || previousPartner?.proseName || currentPartner?.name || previousPartner?.name || key,
          change: (currentPartner?.share ?? 0) - (previousPartner?.share ?? 0)
        };
      });
      const positiveChanges = shareChanges.filter(partner => partner.change > 0);
      const negativeChanges = shareChanges.filter(partner => partner.change < 0);
      biggestShareGainer = positiveChanges.length
        ? positiveChanges.reduce((best, partner) => partner.change > best.change ? partner : best)
        : null;
      biggestShareLoser = negativeChanges.length
        ? negativeChanges.reduce((best, partner) => partner.change < best.change ? partner : best)
        : null;

      const absoluteChanges = allPartnerKeys.map(key => {
        const currentPartner = currByKey.get(key);
        const previousPartner = prevByKey.get(key);

        return {
          key,
          name: currentPartner?.name || previousPartner?.name || key,
          displayName: currentPartner?.displayName || previousPartner?.displayName || currentPartner?.name || previousPartner?.name || key,
          change: (currentPartner?.y ?? 0) - (previousPartner?.y ?? 0)
        };
      });
      const positiveAbsoluteChanges = absoluteChanges.filter(partner => partner.change > 0);
      const negativeAbsoluteChanges = absoluteChanges.filter(partner => partner.change < 0);
      biggestAbsoluteGainer = positiveAbsoluteChanges.length
        ? positiveAbsoluteChanges.reduce((best, partner) => partner.change > best.change ? partner : best)
        : null;
      biggestAbsoluteLoser = negativeAbsoluteChanges.length
        ? negativeAbsoluteChanges.reduce((best, partner) => partner.change < best.change ? partner : best)
        : null;

      /* Top-5 entrants / dropouts */
      const currTop5Names = new Set(partners.slice(0, 5).map(d => d.name));
      const prevTop5Names = new Set(prevPartners.slice(0, 5).map(d => d.name));
      newEntrants = partners.slice(0, 5)
        .filter(d => !prevTop5Names.has(d.name))
        .map(d => d.displayName || d.name);
      droppedOut  = prevPartners.slice(0, 5)
        .filter(d => !currTop5Names.has(d.name))
        .map(d => d.displayName || d.name);

      /* Rank movements (top-5) */
      rankMovements = partners.slice(0, 5).map((d, i) => {
        const prev = prevByKey.get(getPartnerKey(d));
        const diff = prev != null ? prev.rank - (i + 1) : null;
        return { name: d.name, displayName: d.displayName || d.name, rank: i + 1, diff };
      });
    }

    const partnerRows = partners.map((partner, index) => {
      const currentPartner = currByKey.get(getPartnerKey(partner));
      const previousPartner = prevByKey.get(getPartnerKey(partner));

      return {
        rank: index + 1,
        name: partner.displayName || partner.name,
        value: partner.y,
        share: currentPartner?.share ?? 0,
        shareDelta: hasPrev
          ? (currentPartner?.share ?? 0) - (previousPartner?.share ?? 0)
          : null,
        rankDiff: hasPrev
          ? (previousPartner ? previousPartner.rank - (index + 1) : null)
          : null
      };
    });

    const hasMeaningfulRankChange = hasPrev && rankMovements.some(movement => movement.diff == null || movement.diff !== 0);
    const hasLongRunHistory = historicalEntries.length >= 3;
    const turnoverRate = hasPrev && (reportedPartners + prevPartners.length) > 0
      ? ((churnNew + churnGone) / ((reportedPartners + prevPartners.length) / 2)) * 100
      : null;

    /* ------------------------------------------------------------------ */
    /* 6. Formatting helpers                                               */
    /* ------------------------------------------------------------------ */
    const tradeLabel   = L[REF.trade] || REF.trade;
    const productLabel = L[REF.siec]  || REF.siec;
    const geoLabel     = L[REF.geo]   || REF.geo;
    const unitLabel = L['abr_' + REF.unit] || L[REF.unit] || REF.unit;
    const NBSP      = '\u202F'; // narrow no-break space before unit

    const fmtVal = v =>
      v != null ? formatNumber(v) + NBSP + unitLabel : '–';

    const fmtPct = v =>
      v != null ? v.toFixed(1) + '%' : '–';

    const fmtPp = v =>
      v != null ? v.toFixed(1) + ' ' + ppLabel : '–';

    const fmtSignedPp = v => {
      if (v == null) return '–';
      const sign = v >= 0 ? '+' : '\u2212';
      return sign + Math.abs(v).toFixed(1) + ' ' + ppLabel;
    };

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

    const fmtSignedInt = v => {
      if (v == null) return '–';
      const sign = v >= 0 ? '+' : '\u2212';
      return sign + Math.abs(Math.round(v)).toLocaleString();
    };

    const concentrationDeltaClass = hhiDelta == null
      ? ''
      : hhiDelta > 0
        ? 'insight-card--negative'
        : hhiDelta < 0
          ? 'insight-card--positive'
          : '';

    const concentrationDeltaText = hhiDelta == null
      ? '–'
      : hhiDelta > 0
        ? `${L['INS_CONC_UP'] || 'More concentrated than'} ${prevYear}`
        : hhiDelta < 0
          ? `${L['INS_CONC_DOWN'] || 'Less concentrated than'} ${prevYear}`
          : `${L['INS_CONC_FLAT'] || 'Unchanged vs'} ${prevYear}`;

    const peakDeltaClass = currentVsPeakPct == null
      ? ''
      : currentVsPeakPct >= 0
        ? 'insight-card--positive'
        : 'insight-card--negative';

    const recentDeltaClass = currentVsRecentPct == null
      ? ''
      : currentVsRecentPct >= 0
        ? 'insight-card--positive'
        : 'insight-card--negative';

    const totalMetricLabel = REF.trade === 'imp'
      ? (L['INS_TOTAL_IMPORTS'] || 'Total imports')
      : REF.trade === 'exp'
        ? (L['INS_TOTAL_EXPORTS'] || 'Total exports')
        : (L['INS_TOTAL'] || 'Total trade');
    const historySparklineHtml = hasLongRunHistory
      ? buildHistorySparkline(historicalEntries, snapshot.year, L, totalMetricLabel)
      : '';
    const methodologyNote = (L['INS_DATA_NOTE_THRESHOLD'] || 'Metrics are calculated using partners with reported {direction} of at least {threshold} {unit} for the selected year. Changes versus the previous year use the same rule.')
      .replace('{direction}', tradeLabel.toLowerCase())
      .replace('{threshold}', formatThresholdValue(INSIGHT_PRESENT_THRESHOLD))
      .replace('{unit}', unitLabel);
    const top5EntriesLabel = L['INS_TOP5_ENTRIES'] || 'Top-5 entries';
    const top5ExitsLabel = L['INS_TOP5_EXITS'] || 'Top-5 exits';
    const tableCaption = (L['INS_TABLE_CAPTION'] || '{ranking} for {geo} {product} {direction} in {year}, including share change and rank change versus {prevYear}.')
      .replace('{ranking}', L['INS_RANK_LIST'] || 'Partner ranking')
      .replace('{geo}', geoLabel)
      .replace('{product}', productLabel)
      .replace('{direction}', tradeLabel.toLowerCase())
      .replace('{year}', snapshot.year)
      .replace('{prevYear}', prevYear);
    const historyTrendTitle = `${L['INS_HISTORY_TREND'] || 'Historical trend'} <span class="insights-history-trend__meta">${snapshot.year}: ${fmtVal(currentHistory?.total ?? total)}</span>`;
    const defaultVisiblePartnerRows = 10;
    const hasCollapsedPartnerRows = partnerRows.length > defaultVisiblePartnerRows;
    const rankLabel = L['INS_RANK'] || 'Rank';
    const partnerLabel = L['INS_PARTNER'] || 'Partner';
    const valueLabel = L['INS_VALUE'] || 'Value';
    const shareLabel = L['INS_SHARE'] || 'Share';
    const deltaShareLabel = L['INS_DELTA_SHARE'] || 'Δ share vs previous year';
    const rankChangeLabel = L['INS_RANK_CHANGE_COL'] || 'Rank change';
    const showAllPartnersLabel = (L['INS_SHOW_ALL_PARTNERS'] || 'Show all partners ({count})')
      .replace('{count}', partnerRows.length);
    const showTopPartnersLabel = (L['INS_SHOW_TOP_N'] || 'Show top {count}')
      .replace('{count}', defaultVisiblePartnerRows);

    /* ------------------------------------------------------------------ */
    /* 7. Narrative summary                                                */
    /* ------------------------------------------------------------------ */
    const narrative    = buildInsightNarrative({
      geoLabel, tradeLabel, productLabel,
      year: snapshot.year, prevYear,
      topPartner, secondPartner, topPartnerShare, top3Share,
      leadOverSecondPct, changePct, hhiDelta,
      biggestShareGainer, biggestShareLoser, L, ppLabel, ppFullLabel, totalMetricLabel
    });
    const insightsTitle = formatInsightsPanelTitle(getTitle());
    const headerMetaHtml = [
      { label: L['INS_COUNTRY'] || 'Country', value: geoLabel },
      { label: L['INS_PRODUCT'] || 'Product', value: productLabel },
      { label: L['INS_YEAR'] || 'Year', value: snapshot.year },
      { label: L['INS_UNIT'] || 'Unit', value: unitLabel }
    ].map(item => `
      <div class="insights-meta__item">
        <span class="insights-meta__label">${item.label}</span>
        <strong class="insights-meta__value">${item.value}</strong>
      </div>`).join('');
    const topProfileHtml = [
      { label: L['INS_TOP1'] || 'Top 1', value: fmtPct(topPartnerShare) },
      { label: L['INS_TOP3_SHORT'] || 'Top 3', value: fmtPct(top3Share) },
      { label: L['INS_TOP5'] || 'Top 5', value: fmtPct(top5Share) }
    ].map(item => `
      <div class="insights-mini-profile__item">
        <span class="insights-mini-profile__label">${item.label}</span>
        <strong class="insights-mini-profile__value">${item.value}</strong>
      </div>`).join('');

    /* ------------------------------------------------------------------ */
    /* 8. Build HTML sub-sections                                         */
    /* ------------------------------------------------------------------ */

    /* Rank movement pills */
    const rankMoveHtml = rankMovements.map(m => {
      const badge = getRankChangeBadge(m.diff, true, L);
      return `<span class="insight-rank-item"><span class="insight-rank-num">${m.rank}</span>${m.displayName || m.name}${badge}</span>`;
    }).join('');

    /* Rank table rows */
    const rankTableHtml = partnerRows.map((row, index) => `
      <tr class="ecl-table__row${row.rank <= 3 ? ' insights-rank-table__row--top' : ''}"${hasCollapsedPartnerRows && index >= defaultVisiblePartnerRows ? ' data-insights-hidden-row="true" hidden' : ''}>
        <td class="ecl-table__cell insights-rank-table__cell--rank" data-label="${rankLabel}">${row.rank}</td>
        <th scope="row" class="ecl-table__cell insights-rank-table__cell--partner" data-label="${partnerLabel}">${row.name}</th>
        <td class="ecl-table__cell insights-rank-table__cell--numeric" data-label="${valueLabel}">${formatNumber(row.value)}${NBSP}${unitLabel}</td>
        <td class="ecl-table__cell insights-rank-table__cell--numeric" data-label="${shareLabel}">${row.share.toFixed(1)}%</td>
        <td class="ecl-table__cell insights-rank-table__cell--numeric" data-label="${deltaShareLabel}">${fmtSignedPp(row.shareDelta)}</td>
        <td class="ecl-table__cell insights-rank-table__cell--numeric" data-label="${rankChangeLabel}">${getRankChangeBadge(row.rankDiff, hasPrev, L)}</td>
      </tr>`).join('');
    const rankMobileCardsHtml = partnerRows.map((row, index) => `
      <article role="listitem" class="insights-rank-card${row.rank <= 3 ? ' insights-rank-card--top' : ''}"${hasCollapsedPartnerRows && index >= defaultVisiblePartnerRows ? ' data-insights-hidden-row="true" hidden' : ''}>
        <div class="insights-rank-card__header">
          <span class="insights-rank-card__rank">${rankLabel} ${row.rank}</span>
          <strong class="insights-rank-card__partner">${row.name}</strong>
        </div>
        <dl class="insights-rank-card__stats">
          <div class="insights-rank-card__stat">
            <dt>${valueLabel}</dt>
            <dd>${formatNumber(row.value)}${NBSP}${unitLabel}</dd>
          </div>
          <div class="insights-rank-card__stat">
            <dt>${shareLabel}</dt>
            <dd>${row.share.toFixed(1)}%</dd>
          </div>
          <div class="insights-rank-card__stat">
            <dt>${deltaShareLabel}</dt>
            <dd>${fmtSignedPp(row.shareDelta)}</dd>
          </div>
          <div class="insights-rank-card__stat">
            <dt>${rankChangeLabel}</dt>
            <dd>${getRankChangeBadge(row.rankDiff, hasPrev, L)}</dd>
          </div>
        </dl>
      </article>`).join('');

    const changeClass = (changeTotal != null && changeTotal >= 0)
      ? 'insight-card--positive'
      : 'insight-card--negative';

    /* ------------------------------------------------------------------ */
    /* 9. Render                                                           */
    /* ------------------------------------------------------------------ */
    const titleId = 'insights-panel-title';
    const noteId = 'insights-panel-note';
    const rankTableId = 'insights-rank-table';
    const rankTableToggleId = 'insights-rank-table-toggle';
    const panel = document.createElement('div');
    panel.id = 'insights-panel';
    panel.className = 'insights-panel';
    panel.setAttribute('role', 'region');
    panel.setAttribute('aria-labelledby', titleId);
    panel.setAttribute('aria-describedby', noteId);

    panel.innerHTML = `
      <h2 class="insights-title" id="${titleId}">${insightsTitle}</h2>

      <div class="insights-meta" aria-label="${L['INS_META'] || 'Selection details'}">
        ${headerMetaHtml}
      </div>

      ${narrative
        ? `<p class="insights-summary">${narrative}</p>`
        : ''}

      <p class="insights-note" id="${noteId}">
        <i class="fas fa-info-circle" aria-hidden="true"></i>
        ${methodologyNote}
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
              <div class="insight-card__label">${totalMetricLabel}</div>
              <div class="insight-card__value">${fmtVal(total)}</div>
            </div>
            <div class="insight-card">
              <div class="insight-card__label">${L['INS_TOP_PARTNER'] || 'Top partner'}</div>
              <div class="insight-card__value">${topPartner ? (topPartner.displayName || topPartner.name) : '–'}</div>
              <div class="insight-card__sub">${fmtPct(topPartnerShare)}&nbsp;${L['INS_OF_TOTAL'] || 'of total'}</div>
            </div>
            <div class="insight-card">
              <div class="insight-card__label">${L['INS_LEAD_OVER_2'] || 'Lead over #2'}</div>
              <div class="insight-card__value">${fmtPp(leadOverSecondPct)}</div>
              <div class="insight-card__sub">${secondPartner ? `${L['INS_AHEAD_OF'] || 'ahead of'} ${secondPartner.proseName || secondPartner.name}` : '–'}</div>
            </div>
            <div class="insight-card">
              <div class="insight-card__label">${L['INS_TOP3'] || 'Top 3 share'}</div>
              <div class="insight-card__value">${fmtPct(top3Share)}</div>
            </div>
            <div class="insight-card">
              <div class="insight-card__label">${L['INS_ACTIVE_PARTNERS'] || 'Active partners'}</div>
              <div class="insight-card__value">${reportedPartners}</div>
            </div>
            ${hasMeaningfulEuNonEuSplit ? `
            <div class="insight-card">
              <div class="insight-card__label">${L['INS_EU_NON_EU'] || 'EU vs non-EU share'}</div>
              <div class="insight-card__value">${fmtPct(euShare)} / ${fmtPct(nonEuShare)}</div>
              <div class="insight-card__sub">${L['INS_EU_NON_EU_SUB'] || 'EU / non-EU'}</div>
            </div>` : ''}
            ${othersShare != null ? `
            <div class="insight-card">
              <div class="insight-card__label">${L['INS_OTHERS_SHARE'] || 'Others share'}</div>
              <div class="insight-card__value">${fmtPct(othersShare)}</div>
            </div>` : ''}
          </div>

          <div class="insights-mini-profile" aria-label="${L['INS_TOP_PROFILE'] || 'Top partner concentration profile'}">
            ${topProfileHtml}
          </div>

          <div class="insights-rank-table-wrapper">
            <table class="ecl-table insights-rank-table" id="${rankTableId}"
                   aria-label="${L['INS_RANK_LIST'] || 'Partner ranking'}">
              <caption class="ecl-u-sr-only">${tableCaption}</caption>
              <thead class="ecl-table__head">
                <tr class="ecl-table__row">
                  <th class="ecl-table__header insights-rank-table__header--rank" scope="col">#</th>
                  <th class="ecl-table__header" scope="col">${L['INS_PARTNER'] || 'Partner'}</th>
                  <th class="ecl-table__header insights-rank-table__header--numeric" scope="col">${L['INS_VALUE'] || 'Value'}</th>
                  <th class="ecl-table__header insights-rank-table__header--numeric" scope="col">${L['INS_SHARE'] || 'Share'}</th>
                  <th class="ecl-table__header insights-rank-table__header--numeric" scope="col">${L['INS_DELTA_SHARE'] || 'Δ share vs previous year'}</th>
                  <th class="ecl-table__header insights-rank-table__header--numeric" scope="col">${L['INS_RANK_CHANGE_COL'] || 'Rank change'}</th>
                </tr>
              </thead>
              <tbody class="ecl-table__body">${rankTableHtml}</tbody>
            </table>
            <div class="insights-rank-cards" role="list" aria-label="${L['INS_RANK_LIST'] || 'Partner ranking'}">
              ${rankMobileCardsHtml}
            </div>
            ${hasCollapsedPartnerRows ? `
            <button type="button"
                    class="insights-rank-table-toggle"
                    id="${rankTableToggleId}"
                    aria-expanded="false"
                    aria-controls="${rankTableId}">${showAllPartnersLabel}</button>` : ''}
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
                <div class="insight-card ${biggestShareGainer ? 'insight-card--positive' : ''}">
                  <div class="insight-card__label">${L['INS_BIG_SHARE_GAIN'] || 'Biggest share gainer'}</div>
                  <div class="insight-card__value">${biggestShareGainer ? (biggestShareGainer.displayName || biggestShareGainer.name) : '\u2013'}</div>
                  <div class="insight-card__sub">${biggestShareGainer ? fmtSignedPp(biggestShareGainer.change) : (L['INS_NO_SHARE_GAIN'] || 'No partner gained share')}</div>
                </div>
                <div class="insight-card ${biggestShareLoser ? 'insight-card--negative' : ''}">
                  <div class="insight-card__label">${L['INS_BIG_SHARE_LOSS'] || 'Biggest share loser'}</div>
                  <div class="insight-card__value">${biggestShareLoser ? (biggestShareLoser.displayName || biggestShareLoser.name) : '\u2013'}</div>
                  <div class="insight-card__sub">${biggestShareLoser ? fmtSignedPp(biggestShareLoser.change) : (L['INS_NO_SHARE_LOSS'] || 'No partner lost share')}</div>
                </div>
                <div class="insight-card ${biggestAbsoluteGainer ? 'insight-card--positive' : ''}">
                  <div class="insight-card__label">${L['INS_BIG_ABS_GAIN'] || 'Largest quantity gainer'}</div>
                  <div class="insight-card__value">${biggestAbsoluteGainer ? (biggestAbsoluteGainer.displayName || biggestAbsoluteGainer.name) : '\u2013'}</div>
                  <div class="insight-card__sub">${biggestAbsoluteGainer ? fmtChg(biggestAbsoluteGainer.change) : (L['INS_NO_ABS_GAIN'] || 'No partner gained quantity')}</div>
                </div>
                <div class="insight-card ${biggestAbsoluteLoser ? 'insight-card--negative' : ''}">
                  <div class="insight-card__label">${L['INS_BIG_ABS_LOSS'] || 'Largest quantity loser'}</div>
                  <div class="insight-card__value">${biggestAbsoluteLoser ? (biggestAbsoluteLoser.displayName || biggestAbsoluteLoser.name) : '\u2013'}</div>
                  <div class="insight-card__sub">${biggestAbsoluteLoser ? fmtChg(biggestAbsoluteLoser.change) : (L['INS_NO_ABS_LOSS'] || 'No partner lost quantity')}</div>
                </div>
                ${hhiDelta != null ? `
                <div class="insight-card ${concentrationDeltaClass}">
                  <div class="insight-card__label">${L['INS_CONC_CHANGE'] || 'Concentration change'}</div>
                  <div class="insight-card__value">${fmtSignedInt(hhiDelta)}</div>
                  <div class="insight-card__sub">${concentrationDeltaText}</div>
                </div>` : ''}
                ${newEntrants.length ? `
                <div class="insight-card">
                  <div class="insight-card__label">${top5EntriesLabel}</div>
                  <div class="insight-card__value">${newEntrants.join(', ')}</div>
                </div>` : ''}
                ${droppedOut.length ? `
                <div class="insight-card">
                  <div class="insight-card__label">${top5ExitsLabel}</div>
                  <div class="insight-card__value">${droppedOut.join(', ')}</div>
                </div>` : ''}
              </div>
              ${hasMeaningfulRankChange ? `
              <div class="insights-rank-movement">
                <p class="insights-rank-movement__label">
                  <strong>${L['INS_RANK_MOVE'] || 'Rank movement (top 5)'}:</strong>
                </p>
                <div class="insights-rank-movement__items">${rankMoveHtml || '\u2013'}</div>
              </div>` : ''}`
          }
        </section>

        <!-- ═══ HISTORICAL CONTEXT ═══ -->
        ${hasLongRunHistory ? `
        <section class="insights-section" aria-labelledby="ins-history-heading">
          <h3 class="insights-section__title" id="ins-history-heading">
            <i class="fas fa-history" aria-hidden="true"></i>
            ${L['INS_HISTORY'] || 'Historical context'}
          </h3>

          ${historySparklineHtml ? `
          <div class="insights-history-trend">
            <div class="insights-history-trend__title">${historyTrendTitle}</div>
            ${historySparklineHtml}
          </div>` : ''}

          <div class="insights-cards">
                <div class="insight-card">
                  <div class="insight-card__label">${L['INS_HISTORY_SPAN'] || 'History span'}</div>
                  <div class="insight-card__value">${firstHistoryYear}&ndash;${lastHistoryYear}</div>
                  <div class="insight-card__sub">${historicalEntries.length} ${L['INS_HISTORY_YEARS'] || 'years with reported trade'}</div>
                </div>
                <div class="insight-card">
                  <div class="insight-card__label">${L['INS_HIST_PEAK'] || 'Historical peak'}</div>
                  <div class="insight-card__value">${peakEntry ? peakEntry.year : '\u2013'}</div>
                  <div class="insight-card__sub">${peakEntry ? fmtVal(peakEntry.total) : '\u2013'}</div>
                </div>
                <div class="insight-card ${peakDeltaClass}">
                  <div class="insight-card__label">${L['INS_CURRENT_VS_PEAK'] || 'Current vs peak'}</div>
                  <div class="insight-card__value">${fmtChgPct(currentVsPeakPct)}</div>
                  <div class="insight-card__sub">${peakEntry ? `${peakEntry.year} ${L['INS_PEAK_REF'] || 'peak'}` : '\u2013'}</div>
                </div>
                ${recentAverage != null ? `
                <div class="insight-card ${recentDeltaClass}">
                  <div class="insight-card__label">${L['INS_RECENT_AVG'] || 'Current vs recent average'}</div>
                  <div class="insight-card__value">${fmtChgPct(currentVsRecentPct)}</div>
                  <div class="insight-card__sub">${recentWindow[0].year}&ndash;${recentWindow[recentWindow.length - 1].year} ${L['INS_AVERAGE'] || 'average'}</div>
                </div>` : ''}
                ${topPartnerStreak ? `
                <div class="insight-card">
                  <div class="insight-card__label">${L['INS_TOP_STREAK'] || 'Top partner streak'}</div>
                  <div class="insight-card__value">${topPartnerStreak}</div>
                  <div class="insight-card__sub">${L['INS_STREAK_YEARS'] || 'consecutive years as #1'}${topPartnerSince ? ` ${L['INS_SINCE'] || 'since'} ${topPartnerSince}` : ''}</div>
                </div>` : ''}
              </div>
        </section>` : ''}

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
              <div class="insight-card__note">${L['INS_HHI_NOTE'] || 'Higher values indicate a more concentrated supplier base.'}</div>
            </div>
            <div class="insight-card">
              <div class="insight-card__label">${L['INS_DIV'] || 'Diversification score'}</div>
              <div class="insight-card__value">${diversification}</div>
              <div class="insight-card__sub">${L['INS_EFF_PARTNERS_FULL'] || 'Equivalent to about'}&nbsp;${diversification}&nbsp;${L['INS_EFF_EQUAL'] || 'equally sized partners'}</div>
            </div>
            <div class="insight-card">
              <div class="insight-card__label">${L['INS_MEDIAN_SHARE'] || 'Median partner share'}</div>
              <div class="insight-card__value">${fmtPct(medianPartnerShare)}</div>
              <div class="insight-card__sub">${L['INS_MEDIAN_SHARE_NOTE'] || 'Typical share across active partners'}</div>
            </div>
            ${hasPrev ? `
            <div class="insight-card">
              <div class="insight-card__label">${L['INS_TURNOVER_RATE'] || 'Supplier turnover rate'}</div>
              <div class="insight-card__value">${fmtPct(turnoverRate)}</div>
              <div class="insight-card__sub">${L['INS_TURNOVER_NOTE'] || 'Share of the active partner roster that changed vs previous year'}</div>
            </div>
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
    const rankTableWrapper = panel.querySelector('.insights-rank-table-wrapper');
    if (rankTableWrapper) {
      rankTableWrapper.setAttribute('tabindex', '0');
      rankTableWrapper.setAttribute('role', 'region');
      rankTableWrapper.setAttribute('aria-label', L['INS_RANK_LIST'] || 'Partner ranking');

      rankTableWrapper.addEventListener('keydown', event => {
        // Allow keyboard users to horizontally scroll the ranking area.
        if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') {
          return;
        }

        const canScrollHorizontally = rankTableWrapper.scrollWidth > rankTableWrapper.clientWidth;
        if (!canScrollHorizontally) {
          return;
        }

        event.preventDefault();
        const scrollDelta = event.key === 'ArrowRight' ? 60 : -60;
        rankTableWrapper.scrollLeft += scrollDelta;
      });
    }

    const rankTableToggle = panel.querySelector(`#${rankTableToggleId}`);
    if (rankTableToggle) {
      const hiddenRows = Array.from(panel.querySelectorAll('[data-insights-hidden-row="true"]'));

      rankTableToggle.addEventListener('click', () => {
        const expanded = rankTableToggle.getAttribute('aria-expanded') === 'true';
        hiddenRows.forEach(row => {
          row.hidden = expanded;
        });
        rankTableToggle.setAttribute('aria-expanded', expanded ? 'false' : 'true');
        rankTableToggle.textContent = expanded ? showAllPartnersLabel : showTopPartnersLabel;
      });
    }
    chartContainer.setAttribute('aria-busy', 'false');
    const panelTitle = panel.querySelector(`#${titleId}`);
    if (panelTitle) {
      panelTitle.setAttribute('tabindex', '-1');
      panelTitle.focus();
    }
  } finally {
    // Always restore REF to its pre-insights state
    REF.year   = snapshot.year;
    REF.filter = snapshot.filter;
    REF.chart  = snapshot.chart;
    chartContainer.setAttribute('aria-busy', 'false');
    hideChartLoader();
  }
}
