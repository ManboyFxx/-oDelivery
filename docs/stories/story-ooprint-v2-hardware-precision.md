# Story 2.3.0: Hardware Precision (ESC/POS)

## Goal
Improve operational speed and print consistency by providing granular control over the printing hardware, enabling silent printing, and millimetric margin calibration.

## Context
Currently, the terminal relies on the browser/system print dialog which interrupts the flow of the operator. Additionally, varying printer models (58mm/80mm) often require manual margin adjustments that are not currently accessible in the UI.

## Scope
1. **Silent Printing**:
    - Add `silentPrint` option to Printer Settings.
    - When enabled, the system print dialog is bypassed (requires Electron).
2. **Millimetric Margins**:
    - Granular control for Left, Right, Top, and Bottom margins (0-10mm).
    - These margins will be applied to the CSS of the printed area.
3. **Hardware Beep**:
    - Refine the alert sound system to ensure it's audible.
4. **Calibration Utility**:
    - Dedicated "Print Test Page" that outputs a reference grid for the operator to measure and adjust margins.

## User Review Required
> [!IMPORTANT]
> Silent printing requires the correct printer to be selected in the settings. If "Auto" is used, it will use the system default printer.

> [!TIP]
> This story focuses on the software-layer precision using the System Driver. Native ESC/POS (USB/Serial communication) is a future target for v3.0 to manage cutters and cash drawers more reliably.
