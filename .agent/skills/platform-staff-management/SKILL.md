---
name: platform-staff-management
description: Platform-wide staff management. Managing Super Admins, Support, and Sales staff. distinct from Tenant Employees.
allowed-tools: Read, Write, Edit, Run Command
---

# Platform Staff Management

> Logic and workflows for managing the **Platform Team** (Super Admins, Support, Sales).

## 🎯 Conceptual Distinction

It is crucial to distinguish between **Tenant Employees** and **Platform Staff**:

| Feature      | Tenant Employee                                   | Platform Staff (Super Admin)                      |
| :----------- | :------------------------------------------------ | :------------------------------------------------ |
| **Scope**    | Single Restaurant (Tenant)                        | Entire Platform (All Tenants)                     |
| **Role**     | `admin` (Restaurant Owner), `employee`, `motoboy` | `super_admin`                                     |
| **Access**   | POS, Kitchen, Orders, Menu                        | Tenant Management, Global Plans, Financials, Logs |
| **Creation** | Via Tenant Dashboard > Employees                  | **Via Database / CLI / Seeder** (Currently)       |

## 🛠️ Implementation

### Key Files

- `App\Http\Controllers\SuperAdminController`
- `App\Http\Controllers\Admin\AdminUserController` (Global User View)
- `database/seeders/CreateSuperAdminSeeder.php`

### Database Structure

The `users` table uses the same structure, but `role` determines the scope:

- `role = 'super_admin'`: Bypass all tenant scopes.
- `tenant_id`: Usually `null` for pure platform staff, but can be attached to a "Headquarters" tenant for system compatibility.

## 📋 Workflows

### 1. Creating a Super Admin (Platform Staff)

Since there is no public registration for Super Admins, they must be created internally.

#### Method A: Via Artisan Command (Recommended)

_Implementation Pending - Recommended to create `make:super-admin` command._

#### Method B: Via Database Seeder (Current Standard)

1.  Open `database/seeders/CreateSuperAdminSeeder.php`.
2.  Duplicate the `User::updateOrCreate` block with new credentials.
3.  Run `php artisan db:seed --class=CreateSuperAdminSeeder`.

#### Method C: Via Tinker

```php
php artisan tinker
>>> \App\Models\User::create(['name' => 'Support Staff', 'email' => 'support@oodelivery.online', 'password' => bcrypt('password'), 'role' => 'super_admin', 'is_active' => true]);
```

### 2. Managing Staff Access

- **Permissions**: Currently, `super_admin` has full access.
- **Future Impl**: Implement `support` and `sales` roles in `RoleSeeder` to restrict access (e.g., Sales can only see Tenants/Plans, not Financials).

## ✅ Operational Checklist

- [ ] **Security**: Ensure Super Admin passwords are strong and 2FA is enabled (if available).
- [ ] **Audit**: Monitor `admin_logs` for actions taken by staff.
- [ ] **Separation**: Do not use Super Admin accounts for daily restaurant operations (create a separate `admin` account if you own a restaurant too).

## 💡 Troubleshooting

- **Login fails**: Check if `is_active` is true.
- **Access Denied**: Ensure `role` is exactly `super_admin`.
