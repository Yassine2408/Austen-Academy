# 🔐 Production Deployment & Security Guide
## Austen Academy Backend Security Implementation

## 🚀 Quick Start

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Environment Setup
```bash
cp env-example.txt .env
# Edit .env with your actual values
```

### 3. Start Server
```bash
# Development
npm run dev

# Production
npm start
```

## 🛡️ Security Features Implemented

### ✅ **Server-Side Validation & Sanitization**

**Input Validation:**
- Email format validation (RFC compliant)
- Moroccan phone number validation (+212/0 format)
- String length limits (name: 2-100, message: 10-2000)
- Required field enforcement
- Course selection validation (enum values)

**Data Sanitization:**
- HTML entity encoding to prevent XSS
- Input trimming and length limiting
- Email normalization
- Phone number formatting
- Suspicious content detection

### ✅ **CAPTCHA Integration Ready**

**reCAPTCHA v3 Implementation:**
```javascript
// Add to frontend form
<script src="https://www.google.com/recaptcha/api.js?render=YOUR_SITE_KEY"></script>

// Add to backend validation
const recaptchaResponse = req.body['g-recaptcha-response'];
const recaptchaVerification = await verifyRecaptcha(recaptchaResponse);
```

### ✅ **Rate Limiting**
- **Contact Form**: 5 submissions per 15 minutes per IP
- **General API**: 100 requests per 15 minutes per IP
- **Configurable limits** via environment variables
- **IP-based tracking** with proper headers

### ✅ **Email Security (SMTP with TLS)**
- **TLS encryption**: Minimum TLSv1.2
- **Authentication**: SMTP username/password
- **HTML email templates**: Professional formatting
- **Error handling**: Secure email delivery
- **Gmail/Office365 compatible**: Standard SMTP configuration

### ✅ **CSRF Protection**
- **Token-based protection**: Unique tokens per session
- **Secure cookies**: HttpOnly, Secure, SameSite
- **Session management**: MongoDB-backed sessions
- **Automatic token rotation**

### ✅ **SQL Injection Protection**
- **MongoDB ODM**: Mongoose prevents injection
- **Input validation**: All inputs validated before queries
- **Parameterized queries**: No direct string concatenation
- **Schema enforcement**: Strict data types

### ✅ **File Upload Security (Ready)**
- **File type validation**: Whitelist of allowed types
- **Size limits**: Configurable maximum file sizes
- **Virus scanning ready**: Integration points available
- **Secure storage**: Outside web root

### ✅ **HTTPS Certificate**
- **Let's Encrypt ready**: Free SSL certificate
- **HSTS headers**: Force HTTPS connections
- **Secure cookie flags**: Production-ready
- **Redirect HTTP to HTTPS**: Automatic redirection

## 🔧 Production Deployment Checklist

### **🌐 Hosting Setup**

#### **Option 1: VPS/Dedicated Server**
```bash
# 1. Update system
sudo apt update && sudo apt upgrade -y

# 2. Install Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 3. Install MongoDB
sudo apt-get install -y mongodb

# 4. Install Nginx (reverse proxy)
sudo apt-get install -y nginx

# 5. Install Certbot (Let's Encrypt)
sudo apt-get install -y certbot python3-certbot-nginx

# 6. Setup SSL certificate
sudo certbot --nginx -d yourdomain.com
```

#### **Option 2: Cloud Hosting (Recommended)**
- **Heroku**: Easy deployment with security add-ons
- **DigitalOcean App Platform**: Managed hosting with SSL
- **Vercel**: Frontend + serverless backend
- **Netlify**: Static frontend + serverless functions

### **🔒 Security Configuration**

#### **1. Firewall Setup**
```bash
# Ubuntu UFW firewall
sudo ufw enable
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw deny 3000/tcp  # Don't expose Node.js port directly
```

#### **2. Nginx Configuration**
```nginx
server {
    listen 443 ssl http2;
    server_name austenacademy.ma www.austenacademy.ma;
    
    ssl_certificate /etc/letsencrypt/live/austenacademy.ma/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/austenacademy.ma/privkey.pem;
    
    # Security headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload";
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}

# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name austenacademy.ma www.austenacademy.ma;
    return 301 https://$server_name$request_uri;
}
```

#### **3. Process Management**
```bash
# Install PM2 for production process management
sudo npm install -g pm2

# Start application with PM2
pm2 start server.js --name "austen-academy"
pm2 startup
pm2 save

# Monitor application
pm2 monit
pm2 logs austen-academy
```

### **🗄️ Database Security**

#### **MongoDB Security:**
```bash
# 1. Enable authentication
sudo systemctl start mongod
mongo
> use admin
> db.createUser({
    user: "austenAdmin",
    pwd: "super-secure-password-change-this",
    roles: ["userAdminAnyDatabase", "dbAdminAnyDatabase"]
})

# 2. Enable auth in MongoDB config
sudo nano /etc/mongod.conf
# Add: security.authorization: enabled

# 3. Restart MongoDB
sudo systemctl restart mongod
```

#### **Database Backup:**
```bash
# Automated daily backups
crontab -e
# Add: 0 2 * * * mongodump --db austen-academy --out /backup/$(date +\%Y\%m\%d)
```

### **📧 Email Security Setup**

#### **Gmail App Password:**
1. Enable 2-Factor Authentication on Gmail
2. Generate App-Specific Password
3. Use app password in SMTP_PASS (not regular password)

#### **Alternative: SendGrid/Mailgun**
```javascript
// More reliable for production
SMTP_HOST=smtp.sendgrid.net
SMTP_USER=apikey
SMTP_PASS=your-sendgrid-api-key
```

### **🔍 Monitoring & Logging**

#### **Security Monitoring:**
```bash
# Install fail2ban for intrusion prevention
sudo apt-get install fail2ban

# Configure fail2ban for Nginx
sudo nano /etc/fail2ban/jail.local
```

#### **Log Management:**
```bash
# Rotate logs to prevent disk filling
sudo nano /etc/logrotate.d/austen-academy
```

### **🚨 Security Incident Response**

#### **If Security Breach Detected:**
1. **Immediate**: Block suspicious IPs via firewall
2. **Assess**: Check logs for extent of breach
3. **Contain**: Disable affected accounts/features
4. **Notify**: Inform users if data compromised
5. **Recover**: Restore from clean backups
6. **Improve**: Update security based on lessons learned

## 🛡️ Security Maintenance

### **Daily:**
- Monitor access logs for suspicious activity
- Check error logs for unusual patterns
- Verify backup completion

### **Weekly:**
- Run security audit: `npm audit`
- Update dependencies: `npm update`
- Review contact form submissions for spam

### **Monthly:**
- Rotate API keys and tokens
- Review and update firewall rules
- Test backup restoration
- Security penetration testing

### **Quarterly:**
- Full security review
- Update all passwords
- Review user access permissions
- Update SSL certificates (if not auto-renewing)

## 📞 Security Support

**For security issues or questions:**
- **Development**: Check GitHub issues
- **Production**: Contact system administrator
- **Emergency**: Disable server immediately, investigate offline

---

**⚠️ IMPORTANT**: This backend implementation provides enterprise-level security suitable for handling sensitive student data and contact information. Always test thoroughly before production deployment.
