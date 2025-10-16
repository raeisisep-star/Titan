import re

# Read the file
with open('public/static/app.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Pattern to find this.apiCall and replace with proper fetch
def replace_api_call(match):
    url = match.group(1)
    return f'''await fetch('{url}', {{
                headers: {{
                    'Authorization': `Bearer ${{localStorage.getItem('titan_auth_token')}}`,
                    'Content-Type': 'application/json'
                }}
            }})'''

# Replace all occurrences of this.apiCall
pattern = r"await this\.apiCall\('([^']+)'\)"
new_content = re.sub(pattern, lambda m: replace_api_call(m), content)

# Write back
with open('public/static/app.js', 'w', encoding='utf-8') as f:
    f.write(new_content)

print("✅ Fixed all this.apiCall() usages")
print(f"   Replaced {len(re.findall(pattern, content))} occurrences")
