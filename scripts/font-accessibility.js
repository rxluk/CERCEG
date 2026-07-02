(function () {
    const storageKey = 'cerceg-font-scale';
    const spacingStorageKey = 'cerceg-text-spacing';
    const contrastStorageKey = 'cerceg-high-contrast';
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

    function readStoredContrast() {
        try {
            return localStorage.getItem(contrastStorageKey) === 'true';
        } catch (error) {
            return false;
        }
    }

    function saveContrast(enabled) {
        try {
            if (enabled) {
                localStorage.setItem(contrastStorageKey, 'true');
            } else {
                localStorage.removeItem(contrastStorageKey);
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

    function updateContrastButton(enabled) {
        document.querySelectorAll('[data-contrast-action="toggle"]').forEach((button) => {
            button.setAttribute('aria-pressed', String(enabled));
            button.classList.toggle('is-active', enabled);
            button.textContent = enabled ? 'Alto contraste' : 'Alto Contraste';
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

    function applyContrast(enabled) {
        root.classList.toggle('high-contrast', enabled);
        updateContrastButton(enabled);
        saveContrast(enabled);
    }

    function toggleSpacing() {
        applySpacing(!body.classList.contains('text-spacing'));
    }

    function toggleContrast() {
        applyContrast(!root.classList.contains('high-contrast'));
    }

    function createMenu() {
        const menuId = 'accessibility-menu-panel';
        const wrapper = document.createElement('div');
        wrapper.className = 'accessibility-menu';

        const trigger = document.createElement('button');
        trigger.type = 'button';
        trigger.className = 'accessibility-menu__trigger';
        trigger.setAttribute('aria-controls', menuId);
        trigger.setAttribute('aria-expanded', 'false');
        trigger.setAttribute('aria-label', 'Abrir menu de acessibilidade');
        trigger.innerHTML = `
        <svg class="accessibility-menu__icon"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 16 16"
            fill="currentColor"
            aria-hidden="true"
            focusable="false">
            <path d="M8 1a1.5 1.5 0 1 0 0 3A1.5 1.5 0 0 0 8 1z"/>
            <path d="M4 5a.5.5 0 0 0 0 1h3v2.5L5.5 14h1.5L8 10.5 9 14h1.5L9 8.5V6h3a.5.5 0 0 0 0-1H4z"/>
        </svg>
        `;

        const menu = document.createElement('aside');
        menu.id = menuId;
        menu.className = 'a11y-menu';
        menu.setAttribute('aria-label', 'Menu de acessibilidade');
        menu.setAttribute('aria-hidden', 'true');

        menu.innerHTML = `
            <span class="a11y-menu__label">Fonte</span>
            <button type="button" class="a11y-menu__button" data-font-action="decrease" aria-label="Diminuir fonte">A-</button>
            <button type="button" class="a11y-menu__button" data-font-action="increase" aria-label="Aumentar fonte">A+</button>
            <button type="button" class="a11y-menu__button" data-spacing-action="toggle" aria-pressed="false">Espaçamento</button>
            <button type="button" class="a11y-menu__button" data-contrast-action="toggle" aria-pressed="false">Alto Contraste</button>
        `;

        menu.addEventListener('click', (event) => {
            const button = event.target.closest('[data-font-action]');
            const spacingButton = event.target.closest('[data-spacing-action]');
            const contrastButton = event.target.closest('[data-contrast-action]');

            if (spacingButton) {
                toggleSpacing();
                return;
            }

            if (contrastButton) {
                toggleContrast();
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

        trigger.addEventListener('click', () => {
            const isOpen = wrapper.classList.toggle('accessibility-menu--open');
            trigger.setAttribute('aria-expanded', String(isOpen));
            trigger.setAttribute('aria-label', isOpen ? 'Fechar menu de acessibilidade' : 'Abrir menu de acessibilidade');
            menu.setAttribute('aria-hidden', String(!isOpen));
        });

        wrapper.appendChild(trigger);
        wrapper.appendChild(menu);

        return wrapper;
    }

    function init() {
        const menu = createMenu();
        document.body.appendChild(menu);
        applyScale(readStoredScale());
        applySpacing(readStoredSpacing());
        applyContrast(readStoredContrast());
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init, { once: true });
    } else {
        init();
    }
})();