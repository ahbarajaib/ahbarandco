# Ahbar & Co. — Admin Dashboard Guide

> **Admin URL:** `https://yourdomain.com/admin`  
> **Default credentials (change after first login):**  
> Email: `admin@ahbarandco.com` | Password: `adminpassword`

---

## 1. Logging In

1. Go to `/admin/login` in your browser.
2. Enter your admin email and password.
3. You are redirected to the **Dashboard Overview** on success.

> **Note:** Only users with the `admin` role can access `/admin`. Regular customers are blocked automatically.

---

## 2. Dashboard Overview (`/admin`)

The overview shows four live stats at a glance:

| Card | What it shows |
|---|---|
| **Total Revenue** | Sum of all paid, processing, shipped & delivered orders |
| **Paid/Active Orders** | Order count excluding unpaid pending |
| **Low Stock Warnings** | Products with ≤ 5 units remaining |
| **Journal Articles** | Published blog/journal posts |

Below the stats you'll see:
- **Recent Orders** — last 5 orders with customer name, date, amount, and status badge
- **Stock Warnings** — products running low with a coloured stock badge (amber = low, red = out of stock)

---

## 3. Managing Products (`/admin/products`)

### 3a. Adding a New Product

1. In the sidebar, click **"Products & Stock"**.
2. Click **"Add New Product"** (top right).
3. Fill in the form:

| Field | Required | Notes |
|---|---|---|
| **Product Name** | ✅ Yes | e.g. `Walnut Floating Shelf — 36"` |
| **Short Description** | No | 1–2 sentence summary shown on cards |
| **Long Description** | No | Full narrative, materials, craftsmanship story |
| **Price (INR)** | ✅ Yes | Enter in rupees (e.g. `24999`). System stores in paise automatically. |
| **Compare At Price (INR)** | No | Original pre-discount price (e.g. `29999`). Shows strikethrough price and sale tag on store. |
| **Stock / Inventory** | ✅ Yes | Enter number of units available |
| **Collection** | No | Select from dropdown — assigns to a collection page |
| **Material** | No | e.g. `Solid American Walnut` |
| **Dimensions** | No | e.g. `36" W × 8" D × 2" H` |
| **Care Guide** | No | e.g. `Dust with soft cloth. Avoid sunlight.` |
| **Product Images** | ✅ Yes | One image URL per line (see §3b below) |
| **Published** | — | ✅ Checked = visible in store. Uncheck to hide. |
| **Featured** | — | ✅ Checked = shown on the homepage hero section |

4. Click **"Save Product"** — you are redirected back to the product list.

### 3b. Adding Product Images

The form accepts **public image URLs**, one per line. Each product should have **at least one image** and ideally 3–4 angles.

**Recommended image sources:**
- **Unsplash** (free): `https://images.unsplash.com/photo-XXXXXXXXXX?w=1200&q=80`
- **Your own VPS uploads**: `https://yourdomain.com/uploads/shelf-1.jpg` (after uploading to `/var/lib/ahbarandco/uploads/`)
- **Any CDN / cloud storage**: paste the direct image URL

> ⚠️ Ensure URLs are publicly accessible (not behind login or private S3 policies).

**Example image block in the textarea:**
```
https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=1200&q=80
https://images.unsplash.com/photo-1615874959474-d609969a20ed?w=1200&q=80
https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=1200&q=80
```

### 3c. Editing a Product

1. Go to **Products & Stock**.
2. Click **"Edit"** next to any product row.
3. Update any fields, then click **"Save Product"**.

### 3d. Deleting a Product

1. On the product list, click **"Delete"** next to the product.
2. Confirm deletion in the prompt.

> ⚠️ Deleting a product also removes all its images from the database. Orders containing the product are **not** deleted — they retain a snapshot of the product name and price.

---

## 4. Managing Collections (`/admin/collections`)

Collections group products into themed pages (e.g. "Floating Shelves", "Lounge Chairs").

### Adding a Collection

1. Click **"Collections"** in the sidebar.
2. Click **"New Collection"**.

| Field | Required | Notes |
|---|---|---|
| **Name** | ✅ Yes | e.g. `Dining Tables` |
| **Description** | No | Short description shown on the collection page |
| **Cover Image URL** | No | A single landscape hero image |
| **Sort Order** | No | Lower number = appears first (default: `0`) |
| **Published** | — | Toggle visibility |

3. Click **"Save Collection"**.

After creating a collection, you can assign products to it when adding/editing a product via the **Collection** dropdown.

---

## 5. Managing Orders (`/admin/orders`)

### Viewing Orders

1. Click **"Orders"** in the sidebar.
2. All orders appear sorted by newest first, with status badges.

### Updating an Order Status

1. Find the order and use the **Status** dropdown on the right.
2. Select the appropriate status:

| Status | Meaning |
|---|---|
| `PENDING` | Payment not yet captured |
| `PAID` | Payment confirmed by Razorpay |
| `PROCESSING` | Being prepared/packed |
| `SHIPPED` | Dispatched to customer |
| `DELIVERED` | Delivered to customer |
| `CANCELLED` | Cancelled — not counted in revenue |

3. The status saves **instantly** on selection — no save button needed.

> Revenue figures on the dashboard only count `PAID`, `PROCESSING`, `SHIPPED`, and `DELIVERED` orders.

---

## 6. Managing Journal / Blog (`/admin/journal`)

The journal is your editorial space — design stories, material guides, behind-the-scenes posts.

### Writing a New Post

1. Click **"Journal Blog"** in the sidebar.
2. Click **"Write New Post"**.

| Field | Required | Notes |
|---|---|---|
| **Title** | ✅ Yes | Minimum 5 characters |
| **Excerpt** | No | 1–2 sentence summary shown on listing page |
| **Content** | ✅ Yes | Full article body (plain text or Markdown-style paragraphs) |
| **Cover Image URL** | No | Single landscape image for the article header |
| **Published** | — | Unchecked = draft (not visible publicly) |

3. Click **"Save Post"**.

### Editing & Deleting Posts

- Use **"Edit"** on the journal list to update a post.
- Use **"Delete"** to permanently remove a post.

---

## 7. Viewing the Live Store

From the admin sidebar, click **"View Live Store"** to open the customer-facing website in the same browser tab. Use your browser's back button to return to the dashboard.

---

## 8. Signing Out

Click **"Sign Out"** at the bottom of the admin sidebar. You are redirected to the home page.

---

## 9. Troubleshooting

| Problem | Solution |
|---|---|
| **"Access Denied" on /admin** | Your account role is not `admin`. Use the seeded admin email or update the user's `role` field to `"admin"` in the database. |
| **Images not showing** | Verify the image URL is publicly accessible. Open the URL in an incognito browser tab. |
| **Product not visible in shop** | Ensure "Published" checkbox is checked when saving. |
| **Order status not saving** | Refresh the page. If it persists, check that the database container is running (`npm run docker:up`). |
| **Low stock badge showing** | Edit the product and increase the Stock value. |

---

## 10. Quick Reference — Admin URLs

| Page | URL |
|---|---|
| Dashboard | `/admin` |
| Products | `/admin/products` |
| New Product | `/admin/products/new` |
| Collections | `/admin/collections` |
| New Collection | `/admin/collections/new` |
| Orders | `/admin/orders` |
| Journal | `/admin/journal` |
| New Post | `/admin/journal/new` |
| Admin Login | `/admin/login` |
