import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import CartDrawer from './components/CartDrawer';
import { ProtectedRoute, AdminRoute } from './components/ProtectedRoute';
import Home from './pages/Home';
import Shop from './pages/Shop';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Orders from './pages/Orders';
import Login from './pages/Login';
import Register from './pages/Register';
import Admin from './pages/Admin';
import Wishlist from './pages/Wishlist';

const NoNavLayout = ({ children }) => children;

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: { fontFamily: 'DM Sans, sans-serif', fontSize: '13px', borderRadius: 0 }
            }}
          />
          <Routes>
            {/* Checkout has its own minimal header */}
            <Route path="/checkout" element={
              <ProtectedRoute>
                <Checkout/>
              </ProtectedRoute>
            }/>

            {/* All other pages use main layout */}
            <Route path="*" element={
              <>
                <Navbar/>
                <CartDrawer/>
                <main className="min-h-screen">
                  <Routes>
                    <Route path="/"           element={<Home/>}/>
                    <Route path="/shop"        element={<Shop/>}/>
                    <Route path="/product/:id" element={<ProductDetail/>}/>
                    <Route path="/cart"        element={<Cart/>}/>
                    <Route path="/wishlist"    element={<Wishlist/>}/>
                    <Route path="/login"       element={<Login/>}/>
                    <Route path="/register"    element={<Register/>}/>
                    <Route path="/orders"      element={<ProtectedRoute><Orders/></ProtectedRoute>}/>
                    <Route path="/admin"       element={<AdminRoute><Admin/></AdminRoute>}/>
                  </Routes>
                </main>
                <Footer/>
              </>
            }/>
          </Routes>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}