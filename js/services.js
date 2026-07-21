// Full-package services page - card selection + service request form

document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('service-form');
    const typeSelect = document.getElementById('service-type');
    const cards = document.querySelectorAll('.service-card');
    if (!form || !window.EliteAPI) return;

    // Card click selects the matching service in the form
    function selectType(type) {
        typeSelect.value = type;
        cards.forEach(c => c.classList.toggle('selected', c.dataset.type === type));
    }

    cards.forEach(card => {
        card.addEventListener('click', function () {
            selectType(this.dataset.type);
            form.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    });

    typeSelect.addEventListener('change', () => selectType(typeSelect.value));

    // Preselect from ?type=... (used by homepage cards)
    const preset = new URLSearchParams(window.location.search).get('type');
    if (preset && [...typeSelect.options].some(o => o.value === preset)) {
        selectType(preset);
    } else {
        selectType(typeSelect.value);
    }

    // Prefill contact details for logged-in users
    const user = EliteAPI.getUser();
    if (user) {
        document.getElementById('svc-name').value = `${user.firstName} ${user.lastName || ''}`.trim();
        document.getElementById('svc-email').value = user.email;
    }

    // Earliest preferred date: today
    document.getElementById('svc-date').min = new Date().toISOString().split('T')[0];

    form.addEventListener('submit', async function (e) {
        e.preventDefault();

        const submitButton = form.querySelector('button[type="submit"]');
        const originalText = submitButton.textContent;

        const name = document.getElementById('svc-name').value.trim();
        const email = document.getElementById('svc-email').value.trim();
        if (!name || !email) {
            showServiceMessage('Please fill in your name and email.', 'error');
            return;
        }

        submitButton.disabled = true;
        submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';

        try {
            const result = await EliteAPI.sendServiceRequest({
                type: typeSelect.value,
                name,
                email,
                phone: document.getElementById('svc-phone').value.trim() || undefined,
                preferredDate: document.getElementById('svc-date').value || undefined,
                details: document.getElementById('svc-details').value.trim() || undefined
            });

            showServiceMessage(result.message, 'success');
            form.reset();
            selectType('AIRPORT_TRANSFER');
        } catch (error) {
            showServiceMessage(error.message, 'error');
        } finally {
            submitButton.disabled = false;
            submitButton.textContent = originalText;
        }
    });

    function showServiceMessage(message, type) {
        let div = document.getElementById('service-message');
        if (!div) {
            div = document.createElement('div');
            div.id = 'service-message';
            div.setAttribute('role', 'alert');
            form.parentElement.insertBefore(div, form);
        }
        const styles = type === 'success'
            ? 'background:#e6f4ea;color:#1e7e34;border:1px solid #b7e0c2;'
            : 'background:#fdecea;color:#b3261e;border:1px solid #f5c6c2;';
        div.style.cssText = `${styles}padding:12px 16px;border-radius:8px;margin-bottom:14px;`;
        div.textContent = message;
        div.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
});
