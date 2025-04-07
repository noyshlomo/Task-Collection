import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../../styles/Forms.css';

const SupplierLogin = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const { email, password } = formData;

  const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async e => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/api/auth/supplier/login', formData);

      localStorage.setItem('token', res.data.token);
      localStorage.setItem('userType', 'supplier');

      navigate('/supplier/dashboard');
    } catch (err) {
       setError(err.response.data.msg || 'An error occurred');

    }
  };

  return (
    <div className="form-container">
      <h1>Supplier Login</h1>
      {error && <div className="alert alert-danger">{error}</div>}
      <form onSubmit={onSubmit}>
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
          <label>Password</label>
          <input
            type="password"
            name="password"
            value={password}
            onChange={onChange}
            required
          />
        </div>
        <button type="submit" className="btn btn-primary">Login</button>
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

export default SupplierLogin;