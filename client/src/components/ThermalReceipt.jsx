import React from 'react';
import { QRCodeSVG } from 'qrcode.react';

export default function ThermalReceipt({ bill, settings }) {
  if (!bill) return null;

  const is58mm = settings?.printerType === 'thermal58';
  const paperClass = is58mm ? 'receipt-paper receipt-58mm' : 'receipt-paper';
  const formattedDate = new Date(bill.createdAt || Date.now()).toLocaleString('en-IN', {
    dateStyle: 'short',
    timeStyle: 'short'
  });

  const upiString = settings?.upiId && bill.grandTotal > 0
    ? `upi://pay?pa=${encodeURIComponent(settings.upiId)}&pn=${encodeURIComponent(settings.shopName || 'Cracker Shop')}&am=${bill.grandTotal}&cu=INR&tn=Bill%20${encodeURIComponent(bill.billNo)}`
    : null;

  return (
    <div className="thermal-receipt-container">
      <div className={paperClass}>
        {/* Header */}
        <div className="receipt-header">
          <div className="receipt-shop-name">
            {settings?.shopName || 'SRI KRISHNA CRACKERS'}
          </div>
          {settings?.tagline && (
            <div style={{ fontSize: '9px', marginBottom: '2px' }}>
              {settings.tagline}
            </div>
          )}
          {settings?.address && (
            <div style={{ fontSize: '9px' }}>
              {settings.address}
            </div>
          )}
          {settings?.phone && (
            <div style={{ fontSize: '10px', fontWeight: 'bold' }}>
              Tel: {settings.phone}
            </div>
          )}
        </div>

        <div className="receipt-divider"></div>

        {/* Bill Metadata */}
        <div style={{ fontSize: '10px', lineHeight: '1.3' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span><strong>Bill No:</strong> {bill.billNo}</span>
            <span>{formattedDate}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span><strong>Cashier:</strong> {bill.cashier || 'Admin'}</span>
            <span><strong>Pay:</strong> {bill.paymentMethod}</span>
          </div>
          {bill.customerPhone && (
            <div><strong>Cust:</strong> {bill.customerPhone}</div>
          )}
        </div>

        <div className="receipt-divider"></div>

        {/* Items Table */}
        <table className="receipt-table">
          <thead>
            <tr>
              <th style={{ width: '50%' }}>ITEM</th>
              <th style={{ width: '15%', textAlign: 'center' }}>QTY</th>
              <th style={{ width: '15%', textAlign: 'right' }}>RATE</th>
              <th style={{ width: '20%', textAlign: 'right' }}>AMT</th>
            </tr>
          </thead>
          <tbody>
            {bill.items?.map((item, idx) => (
              <tr key={idx}>
                <td style={{ wordBreak: 'break-word', paddingRight: '2px' }}>
                  {item.name}
                </td>
                <td style={{ textAlign: 'center' }}>{item.qty}</td>
                <td style={{ textAlign: 'right' }}>{item.price}</td>
                <td style={{ textAlign: 'right' }}>{item.total || (item.price * item.qty)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="receipt-divider"></div>

        {/* Totals Calculation */}
        <div style={{ fontSize: '11px', lineHeight: '1.4' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Total Items:</span>
            <span>{bill.totalItemsCount || bill.items?.reduce((s, i) => s + i.qty, 0)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Subtotal:</span>
            <span>₹{bill.subtotal}</span>
          </div>
          {bill.discount > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Festival Discount:</span>
              <span>-₹{bill.discount}</span>
            </div>
          )}
        </div>

        <div className="receipt-double-divider"></div>

        {/* Net Grand Total */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }} className="receipt-grand-total">
          <span>NET TOTAL:</span>
          <span>₹{bill.grandTotal}</span>
        </div>

        <div className="receipt-double-divider"></div>

        {/* Tendered & Change (Only if explicitly entered and > 0) */}
        {bill.paymentMethod === 'CASH' && bill.amountReceived > 0 && (
          <div style={{ fontSize: '10px', marginTop: '2px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Cash Received:</span>
              <span>₹{bill.amountReceived}</span>
            </div>
            {bill.changeToReturn > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
                <span>Change Returned:</span>
                <span>₹{bill.changeToReturn}</span>
              </div>
            )}
          </div>
        )}

        {/* Dynamic UPI QR Code on receipt */}
        {upiString && (
          <div className="text-center" style={{ margin: '8px 0 4px 0' }}>
            <QRCodeSVG value={upiString} size={is58mm ? 70 : 85} level="M" />
            <div style={{ fontSize: '8px', marginTop: '2px' }}>Scan to Pay / Verify UPI</div>
          </div>
        )}

        {/* Footer Note */}
        <div className="receipt-footer">
          <div style={{ whiteSpace: 'pre-line', fontWeight: 'bold', fontSize: '10px' }}>
            {settings?.footerNote || '✨ HAPPY DIWALI & SAFE CELEBRATIONS! ✨\nThank You! Visit Again!'}
          </div>
          <div style={{ fontSize: '8px', color: '#555', marginTop: '3px' }}>
            *** Computer Generated Invoice ***
          </div>
        </div>
      </div>
    </div>
  );
}
