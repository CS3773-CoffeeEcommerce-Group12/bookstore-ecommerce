# 🚀 Quick Start Guide - Emily's Demo

## ⚡ Run the Demo (3 commands)

```bash
# 1. Navigate to project (if not already there)
cd /Users/emilysteinmetz/bookstore-ecommerce

# 2. Ensure Supabase keys are in .env.local
# (Edit .env.local and add your keys from Supabase dashboard)

# 3. Start dev server
npm run dev
```

**Open browser:** http://localhost:3000

---

## 📋 Demo Flow (5 minutes)

### 1️⃣ **Catalog Page** (2 min)
- Search for a book → type in search bar
- Sort by "Price: Low to High"
- Toggle "In Stock Only"
- Resize browser to show responsive grid (1/2/4 columns)
- Hover over cards to show animation

### 2️⃣ **Cart Page** (3 min)
- Navigate to `/cart` in browser
- Change quantity with +/− buttons
- Watch totals update live
- Enter discount code (e.g., "SAVE10") and click "Apply Discount"
- Show discount applied (green text)
- Show grand total with tax (8.25%)
- Click "Remove" to delete an item

---

## 🎯 What to Emphasize

✅ **Responsive Design** - 1 col mobile → 2 tablet → 4 desktop  
✅ **Live Calculations** - Cart totals update instantly  
✅ **Reusable Components** - Button, Card, Input, Table, Modal  
✅ **Discount Validation** - Checks active, expiry, usage limits  
✅ **Design Consistency** - Shadows, rounded corners, hover states  

---

## 📸 Screenshots to Capture

1. Catalog page (full 4-column grid)
2. Cart page with items and discount applied
3. Mobile view (narrow browser)
4. Each UI component (Button, Card, Input)

---

## ⚙️ Troubleshooting

**Problem:** "Error: Invalid Supabase URL"  
**Fix:** Add real keys to `.env.local` from Supabase dashboard

**Problem:** "Cart is empty"  
**Fix:** Database needs seeded `cart_items` data

**Problem:** "No items found"  
**Fix:** Database needs seeded `items` data

**Problem:** Port 3000 in use  
**Fix:** Run `npx kill-port 3000` or use `PORT=3001 npm run dev`

---

## 🏆 All Tasks Complete!

✅ Design System (5 components)  
✅ Catalog (search, sort, filter, responsive)  
✅ Cart (qty stepper, live calc, discount, tax)  
✅ Responsive (1/2/4 cols)  
✅ Design Polish (shadows, rounded, hover)  

**You're ready to present! 🎉**
