# Story: óoprint v2 Foundation (Sync & Persistence)

**ID:** STORY-2.1.0
**Epic:** óoprint v2 Upgrade
**Author:** River (@sm)
**Status:** Ready for Dev
**Assigned to:** @dev (Dex)

---

## 1. Context
We are starting the "heavy implementation" of the `óoprint` upgrade. The first step is to establish synchronization between the Cloud Backend and the Local Terminal, and to ensure orders persist in the local UI for better operational control.

## 2. Requirements

### 2.1. Cloud Synchronization
- **Backend:** Create `GET /api/printer/settings` endpoint returning:
  - `paper_width` (58/80mm)
  - `print_copies`
  - `logo_url`
  - `establishment_name`
- **Frontend (Reader):** Update `óoprint` to fetch these settings on startup and override local defaults.

### 2.2. Local Order Persistence (The "Don't Vanish" Rule)
- **Problem:** Currently, once printed, orders disappear or are hard to find.
- **Solution:** Implement a "Recent Orders" list using local state (or `electron-store`).
- **Behavior:** Orders remain visible in a "Recent" tab/list until manually dismissed or after X hours.

### 2.3. Status Control Actions
- **UI:** Add buttons to the Order Card in `óoprint`:
  - `[Confirmar]` -> Calls API to change status to `accepted`.
  - `[Pronto]` -> Calls API to change status to `ready`.
  - `[Finalizar]` -> Calls API to change status to `dispatched/delivered`.

## 3. Acceptance Criteria
- [ ] Terminal downloads settings (Paper Width, Name) from Laravel Backend on startup.
- [ ] Users can see "Recent Orders" even after they are printed.
- [ ] Users can change order status (Confirm/Ready) directly from the specific Order Card.
- [ ] API Endpoints for `settings` and `status` are functional and secured.

## 4. Technical Notes (from @architect)
- Use `StoreSetting` model in Laravel to store printer configs.
- For persistence, you can use `electron-store` which is lightweight and file-based.
- Ensure `restApiClient.ts` is updated with new endpoints.

## 5. File List (To be updated by @dev)
- `app/Http/Controllers/Api/PrinterController.php`
- `routes/api.php`
- `óoprint/services/settingsService.ts`
- `óoprint/components/OrdersList.tsx`
- `óoprint/electron/main.cjs` (if needed for store)

---
*Drafted by River* 🌊
