import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../../styles/Dashboard.css';

const SupplierDashboard = () => {
  const [pendingOrders, setPendingOrders] = useState([]);
  const [approvedOrders, setApprovedOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [supplierProducts, setSupplierProducts] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is authenticated as supplier
    const token = localStorage.getItem('token');
    const userType = localStorage.getItem('userType');
    
    if (!token || userType !== 'supplier') {
      navigate('/supplier/login');
      return;
    }
    
    // Fetch orders and supplier profile
    const fetchData = async () => {
      try {
        const config = {
          headers: {
            'x-auth-token': token
          }
        };
        
        // Get supplier profile with products
        const profileRes = await axios.get('http://localhost:5000/api/supplier/profile', config);
        
        setSupplierProducts(profileRes.data.products || []);
        
        // Get all relevant orders
        const ordersRes = await axios.get('http://localhost:5000/api/supplier/orders', config);
        
        // Separate pending and approved orders
        const pending = ordersRes.data.filter(order => order.status === 'pending');
        const approved = ordersRes.data.filter(order => 
          ['approved', 'delivered', 'received', 'completed'].includes(order.status)
        );
        
        setPendingOrders(pending);
        setApprovedOrders(approved);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch data');
        setLoading(false);
      }
    };
    
    fetchData();
  }, [navigate]);

  const canFulfillOrder = (order) => {
    // Check if supplier offers all products in the order
    const requestedProducts = order.products.map(item => 
        item && item.name ? item.name.toLowerCase() : '');
    const supplierProductNames = supplierProducts.map(product => 
        product && product.name ? product.name.toLowerCase() : '');
    
    return requestedProducts.every(product => supplierProductNames.includes(product));
};

const calculateOrderTotal = (order) => {
    let total = 0;
    
    order.products.forEach(orderProduct => {
        if (!orderProduct || !orderProduct.name) return;
        
        // find matching supplier product
        const supplierProduct = supplierProducts.find(
            product => product && product.name && 
            product.name.toLowerCase() === orderProduct.name.toLowerCase()
        );
        
        if (supplierProduct) {
            // calculate price based on supplier price
            total += supplierProduct.pricePerUnit * orderProduct.quantity;
        }
    });
    return total;
};

  const handleUpdateStatus = async (orderId, newStatus) => {
      try {
        const token = localStorage.getItem('token');
        const config = {
          headers: {
            'Content-Type': 'application/json',
            'x-auth-token': token
          }
        };
        
        let body;
        
        if (newStatus === 'rejected') {
          body = { action: 'reject' };
        } else if (newStatus === 'approved') {
          const orderToApprove = [...pendingOrders].find(order => order._id === orderId);
          
          if (!canFulfillOrder(orderToApprove)) {
            setError("You don't offer all products in this order. Cannot approve.");
            return;
          }
          
          const updatedProducts = orderToApprove.products.map(orderProduct => {
            const supplierProduct = supplierProducts.find(
              product => product.name.toLowerCase() === orderProduct.name.toLowerCase()
            );
            
            return {
              ...orderProduct,
              price: supplierProduct.pricePerUnit
            };
          });
          
          const totalAmount = calculateOrderTotal(orderToApprove);
          
          body = {
            status: newStatus,
            products: updatedProducts,
            totalAmount
          };
        } else {
          // For delivered or other statuses
          body = { status: newStatus };
        }
        
        await axios.put(`http://localhost:5000/api/orders/${orderId}/status`, body, config);
        
        if (newStatus === 'rejected') {
          const updatedPendingOrders = pendingOrders.filter(order => order._id !== orderId);
          setPendingOrders(updatedPendingOrders);

     } else if (newStatus === 'approved') {
        const updatedOrder = pendingOrders.find(order => order._id === orderId);
        if (updatedOrder) {
          const updatedPendingOrders = pendingOrders.filter(order => order._id !== orderId);
          setPendingOrders(updatedPendingOrders);
          
          const updatedApprovedOrder = {
            ...updatedOrder,
            status: newStatus,
            products: updatedOrder.products.map(prod => {
              const supplierProduct = supplierProducts.find(
                p => p.name.toLowerCase() === prod.name.toLowerCase()
              );
              return {
                ...prod,
                price: supplierProduct ? supplierProduct.pricePerUnit : 0
              };
            }),
            totalAmount: calculateOrderTotal(updatedOrder)
          };
          
          setApprovedOrders([...approvedOrders, updatedApprovedOrder]);
        }
      } else if (newStatus === 'delivered') {
        setApprovedOrders(approvedOrders.map(order => 
          order._id === orderId ? { ...order, status: newStatus } : order
        ));
      }
 
      if (selectedOrder && selectedOrder._id === orderId) {
        if (newStatus === 'approved') {
          const updatedProducts = selectedOrder.products.map(prod => {
            const supplierProduct = supplierProducts.find(
              p => p.name.toLowerCase() === prod.name.toLowerCase()
            );
            return {
              ...prod,
              price: supplierProduct ? supplierProduct.pricePerUnit : 0
            };
          });
          
          setSelectedOrder({
            ...selectedOrder,
            status: newStatus,
            products: updatedProducts,
            totalAmount: calculateOrderTotal(selectedOrder)
          });
        } else {
          setSelectedOrder({ ...selectedOrder, status: newStatus });
        }
      }
    } catch (err) {
      setError('Failed to update order status');
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const formatCurrency = (amount) => {
    return `$${parseFloat(amount).toFixed(2)}`;
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userType');
    navigate('/');
  };

  const openOrderDetails = (order) => {
    setSelectedOrder(order);
  };

  const closeOrderDetails = () => {
    setSelectedOrder(null);
  };

  if (loading) {
    return <div className="dashboard-container"><div className="loading">Loading...</div></div>;
  }

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>Supplier Dashboard</h1>
        <button onClick={handleLogout} className="btn btn-logout">Logout</button>
      </header>
      
      <main className="dashboard-main">
        {error && <div className="alert alert-danger">{error}</div>}
        
        {/* Pending Orders Section */}
        <section className="dashboard-section">
          <h2>Pending Orders</h2>
          
          {pendingOrders.length === 0 ? (
            <div className="no-data">No pending orders at this time.</div>
          ) : (
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Store Owner</th>
                    <th>Date</th>
                    <th>Total Items</th>
                    <th>Can Fulfill</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingOrders.map(order => {
                    const canFulfill = canFulfillOrder(order);
                    return (
                      <tr key={order._id} className="status-pending">
                        <td>#{order._id.substring(order._id.length - 6)}</td>
                        <td>{order.owner?.name || 'Unknown'}</td>
                        <td>{formatDate(order.createdAt)}</td>
                        <td>{order.products.length}</td>
                        <td>
                          <span className={`status-badge ${canFulfill ? 'fulfilled' : 'rejected'}`}>
                            {canFulfill ? 'Yes' : 'No'}
                          </span>
                        </td>
                        <td>
                          <button 
                            onClick={() => openOrderDetails(order)} 
                            className="btn btn-sm btn-info"
                          >
                            View
                          </button>
                          {canFulfill && (
                            <button 
                              onClick={() => handleUpdateStatus(order._id, 'approved')} 
                              className="btn btn-sm btn-success"
                            >
                              Approve
                            </button>
                          )}
                          <button 
                            onClick={() => handleUpdateStatus(order._id, 'rejected')} 
                            className="btn btn-sm btn-danger"
                          >
                            Reject
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
        
        {/* Approved Orders Section */}
        <section className="dashboard-section">
          <h2>Your Orders</h2>
          
          {approvedOrders.length === 0 ? (
            <div className="no-data">No approved orders yet.</div>
          ) : (
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Store Owner</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Total Amount</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {approvedOrders.map(order => (
                    <tr key={order._id} className={`status-${order.status}`}>
                      <td>#{order._id.substring(order._id.length - 6)}</td>
                      <td>{order.owner?.name || 'Unknown'}</td>
                      <td>{formatDate(order.createdAt)}</td>
                      <td>
                        <span className={`status-badge ${order.status}`}>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </span>
                      </td>
                      <td>{formatCurrency(order.totalAmount || calculateOrderTotal(order))}</td>
                      <td>
                        <button 
                          onClick={() => openOrderDetails(order)} 
                          className="btn btn-sm btn-info"
                        >
                          View
                        </button>
                        {order.status === 'approved' && (
                          <button 
                            onClick={() => handleUpdateStatus(order._id, 'delivered')} 
                            className="btn btn-sm btn-primary"
                          >
                            Deliver
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
      
      {selectedOrder && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Order Details</h2>
              <button onClick={closeOrderDetails} className="btn-close">&times;</button>
            </div>
            <div className="modal-body">
              <div className="order-info">
                <div className="order-header">
                  <div>
                    <strong>Order ID:</strong> #{selectedOrder._id}
                  </div>
                  <div>
                    <strong>Date:</strong> {formatDate(selectedOrder.createdAt)}
                  </div>
                  <div>
                    <strong>Status:</strong> 
                    <span className={`status-badge ${selectedOrder.status}`}>
                      {selectedOrder.status.charAt(0).toUpperCase() + selectedOrder.status.slice(1)}
                    </span>
                  </div>
                </div>
                
                <div className="order-customer">
                  <h3>Store Owner Information</h3>
                  <p><strong>Name:</strong> {selectedOrder.owner?.name}</p>
                  <p><strong>Email:</strong> {selectedOrder.owner?.email}</p>
                  <p><strong>Phone:</strong> {selectedOrder.owner?.phone}</p>
                </div>
                
                <div className="order-items">
                  <h3>Order Items</h3>
                  <table className="items-table">
                    <thead>
                      <tr>
                        <th>Product</th>
                        <th>Quantity</th>
                        <th>Unit Price</th>
                        <th>Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedOrder.products.map((product, index) => {
                        const supplierProduct = supplierProducts.find(
                          p => p.name.toLowerCase() === product.name.toLowerCase()
                        );
                        
                        const unitPrice = product.price || 
                          (supplierProduct ? supplierProduct.pricePerUnit : 'N/A');
                        
                        const totalPrice = unitPrice !== 'N/A' ? 
                          unitPrice * product.quantity : 'N/A';
                        
                        return (
                          <tr key={index}>
                            <td>{product.name}</td>
                            <td>{product.quantity}</td>
                            <td>{unitPrice !== 'N/A' ? formatCurrency(unitPrice) : 'N/A'}</td>
                            <td>{totalPrice !== 'N/A' ? formatCurrency(totalPrice) : 'N/A'}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                    {selectedOrder.status !== 'pending' && (
                      <tfoot>
                        <tr>
                          <td colSpan="3" style={{textAlign: 'right'}}><strong>Total:</strong></td>
                          <td>
                            <strong>
                              {formatCurrency(selectedOrder.totalAmount || calculateOrderTotal(selectedOrder))}
                            </strong>
                          </td>
                        </tr>
                      </tfoot>
                    )}
                  </table>
                </div>
                
                {!canFulfillOrder(selectedOrder) && selectedOrder.status === 'pending' && (
                  <div className="order-warning alert alert-warning">
                    <p><strong>Warning:</strong> You don't offer all products in this order. Cannot approve.</p>
                  </div>
                )}
                
                {selectedOrder.notes && (
                  <div className="order-notes">
                    <h3>Notes</h3>
                    <p>{selectedOrder.notes}</p>
                  </div>
                )}
              </div>
            </div>
            <div className="modal-footer">
              {selectedOrder.status === 'pending' && canFulfillOrder(selectedOrder) && (
                <button 
                  onClick={() => handleUpdateStatus(selectedOrder._id, 'approved')} 
                  className="btn btn-success"
                >
                  Approve Order
                </button>
              )}
              {selectedOrder.status === 'pending' && (
                <button 
                  onClick={() => handleUpdateStatus(selectedOrder._id, 'rejected')} 
                  className="btn btn-danger"
                >
                  Reject Order
                </button>
              )}
              {selectedOrder.status === 'approved' && (
                <button 
                  onClick={() => handleUpdateStatus(selectedOrder._id, 'delivered')} 
                  className="btn btn-primary"
                >
                  Mark as Delivered
                </button>
              )}
              <button onClick={closeOrderDetails} className="btn btn-secondary">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SupplierDashboard;