// Patch for login button issues
// This ensures the login button ALWAYS works

(function() {
    console.log('🔧 Applying login button fix...');
    
    // Wait for DOM to be ready
    function setupLoginFix() {
        const loginForm = document.getElementById('loginForm');
        const loginBtn = document.getElementById('loginBtn');
        const usernameInput = document.getElementById('username');
        const passwordInput = document.getElementById('password');
        
        console.log('Login fix check:', {
            form: !!loginForm,
            button: !!loginBtn,
            username: !!usernameInput,
            password: !!passwordInput
        });
        
        if (!loginForm || !loginBtn) {
            console.log('⏳ Login elements not ready yet, retrying...');
            setTimeout(setupLoginFix, 500);
            return;
        }
        
        console.log('✅ Login elements found, setting up handlers...');
        
        // Handler function
        const doLogin = async (e) => {
            if (e) e.preventDefault();
            
            console.log('🔐 Login button clicked!');
            
            const username = usernameInput.value;
            const password = passwordInput.value;
            
            console.log('Login data:', {
                username: username,
                hasPassword: !!password
            });
            
            if (!username || !password) {
                alert('لطفاً نام کاربری و رمز عبور را وارد کنید');
                return;
            }
            
            try {
                // Try to use app instance if available
                if (window.app && typeof window.app.handleLogin === 'function') {
                    console.log('Using app.handleLogin');
                    window.app.handleLogin(e || {preventDefault: () => {}});
                    return;
                }
                
                if (window.titanApp && typeof window.titanApp.handleLogin === 'function') {
                    console.log('Using titanApp.handleLogin');
                    window.titanApp.handleLogin(e || {preventDefault: () => {}});
                    return;
                }
                
                // Manual login as fallback
                console.log('Using manual login fallback');
                const isEmail = username.includes('@');
                const loginData = { password };
                
                if (isEmail) {
                    loginData.email = username;
                } else {
                    loginData.username = username;
                }
                
                const response = await fetch('/api/auth/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(loginData)
                });
                
                const result = await response.json();
                console.log('Login response:', result);
                
                if (result.success && result.data && result.data.token) {
                    localStorage.setItem('titan_auth_token', result.data.token);
                    alert('ورود موفقیت‌آمیز! صفحه را refresh کنید.');
                    setTimeout(() => {
                        window.location.reload();
                    }, 1000);
                } else {
                    alert('خطا در ورود: ' + (result.error || 'نام کاربری یا رمز عبور اشتباه است'));
                }
            } catch (error) {
                console.error('Login error:', error);
                alert('خطا در ارتباط با سرور');
            }
        };
        
        // Attach to form submit
        loginForm.addEventListener('submit', doLogin);
        console.log('✅ Form submit listener attached');
        
        // Attach to button click (backup)
        loginBtn.addEventListener('click', doLogin);
        console.log('✅ Button click listener attached');
        
        // Global helper
        window.forceLogin = doLogin;
        console.log('✅ Global forceLogin() available');
        
        console.log('🎉 Login button fix applied successfully!');
        console.log('💡 If button still doesn\'t work, try: forceLogin()');
    }
    
    // Start setup
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', setupLoginFix);
    } else {
        setupLoginFix();
    }
})();
