import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../../styles/Dashboard.css";

const GroceryOwnerDashboard = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const navigate = useNavigate();

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    const fetchOrders = async () => {
      try {
        const config = {
          headers: {
            "x-auth-token": token,
          },
        };

        const res = await axios.get(
          "http://localhost:5000/api/owner/orders",
          config
        );
        setOrders(res.data);
        setLoading(false);
      } catch (err) {
        console.error("Error details:", err.response ? err.response.data : err);
        setError(
          "Failed to fetch orders: " +
            (err.response && err.response.data.msg
              ? err.response.data.msg
              : err.message)
        );
        setLoading(false);
      }
    };

    fetchOrders();
  }, [navigate, token]);

  // filter orders by status
  const approvedOrDeliveredOrders = orders.filter((order) =>
    ["approved", "delivered"].includes(order.status)
  );

  const pendingOrders = orders.filter((order) => order.status === "pending");

  const rejectedOrders = orders.filter((order) => order.status === "rejected");

  const allAcceptedOrders = orders.filter(
    (order) => order.status === "received"
  );

  const openOrderDetails = (order) => {
    setSelectedOrder(order);
  };

  const closeOrderDetails = () => {
    setSelectedOrder(null);
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const config = {
        headers: {
          "x-auth-token": token,
          "Content-Type": "application/json",
        },
      };

      await axios.put(
        `http://localhost:5000/api/owner/orders/${orderId}/status`,
        { status: newStatus },
        config
      );

      setOrders(
        orders.map((order) =>
          order._id === orderId ? { ...order, status: newStatus } : order
        )
      );

      if (selectedOrder && selectedOrder._id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: newStatus });
      }
    } catch (err) {
      console.error(
        "Error updating status:",
        err.response ? err.response.data : err
      );
      setError(
        "Failed to update order status: " +
          (err.response && err.response.data.msg
            ? err.response.data.msg
            : err.message)
      );
    }
  };

  const formatDate = (dateString) => {
    const options = {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const formatCurrency = (amount) => {
    return `$${parseFloat(amount).toFixed(2)}`;
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="error">{error}</div>;

  const renderOrderCard = (order) => (
    <div key={order._id} className={`order-card status-${order.status}`}>
      <div className="order-header">
        <h3>Order #{order._id.substring(order._id.length - 6)}</h3>
        <span className={`status-badge ${order.status}`}>
          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
        </span>
      </div>
      <div className="order-details">
        <p>
          <strong>Created:</strong> {formatDate(order.createdAt)}
        </p>
        {order?.products && (
          <p>
            <strong>Total Items:</strong> {order.products.length}
          </p>
        )}
        {order.supplier && (
          <p>
            <strong>Supplier:</strong> {order.supplier.companyName}
          </p>
        )}
        <p>
          <strong>Total Amount:</strong>{" "}
          {order.totalAmount !== undefined && order.totalAmount > 0
            ? formatCurrency(order.totalAmount)
            : "In process"}
        </p>
      </div>
      <button
        onClick={() => openOrderDetails(order)}
        className="btn btn-sm btn-info"
      >
        View
      </button>
    </div>
  );

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>My Orders</h1>
      </header>
      <button
        className="btn create-order-btn"
        onClick={() => navigate("/owner/create-order")}
      >
        Create New Order
      </button>

      <main className="dashboard-main">
        {/* Approved/Delivered Orders Section */}
        <section className="dashboard-section">
          <h2>Active Orders</h2>
          {approvedOrDeliveredOrders.length === 0 ? (
            <div className="no-data">No active orders at this time.</div>
          ) : (
            <div className="orders-list">
              {approvedOrDeliveredOrders.map((order) => renderOrderCard(order))}
            </div>
          )}
        </section>

        {/* Pending Orders Section */}
        <section className="dashboard-section">
          <h2>Pending Orders</h2>
          {pendingOrders.length === 0 ? (
            <div className="no-data">No pending orders at this time.</div>
          ) : (
            <div className="orders-list">
              {pendingOrders.map((order) => renderOrderCard(order))}
            </div>
          )}
        </section>

        {/* Rejected Orders Section */}
        <section className="dashboard-section">
          <h2>Rejected Orders</h2>
          {rejectedOrders.length === 0 ? (
            <div className="no-data">No rejected orders at this time.</div>
          ) : (
            <div className="orders-list">
              {rejectedOrders.map((order) => renderOrderCard(order))}
            </div>
          )}
        </section>

        <section className="dashboard-section">
          <h2>All Accepted Orders History</h2>
          {allAcceptedOrders.length === 0 ? (
            <div className="no-data">No accepted orders in history.</div>
          ) : (
            <div className="orders-list">
              {allAcceptedOrders.map((order) => renderOrderCard(order))}
            </div>
          )}
        </section>
      </main>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Order Details</h2>
              <button onClick={closeOrderDetails} className="btn-close">
                &times;
              </button>
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
                      {selectedOrder.status.charAt(0).toUpperCase() +
                        selectedOrder.status.slice(1)}
                    </span>
                  </div>
                </div>

                {selectedOrder.supplier && (
                  <div className="order-supplier">
                    <h3>Supplier Information</h3>
                    <p>
                      <strong>Name:</strong>{" "}
                      {selectedOrder.supplier.companyName}
                    </p>
                    <p>
                      <strong>Email:</strong> {selectedOrder.supplier.email}
                    </p>
                    <p>
                      <strong>Phone:</strong> {selectedOrder.supplier.phone}
                    </p>
                  </div>
                )}

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
                      {selectedOrder.products &&
                        selectedOrder.products.map((product, index) => {
                          const unitPrice =
                            product.price !== undefined ? product.price : "N/A";
                          const totalPrice =
                            unitPrice !== "N/A"
                              ? unitPrice * product.quantity
                              : "N/A";

                          return (
                            <tr key={index}>
                              <td>{product.name}</td>
                              <td>{product.quantity}</td>
                              <td>
                                {unitPrice !== "N/A"
                                  ? formatCurrency(unitPrice)
                                  : "N/A"}
                              </td>
                              <td>
                                {totalPrice !== "N/A"
                                  ? formatCurrency(totalPrice)
                                  : "N/A"}
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                    <tfoot>
                      <tr>
                        <td colSpan="3" style={{ textAlign: "right" }}>
                          <strong>Total:</strong>
                        </td>
                        <td>
                          <strong>
                            {selectedOrder.totalAmount !== undefined &&
                            selectedOrder.totalAmount > 0
                              ? formatCurrency(selectedOrder.totalAmount)
                              : "In process"}
                          </strong>
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>

                {selectedOrder.notes && (
                  <div className="order-notes">
                    <h3>Notes</h3>
                    <p>{selectedOrder.notes}</p>
                  </div>
                )}
              </div>
            </div>
            <div className="modal-footer">
              {/* Status update buttons based on current status */}
              {["approved", "delivered"].includes(selectedOrder.status) && (
                <div className="status-actions">
                  <button
                    className="btn btn-success"
                    onClick={() =>
                      updateOrderStatus(selectedOrder._id, "received")
                    }
                    disabled={selectedOrder.status === "received"}
                  >
                    Mark as Received
                  </button>
                </div>
              )}

              {["pending", "rejected"].includes(selectedOrder.status) && (
                <div className="status-badge status-pending">
                  Waiting for supplier response
                </div>
              )}

              <button onClick={closeOrderDetails} className="btn btn-secondary">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GroceryOwnerDashboard;
