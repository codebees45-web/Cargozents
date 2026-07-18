import React, { useState, useEffect } from 'react';
import { getReceivedOrders, confirmOrder, rejectOrder, assignTruck, getOrderTracking, updateStatus } from '../services/orderService';
import { getAgencyTrucks } from '../services/agencyService';

const NEXT_STATUS = {
  awaiting_shipment: { value: 'shipment_requested', label: 'Mark Shipment Requested' },
  shipment_requested: { value: 'out_for_delivery', label: 'Mark Out for Delivery' },
  out_for_delivery: { value: 'delivered', label: 'Mark Delivered' },
};

const AgencyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(true);
  const [error, setError] = useState(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [availableTrucks, setAvailableTrucks] = useState([]);
  const [isLoadingTrucks, setIsLoadingTrucks] = useState(false);
  const [assigningTruckId, setAssigningTruckId] = useState(null);
  const [actionError, setActionError] = useState(null);

  // Order IDs currently mid-flight for accept/decline, so we can disable
  // just that row's buttons instead of the whole table.
  const [pendingActionId, setPendingActionId] = useState(null);

  // Timeline modal
  const [timelineOrderId, setTimelineOrderId] = useState(null);
  const [timelineData, setTimelineData] = useState(null);
  const [timelineLoading, setTimelineLoading] = useState(false);
  const [timelineError, setTimelineError] = useState('');
  const [advancing, setAdvancing] = useState(false);

  useEffect(() => {
    fetchRealOrders();
  }, []);

  const fetchRealOrders = async () => {
    setIsLoadingOrders(true);
    setError(null);
    try {
      const { data } = await getReceivedOrders();
      setOrders(data.orders || []);
    } catch (err) {
      console.error('Error fetching orders:', err);
      const status = err.response?.status;
      if (status === 401) {
        setError('Your session expired. Please log in again.');
      } else if (status === 403) {
        setError('Your account is not authorized to view received orders.');
      } else {
        setError(err.response?.data?.message || err.message || 'Failed to load orders.');
      }
    } finally {
      setIsLoadingOrders(false);
    }
  };

  const handleDecline = async (orderId) => {
    setActionError(null);
    setPendingActionId(orderId);
    try {
      await rejectOrder(orderId);
      setOrders((prev) => prev.filter((order) => (order._id || order.id) !== orderId));
    } catch (err) {
      console.error('Error declining order:', err);
      setActionError(err.response?.data?.message || err.message || 'Failed to decline order.');
    } finally {
      setPendingActionId(null);
    }
  };

  const handleAccept = async (order) => {
    const orderId = order._id || order.id;
    setActionError(null);
    setPendingActionId(orderId);
    try {
      const { data } = await confirmOrder(orderId);
      const confirmed = data.order || order;
      setOrders((prev) =>
        prev.map((o) => ((o._id || o.id) === orderId ? confirmed : o))
      );
      setSelectedOrder(confirmed);
      setIsModalOpen(true);
      fetchAvailableTrucks();
    } catch (err) {
      console.error('Error accepting order:', err);
      setActionError(err.response?.data?.message || err.message || 'Failed to accept order.');
    } finally {
      setPendingActionId(null);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedOrder(null);
    setAvailableTrucks([]);
  };

  const fetchAvailableTrucks = async () => {
    setIsLoadingTrucks(true);
    try {
      const { data } = await getAgencyTrucks();
      const trucks = (data.trucks || []).filter((t) => t.isVerified && t.isActive);
      setAvailableTrucks(trucks);
    } catch (err) {
      console.error('Error fetching trucks:', err);
      setAvailableTrucks([]);
    } finally {
      setIsLoadingTrucks(false);
    }
  };

  const handleAssignTruck = async (truck) => {
    if (!selectedOrder) return;
    const orderId = selectedOrder._id || selectedOrder.id;
    setAssigningTruckId(truck._id);
    setActionError(null);
    try {
      const { data } = await assignTruck(orderId, truck._id);
      const updated = data.order;
      setOrders((prev) =>
        prev.map((o) => ((o._id || o.id) === orderId ? updated : o))
      );
      closeModal();
    } catch (err) {
      console.error('Error assigning truck:', err);
      setActionError(err.response?.data?.message || err.message || 'Failed to assign truck.');
    } finally {
      setAssigningTruckId(null);
    }
  };

  const openTimeline = async (orderId) => {
    setTimelineOrderId(orderId);
    setTimelineData(null);
    setTimelineError('');
    setTimelineLoading(true);
    try {
      const data = await getOrderTracking(orderId);
      setTimelineData(data);
    } catch (err) {
      setTimelineError(err.response?.data?.message || 'Could not load this order\'s timeline.');
    } finally {
      setTimelineLoading(false);
    }
  };

  const closeTimeline = () => {
    setTimelineOrderId(null);
    setTimelineData(null);
    setTimelineError('');
  };

  const handleAdvanceStatus = async (nextStatus) => {
    if (!timelineOrderId) return;
    setAdvancing(true);
    setTimelineError('');
    try {
      const { order: updated } = await updateStatus(timelineOrderId, nextStatus);
      setOrders((prev) => prev.map((o) => ((o._id || o.id) === timelineOrderId ? updated : o)));
      await openTimeline(timelineOrderId);
    } catch (err) {
      setTimelineError(err.response?.data?.message || 'Could not update the order status.');
    } finally {
      setAdvancing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-[#133C2C] tracking-tight">Orders Received</h2>
          <p className="text-xs text-gray-400 mt-1 font-medium">Review and confirm client shipment requests.</p>
        </div>
        {error && (
          <button
            onClick={fetchRealOrders}
            className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-md font-medium transition-all"
          >
            Retry Connection
          </button>
        )}
      </div>

      {actionError && (
        <div className="text-xs font-semibold text-red-600 bg-red-50 border border-red-100 rounded-md px-4 py-2.5">
          {actionError}
        </div>
      )}

      <div className="bg-white border border-gray-100 rounded-xl shadow-xs overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50/50 border-b border-gray-100 text-[11px] font-bold tracking-wider text-gray-500 uppercase">
              <th className="px-6 py-4">Order ID</th>
              <th className="px-6 py-4">Client</th>
              <th className="px-6 py-4">Route</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Confirmation</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isLoadingOrders ? (
              <tr>
                <td colSpan="5" className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center justify-center space-y-3">
                    <div className="w-8 h-8 border-4 border-[#249B74]/20 border-t-[#249B74] rounded-full animate-spin"></div>
                    <p className="text-xs font-medium text-gray-400">Loading incoming orders...</p>
                  </div>
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan="5" className="px-6 py-10 text-center text-xs font-semibold text-red-500 bg-red-50/30">
                  ⚠️ Error loading orders: {error}
                </td>
              </tr>
            ) : orders.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-6 py-16 text-center">
                  <div className="max-w-md mx-auto">
                    <h3 className="text-lg font-bold text-[#133C2C] mb-2">No orders yet</h3>
                    <p className="text-sm text-gray-400 font-medium mb-6">
                      Waiting for buyers to place orders against your catalog. When a new order comes in, it will appear here.
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              orders.map((order) => {
                const orderId = order._id || order.id || 'N/A';
                const clientName = order.buyer?.name || order.client?.name || order.client || 'Unknown Client';
                const routeInfo =
                  order.route ||
                  `${order.pickup?.address || order.pickup || 'Origin'} to ${order.delivery?.address || order.dropoff || 'Destination'}`;
                const isPending = pendingActionId === orderId;
                const canRespond = order.status === 'placed';

                return (
                  <tr key={orderId} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                      {orderId.length > 8 ? `${orderId.substring(0, 8).toUpperCase()}...` : orderId.toUpperCase()}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{clientName}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{routeInfo}</td>
                    <td className="px-6 py-4 text-xs font-semibold text-gray-500 capitalize">
                      {(order.status || '').replace(/_/g, ' ')}
                    </td>
                    <td className="px-6 py-4">
                      {canRespond ? (
                        <div className="flex items-center gap-2">
                          <button
                            disabled={isPending}
                            onClick={() => handleAccept(order)}
                            className="bg-[#249B74] text-white text-xs font-bold px-4 py-2 rounded-md hover:bg-opacity-90 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {isPending ? 'Accepting…' : 'Accept'}
                          </button>
                          <button
                            disabled={isPending}
                            onClick={() => handleDecline(orderId)}
                            className="bg-white border border-red-200 text-red-600 text-xs font-bold px-4 py-2 rounded-md hover:bg-red-50 hover:border-red-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {isPending ? 'Declining…' : 'Decline'}
                          </button>
                        </div>
                      ) : order.status === 'confirmed_by_shipper' ? (
                        <button
                          onClick={() => {
                            setSelectedOrder(order);
                            setIsModalOpen(true);
                            fetchAvailableTrucks();
                          }}
                          className="bg-[#1C4E3A] text-white text-xs font-bold px-4 py-2 rounded-md hover:bg-opacity-90 transition-all shadow-sm"
                        >
                          Assign Truck
                        </button>
                      ) : order.status && order.status !== 'placed' ? (
                        <button
                          onClick={() => openTimeline(orderId)}
                          className="bg-white border border-gray-200 text-gray-700 text-xs font-bold px-4 py-2 rounded-md hover:border-[#249B74]/40 hover:text-[#1C4E3A] transition-all"
                        >
                          View Timeline
                        </button>
                      ) : (
                        <span className="text-xs text-gray-400 font-medium">—</span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">

            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <div>
                <h3 className="text-lg font-bold text-[#133C2C]">Assign Truck</h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Assigning a truck from your fleet for this shipment request.
                </p>
              </div>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-700 transition-colors p-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6 overflow-y-auto">
              <h4 className="text-[11px] font-black tracking-wider text-gray-400 uppercase mb-4">
                Available Fleet
              </h4>

              {isLoadingTrucks ? (
                <div className="flex flex-col items-center justify-center py-10 space-y-3">
                  <div className="w-8 h-8 border-4 border-[#249B74]/20 border-t-[#249B74] rounded-full animate-spin"></div>
                  <p className="text-xs font-medium text-gray-500">Loading your fleet...</p>
                </div>
              ) : availableTrucks.length === 0 ? (
                <div className="text-center py-8 text-sm text-gray-500">
                  No verified, active trucks in your fleet right now. Add a truck and wait for admin verification before assigning it here.
                </div>
              ) : (
                <div className="space-y-3">
                  {availableTrucks.map((truck) => (
                    <div
                      key={truck._id}
                      className="border border-gray-100 rounded-lg p-4 flex items-center justify-between hover:border-[#249B74]/30 hover:bg-green-50/30 transition-all"
                    >
                      <div>
                        <p className="text-sm font-bold text-gray-900">{truck.registrationNumber}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {truck.type} • <span className="font-medium text-gray-700">{truck.capacityWeight} tons</span>
                        </p>
                      </div>
                      <button
                        disabled={assigningTruckId === truck._id}
                        className="bg-[#1C4E3A] text-white text-xs font-bold px-4 py-2 rounded-md hover:bg-opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={() => handleAssignTruck(truck)}
                      >
                        {assigningTruckId === truck._id ? 'Assigning…' : 'Assign'}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>
      )}

      {timelineOrderId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <div>
                <h3 className="text-lg font-bold text-[#133C2C]">Order Timeline</h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  #{timelineOrderId.substring(0, 8).toUpperCase()}
                </p>
              </div>
              <button onClick={closeTimeline} className="text-gray-400 hover:text-gray-700 transition-colors p-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4">
              {timelineLoading ? (
                <div className="flex flex-col items-center justify-center py-10 space-y-3">
                  <div className="w-8 h-8 border-4 border-[#249B74]/20 border-t-[#249B74] rounded-full animate-spin"></div>
                  <p className="text-xs font-medium text-gray-500">Loading timeline...</p>
                </div>
              ) : (
                <>
                  {timelineData && (
                    <div className="rounded-lg bg-gray-50 border border-gray-100 px-4 py-3">
                      <p className="text-[11px] uppercase text-gray-400 font-bold tracking-wider">Current status</p>
                      <p className="text-sm font-bold text-[#133C2C] capitalize mt-1">
                        {(timelineData.tracking?.status || '').replace(/_/g, ' ')}
                      </p>
                    </div>
                  )}

                  {timelineError && (
                    <div className="text-xs font-semibold text-red-600 bg-red-50 border border-red-100 rounded-md px-4 py-2.5">
                      {timelineError}
                    </div>
                  )}

                  {timelineData?.tracking?.timeline?.length > 0 ? (
                    <ol className="space-y-4 border-l-2 border-[#249B74]/20 pl-4">
                      {timelineData.tracking.timeline.map((event, i) => (
                        <li key={i} className="relative">
                          <span className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-[#249B74]" />
                          <p className="text-sm font-bold text-gray-800 capitalize">
                            {(event.status || '').replace(/_/g, ' ')}
                          </p>
                          {event.message && <p className="text-xs text-gray-500 mt-0.5">{event.message}</p>}
                          <p className="text-[11px] text-gray-400 mt-0.5">
                            {event.createdAt ? new Date(event.createdAt).toLocaleString() : ''}
                          </p>
                        </li>
                      ))}
                    </ol>
                  ) : (
                    !timelineLoading && <p className="text-sm text-gray-400">No timeline events recorded yet.</p>
                  )}

                  {timelineData?.tracking?.status && NEXT_STATUS[timelineData.tracking.status] && (
                    <button
                      disabled={advancing}
                      onClick={() => handleAdvanceStatus(NEXT_STATUS[timelineData.tracking.status].value)}
                      className="w-full mt-2 bg-[#249B74] text-white text-xs font-bold px-4 py-2.5 rounded-md hover:bg-opacity-90 transition-all shadow-sm disabled:opacity-50"
                    >
                      {advancing ? 'Updating…' : NEXT_STATUS[timelineData.tracking.status].label}
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AgencyOrders;