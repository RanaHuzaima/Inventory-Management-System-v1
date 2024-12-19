import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuth } from './lib/hooks/useAuth';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Dashboard from './pages/Dashboard';
import Categories from './pages/Categories';
import Products from './pages/Products';
import Stock from './pages/Stock';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import BillPage from './pages/Bill';
import { LoadingSpinner } from './components/ui/LoadingSpinner';
import AddBillForm from './components/bill/AddBillForm';

function App() {
  const { session, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <>
      <Toaster position="top-right" />
      <Router>
        <Routes>
          <Route path="/login" element={!session ? <Login /> : <Navigate to="/dashboard" />} />
          <Route path="/register" element={!session ? <Register /> : <Navigate to="/dashboard" />} />
          <Route element={<ProtectedRoute session={session} />}>
            <Route element={<Layout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/categories" element={<Categories />} />
              <Route path="/products" element={<Products />} />
              <Route path="/stock" element={<Stock />} />
              <Route path="/bills" element={<BillPage />} />
              <Route path="/add-bill" element={<AddBillForm />} />
            </Route>
          </Route>
          <Route path="*" element={<Navigate to={session ? '/dashboard' : '/login'} />} />
        </Routes>
      </Router>
    </>
  );
}

export default App;