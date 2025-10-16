import re

with open('public/static/app.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Find all patterns where we use fetch but don't call .json()
# Pattern: const X = await fetch(...); ... if (X.success or X.data)
patterns_to_fix = [
    # Pattern 1: const response = await fetch(...); if (response.success...)
    (
        r"(const response = await fetch\([^)]+\)[^;]*;)\s*(if\s*\(\s*response\.(?:success|data|ok)\s*)",
        r"\1\n            const data = response.ok ? await response.json() : {};\n            \2".replace("response.", "data.")
    ),
]

# More sophisticated: find fetch calls and add .json()
lines = content.split('\n')
fixed_lines = []
i = 0

while i < len(lines):
    line = lines[i]
    
    # Check if line has "const X = await fetch"
    fetch_match = re.search(r'const (\w+) = await fetch\(', line)
    
    if fetch_match:
        var_name = fetch_match.group(1)
        fixed_lines.append(line)
        i += 1
        
        # Look ahead for usage of this variable
        check_lines = 10
        for j in range(i, min(i + check_lines, len(lines))):
            next_line = lines[j]
            
            # If we see X.success or X.data without X.json() before it
            if f"{var_name}.success" in next_line or f"{var_name}.data" in next_line:
                # Insert response.json() call before this line
                indent = len(next_line) - len(next_line.lstrip())
                json_call = " " * indent + f"const data = {var_name}.ok ? await {var_name}.json() : {{}};"
                fixed_lines.append(json_call)
                # Replace var_name with 'data' in subsequent lines
                next_line = next_line.replace(f"{var_name}.success", "data.success")
                next_line = next_line.replace(f"{var_name}.data", "data.data")
                fixed_lines.append(next_line)
                i = j + 1
                break
            elif f"{var_name}.ok" in next_line:
                # This is fine, it's checking HTTP status
                fixed_lines.append(next_line)
                i = j + 1
                break
            else:
                fixed_lines.append(next_line)
                if j == i:
                    i += 1
    else:
        fixed_lines.append(line)
        i += 1

new_content = '\n'.join(fixed_lines)

with open('public/static/app.js', 'w', encoding='utf-8') as f:
    f.write(new_content)

print("✅ Fixed all fetch().json() calls")
