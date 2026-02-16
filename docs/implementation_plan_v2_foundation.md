# Implementation Plan - óoprint v2 Foundation (STORY-2.1.0)

## Goal
Implement the foundational features for `óoprint` v2: Cloud Synchronization, Local Persistence, and Status Control.

## User Review Required
> [!IMPORTANT]
> This update involves changes to both the Laravel Backend and the Electron Frontend.
> Ensure the backend is deployed before updating the terminals.

## Proposed Changes

### Backend (Laravel)

#### [MODIFY] [routes/api.php](file:///c:/Users/Vertinho/Documents/Sistemas/OoDelivery/-oDelivery/routes/api.php)
- Add `POST /printer/orders/{id}/status` route.

#### [MODIFY] [PrinterController.php](file:///c:/Users/Vertinho/Documents/Sistemas/OoDelivery/-oDelivery/app/Http/Controllers/Api/PrinterController.php)
- Add `updateStatus` method to handle 'confirmed', 'preparing', 'ready', 'dispatched' statuses.
- Use `$request->tenant->id` for security scope.

### Frontend (óoprint)

#### [MODIFY] [types.ts](file:///c:/Users/Vertinho/Documents/Sistemas/OoDelivery/-oDelivery/óoprint/types.ts)
- Add `PrinterSettings` interface.
- Update `ApiOrder` or create `LocalOrder` type to include persisted data.

#### [MODIFY] [restApiClient.ts](file:///c:/Users/Vertinho/Documents/Sistemas/OoDelivery/-oDelivery/óoprint/services/restApiClient.ts)
- Add `updateOrderStatus(id, status)` method.
- Add `getSettings()` method (using `profile` endpoint).

#### [MODIFY] [App.tsx](file:///c:/Users/Vertinho/Documents/Sistemas/OoDelivery/-oDelivery/óoprint/App.tsx)
- Implement `useEffect` to fetch and apply settings on startup.
- Implement Persistence logic:
  - Load recent orders from `localStorage` on boot.
  - Save to `localStorage` when orders are printed.
  - Add "Recent" tab or section.

#### [MODIFY] [components/OrderItem.tsx](file:///c:/Users/Vertinho/Documents/Sistemas/OoDelivery/-oDelivery/óoprint/components/OrderItem.tsx)
- Add Action Buttons: `[Confirmar]`, `[Pronto]`, `[Saiu p/ Entrega]`.
- Logic:
  - If status == 'new' -> Show `[Confirmar]`
  - If status == 'preparing' -> Show `[Pronto]`
  - If status == 'ready' -> Show `[Saiu p/ Entrega]`

## Verification Plan

### Automated Tests
- None for this phase (Manual test required for hardware/Electron).

### Manual Verification
1.  **Sync:** Change `paper_width` in Backend (`tinker` or DB). Restart `óoprint`. Verify UI width changes.
2.  **Persistence:** Print an order. Refresh `óoprint`. Order should still be visible in "Recent" list.
3.  **Status:** Click "Confirmar" on a new order. Check Backend DB `orders` table to see `status='preparing'`.
