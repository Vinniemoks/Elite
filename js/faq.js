// FAQ Page Interactive Functionality

document.addEventListener('DOMContentLoaded', function() {
    initializeFAQAccordion();
    initializeFAQSearch();
    initializeFAQCategories();
});

// FAQ Accordion Functionality
function initializeFAQAccordion() {
    const faqQuestions = document.querySelectorAll('.faq-question');
    
    faqQuestions.forEach(question => {
        question.addEventListener('click', function() {
            const faqItem = this.parentElement;
            const isActive = faqItem.classList.contains('active');
            
            // Close all other FAQ items
            document.querySelectorAll('.faq-item').forEach(item => {
                item.classList.remove('active');
            });
            
            // Toggle current item
            if (!isActive) {
                faqItem.classList.add('active');
            }
        });
    });
}

// FAQ Search Functionality
function initializeFAQSearch() {
    const searchInput = document.getElementById('faq-search-input');
    
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase();
            const faqItems = document.querySelectorAll('.faq-item');
            let hasResults = false;
            
            faqItems.forEach(item => {
                const question = item.querySelector('.faq-question span').textContent.toLowerCase();
                const answer = item.querySelector('.faq-answer').textContent.toLowerCase();
                
                if (question.includes(searchTerm) || answer.includes(searchTerm)) {
                    item.style.display = 'block';
                    hasResults = true;
                    
                    // Highlight search term
                    if (searchTerm.length > 2) {
                        item.classList.add('highlight');
                    } else {
                        item.classList.remove('highlight');
                    }
                } else {
                    item.style.display = 'none';
                }
            });
            
            // Show "no results" message
            const noResults = document.querySelector('.no-results');
            if (!hasResults && searchTerm.length > 0) {
                if (!noResults) {
                    const message = document.createElement('div');
                    message.className = 'no-results';
                    message.innerHTML = '<p>No results found. Try different keywords or <a href="contact.html">contact us</a> for help.</p>';
                    document.querySelector('.faq-content').appendChild(message);
                }
            } else if (noResults) {
                noResults.remove();
            }
        });
    }
}

// FAQ Category Filtering
function initializeFAQCategories() {
    const categoryButtons = document.querySelectorAll('.faq-category-btn');
    
    categoryButtons.forEach(button => {
        button.addEventListener('click', function() {
            const category = this.getAttribute('data-category');
            
            // Update active button
            categoryButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            // Filter FAQ sections
            const faqSections = document.querySelectorAll('.faq-section');
            
            faqSections.forEach(section => {
                if (category === 'all' || section.getAttribute('data-category') === category) {
                    section.style.display = 'block';
                } else {
                    section.style.display = 'none';
                }
            });
        });
    });
}
