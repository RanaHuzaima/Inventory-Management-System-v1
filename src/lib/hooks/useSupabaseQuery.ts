import { useEffect, useState } from 'react';
import { supabase } from '../supabase';
import type { PostgrestError } from '@supabase/supabase-js';

export function useSupabaseQuery<T>(
  query: () => Promise<{ data: T | null; error: PostgrestError | null }>,
  deps: any[] = []
) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<PostgrestError | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const { data, error } = await query();
        if (error) throw error;
        setData(data);
      } catch (err) {
        setError(err as PostgrestError);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, deps);

  return { data, error, loading };
}