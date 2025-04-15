import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { createClient } from "@supabase/supabase-js";
import { SessionContextProvider, useSessionContext } from "@supabase/auth-helpers-react";
import { useState, useEffect } from "react";

import Layout from "./components/layout";
import Home from "./home/home";
import Dashboard from "./dashboard/dashboard";
import Analytics from "./analytics/analytics";
import Journeaux from "./journeaux/journeaux";
import Tables from './tables/tables';
import Auth from './components/auth/Auth';

// Créer le client Supabase
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL as string,
  import.meta.env.VITE_SUPABASE_ANON_KEY as string
);

// Composant pour protéger les routes
const ProtectedRoute = ({ children }) => {
  const { session, isLoading } = useSessionContext();
  
  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Chargement...</div>;
  }
  
  if (!session) {
    return <Navigate to="/login" />;
  }
  
  return children;
};

function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Vérifier si l'utilisateur est connecté au chargement
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      setIsLoading(false);
    };
    
    checkSession();
  }, []);

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Chargement...</div>;
  }

  return (
    <SessionContextProvider supabaseClient={supabase}>
      <Router>
        <Routes>
          <Route path="/login" element={
            <Auth />
          } />
          
          <Route path="/" element={
            <Layout>
              <Home />
            </Layout>
          } />
          
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/analytics" element={
            <ProtectedRoute>
              <Layout>
                <Analytics />
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/journeaux" element={
            <ProtectedRoute>
              <Layout>
                <Journeaux />
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/tables" element={
            <ProtectedRoute>
              <Layout>
                <Tables />
              </Layout>
            </ProtectedRoute>
          } />
        </Routes>
      </Router>
    </SessionContextProvider>
  );
}

export default App;