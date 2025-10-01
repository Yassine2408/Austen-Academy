// Loading Screen Management
window.addEventListener('load', function() {
    // Hide loading screen after everything is loaded
    const loadingScreen = document.getElementById('loading-screen');
    setTimeout(() => {
        loadingScreen.classList.add('fade-out');
        setTimeout(() => {
            loadingScreen.style.display = 'none';
        }, 500);
    }, 1500); // Show loading for at least 1.5 seconds
});

// DOM Content Loaded Event
document.addEventListener('DOMContentLoaded', function() {
    // Initialize all functionality
    initNavigation();
    initScrollEffects();
    initContactForm();
    initAnimations();
    initScrollIndicator();
    initCounterAnimations();
    initLazyLoading();
    initPWA();
});

// Navigation functionality
function initNavigation() {
    const navToggle = document.getElementById('nav-toggle');
    const navMenu = document.getElementById('nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');

    // Mobile menu toggle
    navToggle.addEventListener('click', function() {
        navMenu.classList.toggle('active');
        navToggle.classList.toggle('active');
    });

    // Close mobile menu when clicking on a link
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            navMenu.classList.remove('active');
            navToggle.classList.remove('active');
        });
    });

    // Smooth scrolling for navigation links
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                const headerHeight = document.querySelector('.header').offsetHeight;
                const targetPosition = targetSection.offsetTop - headerHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Active navigation link highlighting
    window.addEventListener('scroll', function() {
        let current = '';
        const sections = document.querySelectorAll('section');
        const scrollPosition = window.scrollY + 100;

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            
            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === '#' + current) {
                link.classList.add('active');
            }
        });
    });
}

// Scroll effects
function initScrollEffects() {
    const header = document.querySelector('.header');
    
    // Header background on scroll
    window.addEventListener('scroll', function() {
        if (window.scrollY > 100) {
            header.style.background = 'rgba(255, 255, 255, 0.98)';
            header.style.boxShadow = '0 2px 20px rgba(0, 74, 173, 0.15)';
        } else {
            header.style.background = 'rgba(255, 255, 255, 0.95)';
            header.style.boxShadow = '0 2px 20px rgba(0, 74, 173, 0.1)';
        }
    });

    // Intersection Observer for fade-in animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Observe elements for animation
    const animatedElements = document.querySelectorAll('.fact-card, .service-card, .contact-item, .testimonial-card, .pricing-card, .gallery-item');
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
}

// Contact form handling for Netlify Forms - NO REDIRECT VERSION
function initContactForm() {
    const contactForm = document.getElementById('contact-form');
    const submitButton = contactForm.querySelector('.submit-button');
    
    contactForm.addEventListener('submit', function(e) {
        // ALWAYS prevent default form submission to avoid redirect
        e.preventDefault();
        
        // Get form data for validation
        const name = contactForm.querySelector('input[name="name"]').value;
        const email = contactForm.querySelector('input[name="email"]').value;
        const phone = contactForm.querySelector('input[name="phone"]').value;
        const course = contactForm.querySelector('select[name="course"]').value;
        const message = contactForm.querySelector('textarea[name="message"]').value;
        
        // Client-side validation
        if (!name || !email || !phone || !course || !message) {
            showNotification('Veuillez remplir tous les champs obligatoires', 'error');
            return;
        }
        
        if (!isValidEmail(email)) {
            showNotification('Veuillez entrer une adresse email valide', 'error');
            return;
        }
        
        if (!isValidPhone(phone)) {
            showNotification('Veuillez entrer un numéro de téléphone valide', 'error');
            return;
        }
        
        // Show loading state
        submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Envoi en cours...';
        submitButton.disabled = true;
        
        // Submit to Netlify using fetch API (no redirect)
        submitToNetlify(contactForm).then(function(success) {
            if (success) {
                // Show success notification and reset form
                showBeautifulSuccessNotification();
                contactForm.reset();
            } else {
                // Show error notification
                showNotification('Erreur lors de l\'envoi. Veuillez réessayer.', 'error');
            }
        }).catch(function(error) {
            console.error('Form submission error:', error);
            showNotification('Erreur lors de l\'envoi. Veuillez réessayer.', 'error');
        }).finally(function() {
            // Reset button state
            submitButton.innerHTML = '<i class="fas fa-paper-plane"></i> Demander des informations';
            submitButton.disabled = false;
        });
    });
}

// Submit form to Netlify without redirect
function submitToNetlify(form) {
    return new Promise(function(resolve, reject) {
        // Create FormData object
        const formData = new FormData(form);
        
        // Submit to Netlify using fetch
        fetch('/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams(formData).toString()
        })
        .then(function(response) {
            if (response.ok) {
                resolve(true);
            } else {
                resolve(false);
            }
        })
        .catch(function(error) {
            reject(error);
        });
    });
}

// Beautiful success notification function
function showBeautifulSuccessNotification() {
    // Remove any existing notifications
    const existingNotification = document.querySelector('.beautiful-notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // Create beautiful notification
    const notification = document.createElement('div');
    notification.className = 'beautiful-notification';
    notification.innerHTML = `
        <div class="notification-content">
            <div class="success-icon">
                <i class="fas fa-check-circle"></i>
            </div>
            <div class="notification-text">
                <h3>Message envoyé avec succès!</h3>
                <p>Merci pour votre intérêt. Nous vous contacterons dans les plus brefs délais.</p>
            </div>
            <button class="notification-close">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;
    
    // Add beautiful styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #10b981, #059669);
        color: white;
        padding: 0;
        border-radius: 15px;
        box-shadow: 0 20px 40px rgba(16, 185, 129, 0.3);
        z-index: 10000;
        max-width: 400px;
        animation: slideInRight 0.5s ease;
        font-family: 'Montserrat', sans-serif;
        overflow: hidden;
    `;
    
    // Add animation styles
    if (!document.querySelector('#beautiful-notification-styles')) {
        const style = document.createElement('style');
        style.id = 'beautiful-notification-styles';
        style.textContent = `
            @keyframes slideInRight {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
            @keyframes slideOutRight {
                from {
                    transform: translateX(0);
                    opacity: 1;
                }
                to {
                    transform: translateX(100%);
                    opacity: 0;
                }
            }
            .beautiful-notification .notification-content {
                display: flex;
                align-items: center;
                padding: 20px;
                gap: 15px;
            }
            .beautiful-notification .success-icon {
                font-size: 2rem;
                color: white;
                animation: pulse 2s infinite;
            }
            .beautiful-notification .notification-text h3 {
                margin: 0 0 5px 0;
                font-size: 1.1rem;
                font-weight: 600;
            }
            .beautiful-notification .notification-text p {
                margin: 0;
                font-size: 0.9rem;
                opacity: 0.9;
                line-height: 1.4;
            }
            .beautiful-notification .notification-close {
                background: rgba(255, 255, 255, 0.2);
                border: none;
                color: white;
                cursor: pointer;
                padding: 8px;
                border-radius: 50%;
                transition: background 0.3s ease;
                margin-left: auto;
            }
            .beautiful-notification .notification-close:hover {
                background: rgba(255, 255, 255, 0.3);
            }
            @keyframes pulse {
                0%, 100% { transform: scale(1); }
                50% { transform: scale(1.1); }
            }
        `;
        document.head.appendChild(style);
    }
    
    // Add to page
    document.body.appendChild(notification);
    
    // Close button functionality
    const closeButton = notification.querySelector('.notification-close');
    closeButton.addEventListener('click', function() {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    });
    
    // Auto-remove after 8 seconds
    setTimeout(function() {
        if (notification.parentNode) {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }
    }, 8000);
}

// Security helper functions
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) && email.length <= 254;
}

function isValidPhone(phone) {
    // Moroccan phone number validation
    const phoneRegex = /^(\+212|0)[567]\d{8}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
}

function sanitizeInput(input) {
    // Basic XSS prevention
    if (typeof input !== 'string') return '';
    
    return input
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .replace(/\//g, '&#x2F;')
        .trim()
        .substring(0, 1000); // Limit length
}

// Rate limiting (basic client-side protection)
let lastSubmission = 0;
const RATE_LIMIT_MS = 30000; // 30 seconds between submissions

function checkRateLimit() {
    const now = Date.now();
    if (now - lastSubmission < RATE_LIMIT_MS) {
        return false;
    }
    lastSubmission = now;
    return true;
}

// Netlify Forms handles submission automatically
// No backend submission needed

// Notification system
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i>
            <span>${message}</span>
        </div>
        <button class="notification-close">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    // Add notification styles
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#004aad'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 10px;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
        z-index: 10000;
        display: flex;
        align-items: center;
        gap: 1rem;
        max-width: 400px;
        animation: slideInRight 0.3s ease;
        font-family: 'Montserrat', sans-serif;
    `;
    
    // Add animation keyframes
    if (!document.querySelector('#notification-styles')) {
        const style = document.createElement('style');
        style.id = 'notification-styles';
        style.textContent = `
            @keyframes slideInRight {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
            .notification-content {
                display: flex;
                align-items: center;
                gap: 0.5rem;
                flex: 1;
            }
            .notification-close {
                background: none;
                border: none;
                color: white;
                cursor: pointer;
                padding: 0.25rem;
                border-radius: 50%;
                transition: background 0.3s ease;
            }
            .notification-close:hover {
                background: rgba(255, 255, 255, 0.2);
            }
        `;
        document.head.appendChild(style);
    }
    
    // Add to page
    document.body.appendChild(notification);
    
    // Close button functionality
    const closeButton = notification.querySelector('.notification-close');
    closeButton.addEventListener('click', function() {
        notification.style.animation = 'slideInRight 0.3s ease reverse';
        setTimeout(() => notification.remove(), 300);
    });
    
    // Auto-remove after 5 seconds
    setTimeout(function() {
        if (notification.parentNode) {
            notification.style.animation = 'slideInRight 0.3s ease reverse';
            setTimeout(() => notification.remove(), 300);
        }
    }, 5000);
}

// Scroll indicator functionality
function initScrollIndicator() {
    const scrollIndicator = document.querySelector('.scroll-indicator');
    
    if (scrollIndicator) {
        scrollIndicator.addEventListener('click', function() {
            const aboutSection = document.querySelector('#about');
            if (aboutSection) {
                const headerHeight = document.querySelector('.header').offsetHeight;
                const targetPosition = aboutSection.offsetTop - headerHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
        
        // Hide scroll indicator after scrolling
        window.addEventListener('scroll', function() {
            if (window.scrollY > 200) {
                scrollIndicator.style.opacity = '0';
                scrollIndicator.style.pointerEvents = 'none';
            } else {
                scrollIndicator.style.opacity = '1';
                scrollIndicator.style.pointerEvents = 'auto';
            }
        });
    }
}

// Additional animations and interactions
function initAnimations() {
    // Service card hover effects
    const serviceCards = document.querySelectorAll('.service-card');
    serviceCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-10px) scale(1.02)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });
    
    // Fact card animations
    const factCards = document.querySelectorAll('.fact-card');
    factCards.forEach((card, index) => {
        card.style.animationDelay = `${index * 0.1}s`;
    });
    
    // CTA button pulse effect
    const ctaButton = document.querySelector('.cta-button');
    if (ctaButton) {
        setInterval(function() {
            ctaButton.style.animation = 'pulse 0.5s ease';
            setTimeout(() => {
                ctaButton.style.animation = '';
            }, 500);
        }, 5000);
    }
    
    // Add pulse animation
    if (!document.querySelector('#pulse-animation')) {
        const style = document.createElement('style');
        style.id = 'pulse-animation';
        style.textContent = `
            @keyframes pulse {
                0% { transform: scale(1); }
                50% { transform: scale(1.05); }
                100% { transform: scale(1); }
            }
        `;
        document.head.appendChild(style);
    }
}

// WhatsApp integration
function initWhatsAppIntegration() {
    // Add WhatsApp floating button
    const whatsappButton = document.createElement('a');
    whatsappButton.href = 'https://wa.me/212660368628';
    whatsappButton.target = '_blank';
    whatsappButton.className = 'whatsapp-float';
    whatsappButton.innerHTML = '<i class="fab fa-whatsapp"></i>';
    whatsappButton.title = 'Contactez-nous sur WhatsApp';
    
    // Style the WhatsApp button
    whatsappButton.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        width: 60px;
        height: 60px;
        background: #25d366;
        color: white;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.5rem;
        text-decoration: none;
        box-shadow: 0 4px 20px rgba(37, 211, 102, 0.4);
        z-index: 1000;
        transition: all 0.3s ease;
        animation: bounce 2s infinite;
    `;
    
    whatsappButton.addEventListener('mouseenter', function() {
        this.style.transform = 'scale(1.1)';
        this.style.boxShadow = '0 6px 25px rgba(37, 211, 102, 0.6)';
    });
    
    whatsappButton.addEventListener('mouseleave', function() {
        this.style.transform = 'scale(1)';
        this.style.boxShadow = '0 4px 20px rgba(37, 211, 102, 0.4)';
    });
    
    document.body.appendChild(whatsappButton);
}

// Initialize WhatsApp integration
setTimeout(initWhatsAppIntegration, 1000);

// Enhanced Lazy loading for images
function initLazyLoading() {
    const images = document.querySelectorAll('img[data-src]');
    
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                
                // Create a new image to preload
                const newImg = new Image();
                newImg.onload = function() {
                    // Once loaded, update the src and add loaded class
                    img.src = img.dataset.src;
                    img.classList.add('loaded');
                    img.classList.remove('lazy');
                };
                
                newImg.onerror = function() {
                    // Fallback if image fails to load
                    img.classList.add('loaded');
                    img.classList.remove('lazy');
                };
                
                newImg.src = img.dataset.src;
                imageObserver.unobserve(img);
            }
        });
    }, {
        rootMargin: '50px 0px', // Start loading 50px before image enters viewport
        threshold: 0.1
    });
    
    images.forEach(img => {
        imageObserver.observe(img);
        // Add placeholder background while loading
        img.style.background = 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)';
        img.style.backgroundSize = '200% 100%';
        img.style.animation = 'loading-shimmer 1.5s infinite';
    });
}

// PWA Initialization
function initPWA() {
    // Register Service Worker
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', function() {
            navigator.serviceWorker.register('/sw.js')
                .then(function(registration) {
                    console.log('SW registered: ', registration);
                    showNotification('Application prête pour une utilisation hors ligne!', 'info');
                })
                .catch(function(registrationError) {
                    console.log('SW registration failed: ', registrationError);
                });
        });
    }

    // Install prompt for PWA
    let deferredPrompt;
    
    window.addEventListener('beforeinstallprompt', (e) => {
        console.log('PWA install prompt available');
        e.preventDefault();
        deferredPrompt = e;
        
        // Show custom install button after 10 seconds
        setTimeout(() => {
            showInstallPrompt();
        }, 10000);
    });

    function showInstallPrompt() {
        if (deferredPrompt) {
            const installBanner = document.createElement('div');
            installBanner.className = 'install-banner';
            installBanner.innerHTML = `
                <div class="install-content">
                    <img src="Logo.jpeg" alt="Austen Academy" class="install-logo">
                    <div class="install-text">
                        <h4>Installer Austen Academy</h4>
                        <p>Accédez rapidement à nos formations</p>
                    </div>
                    <button class="install-btn" onclick="installPWA()">Installer</button>
                    <button class="install-close" onclick="closeInstallBanner()">×</button>
                </div>
            `;
            
            installBanner.style.cssText = `
                position: fixed;
                bottom: 20px;
                left: 20px;
                right: 20px;
                background: white;
                border-radius: 15px;
                box-shadow: 0 10px 30px rgba(0, 74, 173, 0.2);
                z-index: 1000;
                animation: slideUp 0.3s ease;
                max-width: 400px;
                margin: 0 auto;
            `;
            
            document.body.appendChild(installBanner);
            
            // Add styles for install banner
            if (!document.querySelector('#install-banner-styles')) {
                const style = document.createElement('style');
                style.id = 'install-banner-styles';
                style.textContent = `
                    @keyframes slideUp {
                        from { transform: translateY(100%); opacity: 0; }
                        to { transform: translateY(0); opacity: 1; }
                    }
                    .install-content {
                        display: flex;
                        align-items: center;
                        padding: 1rem;
                        gap: 1rem;
                    }
                    .install-logo {
                        width: 50px;
                        height: 50px;
                        border-radius: 10px;
                    }
                    .install-text h4 {
                        margin: 0;
                        color: #004aad;
                        font-size: 1rem;
                    }
                    .install-text p {
                        margin: 0;
                        color: #666;
                        font-size: 0.9rem;
                    }
                    .install-btn {
                        background: #004aad;
                        color: white;
                        border: none;
                        padding: 0.5rem 1rem;
                        border-radius: 20px;
                        font-weight: 600;
                        cursor: pointer;
                        font-size: 0.9rem;
                    }
                    .install-close {
                        background: none;
                        border: none;
                        font-size: 1.5rem;
                        color: #666;
                        cursor: pointer;
                        width: 30px;
                        height: 30px;
                        border-radius: 50%;
                    }
                    .install-close:hover {
                        background: #f0f0f0;
                    }
                `;
                document.head.appendChild(style);
            }
        }
    }

    // Global functions for install banner
    window.installPWA = function() {
        if (deferredPrompt) {
            deferredPrompt.prompt();
            deferredPrompt.userChoice.then((choiceResult) => {
                if (choiceResult.outcome === 'accepted') {
                    console.log('User accepted the install prompt');
                    showNotification('Application installée avec succès!', 'success');
                } else {
                    console.log('User dismissed the install prompt');
                }
                deferredPrompt = null;
                closeInstallBanner();
            });
        }
    };

    window.closeInstallBanner = function() {
        const banner = document.querySelector('.install-banner');
        if (banner) {
            banner.style.animation = 'slideUp 0.3s ease reverse';
            setTimeout(() => banner.remove(), 300);
        }
    };
}

// Performance optimization: debounce scroll events
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Apply debouncing to scroll events
const debouncedScrollHandler = debounce(function() {
    // Any expensive scroll operations can go here
}, 10);

window.addEventListener('scroll', debouncedScrollHandler);

// Accessibility improvements
function initAccessibility() {
    // Skip to main content link
    const skipLink = document.createElement('a');
    skipLink.href = '#main';
    skipLink.textContent = 'Passer au contenu principal';
    skipLink.className = 'skip-link';
    skipLink.style.cssText = `
        position: absolute;
        top: -40px;
        left: 6px;
        background: #004aad;
        color: white;
        padding: 8px;
        text-decoration: none;
        border-radius: 4px;
        z-index: 10001;
        transition: top 0.3s ease;
    `;
    
    skipLink.addEventListener('focus', function() {
        this.style.top = '6px';
    });
    
    skipLink.addEventListener('blur', function() {
        this.style.top = '-40px';
    });
    
    document.body.insertBefore(skipLink, document.body.firstChild);
    
    // Add main landmark
    const heroSection = document.querySelector('.hero');
    if (heroSection) {
        heroSection.setAttribute('id', 'main');
    }
}

// Initialize accessibility features
initAccessibility();

// Counter animations for key figures
function initCounterAnimations() {
    const counters = document.querySelectorAll('.figure-number');
    
    const observerOptions = {
        threshold: 0.5,
        rootMargin: '0px 0px -100px 0px'
    };
    
    const counterObserver = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const counter = entry.target;
                const target = parseInt(counter.getAttribute('data-target'));
                const increment = target / 100; // Adjust speed
                let current = 0;
                
                const updateCounter = () => {
                    if (current < target) {
                        current += increment;
                        counter.textContent = Math.ceil(current);
                        requestAnimationFrame(updateCounter);
                    } else {
                        counter.textContent = target;
                    }
                };
                
                updateCounter();
                counterObserver.unobserve(counter);
            }
        });
    }, observerOptions);
    
    counters.forEach(counter => {
        counterObserver.observe(counter);
    });
}

// Error handling
window.addEventListener('error', function(e) {
    console.error('JavaScript Error:', e.error);
    // In production, you might want to send this to an error tracking service
});

// Performance Monitoring
function initPerformanceOptimizations() {
    // Critical resource hints
    const criticalResources = [
        { href: 'Logo.jpeg', as: 'image' },
        { href: 'Austen Academy Students in Kénitra.png', as: 'image' }
    ];

    criticalResources.forEach(resource => {
        const link = document.createElement('link');
        link.rel = 'prefetch';
        link.href = resource.href;
        link.as = resource.as;
        document.head.appendChild(link);
    });

    // Measure and log performance metrics
    if ('performance' in window) {
        window.addEventListener('load', () => {
            setTimeout(() => {
                const perfData = performance.getEntriesByType('navigation')[0];
                console.log('Page Load Performance:', {
                    'DOM Content Loaded': perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart,
                    'Load Complete': perfData.loadEventEnd - perfData.loadEventStart,
                    'First Paint': performance.getEntriesByType('paint')[0]?.startTime,
                    'Largest Contentful Paint': performance.getEntriesByType('largest-contentful-paint')[0]?.startTime
                });
            }, 0);
        });
    }
}

// Initialize performance optimizations
initPerformanceOptimizations();

// Intersection Observer for better performance
function createOptimizedObserver(callback, options = {}) {
    const defaultOptions = {
        threshold: 0.1,
        rootMargin: '50px 0px'
    };
    
    return new IntersectionObserver(callback, { ...defaultOptions, ...options });
}

// Preload next section images when user scrolls
function initImagePreloading() {
    const sections = document.querySelectorAll('section');
    let currentSection = 0;

    const sectionObserver = createOptimizedObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const nextSection = entry.target.nextElementSibling;
                if (nextSection) {
                    const nextImages = nextSection.querySelectorAll('img[data-src]');
                    nextImages.forEach(img => {
                        if (!img.src) {
                            const preloadImg = new Image();
                            preloadImg.src = img.dataset.src;
                        }
                    });
                }
            }
        });
    });

    sections.forEach(section => sectionObserver.observe(section));
}

// Initialize image preloading
setTimeout(initImagePreloading, 2000);
