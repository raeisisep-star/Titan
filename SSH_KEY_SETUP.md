# 🔑 SSH Key Setup for GitHub Push Access

## ✅ SSH Key Generated

I've generated a new SSH key for you:

**Key Type:** ed25519 (most secure)  
**Name:** titan-server-push-access  
**Location:** `/home/ubuntu/.ssh/id_ed25519`

---

## 📋 Your Public Key (Copy This!)

```
ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIJQXex4Dtq+hc5Us8hB5FM4X/KrsapUgw81Sa48zVD8p titan-server-push-access
```

---

## 🔧 How to Add This Key to GitHub

### Step 1: Copy the public key above

### Step 2: Go to GitHub SSH Keys Settings
```
https://github.com/settings/ssh/new
```

### Step 3: Add the key
- **Title:** `titan-server-push-access` (or any name you like)
- **Key:** Paste the public key from above
- **Key type:** Authentication Key
- ⚠️ **IMPORTANT:** Make sure it's **NOT** "Read-only" - leave that unchecked!

### Step 4: Click "Add SSH key"

---

## ✅ Git Remote Updated

Git remote has been changed from HTTPS to SSH:
```
Before: https://github.com/raeisisep-star/Titan.git
After:  git@github.com:raeisisep-star/Titan.git
```

---

## 🚀 After Adding Key to GitHub

Once you've added the key, come back and run:

### Test SSH Connection:
```bash
ssh -T git@github.com
```

**Expected output:**
```
Hi raeisisep-star! You've successfully authenticated, but GitHub does not provide shell access.
```

### Then Push Your Changes:
```bash
cd /home/ubuntu/Titan
git push origin feature/phase4-ssl-full-strict
```

---

## 🔐 Security Notes

- ✅ Private key is secure on server only
- ✅ Public key can be safely shared
- ✅ Key is ed25519 (most secure algorithm)
- ⚠️ Make sure to select "Authentication Key" not "Read-only"

---

## 📝 Alternative: Using Personal Access Token

If you prefer using HTTPS with a token instead:

1. Generate token: https://github.com/settings/tokens/new
2. Permissions: `repo` (full control)
3. Run:
   ```bash
   cd /home/ubuntu/Titan
   git remote set-url origin https://github.com/raeisisep-star/Titan.git
   git config credential.helper store
   git push origin feature/phase4-ssl-full-strict
   # Enter username and paste token as password
   ```

---

## ❓ Troubleshooting

### If push fails with "Permission denied":
```bash
# Check SSH connection
ssh -T git@github.com -v

# Make sure key is loaded
ssh-add ~/.ssh/id_ed25519

# Try push again
git push origin feature/phase4-ssl-full-strict
```

### If you get "Host key verification failed":
```bash
ssh-keyscan github.com >> ~/.ssh/known_hosts
```

---

## 🎯 Next Steps

1. ✅ Copy public key above
2. ✅ Add to GitHub: https://github.com/settings/ssh/new
3. ✅ Test connection: `ssh -T git@github.com`
4. ✅ Push changes: `git push origin feature/phase4-ssl-full-strict`
5. ✅ Create PR: https://github.com/raeisisep-star/Titan/pulls
