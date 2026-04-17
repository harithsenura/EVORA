# EVORA Email Service Setup

## Email Configuration

To enable email notifications for order status updates, you need to configure email settings.

### Gmail Setup (Recommended)

1. **Enable 2-Factor Authentication** on your Google Account
2. **Generate App Password**:
   - Go to Google Account settings
   - Security → 2-Step Verification
   - App passwords → Generate password for "Mail"
3. **Update Email Configuration**:
   - Open `backend/config/email.js`
   - Replace `your-email@gmail.com` with your Gmail address
   - Replace `your-app-password` with the generated App Password

### Alternative Email Services

You can use other email services by modifying the transporter configuration in `backend/config/email.js`:

```javascript
const transporter = nodemailer.createTransporter({
  service: 'outlook', // or 'yahoo', 'hotmail', etc.
  auth: {
    user: 'your-email@outlook.com',
    pass: 'your-password'
  }
});
```

### Environment Variables (Optional)

Create a `.env` file in the backend directory:

```
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

Then update `backend/config/email.js` to use environment variables:

```javascript
auth: {
  user: process.env.EMAIL_USER || 'your-email@gmail.com',
  pass: process.env.EMAIL_PASS || 'your-app-password'
}
```

## Features

- **Real-time Email Notifications**: Users receive emails when order status changes
- **Professional Email Templates**: Modern HTML email design with EVORA branding
- **Status-specific Messages**: Different messages for each order status
- **Order Details**: Complete order information in email
- **Tracking Information**: Tracking numbers included when available

## Email Templates

The system includes professional email templates for:
- Order Processing
- Order Shipped
- Order Delivered
- Order Cancelled
- Tracking Information

## Testing

1. Update order status in admin dashboard
2. Check user's email for notification
3. Verify email content and formatting

## Troubleshooting

- **Email not sending**: Check email credentials and App Password
- **Gmail blocking**: Ensure App Password is used, not regular password
- **Spam folder**: Check spam folder for emails
- **Console logs**: Check backend console for email sending logs
