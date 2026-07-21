// Booking Page - real API integration
// Loads the experience from ?experience_id=<uuid> and creates real bookings.

let currentExperience = null;
const SERVICE_FEE_PERCENT = 0.10;

document.addEventListener('DOMContentLoaded', async function() {
    initializeDatePicker();
    initializeBookingForm();

    await loadExperience();
    initializeGuestCounter();
    updatePriceBreakdown();
});

// Load experience details from the API and render the summary panel
async function loadExperience() {
    const params = new URLSearchParams(window.location.search);
    let experienceId = params.get('experience_id');

    try {
        if (!experienceId) {
            // No id given: fall back to the first active experience
            const list = await EliteAPI.getExperiences({ limit: 1 });
            if (!list.data.experiences.length) throw new Error('No experiences available');
            currentExperience = list.data.experiences[0];
        } else {
            const result = await EliteAPI.getExperience(experienceId);
            currentExperience = result.data;
        }
    } catch (error) {
        console.error('Failed to load experience:', error);
        showBookingMessage('We could not load this experience. Please go back and try again.', 'error');
        return;
    }

    renderExperienceSummary(currentExperience);
}

function renderExperienceSummary(exp) {
    const esc = EliteAPI.escapeHtml;

    const title = document.querySelector('.experience-details h2');
    if (title) title.textContent = exp.title;

    const location = document.querySelector('.experience-location');
    if (location) location.innerHTML = `<i class="fas fa-map-marker-alt"></i> ${esc(exp.location)}`;

    const badge = document.querySelector('.experience-badge');
    if (badge) badge.textContent = exp.category.charAt(0).toUpperCase() + exp.category.slice(1);

    const description = document.querySelector('.experience-description p');
    if (description) description.textContent = exp.description;

    if (exp.guide && exp.guide.user) {
        const guideName = document.querySelector('.guide-name');
        if (guideName) guideName.textContent = `Guided by ${exp.guide.user.firstName} ${exp.guide.user.lastName}`;
        const guideRating = document.querySelector('.guide-rating span');
        if (guideRating) guideRating.textContent = `(${exp.guide.reviewCount || 0} reviews, ${Number(exp.guide.rating).toFixed(1)}★)`;
    }

    // Highlights -> inclusions
    const highlights = document.querySelector('.experience-highlights ul');
    if (highlights && exp.inclusions && exp.inclusions.length) {
        highlights.innerHTML = exp.inclusions
            .map(item => `<li><i class="fas fa-check"></i> ${esc(item)}</li>`)
            .join('');
    }

    const includesGrid = document.querySelector('.includes-grid');
    if (includesGrid) {
        const included = (exp.inclusions || [])
            .map(item => `<div class="include-item"><i class="fas fa-check-circle"></i><span>${esc(item)}</span></div>`);
        const excluded = (exp.exclusions || [])
            .map(item => `<div class="include-item"><i class="fas fa-times-circle"></i><span>${esc(item)}</span></div>`);
        includesGrid.innerHTML = included.concat(excluded).join('');
    }

    // Guest limit
    const guestsInput = document.getElementById('guests');
    if (guestsInput) {
        guestsInput.setAttribute('max', exp.maxGroupSize);
        if (parseInt(guestsInput.value, 10) > exp.maxGroupSize) {
            guestsInput.value = exp.maxGroupSize;
        }
    }
    const guestLimit = document.querySelector('.guest-limit');
    if (guestLimit) guestLimit.textContent = `Maximum ${exp.maxGroupSize} guests`;

    updatePriceBreakdown();
}

// Guest Counter Functionality
function initializeGuestCounter() {
    const guestsInput = document.getElementById('guests');
    const minusBtn = document.querySelector('.minus-btn');
    const plusBtn = document.querySelector('.plus-btn');

    if (!guestsInput || !minusBtn || !plusBtn) return;

    minusBtn.addEventListener('click', function(e) {
        e.preventDefault();
        const minGuests = parseInt(guestsInput.getAttribute('min'), 10) || 1;
        const currentValue = parseInt(guestsInput.value, 10);
        if (currentValue > minGuests) {
            guestsInput.value = currentValue - 1;
            updatePriceBreakdown();
        }
    });

    plusBtn.addEventListener('click', function(e) {
        e.preventDefault();
        const maxGuests = parseInt(guestsInput.getAttribute('max'), 10) || 6;
        const currentValue = parseInt(guestsInput.value, 10);
        if (currentValue < maxGuests) {
            guestsInput.value = currentValue + 1;
            updatePriceBreakdown();
        }
    });
}

// Date Picker Initialization
function initializeDatePicker() {
    const dateInput = document.getElementById('date');
    if (!dateInput) return;

    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    dateInput.setAttribute('min', tomorrow);
}

// Price Calculation
function updatePriceBreakdown() {
    const guestsInput = document.getElementById('guests');
    if (!guestsInput) return;

    const numberOfGuests = parseInt(guestsInput.value, 10) || 1;
    const pricePerPerson = currentExperience ? Number(currentExperience.pricePerPerson) : 0;

    const subtotal = pricePerPerson * numberOfGuests;
    const serviceFee = subtotal * SERVICE_FEE_PERCENT;
    const total = subtotal + serviceFee;

    const priceBreakdown = document.querySelector('.price-breakdown');
    if (!priceBreakdown) return;

    const priceItems = priceBreakdown.querySelectorAll('.price-item');
    if (priceItems.length >= 2) {
        priceItems[0].innerHTML = `
            <span>$${pricePerPerson.toFixed(2)} x ${numberOfGuests} guest${numberOfGuests > 1 ? 's' : ''}</span>
            <span>$${subtotal.toFixed(2)}</span>
        `;
        priceItems[1].innerHTML = `
            <span>Service fee</span>
            <span>$${serviceFee.toFixed(2)}</span>
        `;
    }

    const priceTotal = priceBreakdown.querySelector('.price-total');
    if (priceTotal) {
        priceTotal.innerHTML = `
            <span>Total</span>
            <span>$${total.toFixed(2)}</span>
        `;
    }
}

// Booking Form Submission
function initializeBookingForm() {
    const bookingForm = document.getElementById('booking-form');
    if (!bookingForm) return;

    bookingForm.addEventListener('submit', handleBookingSubmit);
}

async function handleBookingSubmit(e) {
    e.preventDefault();

    const form = e.target;
    const formData = new FormData(form);

    if (!validateBookingForm(form)) return;

    // Booking requires an account
    if (!EliteAPI.isLoggedIn()) {
        const returnTo = encodeURIComponent(window.location.pathname.split('/').pop() + window.location.search);
        window.location.href = `login.html?redirect=${returnTo}`;
        return;
    }

    if (!currentExperience) {
        showBookingMessage('Experience details are still loading. Please try again in a moment.', 'error');
        return;
    }

    const submitButton = form.querySelector('button[type="submit"]');
    const originalButtonText = submitButton.textContent;
    submitButton.disabled = true;
    submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';

    try {
        const result = await EliteAPI.createBooking({
            experienceId: currentExperience.id,
            bookingDate: formData.get('date'),
            startTime: formData.get('time'),
            guestCount: parseInt(formData.get('guests'), 10),
            notes: formData.get('special-requests') || undefined
        });

        showBookingMessage(
            'Booking confirmed! Your guide will be in touch shortly. Redirecting to your dashboard...',
            'success'
        );
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 2000);
    } catch (error) {
        console.error('Booking error:', error);
        showBookingMessage(error.message, 'error');
        submitButton.disabled = false;
        submitButton.textContent = originalButtonText;
    }
}

function validateBookingForm(form) {
    const date = form.querySelector('#date').value;
    const time = form.querySelector('#time').value;
    const guests = form.querySelector('#guests').value;
    const payment = form.querySelector('input[name="payment"]:checked');

    if (!date) {
        showBookingMessage('Please select a date', 'error');
        return false;
    }
    if (!time) {
        showBookingMessage('Please select a time', 'error');
        return false;
    }
    if (!guests || guests < 1) {
        showBookingMessage('Please select number of guests', 'error');
        return false;
    }
    if (!payment) {
        showBookingMessage('Please select a payment method', 'error');
        return false;
    }
    return true;
}

function showBookingMessage(message, type) {
    let messageDiv = document.getElementById('booking-message');
    if (!messageDiv) {
        messageDiv = document.createElement('div');
        messageDiv.id = 'booking-message';
        messageDiv.setAttribute('role', 'alert');
        const formCard = document.querySelector('.form-card');
        if (formCard) formCard.prepend(messageDiv);
    }

    const styles = type === 'success'
        ? 'background:#e6f4ea;color:#1e7e34;border:1px solid #b7e0c2;'
        : 'background:#fdecea;color:#b3261e;border:1px solid #f5c6c2;';
    messageDiv.style.cssText = `${styles}padding:10px 14px;border-radius:6px;margin-bottom:14px;font-size:14px;`;
    messageDiv.textContent = message;
    messageDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}
