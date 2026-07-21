// Elite Tours - landing page interactions
// Hero entrance, frosted sticky header, tabbed live search, currency toggle.

document.addEventListener('DOMContentLoaded', function () {
    initHeroEntrance();
    initHeaderCurrency();
    initSearchWidget();
});

/* ---- Staggered hero entrance ------------------------------------- */
function initHeroEntrance() {
    const hero = document.getElementById('hero');
    if (!hero) return;
    // Next frame so the initial (hidden) state paints first
    requestAnimationFrame(() => hero.classList.add('hero-loaded'));
}

/* ---- Header currency toggle (syncs with main.js currency state) --- */
function initHeaderCurrency() {
    const buttons = document.querySelectorAll('.nav-currency button[data-currency]');
    if (!buttons.length) return;

    const saved = localStorage.getItem('preferredCurrency') || 'USD';
    setActive(saved);

    buttons.forEach((btn) => {
        btn.addEventListener('click', () => {
            const cur = btn.dataset.currency;
            localStorage.setItem('preferredCurrency', cur);

            // Reuse main.js globals when available
            if (typeof currentCurrency !== 'undefined') {
                // eslint-disable-next-line no-global-assign
                currentCurrency = cur;
            }
            if (typeof updateCurrencyButton === 'function') updateCurrencyButton();
            if (typeof updateAllPrices === 'function') updateAllPrices();

            setActive(cur);
        });
    });

    function setActive(cur) {
        buttons.forEach((b) => b.classList.toggle('active', b.dataset.currency === cur));
    }
}

/* ---- Tabbed live search widget ----------------------------------- */
function initSearchWidget() {
    const widget = document.querySelector('.search-widget');
    if (!widget || !window.EliteAPI) return;

    const container = document.getElementById('hero-search');
    const input = document.getElementById('hero-search-input');
    const filter = document.getElementById('hero-search-filter');
    const button = document.getElementById('hero-search-btn');
    const preview = document.getElementById('hero-search-preview');
    const tabs = widget.querySelectorAll('.search-tab');

    let mode = 'experiences';

    // eslint-disable-next-line no-use-before-define
    const MODES = {
        experiences: {
            placeholder: 'Search safaris, cultural tours, nightlife…',
            showFilter: true,
            button: 'Explore'
        },
        guides: {
            placeholder: 'Search guides by name, city, or language…',
            showFilter: false,
            button: 'Find Guides'
        },
        services: {
            placeholder: 'Airport pickup, car hire, private security…',
            showFilter: false,
            button: 'Request'
        }
    };

    // Tab switching
    tabs.forEach((tab) => {
        tab.addEventListener('click', () => {
            tabs.forEach((t) => t.classList.remove('active'));
            tab.classList.add('active');
            mode = tab.dataset.searchMode;
            const cfg = MODES[mode];
            input.value = '';
            input.placeholder = cfg.placeholder;
            filter.style.display = cfg.showFilter ? '' : 'none';
            button.innerHTML = `<i class="fas fa-search"></i> ${cfg.button}`;
            closePreview();
            input.focus();
        });
    });

    // Initial placeholder matches the default (experiences) tab
    input.placeholder = MODES.experiences.placeholder;

    // Focus glow
    container.addEventListener('focusin', () => container.classList.add('focused'));
    container.addEventListener('focusout', () => {
        // Delay so clicks on preview items register first
        setTimeout(() => {
            if (!container.contains(document.activeElement)) container.classList.remove('focused');
        }, 120);
    });

    // Live preview (debounced)
    let debounce;
    input.addEventListener('input', () => {
        clearTimeout(debounce);
        const q = input.value.trim();
        if (mode === 'services') { closePreview(); return; }
        if (q.length < 2) { closePreview(); return; }
        debounce = setTimeout(() => runPreview(q), 280);
    });

    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') { e.preventDefault(); submit(); }
        if (e.key === 'Escape') closePreview();
    });
    button.addEventListener('click', submit);

    document.addEventListener('click', (e) => {
        if (!container.contains(e.target)) closePreview();
    });

    async function runPreview(q) {
        try {
            if (mode === 'guides') {
                const res = await EliteAPI.getGuides({ limit: 4 });
                const guides = (res.data.guides || []).filter((g) => matchGuide(g, q));
                renderGuides(guides.slice(0, 4));
            } else {
                const params = { limit: 5 };
                if (filter.value) params.category = filter.value;
                const res = await EliteAPI.getExperiences(params);
                const list = (res.data.experiences || []).filter((x) => matchExp(x, q));
                renderExperiences(list.slice(0, 5));
            }
        } catch (err) {
            preview.innerHTML = `<div class="search-preview-empty">Search is warming up — press Enter to see all results.</div>`;
            openPreview();
        }
    }

    function matchExp(x, q) {
        const t = `${x.title} ${x.location} ${x.category}`.toLowerCase();
        return t.includes(q.toLowerCase());
    }
    function matchGuide(g, q) {
        const name = g.user ? `${g.user.firstName} ${g.user.lastName}` : '';
        const t = `${name} ${g.region} ${(g.languages || []).join(' ')} ${(g.specializations || []).join(' ')}`.toLowerCase();
        return t.includes(q.toLowerCase());
    }

    function renderExperiences(list) {
        if (!list.length) return renderEmpty('experiences.html');
        const esc = EliteAPI.escapeHtml;
        preview.innerHTML =
            list.map((x) => `
                <a class="search-preview-item" href="booking.html?experience_id=${esc(x.id)}">
                    <img src="${sceneFor(x)}" alt="" onerror="this.style.visibility='hidden'">
                    <div class="sp-body">
                        <div class="sp-title">${esc(x.title)}</div>
                        <div class="sp-meta"><i class="fas fa-map-marker-alt"></i> ${esc(x.location)} · ${cap(x.category)}</div>
                    </div>
                    <div class="sp-price">${EliteAPI.formatMoney(x.pricePerPerson, localStorage.getItem('preferredCurrency') || 'USD')}</div>
                </a>`).join('') +
            footer('experiences.html', 'View all experiences');
        openPreview();
    }

    function renderGuides(list) {
        if (!list.length) return renderEmpty('guides.html');
        const esc = EliteAPI.escapeHtml;
        preview.innerHTML =
            list.map((g) => {
                const name = g.user ? `${g.user.firstName} ${g.user.lastName}` : 'Local guide';
                return `
                <a class="search-preview-item" href="guides.html">
                    <img src="${g.user && g.user.avatar ? esc(g.user.avatar) : 'images/user-avatar.svg'}" alt="" onerror="this.src='images/user-avatar.svg'">
                    <div class="sp-body">
                        <div class="sp-title">${esc(name)}</div>
                        <div class="sp-meta"><i class="fas fa-map-marker-alt"></i> ${esc(g.region || 'Kenya')} · ${esc((g.languages || []).slice(0,3).join(', '))}</div>
                    </div>
                    <div class="sp-price"><i class="fas fa-star" style="color:#D97706"></i> ${Number(g.rating || 0).toFixed(1)}</div>
                </a>`;
            }).join('') +
            footer('guides.html', 'View all guides');
        openPreview();
    }

    function renderEmpty(href) {
        preview.innerHTML = `<div class="search-preview-empty">No quick matches — <a href="${href}" style="color:var(--savannah-green-dark);font-weight:700;">browse everything →</a></div>`;
        openPreview();
    }

    function footer(href, label) {
        return `<div class="search-preview-foot"><a href="${href}">${label} →</a></div>`;
    }

    function submit() {
        const q = encodeURIComponent(input.value.trim());
        if (mode === 'guides') {
            window.location.href = 'guides.html';
        } else if (mode === 'services') {
            window.location.href = 'services.html';
        } else {
            const cat = filter.value ? `&category=${encodeURIComponent(filter.value)}` : '';
            window.location.href = `experiences.html?q=${q}${cat}`;
        }
    }

    function openPreview() { preview.classList.add('open'); }
    function closePreview() { preview.classList.remove('open'); preview.innerHTML = ''; }

    function sceneFor(x) {
        const t = `${x.category} ${x.location} ${x.title}`.toLowerCase();
        if (/(mara|safari|wildlife|game)/.test(t)) return 'images/scene-maasai-mara.jpg';
        if (/(beach|diani|coast|dhow|mombasa|lamu)/.test(t)) return 'images/scene-diani.jpg';
        if (/(amboseli|kilimanjaro|mountain|photo)/.test(t)) return 'images/scene-amboseli.jpg';
        return 'images/scene-hero.jpg';
    }
    function cap(s) { return s ? s.charAt(0).toUpperCase() + s.slice(1) : ''; }
}
