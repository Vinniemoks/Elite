// Main JavaScript for Kenya Unfiltered Platform
// Enhanced with currency toggle, mobile menu, search, and interactive features

// Currency Exchange Rate (Update daily via API in production)
const EXCHANGE_RATE = 150; // 1 USD = 150 KES (example rate)
let currentCurrency = 'USD'; // Default currency

document.addEventListener('DOMContentLoaded', function() {
    initializeMobileMenu();
    initializeNavbarScroll();
    initializeSmoothScrolling();
    initializeCurrencyToggle();
    initializeSearch();
    initializeTestimonialSlider();
    initializeAnimations();
    initializeUserMenu();
    initializeCookieConsent();
});

// Mobile Menu Toggle with Animation
function initializeMobileMenu() {
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');
    const authButtons = document.querySelector('.auth-buttons');
    
    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', function() {
            const icon = this.querySelector('i');
            navLinks.classList.toggle('show');
            authButtons.classList.toggle('show');
            
            // Toggle icon between bars and times
            if (icon.classList.contains('fa-bars')) {
                icon.classList.remove('fa-bars');
                icon.classList.add('fa-times');
            } else {
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }
        });

        // Close mobile menu when clicking outside
        document.addEventListener('click', function(e) {
            if (!e.target.closest('.navbar')) {
                navLinks.classList.remove('show');
                authButtons.classList.remove('show');
                const icon = mobileMenuBtn.querySelector('i');
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }
        });
    }
}

// Enhanced Navbar Scroll Effect
function initializeNavbarScroll() {
    const navbar = document.querySelector('.navbar');
    let lastScroll = 0;
    
    window.addEventListener('scroll', function() {
        const currentScroll = window.pageYOffset;
        
        if (currentScroll > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
        
        // Hide navbar on scroll down, show on scroll up
        if (currentScroll > lastScroll && currentScroll > 500) {
            navbar.style.transform = 'translateY(-100%)';
        } else {
            navbar.style.transform = 'translateY(0)';
        }
        
        lastScroll = currentScroll;
    });
}

// Smooth Scrolling for Anchor Links
function initializeSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#' || targetId === '#!') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                e.preventDefault();
                const offsetTop = targetElement.offsetTop - 80;
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// Currency Toggle Functionality (USD/KES)
function initializeCurrencyToggle() {
    // Create currency toggle button if not exists
    const authButtons = document.querySelector('.auth-buttons');
    if (authButtons && !document.querySelector('.currency-toggle')) {
        const currencyToggle = document.createElement('button');
        currencyToggle.className = 'currency-toggle';
        currencyToggle.innerHTML = '<i class="fas fa-dollar-sign"></i> USD';
        currencyToggle.setAttribute('aria-label', 'Toggle currency');
        authButtons.insertBefore(currencyToggle, authButtons.firstChild);
        
        currencyToggle.addEventListener('click', toggleCurrency);
    }
    
    // Initialize prices on page load
    updateAllPrices();
}

function toggleCurrency() {
    currentCurrency = currentCurrency === 'USD' ? 'KES' : 'USD';
    const toggleBtn = document.querySelector('.currency-toggle');
    
    if (currentCurrency === 'USD') {
        toggleBtn.innerHTML = '<i class="fas fa-dollar-sign"></i> USD';
    } else {
        toggleBtn.innerHTML = 'KES';
    }
    
    updateAllPrices();
    
    // Save preference to localStorage
    localStorage.setItem('preferredCurrency', currentCurrency);
}

function updateAllPrices() {
    document.querySelectorAll('[data-price-usd]').forEach(element => {
        const priceUSD = parseFloat(element.getAttribute('data-price-usd'));
        const priceKES = Math.round(priceUSD * EXCHANGE_RATE);
        
        if (currentCurrency === 'USD') {
            element.textContent = `$${priceUSD.toFixed(2)}`;
        } else {
            element.textContent = `KSh ${priceKES.toLocaleString()}`;
        }
    });
}

// Enhanced Search Functionality
function initializeSearch() {
    const searchInput = document.querySelector('.search-container input');
    const searchButton = document.querySelector('.search-container button');
    const searchSelect = document.querySelector('.search-container select');
    
    if (searchButton) {
        searchButton.addEventListener('click', performSearch);
    }
    
    if (searchInput) {
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                performSearch();
            }
        });
        
        // Add search suggestions (can be enhanced with API)
        searchInput.addEventListener('input', function() {
            // Placeholder for search suggestions
        });
    }
}

function performSearch() {
    const searchInput = document.querySelector('.search-container input');
    const searchSelect = document.querySelector('.search-container select');
    
    if (searchInput && searchInput.value.trim() !== '') {
        const query = encodeURIComponent(searchInput.value.trim());
        const category = searchSelect ? searchSelect.value : '';
        
        // Redirect to search results page (to be created)
        window.location.href = `search.html?q=${query}&category=${category}`;
    }
}

// Enhanced Testimonial Slider
function initializeTestimonialSlider() {
    const testimonials = document.querySelectorAll('.testimonial');
    if (testimonials.length === 0) return;
    
    let currentIndex = 0;
    const slider = document.querySelector('.testimonial-slider');
    
    // Create navigation dots
    const dotsContainer = document.createElement('div');
    dotsContainer.className = 'testimonial-dots';
    testimonials.forEach((_, index) => {
        const dot = document.createElement('button');
        dot.className = index === 0 ? 'dot active' : 'dot';
        dot.setAttribute('aria-label', `Go to testimonial ${index + 1}`);
        dot.addEventListener('click', () => goToTestimonial(index));
        dotsContainer.appendChild(dot);
    });
    
    if (slider) {
        slider.appendChild(dotsContainer);
    }
    
    // Auto-rotate testimonials
    setInterval(() => {
        currentIndex = (currentIndex + 1) % testimonials.length;
        goToTestimonial(currentIndex);
    }, 6000);
    
    function goToTestimonial(index) {
        testimonials.forEach((testimonial, i) => {
            testimonial.style.opacity = i === index ? '1' : '0';
            testimonial.style.display = i === index ? 'block' : 'none';
        });
        
        document.querySelectorAll('.testimonial-dots .dot').forEach((dot, i) => {
            dot.classList.toggle('active', i === index);
        });
        
        currentIndex = index;
    }
}

// Scroll Animations
function initializeAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    // Observe elements for animation
    document.querySelectorAll('.feature-card, .experience-card, .guide-card, .step').forEach(el => {
        el.classList.add('animate-on-scroll');
        observer.observe(el);
    });
}

// User Menu Dropdown
function initializeUserMenu() {
    const userMenu = document.querySelector('.user-menu');
    if (userMenu) {
        userMenu.addEventListener('click', function(e) {
            e.stopPropagation();
            this.classList.toggle('active');
        });
        
        document.addEventListener('click', function() {
            userMenu.classList.remove('active');
        });
    }
}

// Cookie Consent Banner
function initializeCookieConsent() {
    if (!localStorage.getItem('cookieConsent')) {
        const banner = document.createElement('div');
        banner.className = 'cookie-consent';
        banner.innerHTML = `
            <div class="cookie-content">
                <p>We use cookies to enhance your experience. By continuing to visit this site you agree to our use of cookies. <a href="privacy.html">Learn more</a></p>
                <button class="btn btn-primary" id="accept-cookies">Accept</button>
            </div>
        `;
        document.body.appendChild(banner);
        
        document.getElementById('accept-cookies').addEventListener('click', function() {
            localStorage.setItem('cookieConsent', 'true');
            banner.remove();
        });
    }
}

// Utility Functions
function formatPrice(amount, currency = 'USD') {
    if (currency === 'USD') {
        return `$${amount.toFixed(2)}`;
    } else {
        return `KSh ${Math.round(amount * EXCHANGE_RATE).toLocaleString()}`;
    }
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Load user's preferred currency from localStorage
if (localStorage.getItem('preferredCurrency')) {
    currentCurrency = localStorage.getItem('preferredCurrency');
}