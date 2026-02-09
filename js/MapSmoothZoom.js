L.Map.SmoothZoom = L.Handler.extend({
  smoothZoomDelay: 300,
  isThrottling: false,

  addHooks: function () {
    this._map.scrollWheelZoom.disable(); // Disable the default scroll wheel zoom
    L.DomEvent.on(this._map._container, 'wheel', this.onMouseWheel, this);
  },

  removeHooks: function () {
    L.DomEvent.off(this._map._container, 'wheel', this.onMouseWheel, this);
  },

  onMouseWheel: function (e) {
    e.preventDefault();
    e.stopPropagation();

    if (this.isThrottling) return;

    this.isThrottling = true;
    this.setSmoothZoom(e);

    setTimeout(function () {
      this.isThrottling = false;
    }.bind(this), this.smoothZoomDelay);
  },

  setSmoothZoom: function (e) {
    let delta;
    if (e.wheelDelta) { // Standard wheel event properties
      delta = e.wheelDelta / 120;
    } else if (e.deltaY) { // Firefox wheel event properties
      delta = -e.deltaY / 3;
    } else {
      return;
    }

    const map = this._map;

    const newZoom = delta > 0 ? 1 : -1;

    map.setZoom(map.getZoom() + newZoom);
  }
});

L.Map.addInitHook('addHandler', 'smoothZoom', L.Map.SmoothZoom);
