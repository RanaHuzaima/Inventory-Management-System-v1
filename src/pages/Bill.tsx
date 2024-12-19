import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { toast } from 'react-hot-toast';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Product } from '../types/database';
import BillList from '../components/bill/BillList';
import { Plus } from 'lucide-react';

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

export default function BillPage() {
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch the bills from the database
  const fetchBills = async () => {
    try {
      // Fetch all bills from the 'bills' table
      const { data: bills, error: billsError } = await supabase
        .from('bills')
        .select('*')
        .order('created_at', { ascending: false });

      if (billsError) throw billsError;

      // For each bill, fetch the related bill_items
      const billsWithItemsAndProducts = await Promise.all(
        bills.map(async (bill) => {
          const { data: items, error: itemsError } = await supabase
            .from('bill_items')
            .select('*, products(*)') // Select all columns from bill_items and related product details
            .eq('bill_id', bill.id); // Assuming `bill_id` is the foreign key in `bill_items`

          if (itemsError) throw itemsError;

          // Attach items and their product details to the bill
          const itemsWithProductNames = items.map(item => ({
            ...item,
            product_name: item.products?.name || "Unknown Product", // Get product name, fallback to "Unknown Product"
          }));

          return {
            ...bill,
            items: itemsWithProductNames // Attach the processed items to the bill
          };
        })
      );

      setBills(billsWithItemsAndProducts);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching bills or items:', error);
      toast.error('Failed to load bills.');
      setLoading(false);
    }
  };



  useEffect(() => {
    fetchBills();
  }, []);

  return (
    <div className="p-8 sp">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Bills</h1>
        <Link to="/add-bill">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Bill
          </Button>
        </Link>
      </div>
      {loading ? (
        <div className="flex justify-center">
          <div className="animate-spin h-8 w-8 border-t-2 border-b-2 border-blue-500 rounded-full" />
        </div>
      ) : (
        <BillList bills={bills}
        />
      )}
    </div>
  );
}
