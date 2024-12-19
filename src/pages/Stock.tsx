import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Button } from '../components/ui/Button';
import { StockList } from '../components/stock/StockList';
import { StockForm } from '../components/stock/StockForm';
import type { StockTransaction, Product } from '../types/database';

export default function Stock() {
  const [transactions, setTransactions] = useState<StockTransaction[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [transactionsResponse, productsResponse] = await Promise.all([
        supabase
          .from('stock_transactions')
          .select('*, product:products(name)')
          .order('transaction_date', { ascending: false }),
        supabase
          .from('products')
          .select('*')
          .order('name'),
      ]);

      setTransactions(transactionsResponse.data || []);
      setProducts(productsResponse.data || []);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Stock Management</h1>
        <Button onClick={() => setIsFormOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Transaction
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center">
          <div className="animate-spin h-8 w-8 border-t-2 border-b-2 border-blue-500 rounded-full" />
        </div>
      ) : (
        <StockList 
          transactions={transactions} 
          onUpdate={fetchData} 
        />
      )}

      <StockForm 
        open={isFormOpen}
        products={products}
        onClose={() => setIsFormOpen(false)}
        onSuccess={fetchData}
      />
    </div>
  );
}