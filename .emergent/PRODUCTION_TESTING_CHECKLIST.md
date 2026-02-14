# 🚀 EKA-AI PRODUCTION TESTING CHECKLIST
## Complete Feature Validation - Priority 1 & 2 Updates

**Version:** 2.0 (Updated with Priority 1 & 2 features)  
**Date:** February 2026  
**Status:** Launch Ready UI Validation

---

# 📋 EXECUTIVE SUMMARY

## ✅ Completed Features (Priority 1 & 2)

| Feature | Status | Details |
|---------|--------|---------|
| Chat-First Experience | ✅ | Login → `/app/chat` (Dashboard is PRO) |
| Dual Theme | ✅ | Dark sidebar (#0D0D0D) + Light content (#FAFAFA) |
| eka-aı Branding | ✅ | Stylized logo with mascot |
| PRO Badges | ✅ | Dashboard, Fleet, PDI locked with 🔒 |
| Usage Limits | ✅ | 10 queries/day visual indicator |
| Pricing Page | ✅ | STARTER ₹1,499, GROWTH ₹2,999, ELITE ₹5,999 |
| Search Page | ✅ | New `/app/search` route |
| Route Consistency | ✅ | All `/app/*` routes tested |

## ⚠️ Known Limitations (Mocked)

| Feature | Current State | Backend Required |
|---------|---------------|------------------|
| Payment Gateway | Alert only | Actual integration |
| Usage Limits | localStorage only | Backend enforcement |
| Email Invoice | Inactive | RESEND_API_KEY needed |

---

# 📋 SECTION 1: AUTHENTICATION & ONBOARDING (UPDATED)

## 1.1 Login Flow - Chat First Experience

| # | Test Case | Steps | Expected Result | Status |
|---|-----------|-------|-----------------|--------|
| 1.1.1 | Login Page Load | Navigate to `/login` | Dual-pane layout with eka-aı branding | ⬜ |
| 1.1.2 | Brand Logo | Check logo | Stylized "eka-aı" with mascot visible | ⬜ |
| 1.1.3 | Successful Login | Enter valid credentials | Redirects to **`/app/chat`** (NOT dashboard) | ⬜ |
| 1.1.4 | Chat-First Landing | After login | Claude-style chat interface loads | ⬜ |
| 1.1.5 | No Dashboard Redirect | Verify redirect URL | URL is `/app/chat`, not `/app/dashboard` | ⬜ |
| 1.1.6 | Usage Limit Display | Check chat page | "10/10 queries remaining" indicator visible | ⬜ |
| 1.1.7 | PRO Feature Teaser | Scroll/chat | "Upgrade to PRO for unlimited queries" prompt | ⬜ |
| 1.1.8 | Session Persistence | Refresh page | Remains logged in, returns to chat | ⬜ |
| 1.1.9 | Sign Out | Click sign out | Clears session, redirects to login | ⬜ |
| 1.1.10 | Unauthorized Access | Try `/app/dashboard` without PRO | Shows "🔒 PRO Feature" lock screen | ⬜ |

## 1.2 Sign Up & Onboarding

| # | Test Case | Steps | Expected Result | Status |
|---|-----------|-------|-----------------|--------|
| 1.2.1 | Sign Up Tab | Click "Create Account" | Signup form appears | ⬜ |
| 1.2.2 | Account Creation | Fill and submit | Account created, auto-login | ⬜ |
| 1.2.3 | Post-Signup Redirect | After creation | Redirects to `/app/chat` | ⬜ |
| 1.2.4 | Free Tier Assignment | Check features | Free tier features available | ⬜ |
| 1.2.5 | Usage Counter Init | Check chat | Shows "10/10 queries remaining" | ⬜ |

---

# 📋 SECTION 2: DUAL THEME VALIDATION (NEW)

## 2.1 Dark Sidebar Theme

| # | Element | Expected Color | Status |
|---|---------|----------------|--------|
| 2.1.1 | Sidebar Background | `#0D0D0D` (pure dark) | ⬜ |
| 2.1.2 | Sidebar Border | `#1D1D1F` (subtle) | ⬜ |
| 2.1.3 | Nav Item Hover | `#1A1A1A` with amber accent | ⬜ |
| 2.1.4 | Active Nav Item | Amber left border + highlight | ⬜ |
| 2.1.5 | Text Primary | `#FFFFFF` (white) | ⬜ |
| 2.1.6 | Text Secondary | `#9CA3AF` (gray-400) | ⬜ |
| 2.1.7 | eka-aı Logo | Amber/orange gradient | ⬜ |
| 2.1.8 | Collapse Button | Dark with hover effect | ⬜ |
| 2.1.9 | User Avatar | Amber gradient border | ⬜ |
| 2.1.10 | PRO Badge | Amber/gold accent | ⬜ |

## 2.2 Light Content Area Theme

| # | Element | Expected Color | Status |
|---|---------|----------------|--------|
| 2.2.1 | Main Content BG | `#FAFAFA` (off-white) | ⬜ |
| 2.2.2 | Card Background | `#FFFFFF` (pure white) | ⬜ |
| 2.2.3 | Card Border | `#E5E7EB` (gray-200) | ⬜ |
| 2.2.4 | Text Primary | `#111827` (gray-900) | ⬜ |
| 2.2.5 | Text Secondary | `#6B7280` (gray-500) | ⬜ |
| 2.2.6 | Input Border | `#D1D5DB` (gray-300) | ⬜ |
| 2.2.7 | Button Primary | `#F98906` (amber) | ⬜ |
| 2.2.8 | Table Header | `#F9FAFB` (gray-50) | ⬜ |
| 2.2.9 | Table Border | `#E5E7EB` (gray-200) | ⬜ |
| 2.2.10 | Hover States | `#F3F4F6` (gray-100) | ⬜ |

## 2.3 Theme Consistency Across Routes

| # | Route | Sidebar | Content | Status |
|---|-------|---------|---------|--------|
| 2.3.1 | `/app/chat` | Dark | Light | ⬜ |
| 2.3.2 | `/app/job-cards` | Dark | Light | ⬜ |
| 2.3.3 | `/app/invoices` | Dark | Light | ⬜ |
| 2.3.4 | `/app/settings` | Dark | Light | ⬜ |
| 2.3.5 | `/app/search` | Dark | Light | ⬜ |
| 2.3.6 | `/app/pricing` | Dark | Light | ⬜ |

---

# 📋 SECTION 3: EKA-AI BRANDING VALIDATION (NEW)

## 3.1 Logo & Visual Identity

| # | Test Case | Expected | Status |
|---|-----------|----------|--------|
| 3.1.1 | Sidebar Logo | Stylized "eka-aı" with dotless i | ⬜ |
| 3.1.2 | Mascot Icon | Small mascot icon next to logo | ⬜ |
| 3.1.3 | Logo Animation | Subtle hover animation | ⬜ |
| 3.1.4 | Favicon | eka-aı icon in browser tab | ⬜ |
| 3.1.5 | App Title | "eka-aı" in page title | ⬜ |
| 3.1.6 | Loading Screen | Logo with mascot on load | ⬜ |
| 3.1.7 | Error Pages | Branded 404/error screens | ⬜ |
| 3.1.8 | Email Templates | eka-aı branding in emails | ⬜ |
| 3.1.9 | PDF Exports | Logo on invoices/estimates | ⬜ |
| 3.1.10 | Share Previews | eka-aı in social meta tags | ⬜ |

## 3.2 Brand Consistency

| # | Element | Check | Status |
|---|---------|-------|--------|
| 3.2.1 | Color Palette | Matches eka-ai.in website | ⬜ |
| 3.2.2 | Typography | Same font family as website | ⬜ |
| 3.2.3 | Spacing | Consistent padding/margins | ⬜ |
| 3.2.4 | Border Radius | Unified corner rounding | ⬜ |
| 3.2.5 | Shadows | Consistent shadow styles | ⬜ |
| 3.2.6 | Icons | Lucide icons, amber accents | ⬜ |
| 3.2.7 | Buttons | Rounded, amber primary | ⬜ |
| 3.2.8 | Cards | Subtle borders, white bg | ⬜ |
| 3.2.9 | Inputs | Light bg, gray borders | ⬜ |
| 3.2.10 | Badges | Rounded, amber for premium | ⬜ |

---

# 📋 SECTION 4: PRO FEATURES & USAGE LIMITS (NEW)

## 4.1 Free Tier Limitations

| # | Feature | Free Limit | Status |
|---|---------|------------|--------|
| 4.1.1 | AI Chat Queries | 10 per day | ⬜ |
| 4.1.2 | Dashboard Access | ❌ Locked | ⬜ |
| 4.1.3 | Fleet Management | ❌ Locked | ⬜ |
| 4.1.4 | PDI Checklist | ❌ Locked | ⬜ |
| 4.1.5 | Job Cards | ✅ Unlimited | ⬜ |
| 4.1.6 | Invoices | ✅ Unlimited | ⬜ |
| 4.1.7 | Basic Settings | ✅ Available | ⬜ |
| 4.1.8 | Search | ✅ Available | ⬜ |
| 4.1.9 | Export to PDF | ❌ Watermarked | ⬜ |
| 4.1.10 | Priority Support | ❌ Email only | ⬜ |

## 4.2 Usage Counter UI

| # | Test Case | Steps | Expected | Status |
|---|-----------|-------|----------|--------|
| 4.2.1 | Counter Display | Open `/app/chat` | "10/10 queries remaining" visible | ⬜ |
| 4.2.2 | Counter Decrement | Send query | Counter decreases to "9/10" | ⬜ |
| 4.2.3 | Visual Indicator | Check styling | Progress bar or dot indicators | ⬜ |
| 4.2.4 | Low Usage Warning | At 3 queries | Amber warning color | ⬜ |
| 4.2.5 | Zero Queries | Use all 10 | "0/10 - Upgrade to continue" | ⬜ |
| 4.2.6 | Upgrade Prompt | At 0 queries | Modal/button to upgrade | ⬜ |
| 4.2.7 | Daily Reset | Next day | Counter resets to 10/10 | ⬜ |
| 4.2.8 | Counter Persistence | Refresh page | Count persists (localStorage) | ⬜ |
| 4.2.9 | Multiple Tabs | Open in 2 tabs | Synced count across tabs | ⬜ |
| 4.2.10 | Tooltip | Hover counter | "Free tier: 10 queries per day" | ⬜ |

## 4.3 PRO Badge Behavior

| # | Feature | Badge | Click Behavior | Status |
|---|---------|-------|----------------|--------|
| 4.3.1 | Dashboard | 🔒 PRO | Opens pricing page | ⬜ |
| 4.3.2 | Fleet Mgmt | 🔒 PRO | Opens pricing page | ⬜ |
| 4.3.3 | PDI Checklist | 🔒 PRO | Opens pricing page | ⬜ |
| 4.3.4 | Advanced Reports | 🔒 PRO | Opens pricing page | ⬜ |
| 4.3.5 | Unlimited Chat | ⭐ PRO | Upgrade prompt | ⬜ |
| 4.3.6 | Badge Styling | Gold/amber | Shiny animation | ⬜ |
| 4.3.7 | Lock Screen | Full overlay | Feature preview + CTA | ⬜ |
| 4.3.8 | Preview Content | Grayed out | Shows what's behind lock | ⬜ |
| 4.3.9 | Upgrade CTA | "Upgrade to PRO" | Button to `/app/pricing` | ⬜ |
| 4.3.10 | Plan Comparison | Feature list | Compare Free vs PRO | ⬜ |

---

# 📋 SECTION 5: PRICING PAGE VALIDATION (NEW)

## 5.1 Pricing Tiers Display

| # | Plan | Price | Features | Status |
|---|------|-------|----------|--------|
| 5.1.1 | STARTER | ₹1,499/month | Basic features | ⬜ |
| 5.1.2 | GROWTH | ₹2,999/month | Most Popular badge | ⬜ |
| 5.1.3 | ELITE | ₹5,999/month | All features | ⬜ |
| 5.1.4 | Toggle | Monthly/Yearly | 20% off on yearly | ⬜ |
| 5.1.5 | Currency | INR (₹) | Indian Rupee symbol | ⬜ |
| 5.1.6 | Comparison Table | Feature matrix | All plans compared | ⬜ |
| 5.1.7 | FAQ Section | Common questions | Expandable items | ⬜ |
| 5.1.8 | Testimonials | Customer quotes | Social proof | ⬜ |
| 5.1.9 | Money Back | 7-day guarantee | Trust badge | ⬜ |
| 5.1.10 | Support | Contact sales | Email/phone CTA | ⬜ |

## 5.2 Plan Features Breakdown

### STARTER - ₹1,499/month
| Feature | Included | Status |
|---------|----------|--------|
| AI Chat Queries | 50/day | ⬜ |
| Job Cards | Unlimited | ⬜ |
| Invoices | Unlimited | ⬜ |
| Dashboard | Basic | ⬜ |
| Email Support | ✅ | ⬜ |
| Fleet Management | ❌ | ⬜ |
| PDI Checklist | ❌ | ⬜ |
| Custom Reports | ❌ | ⬜ |

### GROWTH - ₹2,999/month (Most Popular)
| Feature | Included | Status |
|---------|----------|--------|
| AI Chat Queries | 200/day | ⬜ |
| Job Cards | Unlimited | ⬜ |
| Invoices | Unlimited | ⬜ |
| Dashboard | Advanced | ⬜ |
| Priority Support | ✅ | ⬜ |
| Fleet Management | Up to 10 vehicles | ⬜ |
| PDI Checklist | ✅ | ⬜ |
| Custom Reports | Basic | ⬜ |

### ELITE - ₹5,999/month
| Feature | Included | Status |
|---------|----------|--------|
| AI Chat Queries | Unlimited | ⬜ |
| Job Cards | Unlimited | ⬜ |
| Invoices | Unlimited | ⬜ |
| Dashboard | Premium | ⬜ |
| Priority Support | 24/7 Phone | ⬜ |
| Fleet Management | Unlimited | ⬜ |
| PDI Checklist | ✅ | ⬜ |
| Custom Reports | Advanced | ⬜ |
| API Access | ✅ | ⬜ |
| White Label | ✅ | ⬜ |

## 5.3 Payment Flow (Mocked)

| # | Step | Expected | Status |
|---|------|----------|--------|
| 5.3.1 | Select Plan | Plan highlighted | ⬜ |
| 5.3.2 | Click Subscribe | Alert: "Payment integration coming soon" | ⬜ |
| 5.3.3 | No Actual Charge | No money deducted | ⬜ |
| 5.3.4 | Contact Sales | Email opens/tel link | ⬜ |
| 5.3.5 | GST Info | "18% GST extra" noted | ⬜ |

---

# 📋 SECTION 6: SEARCH PAGE (NEW)

## 6.1 Search Functionality

| # | Test Case | Steps | Expected | Status |
|---|-----------|-------|----------|--------|
| 6.1.1 | Page Load | Navigate to `/app/search` | Search interface loads | ⬜ |
| 6.1.2 | Search Bar | Check input | Large search input visible | ⬜ |
| 6.1.3 | Placeholder Text | Check hint | "Search job cards, invoices, vehicles..." | ⬜ |
| 6.1.4 | Type Query | Enter "Swift" | Suggestions appear | ⬜ |
| 6.1.5 | Search Job Cards | Type JC number | Matching job cards listed | ⬜ |
| 6.1.6 | Search Invoices | Type INV number | Matching invoices listed | ⬜ |
| 6.1.7 | Search Vehicles | Type vehicle number | Vehicle details shown | ⬜ |
| 6.1.8 | Filters | Apply date filter | Results filtered | ⬜ |
| 6.1.9 | Sort Options | Sort by date | Results reordered | ⬜ |
| 6.1.10 | Empty State | No results | "No results found" message | ⬜ |
| 6.1.11 | Recent Searches | Check history | Previous searches shown | ⬜ |
| 6.1.12 | Clear Search | Click X | Input cleared | ⬜ |
| 6.1.13 | Keyboard Shortcut | Press Ctrl+K | Focus search bar | ⬜ |
| 6.1.14 | Mobile Search | On mobile | Full-screen search modal | ⬜ |
| 6.1.15 | Result Click | Click result | Navigates to detail page | ⬜ |

## 6.2 Search Results Display

| # | Element | Display Format | Status |
|---|---------|----------------|--------|
| 6.2.1 | Job Card Result | JC #, Vehicle, Status, Date | ⬜ |
| 6.2.2 | Invoice Result | INV #, Customer, Amount, Status | ⬜ |
| 6.2.3 | Vehicle Result | Reg #, Make, Model, Owner | ⬜ |
| 6.2.4 | Customer Result | Name, Phone, Vehicle count | ⬜ |
| 6.2.5 | Highlight Match | Search term bold | ⬜ |
| 6.2.6 | Pagination | 20 results per page | ⬜ |
| 6.2.7 | Result Count | "Showing X of Y results" | ⬜ |
| 6.2.8 | Quick Actions | Edit/View buttons | ⬜ |
| 6.2.9 | Status Badges | Colored status labels | ⬜ |
| 6.2.10 | Timestamp | Relative time (2 hrs ago) | ⬜ |

---

# 📋 SECTION 7: CHAT INTERFACE (CHAT-FIRST)

## 7.1 Chat-First Landing Experience

| # | Test Case | Steps | Expected | Status |
|---|-----------|-------|----------|--------|
| 7.1.1 | Post-Login Landing | Login successfully | Lands on `/app/chat` | ⬜ |
| 7.1.2 | Welcome Message | Check greeting | "Hello! I'm EKA. How can I help you today?" | ⬜ |
| 7.1.3 | Empty State | No messages yet | Suggestion chips visible | ⬜ |
| 7.1.4 | Suggestion Chips | Check options | "Brake issue", "Service cost", "Engine noise" | ⬜ |
| 7.1.5 | Quick Actions | Below input | "Create Job Card", "View Estimates" | ⬜ |
| 7.1.6 | Usage Counter | Top right | "10/10 queries remaining" | ⬜ |
| 7.1.7 | Intelligence Mode | Selector | FAST/THINKING/DEEP_CONTEXT toggle | ⬜ |
| 7.1.8 | New Chat Button | Sidebar | Clears conversation | ⬜ |
| 7.1.9 | Chat History | Sidebar | Recent conversations listed | ⬜ |
| 7.1.10 | Pro Prompt | After 5 queries | "Upgrade for unlimited queries" | ⬜ |

## 7.2 Chat Message Display

| # | Element | User Message | AI Message | Status |
|---|---------|--------------|------------|--------|
| 7.2.1 | Background | Light gray bubble | White card | ⬜ |
| 7.2.2 | Text Color | Dark (#111827) | Dark (#111827) | ⬜ |
| 7.2.3 | AI Accent | - | Amber headers/highlights | ⬜ |
| 7.2.4 | Avatar | User initials | EKA mascot | ⬜ |
| 7.2.5 | Tables | - | Styled tables for parts/pricing | ⬜ |
| 7.2.6 | Code Blocks | - | Syntax highlighted | ⬜ |
| 7.2.7 | Lists | - | Bulleted/numbered lists | ⬜ |
| 7.2.8 | Links | Underlined | Amber underlined | ⬜ |
| 7.2.9 | Copy Button | - | Copy message icon | ⬜ |
| 7.2.10 | Timestamp | Subtle gray | Subtle gray | ⬜ |

## 7.3 Chat Input & Controls

| # | Element | Behavior | Status |
|---|---------|----------|--------|
| 7.3.1 | Input Field | Auto-expanding textarea | ⬜ |
| 7.3.2 | Send Button | Amber, disabled if empty | ⬜ |
| 7.3.3 | Enter to Send | Shift+Enter for new line | ⬜ |
| 7.3.4 | File Attachment | Upload images/docs | ⬜ |
| 7.3.5 | Voice Input | Mic icon for speech | ⬜ |
| 7.3.6 | Emoji Picker | Smile icon | ⬜ |
| 7.3.7 | Typing Indicator | "EKA is typing..." | ⬜ |
| 7.3.8 | Message Limit | Alert at 0 queries | ⬜ |
| 7.3.9 | Regenerate | Retry icon on error | ⬜ |
| 7.3.10 | Feedback | 👍👎 buttons | ⬜ |

---

# 📋 SECTION 8: ROUTE CONSISTENCY (FIXED)

## 8.1 Sidebar Navigation

| # | Route | Label | Icon | Status |
|---|-------|-------|------|--------|
| 8.1.1 | `/app/chat` | Chat | MessageSquare | ⬜ |
| 8.1.2 | `/app/job-cards` | Job Cards | Wrench | ⬜ |
| 8.1.3 | `/app/invoices` | Invoices | FileText | ⬜ |
| 8.1.4 | `/app/search` | Search | Search | ⬜ |
| 8.1.5 | `/app/settings` | Settings | Settings | ⬜ |
| 8.1.6 | `/app/pricing` | Pricing | CreditCard | ⬜ |
| 8.1.7 | `/app/dashboard` | Dashboard 🔒 | LayoutDashboard | ⬜ |
| 8.1.8 | `/app/fleet` | Fleet 🔒 | Truck | ⬜ |
| 8.1.9 | `/app/pdi` | PDI 🔒 | ClipboardCheck | ⬜ |

## 8.2 No Duplicate Routes

| # | Check | Expected | Status |
|---|-------|----------|--------|
| 8.2.1 | App.tsx routes | No duplicate route definitions | ⬜ |
| 8.2.2 | Sidebar active state | Correct highlight for current route | ⬜ |
| 8.2.3 | URL consistency | All routes under `/app/*` | ⬜ |
| 8.2.4 | Direct URL access | All routes work on refresh | ⬜ |
| 8.2.5 | Back button | History navigation works | ⬜ |

---

# 📋 SECTION 9: CORE FEATURE TESTING (Job Card → Invoice)

## 9.1 Job Card Creation Flow

| # | Step | Action | Expected | Status |
|---|------|--------|----------|--------|
| 9.1.1 | Create | Click "New Job Card" | Modal opens | ⬜ |
| 9.1.2 | Vehicle Entry | Enter vehicle details | Auto-suggest works | ⬜ |
| 9.1.3 | Customer Info | Add customer | Contact suggestions | ⬜ |
| 9.1.4 | Symptoms | Enter issue description | AI suggestions appear | ⬜ |
| 9.1.5 | Photos | Upload images | Preview visible | ⬜ |
| 9.1.6 | Save | Click Save | Job card created | ⬜ |
| 9.1.7 | Status | Check status | Shows "CREATED" | ⬜ |
| 9.1.8 | List | View job cards | New JC in list | ⬜ |
| 9.1.9 | Detail | Open JC | All details correct | ⬜ |
| 9.1.10 | Edit | Modify details | Updates saved | ⬜ |

## 9.2 Estimate Generation

| # | Step | Expected | Status |
|---|------|----------|--------|
| 9.2.1 | Generate from AI | "Create estimate" from chat | ⬜ |
| 9.2.2 | Parts List | Table with OEM/Aftermarket options | ⬜ |
| 9.2.3 | Price Ranges | ₹X - ₹Y format (not exact) | ⬜ |
| 9.2.4 | Labor Separate | Labor charges distinct | ⬜ |
| 9.2.5 | GST Calculation | 18% GST shown | ⬜ |
| 9.2.6 | Total Range | Min-max total | ⬜ |
| 9.2.7 | Disclaimer | Price variation note | ⬜ |
| 9.2.8 | Send to Customer | WhatsApp/Email options | ⬜ |
| 9.2.9 | Customer Approval | Approve/Reject buttons | ⬜ |
| 9.2.10 | Convert to Work | Approved → Work started | ⬜ |

## 9.3 Invoice Generation

| # | Step | Expected | Status |
|---|------|----------|--------|
| 9.3.1 | Generate from JC | "Create Invoice" button | ⬜ |
| 9.3.2 | Auto-fill | Vehicle, customer, parts auto-filled | ⬜ |
| 9.3.3 | Invoice Number | Auto-generated (INV-XXXX) | ⬜ |
| 9.3.4 | Line Items | Editable table | ⬜ |
| 9.3.5 | Tax Breakdown | CGST/SGST or IGST | ⬜ |
| 9.3.6 | Total | Final amount with taxes | ⬜ |
| 9.3.7 | Preview | PDF preview before save | ⬜ |
| 9.3.8 | Save | Invoice created | ⬜ |
| 9.3.9 | Send | Email/WhatsApp invoice | ⬜ |
| 9.3.10 | Payment | PayU link (mocked) | ⬜ |

---

# 📋 SECTION 10: MOCKED FEATURES (Known Limitations)

## 10.1 Payment Gateway (Mocked)

| # | Behavior | Current | Future | Status |
|---|----------|---------|--------|--------|
| 10.1.1 | Subscribe Click | Alert: "Coming soon" | Actual payment | ⬜ |
| 10.1.2 | PayU Integration | Not connected | Full integration | ⬜ |
| 10.1.3 | Invoice Payment | Alert only | Actual transaction | ⬜ |
| 10.1.4 | Webhook | Not implemented | Payment confirmation | ⬜ |
| 10.1.5 | Refund | Not available | Refund flow | ⬜ |

## 10.2 Usage Limits (Client-Side Only)

| # | Behavior | Current | Future | Status |
|---|----------|---------|--------|--------|
| 10.2.1 | Counter Storage | localStorage | Database + Redis | ⬜ |
| 10.2.2 | Enforcement | Client only | Server-side | ⬜ |
| 10.2.3 | Bypass | Possible via clear | Not possible | ⬜ |
| 10.2.4 | Reset | Daily at midnight | Cron job | ⬜ |
| 10.2.5 | Multiple Devices | Separate counts | Synced count | ⬜ |

## 10.3 Email Integration (Inactive)

| # | Feature | Status | Requirement |
|---|---------|--------|-------------|
| 10.3.1 | Invoice Email | ❌ | RESEND_API_KEY |
| 10.3.2 | Estimate Email | ❌ | RESEND_API_KEY |
| 10.3.3 | Welcome Email | ❌ | RESEND_API_KEY |
| 10.3.4 | Notification Email | ❌ | RESEND_API_KEY |
| 10.3.5 | Password Reset | ❌ | RESEND_API_KEY |

---

# 📋 SECTION 11: PERFORMANCE & SECURITY

## 11.1 Performance Metrics

| # | Metric | Target | Status |
|---|--------|--------|--------|
| 11.1.1 | Page Load | < 3s | ⬜ |
| 11.1.2 | Chat Response | < 4s | ⬜ |
| 11.1.3 | First Paint | < 1.5s | ⬜ |
| 11.1.4 | Interactive | < 5s | ⬜ |
| 11.1.5 | Bundle Size | < 1.5MB | ⬜ |
| 11.1.6 | Image Optimization | WebP format | ⬜ |
| 11.1.7 | Lazy Loading | Images on scroll | ⬜ |
| 11.1.8 | API Cache | 5min for static | ⬜ |
| 11.1.9 | CDN Assets | Firebase CDN | ⬜ |
| 11.1.10 | Gzip | Enabled | ⬜ |

## 11.2 Security Checklist

| # | Check | Status |
|---|-------|--------|
| 11.2.1 | HTTPS Only | ⬜ |
| 11.2.2 | XSS Prevention | ⬜ |
| 11.2.3 | CSRF Tokens | ⬜ |
| 11.2.4 | Input Sanitization | ⬜ |
| 11.2.5 | Auth Token Storage | localStorage secure | ⬜ |
| 11.2.6 | Session Timeout | 24 hours | ⬜ |
| 11.2.7 | Rate Limiting | API protected | ⬜ |
| 11.2.8 | CORS Configured | Backend only | ⬜ |
| 11.2.9 | Env Variables | Not exposed | ⬜ |
| 11.2.10 | RLS Policies | Supabase enabled | ⬜ |

---

# 📋 SECTION 12: RESPONSIVE DESIGN

## 12.1 Mobile Experience

| # | Element | Mobile Behavior | Status |
|---|---------|-----------------|--------|
| 12.1.1 | Sidebar | Collapsed, hamburger menu | ⬜ |
| 12.1.2 | Chat | Full-screen messages | ⬜ |
| 12.1.3 | Tables | Horizontal scroll | ⬜ |
| 12.1.4 | Forms | Stacked inputs | ⬜ |
| 12.1.5 | Search | Full-screen modal | ⬜ |
| 12.1.6 | Navigation | Bottom tab bar | ⬜ |
| 12.1.7 | Touch Targets | Min 44px | ⬜ |
| 12.1.8 | Font Size | Readable (16px+) | ⬜ |
| 12.1.9 | Viewport | No horizontal scroll | ⬜ |
| 12.1.10 | PWA | Add to home screen | ⬜ |

## 12.2 Tablet Experience

| # | Element | Tablet Behavior | Status |
|---|---------|-----------------|--------|
| 12.2.1 | Sidebar | Collapsible (260px) | ⬜ |
| 12.2.2 | Content | 2-column layout | ⬜ |
| 12.2.3 | Tables | Full width | ⬜ |
| 12.2.4 | Forms | Side-by-side fields | ⬜ |
| 12.2.5 | Touch | Optimized for touch | ⬜ |

---

# 📋 FINAL EMERGENT PROMPT

```
@EMERGENT: Execute Production Testing for EKA-AI Launch Ready UI

## PHASE 1: CRITICAL PATH TESTING (Priority 1)

Test the chat-first experience thoroughly:

1. LOGIN → CHAT FLOW
   - Login with test user
   - Verify redirect to /app/chat (NOT /app/dashboard)
   - Verify "10/10 queries remaining" counter visible
   - Verify welcome message and suggestion chips
   - Send 3 test queries, verify counter decrements
   - Verify usage at "7/10"

2. DUAL THEME VALIDATION
   - Verify sidebar is dark (#0D0D0D)
   - Verify chat area is light (#FAFAFA)
   - Navigate to Job Cards, verify theme consistent
   - Navigate to Invoices, verify theme consistent
   - Take screenshots of each route

3. PRO LOCK FEATURES
   - Try accessing /app/dashboard (without PRO)
   - Verify lock screen with "🔒 PRO Feature"
   - Verify "Upgrade to PRO" CTA button
   - Click upgrade, verify redirect to /app/pricing
   - Check Fleet and PDI also locked

4. EKA-AI BRANDING
   - Verify stylized "eka-aı" logo in sidebar
   - Verify mascot icon visible
   - Check favicon is eka-aı logo
   - Verify loading screen has branding

## PHASE 2: PRICING & SEARCH (Priority 2)

5. PRICING PAGE
   - Navigate to /app/pricing
   - Verify 3 plans: STARTER ₹1,499, GROWTH ₹2,999, ELITE ₹5,999
   - Verify "Most Popular" badge on GROWTH
   - Toggle monthly/yearly, verify prices change
   - Click "Subscribe" on any plan
   - Verify alert: "Payment integration coming soon"

6. SEARCH PAGE
   - Navigate to /app/search
   - Type "Swift" in search box
   - Verify search suggestions appear
   - Press Enter, verify results display
   - Click a result, verify navigation works
   - Test keyboard shortcut Ctrl+K

7. USAGE LIMITS
   - Send queries until counter reaches 0
   - At 0, verify "Upgrade to continue" message
   - Verify upgrade modal appears
   - Close modal, verify chat input disabled

## PHASE 3: CORE FEATURES

8. JOB CARD FLOW
   - Create new job card
   - Enter vehicle: "Maruti Swift 2020"
   - Enter symptom: "Brake noise"
   - Save job card
   - Generate estimate from AI chat
   - Verify price ranges (₹X - ₹Y format)
   - Create invoice from job card
   - Verify invoice PDF preview

9. SETTINGS & PROFILE
   - Navigate to Settings
   - Update profile photo
   - Change password
   - Update workshop details
   - Save changes, verify persistence

## PHASE 4: MOCKED FEATURES VERIFICATION

10. VERIFY MOCKED BEHAVIOR
    - Click payment → Verify alert (not actual payment)
    - Clear localStorage → Verify usage counter resets
    - Try email invoice → Verify inactive
    - Document all mocked features

## DELIVERABLES

Create test report: .emergent/PRODUCTION_TEST_REPORT.md

Include:
1. Screenshots of each route (desktop + mobile)
2. Pass/fail for each test case
3. List of any bugs found
4. Performance metrics (load times)
5. Security checklist results
6. GO/NO-GO recommendation

EXPECTED RESULT: All Priority 1 & 2 features working correctly.
KNOWN ISSUES: Payment mocked, usage limits client-side only.
```

---

# ✅ SIGN-OFF

**Tester:** ___________________

**Date:** ___________________

**Priority 1 (Chat-First):** ⬜ PASS ⬜ FAIL

**Priority 2 (Pricing/Search):** ⬜ PASS ⬜ FAIL

**Core Features:** ⬜ PASS ⬜ FAIL

**Overall Recommendation:** ⬜ GO LIVE ⬜ FIX ISSUES ⬜ NO-GO

**Critical Issues Found:** ___________________

**Notes:** ___________________

---

**Go4Garage Private Limited**  
**EKA-AI Production Testing Checklist v2.0**
