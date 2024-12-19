import { useEffect, useState } from 'react';
import {
  DollarSign,
  ShoppingCart,
  Package,
  AlertTriangle,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { supabase } from '../lib/supabase';
import { SalesChart } from '../components/dashboard/SalesChart';
import { StatsCard } from '../components/dashboard/StatsCard';
import { formatCurrency } from '../lib/utils/currency';
import { Skeleton } from '../components/dashboard/Skeleton';

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    todaySales: 0,
    totalRevenue: 0,
    totalProducts: 0,
    lowStock: 0,
  });

  const [salesData, setSalesData] = useState({
    labels: [],
    datasets: [
      {
        label: 'Sales',
        data: [],
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
      },
    ],
  });

  const fetchDashboardData = async () => {
    try {
      const { data: salesRecords, error: salesError } = await supabase
        .from('sales_records')
        .select('*')
        .order('transaction_date', { ascending: true });

      if (salesError) throw salesError;

      const last7Days = [...Array(7)].map((_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - i);
        return d.toISOString().split('T')[0];
      }).reverse();

      const salesByDay = salesRecords?.reduce((acc, record) => {
        const date = new Date(record.transaction_date).toISOString().split('T')[0];
        acc[date] = (acc[date] || 0) + record.total_amount;
        return acc;
      }, {}) || {};

      setSalesData({
        labels: last7Days.map(date =>
          new Date(date).toLocaleDateString('en-US', { weekday: 'short' })
        ),
        datasets: [{
          label: 'Sales',
          data: last7Days.map(date => salesByDay[date] || 0),
          borderColor: 'rgb(59, 130, 246)',
          backgroundColor: 'rgba(59, 130, 246, 0.5)',
        }],
      });

      const today = new Date().toISOString().split('T')[0];
      const todaySales = salesRecords?.filter(record =>
        record.transaction_date.startsWith(today)
      ).reduce((sum, record) => sum + record.total_amount, 0) || 0;

      const totalRevenue = salesRecords?.reduce((sum, record) =>
        sum + record.total_amount, 0) || 0;

      const { count: productsCount, error: productsError } = await supabase
        .from('products')
        .select('*', { head: true, count: 'exact' });

      if (productsError) throw productsError;

      const { data: lowStockProducts, error: lowStockError } = await supabase
        .rpc('get_low_stock_products');

      if (lowStockError) throw lowStockError;

      setStats({
        todaySales,
        totalRevenue,
        totalProducts: productsCount || 0,
        lowStock: lowStockProducts?.length || 0,
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 p-8">
        {/* Stats Cards Skeleton */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>

        {/* Sales Chart Skeleton */}
        <div className="h-[400px]">
          <Skeleton className="h-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-8">
      {/* Stats Cards */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Today's Sales"
          value={formatCurrency(stats.todaySales)}
          icon={<DollarSign />}
        />
        <StatsCard
          title="Total Revenue"
          value={formatCurrency(stats.totalRevenue)}
          icon={<ShoppingCart />}
        />
        <StatsCard
          title="Total Products"
          value={stats.totalProducts.toString()}
          icon={<Package />}
        />
        <StatsCard
          title="Low Stock Items"
          value={stats.lowStock.toString()}
          icon={<AlertTriangle />}
        />
      </div>

      {/* Sales Chart */}
      <div className="h-[400px]">
        <SalesChart data={salesData} />
      </div>
    </div>
  );
}