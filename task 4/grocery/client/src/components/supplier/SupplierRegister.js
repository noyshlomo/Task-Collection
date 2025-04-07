import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../../styles/Forms.css';

const SupplierRegister = () => {
  const [formData, setFormData] = useState({
    companyName: '',
    representativeName: '',
    email: '',
    phone: '',
    password: '',
    password2: '',
    products: [{ name: '', minQuantity: '', pricePerUnit: '' }]
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const { companyName, representativeName, email, phone, password, password2, products } = formData;

  const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async e => {
    e.preventDefault();
    if (password !== password2) {
      setError('Passwords do not match');
      return;
    }
    
    try {
      const newSupplier = {
        companyName,
        representativeName,
        email,
        phone,
        password,
        products: products.map(product => ({
            name: product.name,
            minQuantity: Number(product.minQuantity),
            pricePerUnit: Number(product.pricePerUnit)
          }))
          
      };
      
      const res = await axios.post('http://localhost:5000/api/auth/supplier/register', newSupplier);

      localStorage.setItem('token', res.data.token);
      localStorage.setItem('userType', 'supplier');

      navigate('/supplier/dashboard');
    } catch (err) {
      setError(err.response?.data?.msg || 'An error occurred');
    }
  };
  const handleProductChange = (index, field, value) => {
    const updatedProducts = [...formData.products];
    updatedProducts[index][field] = value;
    setFormData({ ...formData, products: updatedProducts });
  };
  
  const addProduct = () => {
    setFormData({
      ...formData,
      products: [...formData.products, { name: '', minQuantity: '', pricePerUnit: '' }]
    });
  };
  
  const removeProduct = (index) => {
    const updatedProducts = [...formData.products];
    updatedProducts.splice(index, 1);
    setFormData({ ...formData, products: updatedProducts });
  };
  
  return (
    <div className="form-container">
      <h1>Supplier Registration</h1>
      {error && <div className="alert alert-danger">{error}</div>}
      <form onSubmit={onSubmit}>
        <div className="form-group">
          <label>Company Name</label>
          <input
            type="text"
            name="companyName"
            value={companyName}
            onChange={onChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Representative Name</label>
          <input
            type="text"
            name="representativeName"
            value={representativeName}
            onChange={onChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Email Address</label>
          <input
            type="email"
            name="email"
            value={email}
            onChange={onChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Phone Number</label>
          <input
            type="text"
            name="phone"
            value={phone}
            onChange={onChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Products</label>
{formData.products.map((product, index) => (
  <div key={index} className="form-group product-group">
    <input
      type="text"
      placeholder="Product name"
      value={product.name}
      onChange={e => handleProductChange(index, 'name', e.target.value)}
      required
    />
    <input
      type="number"
      placeholder="Minimum quantity"
      value={product.minQuantity}
      onChange={e => handleProductChange(index, 'minQuantity', e.target.value)}
      required
    />
    <input
      type="number"
      placeholder="Price per unit"
      value={product.pricePerUnit}
      onChange={e => handleProductChange(index, 'pricePerUnit', e.target.value)}
      required
    />
    <button type="button" onClick={() => removeProduct(index)}>Remove</button>
  </div>
))}
<button type="button" onClick={addProduct}>Add Another Product</button>
        </div>
        <div className="form-group">
          <label>Password</label>
          <input
            type="password"
            name="password"
            value={password}
            onChange={onChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Confirm Password</label>
          <input
            type="password"
            name="password2"
            value={password2}
            onChange={onChange}
            required
          />
        </div>
        <button type="submit" className="btn btn-primary">Register</button>
      </form>
      <div className="form-bottom-text">
            <p>
              Already have an account? <Link to="/owner/login">Login</Link>
            </p>
            <p>
              <Link to="/">Back to Home</Link>
            </p>
            </div>
    </div>
  );
};

export default SupplierRegister;