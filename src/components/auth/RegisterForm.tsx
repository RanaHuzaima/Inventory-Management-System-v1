import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'react-hot-toast';
import { supabase } from '../../lib/supabase';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

const schema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  companyName: z.string().min(2, 'Company name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type RegisterFormData = z.infer<typeof schema>;

export function RegisterForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<RegisterFormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    try {
      setIsSubmitting(true);

      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
      });

      if (signUpError) throw signUpError;

      if (!authData.user) {
        throw new Error('Failed to create user account');
      }

      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: authData.user.id,
          full_name: data.fullName,
          company_name: data.companyName,
        });

      if (profileError) throw profileError;

      toast.success('Account created successfully');
    } catch (err) {
      console.error('Registration error:', err);
      toast.error(`${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-4">
        <Input
          label="Full Name"
          {...register('fullName')}
          error={errors.fullName?.message}
          disabled={isSubmitting}
          className="transition duration-200 ease-in-out focus:ring-2 focus:ring-blue-500"
        />
        <Input
          label="Company Name"
          {...register('companyName')}
          error={errors.companyName?.message}
          disabled={isSubmitting}
          className="transition duration-200 ease-in-out focus:ring-2 focus:ring-blue-500"
        />
        <Input
          label="Email"
          type="email"
          {...register('email')}
          error={errors.email?.message}
          disabled={isSubmitting}
          className="transition duration-200 ease-in-out focus:ring-2 focus:ring-blue-500"
        />
        <Input
          label="Password"
          type="password"
          {...register('password')}
          error={errors.password?.message}
          disabled={isSubmitting}
          className="transition duration-200 ease-in-out focus:ring-2 focus:ring-blue-500"
        />
      </div>
      
      {errors.fullName || errors.companyName || errors.email || errors.password ? (
        <p className="text-sm text-red-600 mt-2">Please fill out the required fields correctly.</p>
      ) : null}

      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full py-3 text-lg bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition duration-200 ease-in-out"
      >
        {isSubmitting ? 'Creating account...' : 'Create account'}
      </Button>
    </form>
  );
}