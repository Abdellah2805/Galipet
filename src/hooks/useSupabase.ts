import useSWR from 'swr';
import { getSupabase } from '../lib/supabase';

// Fetcher générique pour Supabase
const supabaseFetcher = async (queryFn: (supabase: any) => Promise<any>) => {
  const supabase = getSupabase();
  const result = await queryFn(supabase);
  if (result.error) {
    throw result.error;
  }
  return result.data;
};

// Hook pour charger les bookings du calendrier professionnel
export function useBookings(companyId: string | null, currentDate: Date, viewMode: 'Jour' | 'Semaine' | 'Mois') {
  const { start, end } = getDateRange(currentDate, viewMode);

  const { data, error, mutate, isLoading } = useSWR(
    companyId ? ['bookings', companyId, start.toISOString(), end.toISOString()] : null,
    () => supabaseFetcher((supabase) =>
      supabase
        .from('bookings')
        .select('*')
        .eq('company_profile_id', companyId)
        .gte('starts_at', start.toISOString())
        .lte('starts_at', end.toISOString())
        .order('starts_at', { ascending: true })
    ),
    {
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      dedupingInterval: 5000,
      refreshWhenHidden: false,
    }
  );

  return { data, error, mutate, isLoading };
}

// Hook pour charger le profil utilisateur
export function useProfile(userId: string | undefined) {
  const { data, error, mutate, isLoading } = useSWR(
    userId ? ['profile', userId] : null,
    () => supabaseFetcher((supabase) =>
      supabase
        .from('profiles')
        .select('*, customer_profiles(*), company_profiles(*)')
        .eq('id', userId)
        .maybeSingle()
    ),
    {
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      dedupingInterval: 5000,
    }
  );

  return { data, error, mutate, isLoading };
}

// Hook pour charger les animaux de l'utilisateur
export function useUserPets(userId: string | undefined) {
  const { data, error, mutate, isLoading } = useSWR(
    userId ? ['pets', userId] : null,
    () => supabaseFetcher((supabase) =>
      supabase
        .from('pets')
        .select('*')
        .eq('owner_id', userId)
        .order('created_at', { ascending: false })
    ),
    {
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      dedupingInterval: 5000,
    }
  );

  return { data, error, mutate, isLoading };
}

// Hook pour les photos d'un animal
export function usePetPhotos(petId: string | undefined) {
  const { data, error, mutate, isLoading } = useSWR(
    petId ? ['pet_photos', petId] : null,
    () => supabaseFetcher((supabase) =>
      supabase
        .from('pet_photos')
        .select('*')
        .eq('pet_id', petId)
        .order('created_at', { ascending: false })
    ),
    {
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      dedupingInterval: 5000,
    }
  );

  return { data, error, mutate, isLoading };
}

// Hook pour charger les bookings du dashboard (avec période)
export function useDashboardBookings(companyId: string | null, period: string) {
  const now = new Date();
  let startDate: Date;
  switch (period) {
    case 'Jour':
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      break;
    case 'Mois':
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      break;
    default:
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6);
  }

  const { data, error, mutate, isLoading } = useSWR(
    companyId ? ['dashboard_bookings', companyId, period, startDate.toISOString()] : null,
    () => supabaseFetcher((supabase) =>
      supabase
        .from('bookings')
        .select('*')
        .eq('company_profile_id', companyId)
        .gte('starts_at', startDate.toISOString())
        .order('starts_at', { ascending: false })
    ),
    {
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      dedupingInterval: 5000,
    }
  );

  return { data, error, mutate, isLoading };
}

function getDateRange(currentDate: Date, viewMode: 'Jour' | 'Semaine' | 'Mois') {
  const start = new Date(currentDate);
  const end = new Date(currentDate);
  if (viewMode === 'Jour') {
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);
  } else if (viewMode === 'Semaine') {
    const day = start.getDay();
    const diff = start.getDate() - day + (day === 0 ? -6 : 1);
    start.setDate(diff);
    start.setHours(0, 0, 0, 0);
    end.setDate(start.getDate() + 6);
    end.setHours(23, 59, 59, 999);
  } else {
    start.setDate(1);
    start.setHours(0, 0, 0, 0);
    end.setMonth(start.getMonth() + 1);
    end.setDate(0);
    end.setHours(23, 59, 59, 999);
  }
  return { start, end };
}
