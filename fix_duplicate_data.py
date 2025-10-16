# Read the file
with open('public/static/app.js', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Find and fix the duplicate 'const data' around line 5484
# Change the second one to 'const historyData'
fixed = False
for i in range(len(lines)):
    # Around line 5484 (0-indexed would be ~5483)
    if i > 5480 and i < 5490 and 'const data = [];' in lines[i] and not fixed:
        lines[i] = lines[i].replace('const data = [];', 'const historyData = [];')
        fixed = True
        print(f"✅ Fixed duplicate 'data' at line {i+1}")
        
        # Also need to fix the return statement that uses 'data'
        # Look ahead for 'return data'
        for j in range(i, min(i+20, len(lines))):
            if 'return data;' in lines[j]:
                lines[j] = lines[j].replace('return data;', 'return historyData;')
                print(f"✅ Fixed return statement at line {j+1}")
                break
            elif 'data.push' in lines[j]:
                lines[j] = lines[j].replace('data.push', 'historyData.push')
                print(f"✅ Fixed push at line {j+1}")

# Write back
with open('public/static/app.js', 'w', encoding='utf-8') as f:
    f.writelines(lines)

if fixed:
    print("✅ Duplicate 'data' variable fixed successfully")
else:
    print("❌ Could not find the duplicate data variable")
