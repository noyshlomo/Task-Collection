import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../../styles/Forms.css';

const OwnerRegister = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    password2: ''
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const { name, email, phone, password, password2 } = formData;

  const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async e => {
    e.preventDefault();
    if (password !== password2) {
      setError('Passwords do not match');
      return;
    }
    
    try {
      const newOwner = {
        name,
        email,
        phone,
        password
      };
      
      const res = await axios.post('http://localhost:5000/api/auth/owner/register', newOwner);

      localStorage.setItem('token', res.data.token);
      localStorage.setItem('userType', 'owner');

      navigate('/owner/dashboard');
    } catch (err) {
      setError(err.response.data.msg || 'An error occurred');
    }
  };

  return (
    <div className="form-container">
      <h1>Grocery Owner Registration</h1>
      {error && <div className="alert alert-danger">{error}</div>}
      <form onSubmit={onSubmit}>
        <div className="form-group">
          <label>Full Name</label>
          <input
            type="text"
            name="name"
            value={name}
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

export default OwnerRegister;