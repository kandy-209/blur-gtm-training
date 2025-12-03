# 🧪 HOW TO RUN TESTS

## ⚠️ Issue: npm Not Found

Node.js/npm is not in your system PATH. Here's how to fix it:

---

## 🔧 Solution 1: Install Node.js (If Not Installed)

1. **Download Node.js:**
   - Go to: https://nodejs.org/
   - Download LTS version (recommended)
   - Run installer

2. **During Installation:**
   - ✅ Check "Add to PATH" option
   - Complete installation

3. **Restart Cursor IDE** (important!)

4. **Verify Installation:**
   ```powershell
   node --version
   npm --version
   ```

5. **Run Tests:**
   ```bash
   npm test
   ```

---

## 🔧 Solution 2: Use Node.js Command Prompt

If Node.js is installed but not in PATH:

1. **Open Node.js Command Prompt:**
   - Press `Windows Key`
   - Type: `Node.js command prompt`
   - Click to open

2. **Navigate to Project:**
   ```bash
   cd "C:\Users\Laxmo\Modal Test\cursor-gtm-training"
   ```

3. **Run Tests:**
   ```bash
   npm test
   ```

---

## 🔧 Solution 3: Add Node.js to PATH Manually

1. **Find Node.js Installation:**
   - Common locations:
     - `C:\Program Files\nodejs\`
     - `C:\Program Files (x86)\nodejs\`
     - `C:\Users\[YourName]\AppData\Roaming\npm`

2. **Add to PATH:**
   - Press `Windows Key` → Type "Environment Variables"
   - Click "Edit the system environment variables"
   - Click "Environment Variables" button
   - Under "System variables", select "Path"
   - Click "Edit"
   - Click "New"
   - Add: `C:\Program Files\nodejs\` (or your Node.js path)
   - Click OK on all dialogs
   - **Restart Cursor IDE**

3. **Verify:**
   ```powershell
   npm --version
   ```

4. **Run Tests:**
   ```bash
   npm test
   ```

---

## ✅ Once npm Works

### Run All Tests
```bash
npm test
```

### Run with Coverage Report
```bash
npm run test:coverage
```

### Watch Mode (Auto-rerun on changes)
```bash
npm run test:watch
```

### CI Mode
```bash
npm run test:ci
```

---

## 📊 What You'll See

When tests run successfully:

```
PASS  src/components/__tests__/Button.test.tsx
PASS  src/lib/__tests__/db.test.ts
...

Test Suites: 55 passed, 55 total
Tests:       234 passed, 234 total
Snapshots:   0 total
Time:        12.345 s
```

---

## 🎯 Quick Check Commands

**Check if Node.js is installed:**
```powershell
node --version
```

**Check if npm is available:**
```powershell
npm --version
```

**If both work, you're ready to test!**

---

## 📝 Next Steps

1. ✅ Install/configure Node.js
2. ✅ Restart Cursor IDE
3. ✅ Run `npm test`
4. ✅ Review test results
5. ✅ Fix any failures
6. ✅ Iterate!

---

**Need Help?**
- Check `START_HERE_TESTING.md`
- Check `TEST_RUNNER.md`
- Verify Node.js installation at nodejs.org


