import React, { useLayoutEffect, useRef } from 'react';
import JsBarcode from 'jsbarcode';

/**
 * Standard Vector SVG Barcode Component
 * Compliant with standard laser/CCD optical barcode scanners
 */
export default function BarcodeGenerator({
  value,
  width = 2.0,
  height = 55,
  fontSize = 14,
  displayValue = true,
  format = 'CODE128',
  margin = 12,
  className = ''
}) {
  const svgRef = useRef(null);

  useLayoutEffect(() => {
    if (svgRef.current && value) {
      try {
        JsBarcode(svgRef.current, String(value).trim(), {
          format,
          width,
          height,
          displayValue,
          fontSize,
          margin, // Configurable Quiet Zone for physical barcode guns
          background: '#ffffff',
          lineColor: '#000000',
          fontOptions: 'bold',
          textMargin: 3
        });
      } catch (err) {
        console.error('Barcode rendering error:', err);
      }
    }
  }, [value, width, height, fontSize, displayValue, format, margin]);

  return <svg ref={svgRef} className={className}></svg>;
}

/**
 * Generates and downloads a complete, professional retail product sticker label
 * Formatted with generous white margins (quiet zones) so physical barcode guns can scan reliably.
 */
export function downloadProductSticker({
  barcode,
  name,
  price,
  mrp,
  shopName = 'SRI KRISHNA CRACKERS',
  category = 'Crackers'
}) {
  try {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    // High resolution canvas for sharp printing (500x320 px)
    canvas.width = 540;
    canvas.height = 340;

    // Fill clean white background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Border
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 4;
    ctx.strokeRect(8, 8, canvas.width - 16, canvas.height - 16);

    // 1. Shop Header
    ctx.fillStyle = '#1e1b4b';
    ctx.font = 'bold 20px "Plus Jakarta Sans", Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(shopName.toUpperCase(), canvas.width / 2, 42);

    // Thin divider line
    ctx.strokeStyle = '#cccccc';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(20, 54);
    ctx.lineTo(canvas.width - 20, 54);
    ctx.stroke();

    // 2. Product Name
    ctx.fillStyle = '#000000';
    ctx.font = 'bold 22px "Plus Jakarta Sans", Arial, sans-serif';
    ctx.textAlign = 'center';
    
    // Truncate name if too long
    let displayName = name || 'Cracker Item';
    if (displayName.length > 32) {
      displayName = displayName.substring(0, 30) + '...';
    }
    ctx.fillText(displayName, canvas.width / 2, 85);

    // 3. Render High-Contrast Scannable Barcode in the center with wide quiet zones
    const barcodeCanvas = document.createElement('canvas');
    JsBarcode(barcodeCanvas, String(barcode).trim(), {
      format: 'CODE128',
      width: 2.6,
      height: 90,
      displayValue: true,
      fontSize: 20,
      margin: 15, // Required Quiet Zone
      background: '#ffffff',
      lineColor: '#000000',
      fontOptions: 'bold'
    });

    // Draw barcode centered
    const bcX = (canvas.width - barcodeCanvas.width) / 2;
    ctx.drawImage(barcodeCanvas, bcX, 105);

    // 4. Price & MRP Banner at bottom
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(14, 255, canvas.width - 28, 65);
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.strokeRect(14, 255, canvas.width - 28, 65);

    ctx.fillStyle = '#000000';
    ctx.font = 'bold 24px "Plus Jakarta Sans", Arial, sans-serif';
    ctx.textAlign = 'center';

    let priceText = `PRICE: ₹${price}`;
    if (mrp && mrp > price) {
      priceText += `  (MRP: ₹${mrp})`;
    }
    ctx.fillText(priceText, canvas.width / 2, 298);

    // Trigger Download
    const imgURL = canvas.toDataURL('image/png', 1.0);
    const link = document.createElement('a');
    const safeName = (name || 'Cracker').replace(/[^a-zA-Z0-9]/g, '_');
    link.href = imgURL;
    link.download = `Sticker_${safeName}_${barcode}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (err) {
    console.error('Failed to generate sticker image:', err);
    alert('Error generating product sticker');
  }
}

/**
 * Utility to download Pure Barcode PNG with guaranteed quiet zones for laser scanners
 */
export function downloadBarcodeImage(barcodeValue, productName = 'Cracker_Barcode') {
  try {
    const canvas = document.createElement('canvas');
    JsBarcode(canvas, String(barcodeValue).trim(), {
      format: 'CODE128',
      width: 3.0,
      height: 95,
      displayValue: true,
      fontSize: 22,
      margin: 25, // Large quiet zones on both sides for laser scanner beam
      background: '#ffffff',
      lineColor: '#000000',
      fontOptions: 'bold'
    });

    const imgURL = canvas.toDataURL('image/png', 1.0);
    const link = document.createElement('a');
    link.href = imgURL;
    const safeName = productName.replace(/[^a-zA-Z0-9]/g, '_');
    link.download = `Barcode_${safeName}_${barcodeValue}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (err) {
    console.error('Failed to download barcode:', err);
    alert('Could not download barcode image');
  }
}
