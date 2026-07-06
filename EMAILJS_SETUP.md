# EmailJS Setup Instructions

To enable email notifications for your habit tracker, you need to set up EmailJS. Follow these steps:

## Step 1: Create an EmailJS Account

1. Go to [https://www.emailjs.com/](https://www.emailjs.com/)
2. Click "Sign Up" and create a free account
3. Verify your email address

## Step 2: Add an Email Service

1. After logging in, go to "Email Services" in the dashboard
2. Click "Add New Service"
3. Choose your email provider (Gmail, Outlook, etc.)
4. Follow the instructions to connect your email account
5. Once connected, you'll see a **Service ID** - copy this

## Step 3: Create an Email Template

1. Go to "Email Templates" in the dashboard
2. Click "Create New Template"
3. Set up your template with these parameters:

**Template Settings:**
- **Template Name:** Habits Report
- **Subject:** {{subject}}

**Email Content (HTML):**
```html
<h2>{{subject}}</h2>
<p>Date: {{report_date}}</p>
<p>Type: {{report_type}}</p>

<div style="margin-top: 20px;">
    {{{report_content}}}
</div>

<p style="margin-top: 20px; font-style: italic;">
    This is an automated report from your Habits Tracker.
</p>
```

**Template Variables:**
- `to_email` - Recipient email address
- `subject` - Email subject line
- `report_content` - The habit report content (HTML)
- `report_date` - Date of the report
- `report_type` - Type of report (daily/weekly/monthly)

4. Save the template
5. Copy the **Template ID** from the template page

## Step 4: Get Your Public Key

1. Go to "Account" or "API Keys" in your EmailJS dashboard
2. Copy your **Public Key**

## Step 5: Update Your app.js File

Open `app.js` and replace the placeholder values with your actual EmailJS credentials:

```javascript
// EmailJS Configuration - REPLACE WITH YOUR ACTUAL VALUES
const EMAILJS_PUBLIC_KEY = 'YOUR_ACTUAL_PUBLIC_KEY';      // Paste your Public Key here
const EMAILJS_SERVICE_ID = 'YOUR_ACTUAL_SERVICE_ID';      // Paste your Service ID here
const EMAILJS_TEMPLATE_ID = 'YOUR_ACTUAL_TEMPLATE_ID';    // Paste your Template ID here
const RECIPIENT_EMAIL = 'businesskhadija18@gmail.com';    // Already set correctly
```

## Step 6: Test the Email Functionality

1. Open your habit tracker website in a browser
2. Add some habits to your daily, weekly, or monthly lists
3. Click one of the email buttons:
   - "Send Daily Report"
   - "Send Weekly Report" 
   - "Send Monthly Report"
4. Check your email (businesskhadija18@gmail.com) for the report

## Important Notes

- **Free Plan:** EmailJS has a free tier with 200 emails per month, which should be plenty for your habit tracking
- **Security:** Your Public Key is safe to include in frontend code, but never share your Private Key
- **Customization:** You can modify the email template in EmailJS to change the design and content of your reports
- **Troubleshooting:** If emails don't send, check the browser console for error messages and verify your EmailJS credentials are correct

## Email Report Content

Each email report includes:
- Date and time of the report
- List of all habits for that period
- Completion status for each habit (✅ or ⬜)
- Progress statistics (completed count and percentage)

## Need Help?

- EmailJS Documentation: [https://www.emailjs.com/docs/](https://www.emailjs.com/docs/)
- EmailJS Support: support@emailjs.com
