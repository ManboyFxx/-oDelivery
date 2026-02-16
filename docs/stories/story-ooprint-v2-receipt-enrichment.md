# Story: Receipt Enrichment (STORY-2.2.0)

## Goal
Enhance the printed receipt with high-value visual elements:
1.  **Establishment Logo**: Show the digital menu logo at the top.
2.  **QR Code**: Display a QR code for the Digital Menu or PIX (to be implemented later).
3.  **Loyalty Status**: Show current customer points and rewards (if applicable).
4.  **Premium Layout**: Refine separators and font scales for different paper widths.

## Proposed Changes

### [Frontend] óoprint
- Install `qrcode.react`.
- Update `Order` interface in `types.ts`.
- Add Logo, QR Code, and Loyalty sections to `PrintableArea.tsx`.

## Verification
- Print and scan QR code.
- Verify Logo visibility.
