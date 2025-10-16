import re

with open('public/static/app.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Find setupEventListeners and add more robust handling
old_code = r'''setupEventListeners\(\) \{
        // Login form
        const loginForm = document\.getElementById\('loginForm'\);
        console\.log\('Setting up login form listener, form found:', !!loginForm\);
        if \(loginForm\) \{
            loginForm\.addEventListener\('submit', \(e\) => \{
                console\.log\('Login form submitted!', e\);
                this\.handleLogin\(e\);
            \}\);
        \}'''

new_code = '''setupEventListeners() {
        // Login form - Multiple ways to ensure it works
        const loginForm = document.getElementById('loginForm');
        const loginBtn = document.getElementById('loginBtn');
        
        console.log('Setting up login form listener, form found:', !!loginForm);
        console.log('Login button found:', !!loginBtn);
        
        if (loginForm) {
            // Method 1: Form submit event
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                console.log('Login form submitted via form event!');
                this.handleLogin(e);
            });
        }
        
        if (loginBtn) {
            // Method 2: Button click event (backup)
            loginBtn.addEventListener('click', (e) => {
                const form = document.getElementById('loginForm');
                if (form) {
                    e.preventDefault();
                    console.log('Login button clicked directly!');
                    this.handleLogin(e);
                }
            });
        }'''

content = re.sub(old_code, new_code, content, flags=re.DOTALL)

with open('public/static/app.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("✅ Fixed login handler with multiple event listeners")
