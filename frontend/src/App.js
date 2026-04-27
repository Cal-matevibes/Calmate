import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home.js';
import About from './pages/About.js';
import Contact from './pages/Contact.js';
import Catalogs from './pages/Catalog-page.js';
import Tienda from './components/catalog/Tienda.js';
import Cuidados from './pages/Cuidados.js';
import Login from './pages/Login.js';
import Profile from './pages/Profile.js';
import ItemDetail from './pages/ItemDetail.js';
import Stock from './pages/Stock.js';
import Pedidos from './pages/Pedidos.js';
import MisPedidos from './pages/MisPedidos.js';
import Details from './pages/Details.js';
import Ventas from './pages/Ventas.js';
import Cart from './pages/Cart.js';
import CrearItem from './pages/CrearItem.js';
import OfferManagementPage from './pages/OfferManagementPage.js';
import CuidadosAdmin from './pages/CuidadosAdmin.js';
import Colaboradores from './pages/Colaboradores.js';
import PaymentSuccess from './pages/PaymentSuccess.js';
import PaymentFailure from './pages/PaymentFailure.js';
import PaymentPending from './pages/PaymentPending.js';
import ResetPassword from './pages/ResetPassword.js';import LoadingTest from './pages/LoadingTest';import { CarritoProvider, useCarrito } from './context/CarritoContext.js';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/shared/ProtectedRoute';
import catalogos from './data/tiendas.json';

// Componente wrapper para manejar la integración entre Auth y Carrito
const AppWithProviders = () => {
  const { sincronizarCarrito } = useCarrito();

  const handleAddItem = (newItem, catalogoId) => {
    // Lógica para agregar un nuevo item al catálogo correspondiente
    console.log('Agregando item:', newItem, 'al catálogo:', catalogoId);
  };

  const handleUpdateItem = (itemId, updatedItem, catalogoId) => {
    // Lógica para actualizar un item existente en el catálogo correspondiente
    console.log('Actualizando item:', itemId, 'con datos:', updatedItem, 'en catálogo:', catalogoId);
  };

  const handleDeleteItem = (itemId, catalogoId) => {
    // Lógica para eliminar un item del catálogo correspondiente
    console.log('Eliminando item:', itemId, 'del catálogo:', catalogoId);
  };

  return (
    <AuthProvider onAuthSuccess={sincronizarCarrito}>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/all-catalog" element={<Catalogs />} />
          <Route path="/catalog" element={<Catalogs />} />
          <Route path="/shop" element={<Tienda />} />
          <Route path="/catalog/:catalogoId" element={<Catalogs />} />
          <Route path="/catalogo/:catalogoId" element={<Catalogs />} />
          <Route path="/item/:id" element={<ItemDetail catalogos={catalogos} />} />
          <Route path="/item/:catalogoId/:itemId" element={<ItemDetail />} />
          <Route path="/mate-care" element={<Cuidados />} />
          <Route path="/care" element={<Cuidados />} />
          <Route path="/login" element={<Login />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/test" element={<LoadingTest />} />
          
          {/* Rutas de resultado de pago */}
          <Route path="/pago/exito" element={<PaymentSuccess />} />
          <Route path="/pago/error" element={<PaymentFailure />} />
          <Route path="/pago/pendiente" element={<PaymentPending />} />
          
          {/* Rutas de MercadoPago (en inglés) */}
          <Route path="/payment/success" element={<PaymentSuccess />} />
          <Route path="/payment/failure" element={<PaymentFailure />} />
          <Route path="/payment/pending" element={<PaymentPending />} />
          
          {/* Carrito - accesible para todos */}
          <Route path="/cart" element={<Cart />} />
          
          {/* Rutas que requieren autenticación */}
          <Route 
            path="/profile" 
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/mis-pedidos" 
            element={
              <ProtectedRoute>
                <MisPedidos />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/detalles/:type/:id" 
            element={
              <ProtectedRoute>
                <Details />
              </ProtectedRoute>
            } 
          />
          
          {/* Rutas que requieren ser administrador */}
          <Route 
            path="/stock" 
            element={
              <ProtectedRoute requireAdmin={true}>
                <Stock catalogos={catalogos} onAddItem={handleAddItem} onUpdateItem={handleUpdateItem} onDeleteItem={handleDeleteItem} />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/pedidos" 
            element={
              <ProtectedRoute requireAdmin={true}>
                <Pedidos />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/ventas" 
            element={
              <ProtectedRoute requireAdmin={true}>
                <Ventas />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/crear-item" 
            element={
              <ProtectedRoute requireAdmin={true}>
                <CrearItem onAddItem={handleAddItem} />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/create-item" 
            element={
              <ProtectedRoute requireAdmin={true}>
                <CrearItem onAddItem={handleAddItem} />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/manage-offers" 
            element={
              <ProtectedRoute requireAdmin={true}>
                <OfferManagementPage catalogos={catalogos} />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/cuidados-admin" 
            element={
              <ProtectedRoute requireAdmin={true}>
                <CuidadosAdmin />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/colaboradores" 
            element={
              <ProtectedRoute requireAdmin={true}>
                <Colaboradores />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

function App() {
  return (
    <CarritoProvider>
      <AppWithProviders />
    </CarritoProvider>
  );
}

export default App;