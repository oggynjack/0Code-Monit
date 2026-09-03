const nodemailer = require('nodemailer');

// Email test configuration
const emailConfig = {
    // Update these with your actual email settings
    host: 'smtp.hostinger.com',        // Your SMTP server (gmail, outlook, etc.)
    port: 587,                     // Usually 587 for TLS or 465 for SSL
    secure: false,                 // true for 465, false for other ports
    auth: {
        user: 'support@0code.uk',    // Your email address
        pass: 'Jagpreet@29'        // Your email password or app password
    }
};

const testEmail = {
    from: '"0Code-Monit" <noreply@0code.uk>',
    to: 'desigamers003@gmail.com',  // Change to your test recipient
    subject: '0Code-Monit Test Email',
    text: 'This is a test email from your 0Code-Monit server to verify SMTP configuration.',
    html: `
        <h2>🚀 0Code-Monit Test Email</h2>
        <p>This is a test email from your 0Code-Monit server.</p>
        <p>If you receive this email, your SMTP configuration is working correctly!</p>
        <hr>
        <p><small>Sent at: ${new Date().toLocaleString()}</small></p>
    `
};

async function testEmailConnection() {
    console.log('🔧 Testing 0Code-Monit Email Configuration...\n');
    
    try {
        // Create transporter
        console.log('📧 Creating SMTP transporter...');
        const transporter = nodemailer.createTransport(emailConfig);
        
        // Test connection
        console.log('🔗 Testing SMTP connection...');
        await transporter.verify();
        console.log('✅ SMTP connection successful!');
        
        // Send test email
        console.log('📤 Sending test email...');
        const info = await transporter.sendMail(testEmail);
        
        console.log('\n🎉 Email sent successfully!');
        console.log('Message ID:', info.messageId);
        console.log('Accepted:', info.accepted);
        console.log('Rejected:', info.rejected);
        
        if (info.rejected && info.rejected.length > 0) {
            console.log('⚠️  Some recipients were rejected:', info.rejected);
        }
        
    } catch (error) {
        console.log('\n❌ Email test failed!');
        console.log('Error Code:', error.code);
        console.log('Error Message:', error.message);
        
        // Provide specific troubleshooting advice
        console.log('\n🔍 Troubleshooting Tips:');
        
        if (error.code === 'EAUTH') {
            console.log('- Authentication failed. Check your username and password.');
            console.log('- For Gmail: Use an "App Password" instead of your regular password.');
            console.log('- Enable 2FA and generate an app password: https://myaccount.google.com/apppasswords');
        } else if (error.code === 'ECONNECTION' || error.code === 'ETIMEDOUT') {
            console.log('- Connection failed. Check your SMTP server and port settings.');
            console.log('- Verify your internet connection.');
            console.log('- Check if your firewall is blocking the SMTP port.');
        } else if (error.code === 'ESOCKET') {
            console.log('- Socket error. Try different security settings (TLS/SSL).');
            console.log('- For Gmail: Try port 465 with secure: true, or port 587 with secure: false.');
        }
        
        console.log('\n📋 Current Configuration:');
        console.log('Host:', emailConfig.host);
        console.log('Port:', emailConfig.port);
        console.log('Secure:', emailConfig.secure);
        console.log('User:', emailConfig.auth.user);
        console.log('Password:', emailConfig.auth.pass ? '[HIDDEN]' : '[NOT SET]');
    }
}

// Common email provider configurations
console.log('📋 Common Email Provider Settings:');
console.log('\n🌐 Gmail:');
console.log('  Host: smtp.gmail.com');
console.log('  Port: 587 (TLS) or 465 (SSL)');
console.log('  Secure: false for 587, true for 465');
console.log('  Note: Requires App Password with 2FA enabled');

console.log('\n🌐 Outlook/Hotmail:');
console.log('  Host: smtp-mail.outlook.com');
console.log('  Port: 587');
console.log('  Secure: false');

console.log('\n🌐 Yahoo:');
console.log('  Host: smtp.mail.yahoo.com');
console.log('  Port: 587 or 465');
console.log('  Secure: false for 587, true for 465');

console.log('\n' + '='.repeat(50));

// Run the test
testEmailConnection();