import { useState, useEffect } from 'react';
import { MetricWithTrend } from '../components/dashboard/stats-component.tsx';
import { useSessionContext } from '@supabase/auth-helpers-react';
import supabase from '../../utils/supabase.tsx';

const UserStatsPage = () => {
  const { session } = useSessionContext();
  const [totalSpots, setTotalSpots] = useState(0);
  const [totalModels, setTotalModels] = useState(0);
  const [totalUsers, setTotalUsers] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Récupérer les informations utilisateur
    if (session?.user) {
      setUser(session.user);
    }
    
    const fetchTotalSpots = async () => {
      try {
        const { count: spotsCount, error: spotsError } = await supabase
          .from('user_collections')
          .select('*', { count: 'exact', head: true })
          .eq('spotted', true);

        if (spotsError) throw spotsError;

        setTotalSpots(spotsCount ?? 0);
      } catch (error) {
        console.error('Error fetching total spots:', error);
        setTotalSpots(0);
      } finally {
        setIsLoading(false);
      }
    };

    const fetchTotalModels = async () => {
      try {
        const { count: modelsCount, error: modelsError } = await supabase
          .from('models')
          .select('*', { count: 'exact', head: true })

        if (modelsError) throw modelsError;

        setTotalModels(modelsCount ?? 0);
      } catch (error) {
        console.error('Error fetching total spots:', error);
        setTotalModels(0);
      } finally {
        setIsLoading(false);
      }
    };

    const fetchTotalUsers = async () => {
        try {
          const { count: usersCount, error: usersError } = await supabase
            .from('profiles')
            .select('*', { count: 'exact', head: true })

          if (usersError) throw usersError;

          setTotalUsers(usersCount ?? 0);
        } catch (error) {
          console.error('Error fetching total spots:', error);
          setTotalUsers(0);
        } finally {
          setIsLoading(false);
        }
      };

    fetchTotalSpots();
    fetchTotalUsers();
    fetchTotalModels();
  }, [session]);

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-40">Chargement...</div>;
  }

  return (
    <div className="p-3 sm:p-6 space-y-4 sm:space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl sm:text-3xl font-bold">Statistiques Globales</h1>
        {user && (
          <div className="flex items-center gap-4">
            <div>
              <p className="text-sm font-medium">Connecté en tant que</p>
              <p className="text-xs">{user.email}</p>
            </div>
            <button 
              onClick={handleSignOut}
              className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm"
            >
              Déconnexion
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <MetricWithTrend
          title="Total Spots"
          value={totalSpots}
          trend={5.2}
        />
        <MetricWithTrend
          title="Nombre Model"
          value={totalModels}
          trend={0}
        />
        <MetricWithTrend
          title="Nombre Users"
          value={totalUsers}
          trend={0}
        />
      </div>
    </div>
  );
};

export default UserStatsPage;