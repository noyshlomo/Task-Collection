import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../../styles/Forms.css';

const CreateOrderForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    products: [{ name: '', quantity: '' }],
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const token = localStorage.getItem('token');

  const handleProductChange = (index, e) => {
    const { name, value } = e.target;
    const updatedProducts = [...formData.products];
    updatedProducts[index] = { ...updatedProducts[index], [name]: value };
    setFormData({ ...formData, products: updatedProducts });
  };

  const addProductField = () => {
    setFormData({
      ...formData,
      products: [...formData.products, { name: '', quantity: '' }]
    });
  };

  const removeProductField = (index) => {
    const updatedProducts = [...formData.products];
    updatedProducts.splice(index, 1);
    setFormData({ ...formData, products: updatedProducts });
  };

  const handleNotesChange = (e) => {
    setFormData({ ...formData, notes: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const invalidProducts = formData.products.filter(
      p => !p.name || !p.quantity || isNaN(p.quantity) || p.quantity <= 0
    );

    if (invalidProducts.length > 0) {
      setError('Please fill all product fields with valid information');
      setLoading(false);
      return;
    }

    try {
      const config = {
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token
        }
      };

      const productsToSubmit = formData.products.map(p => ({
        name: p.name,
        quantity: Number(p.quantity)
      }));

      const orderData = {
        products: productsToSubmit,
        notes: formData.notes
      };

      await axios.post('http://localhost:5000/api/owner/orders', orderData, config);
      
      setLoading(false);
      navigate('/owner/dashboard');
    } catch (err) {
      setError(err.response?.data?.msg || 'Error creating order');
      setLoading(false);
    }
  };

  return (
    <div className="form-container">
      <h1>Create New Order</h1>
      
      {error && <div className="alert alert-danger">{error}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="product-name">Products</label>
          {formData.products.map((product, index) => (
            <div key={index} className="product-row">
              <div className="form-group">
                <label htmlFor={`product-name-${index}`}>Product Name</label>
                <input
                  type="text"
                  id={`product-name-${index}`}
                  name="name"
                  value={product.name}
                  onChange={(e) => handleProductChange(index, e)}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor={`product-quantity-${index}`}>Quantity</label>
                <input
                  type="number"
                  id={`product-quantity-${index}`}
                  name="quantity"
                  value={product.quantity}
                  onChange={(e) => handleProductChange(index, e)}
                  min="1"
                  required
                />
              </div>
              
              {formData.products.length > 1 && (
                <button 
                  type="button" 
                  className="remove-product-btn"
                  onClick={() => removeProductField(index)}
                >
                  Remove
                </button>
              )}
            </div>
          ))}
          
          <button 
            type="button" 
            className="btn btn-primary"
            onClick={addProductField}
          >
            Add Another Product
          </button>
        </div>
        
        <div className="form-group">
          <label htmlFor="notes">Notes (Optional)</label>
          <textarea
            id="notes"
            name="notes"
            value={formData.notes}
            onChange={handleNotesChange}
            rows="4"
          />
        </div>
        
        <div className="form-actions">
          <button 
            type="button" 
            className="btn btn-secondary"
            onClick={() => navigate('/owner/dashboard')}
          >
            Cancel
          </button>
          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? 'Creating...' : 'Create Order'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateOrderForm;