// Experiences page - live listings from the API
// Renders bookable experiences at the top of the grid and wires the filters.

document.addEventListener('DOMContentLoaded', function () {
    const container = document.getElementById('live-experiences');
    if (!container || !window.EliteAPI) return;

    // Honor filters passed from the homepage search (?category=...)
    const urlParams = new URLSearchParams(window.location.search);
    const presetCategory = urlParams.get('category');
    const categorySelect = document.getElementById('category');
    if (presetCategory && categorySelect) categorySelect.value = presetCategory;

    loadLiveExperiences();

    const filterBtn = document.querySelector('.filter-btn');
    if (filterBtn) {
        filterBtn.addEventListener('click', function (e) {
            e.preventDefault();
            loadLiveExperiences();
        });
    }

    async function loadLiveExperiences() {
        const params = { limit: 24 };
        const category = document.getElementById('category');
        const location = document.getElementById('location');
        if (category && category.value) params.category = category.value;
        if (location && location.value) params.location = location.value;

        try {
            const result = await EliteAPI.getExperiences(params);
            renderExperiences(result.data.experiences);
        } catch (error) {
            console.warn('Live experiences unavailable:', error.message);
            // Leave the static showcase cards as the fallback
        }
    }

    function renderExperiences(experiences) {
        const esc = EliteAPI.escapeHtml;

        if (!experiences.length) {
            container.innerHTML = `
                <div class="experience-card" style="grid-column:1/-1;text-align:center;padding:30px;">
                    <p>No bookable experiences match those filters yet — try different filters, or browse the ideas below.</p>
                </div>`;
            return;
        }

        container.innerHTML = experiences.map(exp => {
            const guideName = exp.guide && exp.guide.user
                ? `${exp.guide.user.firstName} ${exp.guide.user.lastName}`
                : 'Local guide';
            const rating = exp.guide ? Number(exp.guide.rating).toFixed(1) : null;
            const price = Number(exp.pricePerPerson);

            return `
            <div class="experience-card live-card">
                <div class="experience-img">
                    <img src="${exp.images && exp.images[0] ? esc(exp.images[0]) : sceneFor(exp)}" alt="${esc(exp.title)}">
                    <div class="experience-badge">${esc(capitalize(exp.category))}</div>
                </div>
                <div class="experience-content">
                    <h3>${esc(exp.title)}</h3>
                    <p class="experience-location"><i class="fas fa-map-marker-alt"></i> ${esc(exp.location)}</p>
                    <p class="experience-description">${esc(truncate(exp.description, 160))}</p>
                    <div class="experience-details">
                        <div class="detail">
                            <i class="fas fa-clock"></i>
                            <span>${formatDuration(exp.duration)}</span>
                        </div>
                        <div class="detail">
                            <i class="fas fa-user-friends"></i>
                            <span>Up to ${exp.maxGroupSize} people</span>
                        </div>
                        <div class="detail">
                            <i class="fas fa-user"></i>
                            <span>${esc(guideName)}${rating ? ` · ${rating}★` : ''}</span>
                        </div>
                    </div>
                    <div class="experience-footer">
                        <div class="price">
                            <span class="amount" data-price-usd="${price}">$${price.toFixed(2)}</span>
                            <span class="per">per person</span>
                        </div>
                        <a href="booking.html?experience_id=${esc(exp.id)}" class="btn btn-primary">Book Now</a>
                    </div>
                </div>
            </div>`;
        }).join('');

        // Re-apply saved currency preference to newly rendered prices
        if (typeof updateAllPrices === 'function') updateAllPrices();
    }

    // Pick a realistic scene image matching the experience when it has no photos
    function sceneFor(exp) {
        const text = `${exp.category} ${exp.location} ${exp.title}`.toLowerCase();
        if (/(mara|safari|wildlife|game)/.test(text)) return 'images/scene-maasai-mara.svg';
        if (/(beach|diani|coast|dhow|mombasa|lamu)/.test(text)) return 'images/scene-diani.svg';
        if (/(amboseli|kilimanjaro|mountain|photo)/.test(text)) return 'images/scene-amboseli.svg';
        return 'images/scene-hero.svg';
    }

    function capitalize(value) {
        return value ? value.charAt(0).toUpperCase() + value.slice(1) : '';
    }

    function truncate(text, max) {
        return text && text.length > max ? text.slice(0, max - 1) + '…' : text;
    }

    function formatDuration(minutes) {
        if (!minutes) return 'Flexible';
        if (minutes < 60) return `${minutes} min`;
        if (minutes < 60 * 12) return `${Math.round(minutes / 60)} hours`;
        const days = Math.round(minutes / (60 * 24));
        return days <= 1 ? 'Full day' : `${days} days`;
    }
});
