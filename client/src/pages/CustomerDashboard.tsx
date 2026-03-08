import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import api from "../services/api";
import "leaflet/dist/leaflet.css";
import "../lib/leaflet-fix";
import toast from "react-hot-toast";
import TrackingMap from "../components/TrackingMap";

// Fix for default marker icon in react-leaflet moved to lib/leaflet-fix.ts

const CustomerDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState("active"); // active, history, addresses
  const [deliveries, setDeliveries] = useState<any[]>([]);
  const [addresses, setAddresses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Ratings
  const [ratingData, setRatingData] = useState({
    delivery_id: null,
    rating: 5,
    comment: "",
  });

  // Disputes
  const [disputeData, setDisputeData] = useState({
    delivery_id: null,
    type: "not_received",
    claim: "",
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [delsRes, addrsRes] = await Promise.all([
        api.get("/customer/deliveries"),
        api.get("/customer/addresses"),
      ]);
      // If sp returns array of rows
      setDeliveries(Array.isArray(delsRes.data) ? delsRes.data : []);
      setAddresses(Array.isArray(addrsRes.data) ? addrsRes.data : []);
    } catch (err) {
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const handleRate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ratingData.delivery_id) return;
    try {
      await api.post("/customer/rate-driver", ratingData);
      toast.success("Rating submitted successfully");
      setRatingData({ delivery_id: null, rating: 5, comment: "" });
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to submit rating");
    }
  };

  const handleDispute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!disputeData.delivery_id) return;
    try {
      await api.post("/customer/dispute", {
        delivery_id: disputeData.delivery_id,
        dispute_type: disputeData.type,
        claim: disputeData.claim,
      });
      toast.success("Dispute submitted successfully");
      setDisputeData({ delivery_id: null, type: "not_received", claim: "" });
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to submit dispute");
    }
  };

  const activeDeliveries = deliveries.filter((d) =>
    ["scheduled", "dispatched", "en_route"].includes(d.delivery_status),
  );
  const pastDeliveries = deliveries.filter(
    (d) => !["scheduled", "dispatched", "en_route"].includes(d.delivery_status),
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-blue-600">
                Customer Portal
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">
                Welcome, {user?.name || user?.first_name}
              </span>
              <button
                onClick={logout}
                className="text-sm text-red-600 hover:text-red-800"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex space-x-4 border-b border-gray-200 mb-6">
          <button
            className={`pb-2 px-1 ${activeTab === "active" ? "border-b-2 border-blue-600 text-blue-600 font-semibold" : "text-gray-500"}`}
            onClick={() => setActiveTab("active")}
          >
            Active Deliveries
          </button>
          <button
            className={`pb-2 px-1 ${activeTab === "history" ? "border-b-2 border-blue-600 text-blue-600 font-semibold" : "text-gray-500"}`}
            onClick={() => setActiveTab("history")}
          >
            History & Support
          </button>
          <button
            className={`pb-2 px-1 ${activeTab === "addresses" ? "border-b-2 border-blue-600 text-blue-600 font-semibold" : "text-gray-500"}`}
            onClick={() => setActiveTab("addresses")}
          >
            Saved Addresses
          </button>
        </div>

        {loading ? (
          <p>Loading...</p>
        ) : (
          <div>
            {activeTab === "active" && (
              <div className="space-y-6">
                {activeDeliveries.length === 0 ? (
                  <p className="text-gray-500 bg-white p-6 rounded-lg shadow">
                    No active deliveries at the moment.
                  </p>
                ) : (
                  activeDeliveries.map((d) => (
                    <div
                      key={d.uuid}
                      className="bg-white p-6 rounded-lg shadow"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-lg font-bold">
                            Order #{d.order_number}
                          </h3>
                          <p className="text-sm text-gray-500">
                            Status:{" "}
                            <span className="font-semibold capitalize">
                              {d.delivery_status.replace("_", " ")}
                            </span>
                          </p>
                          <p className="text-sm text-gray-500">
                            Driver: {d.driver_name || "Unassigned"}
                          </p>
                        </div>
                      </div>
                      <div className="h-96 w-full bg-gray-200 rounded-lg overflow-hidden border border-gray-200">
                        {d.delivery_status === "en_route" ? (
                          <TrackingMap deliveryUuid={d.uuid} initialData={d} />
                        ) : (
                          <div className="flex items-center justify-center h-full text-gray-400 bg-gray-50 flex-col">
                            <p className="text-lg font-medium">
                              Map available once en-route
                            </p>
                            <p className="text-sm">
                              Current Status:{" "}
                              {d.delivery_status.replace("_", " ")}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === "history" && (
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Order
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Driver
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {pastDeliveries.map((d: any) => (
                      <tr key={d.uuid}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          #{d.order_number}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
                          {d.delivery_status.replace("_", " ")}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(d.scheduled_time).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {d.driver_name || "-"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          {d.delivery_status === "delivered" && (
                            <button
                              onClick={() =>
                                setRatingData({
                                  ...ratingData,
                                  delivery_id: d.id || d.uuid,
                                })
                              }
                              className="text-blue-600 hover:text-blue-900 mr-4"
                            >
                              Rate
                            </button>
                          )}
                          <button
                            onClick={() =>
                              setDisputeData({
                                ...disputeData,
                                delivery_id: d.id || d.uuid,
                              })
                            }
                            className="text-red-600 hover:text-red-900"
                          >
                            Dispute
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === "addresses" && (
              <div className="space-y-4">
                <button className="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700">
                  Add New Address
                </button>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
                  {addresses.map((addr) => (
                    <div
                      key={addr.id}
                      className="bg-white p-6 rounded-lg shadow"
                    >
                      <h4 className="font-bold text-gray-800">{addr.label}</h4>
                      <p className="text-sm text-gray-600 mt-2">
                        {addr.address}
                      </p>
                      {addr.is_default ? (
                        <span className="inline-block mt-3 px-2 py-1 text-xs font-semibold bg-green-100 text-green-800 rounded">
                          Default
                        </span>
                      ) : null}
                    </div>
                  ))}
                  {addresses.length === 0 && (
                    <p className="text-gray-500">No saved addresses.</p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Rating Modal */}
      {ratingData.delivery_id && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-bold mb-4">Rate Driver</h3>
            <form onSubmit={handleRate}>
              <div className="mb-4">
                <label className="block text-sm mb-1">Rating (1-5)</label>
                <input
                  type="number"
                  min="1"
                  max="5"
                  required
                  className="w-full border rounded p-2"
                  value={ratingData.rating}
                  onChange={(e) =>
                    setRatingData({
                      ...ratingData,
                      rating: Number(e.target.value),
                    })
                  }
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm mb-1">Comment</label>
                <textarea
                  className="w-full border rounded p-2"
                  rows={3}
                  value={ratingData.comment}
                  onChange={(e) =>
                    setRatingData({ ...ratingData, comment: e.target.value })
                  }
                ></textarea>
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() =>
                    setRatingData({ ...ratingData, delivery_id: null })
                  }
                  className="px-4 py-2 border rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded"
                >
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Dispute Modal */}
      {disputeData.delivery_id && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-bold mb-4">Submit Dispute</h3>
            <form onSubmit={handleDispute}>
              <div className="mb-4">
                <label className="block text-sm mb-1">Issue Type</label>
                <select
                  className="w-full border rounded p-2"
                  value={disputeData.type}
                  onChange={(e) =>
                    setDisputeData({ ...disputeData, type: e.target.value })
                  }
                >
                  <option value="not_received">Not Received</option>
                  <option value="damaged">Damaged</option>
                  <option value="wrong_item">Wrong Item</option>
                  <option value="late">Late</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm mb-1">Claim Details</label>
                <textarea
                  required
                  className="w-full border rounded p-2"
                  rows={3}
                  value={disputeData.claim}
                  onChange={(e) =>
                    setDisputeData({ ...disputeData, claim: e.target.value })
                  }
                ></textarea>
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() =>
                    setDisputeData({ ...disputeData, delivery_id: null })
                  }
                  className="px-4 py-2 border rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-red-600 text-white rounded"
                >
                  Submit Dispute
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerDashboard;
