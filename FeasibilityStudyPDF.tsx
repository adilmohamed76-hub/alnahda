import React from 'react';
import type { FeasibilityStudy, Currency } from './types';

interface FeasibilityStudyPDFProps {
  study: FeasibilityStudy;
  currency: Currency;
}

const FeasibilityStudyPDF: React.FC<FeasibilityStudyPDFProps> = ({ study, currency }) => {
  const formatCurrency = (value: number) => new Intl.NumberFormat('ar-EG', { style: 'currency', currency: currency.code }).format(value * currency.rate);

  return (
    <div style={{ fontFamily: 'Cairo, sans-serif', direction: 'rtl', color: '#000', padding: '20px' }}>
      <header style={{ textAlign: 'center', borderBottom: '2px solid #333', paddingBottom: '10px', marginBottom: '20px' }}>
        <h1 style={{ fontSize: '24px', margin: '0' }}>تقرير دراسة الجدوى</h1>
        <p style={{ margin: '5px 0' }}>{study.sourceType}: {study.sourceId}</p>
        <p style={{ margin: '5px 0', fontSize: '12px' }}>تاريخ التقرير: {new Date().toLocaleDateString('ar-EG')}</p>
      </header>

      <section style={{ marginBottom: '20px' }}>
        <h2 style={{ fontSize: '18px', borderBottom: '1px solid #ccc', paddingBottom: '5px', marginBottom: '10px' }}>الملخص المالي</h2>
        <table style={{ width: '100%', fontSize: '14px' }}>
          <tbody>
            <tr>
              <td style={{ padding: '5px', fontWeight: 'bold' }}>إجمالي التكلفة (رأس المال):</td>
              <td style={{ padding: '5px', textAlign: 'left', fontWeight: 'bold', color: '#d9534f' }}>{formatCurrency(study.totalCost)}</td>
            </tr>
            <tr>
              <td style={{ padding: '5px', fontWeight: 'bold' }}>إجمالي الإيرادات المتوقعة:</td>
              <td style={{ padding: '5px', textAlign: 'left', fontWeight: 'bold', color: '#0275d8' }}>{formatCurrency(study.totalExpectedRevenue)}</td>
            </tr>
            <tr>
              <td style={{ padding: '5px', fontWeight: 'bold' }}>صافي الربح المتوقع:</td>
              <td style={{ padding: '5px', textAlign: 'left', fontWeight: 'bold', color: '#5cb85c' }}>{formatCurrency(study.totalExpectedProfit)}</td>
            </tr>
            <tr>
              <td style={{ padding: '5px', fontWeight: 'bold' }}>متوسط هامش الربح:</td>
              <td style={{ padding: '5px', textAlign: 'left', fontWeight: 'bold' }}>{study.averageMargin.toFixed(2)}%</td>
            </tr>
          </tbody>
        </table>
      </section>

      <section>
        <h2 style={{ fontSize: '18px', borderBottom: '1px solid #ccc', paddingBottom: '5px', marginBottom: '10px' }}>تفاصيل الأصناف</h2>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
          <thead style={{ backgroundColor: '#f2f2f2' }}>
            <tr>
              <th style={{ padding: '8px', textAlign: 'right', border: '1px solid #ddd' }}>المنتج</th>
              <th style={{ padding: '8px', textAlign: 'center', border: '1px solid #ddd' }}>الكمية</th>
              <th style={{ padding: '8px', textAlign: 'center', border: '1px solid #ddd' }}>تكلفة الوحدة</th>
              <th style={{ padding: '8px', textAlign: 'center', border: '1px solid #ddd' }}>سعر البيع</th>
              <th style={{ padding: '8px', textAlign: 'center', border: '1px solid #ddd' }}>ربح الوحدة</th>
              <th style={{ padding: '8px', textAlign: 'left', border: '1px solid #ddd' }}>إجمالي الربح</th>
            </tr>
          </thead>
          <tbody>
            {study.items.map(item => (
              <tr key={item.productId}>
                <td style={{ padding: '8px', border: '1px solid #ddd' }}>{item.productName}</td>
                <td style={{ padding: '8px', textAlign: 'center', border: '1px solid #ddd' }}>{item.quantity}</td>
                <td style={{ padding: '8px', textAlign: 'center', border: '1px solid #ddd' }}>{formatCurrency(item.finalCostPrice)}</td>
                <td style={{ padding: '8px', textAlign: 'center', border: '1px solid #ddd' }}>{formatCurrency(item.sellingPrice)}</td>
                <td style={{ padding: '8px', textAlign: 'center', border: '1px solid #ddd', color: item.unitProfit >= 0 ? '#5cb85c' : '#d9534f' }}>{formatCurrency(item.unitProfit)}</td>
                <td style={{ padding: '8px', textAlign: 'left', border: '1px solid #ddd', fontWeight: 'bold', color: item.totalProfit >= 0 ? '#5cb85c' : '#d9534f' }}>{formatCurrency(item.totalProfit)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
};

export default FeasibilityStudyPDF;