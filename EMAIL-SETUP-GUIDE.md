# 📧 Email Setup Guide for Austen Academy Contact Form

## 🚀 Quick Setup (Recommended for Beginners)

### **Option 1: Netlify Forms (Easiest)**

1. **Deploy to Netlify**:
   - Push your code to GitHub
   - Connect to Netlify
   - Deploy automatically

2. **Configure Netlify Forms**:
   - Go to Netlify dashboard → Forms
   - Enable form notifications
   - Add your email: `info@austenacademymaroc.com`
   - Set up email templates

3. **Benefits**:
   - ✅ No backend needed
   - ✅ Automatic spam protection
   - ✅ Email notifications
   - ✅ Form submissions dashboard

---

## 🔧 Advanced Setup (Full Control)

### **Option 2: Backend with Gmail SMTP**

### **Step 1: Gmail Setup**

1. **Enable 2-Factor Authentication**:
   - Go to Google Account → Security
   - Enable 2-Step Verification

2. **Generate App Password**:
   - Google Account → Security → 2-Step Verification
   - Click "App passwords"
   - Select "Mail" and generate password
   - **Save this password** (you'll need it)

### **Step 2: Backend Configuration**

1. **Create .env file** in `backend/` folder:
```bash
# Copy env-example.txt to .env
cp env-example.txt .env
```

2. **Edit .env file** with your details:
```env
# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-specific-password
CONTACT_EMAIL=info@austenacademymaroc.com

# Server Configuration
NODE_ENV=development
PORT=3000
FRONTEND_URL=http://localhost:8000

# Database (Optional)
MONGODB_URI=mongodb://localhost:27017/austen-academy

# Security
SESSION_SECRET=your-super-secret-session-key
ADMIN_TOKEN=your-secure-admin-token
```

### **Step 3: Install and Run Backend**

```bash
# Navigate to backend folder
cd backend

# Install dependencies
npm install

# Start the server
npm run dev
```

### **Step 4: Test Email Functionality**

1. **Start both frontend and backend**:
   ```bash
   # Terminal 1: Backend
   cd backend
   npm run dev

   # Terminal 2: Frontend
   cd ..
   python -m http.server 8000
   ```

2. **Test the contact form**:
   - Go to `http://localhost:8000`
   - Fill out the contact form
   - Submit and check your email

---

## 📧 Alternative Email Services

### **SendGrid (Recommended for Production)**

1. **Sign up for SendGrid** (free tier available)
2. **Get API key** from SendGrid dashboard
3. **Update .env file**:
```env
SMTP_HOST=smtp.sendgrid.net
SMTP_USER=apikey
SMTP_PASS=your-sendgrid-api-key
```

### **Mailgun**

1. **Sign up for Mailgun** (free tier available)
2. **Get SMTP credentials**
3. **Update .env file**:
```env
SMTP_HOST=smtp.mailgun.org
SMTP_USER=your-mailgun-username
SMTP_PASS=your-mailgun-password
```

---

## 🛡️ Security Best Practices

### **Email Security**
- ✅ Use App-Specific Passwords (not regular passwords)
- ✅ Enable 2FA on email accounts
- ✅ Use TLS encryption (port 587)
- ✅ Regular password rotation

### **Form Security**
- ✅ Rate limiting (5 submissions per 15 minutes)
- ✅ Input validation and sanitization
- ✅ CSRF protection
- ✅ Spam detection

---

## 🚨 Troubleshooting

### **Common Issues**

1. **"Authentication failed"**:
   - Check if 2FA is enabled
   - Use App-Specific Password (not regular password)
   - Verify SMTP settings

2. **"Connection timeout"**:
   - Check firewall settings
   - Verify SMTP host and port
   - Try different email service

3. **"Form not submitting"**:
   - Check browser console for errors
   - Verify backend is running
   - Check CORS settings

### **Testing Email**

```bash
# Test SMTP connection
node -e "
const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransporter({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: 'your-email@gmail.com',
    pass: 'your-app-password'
  }
});
transporter.verify((error, success) => {
  if (error) console.log('Error:', error);
  else console.log('SMTP Ready!');
});
"
```

---

## 📞 Support

**For email setup issues**:
- Check the backend logs: `npm run dev`
- Verify .env file configuration
- Test SMTP connection separately
- Contact: info@austenacademymaroc.com

**Next Steps**:
1. Choose your preferred method (Netlify Forms or Backend)
2. Follow the setup guide
3. Test with a real form submission
4. Configure email templates
5. Set up monitoring and backups
