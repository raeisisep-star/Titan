import re

# Read the file
with open('public/static/app.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Fix Portfolio Summary Widget
old_portfolio = r'''const response = await fetch\('/api/dashboard/comprehensive', \{
                headers: \{
                    'Authorization': `Bearer \$\{localStorage\.getItem\('titan_auth_token'\)\}`,
                    'Content-Type': 'application/json'
                \}
            \}\);
            
            if \(!response\.success'''

new_portfolio = '''const fetchResponse = await fetch('/api/dashboard/comprehensive', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('titan_auth_token')}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (!fetchResponse.ok) {
                console.warn('Portfolio API failed');
                return '<div class="text-center text-gray-400">خطا در بارگذاری پورتفولیو</div>';
            }
            
            const response = await fetchResponse.json();
            
            if (!response.success'''

content = re.sub(old_portfolio, new_portfolio, content, flags=re.DOTALL)

# Fix Market Overview Widget  
old_market = r'''const response = await fetch\('/api/dashboard/comprehensive', \{
                headers: \{
                    'Authorization': `Bearer \$\{localStorage\.getItem\('titan_auth_token'\)\}`,
                    'Content-Type': 'application/json'
                \}
            \}\);
            
            if \(response\.success && response\.data\?\.market\) \{
                const marketData = response\.data\.market;'''

new_market = '''const fetchResponse = await fetch('/api/dashboard/comprehensive', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('titan_auth_token')}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (fetchResponse.ok) {
                const response = await fetchResponse.json();
                if (response.success && response.data?.market) {
                    const marketData = response.data.market;'''

content = re.sub(old_market, new_market, content, flags=re.DOTALL)

# Write back
with open('public/static/app.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("✅ Fixed response.json() parsing")
