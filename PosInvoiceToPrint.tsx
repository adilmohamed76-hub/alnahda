import React from 'react';
import type { SalesOrder, Currency, User, SystemSettings } from './types';

interface PosInvoiceToPrintProps {
  invoice: SalesOrder;
  currency: Currency;
  user: User | null;
  settings: SystemSettings;
}

const PosInvoiceToPrint: React.FC<PosInvoiceToPrintProps> = ({ invoice, currency, user, settings }) => {
  const formatCurrency = (value: number) => {
    const convertedValue = value * currency.rate;
    return new Intl.NumberFormat('ar-EG', {
      style: 'currency',
      currency: currency.code,
    }).format(convertedValue);
  };

  return (
    <div className="print-only" style={{ fontFamily: 'monospace', fontSize: '12px', color: '#000', width: '280px', margin: '0 auto', padding: '10px' }}>
      <div style={{ textAlign: 'center', marginBottom: '15px' }}>
        {settings.companyLogo && <img src={settings.companyLogo} alt={settings.companyName} style={{ maxWidth: '120px', margin: '0 auto 10px' }} />}
        <h1 style={{ fontSize: '18px', margin: '0' }}>{settings.companyName}</h1>
        <p style={{ margin: '5px 0' }}>فاتورة مبيعات</p>
      </div>
      <div style={{ marginBottom: '10px' }}>
        <p><strong>رقم الفاتورة:</strong> {invoice.soNumber}</p>
        <p><strong>التاريخ:</strong> {new Date(invoice.orderDate).toLocaleString('ar-EG')}</p>
        <p><strong>العميل:</strong> {invoice.customerName}</p>
        {user && <p><strong>الكاشير:</strong> {user.name}</p>}
      </div>
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '10px' }}>
        <thead>
          <tr style={{ borderTop: '1px dashed #000', borderBottom: '1px dashed #000' }}>
            <th style={{ textAlign: 'right', padding: '5px' }}>الصنف</th>
            <th style={{ textAlign: 'center', padding: '5px' }}>الكمية</th>
            <th style={{ textAlign: 'center', padding: '5px' }}>السعر</th>
            <th style={{ textAlign: 'left', padding: '5px' }}>الإجمالي</th>
          </tr>
        </thead>
        <tbody>
          {invoice.items.map(item => (
            <tr key={item.productId}>
              <td style={{ textAlign: 'right', padding: '5px' }}>{item.productName}</td>
              <td style={{ textAlign: 'center', padding: '5px' }}>{item.quantity}</td>
              <td style={{ textAlign: 'center', padding: '5px' }}>{formatCurrency(item.price)}</td>
              <td style={{ textAlign: 'left', padding: '5px' }}>{formatCurrency(item.price * item.quantity)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div style={{ borderTop: '1px dashed #000', paddingTop: '10px', fontSize: '12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>المجموع الفرعي:</span>
          <span>{formatCurrency(invoice.subtotal)}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>الضريبة ({settings.vatRate}%):</span>
          <span>{formatCurrency(invoice.taxAmount)}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', fontWeight: 'bold', marginTop: '5px' }}>
          <span>الإجمالي النهائي:</span>
          <span>{formatCurrency(invoice.totalAmount)}</span>
        </div>
      </div>
      <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '10px' }}>
        <p>{settings.posReceiptFooter}</p>
      </div>
    </div>
  );
};

export default PosInvoiceToPrint;