class Timeline {
    constructor(targetElement) {
        this.targetElement = targetElement;
        this.createTimeline();
        this.addToDOM();
        this.initializeSlider();
    }

    createTimeline() {
        this.timeline = document.createElement('div');
        this.timeline.innerHTML = `
            <div id="chartSliderContainer">
                <div id="chartSlider" class="ui-corner-all ui-slider ui-slider-horizontal ui-widget ui-widget-content" role="slider" aria-valuenow="2013" aria-valuemin="2011" aria-valuemax="2022" style="background: rgb(38, 68, 168);">
                    <div class="ui-slider-range ui-corner-all ui-widget-header ui-slider-range-min" style="width: 18.1818%;"></div>
                    <span tabindex="0" class="ui-slider-handle sliderHandle ui-state-default" aria-valuenow="2013" style="left: 18.1818%;">
                        <div id="sliderTimePeriod">
                            <span>2013</span>
                        </div>
                    </span>
                </div>
            </div>`;
    }

    initializeSlider() {
        const minYear = 1990;
        const maxYear = 2022;

        const sliderContainer = this.timeline.querySelector('#chartSlider');
        const rangeEl = this.timeline.querySelector('.ui-slider-range');
        const handleEl = this.timeline.querySelector('.ui-slider-handle');
        const labelEl = this.timeline.querySelector('#sliderTimePeriod span');

        // Create a native range input and overlay it on the slider track
        const input = document.createElement('input');
        input.type = 'range';
        input.min = minYear;
        input.max = maxYear;
        input.value = REF.year || 2013;
        input.setAttribute('aria-label', 'Year');
        input.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;opacity:0;cursor:pointer;margin:0;';
        sliderContainer.style.position = 'relative';
        sliderContainer.appendChild(input);

        const updateVisuals = (value) => {
            const pct = this.calculateRangeWidth(value, minYear, maxYear);
            rangeEl.style.width = pct + '%';
            handleEl.style.left = pct + '%';
            handleEl.setAttribute('aria-valuenow', value);
            sliderContainer.setAttribute('aria-valuenow', value);
            labelEl.textContent = value;
        };

        updateVisuals(input.value);

        input.addEventListener('input', () => {
            updateVisuals(input.value);
        });

        input.addEventListener('change', async () => {
            REF.chartOpt = 'compareChart';
            REF.year = parseInt(input.value, 10);
            if (REF.chartCreated === true) {
                if (REF.chartType === 'barChart') {
                    await createBarChart();
                } else if (REF.chartType === 'pieChart') {
                    await createPieChart();
                } else if (REF.chartType === 'lineChart') {
                    await createLineChart();
                } else if (REF.chartType === 'depChart') {
                    await createDepChart();
                } else {
                    await createBarChart();
                }
            } else {
                compareCountries();
            }
        });

        this._input = input;
    }

    calculateRangeWidth(value, minValue, maxValue) {
        return ((value - minValue) / (maxValue - minValue)) * 100;
    }

    addToDOM() {
        this.targetElement.appendChild(this.timeline);
    }

    removeFromDOM() {
        if (this.timeline.parentNode) {
            this.timeline.parentNode.removeChild(this.timeline);
        }
    }
}
