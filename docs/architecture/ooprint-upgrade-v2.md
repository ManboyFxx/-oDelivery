# Architecture Design: óoprint Upgrade v2.0

**Author:** Aria (@architect)
**Date:** 2026-02-15
**Status:** Approved for Implementation

---

## 1. Executive Summary

This architecture design addresses the "heavy implementation" required to upgrade the `óoprint` terminal from a simple polling client to a robust, synchronized, and hardware-aware print server. The goal is to align the terminal with the main `oDelivery` system features, ensuring receipt precision, data synchronization, and a premium user experience.

## 2. Core Architectural Components

### 2.1. Synchronization Engine (Cloud-to-Local)
Currently, `óoprint` relies on local settings. We will implement a **Pull-Sync Pattern**:
- **Source of Truth:** The Laravel Backend (`StoreSetting` model).
- **Client Protocol:** On startup and every polling interval, `óoprint` fetches `GET /api/printer/settings`.
- **Local State:** Electron `localstorage` / `json` updates its config based on the cloud response.
- **Bi-Directional Health:** `óoprint` sends `heartbeat` with status (paper/error) to `POST /api/printer/status`.

### 2.2. Receipt Rendering Engine (The "Premium" Coupon)
We will move away from simple HTML-to-PDF-to-Spooler for critical elements.
- **Hybrid Rendering:**
  - **HTML/CSS:** For complex layouts (tables, text).
  - **Canvas/Bitmap:** For Logos and QR Codes.
- **Enrichment Pipeline:**
  - `Order Data` + `Store Config` -> `Receipt Template` -> `Printable Commands`.
  - **QR Code Gen:** Use `qrcode` library in Electron to generate Pix strings locally or fetch pre-generated images.
  - **Logo Processing:** Convert colored logos to Dithering/Monochrome Bitmaps for thermal printing.

### 2.3. Hardware Abstraction Layer (HAL)
To achieve "Precision", we must bypass the Windows Spooler for commands.
- **Library:** Use `electron-pos-printer` or `node-escpos` adaptation.
- **Direct Commands:**
  - `ESC @` (Initialize)
  - `GS V` (Cut)
  - `ESC p` (Drawer Kick)
- **Fallback:** Maintain Windows Spooler support for non-standard printers, but prioritize Raw/Direct mode for ESC/POS devices.

## 3. Data Flow & Security

### 3.1. Authentication
- **Token-Based:** Continue using the `PrinterToken` established in v1.
- **Rotation:** Implement token rotation on major errors to preventing ghost terminals.

### 3.2. Order Lifecycle (Persistence)
- **Local Database:** Introduce `lowdb` or `SQLite` (via Electron) to persist "Recent Orders" locally.
- **Reasoning:** Prevents orders from vanishing on UI refresh. Allows "Reprint" functionality even if offline.

## 4. Phasing Strategy

### Phase 1: Foundation & Sync (Story 2.1)
- Implement `GET /settings` endpoint.
- Update `óoprint` to consume cloud settings.
- Implement Local Persistence for Orders (UI fixes).

### Phase 2: Receipt Enrichment (Story 2.2)
- Implement Logo Bitmap conversion.
- Implement Pix QR Code rendering on receipt.
- Add Loyalty/Points info to footer.

### Phase 3: Hardware Precision (Story 2.3)
- Implement Raw ESC/POS commands (Cut/Drawer).
- Implement layout calibration tool.

---
*Signed,*
*Aria* 🏛️
