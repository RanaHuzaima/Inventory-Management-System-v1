import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { supabase } from '../../lib/supabase';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import type { Product } from '../../types/database';

const schema = z.object({
  product_id: z.string().min(1, 'Product is required'),
  sheet_number: z.string().min(1, 'Sheet number is required'),
  quantity: z.number().min(1, 'Quantity must be greater than 0'),
  type: z.enum(['in', 'out']),
  notes: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

interface StockFormProps {
  open: boolean;
  products: Product[];
  onClose: () => void;
  onSuccess: () => void;
}

export function StockForm({ open, products, onClose, onSuccess }: StockFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register, handleSubmit, formState: { errors }, reset } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      product_id: '',
      sheet_number: '',
      quantity: 1,
      type: 'in',
      notes: '',
    },
  });

  const onSubmit = async (data: FormData) => {
    try {
      setIsSubmitting(true);
      const user = (await supabase.auth.getUser()).data.user;

      if (!user) {
        toast.error('You must be logged in to perform this action');
        return;
      }

      const { error } = await supabase
        .from('stock_transactions')
        .insert([{
          ...data,
          user_id: user.id,
          transaction_date: new Date().toISOString(),
        }]);

      if (error) {
        toast.error(error.message);
        return;
      }

      toast.success('Stock transaction created successfully');
      reset();
      onSuccess();
      onClose();
    } catch (error) {
      console.error(error);
      toast.error('An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-md rounded-lg bg-white p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold">Add Stock Transaction</h2>
          <Button variant="ghost" size="sm" onClick={onClose} disabled={isSubmitting}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              Product
            </label>
            <select
              {...register('product_id')}
              className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm"
            >
              <option value="">Select a product</option>
              {products.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name} ({product.sku})
                </option>
              ))}
            </select>
            {errors.product_id && (
              <p className="text-sm text-red-600">{errors.product_id.message}</p>
            )}
          </div>

          <Input
            label="Sheet Number"
            {...register('sheet_number')}
            error={errors.sheet_number?.message}
          />

          <Input
            label="Quantity"
            type="number"
            min="1"
            {...register('quantity', { valueAsNumber: true })}
            error={errors.quantity?.message}
          />

          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              Type
            </label>
            <select
              {...register('type')}
              className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm"
            >
              <option value="in">Stock In</option>
              <option value="out">Stock Out</option>
            </select>
            {errors.type && (
              <p className="text-sm text-red-600">{errors.type.message}</p>
            )}
          </div>

          <Input
            label="Notes"
            {...register('notes')}
            error={errors.notes?.message}
          />
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create Transaction'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}