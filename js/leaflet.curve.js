/**
 * Leaflet.curve v2.0.0 — Bézier curves for Leaflet 1.x / 2.x
 * Modernised fork of elfalem/Leaflet.curve (v0.9.2)
 *
 * Changes from original:
 *  • Replaced `L.Util.requestAnimFrame` → `requestAnimationFrame` (removed in Leaflet 2)
 *  • Replaced `L.Util.cancelAnimFrame`  → `cancelAnimationFrame`
 *  • Kept `L.Path.extend()` class system for Leaflet 1.x compat; works with 2.x too
 *  • Inflated `_rawPxBounds` inside `_project()` — prevents SVG clipping on zoom-out
 *  • `_svgSetDashArray()` now syncs `pathLength` on every redraw — prevents dashed look
 *  • Added `_updateCurveSvg` auto-sync so animated curves stay solid at any zoom
 *  • Added `getTotalLength()` public helper
 *  • Added `toGeoJSON()` for GeoJSON export
 *  • Added configurable `boundsInflation` option (default 5000 px)
 *  • Added JSDoc throughout
 *  • Fixed global `x`/`y` leak in `_reflectPoint()`
 *  • All `var` → `let`/`const`, modern syntax
 *
 * Usage (global script — Leaflet 1.x or leaflet-global.js 2.x):
 *   <script src="leaflet.js"></script>
 *   <script src="leaflet.curve.js"></script>
 *   L.curve(["M",[50,10],"Q",[52,15],[48,20]], {animate: 1500}).addTo(map);
 *
 * Usage (ESM — Leaflet 2.x):
 *   import L from 'leaflet';
 *   import './leaflet.curve.js';
 *   new L.Curve(["M",[50,10],"Q",[52,15],[48,20]], {animate: 1500}).addTo(map);
 *
 * SVG (x,y) corresponds to (lng, lat) when projected.
 * Supported path commands: M, L, H, V, C, S, Q, T, Z (absolute only).
 *
 * @license MIT
 * @see https://github.com/elfalem/Leaflet.curve
 */

/* global L */

L.Curve = L.Path.extend({

  /* ------------------------------------------------------------------ */
  /*  Options                                                           */
  /* ------------------------------------------------------------------ */

  options: {
    /**
     * Animation duration in ms, or a Web Animations API KeyframeEffectOptions object.
     * Set to false/undefined to disable animation.
     * @type {number|object|undefined}
     */
    animate: undefined,

    /**
     * Pixels to inflate _rawPxBounds in every direction.
     * Larger = safer against clipping, but bigger SVG container.
     * @type {number}
     */
    boundsInflation: 5000,
  },

  /* ------------------------------------------------------------------ */
  /*  Lifecycle                                                         */
  /* ------------------------------------------------------------------ */

  /**
   * @param {Array} path  — SVG-like path data: ["M",[lat,lng],"Q",…]
   * @param {object} [options]
   */
  initialize(path, options) {
    L.setOptions(this, options);
    this._setPath(path);
  },

  /**
   * Called by Leaflet just before the layer is added to the map.
   * Detects whether we are using Canvas or SVG renderer.
   * @param {L.Map} map
   */
  beforeAdd(map) {
    L.Path.prototype.beforeAdd.call(this, map);
    this._usingCanvas = this._renderer instanceof L.Canvas;
    if (this._usingCanvas) {
      this._pathSvgElement = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    }
  },

  /**
   * Called when the layer is added to the map.
   * Sets up animation for SVG or Canvas renderers.
   * @param {L.Map} map
   */
  onAdd(map) {
    if (this._usingCanvas) {
      this._canvasSetDashArray = !this.options.dashArray;
    }

    L.Path.prototype.onAdd.call(this, map); // triggers _update()

    if (this._usingCanvas) {
      this._initCanvasAnimation();
    } else {
      this._initSvgAnimation();
    }
  },

  /**
   * Called when the layer is removed from the map.
   * Cleans up animation frames.
   */
  onRemove(map) {
    if (this._animationFrameId) {
      cancelAnimationFrame(this._animationFrameId);
      this._animationFrameId = null;
    }
    L.Path.prototype.onRemove.call(this, map);
  },

  /* ------------------------------------------------------------------ */
  /*  Public API                                                        */
  /* ------------------------------------------------------------------ */

  /** Alias following L.Polyline naming convention */
  setLatLngs(path) { return this.setPath(path); },
  getLatLngs()     { return this.getPath(); },

  /** @returns {Array} the raw path commands + coordinates */
  getPath() { return this._coords; },

  /**
   * Replace the current path and trigger a redraw.
   * @param {Array} path
   * @returns {this}
   */
  setPath(path) {
    this._setPath(path);
    return this.redraw();
  },

  /** @returns {L.LatLngBounds} geographic bounds of the curve */
  getBounds() { return this._bounds; },

  /** @returns {L.LatLng} geographic center of the curve bounds */
  getCenter() { return this._bounds.getCenter(); },

  /**
   * Returns the total rendered length of the SVG path (px).
   * Useful for custom dash animations.
   * @returns {number}
   */
  getTotalLength() {
    const el = this._path || this._pathSvgElement;
    return el ? el.getTotalLength() : 0;
  },

  /**
   * Export the curve as a GeoJSON LineString (sampled).
   * @param {number} [segments=64] — number of sample points
   * @returns {object} GeoJSON Feature
   */
  toGeoJSON(segments) {
    segments = segments || 64;
    const t = [];
    for (let i = 0; i <= segments; i++) { t.push(i / segments); }
    const points = this.trace(t);
    const coords = points.map(function (p) { return [p.lng, p.lat]; });
    return {
      type: 'Feature',
      geometry: { type: 'LineString', coordinates: coords },
      properties: {},
    };
  },

  /* ------------------------------------------------------------------ */
  /*  Internal — path data                                              */
  /* ------------------------------------------------------------------ */

  /** @private */
  _setPath(path) {
    this._coords = path;
    this._bounds = this._computeBounds();
  },

  /** @private — compute geographic bounds from the path data */
  _computeBounds() {
    const bound = new L.LatLngBounds();
    let lastPoint, lastCommand;

    for (let i = 0; i < this._coords.length; i++) {
      let coord = this._coords[i];

      if (typeof coord === 'string' || coord instanceof String) {
        lastCommand = coord;
        continue;
      }

      switch (lastCommand) {
        case 'H': {
          bound.extend([lastPoint.lat, coord[0]]);
          lastPoint = L.latLng(lastPoint.lat, coord[0]);
          break;
        }
        case 'V': {
          bound.extend([coord[0], lastPoint.lng]);
          lastPoint = L.latLng(coord[0], lastPoint.lng);
          break;
        }
        case 'C': {
          const cp1 = L.latLng(coord[0], coord[1]);
          coord = this._coords[++i];
          const cp2 = L.latLng(coord[0], coord[1]);
          coord = this._coords[++i];
          const ep  = L.latLng(coord[0], coord[1]);
          bound.extend(cp1); bound.extend(cp2); bound.extend(ep);
          ep.controlPoint1 = cp1; ep.controlPoint2 = cp2;
          lastPoint = ep;
          break;
        }
        case 'S': {
          const cp2 = L.latLng(coord[0], coord[1]);
          coord = this._coords[++i];
          const ep = L.latLng(coord[0], coord[1]);
          let cp1 = lastPoint;
          if (lastPoint.controlPoint2) {
            cp1 = L.latLng(
              lastPoint.lat + (lastPoint.lat - lastPoint.controlPoint2.lat),
              lastPoint.lng + (lastPoint.lng - lastPoint.controlPoint2.lng)
            );
          }
          bound.extend(cp1); bound.extend(cp2); bound.extend(ep);
          ep.controlPoint1 = cp1; ep.controlPoint2 = cp2;
          lastPoint = ep;
          break;
        }
        case 'Q': {
          const cp = L.latLng(coord[0], coord[1]);
          coord = this._coords[++i];
          const ep = L.latLng(coord[0], coord[1]);
          bound.extend(cp); bound.extend(ep);
          ep.controlPoint = cp;
          lastPoint = ep;
          break;
        }
        case 'T': {
          const ep = L.latLng(coord[0], coord[1]);
          let cp = lastPoint;
          if (lastPoint.controlPoint) {
            cp = L.latLng(
              lastPoint.lat + (lastPoint.lat - lastPoint.controlPoint.lat),
              lastPoint.lng + (lastPoint.lng - lastPoint.controlPoint.lng)
            );
          }
          bound.extend(cp); bound.extend(ep);
          ep.controlPoint = cp;
          lastPoint = ep;
          break;
        }
        default: {
          bound.extend(coord);
          lastPoint = L.latLng(coord[0], coord[1]);
          break;
        }
      }
    }
    return bound;
  },

  /* ------------------------------------------------------------------ */
  /*  Internal — projection & rendering                                 */
  /* ------------------------------------------------------------------ */

  /** Invoked by L.Path._reset() */
  _update() {
    if (!this._map) return;
    this._updatePath();
  },

  /** Route to SVG or Canvas path update */
  _updatePath() {
    if (this._usingCanvas) {
      this._updateCurveCanvas();
    } else {
      this._updateCurveSvg();
    }
  },

  /**
   * Invoked by L.Path._reset() — converts lat/lng coords to layer pixel points.
   * Also inflates _rawPxBounds to prevent SVG clipping on zoom-out.
   */
  _project() {
    let lastCoord, curCommand, curPoint;
    this._points = [];

    for (let i = 0; i < this._coords.length; i++) {
      const coord = this._coords[i];

      if (typeof coord === 'string' || coord instanceof String) {
        this._points.push(coord);
        curCommand = coord;
      } else {
        switch (coord.length) {
          case 2:
            curPoint = this._map.latLngToLayerPoint(coord);
            lastCoord = coord;
            break;
          case 1:
            if (curCommand === 'H') {
              curPoint = this._map.latLngToLayerPoint([lastCoord[0], coord[0]]);
              lastCoord = [lastCoord[0], coord[0]];
            } else {
              curPoint = this._map.latLngToLayerPoint([coord[0], lastCoord[1]]);
              lastCoord = [coord[0], lastCoord[1]];
            }
            break;
        }
        this._points.push(curPoint);
      }
    }

    if (this._bounds.isValid()) {
      const nw = this._map.latLngToLayerPoint(this._bounds.getNorthWest());
      const se = this._map.latLngToLayerPoint(this._bounds.getSouthEast());
      this._rawPxBounds = new L.Bounds(nw, se);

      // Inflate so the SVG/Canvas container is large enough for long curves
      const pad = this.options.boundsInflation;
      if (pad > 0) {
        const inflate = new L.Point(pad, pad);
        this._rawPxBounds = new L.Bounds(
          this._rawPxBounds.min.subtract(inflate),
          this._rawPxBounds.max.add(inflate)
        );
      }

      this._updateBounds();
    }
  },

  /** @private — pixel bounds (critical for Canvas hit-testing) */
  _updateBounds() {
    const tolerance = this._clickTolerance();
    const tp = new L.Point(tolerance, tolerance);
    this._pxBounds = new L.Bounds([
      this._rawPxBounds.min.subtract(tp),
      this._rawPxBounds.max.add(tp),
    ]);
  },

  /**
   * Convert projected points array into an SVG `d` attribute string.
   * @param {Array} points
   * @returns {string}
   */
  _curvePointsToPath(points) {
    let curCommand, str = '';
    for (let i = 0; i < points.length; i++) {
      const point = points[i];
      if (typeof point === 'string' || point instanceof String) {
        curCommand = point;
        str += curCommand;
      } else {
        switch (curCommand) {
          case 'H': str += point.x + ' '; break;
          case 'V': str += point.y + ' '; break;
          default:  str += point.x + ',' + point.y + ' '; break;
        }
      }
    }
    return str || 'M0 0';
  },

  /* ------------------------------------------------------------------ */
  /*  SVG Renderer                                                      */
  /* ------------------------------------------------------------------ */

  /** @private */
  _updateCurveSvg() {
    this._renderer._setPath(this, this._curvePointsToPath(this._points));
    // Always sync dash array (keeps animation + zoom in sync)
    if (this.options.animate) {
      this._svgSetDashArray();
    }
  },

  /**
   * Recalculate stroke-dasharray and pathLength from the actual rendered
   * path length. This prevents the "dashed" artifact when the path
   * reprojects to a different pixel length on zoom.
   * @returns {number} current total length in px
   */
  _svgSetDashArray() {
    const path = this._path;
    const length = path.getTotalLength();

    if (!this.options.dashArray) {
      path.style.strokeDasharray = length + ' ' + length;
    }

    // Keep pathLength in sync so dash values are interpreted correctly
    if (path.hasAttribute('pathLength')) {
      path.pathLength.baseVal = length;
    }

    return length;
  },

  /** @private — kick off SVG animation via Web Animations API */
  _initSvgAnimation() {
    if (!this.options.animate || !this._path || !this._path.animate) return;

    const length = Math.min(this._svgSetDashArray(), 1000);
    this._path.pathLength.baseVal = length;
    this._path.animate(
      [{ strokeDashoffset: length }, { strokeDashoffset: 0 }],
      this.options.animate
    );
  },

  /* ------------------------------------------------------------------ */
  /*  Canvas Renderer                                                   */
  /* ------------------------------------------------------------------ */

  /** @private */
  _initCanvasAnimation() {
    if (!this.options.animate || typeof TWEEN !== 'object') {
      this._canvasAnimating = false;
      return;
    }

    this._normalizeCanvasAnimationOptions();

    this._tweenedObject = { offset: this._pathSvgElement.getTotalLength() };
    this._tween = new TWEEN.Tween(this._tweenedObject)
      .to({ offset: 0 }, this.options.animate.duration)
      .delay(this.options.animate.delay)
      .repeat(this.options.animate.iterations - 1)
      .onComplete(function () { this._canvasAnimating = false; }.bind(this))
      .start();

    this._canvasAnimating = true;
    this._animateCanvas();
  },

  /** @private */
  _normalizeCanvasAnimationOptions() {
    const defaults = { delay: 0, duration: 0, iterations: 1 };
    if (typeof this.options.animate === 'number') {
      defaults.duration = this.options.animate;
    } else {
      if (this.options.animate.duration) defaults.duration = this.options.animate.duration;
      if (this.options.animate.delay)    defaults.delay = this.options.animate.delay;
      if (this.options.animate.iterations) defaults.iterations = this.options.animate.iterations;
    }
    this.options.animate = defaults;
  },

  /** @private */
  _updateCurveCanvas() {
    const pathString = this._curvePointsToPath(this._points);
    this._pathSvgElement.setAttribute('d', pathString);

    if (this.options.animate && typeof TWEEN === 'object' && this._canvasSetDashArray) {
      this.options.dashArray = this._pathSvgElement.getTotalLength() + '';
      this._renderer._updateDashArray(this);
    }

    this._curveFillStroke(new Path2D(pathString), this._renderer._ctx);
  },

  /** @private — requestAnimationFrame loop for Canvas animation */
  _animateCanvas() {
    TWEEN.update();
    this._renderer._updatePaths();

    if (this._canvasAnimating) {
      this._animationFrameId = requestAnimationFrame(this._animateCanvas.bind(this));
    }
  },

  /**
   * Canvas fill + stroke (mirrors L.Canvas._fillStroke).
   * @private
   */
  _curveFillStroke(path2d, ctx) {
    ctx.lineDashOffset = this._canvasAnimating ? this._tweenedObject.offset : 0.0;
    const opts = this.options;

    if (opts.fill) {
      ctx.globalAlpha = opts.fillOpacity;
      ctx.fillStyle = opts.fillColor || opts.color;
      ctx.fill(path2d, opts.fillRule || 'evenodd');
    }

    if (opts.stroke && opts.weight !== 0) {
      if (ctx.setLineDash) {
        ctx.setLineDash(opts._dashArray || []);
      }
      ctx.globalAlpha = opts.opacity;
      ctx.lineWidth   = opts.weight;
      ctx.strokeStyle = opts.color;
      ctx.lineCap     = opts.lineCap;
      ctx.lineJoin    = opts.lineJoin;
      ctx.stroke(path2d);
    }
  },

  /* ------------------------------------------------------------------ */
  /*  Hit-testing (Canvas)                                              */
  /* ------------------------------------------------------------------ */

  /**
   * Needed by the Canvas renderer for interactive events.
   * @param {L.Point} layerPoint
   * @returns {boolean}
   */
  _containsPoint(layerPoint) {
    if (!this._bounds.isValid()) return false;
    return this._bounds.contains(this._map.layerPointToLatLng(layerPoint));
  },

  /* ------------------------------------------------------------------ */
  /*  Path Tracing                                                      */
  /* ------------------------------------------------------------------ */

  /**
   * Sample points along the curve at given distances (0–1).
   * Useful for animations, GeoJSON export, or marker placement.
   *
   * @param {number[]} t — array of values in [0, 1]
   * @returns {L.LatLng[]}
   */
  trace(t) {
    if (!this._map) return [];

    t = t.filter(function (v) { return v >= 0 && v <= 1; });

    let curCommand, curStartPoint, curEndPoint;
    let p1, p2, p3;
    const samples = [];

    for (let i = 0; i < this._points.length; i++) {
      const point = this._points[i];

      if (typeof point === 'string' || point instanceof String) {
        curCommand = point;
        if (curCommand === 'Z') {
          samples.push.apply(samples, this._linearTrace(t, curEndPoint, curStartPoint));
        }
      } else {
        switch (curCommand) {
          case 'M':
            curStartPoint = point;
            curEndPoint = point;
            break;
          case 'L': case 'H': case 'V':
            samples.push.apply(samples, this._linearTrace(t, curEndPoint, point));
            curEndPoint = point;
            break;
          case 'C':
            p1 = point;
            p2 = this._points[++i];
            p3 = this._points[++i];
            samples.push.apply(samples, this._cubicTrace(t, curEndPoint, p1, p2, p3));
            curEndPoint = p3;
            break;
          case 'S':
            p1 = this._reflectPoint(p2, curEndPoint);
            p2 = point;
            p3 = this._points[++i];
            samples.push.apply(samples, this._cubicTrace(t, curEndPoint, p1, p2, p3));
            curEndPoint = p3;
            break;
          case 'Q':
            p1 = point;
            p2 = this._points[++i];
            samples.push.apply(samples, this._quadraticTrace(t, curEndPoint, p1, p2));
            curEndPoint = p2;
            break;
          case 'T':
            p1 = this._reflectPoint(p1, curEndPoint);
            p2 = point;
            samples.push.apply(samples, this._quadraticTrace(t, curEndPoint, p1, p2));
            curEndPoint = p2;
            break;
        }
      }
    }
    return samples;
  },

  /** @private */
  _linearTrace(t, p0, p1) {
    const self = this;
    return t.map(function (i) {
      const x = self._lerp(i, p0.x, p1.x);
      const y = self._lerp(i, p0.y, p1.y);
      return self._map.layerPointToLatLng([x, y]);
    });
  },

  /** @private */
  _quadraticTrace(t, p0, p1, p2) {
    const self = this;
    return t.map(function (i) {
      const x = self._quadratic(i, p0.x, p1.x, p2.x);
      const y = self._quadratic(i, p0.y, p1.y, p2.y);
      return self._map.layerPointToLatLng([x, y]);
    });
  },

  /** @private */
  _cubicTrace(t, p0, p1, p2, p3) {
    const self = this;
    return t.map(function (i) {
      const x = self._cubic(i, p0.x, p1.x, p2.x, p3.x);
      const y = self._cubic(i, p0.y, p1.y, p2.y, p3.y);
      return self._map.layerPointToLatLng([x, y]);
    });
  },

  /* ------------------------------------------------------------------ */
  /*  Math helpers                                                      */
  /* ------------------------------------------------------------------ */

  /** Linear interpolation */
  _lerp(t, a, b) { return a + t * (b - a); },

  /** Quadratic Bézier */
  _quadratic(t, p0, p1, p2) {
    const s = 1 - t;
    return s * s * p0 + 2 * s * t * p1 + t * t * p2;
  },

  /** Cubic Bézier */
  _cubic(t, p0, p1, p2, p3) {
    const s = 1 - t;
    return s * s * s * p0 + 3 * s * s * t * p1 + 3 * s * t * t * p2 + t * t * t * p3;
  },

  /** Reflect a point across another (for S / T commands) */
  _reflectPoint(point, over) {
    const x = over.x + (over.x - point.x);
    const y = over.y + (over.y - point.y);
    return L.point(x, y);
  },
});

/* -------------------------------------------------------------------- */
/*  Factory (backward-compat with Leaflet 1.x and $wt.map patterns)     */
/* -------------------------------------------------------------------- */

/**
 * Factory function — works with both Leaflet 1.x and 2.x (global script).
 * @param {Array} path
 * @param {object} [options]
 * @returns {L.Curve}
 */
L.curve = function (path, options) {
  return new L.Curve(path, options);
};
