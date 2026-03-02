# Personal Medical Kit Web App
# Complete Maximum-Detail Documentation â€” Final Version

---

## TABLE OF CONTENTS

1. Project Overview & Philosophy
2. Technology Stack â€” Clarified
3. Architecture Overview
4. Color Theme & Typography
5. Database Design â€” Full Relational Schema (MongoDB with Foreign Keys)
6. Authentication â€” Static Hardcoded
7. Blog System â€” Stored in MongoDB
8. API Routes â€” Complete List
9. All Pages â€” Maximum Detail
10. Complete User Flows
11. Smart Behavior Rules
12. Symptom Management System
13. Navigation Structure
14. Responsive Design
15. Deployment

---

---

# SECTION 1: PROJECT OVERVIEW & PHILOSOPHY

## What This App Is

A **personal health companion** for a single user. It is three things in one:

1. **Medicine Kit Manager** â€” Know what you have, how much, when it expires
2. **Illness Journal** â€” Every time you fall sick: log it, track medicines, record recovery
3. **Illness Guides** â€” Detailed "what to do" instructions for every condition, stored in DB

## Core Philosophy

> Every interaction must take â‰¤3 clicks, require minimal typing, and work when you are sick and exhausted.

## Three Cases This App Handles

- **Case A:** You are sick. You have medicine in your kit. â†’ Log dose, reduce kit quantity.
- **Case B:** You are sick. You buy medicine outside / don't have it in kit. â†’ Log dose, kit untouched.
- **Case C:** You are not sick. Managing your kit. â†’ Add/edit medicines, restock, manage inventory.

---

---

# SECTION 2: TECHNOLOGY STACK â€” CLARIFIED

| Layer | Technology | Notes |
|-------|-----------|-------|
| Frontend + Backend | Next.js 14 (App Router) | Full-stack â€” frontend and API routes in one project |
| Styling | TailwindCSS | Custom color palette |
| Database | MongoDB Atlas | Direct connection via MONGODB_URI in env |
| ORM / Query Layer | Mongoose | Schema enforcement on MongoDB |
| Authentication | Hardcoded static | Username + password in env variables or hardcoded in API route |
| Deployment | Vercel | Auto-deploy on push |
| No separate backend server | âœ… | Next.js API routes ARE the backend |
| No external auth service | âœ… | No NextAuth, no Clerk, no JWT library needed |
| No push notifications | âœ… | â€” |
| No SMS | âœ… | â€” |
| No account creation | âœ… | â€” |

## Critical Architecture Decision
There is **no separate Express/Node server**. Everything runs inside Next.js:
- `/app/api/**` routes handle all database operations
- MongoDB is accessed directly from these route handlers via Mongoose
- The MONGODB_URI environment variable is the only connection needed

---

---

# SECTION 3: ARCHITECTURE OVERVIEW

```
Browser (Next.js Frontend)
        â†“ fetch()
Next.js API Routes (/app/api/**)
        â†“ Mongoose
MongoDB Atlas
```

### Project Folder Structure

```
/
â”œâ”€â”€ app/
â”‚   â”œâ”€â”€ (auth)/
â”‚   â”‚   â””â”€â”€ login/
â”‚   â”‚       â””â”€â”€ page.jsx
â”‚   â”œâ”€â”€ (main)/
â”‚   â”‚   â”œâ”€â”€ layout.jsx                  â† Main layout with nav
â”‚   â”‚   â”œâ”€â”€ page.jsx                    â† Dashboard /
â”‚   â”‚   â”œâ”€â”€ illness/
â”‚   â”‚   â”‚   â”œâ”€â”€ start/page.jsx          â† Start new illness
â”‚   â”‚   â”‚   â”œâ”€â”€ active/page.jsx         â† Active illness dashboard
â”‚   â”‚   â”‚   â”œâ”€â”€ history/page.jsx        â† All past illnesses
â”‚   â”‚   â”‚   â””â”€â”€ [id]/page.jsx           â† Single episode detail
â”‚   â”‚   â”œâ”€â”€ blogs/
â”‚   â”‚   â”‚   â”œâ”€â”€ page.jsx                â† All blogs index
â”‚   â”‚   â”‚   â””â”€â”€ [slug]/page.jsx         â† Single blog
â”‚   â”‚   â”œâ”€â”€ medicines/
â”‚   â”‚   â”‚   â”œâ”€â”€ page.jsx                â† Full inventory
â”‚   â”‚   â”‚   â”œâ”€â”€ add/page.jsx            â† Add new medicine
â”‚   â”‚   â”‚   â””â”€â”€ [id]/page.jsx           â† Medicine detail
â”‚   â”‚   â”œâ”€â”€ symptoms/
â”‚   â”‚   â”‚   â”œâ”€â”€ page.jsx                â† Symptom search
â”‚   â”‚   â”‚   â””â”€â”€ manage/page.jsx         â† Add/edit symptoms (admin)
â”‚   â”‚   â”œâ”€â”€ quick-access/page.jsx
â”‚   â”‚   â”œâ”€â”€ out-of-stock/page.jsx
â”‚   â”‚   â””â”€â”€ insights/page.jsx
â”‚   â””â”€â”€ api/
â”‚       â”œâ”€â”€ auth/
â”‚       â”‚   â”œâ”€â”€ login/route.js
â”‚       â”‚   â””â”€â”€ logout/route.js
â”‚       â”œâ”€â”€ medicines/
â”‚       â”‚   â”œâ”€â”€ route.js
â”‚       â”‚   â”œâ”€â”€ [id]/route.js
â”‚       â”‚   â”œâ”€â”€ take-dose/route.js
â”‚       â”‚   â”œâ”€â”€ restock/route.js
â”‚       â”‚   â”œâ”€â”€ quick-access/route.js
â”‚       â”‚   â”œâ”€â”€ low-stock/route.js
â”‚       â”‚   â””â”€â”€ expiring/route.js
â”‚       â”œâ”€â”€ episodes/
â”‚       â”‚   â”œâ”€â”€ route.js
â”‚       â”‚   â”œâ”€â”€ active/route.js
â”‚       â”‚   â””â”€â”€ [id]/
â”‚       â”‚       â”œâ”€â”€ route.js
â”‚       â”‚       â”œâ”€â”€ recover/route.js
â”‚       â”‚       â””â”€â”€ log-dose/route.js
â”‚       â”œâ”€â”€ symptoms/
â”‚       â”‚   â”œâ”€â”€ route.js                â† CRUD for symptoms table
â”‚       â”‚   â””â”€â”€ search/route.js
â”‚       â”œâ”€â”€ categories/
â”‚       â”‚   â””â”€â”€ route.js                â† CRUD for categories table
â”‚       â”œâ”€â”€ blogs/
â”‚       â”‚   â”œâ”€â”€ route.js
â”‚       â”‚   â””â”€â”€ [slug]/route.js
â”‚       â”œâ”€â”€ usage/
â”‚       â”‚   â”œâ”€â”€ route.js
â”‚       â”‚   â””â”€â”€ [id]/route.js
â”‚       â””â”€â”€ insights/
â”‚           â””â”€â”€ route.js
â”œâ”€â”€ lib/
â”‚   â”œâ”€â”€ mongodb.js                      â† MongoDB connection singleton
â”‚   â””â”€â”€ auth.js                         â† Session check helper
â”œâ”€â”€ models/
â”‚   â”œâ”€â”€ Medicine.js
â”‚   â”œâ”€â”€ Category.js
â”‚   â”œâ”€â”€ Symptom.js
â”‚   â”œâ”€â”€ MedicineSymptom.js
â”‚   â”œâ”€â”€ IllnessEpisode.js
â”‚   â”œâ”€â”€ EpisodeMedicine.js
â”‚   â”œâ”€â”€ EpisodeDose.js
â”‚   â”œâ”€â”€ UsageLog.js
â”‚   â””â”€â”€ Blog.js
â””â”€â”€ middleware.js                        â† Auth check on all routes
```

---

---

# SECTION 4: COLOR THEME & TYPOGRAPHY

## Color Palette

| Token Name | Hex | Usage |
|-----------|-----|-------|
| `color-primary` | `#A3C6A0` | Primary buttons, key actions |
| `color-secondary` | `#6FAF9B` | Secondary buttons, accents |
| `color-bg` | `#F5F3E7` | Page background |
| `color-border` | `#D8D8D8` | Card borders, dividers |
| `color-text` | `#333333` | Body text |
| `color-warning` | `#F29F8F` | Low stock (â‰¤3), cautions |
| `color-danger` | `#E57373` | Out of stock, expired, critical |
| `color-expiry` | `#F5C842` | Expiring soon (â‰¤30 days) |
| `color-success` | `#7DBE7A` | Recovered, in stock, confirmed |

## Typography

| Element | Size | Weight | Notes |
|---------|------|--------|-------|
| Page Headings | 28px | Bold | Large and clear |
| Section Headings | 22px | SemiBold | â€” |
| Body Text | 18px | Regular | Larger than normal for sick-day reading |
| Button Text | 20px | Bold | Easy to read, large tap targets |
| Labels / Meta | 14px | Regular | Secondary info |
| Line Height | 1.8 | â€” | Extra spacing for clarity |
| Font Family | Inter | â€” | Clean, readable |

---

---

# SECTION 5: DATABASE DESIGN â€” FULL RELATIONAL SCHEMA

## Philosophy
MongoDB is used but with **proper relational thinking**:
- Separate collections act as **tables**
- ObjectId references act as **foreign keys**
- No arrays of strings for relational data â€” proper junction collections instead
- All lookups done via `$lookup` aggregations (equivalent of SQL JOINs)

---

## 5.1 Collection: `categories`
Master list of medicine categories. Managed from the web app.

```javascript
{
  _id: ObjectId,                 // PK
  name: String,                  // "Pain & Fever", "Stomach", "Allergy", "Supplement", "Mental Health", "Other"
  slug: String,                  // "pain-fever", "stomach" â€” URL safe, unique
  emoji: String,                 // "ðŸ’Š", "ðŸ¦ ", "ðŸ¤§"
  description: String,           // Optional description
  sortOrder: Number,             // For display ordering
  isActive: Boolean,             // Soft delete
  createdAt: Date,
  updatedAt: Date
}
```
**Index:** `slug` (unique)

---

## 5.2 Collection: `symptoms`
Master list of all symptoms. **Fully managed from the web app â€” add new symptoms anytime.**

```javascript
{
  _id: ObjectId,                 // PK
  name: String,                  // "Fever", "Headache", "Nausea"
  slug: String,                  // "fever", "headache" â€” unique, URL safe
  emoji: String,                 // "ðŸŒ¡ï¸", "ðŸ¤•", "ðŸ¤¢"
  description: String,           // Optional â€” what this symptom means
  isCommon: Boolean,             // TRUE = appears on quick symptom grid
  sortOrder: Number,             // Controls grid display order
  isActive: Boolean,             // Soft delete â€” hide without removing
  createdAt: Date,
  updatedAt: Date
}
```
**Index:** `slug` (unique), `isCommon`

---

## 5.3 Collection: `medicines`
Core medicine kit. Each medicine belongs to one category.

```javascript
{
  _id: ObjectId,                 // PK
  name: String,                  // "Paracetamol 500mg"
  categoryId: ObjectId,          // FK â†’ categories._id
  purpose: String,               // "Reduces fever and relieves pain"
  usageNotes: String,            // "Take with food if stomach sensitive"
  dosage: String,                // "1 tablet every 6 hours with water"
  doseIntervalHours: Number,     // 6 â€” minimum hours between doses (safety warning)
  quantity: Number,              // Current stock count
  defaultQuantity: Number,       // What quantity resets to on restock
  unit: String,                  // "tablet", "ml", "capsule", "sachet"
  expiryDate: Date,              // Expiry date
  isExpired: Boolean,            // Computed: expiryDate < now
  isActive: Boolean,             // Soft delete
  usageCount: Number,            // Total doses taken (from kit only)
  lastUsed: Date,                // Last time a dose was taken from kit
  lastDoseTaken: Date,           // Timestamp of last dose (for interval check)
  isQuickAccess: Boolean,        // Auto-pinned based on usage frequency
  createdAt: Date,
  updatedAt: Date
}
```
**Indexes:** `categoryId`, `isActive`, `expiryDate`, `quantity`

---

## 5.4 Collection: `medicine_symptoms`
**Junction table** â€” links medicines to symptoms (many-to-many).
This replaces the old `symptoms: [String]` array on the medicine document.

```javascript
{
  _id: ObjectId,                 // PK
  medicineId: ObjectId,          // FK â†’ medicines._id
  symptomId: ObjectId,           // FK â†’ symptoms._id
  isPrimary: Boolean,            // TRUE = this is the main symptom for this medicine
  createdAt: Date
}
```
**Indexes:** `medicineId`, `symptomId`, compound `{ medicineId, symptomId }` (unique)

**What this enables:**
- Find all medicines for a symptom: query `medicine_symptoms` where `symptomId = X`
- Find all symptoms for a medicine: query `medicine_symptoms` where `medicineId = Y`
- Add new symptom to a medicine from the web UI â€” just insert a row here
- Remove symptom from a medicine â€” delete the row

---

## 5.5 Collection: `illness_episodes`
One document per illness. The core of the health journal.

```javascript
{
  _id: ObjectId,                 // PK
  name: String,                  // "Fever", "Cold & Flu", "Food Poisoning"
  startDate: Date,
  recoveryDate: Date,            // null if ongoing
  isOngoing: Boolean,
  blogId: ObjectId,              // FK â†’ blogs._id (auto-suggested on start)
  overallEffectiveness: String,  // "recovered" | "partial" | "worsened" | null
  durationDays: Number,          // Auto-calculated when recoveryDate is set
  notes: String,
  createdAt: Date,
  updatedAt: Date
}
```
**Index:** `isOngoing`, `startDate` (descending)

---

## 5.6 Collection: `episode_symptoms`
**Junction table** â€” symptoms logged for a specific illness episode.

```javascript
{
  _id: ObjectId,                 // PK
  episodeId: ObjectId,           // FK â†’ illness_episodes._id
  symptomId: ObjectId,           // FK â†’ symptoms._id
  createdAt: Date
}
```
**Index:** `episodeId`, `symptomId`

---

## 5.7 Collection: `episode_medicines`
**Junction table** â€” each medicine involved in an illness episode.
One row per medicine per episode.

```javascript
{
  _id: ObjectId,                 // PK
  episodeId: ObjectId,           // FK â†’ illness_episodes._id
  medicineId: ObjectId,          // FK â†’ medicines._id â€” NULL if external
  medicineName: String,          // Always stored for display (handles external + deleted medicines)
  isFromKit: Boolean,            // TRUE = kit qty reduced | FALSE = external, kit unaffected
  createdAt: Date
}
```
**Index:** `episodeId`, `medicineId`

---

## 5.8 Collection: `episode_doses`
**Individual dose log** â€” each time medicine was taken during an episode.
Child of `episode_medicines`.

```javascript
{
  _id: ObjectId,                 // PK
  episodeMedicineId: ObjectId,   // FK â†’ episode_medicines._id
  episodeId: ObjectId,           // FK â†’ illness_episodes._id (for direct queries)
  medicineId: ObjectId,          // FK â†’ medicines._id â€” NULL if external
  medicineName: String,          // Stored for display
  isFromKit: Boolean,
  amount: Number,                // Dose size (e.g. 1, 2, 5ml)
  unit: String,                  // "tablet", "ml"
  takenAt: Date,
  wasEffective: Boolean,         // null â†’ true/false (user marks later)
  notes: String,
  createdAt: Date
}
```
**Index:** `episodeId`, `medicineId`, `takenAt` (descending)

---

## 5.9 Collection: `blogs`
Illness guide blogs. **Stored in MongoDB â€” fully managed from the web app.**
Not static files. Editable, updatable, new blogs addable anytime.

```javascript
{
  _id: ObjectId,                 // PK
  slug: String,                  // "fever", "cold-flu" â€” unique, URL safe
  title: String,                 // "What To Do When You Have Fever"
  emoji: String,                 // "ðŸŒ¡ï¸"
  estimatedRecovery: String,     // "2â€“3 days"
  isPublished: Boolean,          // Draft vs published
  sortOrder: Number,

  sections: [
    {
      id: String,                // "first-steps", "warning-signs"
      heading: String,
      content: String,           // Rich text / markdown
      isWarning: Boolean,        // Renders with red warning style
      sortOrder: Number
    }
  ],

  relatedBlogIds: [ObjectId],    // FK â†’ blogs._id (related guides)
  createdAt: Date,
  updatedAt: Date
}
```
**Index:** `slug` (unique), `isPublished`

---

## 5.10 Collection: `blog_symptoms`
**Junction table** â€” links blogs to symptoms.
Used for: "When you select Fever symptom â†’ show Fever blog."

```javascript
{
  _id: ObjectId,                 // PK
  blogId: ObjectId,              // FK â†’ blogs._id
  symptomId: ObjectId,           // FK â†’ symptoms._id
  isPrimary: Boolean,            // Main symptom for this blog
  createdAt: Date
}
```
**Index:** `blogId`, `symptomId`

---

## 5.11 Full Entity Relationship Diagram (Text)

```
categories
  â””â”€< medicines (categoryId)
        â””â”€< medicine_symptoms (medicineId)
              >â”€ symptoms
                   â””â”€< blog_symptoms (symptomId)
                         >â”€ blogs
                   â””â”€< episode_symptoms (symptomId)
                         >â”€ illness_episodes
                               â””â”€< episode_medicines (episodeId)
                                     â””â”€< episode_doses (episodeMedicineId)
```

---

---

# SECTION 6: AUTHENTICATION â€” STATIC HARDCODED

No auth library. No JWT. No database user record. Pure hardcoded check.

```javascript
// /app/api/auth/login/route.js

const VALID_USERNAME = process.env.APP_USERNAME || "admin";
const VALID_PASSWORD = process.env.APP_PASSWORD || "medkit2024";
const SESSION_SECRET = process.env.SESSION_SECRET;

export async function POST(request) {
  const { username, password, rememberMe } = await request.json();

  if (username !== VALID_USERNAME || password !== VALID_PASSWORD) {
    return Response.json({ error: "Invalid credentials" }, { status: 401 });
  }

  // Set HTTP-only session cookie
  const cookieMaxAge = rememberMe ? 60 * 60 * 24 * 30 : undefined; // 30 days or session
  // Set cookie and return success
}
```

```javascript
// /middleware.js â€” Runs on every request
// If no valid session cookie â†’ redirect to /login
// Public route exception: /login only
```

```env
APP_USERNAME=your_username
APP_PASSWORD=your_password
SESSION_SECRET=random_string_minimum_32_chars
MONGODB_URI=your_mongodb_connection_string
```

**Rules:**
- No password reset
- No account creation
- No PIN
- "Remember me" â†’ 30-day cookie
- Unchecked â†’ session cookie (expires when browser closes)
- All `/app/api/**` routes check session â†’ 401 if unauthenticated
- All pages check session via middleware â†’ redirect to `/login`

---

---

# SECTION 7: BLOG SYSTEM â€” MONGODB STORED

Blogs are stored in the `blogs` MongoDB collection.
They are fully manageable from the web app:
- Add new blog from UI
- Edit sections
- Publish/unpublish
- Link to symptoms (via `blog_symptoms` junction table)
- Linked blogs auto-suggest when starting an illness episode

## Blog Management Page: `/blogs/manage`
Admin-style interface to:
- See all blogs (published + drafts)
- Add new blog with sections
- Edit existing blog content
- Link/unlink symptoms to blog
- Publish or unpublish

---

---

# SECTION 8: API ROUTES â€” COMPLETE LIST

## Auth
```
POST  /api/auth/login           Body: { username, password, rememberMe }
POST  /api/auth/logout
GET   /api/auth/check           Returns: { authenticated: true/false }
```

## Categories
```
GET   /api/categories           All active categories
POST  /api/categories           Create new category
PUT   /api/categories/[id]      Update category
DELETE /api/categories/[id]     Soft delete (isActive: false)
```

## Symptoms
```
GET   /api/symptoms             All symptoms (query: ?isCommon=true for grid only)
POST  /api/symptoms             Create new symptom
PUT   /api/symptoms/[id]        Update symptom (name, emoji, isCommon, sortOrder)
DELETE /api/symptoms/[id]       Soft delete (isActive: false)
GET   /api/symptoms/search      Query: ?q=fev â†’ returns matching symptoms
```

## Medicines
```
GET   /api/medicines            All medicines with category + symptoms via $lookup
                                Query: ?categoryId=X, ?symptomId=Y, ?lowStock=true
POST  /api/medicines            Create medicine + medicine_symptoms rows
GET   /api/medicines/[id]       Single medicine with full detail
PUT   /api/medicines/[id]       Update medicine
DELETE /api/medicines/[id]      Soft delete
POST  /api/medicines/[id]/add-symptom     Body: { symptomId }  â†’ insert medicine_symptoms row
DELETE /api/medicines/[id]/remove-symptom Body: { symptomId }  â†’ delete medicine_symptoms row
POST  /api/medicines/take-dose  Body: { medicineId, amount, episodeId? }
                                â†’ Check doseInterval â†’ warn if too soon
                                â†’ Reduce quantity
                                â†’ Update lastDoseTaken, lastUsed, usageCount
                                â†’ Insert episode_dose if episodeId provided
POST  /api/medicines/restock    Body: { medicineId } or { categoryId } for bulk
GET   /api/medicines/quick-access
GET   /api/medicines/low-stock  Returns medicines where quantity â‰¤ 3
GET   /api/medicines/expiring   Returns medicines where expiryDate â‰¤ 30 days from now
```

## Illness Episodes
```
GET   /api/episodes             All episodes, sorted by startDate DESC
                                Full data via $lookup: symptoms, medicines, doses
POST  /api/episodes             Start new episode
                                Body: { name, symptomIds[], blogId?, notes? }
                                â†’ Creates episode + episode_symptoms rows
GET   /api/episodes/active      Current ongoing episode with full detail
GET   /api/episodes/[id]        Single episode with all doses grouped by day
PUT   /api/episodes/[id]        Update episode (name, notes, blogId)
POST  /api/episodes/[id]/recover
                                Body: { overallEffectiveness }
                                â†’ Sets recoveryDate = now, isOngoing = false
                                â†’ Calculates durationDays
POST  /api/episodes/[id]/log-dose
                                Body: {
                                  medicineId?,       â† null if external
                                  medicineName,
                                  isFromKit,
                                  amount,
                                  unit,
                                  takenAt?,
                                  notes?
                                }
                                â†’ If isFromKit = true:
                                    Reduce medicine.quantity by amount
                                    Update medicine.lastDoseTaken
                                    Check dose interval â†’ return warning if too soon
                                â†’ If isFromKit = false:
                                    Kit inventory NOT touched
                                â†’ Insert episode_medicines row (if first dose of this medicine)
                                â†’ Insert episode_doses row
                                â†’ Insert usage_log row
```

## Symptoms (Episode)
```
POST  /api/episodes/[id]/add-symptom     Body: { symptomId } â†’ insert episode_symptoms
DELETE /api/episodes/[id]/remove-symptom Body: { symptomId } â†’ delete episode_symptoms
```

## Blogs
```
GET   /api/blogs                All published blogs (query: ?all=true for drafts too)
POST  /api/blogs                Create new blog
GET   /api/blogs/[slug]         Single blog with related symptoms via $lookup
PUT   /api/blogs/[slug]         Update blog content / sections
DELETE /api/blogs/[slug]        Soft delete (isPublished: false)
POST  /api/blogs/[slug]/add-symptom    Body: { symptomId } â†’ insert blog_symptoms row
DELETE /api/blogs/[slug]/remove-symptom Body: { symptomId }
```

## Usage Logs
```
GET   /api/usage                All usage logs, newest first
                                Query: ?medicineId=X, ?episodeId=Y, ?limit=N
```

## Insights
```
GET   /api/insights             All insights computed from episodes + doses
                                Returns: {
                                  illnessFrequency: [...],
                                  effectiveMedicines: [...],
                                  averageRecovery: {...},
                                  mostUsedMedicines: [...],
                                  kitHealth: {...}
                                }
```

---

---

# SECTION 9: ALL PAGES â€” MAXIMUM DETAIL

---

## 9.1 `/login` â€” Login Page

**Layout:** Centered card on beige background
**Elements:**
- App logo / name "MedKit"
- Username input (large, 18px placeholder)
- Password input (large, show/hide toggle)
- "Remember me for 30 days" checkbox
- [LOGIN] button â€” full width, sage green, 20px bold
- No "forgot password", no "create account"

**Behavior:**
- On submit â†’ POST /api/auth/login
- Success â†’ redirect to `/`
- Failure â†’ inline error "Incorrect username or password"
- If already logged in â†’ redirect to `/`

---

## 9.2 `/` â€” Dashboard

**Purpose:** The sick-day command center. Surfaces the most important information immediately.

### Above Fold â€” Action Buttons
```
LARGE HEADING: "How are you feeling?"

[ðŸ¤’ I'm Sick â€” Start Illness Log]
[ðŸ’Š Quick Medicines]
[ðŸ›’ Need to Buy]
```
Buttons: Full width on mobile, 3-column grid on desktop. 80px height. Bold 20px text.

### Active Illness Banner (conditional â€” shown only if isOngoing episode exists)
```
â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”
ðŸ¤’  ONGOING ILLNESS: Fever â€” Day 2
    Started Monday 2 Dec 2024

    [ðŸ“– Read Guide]  [ðŸ’Š Log Dose]  [âœ… I'm Better]
â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”
```
Background: soft coral. Persistent until episode is closed.

### Alerts Row (conditional â€” shown only if alerts exist)
```
âš ï¸ Ibuprofen expires Dec 2025 (amber)
ðŸ”´ Anti-nausea â€” OUT OF STOCK (red)
ðŸŸ¡ Ibuprofen â€” only 1 left (coral)
ðŸ”´ Paracetamol â€” EXPIRED (red)
```
Horizontal scrollable on mobile.

### Quick Access Medicines
```
QUICK ACCESS
[Paracetamol â€” ðŸŸ¢ 8 left]   [Ibuprofen â€” ðŸŸ¡ 3 left]
[Vitamin C â€” ðŸŸ¢ 15 left]     [Antacid â€” ðŸŸ¢ 6 left]
```
Click â†’ goes to medicine detail page.

### Recently Used
```
RECENTLY USED
â€¢ Paracetamol 500mg â€” 2 hours ago â€” ðŸŸ¢ 8 left
â€¢ Ibuprofen 400mg â€” 3 days ago â€” ðŸŸ¡ 3 left
â€¢ Vitamin C â€” 1 week ago â€” ðŸŸ¢ 15 left
```

### Recent Illness Episodes (last 3)
```
RECENT ILLNESSES
â€¢ Nov 2024 â€” Fever â€” 3 days â€” âœ… Recovered
â€¢ Aug 2024 â€” Cold & Flu â€” 5 days â€” âœ… Recovered
[View Full History â†’]
```

### Bottom Links
```
[+ Add New Medicine]   [View Full Inventory]
```

---

## 9.3 `/illness/start` â€” Start New Illness Episode

**Purpose:** Begin logging a sick day. Zero typing required.

### Step 1: Symptom Selection
```
HOW ARE YOU FEELING TODAY?

COMMON SYMPTOMS (pulled from symptoms where isCommon=true):
[ðŸ¤’ Fever]    [ðŸ¤• Headache]    [ðŸ¤¢ Nausea]
[ðŸ˜· Cold&Flu] [ðŸ’Š Body Pain]   [ðŸ¤§ Allergy]
[ðŸ¦  Stomach]  [ðŸ˜´ Sleep Aid]   [ðŸ˜£ Anxiety]

All symptoms available in dropdown below grid for less common ones.

YOUR RECENT SYMPTOMS (from your last 5 episodes):
[Headache â€” 2 days ago]   [Fever â€” 1 week ago]

SHOW ALL SYMPTOMS:
[Dropdown â€” all active symptoms from symptoms collection]
```

Multiple symptoms can be selected. Selected = highlighted in sage green.

### Step 2: After Symptom Selection (auto-shown below)
```
BASED ON YOUR SYMPTOMS:

SUGGESTED ILLNESS NAME: Fever & Headache
[Edit name if needed: ____________]

RECOMMENDED GUIDE:
[ðŸ“– Fever Guide â€” What To Do â†’]  (auto-matched via blog_symptoms)

MEDICINES IN YOUR KIT FOR THESE SYMPTOMS:
[Paracetamol â€” ðŸŸ¢ 8 left]  [Ibuprofen â€” ðŸŸ¡ 3 left]

[START ILLNESS LOG â†’]
```

### On Submit:
- Creates `illness_episodes` document (isOngoing: true)
- Creates `episode_symptoms` rows for each selected symptom
- Redirects to `/illness/active`

---

## 9.4 `/illness/active` â€” Active Illness Dashboard

**Purpose:** Your control panel while you are sick. Everything here.

```
â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”
ðŸ¤’ FEVER & HEADACHE
Day 2 of illness
Started: Monday, 2 December 2024
â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”

ðŸ“– ILLNESS GUIDE
[Read: What To Do When You Have Fever â†’]
(Links to blog matched via blog_symptoms for this episode's symptoms)

â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”
MEDICINES TAKEN TODAY (2 Dec)

[From Kit] Paracetamol 500mg â€” 2:30 PM â€” 1 tablet âœ…
[External] ORS Sachet â€” 4:00 PM â€” 1 sachet ðŸ“¦

YESTERDAY (1 Dec)
[From Kit] Paracetamol 500mg â€” 9:00 AM â€” 1 tablet
[From Kit] Paracetamol 500mg â€” 3:00 PM â€” 1 tablet
â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”

LOG NEXT DOSE:

[ðŸ’Š FROM MY KIT]          [ðŸ“¦ EXTERNAL MEDICINE]

â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”
[âœ… I'm Feeling Better â€” Close This Episode]
â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”
```

### "From My Kit" Dose Logging Flow (modal/inline):
```
TAKE FROM KIT

Matched medicines for your symptoms:
[PARACETAMOL 500mg â€” ðŸŸ¢ 8 left â€” Take 1 dose]
[IBUPROFEN 400mg â€” ðŸŸ¡ 3 left â€” Take 1 dose]

Can't find it? â†’ Search all kit medicines
[Search: ____________]

On "Take 1 dose":
  â†’ Check doseIntervalHours vs lastDoseTaken
  â†’ If too soon: show warning toast (not a blocker):
    "âš ï¸ You took Paracetamol 2 hours ago. Safe interval is 6 hours. Take anyway?"
    [TAKE ANYWAY]   [CANCEL]
  â†’ On confirm: reduce quantity, log episode_dose, update lastDoseTaken
```

### "External Medicine" Dose Logging Flow (modal/inline):
```
LOG EXTERNAL MEDICINE
(This will NOT affect your kit inventory)

Medicine Name: [____________]  (free text â€” no autocomplete required)
Amount: [1]   Unit: [tablet â–¼]
Notes (optional): [____________]

[LOG THIS DOSE]

â†’ Inserts episode_medicines (isFromKit: false, medicineId: null)
â†’ Inserts episode_doses
â†’ Kit inventory untouched
```

### "I'm Feeling Better" Flow:
```
CLOSE THIS ILLNESS

How did your recovery go?
[âœ… Fully Recovered]   [ðŸ˜ Partial Recovery]   [ðŸ˜Ÿ Got Worse]

Optional notes:
[________________________________]

[CLOSE EPISODE]

â†’ Sets recoveryDate = now
â†’ Sets isOngoing = false
â†’ Calculates durationDays
â†’ Redirects to /illness/[id] (episode summary)
```

---

## 9.5 `/illness/history` â€” Full Illness History

```
ILLNESS HISTORY

2024
â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
Dec 2024 â€” ðŸ¤’ Ongoing
  ðŸŒ¡ï¸ FEVER & HEADACHE
  Started 2 Dec 2024 â€” Day 2
  [Continue â†’]

Nov 2024 âœ… Recovered
  ðŸŒ¡ï¸ FEVER
  2 Nov â†’ 4 Nov 2024 (3 days)
  Medicines: Paracetamol Ã—6 (kit), ORS Ã—3 (external)
  [View Details]

Aug 2024 âœ… Recovered
  ðŸ˜· COLD & FLU
  12 Aug â†’ 17 Aug 2024 (5 days)
  Medicines: Cetirizine Ã—4 (kit), Strepsils Ã—1 (external)
  [View Details]

2023
â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
Dec 2023 âœ… Recovered
  ðŸŒ¡ï¸ FEVER
  15 Dec â†’ 19 Dec 2023 (4 days)
  [View Details]
```

Sorted newest first. Year dividers auto-generated.

---

## 9.6 `/illness/[id]` â€” Episode Detail Page

```
â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”
ðŸŒ¡ï¸ FEVER
2 November â†’ 4 November 2024 (3 days)
âœ… Fully Recovered
â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”

SYMPTOMS:
Fever Â· Headache Â· Body Pain

ILLNESS GUIDE READ:
ðŸ“– Fever Care Guide âœ…

â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”
MEDICINES TAKEN

Day 1 â€” Friday, 2 Nov
  ðŸ’Š Paracetamol 500mg â€” 9:00 AM â€” 1 tablet  [Kit]
  ðŸ’Š Paracetamol 500mg â€” 3:00 PM â€” 1 tablet  [Kit]
  ðŸ“¦ ORS Sachet â€” 5:00 PM â€” 1 sachet         [External]
  ðŸ’Š Paracetamol 500mg â€” 9:00 PM â€” 1 tablet  [Kit]

Day 2 â€” Saturday, 3 Nov
  ðŸ’Š Paracetamol 500mg â€” 8:00 AM â€” 1 tablet  [Kit]
  ðŸ’Š Ibuprofen 400mg â€” 2:00 PM â€” 1 tablet    [Kit]
  ðŸ’Š Paracetamol 500mg â€” 8:00 PM â€” 1 tablet  [Kit]
  ðŸ“¦ ORS Sachet â€” 10:00 AM â€” 1 sachet        [External]

Day 3 â€” Sunday, 4 Nov
  ðŸ’Š Paracetamol 500mg â€” 9:00 AM â€” 1 tablet  [Kit]
  ðŸ’Š Paracetamol 500mg â€” 3:00 PM â€” 1 tablet  [Kit]
â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”

NOTES:
Stayed hydrated, slept 10 hours. Fever broke on day 3 morning.

TOTAL DOSES: 10 kit doses, 2 external doses
â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”
```

---

## 9.7 `/blogs` â€” All Illness Guides Index

```
ðŸ“š ILLNESS GUIDES
Your personal reference when you're sick

PUBLISHED GUIDES (from blogs collection where isPublished=true):

[ðŸŒ¡ï¸ Fever]          [ðŸ˜· Cold & Flu]       [ðŸ¤¢ Food Poisoning]
[ðŸ¤• Headache]        [ðŸ¦  Stomach Flu]      [ðŸ¤§ Allergy]
[ðŸ’Š Body Pain]       [ðŸ˜´ Insomnia]         [ðŸ˜£ Anxiety]

[+ Add New Guide]  â† visible always, links to /blogs/manage
```

Cards show: emoji, title, estimated recovery time.

---

## 9.8 `/blogs/[slug]` â€” Individual Blog Guide

```
â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”
ðŸŒ¡ï¸ WHAT TO DO WHEN YOU HAVE FEVER
Estimated Recovery: 2â€“3 days
â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”

TABLE OF CONTENTS (anchor links):
â†’ First Steps
â†’ Medicines To Take
â†’ âš ï¸ Warning Signs
â†’ Diet & Hydration
â†’ Recovery Timeline
â†’ When To See A Doctor

â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”

FIRST STEPS â€” DO THIS IMMEDIATELY
[Content from sections array...]

MEDICINES TO TAKE
[Content...]

âš ï¸ WARNING SIGNS â€” SEE A DOCTOR IF:  â† red background section
[Content...]

DIET & HYDRATION
[Content...]

RECOVERY TIMELINE
[Content...]

WHEN TO SEE A DOCTOR
[Content...]

â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”
[ðŸ¤’ I Have These Symptoms â†’ Start Illness Log]

RELATED GUIDES:
[ðŸ˜· Cold & Flu]   [ðŸ’Š Body Pain]

â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”
[âœï¸ Edit This Guide]
```

---

## 9.9 `/blogs/manage` â€” Blog Management (Add/Edit)

Two views:

### A) Blog List View
```
MANAGE ILLNESS GUIDES

[+ CREATE NEW GUIDE]

PUBLISHED:
â€¢ ðŸŒ¡ï¸ Fever â€” updated 3 weeks ago  [Edit] [Unpublish]
â€¢ ðŸ˜· Cold & Flu â€” updated 1 month ago  [Edit] [Unpublish]

DRAFTS:
â€¢ ðŸ¦  Stomach Flu â€” draft  [Edit] [Publish]
```

### B) Blog Editor View
```
EDIT GUIDE: Fever

Title: [What To Do When You Have Fever_________]
Emoji: [ðŸŒ¡ï¸]
Estimated Recovery: [2â€“3 days___________________]
Status: [Published â–¼]

LINKED SYMPTOMS:
Current: Fever âœ… Â· Chills âœ… Â· High Temperature âœ…
[+ Link Symptom: search and add from symptoms table]

SECTIONS:
â”â”â”â”â”â”â”â”â”â”
[â†‘â†“] Section 1: First Steps
     Heading: [First Steps â€” Do This Immediately]
     Content: [textarea...]
     Warning style: [ ] Yes
     [Delete Section]
â”â”â”â”â”â”â”â”â”â”
[â†‘â†“] Section 2: Medicines To Take
     Heading: [Medicines To Take]
     Content: [textarea...]
     Warning style: [ ] Yes
     [Delete Section]
â”â”â”â”â”â”â”â”â”â”
[+ ADD SECTION]

RELATED GUIDES:
[+ Link related blog]

[SAVE DRAFT]   [SAVE & PUBLISH]
```

---

## 9.10 `/symptoms/manage` â€” Symptom Management

**Purpose:** Add new symptoms, edit existing ones, mark which appear on the quick grid.

```
MANAGE SYMPTOMS

[+ ADD NEW SYMPTOM]

COMMON SYMPTOMS (shown on quick grid):
â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”
ðŸŒ¡ï¸ Fever         slug: fever      isCommon: âœ…   [Edit] [Remove from grid]
ðŸ¤• Headache      slug: headache   isCommon: âœ…   [Edit] [Remove from grid]
ðŸ¤¢ Nausea        slug: nausea     isCommon: âœ…   [Edit] [Remove from grid]
[... up to 9 shown on grid ...]

ALL OTHER SYMPTOMS:
â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”
ðŸ˜¤ Congestion    slug: congestion isCommon: âŒ   [Edit] [Add to grid]
ðŸ’§ Runny Nose    slug: runny-nose isCommon: âŒ   [Edit] [Add to grid]
[+ ADD NEW SYMPTOM]
```

### Add / Edit Symptom Form (inline or modal):
```
Symptom Name: [________________]
Emoji: [ðŸŒ¡ï¸]
Slug: [auto-generated from name, editable]
Description: [________________] (optional)
Show on quick grid: [âœ… Yes / âŒ No]
Sort order (grid position): [1]

[SAVE SYMPTOM]
```

---

## 9.11 `/medicines` â€” Full Inventory

```
ALL MEDICINES

[+ ADD NEW MEDICINE]   [FILTER: All Categories â–¼]

âš ï¸ EXPIRING SOON
â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
â€¢ Ibuprofen 400mg â€” âš ï¸ Expires Dec 2025   [Edit]

PAIN & FEVER  (category from categories table)
â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
Paracetamol 500mg
  ðŸŸ¢ 12 tablets   Exp: Jun 2026
  Symptoms: Fever Â· Headache Â· Body Pain
  [TAKE DOSE]  [RESTOCK]  [EDIT]

Ibuprofen 400mg
  ðŸŸ¡ 3 tablets   âš ï¸ Exp: Dec 2025
  Symptoms: Fever Â· Body Pain Â· Inflammation
  [TAKE DOSE]  [RESTOCK]  [EDIT]

STOMACH
â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
Antacid Tablets
  ðŸŸ¢ 8 tablets   Exp: Mar 2026
  [TAKE DOSE]  [RESTOCK]  [EDIT]

Anti-Nausea
  ðŸ”´ OUT OF STOCK   Exp: Aug 2026
  [RESTOCK]  [EDIT]
```

---

## 9.12 `/medicines/[id]` â€” Medicine Detail

```
â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”
PARACETAMOL 500mg
Category: Pain & Fever
â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”

Purpose: Reduces fever and relieves mild to moderate pain.
Dosage: 1 tablet every 6 hours with water.
Safe Interval: 6 hours minimum between doses.
Usage notes: Do not exceed 4 tablets in 24 hours.

STOCK STATUS:
ðŸŸ¢ 12 tablets available
Expiry: June 2026 âœ…

âš ï¸ DOSAGE WARNING (shown only if last dose < 6 hours ago):
"You took this 3 hours ago. Safe interval is 6 hours."

â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”
[TAKE 1 DOSE NOW]   â† large primary button
[RESTOCK]
â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”

HELPS WITH:
Fever Â· Headache Â· Body Pain
[+ Add symptom]   [Manage symptoms â†’]

RECENT USAGE:
â€¢ Today 2:30 PM â€” Fever episode (Day 2) âœ…
â€¢ Yesterday 8:15 PM â€” Fever episode (Day 1) âœ…
â€¢ 3 days ago â€” standalone dose

[View Full History]

â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”
[âœï¸ Edit Medicine]   [ðŸ—‘ï¸ Delete Medicine]
â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”
```

---

## 9.13 `/medicines/add` â€” Add New Medicine

```
ADD NEW MEDICINE

Name: [_______________________]
(Placeholder: e.g. Paracetamol 500mg)

Category:
[Pain & Fever] [Stomach] [Allergy] [Supplement] [Mental Health] [Other]
(Loaded from categories collection)

Default Stock Quantity: [10]
Unit: [tablet â–¼]  (tablet / capsule / ml / sachet / drop)

Current Quantity: [10]
(Pre-filled = default, editable)

Dosage Instructions: [1 tablet every 6 hours with water____________]
(Common templates selectable: every 4h / 6h / 8h / 12h / 24h / as needed)

Minimum Dose Interval: [6] hours

Purpose / Description: [_______________________] (optional)
Usage Notes: [_______________________] (optional, e.g. "Take with food")

Expiry Date: [MM] / [YYYY]

Symptoms This Medicine Helps:
Search and select from symptoms table:
[Search symptoms: ____________]
Selected: [Fever âœ•] [Headache âœ•] [Body Pain âœ•]
[Can't find your symptom? â†’ Add new symptom]

[SAVE MEDICINE]
```

---

## 9.14 `/out-of-stock` â€” Shopping List

```
ðŸ›’ NEED TO BUY

PAIN & FEVER:
â€¢ Paracetamol 500mg  â†’  ðŸ”´ OUT
  [MARK RESTOCKED: 10 â–¼ tablets]

â€¢ Ibuprofen 400mg  â†’  ðŸŸ¡ 1 left (almost out)
  [MARK RESTOCKED: 10 â–¼ tablets]

STOMACH:
â€¢ Anti-Nausea Tablets  â†’  ðŸ”´ OUT
  [MARK RESTOCKED: 5 â–¼ tablets]

â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”
[MARK ALL BOUGHT â€” Reset to default quantities]
[ðŸ–¨ï¸ PRINT / SHARE LIST]
```

---

## 9.15 `/quick-access` â€” Personalized Shortcuts

```
YOUR QUICK ACCESS

FREQUENTLY USED THIS MONTH:
[Paracetamol â€” 12Ã— â€” ðŸŸ¢ 8 left]
[Ibuprofen â€” 8Ã— â€” ðŸŸ¡ 3 left]
[Vitamin C â€” 5Ã— â€” ðŸŸ¢ 15 left]

RECENTLY USED (last 7 days):
[Antacid â€” 3 days ago â€” ðŸŸ¢ 6 left]

COMMON COMBINATIONS:
(Medicines taken together 3+ times become combos)
[ðŸŒ¡ï¸ Fever Combo â†’ Paracetamol + Ibuprofen]
[ðŸ’¥ Headache Kit â†’ Paracetamol + rest]
```

---

## 9.16 `/insights` â€” Health Patterns

```
YOUR HEALTH PATTERNS
(Auto-calculated from illness_episodes + episode_doses)

â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”
ILLNESS FREQUENCY THIS YEAR:
â€¢ ðŸŒ¡ï¸ Fever â€” 3Ã— (last: 2 weeks ago)
â€¢ ðŸ˜· Cold & Flu â€” 2Ã— (last: 3 months ago)
â€¢ ðŸ¤• Headache â€” 5Ã— (last: 2 days ago)
â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”
WHAT WORKED BEST:
â€¢ For Fever â†’ Paracetamol (effective 3/3 times) âœ…
â€¢ For Headache â†’ Paracetamol + rest (effective 4/5)
â€¢ For Stomach â†’ ORS + Ondansetron (effective 2/2)
â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”
RECOVERY PATTERNS:
â€¢ Average illness duration: 2.8 days
â€¢ Fastest recovery: 1 day (Headache, Aug 2024)
â€¢ Longest illness: 5 days (Cold & Flu, Jul 2024)
â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”
MOST USED MEDICINES:
â€¢ Paracetamol 500mg â€” 28 doses total
â€¢ Vitamin C â€” 15 doses total
â€¢ Ibuprofen 400mg â€” 12 doses total
â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”
KIT HEALTH:
â€¢ 1 medicine expired (Paracetamol old batch)
â€¢ 2 medicines expiring in 60 days
â€¢ 2 medicines out of stock
â€¢ Kit last restocked: 3 weeks ago
â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”
```

---

---

# SECTION 10: CORE USER FLOWS

## 10.1 I'm Sick â€” Full Primary Flow

```
1. Dashboard â†’ [ðŸ¤’ I'm Sick]
2. /illness/start:
   - Tap symptom buttons (e.g. Fever + Headache)
   - App auto-suggests: name = "Fever & Headache", blog = Fever Guide
   - [START ILLNESS LOG]
3. /illness/active opens immediately
4. See matched kit medicines â†’ [Take Dose] or [Log External]
5. Dose interval check runs:
   - OK â†’ logged silently
   - Too soon â†’ warning toast â†’ [Take Anyway] or [Cancel]
6. Read illness guide if needed: [ðŸ“– Read Fever Guide â†’]
7. Continue logging doses as needed throughout illness
8. When better â†’ [âœ… I'm Feeling Better]
9. Select outcome â†’ [CLOSE EPISODE]
10. Redirected to /illness/[id] â€” summary of the episode

Total time to start: ~15 seconds
Typing required: 0
```

## 10.2 At The Store

```
1. Dashboard â†’ [ðŸ›’ Need to Buy]
2. /out-of-stock â†’ see full list by category
3. Buy medicines
4. Return home â†’ [MARK ALL BOUGHT]
5. All quantities reset to defaultQuantity

Total time: 10 seconds
```

## 10.3 Adding a New Symptom

```
1. /symptoms/manage â†’ [+ ADD NEW SYMPTOM]
2. Fill: Name, emoji, isCommon (grid), sortOrder
3. [SAVE SYMPTOM]
4. New symptom now available:
   - On illness/start grid (if isCommon = true)
   - In medicine symptom selector (when adding/editing medicines)
   - In blog symptom linker
   - In episode symptom picker

Total time: 20 seconds
```

## 10.4 Adding Symptom to an Existing Medicine

```
1. /medicines/[id] â†’ [+ Add Symptom]
2. Search symptom name â†’ select
3. Inserts medicine_symptoms row
4. Symptom now appears on that medicine card
5. Medicine now shows up when that symptom is searched

Total time: 10 seconds
```

## 10.5 Adding a New Blog Guide

```
1. /blogs â†’ [+ Add New Guide]
2. Fill title, emoji, recovery time
3. Add sections (heading + content + warning flag)
4. Link symptoms via blog_symptoms
5. [SAVE & PUBLISH]

Blog now appears on /blogs index
Blog now auto-suggests when matched symptoms are selected on /illness/start
```

---

---

# SECTION 11: SMART BEHAVIOR RULES

## 11.1 Only One Active Episode
- `isOngoing: true` can exist on at most one document at any time
- If user tries to start a new illness while one is ongoing:
  â†’ Prompt: "You already have an ongoing illness (Fever, Day 2). Close it first?"
  â†’ [CLOSE CURRENT FIRST]   [CONTINUE CURRENT]

## 11.2 Dosage Interval Safety (Warn, Never Block)
- On every dose log: compare `lastDoseTaken` with `doseIntervalHours`
- If `now - lastDoseTaken < doseIntervalHours` â†’ show warning toast:
  *"You took Paracetamol 3 hours ago. Safe interval is 6 hours. Take anyway?"*
- User can override with [TAKE ANYWAY]
- Never a hard block â€” user is responsible for their own health

## 11.3 isFromKit Logic
```
isFromKit: true
  â†’ medicine.quantity -= amount
  â†’ medicine.lastDoseTaken = now
  â†’ medicine.lastUsed = now
  â†’ medicine.usageCount += 1

isFromKit: false
  â†’ NO changes to any medicine document
  â†’ Only episode_doses and usage_logs are written
```

## 11.4 Expiry Auto-Computation
- Every time a medicine is fetched, compute `isExpired = expiryDate < now`
- OR: run a daily update query via Vercel cron (optional)
- Dashboard expiry alerts: `expiryDate < now + 30 days`

## 11.5 Quick Access Rules
- `lastUsed` within 7 days â†’ `isQuickAccess = true`
- Used 5+ times this month â†’ `isQuickAccess = true`
- Two medicines appear in same episode 3+ times â†’ flagged as combo in insights

## 11.6 Blog Auto-Suggestion Logic
When symptoms are selected on /illness/start:
1. Query `blog_symptoms` for all blogIds matching selected symptomIds
2. Count matches per blogId
3. Return blog with most matches as primary suggestion
4. Return others as secondary suggestions

## 11.7 Symptom Search for Medicines
When searching medicines by symptom:
1. Query `medicine_symptoms` for all medicineIds matching selected symptomIds
2. JOIN with medicines (via `$lookup`)
3. Sort by: in-stock first â†’ most recently used â†’ usage count

---

---

# SECTION 12: SYMPTOM MANAGEMENT SYSTEM

This is a fully dynamic, database-driven system. No hardcoded symptom arrays anywhere.

## Symptom Lifecycle
```
1. Created in /symptoms/manage â†’ stored in symptoms collection
2. Marked isCommon = true â†’ appears on illness/start quick grid
3. Linked to medicines via medicine_symptoms â†’ medicine now shows for this symptom
4. Linked to blogs via blog_symptoms â†’ blog auto-suggests for this symptom
5. Selected during illness â†’ stored in episode_symptoms â†’ part of health history
```

## Adding New Symptom â€” Available From Multiple Places
- `/symptoms/manage` â€” dedicated page
- `/medicines/add` â€” "Can't find symptom? Add new" inline
- `/blogs/manage` â€” "Add new symptom to link" inline

## Symptom Data Flow
```
symptoms (master table)
  â†“
medicine_symptoms (junction) â†’ which medicines help with this symptom
  â†“
blog_symptoms (junction) â†’ which blogs are relevant for this symptom
  â†“
episode_symptoms (junction) â†’ which episodes had this symptom
```

---

---

# SECTION 13: NAVIGATION STRUCTURE

## Mobile â€” Bottom Navigation Bar (5 items)
```
ðŸ  Home  |  ðŸ¤’ Sick  |  ðŸ“š Guides  |  ðŸ’Š Kit  |  ðŸ• History
```

## Desktop â€” Sidebar Navigation
```
â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”
MedKit
â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”
ðŸ   Dashboard
ðŸ¤’  I'm Sick
â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”
ðŸ“š  Illness Guides
    â†³ Manage Guides
ðŸ•  Illness History
ðŸ“Š  Insights
â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”
ðŸ’Š  Medicine Kit
    â†³ Add Medicine
    â†³ Out of Stock
    â†³ Quick Access
â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”
âš™ï¸  Symptoms
    â†³ Manage Symptoms
â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”
ðŸšª  Logout
â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”
```

---

---

# SECTION 14: RESPONSIVE DESIGN

## Breakpoints

| Size | Range | Layout |
|------|-------|--------|
| Mobile | 320â€“767px | Single column, bottom navigation bar |
| Tablet | 768â€“1023px | 2-column, top navigation |
| Desktop | 1024px+ | 3-column, sidebar navigation |

## Sick-Day Mobile Requirements (Non-Negotiable)
- Minimum **44px** tap target height on all buttons and interactive elements
- Minimum **20px** font size on buttons
- No horizontal scrolling on any page
- All critical actions (Take Dose, I'm Sick, I'm Better) must be **above the fold**
- Bottom navigation always visible â€” never hidden on scroll
- Instant page transitions â€” no loading spinners on navigation
- Visual feedback on every tap (button press state, toast notification)

## Touch Targets for Symptom Grid
- Mobile: full-width buttons stacked vertically
- Tablet: 3-column grid, 80px height buttons
- Desktop: 3-column or 4-column grid

---

---

# SECTION 15: DEPLOYMENT

## Environment Variables
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/medkit
SESSION_SECRET=random_string_at_least_32_characters_long
APP_USERNAME=your_chosen_username
APP_PASSWORD=your_chosen_password
```

## MongoDB Atlas Setup
- Free tier (M0) is sufficient for single-user personal app
- Database name: `medkit`
- Collections to create:
  `categories`, `symptoms`, `medicines`, `medicine_symptoms`,
  `illness_episodes`, `episode_symptoms`, `episode_medicines`,
  `episode_doses`, `blogs`, `blog_symptoms`

## Recommended MongoDB Indexes
```javascript
// symptoms
{ slug: 1 }          â€” unique
{ isCommon: 1 }

// medicines
{ categoryId: 1 }
{ isActive: 1 }
{ expiryDate: 1 }
{ quantity: 1 }

// medicine_symptoms
{ medicineId: 1 }
{ symptomId: 1 }
{ medicineId: 1, symptomId: 1 }    â€” unique compound

// illness_episodes
{ isOngoing: 1 }
{ startDate: -1 }

// episode_symptoms
{ episodeId: 1 }

// episode_medicines
{ episodeId: 1 }

// episode_doses
{ episodeId: 1 }
{ medicineId: 1 }
{ takenAt: -1 }

// blogs
{ slug: 1 }          â€” unique
{ isPublished: 1 }

// blog_symptoms
{ blogId: 1 }
{ symptomId: 1 }
```

## Vercel Deployment Steps
1. Push code to GitHub
2. Connect GitHub repo to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy â€” automatic on every push to main branch

---

---

# SECTION 16: WHAT IS STATIC vs DYNAMIC â€” FINAL ANSWER

| Data | Storage | Reason |
|------|---------|--------|
| Login credentials | `.env` vars (hardcoded in API route) | Single user, zero DB dependency |
| Categories | MongoDB `categories` | Manageable from web app |
| Symptoms | MongoDB `symptoms` | Fully dynamic â€” add from web app anytime |
| Medicines | MongoDB `medicines` | Changes frequently |
| Medicine-Symptom links | MongoDB `medicine_symptoms` | Junction table â€” dynamic |
| Illness blogs / guides | MongoDB `blogs` | **Stored in DB â€” fully editable from web app** |
| Blog-Symptom links | MongoDB `blog_symptoms` | Junction table â€” dynamic |
| Illness episodes | MongoDB `illness_episodes` | Health journal |
| Episode symptoms | MongoDB `episode_symptoms` | Junction table |
| Episode medicines | MongoDB `episode_medicines` | Junction table |
| Episode doses | MongoDB `episode_doses` | Detailed dose log |
| Insights | Computed from MongoDB at read time | No separate storage |

**Everything except login credentials is in MongoDB.**
**Nothing is hardcoded except username and password.**

---

---

# SECTION 17: DESIGN PRINCIPLES SUMMARY

1. **Zero typing when sick** â€” symptom buttons, one-click dose logging
2. **One-click for every common action** â€” take dose, restock, mark recovered
3. **Warn never block** â€” dosage safety as toasts, not hard blockers
4. **Two medicine cases handled** â€” kit (quantity decreases) and external (kit untouched)
5. **Complete illness history** â€” every episode, every dose, forever, searchable
6. **Fully dynamic symptoms** â€” add, edit, link from web app, no code changes
7. **Fully dynamic blogs** â€” create, edit, publish illness guides from web app
8. **Proper relational data** â€” junction tables not string arrays
9. **Active illness always surfaces first** â€” banner on every dashboard view
10. **One MongoDB connection** â€” no separate servers, no extra APIs

---

*Personal Medical Kit Web App â€” Complete Final Specification*
*Single user. Sick-day first. Proper relational data. Everything in MongoDB except login.*

