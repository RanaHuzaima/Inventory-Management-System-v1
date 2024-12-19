/*
  # Initial Schema Setup for Inventory Management System

  1. New Tables
    - `profiles`
      - User profile information including company details
    - `categories`
      - Product categories management
    - `products`
      - Product information and current stock levels
    - `stock_transactions`
      - Stock movement records (in/out)
    - `sales_records`
      - Sales transaction records

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
    - Ensure users can only access their company's data

  3. Triggers
    - Update product stock levels on stock transactions
    - Update sales records on stock out transactions
*/

-- First, create all tables without foreign key constraints
CREATE TABLE profiles (
  id uuid PRIMARY KEY,
  full_name text NOT NULL,
  company_name text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  name text NOT NULL,
  description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  category_id uuid NOT NULL,
  sku text NOT NULL,
  name text NOT NULL,
  description text,
  unit_price decimal(10,2) NOT NULL,
  current_stock integer DEFAULT 0,
  minimum_stock integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE stock_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  product_id uuid NOT NULL,
  sheet_number text NOT NULL,
  quantity integer NOT NULL,
  type text NOT NULL CHECK (type IN ('in', 'out')),
  notes text,
  transaction_date timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

CREATE TABLE sales_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  product_id uuid NOT NULL,
  quantity integer NOT NULL,
  unit_price decimal(10,2) NOT NULL,
  total_amount decimal(10,2) NOT NULL,
  transaction_date timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Add foreign key constraints
ALTER TABLE profiles
  ADD CONSTRAINT profiles_id_fkey 
  FOREIGN KEY (id) REFERENCES auth.users(id);

ALTER TABLE categories
  ADD CONSTRAINT categories_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES auth.users(id);

ALTER TABLE products
  ADD CONSTRAINT products_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES auth.users(id),
  ADD CONSTRAINT products_category_id_fkey 
  FOREIGN KEY (category_id) REFERENCES categories(id);

ALTER TABLE stock_transactions
  ADD CONSTRAINT stock_transactions_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES auth.users(id),
  ADD CONSTRAINT stock_transactions_product_id_fkey 
  FOREIGN KEY (product_id) REFERENCES products(id);

ALTER TABLE sales_records
  ADD CONSTRAINT sales_records_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES auth.users(id),
  ADD CONSTRAINT sales_records_product_id_fkey 
  FOREIGN KEY (product_id) REFERENCES products(id);

-- Add unique constraints
ALTER TABLE categories
  ADD CONSTRAINT categories_user_id_name_key 
  UNIQUE (user_id, name);

ALTER TABLE products
  ADD CONSTRAINT products_user_id_sku_key 
  UNIQUE (user_id, sku);

ALTER TABLE stock_transactions
  ADD CONSTRAINT stock_transactions_user_id_sheet_number_key 
  UNIQUE (user_id, sheet_number);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales_records ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can view own categories"
  ON categories FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own categories"
  ON categories FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view own products"
  ON products FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own products"
  ON products FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view own stock transactions"
  ON stock_transactions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own stock transactions"
  ON stock_transactions FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view own sales records"
  ON sales_records FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own sales records"
  ON sales_records FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

-- Create function and trigger in a separate DO block
DO $$
BEGIN
  CREATE OR REPLACE FUNCTION update_product_stock()
  RETURNS TRIGGER AS $func$
  BEGIN
    IF NEW.type = 'in' THEN
      UPDATE products
      SET current_stock = current_stock + NEW.quantity,
          updated_at = now()
      WHERE id = NEW.product_id;
    ELSE
      UPDATE products
      SET current_stock = current_stock - NEW.quantity,
          updated_at = now()
      WHERE id = NEW.product_id;
      
      INSERT INTO sales_records (
        user_id,
        product_id,
        quantity,
        unit_price,
        total_amount,
        transaction_date
      )
      SELECT
        NEW.user_id,
        NEW.product_id,
        NEW.quantity,
        p.unit_price,
        (NEW.quantity * p.unit_price),
        NEW.transaction_date
      FROM products p
      WHERE p.id = NEW.product_id;
    END IF;
    RETURN NEW;
  END;
  $func$ LANGUAGE plpgsql;

  DROP TRIGGER IF EXISTS update_product_stock_trigger ON stock_transactions;
  
  CREATE TRIGGER update_product_stock_trigger
  AFTER INSERT ON stock_transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_product_stock();
END $$;