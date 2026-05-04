# ENTRADE — Energy Trade Visualisation Tool
### Project Overview & Technical Documentation

---

## Table of Contents

1. [What Is ENTRADE?](#1-what-is-entrade)
2. [Purpose & Audience](#2-purpose--audience)
3. [Live URL & Hosting](#3-live-url--hosting)
4. [Data Sources](#4-data-sources)
5. [Technology Stack](#5-technology-stack)
6. [Application Architecture](#6-application-architecture)
7. [Global State — the REF Object](#7-global-state--the-ref-object)
8. [Startup & Initialisation Flow](#8-startup--initialisation-flow)
9. [Internationalisation (i18n)](#9-internationalisation-i18n)
10. [Interactive Map](#10-interactive-map)
11. [Charts & Visualisations](#11-charts--visualisations)
12. [Dropdown Controls & Filters](#12-dropdown-controls--filters)
13. [URL State & Deep-Linking](#13-url-state--deep-linking)
14. [Component System](#14-component-system)
15. [API Integration](#15-api-integration)
16. [Share, Embed & Social](#16-share-embed--social)
17. [Accessibility](#17-accessibility)
18. [Tutorial System](#18-tutorial-system)
19. [Tooltip System](#19-tooltip-system)
20. [Cookie Consent & Analytics](#20-cookie-consent--analytics)
21. [File Structure Reference](#21-file-structure-reference)
22. [Key Datasets (Eurobase Codes)](#22-key-datasets-eurobase-codes)
23. [Country Coverage](#23-country-coverage)
24. [Known Limitations & Notes](#24-known-limitations--notes)

---

## 1. What Is ENTRADE?

ENTRADE (**En**ergy **Trade** visualisation tool) is a single-page web application built by **Eurostat** (the Statistical Office of the European Union) that allows users to interactively explore energy trade flows between European and partner countries.

Using ENTRADE, a user can:

- Select a **country** on a map and instantly see its **top trading partners** for a chosen energy carrier.
- Visualise trade flows as animated **curved lines** (Bezier arcs) on an interactive map.
- Switch between **import** and **export** views.
- Filter data by **energy fuel family** (gas, oil, electricity, coal, etc.), **specific energy product** (SIEC code), **unit** (TJ, GWh, toe, etc.), and **reference year**.
- Analyse the same data through multiple **chart types**: bar chart, pie chart, line chart (time series), dependency wheel, and tabular view.
- **Share** the current view via a shareable URL or **embed** it in another page as an iframe.
- Access the tool in **English, French, and German**.

---

## 2. Purpose & Audience

| Attribute | Detail |
|-----------|--------|
| **Owner** | Eurostat — Unit C4 (Energy statistics) |
| **Contact** | ESTAT-ENERGY@ec.europa.eu |
| **Primary audience** | General public, policy makers, journalists, researchers |
| **Secondary audience** | Eurostat web portal visitors accessing the infographics section |
| **Copyright** | European Union |
| **Keywords** | Energy, trade, imports, exports, Energy Union, EU, energy map, energy flows, energy carrier, fuels, energy data |

---

## 3. Live URL & Hosting

```
https://ec.europa.eu/eurostat/cache/infographs/energy_trade/entrade.html
```

The tool is hosted as a **static site** (no server-side rendering, no build step) inside Eurostat's cache infographics server. All dependencies are bundled locally or loaded from Eurostat's infrastructure (`webtools.europa.eu`).

---

## 4. Data Sources

All statistical data is fetched live from the **Eurostat REST API for dissemination**:

```
https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data/{dataset}
```

Responses are in **JSON-stat format** and parsed with the bundled `json-stat.js` library.

### Datasets used

| Fuel Family | Trade Direction | Dataset Code |
|-------------|----------------|--------------|
| Natural gas | Imports | `nrg_ti_gas` |
| Natural gas | Exports | `nrg_te_gas` |
| Oil | Imports | `nrg_ti_oil` |
| Oil | Exports | `nrg_te_oil` |
| Electricity | Imports | `nrg_ti_eh` |
| Electricity | Exports | `nrg_te_eh` |
| Solid fuels | Imports | `nrg_ti_sff` |
| Solid fuels | Exports | `nrg_te_sff` |

Corresponding `.tsv` snapshot files are stored in `/dataset/` for offline reference (not actively fetched by the app).

### Static local data files

| File | Purpose |
|------|---------|
| `data/data.json` | Country coordinate pairs used to draw trade flow curves on the map |
| `data/world.json` | GeoJSON world map used by the Leaflet/webtools map layer |
| `data/translations.json` | All UI label translations (EN / FR / DE) |
| `data/tutorial_EN.json` | Tutorial step definitions — English |
| `data/tutorial_FR.json` | Tutorial step definitions — French |
| `data/tutorial_DE.json` | Tutorial step definitions — German |
| `data/labels_EN.json` | *(legacy)* Country/partner name labels |
| `data/labels_FR.json` | *(legacy)* Country/partner name labels |
| `data/labels_DE.json` | *(legacy)* Country/partner name labels |

---

## 5. Technology Stack

### Core frameworks & libraries

| Library | Version | Role |
|---------|---------|------|
| **Leaflet.js** | via `$wt.map` webtools wrapper | Interactive map rendering |
| **Eurostat Webtools** (`load.js`) | CDN | Map wrapper, Leaflet hosting, global banner |
| **Highcharts** | Bundled | Bar, pie, line, dependency wheel charts |
| **ECL (European Component Library)** | `ecl-eu.js` bundled | UI components: modals, dropdowns, buttons, site header |
| **Driver.js** | Bundled (modified) | Step-by-step tutorial tour |
| **JSONstat** | Bundled (`json-stat.js`) | Parses Eurostat API JSON-stat responses |
| **Font Awesome** | 5.15.4 bundled | Icons |

### Highcharts plugins loaded

| Plugin | Purpose |
|--------|---------|
| `highcharts.js` | Core charting engine |
| `exporting.js` | Chart export menu (PNG, JPEG, PDF, SVG) |
| `export-data.js` | Export chart data as CSV/XLS |
| `accessibility.js` | WCAG 2.1 keyboard navigation & screen reader support for charts |
| `sankey.js` | Base Sankey series type (required by dependency wheel) |
| `dependency.js` | Dependency wheel chart type (`dependencywheel`) |

### CSS

| File | Purpose |
|------|---------|
| `css/EC/ecl-reset.css` | ECL base reset |
| `css/EC/ecl-eu-default.css` | ECL EU theme defaults |
| `css/EC/ecl-ec-utilities.css` | ECL utility classes |
| `css/EC/ecl-eu.css` | Full ECL EU component styles |
| `css/driver.css` | Driver.js tutorial overlay styles |
| `css/main.css` | ENTRADE custom application styles |
| `css/font-awesome/5.15.4/css/all.min.css` | Font Awesome icon font |

---

## 6. Application Architecture

ENTRADE is a **vanilla JavaScript single-page application** — no framework (no React, Vue, or Angular). The architecture uses:

- **Namespace objects** for logical grouping of related functions (e.g. `languageNameSpace`, `dataNameSpace`, `socialNameSpace`).
- **ES6 classes** for reusable DOM components (e.g. `Navbar`, `SubNavbar`, `Footer`, `ChartControls`, `Singleselect`, `Button`, `Chart`).
- A **global `REF` object** (alias of `dataNameSpace.ref`) as the single source of truth for all current user selections.
- **Event-driven updates**: changing a dropdown value updates `REF`, then calls the appropriate render function. There is no reactive framework — updates are triggered manually.
- **Async/await** for all API calls and data loading.
- A **cache object** (`cache`) in `apiCall.js` to avoid duplicate API requests for the same query parameters.

### High-level data flow

```
User clicks country on map
  → loadCountryData(properties)
    → REF.geo = country code
    → chartApiCall() → Eurostat REST API
      → JSON-stat parsed
        → drawLines() — Bezier curves on map
        → createBarChart() / createPieChart() / etc. — Highcharts
          → dataNameSpace.setRefURL() — URL updated
```

---

## 7. Global State — the REF Object

`REF` is a reference to `dataNameSpace.ref` and is the central state object. Every user interaction updates one or more of these properties, then triggers a re-render.

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `geo` | string | `""` | ISO 3166-1 alpha-2 country code of the selected country (Eurostat `CNTR_ID`) |
| `year` | string | `"2022"` | Selected reference year |
| `language` | string | `"EN"` | UI language: `"EN"`, `"FR"`, or `"DE"` |
| `trade` | string | `"imp"` | Trade direction: `"imp"` (imports) or `"exp"` (exports) |
| `siec` | string | `"G3000"` | SIEC product code (Standard International Energy Classification) |
| `filter` | string | `"top5"` | Whether to show top-5 partners or all (`"top5"` / `"all"`) |
| `fuel` | string | `"gas"` | Fuel family: `"gas"`, `"oil"`, `"electricity"`, `"solid_fuels"` |
| `unit` | string | `"TJ_GCV"` | Measurement unit code (e.g. `TJ_GCV`, `GWH`, `TJ_NCV`, `KTOE`) |
| `defaultUnit` | string | `"TJ_GCV"` | Stores original unit before user changes it |
| `detail` | number | `1` | Internal detail level flag |
| `chart` | string | `"map"` | Active visualisation: `"map"`, `"barChart"`, `"pieChart"`, `"lineChart"`, `"depChart"`, `"tableChart"` |
| `dataset` | string | `"nrg_ti_gas"` | Active Eurostat dataset code, derived from `fuel` + `trade` |

All `REF` values are read from and written back to the **URL query string** for deep-linking (see section 13).

---

## 8. Startup & Initialisation Flow

```
entrade.html loads
  ↓
DOMContentLoaded → initApp()  [entradeInit.js]
  ↓
languageNameSpace.initLanguage(REF.language)
  → fetch translations.json
  → fetch tutorial_{LANG}.json
  → updatePageLabels()
    → removeComponents()
    → buildComponents()
      → new SubNavbar().addToDOM()
      → new Navbar().addToDOM()
      → populateDropdownData()
        → populateTrade()
        → populateProduct()
        → populateUnit()
        → populateFuel()
        → populateYearsData()
  ↓
ECL.autoInit()  [initialises ECL modals, dropdowns, etc.]
  ↓
Highcharts.setOptions()  [sets accessibility screen reader format]
  ↓
[Separately] fetch data/data.json → renderMap()
  ↓
$wt.map.render() → Leaflet map initialised
  → .ready() callback → GeoJSON country polygons drawn
    → neutralizeNonInteractivePaths()
    → if REF.geo exists → fireOnStart(REF.geo)  [re-selects country]
```

---

## 9. Internationalisation (i18n)

Managed by `languageNameSpace` in `js/language.js`.

- **Languages supported:** English (`EN`), French (`FR`), German (`DE`)
- All UI strings live in `data/translations.json` as a flat key-value object with language sub-keys.
- Tutorial steps are in separate per-language JSON files (`tutorial_EN.json`, etc.).
- Language can be changed via the **language toggle button** in the header navbar.
- On language change, `ChangeLanguage(val)` is called, which:
  1. Updates `REF.language`
  2. Re-fetches translations
  3. Calls `updatePageLabels()` → `removeComponents()` → `buildComponents()` → `renderMap()`
  4. After map re-renders, `fireOnStart(REF.geo)` re-draws trade lines for the previously selected country.

---

## 10. Interactive Map

The map is the primary entry point for the tool.

### Technology
- **Leaflet.js** wrapped by Eurostat's `$wt.map.render()` webtools function
- **Positron background** tile layer
- Custom **`leaflet.curve.js`** plugin for drawing Bezier arc trade lines
- **`MapSmoothZoom.js`** for smoother zoom behaviour

### Map configuration
- Center: `[50, 10]` (Central Europe)
- Default zoom: `4`
- Bounds: unbounded horizontally, capped at ±90° latitude
- GeoJSON country polygons loaded from Eurostat's worldmap layer

### Country interaction
- Hovering a country highlights it.
- Clicking a country:
  1. Calls `loadCountryData(properties)` with the GeoJSON `CNTR_ID`
  2. Sets `REF.geo`
  3. Fetches data from the Eurostat API
  4. Draws **Bezier trade flow curves** (`L.curve()`) between the selected country and its top partners
  5. Colours partner countries on the map
  6. Renders the active chart in the chart panel

### Trade line rendering
- Lines are drawn with `drawLines()` using `L.curve()` (quadratic Bezier).
- EU member countries are coloured `#738ce5` (blue); partner countries `#17256b` (dark blue); selected country `#0b39a2`.
- `clearLines()` removes all `.myClass` SVG path elements before redrawing.
- `reapplyCountryColors()` restores country polygon colours after a map re-render.

---

## 11. Charts & Visualisations

All charts are rendered inside `#chartContainer`. Switching chart type clears the container and rebuilds it.

### Bar Chart (`barChart.js`)
- Highcharts **column** chart
- Shows top trading partners for selected country / year / product / unit
- Top-5 filter: aggregates remaining partners into an "Others" bar
- X-axis: partner country names; Y-axis: quantity in selected unit
- Supports CSV and PNG export via Highcharts exporting plugin

### Pie Chart (`piechart.js`)
- Highcharts **pie** chart
- Same data as bar chart, presented as shares
- Labels show country name and percentage

### Line Chart (`lineChart.js`)
- Highcharts **line** chart
- Time series — shows trend over all available years for the selected country / partner / product
- `REF.chart = "lineChart"` triggers a different API call that omits the `time` parameter to retrieve the full time series

### Dependency Wheel (`dependencyChart.js`)
- Highcharts **dependencywheel** series type (requires `sankey.js` + `dependency.js` plugins)
- Shows the full EU-wide energy trade flow matrix for the selected year / product
- All EU member countries and selected partner countries are plotted as nodes; flows are weighted arcs

### Data Table (`table.js`)
- Plain HTML `<table>` rendered with ECL table classes
- Same underlying data as the bar chart (`barchartdata()` reused)
- Two columns: Country, Value
- No charting library involved; exported as part of the DOM

### Chart controls
- `auxChartControls.js` (`ChartControls` class): toolbar with chart-type toggle buttons (bar, pie, line, dependency, table), print, download PNG/JPEG, download Excel
- `floatingControls.js` (`FloatingChartControls` class): floating toolbar with percentage toggle, aggregates toggle, table toggle, sort order toggle
- `chartObject.js` (`Chart` class): wrapper around `Highcharts.chart()` that handles container, title, subtitle, axes, tooltip, series, and responsive rules

---

## 12. Dropdown Controls & Filters

All dropdowns are built using the `Singleselect` class (`domComponents/singleSelect.js`) with ECL styling.

| Control | Container ID | `REF` property updated | File |
|---------|-------------|----------------------|------|
| Trade direction | `#containerTrade` | `REF.trade` | `populateTrade.js` |
| Energy product (SIEC) | `#containerSiec` | `REF.siec` | `populateProduct.js` |
| Unit | `#containerUnit` | `REF.unit` | `populateUnit.js` |
| Fuel family | `#containerFuel` | `REF.fuel` | `populateFuels.js` |
| Reference year | `#containerYear` | `REF.year` | `populateYears.js` |

Changing **fuel family** automatically updates the active `dataset`, `siec`, and `unit` defaults, then re-populates the unit and product dropdowns.

Changing **trade direction** updates the active `dataset` and default `siec`.

The **Top-5 toggle switch** (`#switchTop5`) updates `REF.filter` between `"top5"` and `"all"`.

---

## 13. URL State & Deep-Linking

Every user selection is persisted to the browser URL via `history.pushState()` so that the current view can be bookmarked or shared.

The URL format is:
```
entrade.html?geo=DE&year=2022&language=EN&trade=imp&siec=G3000&filter=top5&fuel=gas&unit=TJ_GCV&defaultUnit=TJ_GCV&detail=1&chart=barChart&dataset=nrg_ti_gas
```

On page load, `dataNameSpace.getRefURL()` parses the URL query string and populates `REF` before the map and components are initialised. This enables full deep-linking — sharing a URL restores the exact view including selected country, chart type, year, product, and language.

---

## 14. Component System

UI is built from ES6 classes that generate HTML strings and mount to target DOM elements via `addToDOM(targetSelector)`.

| Class | File | Mounts to | Purpose |
|-------|------|-----------|---------|
| `Navbar` | `navComponent.js` | `#navbar-container` | Top header: app title, Eurostat logo, language selector |
| `SubNavbar` | `subNavBarComponent.js` | `#subnavbar-container` | Secondary toolbar: chart type buttons, info/share/embed dropdown, Top-5 toggle |
| `Footer` | `footerComponent.js` | `#componentFooter` | Footer with cookie disclaimer *(currently commented out from buildComponents)* |
| `ChartControls` | `auxChartControls.js` | `#auxChartControls` | Chart action buttons (export, download, print) |
| `FloatingChartControls` | `floatingControls.js` | created dynamically | Floating overlay toolbar with percentage/aggregates/table/sort toggles |
| `Chart` | `chartObject.js` | `#chartContainer` | Highcharts wrapper for bar/pie/line/dependency charts |
| `Button` | `btns.js` | Used by other components | Generic ECL-styled button element factory |
| `Singleselect` | `singleSelect.js` | Various dropdown containers | ECL-styled `<select>` with label and change handler |

Components are rebuilt on every language change by `removeComponents()` → `buildComponents()`.

---

## 15. API Integration

All statistical data comes from a single endpoint pattern:

```
GET https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data/{dataset}
  ?format=JSON
  &lang={EN|FR|DE}
  &geo={CNTR_ID}
  &siec={SIEC_CODE}
  &unit={UNIT_CODE}
  &time={YEAR}          ← omitted for line chart (time series)
```

### Request caching
`apiCall.js` maintains an in-memory `cache` object keyed by full URL string. If the same request has been made in the current session, the cached `JSONstat` dataset is returned immediately — no network request is made.

### Response parsing
Responses are parsed with `JSONstat(json).Dataset(0)` from the bundled `json-stat.js` library. This returns a dataset object with `.Dimension()`, `.value`, and `.__tree__` accessors used across all chart modules.

### Error handling
Failed API calls log to console and display `showNoDataPopup()` (a non-blocking toast notification) plus `showNoDataInChartContainer()` (an in-container fallback message) if the resulting dataset is empty or null.

---

## 16. Share, Embed & Social

### Share URL
The **Share** button opens an ECL `<dialog>` modal (`#iframeModal`) displaying the current page URL, which encodes all `REF` state as query parameters. Focus is trapped inside the modal while it is open (WCAG 2.1 compliance).

### Embed (iFrame)
The **Embed** button generates an `<iframe>` snippet using the current URL. The `hideForIframe()` function in `countries.js` detects when the tool is loaded inside an iframe (`window.self !== window.top`) and hides the top navigation to provide a clean embedded view.

### Social sharing
`js/social.js` provides `socialNameSpace.twitter()`, `.facebook()`, and `.linkedin()` methods. Each opens a small popup window with a pre-composed share message in the selected language (EN/FR/DE) and the current page URL encoded as the share target.

---

## 17. Accessibility

The tool targets **WCAG 2.1 AA** compliance.

| Feature | Implementation |
|---------|---------------|
| Keyboard navigation on map | Country polygons receive `tabindex` and `aria-*` attributes via `neutralizeNonInteractivePaths()` in `countries.js` |
| Keyboard navigation on charts | Highcharts `accessibility.js` plugin provides full keyboard traversal of chart elements |
| Chart screen reader support | `Highcharts.setOptions()` in `entradeInit.js` configures a semantic `<h2>` before-chart screen reader section |
| Modal focus trap | `trapFocusInModal()` in `iframe.js` implements Tab/Shift+Tab cycling within the share modal |
| Scrollable modal content | `.ecl-modal__body-scroll` has `tabindex="0"` and `role="region"` with `aria-label` |
| Tutorial ARIA | Driver.js is patched in `js/external/driver.js` with corrected `aria-*` attributes |
| Skip links | ECL provides standard EU skip-to-content links |
| Tooltips | `TooltipManager` in `tooltip.js` supports both mouse and keyboard (focus/blur) with ESC dismissal |
| Language indicator | HTML `lang` attribute is set to `"en"` at page load; language-specific content uses `lang` attributes on language list items |

---

## 18. Tutorial System

`js/tutorial.js` implements a guided interactive tour using the bundled **Driver.js** library.

- Triggered by the **Tutorial** button in the info dropdown.
- Checks `localStorage` for key `"tutorialSeen": "v1"` — if already seen, skips auto-launch on first visit.
- Steps are loaded from `data/tutorial_{LANG}.json` and target specific DOM elements by CSS selector.
- Driver.js is configured with custom `onNextClick` / `onPrevClick` hooks that handle opening/closing dropdowns and menus as steps progress.
- The tour closes open ECL dropdowns and language panels when navigating between steps.
- On tour completion or skip, `localStorage.setItem("tutorialSeen", "v1")` is called.

---

## 19. Tooltip System

`js/tooltip.js` provides a `TooltipManager` class instance (`tooltipManager`) with:

- **Smart positioning**: tooltip stays within viewport bounds.
- **Show/hide delays** (200 ms show, 100 ms hide) to avoid flickering.
- **Dual interaction modes**: mouse (hover) and keyboard (focus/blur).
- **ESC key dismissal**: pressing ESC closes any visible tooltip.
- **Caching**: tooltip DOM elements are cached in a `Map` by button reference to avoid repeated DOM creation.
- **Cleanup**: `cleanup()` removes all tooltip elements and event listeners, called before re-rendering components.

Tooltips are attached to chart control buttons, nav buttons, and other interactive elements via `data-tooltip` attributes.

---

## 20. Cookie Consent & Analytics

The tool uses Eurostat's standard European Commission infrastructure:

| Component | Implementation |
|-----------|---------------|
| **Cookie Consent Kit (CCK)** | `js/cck.js` + inline JSON config `{ "utility": "cck", "url": "..." }` |
| **Analytics** | Inline JSON config `{ "utility": "analytics", "siteID": "59", "instance": "ec.europa.eu" }` |
| **Global banner** | `js/globan.js` — renders the standard EC global banner (managed by `globanManager`) |

CCK is reinitialised on language change via `cckManager.regenerate(REF.language)` to display cookie notices in the current language.

---

## 21. File Structure Reference

```
entrade.html                  ← Single HTML entry point
│
├── css/
│   ├── main.css              ← Custom application styles
│   ├── driver.css            ← Tutorial overlay styles
│   └── EC/                   ← ECL (European Component Library) stylesheets
│       ├── ecl-reset.css
│       ├── ecl-eu-default.css
│       ├── ecl-ec-utilities.css
│       └── ecl-eu.css
│
├── js/
│   ├── basics.js             ← Core utilities: URL helpers, chart export, metadata/contact links
│   ├── language.js           ← i18n: languageNameSpace, label loading, language switching
│   ├── countries.js          ← Map rendering, trade line drawing, country interaction
│   ├── data.js               ← dataNameSpace: REF object, URL state serialisation/deserialisation
│   ├── codes.js              ← Country code lists, SIEC/fuel/unit/trade mapping tables
│   ├── apiCall.js            ← Eurostat REST API fetch with in-memory caching
│   ├── entradeInit.js        ← App bootstrap: initApp(), buildComponents(), populateDropdownData()
│   ├── barChart.js           ← Bar chart creation & data processing
│   ├── piechart.js           ← Pie chart creation
│   ├── lineChart.js          ← Line (time series) chart creation
│   ├── dependencyChart.js    ← Dependency wheel chart creation
│   ├── table.js              ← HTML data table creation
│   ├── tooltip.js            ← TooltipManager class
│   ├── tutorial.js           ← TutorialTour (Driver.js wrapper)
│   ├── iframe.js             ← Share/embed modal: exportIframe(), trapFocusInModal()
│   ├── social.js             ← socialNameSpace: Twitter/Facebook/LinkedIn share
│   ├── populateTrade.js      ← Trade direction dropdown
│   ├── populateFuels.js      ← Fuel family dropdown
│   ├── populateProduct.js    ← Energy product (SIEC) dropdown
│   ├── populateUnit.js       ← Unit dropdown
│   ├── populateYears.js      ← Year dropdown (populated from API response dimensions)
│   ├── keyboardNavigationLogic.js  ← trapTab() for ECL dropdown focus trapping
│   ├── cck.js                ← Cookie Consent Kit manager
│   ├── globan.js             ← EC Global Banner manager
│   ├── json-stat.js          ← JSONstat library for parsing Eurostat API responses
│   ├── MapSmoothZoom.js      ← Leaflet smooth zoom extension
│   ├── leaflet.curve.js      ← Leaflet Bezier curve plugin (trade flow arcs)
│   │
│   ├── domComponents/        ← ES6 class-based UI components
│   │   ├── navComponent.js       ← Navbar class (header + language selector)
│   │   ├── subNavBarComponent.js ← SubNavbar class (chart type buttons, share/embed/info)
│   │   ├── footerComponent.js    ← Footer class
│   │   ├── auxChartControls.js   ← ChartControls class (export/download toolbar)
│   │   ├── floatingControls.js   ← FloatingChartControls class (overlay toolbar)
│   │   ├── chartObject.js        ← Chart class (Highcharts wrapper)
│   │   ├── btns.js               ← Button class (generic ECL button factory)
│   │   └── singleSelect.js       ← Singleselect class (ECL-styled dropdown)
│   │
│   └── external/             ← Bundled third-party libraries
│       ├── ecl-eu.js             ← European Component Library JS
│       ├── driver.js             ← Driver.js tutorial library (patched)
│       ├── chart/
│       │   ├── highcharts.js
│       │   ├── exporting.js
│       │   ├── export-data.js
│       │   ├── accessibility.js
│       │   ├── sankey.js         ← Required base for dependency wheel
│       │   └── dependency.js     ← Dependency wheel series type
│       └── table/                ← DataTables + export plugins (CSV, Excel, PDF)
│           └── *.min.js
│
├── data/
│   ├── data.json             ← Country map coordinate pairs
│   ├── world.json            ← GeoJSON worldmap
│   ├── translations.json     ← All UI labels (EN/FR/DE)
│   ├── tutorial_EN.json
│   ├── tutorial_FR.json
│   └── tutorial_DE.json
│
├── dataset/                  ← TSV data snapshots (reference, not fetched by app)
│   └── nrg_*.tsv
│
└── img/                      ← Static images
    ├── banner/
    ├── country_flags/
    ├── dialogbox/
    ├── fuel-family/
    ├── logo/
    └── social-media/
```

---

## 22. Key Datasets (Eurobase Codes)

### SIEC codes (energy products)

| Code | Description |
|------|-------------|
| `G3000` | Natural gas (default for gas family) |
| `O4000XBIO` | Oil and petroleum products excl. biofuel |
| `E7000` | Electricity |
| `C0000X0350-0370` | Solid fossil fuels |
| `RA000` | Renewables and biofuels |

### Unit codes

| Code | Description |
|------|-------------|
| `TJ_GCV` | Terajoules (Gross Calorific Value) — default for gas |
| `TJ_NCV` | Terajoules (Net Calorific Value) |
| `GWH` | Gigawatt-hours — default for electricity |
| `KTOE` | Thousand tonnes of oil equivalent |
| `THS_T` | Thousand tonnes |

### Trade direction codes

| Code | Label |
|------|-------|
| `imp` | Imports |
| `exp` | Exports |

---

## 23. Country Coverage

### EU member states (27 + UK)

`BE, BG, CZ, DK, DE, EE, IE, EL, ES, FR, HR, IT, CY, LV, LT, LU, HU, MT, NL, AT, PL, PT, RO, SI, SK, FI, SE, UK`

Plus Euro Area aggregate `EA`.

### Non-EU European countries

`IS, LI, NO, ME, MK, RS, TR, BA, XK, MD, UA, AL, BY, CH`

### Global partner countries

Depending on the selected fuel and dataset, partner data may include: `RU, US, CA, MX, QA, DZ, LY, NG, AO, ZA, MZ, CO, EC, BR, CL, AU, IN, CN` and others — represented in the dependency wheel and bar charts.

---

## 24. Known Limitations & Notes

- **Mobile support**: The tool detects mobile via User-Agent and `window.innerWidth < 850`. Some features (e.g. map trade lines, floating controls) may have reduced functionality on small screens.
- **IE/Edge Legacy**: Headers include `X-UA-Compatible: IE=edge` but the tool is not actively tested on Internet Explorer.
- **No offline mode**: All chart data requires a live Eurostat API connection. Local `.tsv` files in `/dataset/` are reference snapshots only.
- **Year coverage**: Available years depend on what the Eurostat API returns for each dataset. The year dropdown is populated dynamically from the API response dimensions on first load.
- **Caching is session-only**: The in-memory `cache` object in `apiCall.js` is cleared on page reload. There is no `localStorage` or `IndexedDB` caching of API responses.
- **Language limited to EN/FR/DE**: The ECL language selector renders only English, French, and Deutsch. Adding a new language requires entries in `translations.json`, a new `tutorial_{LANG}.json` file, and a new `<li>` in the `Navbar` component.
- **Footer component**: `Footer` class exists and is instantiated (`new Footer()`) but its `addToDOM()` call is commented out in `buildComponents()` — the footer is not currently rendered.
- **FloatingChartControls**: The component is instantiated directly in `floatingControls.js` rather than via `buildComponents()`.
