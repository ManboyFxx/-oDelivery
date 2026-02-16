
/**
 * Generates a PNG-like grid using CSS for thermal printer calibration.
 * Markings every 5mm to help users measure physical offsets.
 */
export function generateCalibrationHtml(paperWidth: '58mm' | '80mm' = '80mm'): string {
    const widthPx = paperWidth === '80mm' ? '302px' : '219px';

    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <style>
            @page { margin: 0; size: ${paperWidth} auto; }
            body { 
                margin: 0; 
                padding: 0; 
                width: ${paperWidth}; 
                background: white; 
                color: black;
                font-family: monospace;
            }
            .container {
                width: ${widthPx};
                border: 1px solid black;
                position: relative;
                height: 100mm;
            }
            .grid-line-h {
                position: absolute;
                left: 0;
                right: 0;
                border-top: 1px solid #ccc;
            }
            .grid-line-v {
                position: absolute;
                top: 0;
                bottom: 0;
                border-left: 1px solid #ccc;
            }
            .label {
                font-size: 8px;
                position: absolute;
                background: white;
                padding: 1px;
            }
            .border-marker {
                position: absolute;
                font-weight: bold;
                font-size: 10px;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <!-- Header info -->
            <div style="padding: 10px; text-align: center; border-bottom: 2px solid black;">
                <div style="font-weight: bold;">TESTE DE CALIBRAÇÃO</div>
                <div style="font-size: 10px;">LARGURA DETECTADA: ${paperWidth}</div>
            </div>

            <!-- Horizontal lines every 5mm -->
            ${Array.from({ length: 20 }).map((_, i) => `
                <div class="grid-line-h" style="top: ${i * 5}mm;"></div>
                <span class="label" style="top: ${i * 5}mm; left: 2px;">${i * 5}mm</span>
            `).join('')}

            <!-- Vertical lines every 5mm -->
            ${Array.from({ length: paperWidth === '80mm' ? 16 : 12 }).map((_, i) => `
                <div class="grid-line-v" style="left: ${i * 5}mm;"></div>
                <span class="label" style="left: ${i * 5}mm; top: 40mm;">${i * 5}</span>
            `).join('')}

            <!-- Margin indicators -->
            <div class="border-marker" style="top: 0; left: 0;">TOP-LEFT</div>
            <div class="border-marker" style="top: 0; right: 0;">TOP-RIGHT</div>
            <div class="border-marker" style="bottom: 0; left: 0;">BTM-LEFT</div>
            <div class="border-marker" style="bottom: 0; right: 0;">BTM-RIGHT</div>
            
            <div style="margin-top: 60mm; padding: 10px; font-size: 9px; line-height: 1.4;">
                <b>INSTRUÇÕES:</b><br>
                1. Use uma régua para medir os espaços em branco nas bordas.<br>
                2. Insira os valores (em mm) no painel de configurações.<br>
                3. Repita o teste até o conteúdo estar centralizado.
            </div>
        </div>
    </body>
    </html>
    `;
}
