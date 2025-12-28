# Test User Credentials

This document contains login credentials for testing different user roles in the Selfy platform.

## Creating Test Data

Run the seeding scripts to create test users and products:

```bash
# Seed everything at once
npm run seed:all

# Or seed individually
npm run seed:products  # Create photo booth packages
npm run seed:users     # Create test user accounts
```

All scripts are **idempotent** - you can run them multiple times safely. They will create data if it doesn't exist or skip it if it already does.

---

## Available Products (Photo Booth Packages)

The following packages are available for booking:

| Package | Price | Duration | Description |
|---------|-------|----------|-------------|
| 2 Hour Package | $299.99 | 2 hours | Perfect for small events |
| 3 Hour Package ⭐ | $449.99 | 3 hours | Most popular! |
| 4 Hour Package | $599.99 | 4 hours | Extended coverage |
| Influencer Package | $399.99 | 2 hours | For content creators |
| Corporate Package | $549.99 | 3 hours | Professional events |
| Wedding Deluxe 💍 | $749.99 | 5 hours | Premium wedding package |
| Custom Package | $799.99 | 4 hours | Fully customizable |

---

## Test Accounts

**All accounts use the same password:** `Password123!`

### 🔴 Admin User

- **Email:** `admin@selfy.com`
- **Password:** `Password123!`
- **Role:** `ADMIN`
- **Permissions:**
  - Full system access
  - View/edit all bookings
  - View/edit all templates
  - Manage products, packages, corporate orgs
  - Access admin dashboard at `/admin`

**Use this account to:**
- Test admin template management (`/admin/templates`)
- Approve quote requests
- Manage booking statuses
- View all customer templates

---

### 🟢 Corporate Admin

- **Email:** `corporate@selfy.com`
- **Password:** `Password123!`
- **Role:** `CORPORATE_ADMIN`
- **Organization:** Tech Corp Inc.
- **Permissions:**
  - Manage organization settings
  - Add/remove corporate members
  - Approve corporate bookings
  - Create bookings for the organization
  - Create design templates

**Use this account to:**
- Test corporate organization features
- Manage corporate packages
- Book events for the company
- Create templates for corporate events

---

### 🔵 Corporate Member

- **Email:** `member@selfy.com`
- **Password:** `Password123!`
- **Role:** `CORPORATE_MEMBER`
- **Organization:** Tech Corp Inc. (member)
- **Permissions:**
  - Book events under corporate organization
  - Use corporate credits/packages
  - Create design templates
  - View own bookings

**Use this account to:**
- Test member experience within corporate org
- Book events with corporate discount
- Create templates as a corporate user

---

### 🟡 Normal Customer

- **Email:** `customer@selfy.com`
- **Password:** `Password123!`
- **Role:** `CUSTOMER`
- **Permissions:**
  - Book photo booth events
  - Create design templates
  - View own bookings
  - Manage personal profile

**Use this account to:**
- Test standard customer booking flow
- Create and edit templates
- Test template locking (2 hours before event)
- Experience customer-facing features

---

## Testing Workflows

### Template Creation & Locking

1. **Login as Customer** (`customer@selfy.com`)
2. Create a booking with event time > 2 hours from now
3. After booking is CONFIRMED, create a template
4. Template should auto-save and booking → COMPLETED
5. Wait until 2 hours before event OR manually change DB
6. Try to edit template - should be LOCKED

### Admin Template Management

1. **Login as Customer** and submit a template
2. **Logout and login as Admin** (`admin@selfy.com`)
3. Navigate to `/admin/templates`
4. Click "View & Edit" on any template
5. Admin can edit customer templates
6. Admin sees customer info and booking details

### Corporate Booking Flow

1. **Login as Corporate Admin** (`corporate@selfy.com`)
2. Create a booking (gets corporate discount)
3. Submit template for approval
4. **Login as Admin** to see corporate template

---

## Database Access

To view the database directly:

```bash
npx prisma studio
```

This will open Prisma Studio in your browser where you can:
- View all users
- Inspect bookings and templates
- Modify data for testing
- View corporate organizations

---

## Notes

- All test users have `emailVerified` set to `true`
- The corporate organization "Tech Corp Inc." has:
  - 50 max seats
  - 15% discount
  - Corporate admin as owner
  - 1 member (Bob Member)
- Passwords are hashed using bcrypt
- Script can be run multiple times safely (uses upsert)

---

## Resetting Test Data

To remove test users and start fresh:

```sql
-- Run in Prisma Studio or psql
DELETE FROM "User" WHERE email IN (
  'admin@selfy.com',
  'corporate@selfy.com',
  'member@selfy.com',
  'customer@selfy.com'
);

DELETE FROM "CorporateOrg" WHERE id = 'test-corp-org-1';
```

Then run `npm run seed:users` again.
