import { useState, useEffect } from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { toast } from 'react-hot-toast';
import { Search } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface Product {
  id: string;
  name: string;
  unit_price: number;
  current_stock: number;
  description: string;
}

export default function AddBillForm() {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<{ product: Product; quantity: number }[]>([]);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1); // To manage pagination
  const [loading, setLoading] = useState(false);
  const [addBillLoading, setAddBillLoading] = useState(false);
  const [discount, setDiscount] = useState(0);


  const itemsPerPage = 4; // Show 5 products per page

  // Fetch products from Supabase based on search query and pagination
  const fetchProducts = async (searchQuery: string, page: number) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*', { count: 'exact' }) // Get the count of products
        .ilike('name', `%${searchQuery}%`) // Filter by search query
        .range((page - 1) * itemsPerPage, page * itemsPerPage - 1); // Pagination range

      if (error) {
        throw error;
      }

      setProducts((prev) => (page === 1 ? data || [] : [...prev, ...(data || [])]));
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to load products.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts(searchQuery, page); // Fetch products when the component mounts or when searchQuery/page changes
  }, [searchQuery, page]);

  // Handle search input change
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setPage(1); // Reset to the first page when the search query changes
  };

  // Add product to selected products (increase quantity if product already exists)
  const addProduct = (product: Product, quantity: number) => {
    if (quantity > 0 && quantity <= product.current_stock) {
      setSelectedProducts((prev) => {
        const existingProduct = prev.find(item => item.product.id === product.id);
        if (existingProduct) {
          return prev.map(item =>
            item.product.id === product.id
              ? { ...item, quantity: item.quantity + quantity }
              : item
          );
        } else {
          return [...prev, { product, quantity }];
        }
      });
    } else {
      toast.error('Quantity exceeds available stock.');
    }
  };

  // Remove product from selected products
  const removeProduct = (productId: string) => {
    setSelectedProducts((prev) => prev.filter(item => item.product.id !== productId));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddBillLoading(true);

    if (!customerName || !customerPhone || !customerAddress || selectedProducts.length === 0) {
      toast.error('Please fill out all fields and select products.');
      return;
    }

    const user = (await supabase.auth.getUser()).data.user;

    if (!user) {
      toast.error('You must be logged in to perform this action');
      return;
    }

    try {
      // Calculate the total before discount and tax
      const subTotal = selectedProducts.reduce((acc, item) => acc + item.product.unit_price * item.quantity, 0);
      const total = subTotal;
      const finalTotal = total - discount; // Apply the discount to the total

      // Insert the bill into the 'bills' table, including the discount value
      const { data: bill, error: billError } = await supabase
        .from('bills')
        .insert([
          {
            customer_name: customerName,
            customer_phone: customerPhone,
            customer_address: customerAddress,
            sub_total: subTotal, // Store sub-total in the DB
            discount: discount, // Store discount in the DB
            total: finalTotal, // Store final total after discount in the DB
            user_id: user.id,
          },
        ])
        .select('*');

      if (billError) {
        throw billError;
      }

      if (!bill) {
        throw new Error('Failed to create bill.');
      }

      const billId = bill[0].id;

      // Insert selected products into the bill_items table
      const billItems = selectedProducts.map(item => ({
        bill_id: billId,
        product_id: item.product.id,
        quantity: item.quantity,
        total_price: item.product.unit_price * item.quantity,
        user_id: user.id,
      }));

      const { error: billItemsError } = await supabase.from('bill_items').insert(billItems);

      if (billItemsError) {
        throw billItemsError;
      }

      toast.success('Bill created successfully.');
      setCustomerName('');
      setCustomerPhone('');
      setCustomerAddress('');
      setSelectedProducts([]);
      setDiscount(0); // Reset discount after submission
    } catch (error) {
      console.error('Error creating bill:', error);
      toast.error('Failed to create bill.');
    } finally {
      setAddBillLoading(false);
    }
  };

  // Calculate Sub-total, Tax, Total, and apply Discount
  const calculateSummary = () => {
    const subTotal = selectedProducts.reduce((acc, item) => acc + item.product.unit_price * item.quantity, 0);
    const total = subTotal;
    const finalTotal = total - discount; // Apply discount to the total

    return { subTotal, total, finalTotal };
  };

  const { subTotal, finalTotal } = calculateSummary();

  return (
    <div className="space-y-6 p-8">
      <h2 className="text-2xl font-semibold">Add New Bill</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Customer Details */}
        <Input
          label="Customer Name"
          value={customerName}
          onChange={(e) => setCustomerName(e.target.value)}
          required
        />
        <Input
          label="Customer Phone"
          type="tel"
          value={customerPhone}
          onChange={(e) => setCustomerPhone(e.target.value)}
          required
        />
        <Input
          label="Customer Address"
          value={customerAddress}
          onChange={(e) => setCustomerAddress(e.target.value)}
          required
        />

        {/* Discount Input */}
        <Input
          label="Discount"
          type="number"
          value={discount}
          onChange={(e) => setDiscount(Number(e.target.value))}
          placeholder="Enter discount amount"
          min="0"
        />

        {/* Product Search */}
        <div className="mt-4 relative">
          <label className="block text-sm font-medium text-gray-700">Search Products</label>
          <div className="flex items-center border border-gray-300 rounded-md p-2 mt-2">
            <Search className="text-gray-400 mr-2" />
            <Input
              placeholder="Search for a product..."
              value={searchQuery}
              onChange={handleSearch}
              className="w-full"
            />
          </div>
        </div>

        {/* Product Grid */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {loading ? (
            <div>Loading...</div>
          ) : (
            products.map((product) => (
              <div
                key={product.id}
                className="flex flex-col items-center border border-gray-300 p-4 rounded-md hover:shadow-lg transition-all"
              >
                <img src={'https://via.placeholder.com/150'} alt={product.name} className="h-32 w-32 object-cover mb-4" />
                <h3 className="font-semibold text-lg">{product.name}</h3>
                <p className="text-gray-500 mt-1">{product.description}</p>
                <p className="text-gray-800 mt-2">Rs. {product.unit_price}</p>
                <p className="text-sm text-gray-500 mt-1">Stock: {product.current_stock}</p>
                <Button
                  type="button"
                  className="mt-4 w-full bg-blue-500 hover:bg-blue-600 text-white"
                  onClick={() => addProduct(product, 1)}  // Always add 1 quantity for simplicity
                >
                  Add to Bill
                </Button>
              </div>
            ))
          )}
        </div>

        {/* Selected Products */}
        <div className="mt-6">
          <h3 className="text-lg font-semibold">Selected Products</h3>
          <ul className="space-y-2 mt-2">
            {selectedProducts.map((item) => (
              <li key={item.product.id} className="flex justify-between items-center p-2 border-b">
                <span>{item.product.name}</span>
                <span>{item.quantity} x Rs. {item.product.unit_price}</span>
                <Button
                  type="button"
                  onClick={() => removeProduct(item.product.id)}
                  className="text-red-500 hover:text-red-600"
                >
                  Remove
                </Button>
              </li>
            ))}
          </ul>
        </div>

        {/* Summary Section */}
        {selectedProducts.length > 0 && (
          <div className="mt-6 p-4 border-t">
            <h3 className="text-lg font-semibold">Bill Summary</h3>
            <div className="flex justify-between mt-2">
              <span>Sub-total:</span>
              <span>Rs. {subTotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between mt-2">
              <span>Discount:</span>
              <span>- Rs. {discount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between mt-2 font-semibold">
              <span>Total:</span>
              <span>Rs. {finalTotal.toFixed(2)}</span>
            </div>
          </div>
        )}

        <Button disabled={addBillLoading} type="submit" className="w-full bg-green-500 hover:bg-green-600 mt-4">
          {addBillLoading ? 'Creating Bill...' : 'Create Bill'}
        </Button>
      </form>
    </div>
  );
}