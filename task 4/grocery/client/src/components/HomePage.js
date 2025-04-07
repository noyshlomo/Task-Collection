import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/HomePage.css';

const HomePage = () => {
  return (
    <div className="home-container">
      <div className="home-header">
        <h1>Grocery Connect</h1>
        <p>Connecting Grocery Store Owners with Suppliers</p>
      </div>
      
      <div className="user-options">
        <div className="user-card">
          <h2>I am a Grocery Store Owner</h2>
          <p>Manage your store, find suppliers, and order products</p>
          <div className="button-group">
            <Link to="/owner/login" className="btn btn-primary">Login</Link>
            <Link to="/owner/register" className="btn btn-outline-primary">Sign Up</Link>
          </div>
        </div>
        
        <div className="user-card">
          <h2>I am a Supplier</h2>
          <p>Connect with store owners and offer your products</p>
          <div className="button-group">
            <Link to="/supplier/login" className="btn btn-primary">Login</Link>
            <Link to="/supplier/register" className="btn btn-outline-primary">Sign Up</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;