/*
  # Fix RLS policies and add insert policy for profiles

  1. Changes
    - Add insert policy for profiles table
    - Fix products low stock query
  
  2. Security
    - Allow authenticated users to insert their own profile
*/

-- Add insert policy for profiles
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Add index for stock monitoring
CREATE INDEX IF NOT EXISTS idx_products_stock 
ON products (current_stock, minimum_stock);