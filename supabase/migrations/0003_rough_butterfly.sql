/*
  # Fix RLS policies for products and stock transactions

  1. Changes
    - Add missing RLS policies for products and stock transactions
    - Ensure user_id is properly handled in all operations
  
  2. Security
    - Allow authenticated users to manage their own products and transactions
*/

-- Fix products policies
DROP POLICY IF EXISTS "Users can manage own products" ON products;
CREATE POLICY "Users can insert own products"
  ON products FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own products"
  ON products FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own products"
  ON products FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view own products"
  ON products FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Fix stock transactions policies
DROP POLICY IF EXISTS "Users can manage own stock transactions" ON stock_transactions;
CREATE POLICY "Users can insert own transactions"
  ON stock_transactions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own transactions"
  ON stock_transactions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);