function exportIframe() {

    const headerContent = document.querySelector('.ecl-modal__header-content');
    if (headerContent) {
        headerContent.textContent = languageNameSpace.labels['sharemodaltitle'];
    }

    const targetUrl = document.querySelector('.targetUrl');
    if (targetUrl) {
        targetUrl.textContent = window.location.href;
    }
    
    const modal = document.getElementById('iframeModal');

    // Open the modal
    modal.showModal();

    ECL.autoInit();

    // Trap focus within the modal while it is open
    trapFocusInModal(modal);

}

function trapFocusInModal(modal) {
    const FOCUSABLE = 'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

    // Focus the first focusable element
    const focusable = Array.from(modal.querySelectorAll(FOCUSABLE));
    if (focusable.length) focusable[0].focus();

    function handleTrap(e) {
        if (e.key !== 'Tab') return;
        const elements = Array.from(modal.querySelectorAll(FOCUSABLE));
        if (!elements.length) return;
        const first = elements[0];
        const last = elements[elements.length - 1];
        if (e.shiftKey) {
            if (document.activeElement === first) {
                e.preventDefault();
                last.focus();
            }
        } else {
            if (document.activeElement === last) {
                e.preventDefault();
                first.focus();
            }
        }
    }

    modal.addEventListener('keydown', handleTrap);

    // Clean up listener when modal closes
    modal.addEventListener('close', function cleanup() {
        modal.removeEventListener('keydown', handleTrap);
        modal.removeEventListener('close', cleanup);
    }, { once: true });
}

function closeModalUrl(params) {
    REF.share = false
}







function copyUrl() {
    // Sync current state into the browser URL first
    dataNameSpace.setRefURL();

    // Build the embed URL by setting share=true via URLSearchParams so it is
    // always appended reliably regardless of the current URL's query string.
    const embedUrl = new URL(window.location.href);
    embedUrl.searchParams.set('share', 'true');

    const iframeCode = '<iframe style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: 0;" src="' + embedUrl.toString() + '" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>';

    navigator.clipboard.writeText(iframeCode).catch((error) => { console.error("Unable to copy URL to clipboard: ", error); });
}

function hideForIframe() {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('share') !== 'true') return;

    const selectors = [
        '#body > header',
        '#allContainer',
        '#menuSwitch',
        '#floatingMenu',
        '#componentFooter'
    ];
    selectors.forEach(sel => {
        const el = document.querySelector(sel);
        if (el) el.style.display = 'none';
    });

    const chartTitle = document.querySelector('.highcharts-title');
    if (chartTitle) chartTitle.style.display = 'block';
}