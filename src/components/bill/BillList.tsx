import { Printer } from 'lucide-react'
import React from 'react'
import { Product } from '../../types/database';

interface BillListProps {
    bills: Bill[];
}

interface Bill {
    id: number;
    customer_name: string;
    customer_phone: string;
    customer_address: string;
    total: number;
    created_at: string;
    items: BillItem[];
    discount: number;
    sub_total: number;
}

interface BillItem {
    id: number;
    quantity: number;
    total_price: number;
    total: number;
    product_id: number;
    products: Product;
}



const BillList: React.FC<BillListProps> = ({ bills }) => {

    const handlePrint = (bill: Bill) => {
        const printWindow = window.open('', '', 'width=600,height=600');
        printWindow?.document.write(`
      <html>
        <head>
          <title>Inventory Pro - Print Receipt</title>
          <style>
            body {
              font-family: 'Arial', sans-serif;
              margin: 0;
              padding: 0;
            }
            .receipt-container {
              width: 300px;
              margin: 0 auto;
              padding: 20px;
              background-color: #fff;
              border: 1px solid #ddd;
              box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
            }
            .receipt-header {
              text-align: center;
              font-size: 18px;
              font-weight: bold;
              margin-bottom: 15px;
            }
            .receipt-header h1 {
              font-size: 24px;
              margin: 0;
              padding: 0;
            }
            .receipt-detail {
              font-size: 14px;
              margin-top: 15px;
            }
            .receipt-detail div {
              margin-bottom: 8px;
            }
            .item-list {
              margin-top: 15px;
              font-size: 14px;
              border-top: 1px dashed #ccc;
              padding-top: 10px;
            }
            .item-list div {
  margin-bottom: 5px;
  display: flex;
  justify-content: space-between; /* Distribute space evenly */
  align-items: center; /* Center vertically */
}

.item-list div span {
  width: 30%; /* Adjust the width for each column */
  text-align: center; /* Align the text to the center */
}
            .receipt-footer {
              text-align: center;
              margin-top: 20px;
              font-size: 14px;
              font-weight: bold;
            }
            .receipt-footer .total {
              font-size: 16px;
              color: #000;
              margin-top: 10px;
            }
            .receipt-footer .discount {
              font-size: 14px;
              color: red;
              margin-top: 5px;
            }
            .line {
              border-top: 1px dashed #ccc;
              margin: 10px 0;
            }
            .thank-you {
              margin-top: 10px;
              font-size: 12px;
              color: #888;
            }
          </style>
        </head>
        <body>
          <div class="receipt-container">
            <div class="receipt-header">
              <h1>Inventory Pro</h1>
              <p>Thank you for your purchase!</p>
            </div>
    
            <div class="receipt-detail">
              <div><strong>Customer Name:</strong> ${bill.customer_name}</div>
              <div><strong>Phone:</strong> ${bill.customer_phone}</div>
              <div><strong>Address:</strong> ${bill.customer_address}</div>
              <div><strong>Date:</strong> ${new Date(bill.created_at).toLocaleDateString()}</div>
            </div>
    
            <div class="item-list">
              <div><strong>Product</strong><strong>Qty</strong><strong>Price</strong></div>
              <div class="line"></div>
              ${bill.items.map(item => `
                <div>
                  <span>${item.products.name}</span>
                  <span>${item.quantity}</span>
                  <span>Rs. ${item.total_price}</span>
                </div>
              `).join('')}
              <div class="line"></div>
            </div>
    
            <div class="receipt-footer">
              <div><strong>Subtotal:</strong> Rs. ${bill.
                sub_total
            }</div>
              ${bill.discount > 0 ? `<div class="discount">Discount: Rs. ${bill.discount}</div>` : ''}
              <div class="total"><strong>Total:</strong> Rs. ${bill.total}</div>
              <div class="thank-you">We hope to serve you again!</div>
            </div>
          </div>
        </body>
      </html>
    `);
        printWindow?.document.close();
        printWindow?.print();
    };

    return (
        <div className="overflow-x-auto bg-white shadow-md rounded-lg">
            <table className="min-w-full divide-y divide-gray-300">
                <thead>
                    <tr>
                        <th className="py-3 px-6 text-left">Customer Name</th>
                        <th className="py-3 px-6 text-left">Phone Number</th>
                        <th className="py-3 px-6 text-left">Total</th>
                        <th className="py-3 px-6 text-left">Date</th>
                        <th className="py-3 px-6 text-left">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                    {bills.map((bill) => (
                        <tr key={bill.id} className="border-t">
                            <td className="py-4 px-6">{bill.customer_name}</td>
                            <td className="py-4 px-6">{bill.customer_phone}</td>
                            <td className="py-4 px-6">{bill.total}</td>
                            <td className="py-4 px-6">{new Date(bill.created_at).toLocaleDateString()}</td>
                            <td className="py-4 px-6 flex items-center space-x-2">
                                <button
                                    onClick={() => handlePrint(bill)}
                                    className="p-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                                >
                                    <Printer className="w-5 h-5" />
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}

export default BillList
