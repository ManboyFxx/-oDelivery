---
name: employee-management
description: Employee management workflow. Adding, editing, removing employees and motoboys. Role definitions and plan limits.
allowed-tools: Read, Write, Edit
---

# Employee Management

> Logic and workflows for managing tenant employees.

## 🎯 Overview

Employees are `User` records associated with a specific `Tenant`. They have access to the platform based on their roles:

- `admin`: Full administrative access to tenant settings, products, and reports.
- `employee`: Operational access (POS, Kitchen Status, Orders Management).
- `motoboy`: Delivery access (via Dedicated Motoboy App or Web View).

## 🛠️ Implementation

### Key Files

- `App\Http\Controllers\EmployeeController` (Web Logic)
- `App\Models\User` (Model with `tenant_id` scope)
- `resources/js/Pages/Employees/Index.tsx` (Frontend UI)

### Database Structure

Users table columns:

- `tenant_id`: Mandatory for employees.
- `role`: determines permissions (`admin`, `employee`, `motoboy`).
- `is_active`: Boolean flag for temporary deactivation.

## 📋 Workflows

### 1. Adding an Employee (Manual Onboarding)

1.  **Check Limits**: The middleware `plan.limit:users` enforces subscription plan limits on the number of active users.
2.  **Validation**: `motoboy` role has specific checks for `motoboy_management` feature in the plan.
3.  **Creation**: `User::create` sets up the account with a password provided by the admin.
4.  **Login**: Employee logs in using the provided email and password.

### 2. Managing Motoboys

- Requires `motoboy_management` feature enabled in the Tenant's plan.
- Distinct metrics tracking (deliveries, distance).
- Can use dedicated Motoboy Dashboard (`/motoboy/dashboard`).

## ✅ Operational Checklist

- [ ] Checked plan limits before adding?
- [ ] Validated role permissions (Employee vs Admin)?
- [ ] Ensured email uniqueness within the tenant or globally? (Currently scoped to Tenant via Rule).
- [ ] Confirmed password complexity (min 8 chars).

## 💡 Troubleshooting

- **Cannot Add Motoboy**: Check if the plan includes `motoboy_management`.
- **Limit Reached**: Upgrade the subscription plan.
