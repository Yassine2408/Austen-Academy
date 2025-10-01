# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

This is the **Austen Academy** website - a professional training and language center located in Kénitra, Morocco. The project consists of a modern, responsive frontend website with an optional secure backend server for form handling and contact management.

**Key Business Context:**
- Educational institution offering language courses (English, French, Spanish), professional training (IT, Office skills), and coaching
- Over 500 students successfully trained
- Located at 6 Boulevard Hassan II, Résidence Al Hassan, 5ᵉ étage, N°36 & 37 – Kénitra
- Contact: +212 6 60 36 86 28, info@austenacademymaroc.com

## Architecture & Structure

### Frontend Architecture (Static Website)
- **Pure HTML5/CSS3/JavaScript** - No framework dependencies
- **Progressive Web App (PWA)** with service worker and manifest
- **Security-first design** with comprehensive XSS protection and input sanitization
- **Responsive design** optimized for desktop, tablet, and mobile
- **Performance optimized** with lazy loading, image optimization, and efficient animations

### Backend Architecture (Optional Node.js/Express)
- **Express.js server** with comprehensive security middleware
- **MongoDB integration** using Mongoose for contact form data
- **Enterprise-level security** including CSRF protection, rate limiting, input validation
- **Email integration** with secure SMTP configuration
- **Admin dashboard** with authentication for contact management

### Key Files Structure
```
Austen-Academy/
├── index.html          # Main website structure
├── styles.css          # Complete styling with responsive design
├── script.js           # Frontend functionality and security
├── manifest.json       # PWA configuration
├── sw.js               # Service worker for offline functionality
├── SECURITY.md         # Comprehensive security documentation
├── backend/            # Optional secure backend server
│   ├── server.js       # Express server with security features
│   ├── package.json    # Backend dependencies and scripts
│   └── DEPLOYMENT-SECURITY.md # Production deployment guide
└── assets/             # Images and media files
```

## Common Development Commands

### Frontend Development
```bash
# Simple development server
python -m http.server 8000
# Then visit: http://localhost:8000

# Alternative with Node.js
npx serve .
# Then visit: http://localhost:3000

# VS Code Live Server (recommended)
# Install "Live Server" extension, right-click index.html → "Open with Live Server"
```

### Backend Development (if using backend)
```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Development mode with auto-reload
npm run dev

# Production mode
npm start

# Run tests
npm test

# Security audit
npm run security-audit

# Code linting
npm run lint

# Code formatting
npm run format
```

### Testing & Quality
```bash
# Frontend testing (manual)
# - Test all responsive breakpoints: 1200px+, 768-1199px, <768px
# - Test form validation with various inputs
# - Test PWA installation and offline functionality
# - Verify security headers in browser dev tools

# Backend testing
cd backend
npm test

# Security testing
npm audit
npm run security-audit
```

## Development Guidelines

### Security Requirements
This project implements **enterprise-level security**. Always maintain:

- **Input Validation**: All user inputs must be validated and sanitized
- **XSS Protection**: Use proper HTML entity encoding
- **CSRF Protection**: Backend includes CSRF tokens for form submissions
- **Rate Limiting**: Both client-side and server-side rate limiting implemented
- **Content Security Policy**: Strict CSP headers configured
- **HTTPS**: Required for production (PWA requirement)

### Code Style & Patterns

**Frontend JavaScript:**
- Use vanilla JavaScript (no frameworks)
- Implement debounced scroll handlers for performance
- Use Intersection Observer for animations and lazy loading
- Maintain security-first approach with input sanitization
- Follow existing patterns for DOM manipulation

**Backend Node.js:**
- Express.js with security middleware (helmet, CSRF, rate limiting)
- Mongoose for MongoDB operations
- Comprehensive input validation using `validator` library
- Async/await for all database operations
- Proper error handling without exposing sensitive information

**CSS:**
- CSS custom properties for theming (`:root` variables)
- Mobile-first responsive design
- BEM-like naming conventions
- Smooth animations with `transition` and `@keyframes`
- Moroccan-inspired geometric patterns as subtle design elements

### Performance Considerations
- **Lazy loading** implemented for images and non-critical content
- **Service worker** caches static assets for offline functionality
- **Debounced scroll events** to prevent performance issues
- **Image optimization** with proper sizing and formats
- **Preload critical resources** (fonts, CSS)

### Form Handling
The contact form has **dual implementation**:

**Development Mode** (localhost):
- Client-side validation and simulation
- Form data logged to console
- No actual email sending

**Production Mode** (with backend):
- CSRF token validation
- Server-side input sanitization
- Secure email delivery via SMTP
- Database storage with MongoDB
- Admin panel for contact management

### PWA Features
- **Installable** on mobile devices and desktops
- **Offline functionality** with service worker caching
- **App-like experience** with proper manifest configuration
- **Push notifications ready** (can be implemented)

## Security Best Practices

### For Development
- Never commit sensitive data (API keys, passwords, tokens)
- Always test security headers and CSP policies
- Validate all user inputs on both client and server side
- Use HTTPS in production environments
- Regular dependency updates and security audits

### For Production Deployment
- Follow `backend/DEPLOYMENT-SECURITY.md` for complete security setup
- Enable HTTPS with Let's Encrypt or commercial SSL certificate
- Configure proper firewall rules
- Set up monitoring and logging
- Implement regular backups
- Use environment variables for all sensitive configuration

## Contact Information Context
When working on contact-related features, use official Austen Academy details:
- **Phone**: +212 6 60 36 86 28 / +212 7 10 96 96 94
- **Email**: info@austenacademymaroc.com
- **WhatsApp**: Same as phone numbers
- **Address**: 6 Boulevard Hassan II, Résidence Al Hassan, 5ᵉ étage, N°36 & 37 – Kénitra
- **Social**: @austenacademy (Instagram), Austen Academy Maroc (Facebook)

## Moroccan Localization
- **Primary language**: French (with some English elements)
- **Phone format**: Moroccan numbers (+212 or 0 prefix)
- **Currency context**: Moroccan Dirham (DHS) mentioned in business documents
- **Time zone**: Morocco Standard Time (UTC+1)
- **Cultural elements**: Subtle Moroccan geometric patterns in design

## Browser Support
- **Modern browsers**: Chrome 80+, Firefox 75+, Safari 13+, Edge 80+
- **Mobile browsers**: iOS Safari 13+, Chrome Mobile 80+
- **IE/Legacy**: Not supported (uses modern JS features like Intersection Observer)

## Troubleshooting Common Issues

### Frontend Issues
- **PWA not installing**: Check manifest.json and HTTPS requirement
- **Form not submitting**: Verify CSRF token handling in production
- **Animations not smooth**: Check for scroll event performance

### Backend Issues
- **CSRF token errors**: Ensure frontend fetches token before form submission
- **Email not sending**: Verify SMTP configuration and app passwords
- **Rate limiting triggered**: Check IP-based limits in development

### Security Issues
- **CSP violations**: Update Content Security Policy headers as needed
- **Mixed content warnings**: Ensure all resources use HTTPS in production
- **XSS detection**: Check input sanitization functions

## Deployment Notes

### Quick Deploy (Frontend Only)
- Deploy to Netlify, Vercel, or GitHub Pages
- Ensure HTTPS is enabled for PWA functionality
- Configure proper redirects and headers

### Full Deploy (Frontend + Backend)
- Use VPS with Nginx reverse proxy (recommended)
- Alternative: Heroku, DigitalOcean App Platform
- Follow complete security checklist in backend documentation
- Set up MongoDB Atlas or local MongoDB instance
- Configure email service (Gmail, SendGrid, or Mailgun)

This project is production-ready with comprehensive security implementations suitable for handling student data and contact information in an educational institution context.