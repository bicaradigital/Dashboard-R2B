# Debug Login Issues - Complete Guide

## Quick Status Check

If login fails after signup, use this step-by-step guide to diagnose and fix.

---

## Step 1: Check Supabase Email Configuration

This is the #1 reason login fails after signup.

### Open Supabase Dashboard
1. Go to: https://app.supabase.com
2. Select your **Dashboard-R2B** project
3. Left sidebar → **Authentication** → **Providers**
4. Look for **Email** section

### Check Email Confirmations Setting
```
CURRENT SETTING: See what's selected
├─ "Require email confirmation" (❌ causes login to fail)
└─ "Automatic" (✅ allows instant login)
```

### What Each Option Does

**Require email confirmation:**
- User signs up ✓
- Email sent to verify
- User CANNOT login until they click email link
- ❌ Most users abandon here

**Automatic (Recommended for testing):**
- User signs up ✓
- Automatically confirmed
- User CAN login immediately ✓
- ✅ Best for development & MVP

### How to Fix
If set to "Require":

```
1. Click Email provider row
2. Toggle "Email Confirmations" to "Automatic"
3. Scroll down → Click "Save"
4. Wait 10 seconds
5. Try signup again
```

---

## Step 2: Check Email Settings (if Require is enabled)

If you want to keep email verification, setup an email provider.

### Option A: SendGrid (Recommended)
```
1. Get API key from: sendgrid.com/signup
2. Supabase → Authentication → Providers → Email
3. Click "Custom SMTP" or "SendGrid"
4. Enter credentials
5. Save
```

### Option B: Gmail SMTP
```
1. Enable 2FA on Gmail
2. Create App Password: https://myaccount.google.com/apppasswords
3. Supabase → Custom SMTP
   - Host: smtp.gmail.com
   - Port: 587
   - Username: your@gmail.com
   - Password: <16-char app password>
4. Save
```

---

## Step 3: Test Signup & Login Flow

### Clean Test (Delete Previous Account)

1. **Open Supabase Admin:**
   - https://app.supabase.com
   - Your project → Authentication → Users
   - Find test account → Delete it

2. **Test Fresh Signup:**
   ```
   http://localhost:3000/auth/signup
   
   Fill:
   - Name: Test User
   - Email: test@gmail.com
   - Password: Test123456 (min 6 chars)
   - Confirm: Test123456
   
   Click "Daftar" (Register)
   ```

3. **Expected Result:**
   - If "Automatic": Redirect to verify-email → Click "Masuk Sekarang" → Goes to dashboard ✓
   - If "Require": Redirect to verify-email → Check inbox for link → Click → Then can login ✓

4. **Test Login:**
   ```
   http://localhost:3000/auth/login
   
   Fill:
   - Email: test@gmail.com
   - Password: Test123456
   
   Click "Masuk"
   ```

---

## Step 4: Troubleshooting

### Error: "Email tidak dikonfirmasi"
**Problem:** Email confirmation required but not done
**Solution:** 
- Check email inbox (including spam)
- If no email: Enable email provider (See Step 2)
- Or switch to "Automatic" (See Step 1)

### Error: "Email atau password salah"
**Problem:** Credentials are wrong
**Solution:**
- Check email spelling (case-sensitive not required)
- Check password is correct
- Try again

### Error: "Login gagal - session tidak ditemukan"
**Problem:** Session not created
**Solution:**
- Try again (network issue)
- Clear browser cookies → Try again
- Check browser console (F12 → Console tab)

### Page redirects to login endlessly
**Problem:** Session not persisting
**Solution:**
- Clear browser cookies
- Check middleware settings
- Check browser console for errors

---

## Step 5: Check Browser Console

For detailed errors:

1. Press `F12` to open DevTools
2. Click **Console** tab
3. Look for messages starting with `[v0]`
4. Share any errors you see

### Example Console Output:
```
[v0] Attempting login for: test@gmail.com
[v0] Login successful, redirecting to dashboard
```

---

## Step 6: Database Check

Check if user was actually created:

1. Supabase Dashboard → Authentication → Users
2. Should see your test account
3. Check "Email Confirmed" status:
   - Green checkmark = Confirmed ✓
   - Red X = Not confirmed ❌

If not confirmed and you want "Automatic":
1. Change Email Confirmations to "Automatic" (Step 1)
2. Create NEW account
3. Should be auto-confirmed

---

## Common Issues & Quick Fixes

| Issue | Solution |
|-------|----------|
| Can't signup | Check email provider is configured |
| Can signup but can't login | Change to "Automatic" email (Step 1) |
| Login redirects to /login | Check browser cookies aren't blocking |
| Password won't show/hide | Hard refresh (Ctrl+Shift+R) browser |
| Strange errors | Check browser console (F12) |

---

## Final Checklist

- [ ] Check Supabase email setting ("Automatic" or provider configured)
- [ ] Try fresh signup with new email
- [ ] Try fresh login
- [ ] Check browser console for errors
- [ ] Check Supabase Users table for account
- [ ] Try incognito/private browser window

---

## Still Having Issues?

1. **Clear everything:**
   ```
   - Delete account from Supabase
   - Clear browser cookies (Settings → Privacy)
   - Hard refresh (Ctrl+Shift+R)
   - Try again
   ```

2. **Check the basics:**
   - Is dev server running? (npm run dev)
   - Right URL? (http://localhost:3000)
   - Correct email/password?
   - Network connection OK?

3. **Look at console:** (F12 → Console)
   - Any `[v0]` error messages?
   - Any red error messages?
   - Take screenshot and share

---

## Support Information

If still stuck:
1. Check console output (F12 → Console tab)
2. Verify Supabase settings
3. Try in incognito window
4. Hard refresh browser
5. Check email provider is working
