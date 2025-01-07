import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Session } from "@supabase/supabase-js";
import { supabase } from "./integrations/supabase/client";
import Auth from "./pages/Auth";
import Index from "./pages/Index";
import ProductPage from "./pages/ProductPage";
import MyItems from "./pages/MyItems";
import CreateListing from "./pages/CreateListing";
import "./App.css";

function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Router>
      <Routes>
        <Route
          path="/auth"
          element={session ? <Navigate to="/" /> : <Auth />}
        />
        <Route
          path="/"
          element={session ? <Index /> : <Navigate to="/auth" />}
        />
        <Route
          path="/product/:id"
          element={session ? <ProductPage /> : <Navigate to="/auth" />}
        />
        <Route
          path="/my-items"
          element={session ? <MyItems /> : <Navigate to="/auth" />}
        />
        <Route
          path="/create-listing"
          element={session ? <CreateListing /> : <Navigate to="/auth" />}
        />
      </Routes>
    </Router>
  );
}

export default App;