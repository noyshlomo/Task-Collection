import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './components/HomePage';
import OwnerLogin from './components/owner/OwnerLogin';
import OwnerRegister from './components/owner/OwnerRegister';
import SupplierLogin from './components/supplier/SupplierLogin';
import SupplierRegister from './components/supplier/SupplierRegister';
import SupplierDashboard from './components/supplier/SupplierDashboard';
import GroceryOwnerDashboard from './components/owner/GroceryOwnerDashboard';
import CreateOrderForm from './components/owner/CreateOrderForm';
import './App.css';

function App() {
  return (
    <Router>
      <div className="app">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/owner/login" element={<OwnerLogin />} />
          <Route path="/owner/register" element={<OwnerRegister />} />
          <Route path="/supplier/login" element={<SupplierLogin />} />
          <Route path="/supplier/register" element={<SupplierRegister />} />
          <Route path="/supplier/dashboard" element={<SupplierDashboard />} />
          <Route path="/owner/dashboard" element={<GroceryOwnerDashboard />} />
          <Route path="/owner/create-order" element={<CreateOrderForm />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;