# 🧪 EKA-AI FRONTEND COMPREHENSIVE TESTING CHECKLIST
## For Emergent Testing Agent - Complete Feature Flow Validation

**Project:** EKA-AI Platform by Go4Garage Private Limited  
**Purpose:** Validate complete frontend functionality from Job Card creation to Invoicing  
**Date:** ___________  
**Tester:** ___________  
**Status:** ⬜ IN PROGRESS / ⬜ COMPLETE

---

# 📋 SECTION 1: AUTHENTICATION & ONBOARDING FLOW

## 1.1 Login Page Testing
| # | Test Case | Steps | Expected Result | Status |
|---|-----------|-------|-----------------|--------|
| 1.1.1 | Page Load | Navigate to `/login` | Dual-pane layout visible (Left: Auth form, Right: VideoScroller) | ⬜ |
| 1.1.2 | Visual Theme | Check login page colors | Dark theme (#0D0D0D), Amber accents (#F98906) | ⬜ |
| 1.1.3 | Left Pane - Auth Form | Verify form elements | Email input, Password input, Sign In button visible | ⬜ |
| 1.1.4 | Right Pane - Video Scroller | Verify 10 videos | 5 Feature videos + 5 Ad videos auto-scrolling | ⬜ |
| 1.1.5 | Greeting Message | Login with test user | Alert shows: "Good [morning/afternoon/evening] from the Go4Garage Family!" | ⬜ |
| 1.1.6 | Login Redirect | Successful login | Redirects to `/app/dashboard` (NOT `/dashboard`) | ⬜ |
| 1.1.7 | Invalid Credentials | Enter wrong password | Error message displayed: "Invalid credentials" | ⬜ |
| 1.1.8 | Remember Me | Check if session persists | Token stored in localStorage, user remains logged in | ⬜ |
| 1.1.9 | Sign Out | Click sign out | Clears localStorage, redirects to `/login` | ⬜ |
| 1.1.10 | Terms & Privacy Links | Click footer links | Navigate to `/legal#terms` and `/legal#privacy` | ⬜ |

## 1.2 Sign Up Flow
| # | Test Case | Steps | Expected Result | Status |
|---|-----------|-------|-----------------|--------|
| 1.2.1 | Create Account Tab | Click "Create Account" | Form switches to signup mode | ⬜ |
| 1.2.2 | Signup Form | Fill email, password | Account creation success message | ⬜ |
| 1.2.3 | Email Verification | Check email flow | Verification email sent confirmation | ⬜ |

---

# 📋 SECTION 2: DASHBOARD & NAVIGATION

## 2.1 Dashboard (`/app/dashboard`)
| # | Test Case | Steps | Expected Result | Status |
|---|-----------|-------|-----------------|--------|
| 2.1.1 | Page Load | Navigate to dashboard | Dashboard loads with stats cards | ⬜ |
| 2.1.2 | Sidebar Navigation | Check all nav items | Dashboard, Job Cards, PDI, Fleet, Invoices visible | ⬜ |
| 2.1.3 | Quick Stats | Verify metric cards | Active Job Cards, Pending Invoices, MG Vehicles, Revenue | ⬜ |
| 2.1.4 | Recent Activity | Check activity feed | Recent job cards, status updates displayed | ⬜ |
| 2.1.5 | AI Chat Shortcut | Click "New Chat" | Navigates to `/app/chat` | ⬜ |
| 2.1.6 | Collapse Sidebar | Click collapse button | Sidebar collapses to 56px width | ⬜ |
| 2.1.7 | Expand Sidebar | Click expand button | Sidebar expands to 260px width | ⬜ |
| 2.1.8 | User Profile | Click user avatar | Dropdown shows Settings, Sign Out options | ⬜ |
| 2.1.9 | Notifications | Click bell icon | Notification dropdown with recent alerts | ⬜ |
| 2.1.10 | Intelligence Mode | Check mode selector | FAST, THINKING, DEEP_CONTEXT modes available | ⬜ |

---

# 📋 SECTION 3: JOB CARD COMPLETE FLOW

## 3.1 Job Card Listing (`/app/job-cards`)
| # | Test Case | Steps | Expected Result | Status |
|---|-----------|-------|-----------------|--------|
| 3.1.1 | Page Load | Navigate to Job Cards | Job card table/grid loads | ⬜ |
| 3.1.2 | Create New Button | Click "New Job Card" | Opens job card creation form/modal | ⬜ |
| 3.1.3 | Filter by Status | Select status filter | Job cards filter (CREATED, IN_PROGRESS, etc.) | ⬜ |
| 3.1.4 | Search Function | Type in search box | Job cards filter by vehicle number/customer name | ⬜ |
| 3.1.5 | Sort by Date | Click date column | Job cards sort by creation date | ⬜ |
| 3.1.6 | Pagination | Navigate pages | Multiple pages load correctly | ⬜ |
| 3.1.7 | Badge Count | Check sidebar badge | Shows correct count of active job cards | ⬜ |
| 3.1.8 | Click Job Card | Click on job card row | Navigates to job card detail page | ⬜ |
| 3.1.9 | Empty State | When no job cards | Shows "No job cards found" with create button | ⬜ |
| 3.1.10 | Export Option | Click export | CSV/PDF export option available | ⬜ |

## 3.2 Job Card Creation (Step 1: Vehicle Entry)
| # | Test Case | Steps | Expected Result | Status |
|---|-----------|-------|-----------------|--------|
| 3.2.1 | Create Form Opens | Click "New Job Card" | Modal/form opens with vehicle fields | ⬜ |
| 3.2.2 | Vehicle Number Input | Enter vehicle number | Accepts format: XX-XX-XX-XXXX or XXXX-XX-XX | ⬜ |
| 3.2.3 | Vehicle Auto-Lookup | Enter known vehicle | Auto-fills make, model, year if exists | ⬜ |
| 3.2.4 | New Vehicle Entry | Enter new vehicle | Fields for make, model, year, fuel type | ⬜ |
| 3.2.5 | Customer Details | Fill customer info | Name, phone, email fields | ⬜ |
| 3.2.6 | Odometer Reading | Enter KM reading | Numeric input with validation | ⬜ |
| 3.2.7 | Fuel Level Selection | Select fuel level | Dropdown: Empty, 1/4, 1/2, 3/4, Full | ⬜ |
| 3.2.8 | Next Button | Click Next | Proceeds to Symptom Entry step | ⬜ |
| 3.2.9 | Cancel Button | Click Cancel | Closes form without saving | ⬜ |
| 3.2.10 | Validation | Submit empty form | Shows required field errors | ⬜ |

## 3.3 Job Card Creation (Step 2: Symptom Entry)
| # | Test Case | Steps | Expected Result | Status |
|---|-----------|-------|-----------------|--------|
| 3.3.1 | Symptom Input | Enter symptoms | Text area for customer complaints | ⬜ |
| 3.3.2 | AI Suggestions | Type symptoms | AI suggests possible causes | ⬜ |
| 3.3.3 | Symptom Categories | Check categories | Engine, Transmission, Electrical, etc. | ⬜ |
| 3.3.4 | Severity Selection | Select severity | Low, Medium, High, Critical | ⬜ |
| 3.3.5 | Add Photo | Upload image | Image upload for damage/symptom | ⬜ |
| 3.3.6 | Voice Input | Click mic icon | Voice-to-text for symptoms | ⬜ |
| 3.3.7 | Previous History | Check history | Shows past repairs for this vehicle | ⬜ |
| 3.3.8 | Generate Estimate Button | Click button | Proceeds to estimate generation | ⬜ |
| 3.3.9 | Back Button | Click Back | Returns to vehicle entry step | ⬜ |
| 3.3.10 | Save Draft | Click Save Draft | Saves incomplete job card | ⬜ |

## 3.4 Job Card - Estimate Generation
| # | Test Case | Steps | Expected Result | Status |
|---|-----------|-------|-----------------|--------|
| 3.4.1 | AI Estimate | Generate from symptoms | AI generates parts list + labor estimate | ⬜ |
| 3.4.2 | Parts Table | Review parts | Columns: Part Name, OEM/Aftermarket, Qty, Price Range | ⬜ |
| 3.4.3 | Labor Charges | Check labor | Labor hours and rate displayed | ⬜ |
| 3.4.4 | Edit Parts | Add/remove parts | Manual adjustment of parts list | ⬜ |
| 3.4.5 | Price Range Display | Check prices | Shows ranges (₹X - ₹Y) not exact prices | ⬜ |
| 3.4.6 | Total Estimate | View total | Shows total estimated range | ⬜ |
| 3.4.7 | GST Calculation | Check tax | GST calculated on parts and labor | ⬜ |
| 3.4.8 | Send for Approval | Click button | Sends estimate to customer | ⬜ |
| 3.4.9 | Print Estimate | Click print | Generates printable PDF estimate | ⬜ |
| 3.4.10 | Save Estimate | Click save | Saves estimate to job card | ⬜ |

## 3.5 Job Card - Customer Approval
| # | Test Case | Steps | Expected Result | Status |
|---|-----------|-------|-----------------|--------|
| 3.5.1 | Approval Status | Check status badge | Shows "Pending Approval" | ⬜ |
| 3.5.2 | Customer View Link | Copy link | Generates public approval link | ⬜ |
| 3.5.3 | WhatsApp Share | Click WhatsApp | Opens WhatsApp with estimate link | ⬜ |
| 3.5.4 | Email Share | Click Email | Opens email client with estimate | ⬜ |
| 3.5.5 | Approval Received | Customer approves | Status changes to "APPROVED" | ⬜ |
| 3.5.6 | Rejection Handling | Customer rejects | Status changes to "REJECTED" with reason | ⬜ |
| 3.5.7 | Revision Request | Request changes | Returns to estimate editing | ⬜ |
| 3.5.8 | Approval History | View history | Shows approval/rejection timestamps | ⬜ |
| 3.5.9 | Digital Signature | Check signature | Customer signature captured | ⬜ |
| 3.5.10 | Auto-Start Work | Post-approval | Auto-converts to work order | ⬜ |

## 3.6 Job Card - Work In Progress
| # | Test Case | Steps | Expected Result | Status |
|---|-----------|-------|-----------------|--------|
| 3.6.1 | Work Order View | Open approved job card | Shows tasks/parts to be completed | ⬜ |
| 3.6.2 | Mechanic Assignment | Assign mechanic | Dropdown of available mechanics | ⬜ |
| 3.6.3 | Task Checklist | View tasks | Checkbox list of repair tasks | ⬜ |
| 3.6.4 | Mark Complete | Check off task | Updates progress percentage | ⬜ |
| 3.6.5 | Add Notes | Enter work notes | Mechanic can add repair notes | ⬜ |
| 3.6.6 | Part Usage | Record parts used | Actual parts consumed vs estimated | ⬜ |
| 3.6.7 | Time Tracking | Check time logs | Shows start time, elapsed time | ⬜ |
| 3.6.8 | Status Update | Change status | IN_PROGRESS → QUALITY_CHECK | ⬜ |
| 3.6.9 | Customer Updates | Send update | WhatsApp/SMS update to customer | ⬜ |
| 3.6.10 | Photos During Work | Upload progress pics | Before/after photos attached | ⬜ |

## 3.7 Job Card - PDI Checklist
| # | Test Case | Steps | Expected Result | Status |
|---|-----------|-------|-----------------|--------|
| 3.7.1 | PDI Page Load | Navigate to `/app/pdi` | PDI checklist form loads | ⬜ |
| 3.7.2 | PDI Categories | Check sections | Engine, Exterior, Interior, Electrical, etc. | ⬜ |
| 3.7.3 | Checklist Items | Review items | 50+ point checklist displayed | ⬜ |
| 3.7.4 | Pass/Fail/NA | Mark items | Each item: Pass, Fail, Not Applicable | ⬜ |
| 3.7.5 | Defect Photo | Upload for failed items | Photo upload for failed checks | ⬜ |
| 3.7.6 | Notes per Item | Add notes | Detailed notes for each checkpoint | ⬜ |
| 3.7.7 | Progress Bar | Check progress | Visual progress of checklist completion | ⬜ |
| 3.7.8 | Complete PDI | Submit checklist | Status changes to PDI_COMPLETE | ⬜ |
| 3.7.9 | PDI Report | Generate report | PDF report with all findings | ⬜ |
| 3.7.10 | Link to Job Card | Associate with JC | PDI attached to parent job card | ⬜ |

## 3.8 Job Card - Completion & Invoice Generation
| # | Test Case | Steps | Expected Result | Status |
|---|-----------|-------|-----------------|--------|
| 3.8.1 | Mark Complete | Click Complete | Job card status: COMPLETED | ⬜ |
| 3.8.2 | Final Inspection | QC verification | Quality check sign-off | ⬜ |
| 3.8.3 | Actual Parts Used | Finalize parts | Actual vs estimated comparison | ⬜ |
| 3.8.4 | Final Labor Hours | Confirm hours | Actual labor time logged | ⬜ |
| 3.8.5 | Generate Invoice | Click Generate | Creates invoice from job card | ⬜ |
| 3.8.6 | Invoice Preview | Review invoice | Line items, taxes, total displayed | ⬜ |
| 3.8.7 | Edit Before Finalize | Make adjustments | Final edits before invoice creation | ⬜ |
| 3.8.8 | Invoice Number | Check numbering | Auto-generated invoice number | ⬜ |
| 3.8.9 | Invoice Created | Confirm creation | Status: INVOICE_GENERATED | ⬜ |
| 3.8.10 | Link to Invoice | Click invoice link | Navigates to invoice detail page | ⬜ |

---

# 📋 SECTION 4: INVOICE MANAGEMENT

## 4.1 Invoice Listing (`/app/invoices`)
| # | Test Case | Steps | Expected Result | Status |
|---|-----------|-------|-----------------|--------|
| 4.1.1 | Page Load | Navigate to Invoices | Invoice table loads | ⬜ |
| 4.1.2 | Invoice Columns | Check columns | Number, Date, Customer, Amount, Status | ⬜ |
| 4.1.3 | Filter by Status | Select status | Paid, Unpaid, Overdue, Cancelled | ⬜ |
| 4.1.4 | Date Range Filter | Select dates | Invoices within date range | ⬜ |
| 4.1.5 | Search Invoice | Type invoice # | Finds specific invoice | ⬜ |
| 4.1.6 | Download PDF | Click download | Downloads invoice PDF | ⬜ |
| 4.1.7 | Send Invoice | Click send | Email/WhatsApp invoice to customer | ⬜ |
| 4.1.8 | Overdue Badge | Check overdue | Red badge on overdue invoices | ⬜ |
| 4.1.9 | Total Outstanding | Check summary | Shows total unpaid amount | ⬜ |
| 4.1.10 | Create Manual Invoice | Click New | Creates invoice without job card | ⬜ |

## 4.2 Invoice Detail View
| # | Test Case | Steps | Expected Result | Status |
|---|-----------|-------|-----------------|--------|
| 4.2.1 | Invoice Header | Check header | Invoice #, Date, Due Date, Status | ⬜ |
| 4.2.2 | Workshop Details | Verify from address | Workshop name, address, GST | ⬜ |
| 4.2.3 | Customer Details | Verify to address | Customer name, address, contact | ⬜ |
| 4.2.4 | Vehicle Details | Check vehicle info | Make, model, reg number | ⬜ |
| 4.2.5 | Line Items Table | Review items | Parts, labor, with HSN codes | ⬜ |
| 4.2.6 | Tax Breakdown | Check taxes | CGST, SGST/IGST calculation | ⬜ |
| 4.2.7 | Total Amount | Verify total | Subtotal + Tax = Total | ⬜ |
| 4.2.8 | Print Invoice | Click print | Opens print dialog with styled invoice | ⬜ |
| 4.2.9 | Payment Link | Click Pay Now | Integrates with PayU payment | ⬜ |
| 4.2.10 | Cancel Invoice | Click Cancel | Invoice marked cancelled | ⬜ |

## 4.3 Credit/Debit Notes
| # | Test Case | Steps | Expected Result | Status |
|---|-----------|-------|-----------------|--------|
| 4.3.1 | Create Credit Note | Click New CN | Form for credit note creation | ⬜ |
| 4.3.2 | Link to Invoice | Select invoice | Associates CN with invoice | ⬜ |
| 4.3.3 | Reason Selection | Select reason | Discount, Return, Error, etc. | ⬜ |
| 4.3.4 | Amount Entry | Enter amount | Credit amount (cannot exceed invoice) | ⬜ |
| 4.3.5 | CN Template | Generate PDF | Credit note with proper formatting | ⬜ |
| 4.3.6 | Adjust Invoice | Apply CN | Invoice balance updated | ⬜ |
| 4.3.7 | Debit Note | Create DN | Similar flow for debit notes | ⬜ |
| 4.3.8 | Note History | View history | All CN/DN for invoice listed | ⬜ |
| 4.3.9 | Print Note | Click print | Printable credit/debit note | ⬜ |
| 4.3.10 | Report Generation | Generate report | Monthly CN/DN summary | ⬜ |

---

# 📋 SECTION 5: MG FLEET MANAGEMENT

## 5.1 MG Fleet Dashboard (`/app/mg-fleet`)
| # | Test Case | Steps | Expected Result | Status |
|---|-----------|-------|-----------------|--------|
| 5.1.1 | Page Access | Navigate to MG Fleet | Fleet dashboard loads (subscription locked) | ⬜ |
| 5.1.2 | Subscription Gate | Without subscription | Shows upgrade prompt | ⬜ |
| 5.1.3 | Fleet Summary | Check metrics | Total vehicles, active contracts, monthly billing | ⬜ |
| 5.1.4 | Contract List | View contracts | List of all MG contracts | ⬜ |
| 5.1.5 | Add Contract | Click New Contract | Contract creation form | ⬜ |
| 5.1.6 | Contract Status | Check badges | Active, Expired, Pending badges | ⬜ |
| 5.1.7 | Quick Actions | Check buttons | Log KM, Generate Bill, View Report | ⬜ |
| 5.1.8 | Calendar View | Switch view | Shows contract start/end dates | ⬜ |
| 5.1.9 | Revenue Chart | View chart | Monthly MG revenue trend | ⬜ |
| 5.1.10 | Export Data | Click export | CSV export of fleet data | ⬜ |

## 5.2 MG Contract Creation
| # | Test Case | Steps | Expected Result | Status |
|---|-----------|-------|-----------------|--------|
| 5.2.1 | Customer Selection | Select fleet customer | Dropdown of fleet owners | ⬜ |
| 5.2.2 | Contract Type | Select type | Fixed KM, Variable KM, Hybrid | ⬜ |
| 5.2.3 | Assured KM Entry | Enter KM | Minimum guaranteed kilometers | ⬜ |
| 5.2.4 | Rate per KM | Enter rate | ₹/KM rate for billing | ⬜ |
| 5.2.5 | Vehicle Count | Add vehicles | Multi-select or add vehicles | ⬜ |
| 5.2.6 | Start Date | Select date | Contract effective date | ⬜ |
| 5.2.7 | End Date | Select date | Contract expiry date | ⬜ |
| 5.2.8 | Billing Frequency | Select frequency | Monthly, Quarterly, Annually | ⬜ |
| 5.2.9 | Terms & Conditions | Add T&C | Contract terms text area | ⬜ |
| 5.2.10 | Save Contract | Click Save | Contract created, status: Active | ⬜ |

## 5.3 MG Vehicle Log Entry
| # | Test Case | Steps | Expected Result | Status |
|---|-----------|-------|-----------------|--------|
| 5.3.1 | Log KM Button | Click Log KM | KM entry form opens | ⬜ |
| 5.3.2 | Select Vehicle | Choose vehicle | Dropdown of contract vehicles | ⬜ |
| 5.3.3 | Select Date | Pick date | Date of KM recording | ⬜ |
| 5.3.4 | Opening KM | Enter opening | Starting odometer reading | ⬜ |
| 5.3.5 | Closing KM | Enter closing | Ending odometer reading | ⬜ |
| 5.3.6 | Total KM Calculation | Auto-calculate | Closing - Opening = Total KM | ⬜ |
| 5.3.7 | Photo Upload | Upload odo photo | Odometer reading photo | ⬜ |
| 5.3.8 | GPS Verification | Check GPS | Optional GPS coordinate capture | ⬜ |
| 5.3.9 | Save Log | Click Save | KM log saved to database | ⬜ |
| 5.3.10 | Bulk Upload | Upload CSV | Multiple KM entries via CSV | ⬜ |

## 5.4 MG Billing & Calculation
| # | Test Case | Steps | Expected Result | Status |
|---|-----------|-------|-----------------|--------|
| 5.4.1 | Generate Bill | Click Generate | Billing calculation initiated | ⬜ |
| 5.4.2 | Billing Period | Select month | Month for billing | ⬜ |
| 5.4.3 | Calculation Logic | Review calculation | MAX(assured_km, actual_km) × rate | ⬜ |
| 5.4.4 | Vehicle-wise Breakdown | Expand details | Per-vehicle KM and charges | ⬜ |
| 5.4.5 | Extra KM Charges | Check extras | Additional charges if actual > assured | ⬜ |
| 5.4.6 | Discount Application | Apply discount | Percentage or fixed discount | ⬜ |
| 5.4.7 | Tax Calculation | Verify GST | GST on MG services | ⬜ |
| 5.4.8 | Preview Invoice | Click Preview | MG Invoice preview | ⬜ |
| 5.4.9 | Finalize Invoice | Click Finalize | Creates MG fleet invoice | ⬜ |
| 5.4.10 | Send to Customer | Click Send | Email invoice to fleet owner | ⬜ |

## 5.5 MG Reports
| # | Test Case | Steps | Expected Result | Status |
|---|-----------|-------|-----------------|--------|
| 5.5.1 | Monthly Report | Generate report | KM utilization, billing summary | ⬜ |
| 5.5.2 | Vehicle Utilization | Check chart | KM per vehicle trend | ⬜ |
| 5.5.3 | Contract Expiry | View alerts | Contracts expiring in 30 days | ⬜ |
| 5.5.4 | Payment History | View payments | All MG invoice payments | ⬜ |
| 5.5.5 | Audit Trail | View logs | All calculations with metadata | ⬜ |
| 5.5.6 | Export Report | Click export | PDF/Excel report download | ⬜ |
| 5.5.7 | Compare Periods | Select periods | Month-over-month comparison | ⬜ |
| 5.5.8 | Custom Date Range | Set range | Report for custom period | ⬜ |
| 5.5.9 | Scheduled Reports | Set schedule | Auto-email monthly reports | ⬜ |
| 5.5.10 | Report Templates | Select template | Different report formats | ⬜ |

---

# 📋 SECTION 6: EKA-AI CHAT INTERFACE

## 6.1 Chat Page (`/app/chat`)
| # | Test Case | Steps | Expected Result | Status |
|---|-----------|-------|-----------------|--------|
| 6.1.1 | Page Load | Navigate to Chat | Claude.ai-style chat interface loads | ⬜ |
| 6.1.2 | Empty State | Check welcome screen | "What can I help you with?" message | ⬜ |
| 6.1.3 | Intelligence Mode | Switch modes | FAST/THINKING/DEEP_CONTEXT selector | ⬜ |
| 6.1.4 | Message Input | Type query | Input field accepts text | ⬜ |
| 6.1.5 | Send Message | Press Enter/Click Send | Message appears in chat | ⬜ |
| 6.1.6 | AI Response | Wait for response | AI responds with formatted answer | ⬜ |
| 6.1.7 | User Message Style | Check styling | Black text on white/gray bubble | ⬜ |
| 6.1.8 | AI Message Style | Check styling | Orange text (#F98906) for AI | ⬜ |
| 6.1.9 | Table Formatting | Ask for parts list | Response shows table format | ⬜ |
| 6.1.10 | Bullet Points | Ask for steps | Response uses bullet formatting | ⬜ |

## 6.2 AI Features
| # | Test Case | Steps | Expected Result | Status |
|---|-----------|-------|-----------------|--------|
| 6.2.1 | Vehicle Diagnosis | Enter symptoms | AI suggests possible causes | ⬜ |
| 6.2.2 | Estimate Request | Ask for estimate | AI provides price ranges | ⬜ |
| 6.2.3 | Non-Auto Query | Ask "What's the weather?" | Domain gate blocks, asks auto question | ⬜ |
| 6.2.4 | Clarifying Questions | Vague query | AI asks for vehicle details | ⬜ |
| 6.2.5 | Confidence Score | Check response | Shows confidence percentage | ⬜ |
| 6.2.6 | Copy Response | Click copy | Copies AI response to clipboard | ⬜ |
| 6.2.7 | Regenerate | Click regenerate | AI re-generates response | ⬜ |
| 6.2.8 | Create Job Card | Click "Create JC" | Pre-fills job card form | ⬜ |
| 6.2.9 | Chat History | View past chats | Previous conversations listed | ⬜ |
| 6.2.10 | Clear Chat | Click clear | Clears current conversation | ⬜ |

---

# 📋 SECTION 7: SETTINGS & CONFIGURATION

## 7.1 Settings Page (`/app/settings`)
| # | Test Case | Steps | Expected Result | Status |
|---|-----------|-------|-----------------|--------|
| 7.1.1 | Page Load | Navigate to Settings | Settings page loads | ⬜ |
| 7.1.2 | Profile Tab | Click Profile | User profile settings | ⬜ |
| 7.1.3 | Workshop Tab | Click Workshop | Workshop details settings | ⬜ |
| 7.1.4 | Billing Tab | Click Billing | Subscription and billing info | ⬜ |
| 7.1.5 | Notifications Tab | Click Notifications | Notification preferences | ⬜ |
| 7.1.6 | Integrations Tab | Click Integrations | Third-party integrations | ⬜ |
| 7.1.7 | Profile Photo | Upload photo | Profile picture updates | ⬜ |
| 7.1.8 | Change Password | Update password | Password change success | ⬜ |
| 7.1.9 | Workshop Logo | Upload logo | Logo appears on invoices | ⬜ |
| 7.1.10 | GST Settings | Enter GSTIN | GST number saved and validated | ⬜ |

---

# 📋 SECTION 8: UI/UX & THEME VALIDATION

## 8.1 Visual Theme Consistency
| # | Test Case | Steps | Expected Result | Status |
|---|-----------|-------|-----------------|--------|
| 8.1.1 | Background Color | Check all pages | #0D0D0D (dark) background | ⬜ |
| 8.1.2 | Brand Orange | Check accents | #F98906 (amber/orange) for brand | ⬜ |
| 8.1.3 | Card Background | Check cards | #111113 card backgrounds | ⬜ |
| 8.1.4 | Border Colors | Check borders | #1D1D1F and #2A2A2D borders | ⬜ |
| 8.1.5 | Text Primary | Check headings | White (#FFFFFF) text | ⬜ |
| 8.1.6 | Text Secondary | Check body | #E5E5E5 secondary text | ⬜ |
| 8.1.7 | Font Family | Check typography | Inter font throughout | ⬜ |
| 8.1.8 | Button Primary | Check main buttons | Amber background, black text | ⬜ |
| 8.1.9 | Hover States | Hover over elements | Smooth hover transitions | ⬜ |
| 8.1.10 | Loading States | Trigger loading | Skeleton loaders/spinners shown | ⬜ |

## 8.2 Responsive Design
| # | Test Case | Steps | Expected Result | Status |
|---|-----------|-------|-----------------|--------|
| 8.2.1 | Desktop View | 1920x1080 | Full sidebar, all elements visible | ⬜ |
| 8.2.2 | Laptop View | 1366x768 | Layout adjusts, no overflow | ⬜ |
| 8.2.3 | Tablet View | 768x1024 | Collapsible sidebar, responsive tables | ⬜ |
| 8.2.4 | Mobile View | 375x667 | Mobile menu, stacked layout | ⬜ |
| 8.2.5 | Sidebar Collapse | Click toggle | Collapses to icon-only mode | ⬜ |
| 8.2.6 | Table Horizontal Scroll | Mobile tables | Tables scroll horizontally | ⬜ |
| 8.2.7 | Touch Targets | Mobile touch | Buttons min 44px touch target | ⬜ |
| 8.2.8 | Font Scaling | 200% zoom | Text remains readable | ⬜ |
| 8.2.9 | Modal Position | Open modals | Centered on all screen sizes | ⬜ |
| 8.2.10 | Print Styles | Print invoice | Print-optimized styles applied | ⬜ |

---

# 📋 SECTION 9: TEMPLATE VERIFICATION

## 9.1 Invoice Template
| # | Element | Check | Status |
|---|---------|-------|--------|
| 9.1.1 | Header with Workshop Logo | ⬜ | |
| 9.1.2 | Invoice Number & Date | ⬜ | |
| 9.1.3 | Workshop GST Details | ⬜ | |
| 9.1.4 | Customer Billing Address | ⬜ | |
| 9.1.5 | Vehicle Information Block | ⬜ | |
| 9.1.6 | Parts Table with HSN Codes | ⬜ | |
| 9.1.7 | Labor Charges Section | ⬜ | |
| 9.1.8 | Subtotal, Tax, Total | ⬜ | |
| 9.1.9 | Terms & Conditions Footer | ⬜ | |
| 9.1.10 | Authorized Signature Area | ⬜ | |

## 9.2 Estimate Template
| # | Element | Check | Status |
|---|---------|-------|--------|
| 9.2.1 | "ESTIMATE" Watermark/Header | ⬜ | |
| 9.2.2 | Validity Period Mention | ⬜ | |
| 9.2.3 | Price Range Display (₹X - ₹Y) | ⬜ | |
| 9.2.4 | Labor Hours Estimate | ⬜ | |
| 9.2.5 | Disclaimer Text | ⬜ | |
| 9.2.6 | Customer Approval Section | ⬜ | |
| 9.2.7 | Validity Expiry Date | ⬜ | |
| 9.2.8 | Terms of Estimate | ⬜ | |
| 9.2.9 | Workshop Stamp Area | ⬜ | |
| 9.2.10 | Digital Signature Line | ⬜ | |

## 9.3 Job Card Template
| # | Element | Check | Status |
|---|---------|-------|--------|
| 9.3.1 | JC Number & Barcode | ⬜ | |
| 9.3.2 | Vehicle In/Out Details | ⬜ | |
| 9.3.3 | Customer Authorization | ⬜ | |
| 9.3.4 | Fuel Level Indicator | ⬜ | |
| 9.3.5 | Odometer Reading | ⬜ | |
| 9.3.6 | Items in Vehicle Checklist | ⬜ | |
| 9.3.7 | Damage/Scratch Diagram | ⬜ | |
| 9.3.8 | Work Description Table | ⬜ | |
| 9.3.9 | Parts Used Section | ⬜ | |
| 9.3.10 | Mechanic & QC Signatures | ⬜ | |

## 9.4 PDI Checklist Template
| # | Element | Check | Status |
|---|---------|-------|--------|
| 9.4.1 | PDI Report Header | ⬜ | |
| 9.4.2 | Vehicle Delivery Details | ⬜ | |
| 9.4.3 | Exterior Check Section | ⬜ | |
| 9.4.4 | Interior Check Section | ⬜ | |
| 9.4.5 | Engine Bay Check Section | ⬜ | |
| 9.4.6 | Electrical Check Section | ⬜ | |
| 9.4.7 | Test Drive Checklist | ⬜ | |
| 9.4.8 | Defect Photo Attachments | ⬜ | |
| 9.4.9 | PDI Pass/Fail Status | ⬜ | |
| 9.4.10 | Customer Acknowledgment | ⬜ | |

## 9.5 MG Fleet Invoice Template
| # | Element | Check | Status |
|---|---------|-------|--------|
| 9.5.1 | Contract Reference Number | ⬜ | |
| 9.5.2 | Billing Period | ⬜ | |
| 9.5.3 | Assured vs Actual KM Table | ⬜ | |
| 9.5.4 | Per-Vehicle Breakdown | ⬜ | |
| 9.5.5 | Calculation Formula Display | ⬜ | |
| 9.5.6 | Extra KM Charges (if any) | ⬜ | |
| 9.5.7 | Consolidated Tax Invoice | ⬜ | |
| 9.5.8 | Payment Terms for Fleet | ⬜ | |
| 9.5.9 | Fleet Owner Authorized Signatory | ⬜ | |
| 9.5.10 | Workshop Authorized Signatory | ⬜ | |

---

# 📋 SECTION 10: PERFORMANCE & SECURITY

## 10.1 Performance Testing
| # | Test Case | Target | Status |
|---|-----------|--------|--------|
| 10.1.1 | Page Load Time | < 3 seconds | ⬜ |
| 10.1.2 | First Contentful Paint | < 1.5s | ⬜ |
| 10.1.3 | Time to Interactive | < 5s | ⬜ |
| 10.1.4 | Bundle Size | < 1.5MB | ⬜ |
| 10.1.5 | Image Optimization | WebP format | ⬜ |
| 10.1.6 | Lazy Loading | Images load on scroll | ⬜ |
| 10.1.7 | Table Pagination | < 1s to load | ⬜ |
| 10.1.8 | Search Response | < 500ms | ⬜ |
| 10.1.9 | API Call Timeout | < 10s | ⬜ |
| 10.1.10 | Memory Usage | No memory leaks | ⬜ |

## 10.2 Security Testing
| # | Test Case | Check | Status |
|---|-----------|-------|--------|
| 10.2.1 | XSS Prevention | Scripts sanitized | ⬜ |
| 10.2.2 | CSRF Protection | Tokens validated | ⬜ |
| 10.2.3 | Input Validation | SQL injection blocked | ⬜ |
| 10.2.4 | Auth Token Storage | localStorage secure | ⬜ |
| 10.2.5 | HTTPS Only | All requests HTTPS | ⬜ |
| 10.2.6 | Session Timeout | Auto logout after inactivity | ⬜ |
| 10.2.7 | Role-Based Access | Admin vs User permissions | ⬜ |
| 10.2.8 | Data Masking | Sensitive data hidden | ⬜ |
| 10.2.9 | File Upload Validation | Only images allowed | ⬜ |
| 10.2.10 | Rate Limiting | API rate limits enforced | ⬜ |

---

# 📋 SECTION 11: EDGE CASES & ERROR HANDLING

## 11.1 Error Scenarios
| # | Scenario | Expected Behavior | Status |
|---|----------|-------------------|--------|
| 11.1.1 | Network Offline | Shows offline message | ⬜ |
| 11.1.2 | API 500 Error | Error toast with retry | ⬜ |
| 11.1.3 | API 404 Error | "Not found" message | ⬜ |
| 11.1.4 | Timeout Error | Timeout notification | ⬜ |
| 11.1.5 | Invalid Form Data | Field-level errors | ⬜ |
| 11.1.6 | Duplicate Entry | "Already exists" warning | ⬜ |
| 11.1.7 | Unauthorized Access | Redirect to login | ⬜ |
| 11.1.8 | Expired Session | "Session expired" + login | ⬜ |
| 11.1.9 | Large File Upload | Size limit warning | ⬜ |
| 11.1.10 | Concurrent Edit | Conflict resolution | ⬜ |

---

# 🎯 FINAL PROMPT FOR EMERGENT

## DEPLOYMENT PREPARATION COMMAND

```
@EMERGENT: Execute comprehensive deployment preparation based on this testing checklist.

PRIORITY TASKS:

1. VERIFY ALL TEST CASES PASS
   - Run through every checkbox in this document
   - Mark PASS/FAIL for each test case
   - Document any failures with screenshots

2. PRE-PRODUCTION BUILD CHECK
   - Run: npm ci && npm run build
   - Verify zero TypeScript errors
   - Verify dist/ folder has all assets
   - Run Lighthouse audit (all scores > 80)

3. ENVIRONMENT VERIFICATION
   - Confirm all .env variables set
   - Verify API endpoints are live
   - Test Supabase connection
   - Confirm Firebase hosting configured

4. DATABASE MIGRATION
   - Run: psql $SUPABASE_DB_URL -f backend/database/migration_production_final.sql
   - Verify all tables created
   - Verify RLS policies active
   - Seed test data if needed

5. BACKEND DEPLOYMENT
   - Deploy backend to production
   - Verify /api/health returns 200
   - Test CORS configuration
   - Verify AI governance working

6. FRONTEND DEPLOYMENT
   - Deploy to Firebase hosting
   - Verify all routes load (/, /login, /app/*)
   - Test on mobile devices
   - Run automated smoke tests

7. INTEGRATION TESTING
   - Login → Dashboard → Job Card → Invoice flow
   - MG Fleet: Contract → Log KM → Generate Bill
   - AI Chat: Query → Response → Create Job Card
   - Payment: Invoice → PayU → Confirmation

8. SECURITY AUDIT
   - Verify all RLS policies
   - Test role-based access
   - Check for exposed secrets
   - Validate HTTPS enforcement

9. BACKUP & MONITORING
   - Configure automated backups
   - Set up error monitoring (Sentry)
   - Configure uptime alerts
   - Set up log aggregation

10. GO-LIVE CHECKLIST
    - [ ] All tests passing
    - [ ] Production build verified
    - [ ] Database migrated
    - [ ] Backend deployed
    - [ ] Frontend deployed
    - [ ] Custom domain configured
    - [ ] SSL certificate valid
    - [ ] Monitoring active
    - [ ] Rollback plan documented
    - [ ] Support team notified

REPORT FORMAT:
Create a file: .emergent/TESTING_REPORT.md

Include:
- Summary of tests run
- Pass/Fail counts per section
- Critical issues found (if any)
- Screenshots of key features working
- Performance metrics
- Security audit results
- Final GO/NO-GO recommendation

DELIVERABLE:
Once complete, commit the TESTING_REPORT.md and notify that the software is ready for production deployment.
```

---

# ✅ SIGN-OFF

**Tester Name:** ___________________________

**Testing Date:** ___________________________

**Total Tests:** 200+

**Tests Passed:** _______ / 200+

**Critical Issues:** ⬜ 0  ⬜ 1-3  ⬜ 4+

**Overall Status:** ⬜ PASS  ⬜ PASS WITH MINOR ISSUES  ⬜ FAIL

**Deployment Recommendation:** ⬜ GO  ⬜ NO-GO

---

**Go4Garage Private Limited**  
**EKA-AI Platform - Frontend Testing Checklist**  
**Version 1.0 | February 2026**
