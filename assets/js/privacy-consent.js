(function () {
    const storageKey = 'hashGeneratorCookieConsent';

    if (localStorage.getItem(storageKey)) {
        return;
    }

    const banner = document.createElement('div');
    banner.className = 'cookie-consent';
    banner.setAttribute('role', 'region');
    banner.setAttribute('aria-label', 'Cookie notice');
    banner.innerHTML = [
        '<p>Hash Generator uses local browser storage for preferences. Google AdSense and its partners may use cookies or similar technologies for ads. <a href="/privacy.html">Privacy Policy</a></p>',
        '<div class="cookie-consent-actions">',
        '<button type="button" class="cookie-consent-btn" data-consent="accepted">Accept</button>',
        '<button type="button" class="cookie-consent-btn cookie-consent-secondary" data-consent="dismissed">Dismiss</button>',
        '</div>'
    ].join('');

    banner.addEventListener('click', function (event) {
        const button = event.target.closest('[data-consent]');
        if (!button) {
            return;
        }

        localStorage.setItem(storageKey, button.getAttribute('data-consent'));
        banner.remove();
    });

    document.addEventListener('DOMContentLoaded', function () {
        document.body.appendChild(banner);
    });
}());
