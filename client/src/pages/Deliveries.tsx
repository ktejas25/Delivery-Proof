import React, { useEffect, useState, useRef } from 'react';
import api from '../services/api';
import { 
  MapPin, Clock, FileCheck, MoreVertical, 
  Edit, XCircle, Eye
} from 'lucide-react';
import ProofModal from '../components/ProofModal';
import NewDeliveryModal from '../components/NewDeliveryModal';
import EditDeliveryModal from '../components/EditDeliveryModal';
import AssignDriverModal from '../components/AssignDriverModal';

// --- Status mapping for display and colors ---
const statusMap: Record<string, { color: string; background: string; label: string }> = {
  scheduled: { color: '#8c8c8c', background: '#f5f5f5', label: 'PENDING' },
  dispatched: { color: '#1890ff', background: '#e6f7ff', label: 'CONFIRMED' },
  en_route: { color: '#faad14', background: '#fff7e6', label: 'OUT FOR DELIVERY' },
  arrived: { color: '#722ed1', background: '#f9f0ff', label: 'ARRIVED' },
  delivered: { color: '#2BB673', background: '#E9F7EF', label: 'DELIVERED' },
  failed: { color: '#ff4d4f', background: '#fff1f0', label: 'FAILED' },
  disputed: { color: '#eb2f96', background: '#fff0f6', label: 'DISPUTED' },
  cancelled: { color: '#ff4d4f', background: '#fff1f0', label: 'CANCELLED' },
};

// --- Helper: allowed status transitions ---
const getAllowedTransitions = (currentStatus: string): string[] => {
  const transitions: Record<string, string[]> = {
    scheduled: ['dispatched', 'cancelled'],
    dispatched: ['en_route', 'failed', 'cancelled'],
    en_route: ['arrived', 'failed', 'cancelled'],
    arrived: ['delivered', 'failed'],
    delivered: ['disputed'],
    failed: ['scheduled', 'cancelled'],
    disputed: [],          // no direct changes – admin review required
    cancelled: [],         // terminal state
  };
  return transitions[currentStatus] || [];
};

// --- Sub-components ---
const DeliveryStatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const style = statusMap[status] || statusMap.scheduled;
  return (
    <span style={{ 
      padding: '4px 10px', 
      borderRadius: '20px', 
      fontSize: '11px', 
      fontWeight: 700,
      letterSpacing: '0.02em',
      display: 'inline-block',
      color: style.color,
      background: style.background,
    }}>
      {style.label}
    </span>
  );
};

interface ActionMenuProps {
  isOpen: boolean;
  onClose: () => void;
  delivery: any;
  onAction: (action: string, uuid: string) => void;
  onStatusChange: (uuid: string, status: string) => void;
}

const ActionMenu: React.FC<ActionMenuProps> = ({ isOpen, onClose, delivery, onAction, onStatusChange }) => {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleItemClick = (e: React.MouseEvent, action: string) => {
    e.stopPropagation();
    onAction(action, delivery.uuid);
  };

  const handleStatusClick = (e: React.MouseEvent, newStatus: string) => {
    e.stopPropagation();
    onStatusChange(delivery.uuid, newStatus);
  };

  const currentStatus = delivery.delivery_status;
  const allowedNext = getAllowedTransitions(currentStatus);
  const canEditAssign = ['scheduled', 'pending'].includes(currentStatus);
  const canCancel = !['delivered', 'cancelled'].includes(currentStatus);;

  return (
    <div 
      ref={menuRef}
      onClick={(e) => e.stopPropagation()}
      style={{
        position: 'absolute',
        right: '16px',
        top: 'calc(100% - 8px)',
        background: 'white',
        border: '1px solid var(--border-color)',
        borderRadius: '12px',
        boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
        zIndex: 1000,
        minWidth: '200px',
        padding: '8px',
        animation: 'fadeInScale 0.15s ease-out'
      }}
    >
      <button className="dropdown-item" onClick={(e) => handleItemClick(e, 'view')}>
        <Eye size={14} style={{ marginRight: '10px' }} /> View Details
      </button>

      {canEditAssign && (
        <>
          <button className="dropdown-item" onClick={(e) => handleItemClick(e, 'edit')}>
            <Edit size={14} style={{ marginRight: '10px' }} /> Edit
          </button>
        </>
      )}

      {allowedNext.length > 0 && (
        <>
          <div style={{ borderTop: '1px solid var(--border-color)', margin: '8px 0' }} />
          <div style={{ padding: '4px 8px' }}>
            <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Change Status
            </span>
            <div style={{ marginTop: '6px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {allowedNext.map((next) => (
                <button
                  key={next}
                  className="dropdown-item-small"
                  onClick={(e) => handleStatusClick(e, next)}
                >
                  → {statusMap[next]?.label || next.replace('_', ' ').toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      {canCancel && (
        <>
          <div style={{ borderTop: '1px solid var(--border-color)', margin: '8px 0' }} />
          <button className="dropdown-item" onClick={(e) => handleItemClick(e, 'cancel')} style={{ color: '#ff4d4f' }}>
            <XCircle size={14} style={{ marginRight: '10px' }} /> Cancel Delivery
          </button>
        </>
      )}

      {delivery.delivery_status === 'delivered' && (
        <button className="dropdown-item" onClick={(e) => handleItemClick(e, 'proof')}>
          <FileCheck size={14} style={{ marginRight: '10px' }} /> View Proof
        </button>
      )}
    </div>
  );
};

// --- Main component (unchanged except for using the updated sub-components) ---
const Deliveries: React.FC = () => {
  const [deliveries, setDeliveries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDelivery, setSelectedDelivery] = useState<string | null>(null);
  const [showNewModal, setShowNewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [activeDeliveryUuid, setActiveDeliveryUuid] = useState<string | null>(null);
  const [actionMenuOpen, setActionMenuOpen] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchDeliveries = async () => {
    try {
      const response = await api.get('/deliveries');
      setDeliveries(response.data);
    } catch (error) {
      console.error('Fetch failed', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeliveries();
  }, []);

  const handleAction = async (action: string, deliveryUuid: string) => {
    setActionMenuOpen(null);
    switch (action) {
      case 'view':
        alert(`View details for ${deliveryUuid}`);
        break;
      case 'edit':
        setActiveDeliveryUuid(deliveryUuid);
        setShowEditModal(true);
        break;
      case 'assign':
        setActiveDeliveryUuid(deliveryUuid);
        setShowAssignModal(true);
        break;
      case 'cancel':
        if (window.confirm('Are you sure you want to cancel this delivery?')) {
          try {
            await api.patch(`/deliveries/${deliveryUuid}/status`, { status: 'cancelled' });
            fetchDeliveries();
          } catch (error) {
            console.error('Cancel failed', error);
          }
        }
        break;
      case 'proof':
        setSelectedDelivery(deliveryUuid);
        break;
      default:
        break;
    }
  };

  const handleStatusChange = async (deliveryUuid: string, newStatus: string) => {
    setActionMenuOpen(null);
    try {
      await api.patch(`/deliveries/${deliveryUuid}/status`, { status: newStatus });
      fetchDeliveries();
    } catch (error) {
      console.error('Status update failed', error);
    }
  };

  const toggleMenu = (e: React.MouseEvent, uuid: string) => {
    e.stopPropagation();
    setActionMenuOpen(actionMenuOpen === uuid ? null : uuid);
  };

  const filteredDeliveries = deliveries.filter(d => 
    d.order_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.customer_address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.driver_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div style={{ padding: '24px' }}>Loading deliveries...</div>;

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 600 }}>Deliveries</h2>
        <div style={{ display: 'flex', gap: '12px' }}>
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>🔍</span>
            <input 
              type="text" 
              placeholder="Search orders..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                padding: '8px 12px 8px 36px',
                borderRadius: '8px',
                border: '1px solid var(--border-color)',
                outline: 'none',
                width: '250px'
              }}
            />
          </div>
          <button className="btn btn-primary" onClick={() => setShowNewModal(true)}>+ New Delivery</button>
        </div>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'visible' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-color)' }}>
            <tr>
              <th className="th-cell">ORDER</th>
              <th className="th-cell">CUSTOMER</th>
              <th className="th-cell">ADDRESS</th>
              <th className="th-cell">DRIVER</th>
              <th className="th-cell">STATUS</th>
              <th className="th-cell">SCHEDULED</th>
              <th className="th-cell" style={{ textAlign: 'right' }}>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {filteredDeliveries.map((d) => (
              <tr key={d.uuid} className="hover-row">
                <td className="td-cell" style={{ fontWeight: 600, color: 'var(--text-primary)' }}>#{d.order_number}</td>
                <td className="td-cell">{d.customer_name}</td>
                <td className="td-cell" style={{ fontSize: '13px', maxWidth: '250px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  <MapPin size={12} style={{ verticalAlign: 'middle', marginRight: '4px', color: 'var(--text-muted)' }} />
                  {d.customer_address}
                </td>
                <td className="td-cell" style={{ fontSize: '13px' }}>
                  {d.driver_name ? (
                    <span style={{ fontWeight: 500 }}>{d.driver_name}</span>
                  ) : (
                    <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>Unassigned</span>
                  )}
                </td>
                <td className="td-cell">
                  <DeliveryStatusBadge status={d.delivery_status} />
                </td>
                <td className="td-cell" style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                  <Clock size={12} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
                  {new Date(d.scheduled_time).toDateString()}
                </td>
                <td className="td-cell" style={{ textAlign: 'right', position: 'relative' }}>
                  <button 
                    className="btn btn-icon"
                    onClick={(e) => toggleMenu(e, d.uuid)}
                    style={{ 
                      background: actionMenuOpen === d.uuid ? 'var(--bg-secondary)' : 'transparent',
                      borderRadius: '8px'
                    }}
                  >
                    <MoreVertical size={18} />
                  </button>
                  <ActionMenu 
                    isOpen={actionMenuOpen === d.uuid}
                    onClose={() => setActionMenuOpen(null)}
                    delivery={d}
                    onAction={handleAction}
                    onStatusChange={handleStatusChange}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <style>{`
        .th-cell {
          padding: 16px;
          text-align: left;
          font-size: 11px;
          font-weight: 700;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .td-cell {
          padding: 16px;
          border-bottom: 1px solid var(--border-color);
        }
        .hover-row:hover {
          background-color: var(--bg-main);
        }
        .dropdown-item {
          display: flex;
          align-items: center;
          width: 100%;
          padding: 10px 12px;
          border: none;
          background: none;
          cursor: pointer;
          font-size: 13px;
          font-weight: 500;
          color: var(--text-body);
          border-radius: 8px;
          transition: all 0.15s ease;
          text-align: left;
        }
        .dropdown-item:hover {
          background: var(--bg-secondary);
          color: var(--text-primary);
        }
        .dropdown-item-small {
          display: block;
          width: 100%;
          padding: 4px 8px;
          border: none;
          background: none;
          cursor: pointer;
          font-size: 11px;
          font-weight: 600;
          color: var(--text-muted);
          border-radius: 4px;
          transition: all 0.1s ease;
          text-align: left;
        }
        .dropdown-item-small:hover {
          background: var(--bg-highlight);
          color: var(--primary-mint);
        }
        @keyframes fadeInScale {
          from { opacity: 0; transform: scale(0.95) translateY(-10px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>

      {/* Modals (unchanged) */}
      {selectedDelivery && (
        <ProofModal 
          deliveryUuid={selectedDelivery} 
          onClose={() => setSelectedDelivery(null)}
          onSuccess={() => {
            setSelectedDelivery(null);
            fetchDeliveries();
          }}
        />
      )}
      {showNewModal && (
        <NewDeliveryModal
          onClose={() => setShowNewModal(false)}
          onSuccess={() => {
            setShowNewModal(false);
            fetchDeliveries();
          }}
        />
      )}
      {showEditModal && activeDeliveryUuid && (
        <EditDeliveryModal
          deliveryUuid={activeDeliveryUuid}
          onClose={() => {
            setShowEditModal(false);
            setActiveDeliveryUuid(null);
          }}
          onSuccess={() => {
            setShowEditModal(false);
            setActiveDeliveryUuid(null);
            fetchDeliveries();
          }}
        />
      )}
      {showAssignModal && activeDeliveryUuid && (
        <AssignDriverModal
          deliveryUuid={activeDeliveryUuid}
          onClose={() => {
            setShowAssignModal(false);
            setActiveDeliveryUuid(null);
          }}
          onSuccess={() => {
            setShowAssignModal(false);
            setActiveDeliveryUuid(null);
            fetchDeliveries();
          }}
        />
      )}
    </div>
  );
};

export default Deliveries;