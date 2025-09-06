import React, { useEffect, useRef } from 'react';
import type { Product, Currency } from './types';

declare const JsBarcode: any;

interface BarcodePrintSheetProps {
  product: Product;
  quantity: number;
  currency: Currency;
}

const BarcodeLabel: React.FC<{ product: Product, currency: Currency }> = ({ product, currency }) => {
  const barcodeRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (barcodeRef.current && product.barcode) {
      try {
        JsBarcode(barcodeRef.current, product.barcode, {
          format: "EAN13",
          displayValue: true,
          fontSize: 10,
          textMargin: 0,
          margin: 4,
          height: 30,
          width: 1.5
        });
      } catch (e) {
        console.error("Error generating barcode:", e);
      }
    }
  }, [product.barcode]);
  
  const formatCurrency = (value: number) => 
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.code,
    }).format(value * currency.rate);

  return (
    <div style={{
      border: '1px dotted #999',
      padding: '4px',
      textAlign: 'center',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      height: '100%',
      boxSizing: 'border-box'
    }}>
      <div style={{ fontSize: '9px', fontWeight: 'bold', lineHeight: '1.2', maxHeight: '2.4em', overflow: 'hidden' }}>
        {product.name}
      </div>
      <div style={{ fontSize: '12px', fontWeight: 'bold', margin: '2px 0' }}>
        {formatCurrency(product.price)}
      </div>
      <svg ref={barcodeRef} style={{ width: '100%', height: 'auto' }}></svg>
    </div>
  );
};

const BarcodePrintSheet: React.FC<BarcodePrintSheetProps> = ({ product, quantity, currency }) => {
  const labels = Array.from({ length: quantity }, (_, i) => i);

  return (
    <div className="barcode-sheet-print-area">
      <style>{`
        @page {
          size: A4;
          margin: 1cm;
        }
        .barcode-sheet-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          grid-template-rows: repeat(10, 1fr);
          gap: 4px;
          height: calc(29.7cm - 2cm);
          width: calc(21cm - 2cm);
        }
        @media print {
          html, body {
            height: 100%;
            margin: 0;
            padding: 0;
            background-color: #fff !important;
          }
          .barcode-sheet-grid {
            page-break-inside: auto;
          }
          .barcode-label-wrapper {
             page-break-inside: avoid;
             height: 100%;
          }
        }
      `}</style>
      <div className="barcode-sheet-grid">
        {labels.map(i => (
          <div key={i} className="barcode-label-wrapper">
             <BarcodeLabel product={product} currency={currency} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default BarcodePrintSheet;
