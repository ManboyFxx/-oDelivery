# Hostinger Deployment Fixes

## 🐛 Bugs Found and Fixed

### Bug #1: Product Creation Image Upload Disabled (CRITICAL)
**Problem:** Image upload field was commented out in product creation form
**Impact:** Products created via UI would not have images
**Solution:** Enabled image upload in `resources/js/Pages/Products/Create.tsx`
**Files Modified:**
- `resources/js/Pages/Products/Create.tsx` - Added image upload UI and state management
- Added `encType="multipart/form-data"` to form
- Added `handleImageChange()` function
- Added image preview component

### Bug #2: Storage Symlink May Not Be Created (HIGH)
**Problem:** `/storage` URLs return 404 if symlink doesn't exist
**Impact:** Images stored but not accessible via web
**Solution:** Must run after deployment to Hostinger

### Bug #3: File Permissions Issues (MEDIUM)
**Problem:** `storage/app/public` may not be writable by web server
**Impact:** File uploads fail silently
**Solution:** Check permissions and adjust if needed

---

## 📋 Hostinger Deployment Checklist

### Step 1: Deploy Code Changes
```bash
# After git push, Hostinger will auto-deploy
# Verify that resources/js/Pages/Products/Create.tsx is updated with:
# - image upload UI
# - handleImageChange function
# - encType="multipart/form-data" on form
```

### Step 2: Create Storage Symlink (REQUIRED)
```bash
# SSH into your Hostinger server
ssh user@hostinger-domain.com

# Navigate to project directory
cd /home/your-username/public_html/your-project

# Run Laravel artisan command
php artisan storage:link
# Output should say: "The [public/storage] directory has been symbolically linked."
```

### Step 3: Check File Permissions
```bash
# Run diagnostic command
php artisan diagnose:hostinger

# If you see permission warnings, fix them:
chmod -R 0755 storage/app/public
chmod -R 0755 bootstrap/cache
```

### Step 4: Test File Storage
```bash
# Create a test file to verify storage works
php artisan tinker
>>> Storage::disk('public')->put('test.txt', 'Hello World');
>>> Storage::disk('public')->exists('test.txt');  // Should return true
>>> Storage::disk('public')->delete('test.txt');   // Cleanup
```

### Step 5: Test Product Creation with Image
1. Go to your platform admin dashboard
2. Create a new product with:
   - Name: "Test Product"
   - Price: 10.00
   - Category: Any
   - **Image: Upload a test image (JPG, PNG)**
3. Click "Salvar Produto"
4. Verify:
   - Product appears in list
   - Image is visible on product card
   - Image URL shows `/storage/products/...`

---

## 🔧 Troubleshooting Guide

### Issue: "Product creation fails immediately"
**Cause:** Likely validation error or missing category
**Solution:**
1. Open browser DevTools (F12)
2. Go to Network tab
3. Try creating product again
4. Check the POST request to `/products`
5. Look at response for error details
6. Verify:
   - Category is selected
   - Price is valid number
   - All required fields filled

### Issue: "Product created but no image"
**Cause:** Image upload not working
**Check:**
```bash
# 1. Verify storage link exists
ls -la public/ | grep storage

# 2. Check if products directory exists
ls -la storage/app/public/products/

# 3. Check file permissions
stat storage/app/public/

# 4. Test file write
php artisan tinker
>>> Storage::disk('public')->put('test.txt', 'test');
>>> Storage::disk('public')->exists('test.txt');
```

**Solution:**
1. If symlink missing: `php artisan storage:link`
2. If permissions wrong: `chmod -R 0755 storage/app/public`
3. If still fails: Contact Hostinger support

### Issue: "Storage symlink command hangs"
**Cause:** Hostinger file permissions
**Solution:**
1. Try with full path:
   ```bash
   php artisan storage:link --force
   ```
2. If still fails, check:
   ```bash
   ls -la public_html/
   ls -la storage/
   ```
3. Contact Hostinger support if permissions locked

### Issue: "Images return 403 Forbidden"
**Cause:** Symlink issue or incorrect URL
**Check:**
1. Verify symlink points to correct location:
   ```bash
   ls -la public/storage
   readlink public/storage
   ```
2. Check storage directory permissions:
   ```bash
   ls -la storage/app/public/
   ```
3. Try accessing image directly:
   ```bash
   curl https://your-domain.com/storage/products/test.jpg
   ```

---

## 📱 Browser Testing

### Test on Desktop
1. Open admin dashboard
2. Go to Products
3. Click "Novo Produto"
4. Fill form with:
   - Nome: "Burguer Premium"
   - Preço: 25.90
   - Descrição: "Teste de upload"
   - Foto: Upload a JPG image
5. Click "Salvar Produto"
6. Verify product appears with image in list

### Test on Mobile
1. Same as above but on mobile browser
2. Verify:
   - Image preview shows correctly
   - Upload works on slower connection
   - Image displays on product list

---

## 🚀 Performance Tips

### Optimize Image Uploads
Current settings:
- Max file size: 2 MB (configurable in ProductController)
- Accepted types: All image formats (JPEG, PNG, WebP, GIF)

To increase file size limit:
1. Edit `app/Http/Controllers/ProductController.php`
2. Change line 59 and 116:
   ```php
   'image' => 'nullable|image|max:5120', // 5 MB
   ```
3. Also update `php.ini` on Hostinger:
   - `upload_max_filesize = 10M`
   - `post_max_size = 10M`

### Use WebP Format
For better performance, consider:
1. Using WebP format (smaller files)
2. Implementing image optimization in backend:
   ```php
   $image = Image::make($request->file('image'))
       ->resize(800, null, ['aspect-ratio' => true])
       ->save(storage_path('app/public/products/...'), 85, 'webp');
   ```

---

## 📊 Diagnostic Report

Run this command to get a full diagnostic report:
```bash
php artisan diagnose:hostinger
```

Output will show:
- ✅/❌ Storage symlink status
- ✅/❌ Storage directory existence
- ✅/❌ File permissions
- ✅/❌ Environment variables
- ✅/❌ File write/delete capability
- ✅/❌ Symlink integrity

---

## ⚠️ Common Hostinger Issues

### Issue: "Operation not permitted"
When running `php artisan storage:link`:
```
ln: failed to create symbolic link: Operation not permitted
```
**Solution:** Hostinger sometimes restricts symlinks
1. Try with `--force` flag: `php artisan storage:link --force`
2. If still fails, ask Hostinger to enable symlinks
3. Alternative: Use `.htaccess` rewrite instead (see below)

### Alternative: Use .htaccess Rewrite (if symlinks blocked)
Create/edit `public/.htaccess`:
```apache
# At the end of RewriteRule section, add:
<IfModule mod_rewrite.c>
    RewriteRule ^storage/(.*)$ ../storage/app/public/$1 [L]
</IfModule>
```

This allows `/storage/...` URLs to work without symlink.

---

## 📞 Support

If issues persist after following this guide:
1. Run: `php artisan diagnose:hostinger`
2. Share the output with support team
3. Include error messages from browser console
4. Check Hostinger control panel for CPU/memory limits

---

## ✅ Final Checklist

After deployment to Hostinger:
- [ ] Code is pushed (Create.tsx has image upload)
- [ ] `php artisan storage:link` executed
- [ ] `php artisan diagnose:hostinger` shows all green
- [ ] Test product created with image successfully
- [ ] Image visible on product list page
- [ ] Image URL works when accessed directly
- [ ] Mobile upload works
- [ ] File size limit is appropriate for your use case
