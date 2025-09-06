import React from 'react';
import type { SalesOrder, Currency, Customer, SystemSettings } from './types';

interface SalesInvoiceToPrintProps {
  invoice: SalesOrder;
  currency: Currency;
  customer: Customer | null;
  settings: SystemSettings;
}

const SalesInvoiceToPrint: React.FC<SalesInvoiceToPrintProps> = ({ invoice, currency, customer, settings }) => {
  const formatCurrency = (value: number) => {
    const convertedValue = value * currency.rate;
    return new Intl.NumberFormat('ar-EG', {
      style: 'currency',
      currency: currency.code,
    }).format(convertedValue);
  };

  const companyInfo = {
    name: settings.companyName,
    logo: settings.companyLogo,
    address: settings.companyAddress,
    phone: settings.companyPhone,
    email: settings.companyEmail,
  };

  return (
    <div className="print-only" style={{ fontFamily: 'Cairo, sans-serif', direction: 'rtl', color: '#000' }}>
      <div style={{ maxWidth: '800px', margin: 'auto', padding: '40px', border: '1px solid #eee' }}>
        {/* Header */}
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid #3b82f6', paddingBottom: '20px', marginBottom: '30px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              {companyInfo.logo ? (
                <img src={companyInfo.logo} alt={companyInfo.name} style={{ height: '50px', objectFit: 'contain' }} />
              ) : (
                <svg style={{ width: '40px', height: '40px', color: '#3b82f6' }} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
              )}
              <h1 style={{ fontSize: '28px', margin: '0', fontWeight: 'bold' }}>{companyInfo.name}</h1>
            </div>
            <p style={{ margin: '5px 0 0', fontSize: '12px' }}>{companyInfo.address}</p>
            <p style={{ margin: '5px 0 0', fontSize: '12px' }}>{companyInfo.phone} | {companyInfo.email}</p>
          </div>
          <div style={{ textAlign: 'left' }}>
            <h2 style={{ fontSize: '32px', margin: '0', color: '#6b7280' }}>فاتورة</h2>
            <p style={{ margin: '5px 0 0' }}><strong>رقم الفاتورة:</strong> {invoice.soNumber}</p>
            <p style={{ margin: '5px 0 0' }}><strong>التاريخ:</strong> {new Date(invoice.orderDate).toLocaleDateString('ar-EG')}</p>
          </div>
        </header>

        {/* Customer Info */}
        <section style={{ marginBottom: '40px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 'bold', color: '#6b7280', marginBottom: '10px' }}>فاتورة إلى:</h3>
          {customer && (
            <>
              <p style={{ margin: '0', fontSize: '16px', fontWeight: 'bold' }}>{customer.name}</p>
              <p style={{ margin: '5px 0 0', fontSize: '12px' }}>{customer.email}</p>
              <p style={{ margin: '5px 0 0', fontSize: '12px' }}>{customer.phone}</p>
            </>
          )}
        </section>

        {/* Items Table */}
        <section>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
            <thead style={{ backgroundColor: '#f3f4f6' }}>
              <tr>
                <th style={{ padding: '12px', textAlign: 'right', borderBottom: '2px solid #e5e7eb' }}>#</th>
                <th style={{ padding: '12px', textAlign: 'right', borderBottom: '2px solid #e5e7eb' }}>الصنف</th>
                <th style={{ padding: '12px', textAlign: 'center', borderBottom: '2px solid #e5e7eb' }}>الكمية</th>
                <th style={{ padding: '12px', textAlign: 'center', borderBottom: '2px solid #e5e7eb' }}>سعر الوحدة</th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #e5e7eb' }}>الإجمالي</th>
              </tr>
            </thead>
            <tbody>
              {invoice.items.map((item, index) => (
                <tr key={item.productId} style={{ borderBottom: '1px solid #e5e7eb' }}>
                  <td style={{ padding: '12px' }}>{index + 1}</td>
                  <td style={{ padding: '12px', fontWeight: 'bold' }}>{item.productName}</td>
                  <td style={{ padding: '12px', textAlign: 'center' }}>{item.quantity}</td>
                  <td style={{ padding: '12px', textAlign: 'center' }}>{formatCurrency(item.price)}</td>
                  <td style={{ padding: '12px', textAlign: 'left' }}>{formatCurrency(item.price * item.quantity)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {/* Totals */}
        <section style={{ marginTop: '30px', display: 'flex', justifyContent: 'flex-end' }}>
          <div style={{ width: '40%', fontSize: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #eee' }}>
              <span>المجموع الفرعي:</span>
              <span>{formatCurrency(invoice.subtotal)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #eee' }}>
              <span>الضريبة ({settings.vatRate}%):</span>
              <span>{formatCurrency(invoice.taxAmount)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '15px 0', backgroundColor: '#f3f4f6', fontWeight: 'bold', fontSize: '18px' }}>
              <span style={{ paddingRight: '10px' }}>الإجمالي النهائي:</span>
              <span style={{ paddingLeft: '10px' }}>{formatCurrency(invoice.totalAmount)}</span>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer style={{ marginTop: '50px', paddingTop: '20px', borderTop: '1px solid #eee', textAlign: 'center', fontSize: '12px', color: '#6b7280' }}>
          <p>شكراً لتعاملكم معنا!</p>
          <p>إذا كان لديك أي استفسار بخصوص هذه الفاتورة، يرجى التواصل معنا.</p>
        </footer>
      </div>
    </div>
  );
};

export default SalesInvoiceToPrint;