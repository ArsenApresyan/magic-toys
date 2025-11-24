import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import HomePage from './pages/Home';
import LoginPage from './pages/Auth/Login';
import CallbackPage from './pages/Auth/Callback';
import AdminDashboard from './pages/Admin/Dashboard';
import Header from './components/layout/header';
import AdminRoute from './components/common/AdminRoute';
import ProductList from './pages/Admin/Products/ProductList';
import ProductCreate from './pages/Admin/Products/ProductCreate';
import ProductDetail from './pages/Admin/Products/ProductDetail';

function App() {
  return (
    <AuthProvider>
      <Router>  
        <div className="min-h-screen bg-gray-50">
          <Header />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/auth/callback" element={<CallbackPage />} />
            <Route 
              path="/admin" 
              element={
                <AdminRoute>
                  <AdminDashboard />
                </AdminRoute>
              } 
            />
            <Route 
              path="/admin/products" 
              element={
                <AdminRoute>
                  <ProductList />
                </AdminRoute>
              } 
            />
            <Route 
              path="/admin/products/create" 
              element={
                <AdminRoute>
                  <ProductCreate />
                </AdminRoute>
              } 
            />
            <Route 
              path="/admin/products/:id" 
              element={
                <AdminRoute>
                  <ProductDetail />
                </AdminRoute>
              } 
            />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  )
}

export default App;
