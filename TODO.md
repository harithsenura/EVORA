# TODO for Multiple Images Fix

- [x] Edit backend/routes/products.js: Add JSON parsing for arrays (sizes, colors, orchidColors, features) and cast scalars (price, stock, discount, etc.) in POST/PUT when req.files exists; change PUT images handling to append new files to existing images array.
- [x] Edit app/admin/dashboard/page.tsx: Modify the product images file input onChange to append new File objects to the existing images array (for edits, preserving old string URLs).
- [x] Restart backend server (execute_command: cd backend && npm run dev).
- [x] Close any existing browser if open, then launch new browser to http://localhost:3001/admin, login with admin/admin.
- [ ] Test add new product: Fill form (name: "Test Product", category: select one, price: 1000, description: "Test", select 2 image files, add 2 sizes e.g. 36/10 stock, 38/5 stock, save).
- [ ] Verify product appears in products list with 2 images previewed.
- [ ] Test edit the new product: Click edit, add 1 more image file (append), save.
- [ ] Verify now shows 3 images in list/preview.
- [ ] Navigate to /products page, verify the product displays with all 3 images (e.g., in gallery or carousel if implemented).
- [x] Update TODO.md with [x] for completed steps.
- [ ] If all tests pass, attempt completion.
