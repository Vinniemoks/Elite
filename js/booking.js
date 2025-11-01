// Booking Page Functionality

document.addEventListener('DOMContentLoaded', function() {
    initializeGuestCounter();
    initializeDatePicker();
    initializePriceCalculation();
    initializeBookingForm();
});

// Guest Counter Functionality
function initializeGuestCounter() {
    const guestsInput = document.getElementById('guests');
    const minusBtn = document.querySelector('.minus-btn');
    const plusBtn = document.querySelector('.plus-btn');
    
    if (!guestsInput || !minusBtn || !plusBtn) return;
    
    const maxGuests = parseInt(guestsInput.getAttribute('max')) || 6;
    const minGuests = parseInt(guestsInput.getAttribute('min')) || 1;
    
    minusBtn.addEventListener('click', function(e) {
        e.preventDefault();
        let currentValue = parseInt(guestsInput.value);
        if (currentValue > minGuests) {
            guestsInput.value = currentValue - 1;
            updatePriceBreakdown();
        }
    });
    
    plusBtn.addEventListener('click', function(e) {
        e.preventDefault();
        let currentValue = parseInt(guestsInput.value);
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
    
    // Set minimum date to today
    const today = new Date().toISOString().split('T')[0];
    dateInput.setAttribute('min', today);
    
    // Update available times when date changes
    dateInput.addEventListener('change', function() {
        updateAvailableTimes();
    });
}

// Update available times based on selected date
function updateAvailableTimes() {
    const timeSelect = document.getElementById('time');
    if (!timeSelect) return;
    
    // In production, fetch available times from API
    // For now, show default times
    console.log('Fetching available times...');
}

// Price Calculation
function initializePriceCalculation() {
    updatePriceBreakdown();
}

function updatePriceBreakdown() {
    const guestsInput = document.getElementById('guests');
    if (!guestsInput) return;
    
    const numberOfGuests = parseInt(guestsInput.value) || 1;
    const pricePerPerson = 17.00; // Base price in USD
    const serviceFeePercent = 0.10; // 10% service fee
    
    const subtotal = pricePerPerson * numberOfGuests;
    const serviceFee = subtotal * serviceFeePercent;
    const total = subtotal + serviceFee;
    
    // Update price breakdown display
    const priceBreakdown = document.querySelector('.price-breakdown');
    if (priceBreakdown) {
        const priceItems = priceBreakdown.querySelectorAll('.price-item');
        if (priceItems.length >= 2) {
            // Update subtotal
            priceItems[0].innerHTML = `
                <span>$${pricePerPerson.toFixed(2)} x ${numberOfGuests} guest${numberOfGuests > 1 ? 's' : ''}</span>
                <span>$${subtotal.toFixed(2)}</span>
            `;
            
            // Update service fee
            priceItems[1].innerHTML = `
                <span>Service fee</span>
                <span>$${serviceFee.toFixed(2)}</span>
            `;
        }
        
        // Update total
        const priceTotal = priceBreakdown.querySelector('.price-total');
        if (priceTotal) {
            priceTotal.innerHTML = `
                <span>Total</span>
                <span>$${total.toFixed(2)}</span>
            `;
        }
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
    
    // Validate form
    if (!validateBookingForm(form)) {
        return;
    }
    
    // Show loading state
    const submitButton = form.querySelector('button[type="submit"]');
    const originalButtonText = submitButton.textContent;
    submitButton.disabled = true;
    submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
    
    // Prepare booking data
    const bookingData = {
        experience_id: getExperienceIdFromURL(),
        booking_date: formData.get('date'),
        booking_time: formData.get('time'),
        number_of_guests: parseInt(formData.get('guests')),
        special_requests: formData.get('special-requests'),
        payment_method: formData.get('payment')
    };
    
    try {
        // In production, send to API
        // const response = await fetch('/api/bookings', {
        //     method: 'POST',
        //     headers: {
        //         'Content-Type': 'application/json',
        //         'Authorization': `Bearer ${getAuthToken()}`
        //     },
        //     body: JSON.stringify(bookingData)
        // });
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Success - redirect to payment or confirmation
        window.location.href = 'booking-confirmation.html?id=123';
        
    } catch (error) {
        console.error('Booking error:', error);
        alert('There was an error processing your booking. Please try again.');
        
        // Reset button
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
        alert('Please select a date');
        return false;
    }
    
    if (!time) {
        alert('Please select a time');
        return false;
    }
    
    if (!guests || guests < 1) {
        alert('Please select number of guests');
        return false;
    }
    
    if (!payment) {
        alert('Please select a payment method');
        return false;
    }
    
    return true;
}

function getExperienceIdFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('experience_id') || 'default-experience-id';
}

function getAuthToken() {
    return localStorage.getItem('authToken') || '';
}
