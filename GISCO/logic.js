  
       
            
            

// Posted by ryanve, modified by community. See post 'Timeline' for change history
// Retrieved 2026-03-25, License - CC BY-SA 4.0

let vw = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0)
let vh = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0)

let countriesDefinitions = []

const EU_MEMBER_COUNTRY_CODES = new Set(['BE','BG','CZ','DK','DE','EE','IE','EL','ES','FR','HR','IT','CY','LV','LT','LU','HU','MT','NL','AT','PL','PT','RO','SI','SK','FI','SE'])

const ISO3166_ALPHA3_TO_ALPHA2 = {
    AUT: 'AT', BEL: 'BE', BGR: 'BG', HRV: 'HR', CYP: 'CY', CZE: 'CZ', DNK: 'DK', EST: 'EE', FIN: 'FI', FRA: 'FR', DEU: 'DE', GRC: 'EL', HUN: 'HU', IRL: 'IE', ITA: 'IT', LVA: 'LV', LTU: 'LT', LUX: 'LU', MLT: 'MT', NLD: 'NL', POL: 'PL', PRT: 'PT', ROU: 'RO', SVK: 'SK', SVN: 'SI', ESP: 'ES', SWE: 'SE'
}

function normalizeCountryId(rawId) {
    if (!rawId) return ''
    let id = String(rawId || '').trim().toUpperCase()
    if (id.startsWith('EM-')) {
        id = id.replace(/^EM-/i, '')
    }
    if (id.startsWith('EM-') || id.startsWith('EMCNTRG-') || id.startsWith('EM-CNTRG-') || id.startsWith('EM-CNTRG-')) {
        id = id.replace(/^(?:EM|em)-(?:CNTRG-)?/i, '')
    }
    id = id.replace(/[^A-Z0-9]/g, '')
    if (id.length === 3 && ISO3166_ALPHA3_TO_ALPHA2[id]) {
        return ISO3166_ALPHA3_TO_ALPHA2[id]
    }
    if (id.length === 2) {
        return id
    }
    if (id === 'GBR') return 'GB'
    return id
}

function ringCentroid(ring) {
    let area = 0;
    let cx = 0;
    let cy = 0;
    for (let i = 0, len = ring.length - 1; i < len; i++) {
        const [x0, y0] = ring[i];
        const [x1, y1] = ring[i + 1];
        const a = x0 * y1 - x1 * y0;
        area += a;
        cx += (x0 + x1) * a;
        cy += (y0 + y1) * a;
    }
    if (area === 0) {
        return null;
    }
    area *= 0.5;
    cx /= 6 * area;
    cy /= 6 * area;
    return { lon: cx, lat: cy };
}

function polygonCentroid(polygon) {
    if (!Array.isArray(polygon) || polygon.length === 0) return null;
    const outer = polygon[0];
    const c = ringCentroid(outer);
    if (c) return c;
    // fallback to average of points
    let sumx = 0, sumy = 0, n = 0;
    outer.forEach(pt => { if (Array.isArray(pt) && pt.length === 2) { sumx += pt[0]; sumy += pt[1]; n++; }});
    return n ? { lon: sumx / n, lat: sumy / n } : null;
}

function geometryCentroid(geometry) {
    if (!geometry || !geometry.type || !geometry.coordinates) return null;
    const coords = geometry.coordinates;
    switch (geometry.type) {
        case 'Point':
            return { lon: coords[0], lat: coords[1] };
        case 'MultiPoint':
        case 'LineString':
            if (!Array.isArray(coords) || coords.length === 0) return null;
            let sx = 0, sy = 0;
            coords.forEach(pt => { if (Array.isArray(pt) && pt.length === 2) { sx += pt[0]; sy += pt[1]; }});
            return coords.length ? { lon: sx / coords.length, lat: sy / coords.length } : null;
        case 'MultiLineString':
            let total = 0, tlx = 0, tly = 0;
            coords.forEach(line => { if (Array.isArray(line)) { line.forEach(pt => { if (Array.isArray(pt) && pt.length===2) { tlx += pt[0]; tly += pt[1]; total++; }}); }});
            return total ? { lon: tlx / total, lat: tly / total } : null;
        case 'Polygon':
            return polygonCentroid(coords);
        case 'MultiPolygon':
            if (!Array.isArray(coords) || coords.length === 0) return null;
            // choose centroid from largest polygon ring by area
            let best = null, bestArea = -Infinity;
            coords.forEach(poly => {
                if (Array.isArray(poly) && poly.length) {
                    const o = polygonCentroid(poly);
                    // compute ring area quickly from first ring only
                    let area = 0;
                    const ring = poly[0] || [];
                    for (let i = 0; i < ring.length - 1; i++) {
                        const [x0, y0] = ring[i];
                        const [x1, y1] = ring[i+1];
                        area += x0 * y1 - x1 * y0;
                    }
                    area = Math.abs(area) * 0.5;
                    if (o && area > bestArea) {
                        bestArea = area;
                        best = o;
                    }
                }
            });
            return best;
        default:
            return null;
    }
}

function populateCountriesDefinitionsFromMap() {
    const allRegionPaths = document.querySelectorAll('#map path, #em-worldrg path, #em-nutsrg path, #em-cntrg path');
    const seen = new Set();
    countriesDefinitions = [];

    allRegionPaths.forEach(path => {
        const feature = path.__data__;
        const props = feature && feature.properties ? feature.properties : null;
        if (!props || !props.id) return;

        const id = props.id;
        if (seen.has(id)) return;
        seen.add(id);

        const name = props.na || props.NAME || props.name || props.label || '';

        let center = null;
        if (props.center) {
            center = props.center;
        } else if (props.centroid) {
            center = props.centroid;
        } else if (typeof d3 !== 'undefined' && d3.geoCentroid && feature && feature.geometry) {
            const c = d3.geoCentroid(feature);
            if (Array.isArray(c) && c.length === 2) {
                center = { lon: c[0], lat: c[1] };
            }
        } else if (feature && feature.geometry) {
            const geomCenter = geometryCentroid(feature.geometry);
            if (geomCenter) {
                center = geomCenter;
            }
        } else if (path && path.getBBox) {
            const bbox = path.getBBox();
            center = { x: bbox.x + bbox.width / 2, y: bbox.y + bbox.height / 2 };
        }

        countriesDefinitions.push({ id, name, center });
    });


    console.log('countriesDefinitions populated (onBuild):', countriesDefinitions.length, countriesDefinitions);
    return countriesDefinitions;
}

function applyCountryFillColors() {
    const regionPaths = Array.from(document.querySelectorAll('#map path, #em-worldrg path, #em-nutsrg path, #em-cntrg path'));
    let missingIdLogged = false;

    regionPaths.forEach(path => {
        const datum = path.__data__;
        const props = datum && datum.properties ? datum.properties : null;

        if (!props && !path.id) {
            // non-region path (e.g., background shapes, complex UI shapes), skip
            return;
        }

        let id = props && props.id ? props.id : path.id || '';
        id = normalizeCountryId(id);

        if (!id) {
            if (!missingIdLogged) {
                console.warn('applyCountryFillColors: some paths have no normalized id and are skipped (expected for non-data paths)');
                missingIdLogged = true;
            }
            return;
        }

        const makeBlue = EU_MEMBER_COUNTRY_CODES.has(id);
        const fillColor = makeBlue ? '#0000FF' : '#ffffff';
        const strokeColor = makeBlue ? '#0000CC' : '#bdbdbd';

        path.style.setProperty('fill', fillColor, 'important');
        path.style.setProperty('stroke', strokeColor, 'important');
        path.setAttribute('fill', fillColor);
        path.setAttribute('stroke', strokeColor);
    });
    return null;
}



            
            
            const map = eurostatmap
                .map('ch')
                .title('World map example')
                .geo('WORLD')
                .proj(54030)
                .width(vw)
                .height(vh)
                .nutsLevel(0)
                .nutsYear(2024)
                .drawGraticule(false)
                .classificationMethod('threshold')
                .thresholds([10, 20, 30, 40, 50, 60, 70])
                .colors([])
                .legend(false)
                .zoomButtons(true)
                .scale("20M")
                .position({x: 10, y: 29.999999999999996, z: 6766.917293233083})
                .seaFillStyle('#FFFFFF')
                .onBuild(() => {
                    populateCountriesDefinitionsFromMap();

                    // ensure final style after eurostat-map internal fill logic runs
                    setTimeout(() => applyCountryFillColors(), 40);

                    const originalUpdateStyle = map.updateStyle?.bind(map);
                    if (typeof originalUpdateStyle === 'function') {
                        map.updateStyle = function () {
                            const res = originalUpdateStyle();
                            applyCountryFillColors();
                            return res;
                        };
                    }
                })
          
                map.statData().setData(data)

                map.build();      

     

                   

                let tooltipOptions = {
                    id: 'em-tooltip', // id to give the tooltip element
                    customElement: myTooltipDiv, // or specify your own element
                    containerId: 'map-container', // eurostat-map ensures that the tooltip doesnt leave the bounds of this container
                    transitionDuration: 200,
                    xOffset: 30,
                    yOffset: 20,
                    textFunction: ((region, map) => { return region && region.properties ? region.properties.na : ''; }),
                    showFlags: "long",
                    omitRegions: ['RU', 'BY', 'IL', 'PS']
                };
          
                map.tooltip(tooltipOptions);






document.getElementById('map').addEventListener('click', function(evt) {
                    var path = evt.target.closest('path');
                    if (path) {
                        var datum = path.__data__ || (path.__data__ && path.__data__.properties ? path.__data__ : null);
                        var regionId = datum && datum.properties && datum.properties.id ? datum.properties.id : null;
                        console.log('Direct container delegation click', {regionId: regionId});
                        
                    }
                });