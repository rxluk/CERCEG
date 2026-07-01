(function () {
    const storageKey = 'cerceg-font-scale';
    const spacingStorageKey = 'cerceg-text-spacing';
    const root = document.documentElement;
    const body = document.body;
    const steps = [1, 1.25, 1.5, 1.75, 2];
    const minScale = steps[0];
    const maxScale = steps[steps.length - 1];

    function normalizeScale(value) {
        const numeric = Number.parseFloat(value);

        if (!Number.isFinite(numeric)) {
            return minScale;
        }

        return steps.reduce((closest, current) => {
            return Math.abs(current - numeric) < Math.abs(closest - numeric) ? current : closest;
        }, minScale);
    }

    function readStoredScale() {
        try {
            return normalizeScale(localStorage.getItem(storageKey));
        } catch (error) {
            return minScale;
        }
    }

    function saveScale(scale) {
        try {
            localStorage.setItem(storageKey, String(scale));
        } catch (error) {
        }
    }

    function readStoredSpacing() {
        try {
            return localStorage.getItem(spacingStorageKey) === 'true';
        } catch (error) {
            return false;
        }
    }

    function saveSpacing(enabled) {
        try {
            if (enabled) {
                localStorage.setItem(spacingStorageKey, 'true');
            } else {
                localStorage.removeItem(spacingStorageKey);
            }
        } catch (error) {
        }
    }

    function getCurrentScale() {
        return normalizeScale(root.style.getPropertyValue('--font-scale') || readStoredScale());
    }

    function applyScale(scale) {
        const normalizedScale = Math.max(minScale, Math.min(maxScale, normalizeScale(scale)));
        root.style.setProperty('--font-scale', String(normalizedScale));
        updateButtonState(normalizedScale);
        saveScale(normalizedScale);
    }

    function updateButtonState(scale) {
        const decreaseDisabled = scale <= minScale;
        const increaseDisabled = scale >= maxScale;

        document.querySelectorAll('[data-font-action="decrease"]').forEach((button) => {
            button.disabled = decreaseDisabled;
        });

        document.querySelectorAll('[data-font-action="increase"]').forEach((button) => {
            button.disabled = increaseDisabled;
        });
    }

    function updateSpacingButton(enabled) {
        document.querySelectorAll('[data-spacing-action="toggle"]').forEach((button) => {
            button.setAttribute('aria-pressed', String(enabled));
            button.classList.toggle('is-active', enabled);
            button.textContent = enabled ? 'Sem espaçamento' : 'Espaçamento';
        });
    }

    function changeScale(delta) {
        applyScale(getCurrentScale() + delta);
    }

    function applySpacing(enabled) {
        body.classList.toggle('text-spacing', enabled);
        updateSpacingButton(enabled);
        saveSpacing(enabled);
    }

    function toggleSpacing() {
        applySpacing(!body.classList.contains('text-spacing'));
    }

    function createMenu() {
        const menu = document.createElement('aside');
        menu.className = 'a11y-menu';
        menu.setAttribute('aria-label', 'Menu de acessibilidade');

        menu.innerHTML = `
            <span class="a11y-menu__label">Fonte</span>
            <button type="button" class="a11y-menu__button" data-font-action="decrease" aria-label="Diminuir fonte">A-</button>
            <button type="button" class="a11y-menu__button" data-font-action="increase" aria-label="Aumentar fonte">A+</button>
            <button type="button" class="a11y-menu__button" data-spacing-action="toggle" aria-pressed="false">Espaçamento</button>
        `;

        menu.addEventListener('click', (event) => {
            const button = event.target.closest('[data-font-action]');
            const spacingButton = event.target.closest('[data-spacing-action]');

            if (spacingButton) {
                toggleSpacing();
                return;
            }

            if (!button || button.disabled) {
                return;
            }

            const action = button.getAttribute('data-font-action');

            if (action === 'increase') {
                changeScale(0.25);
            }

            if (action === 'decrease') {
                changeScale(-0.25);
            }
        });

        return menu;
    }

    function init() {
        const menu = createMenu();
        document.body.appendChild(menu);
        applyScale(readStoredScale());
        applySpacing(readStoredSpacing());
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init, { once: true });
    } else {
        init();
    }
})();