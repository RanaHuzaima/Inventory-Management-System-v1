export interface Profile {
  id: string;
  full_name: string;
  company_name: string;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  user_id: string;
  category_id: string;
  sku: string;
  name: string;
  description: string | null;
  unit_price: number;
  current_stock: number;
  minimum_stock: number;
  created_at: string;
  updated_at: string;
}

export interface StockTransaction {
  id: string;
  user_id: string;
  product_id: string;
  sheet_number: string;
  quantity: number;
  type: 'in' | 'out';
  notes: string | null;
  transaction_date: string;
  created_at: string;
}

export interface SalesRecord {
  id: string;
  user_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  total_amount: number;
  transaction_date: string;
  created_at: string;
}

