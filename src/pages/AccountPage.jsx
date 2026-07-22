import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Package, MapPin, LogOut, ChevronRight, Calendar, Plus, X, Edit3, Trash2, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { formatOrderNumber } from '../utils/order';
import { API_BASE_URL, getImageUrl } from '../config/api';
import './AccountPage.css';

export default function AccountPage() {
  const { user, token, loading, logout, updateUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(location.state?.tab || 'profile');
  
  // Profile State
  const [profileData, setProfileData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    gender: ''
  });
  const [profileMsg, setProfileMsg] = useState({ type: '', text: '' });
  const [saving, setSaving] = useState(false);

  // Orders & Addresses State
  const [orders, setOrders] = useState([]);
  const [addresses, setAddresses] = useState([]);

  // Address Modal & Editing State
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [editingAddrId, setEditingAddrId] = useState(null); // null = new, id = edit
  const [statesList, setStatesList] = useState([]);
  const [citiesList, setCitiesList] = useState([]);
  const [newAddr, setNewAddr] = useState({
    address_line_1: '',
    address_line_2: '',
    state: '',
    city: '',
    pincode: ''
  });
  const [addrSaving, setAddrSaving] = useState(false);
  const [addrMsg, setAddrMsg] = useState('');

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth', { replace: true });
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (location.state?.tab) {
      setActiveTab(location.state.tab);
    }
  }, [location.state]);

  useEffect(() => {
    if (user) {
      setProfileData({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email || '',
        phone: user.phone || '',
        gender: user.gender || ''
      });
      fetchAddresses();
      fetchOrders();
      fetchStates();
    }
  }, [user]);

  const fetchStates = () => {
    fetch(`${API_BASE_URL}/locations.php?action=states`)
      .then(res => res.json())
      .then(data => {
        if (data.success) setStatesList(data.states);
      })
      .catch(err => console.error(err));
  };

  const fetchCitiesForState = (stateName) => {
    fetch(`${API_BASE_URL}/locations.php?action=cities&state_name=${encodeURIComponent(stateName)}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) setCitiesList(data.cities);
      })
      .catch(err => console.error(err));
  };

  const handleStateSelect = (e) => {
    const selectedState = e.target.value;
    setNewAddr(prev => ({ ...prev, state: selectedState, city: '' }));
    if (selectedState) {
      fetchCitiesForState(selectedState);
    } else {
      setCitiesList([]);
    }
  };

  const fetchAddresses = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/account.php?action=addresses`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) setAddresses(data.addresses);
    } catch (err) { console.error(err); }
  };

  const fetchOrders = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/account.php?action=orders`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) setOrders(data.orders);
    } catch (err) { console.error(err); }
  };

  const handleProfileChange = (e) => {
    setProfileData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setProfileMsg({ type: '', text: '' });

    try {
      const res = await fetch(`${API_BASE_URL}/account.php?action=update_profile`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(profileData)
      });
      const data = await res.json();
      if (data.success) {
        setProfileMsg({ type: 'success', text: 'Profile updated successfully!' });
        updateUser({ 
          first_name: profileData.first_name, 
          last_name: profileData.last_name, 
          phone: profileData.phone,
          gender: profileData.gender
        });
      } else {
        setProfileMsg({ type: 'error', text: data.message || 'Failed to update.' });
      }
    } catch (err) {
      setProfileMsg({ type: 'error', text: 'Network error.' });
    } finally {
      setSaving(false);
    }
  };

  const handleOpenAddModal = () => {
    setEditingAddrId(null);
    setNewAddr({ address_line_1: '', address_line_2: '', state: '', city: '', pincode: '' });
    setCitiesList([]);
    setAddrMsg('');
    setShowAddressModal(true);
  };

  const handleOpenEditModal = (addr) => {
    setEditingAddrId(addr.id);
    setNewAddr({
      address_line_1: addr.address_line_1 || '',
      address_line_2: addr.address_line_2 || '',
      state: addr.state || '',
      city: addr.city || '',
      pincode: addr.pincode || ''
    });
    if (addr.state) {
      fetchCitiesForState(addr.state);
    }
    setAddrMsg('');
    setShowAddressModal(true);
  };

  const handleSaveAddressSubmit = async (e) => {
    e.preventDefault();
    setAddrSaving(true);
    setAddrMsg('');

    const action = editingAddrId ? 'update_address' : 'add_address';
    const payload = editingAddrId ? { ...newAddr, id: editingAddrId } : newAddr;

    try {
      const res = await fetch(`${API_BASE_URL}/account.php?action=${action}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        setShowAddressModal(false);
        setEditingAddrId(null);
        setNewAddr({ address_line_1: '', address_line_2: '', state: '', city: '', pincode: '' });
        fetchAddresses();
      } else {
        setAddrMsg(data.message || 'Failed to save address.');
      }
    } catch (err) {
      setAddrMsg('Network error.');
    } finally {
      setAddrSaving(false);
    }
  };

  const handleDeleteAddress = async (id) => {
    if (!window.confirm('Are you sure you want to delete this address?')) return;
    try {
      const res = await fetch(`${API_BASE_URL}/account.php?action=delete_address`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ id })
      });
      const data = await res.json();
      if (data.success) {
        fetchAddresses();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSetDefaultAddress = async (id) => {
    try {
      const res = await fetch(`${API_BASE_URL}/account.php?action=set_default_address`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ id })
      });
      const data = await res.json();
      if (data.success) {
        fetchAddresses();
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading || !user) {
    return (
      <div className="account-page" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <div className="spinner"></div>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <h2>Personal Information</h2>
            {profileMsg.text && (
              <div className={`profile-message ${profileMsg.type}`}>
                {profileMsg.text}
              </div>
            )}
            <form onSubmit={handleProfileSubmit} className="profile-form">
              <div className="form-row">
                <div className="form-group">
                  <label>First Name</label>
                  <input type="text" name="first_name" value={profileData.first_name} onChange={handleProfileChange} required />
                </div>
                <div className="form-group">
                  <label>Last Name</label>
                  <input type="text" name="last_name" value={profileData.last_name} onChange={handleProfileChange} required />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Email</label>
                  <input type="email" value={profileData.email} disabled style={{ opacity: 0.5, cursor: 'not-allowed' }} />
                </div>
                <div className="form-group">
                  <label>Phone</label>
                  <input type="tel" name="phone" value={profileData.phone} onChange={handleProfileChange} />
                </div>
              </div>
              <div className="form-group" style={{ maxWidth: '48%' }}>
                <label>Gender</label>
                <select name="gender" value={profileData.gender} onChange={handleProfileChange}>
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <button type="submit" className="btn-primary" disabled={saving}>
                  {saving ? 'Updating...' : 'Update Profile'}
                </button>
              </div>
            </form>
          </motion.div>
        );
      case 'orders':
        return (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <h2>Order History</h2>
            <p style={{ color: 'var(--muted-text)', fontSize: '13px', marginBottom: '20px' }}>
              Click on any order card below to open its dedicated detailed purchase overview.
            </p>

            {orders.length === 0 ? (
              <div className="empty-state">You haven't placed any orders yet.</div>
            ) : (
              orders.map(order => (
                <div 
                  key={order.id} 
                  className="order-card" 
                  onClick={() => navigate(`/order/${order.id}`)}
                  style={{
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '12px',
                    padding: '20px',
                    marginBottom: '20px',
                    background: 'rgba(255,255,255,0.02)',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                >
                  <div className="order-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <strong style={{ color: 'var(--ivory)', fontSize: '16px' }}>Order {order.order_number || formatOrderNumber(order.id)}</strong>
                    </div>
                    <div style={{ color: 'var(--muted-text)', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Calendar size={12} /> {new Date(order.created_at).toLocaleDateString()}
                    </div>
                    <div style={{ 
                      fontSize: '12px', 
                      fontWeight: 600, 
                      padding: '3px 10px', 
                      borderRadius: '12px',
                      background: order.status === 'Delivered' ? 'rgba(46, 204, 113, 0.15)' : 'rgba(212, 175, 55, 0.15)',
                      color: order.status === 'Delivered' ? '#2ecc71' : 'var(--gold)' 
                    }}>
                      {order.status}
                    </div>
                  </div>

                  {order.items && order.items.length > 0 && (
                    <div style={{ margin: '15px 0' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <img 
                          src={order.items[0].main_image ? getImageUrl(order.items[0].main_image) : 'https://placehold.co/80x100/1A1A1A/D4AF37?text=No+Image'} 
                          alt={order.items[0].name} 
                          style={{ width: '50px', height: '65px', objectFit: 'cover', borderRadius: '4px' }} 
                        />
                        <div style={{ flex: 1 }}>
                          <div style={{ color: 'var(--ivory)', fontSize: '14px', fontWeight: 500 }}>{order.items[0].name}</div>
                          <div style={{ color: 'var(--muted-text)', fontSize: '12px' }}>
                            SKU: {order.items[0].sku} | Qty: {order.items[0].quantity} {order.items.length > 1 ? `+ ${order.items.length - 1} more item(s)` : ''}
                          </div>
                        </div>
                        <div style={{ color: 'var(--gold)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px' }}>
                          View Purchase Overview <ChevronRight size={16} />
                        </div>
                      </div>
                    </div>
                  )}

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '12px', borderTop: '1px solid rgba(255,255,255,0.05)', marginTop: '10px' }}>
                    <span style={{ color: 'var(--muted-text)', fontSize: '14px' }}>Total Amount</span>
                    <strong style={{ color: 'var(--gold)', fontSize: '18px' }}>₹{parseFloat(order.total_amount).toLocaleString()}</strong>
                  </div>
                </div>
              ))
            )}
          </motion.div>
        );
      case 'addresses':
        return (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2>Saved Addresses</h2>
              <button 
                className="btn-primary" 
                onClick={handleOpenAddModal}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', padding: '8px 16px' }}
              >
                <Plus size={16} /> Add New Address
              </button>
            </div>

            {addresses.length === 0 ? (
              <div className="empty-state">No addresses saved yet. Click above to add your primary delivery address.</div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                {addresses.map(addr => (
                  <div key={addr.id} className="address-card" style={{ background: 'rgba(255,255,255,0.02)', padding: '20px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ marginBottom: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <strong style={{ color: 'var(--ivory)', fontSize: '15px' }}>{addr.address_line_1}</strong>
                        {Number(addr.is_default) === 1 ? (
                          <span style={{ fontSize: '10px', background: 'var(--gold)', color: '#000', padding: '2px 6px', borderRadius: '4px', fontWeight: 700 }}>DEFAULT</span>
                        ) : null}
                      </div>
                      <div style={{ color: 'var(--muted-text)', fontSize: '13px', lineHeight: '1.6', marginBottom: '16px' }}>
                        {addr.address_line_2 && <div>{addr.address_line_2}</div>}
                        <div>{addr.city}, {addr.state} - {addr.pincode}</div>
                      </div>
                    </div>

                    {/* Action buttons: Edit, Delete, Set Default */}
                    <div style={{ display: 'flex', gap: '10px', paddingTop: '12px', borderTop: '1px solid rgba(255,255,255,0.05)', alignItems: 'center', flexWrap: 'wrap' }}>
                      <button 
                        onClick={() => handleOpenEditModal(addr)}
                        style={{ background: 'none', border: 'none', color: 'var(--gold)', cursor: 'pointer', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px', padding: 0 }}
                      >
                        <Edit3 size={14} /> Edit
                      </button>

                      <button 
                        onClick={() => handleDeleteAddress(addr.id)}
                        style={{ background: 'none', border: 'none', color: '#e74c3c', cursor: 'pointer', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px', padding: 0 }}
                      >
                        <Trash2 size={14} /> Delete
                      </button>

                      {Number(addr.is_default) !== 1 && (
                        <button 
                          onClick={() => handleSetDefaultAddress(addr.id)}
                          style={{ background: 'none', border: 'none', color: 'var(--muted-text)', cursor: 'pointer', fontSize: '12px', marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '4px', padding: 0 }}
                        >
                          <Check size={14} /> Set Default
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Add / Edit Address Modal Form */}
            {showAddressModal && (
              <div style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'rgba(0, 0, 0, 0.75)',
                backdropFilter: 'blur(4px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 9999,
                padding: '20px'
              }}>
                <div style={{
                  background: '#181818',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '16px',
                  width: '100%',
                  maxWidth: '520px',
                  padding: '30px',
                  boxShadow: '0 25px 50px rgba(0,0,0,0.5)',
                  position: 'relative'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h3 style={{ margin: 0, color: 'var(--gold)', fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <MapPin size={18} /> {editingAddrId ? 'Edit Delivery Address' : 'Add New Delivery Address'}
                    </h3>
                    <button onClick={() => setShowAddressModal(false)} style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer' }}>
                      <X size={20} />
                    </button>
                  </div>

                  {addrMsg && <div style={{ background: 'rgba(231, 76, 60, 0.1)', color: '#e74c3c', padding: '10px 14px', borderRadius: '6px', fontSize: '13px', marginBottom: '16px' }}>{addrMsg}</div>}

                  <form onSubmit={handleSaveAddressSubmit}>
                    <div className="form-group" style={{ marginBottom: '14px' }}>
                      <label style={{ display: 'block', color: 'var(--ivory)', fontSize: '12px', marginBottom: '4px' }}>Address Line 1 *</label>
                      <input 
                        type="text" 
                        value={newAddr.address_line_1}
                        onChange={e => setNewAddr(p => ({ ...p, address_line_1: e.target.value }))}
                        placeholder="House / Flat No., Street Name" 
                        required 
                        style={{ width: '100%', padding: '10px 14px', background: '#0f0f0f', border: '1px solid #333', color: '#fff', borderRadius: '6px' }}
                      />
                    </div>

                    <div className="form-group" style={{ marginBottom: '14px' }}>
                      <label style={{ display: 'block', color: 'var(--ivory)', fontSize: '12px', marginBottom: '4px' }}>Address Line 2 (Optional)</label>
                      <input 
                        type="text" 
                        value={newAddr.address_line_2}
                        onChange={e => setNewAddr(p => ({ ...p, address_line_2: e.target.value }))}
                        placeholder="Apartment, Suite, Landmark" 
                        style={{ width: '100%', padding: '10px 14px', background: '#0f0f0f', border: '1px solid #333', color: '#fff', borderRadius: '6px' }}
                      />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                      {/* State Dropdown */}
                      <div>
                        <label style={{ display: 'block', color: 'var(--ivory)', fontSize: '12px', marginBottom: '4px' }}>State *</label>
                        <select 
                          value={newAddr.state}
                          onChange={handleStateSelect}
                          required
                          style={{ width: '100%', padding: '10px 14px', background: '#0f0f0f', border: '1px solid #333', color: '#fff', borderRadius: '6px', cursor: 'pointer' }}
                        >
                          <option value="">Select State</option>
                          {statesList.map(st => (
                            <option key={st.id} value={st.name}>{st.name}</option>
                          ))}
                        </select>
                      </div>

                      {/* City Dropdown */}
                      <div>
                        <label style={{ display: 'block', color: 'var(--ivory)', fontSize: '12px', marginBottom: '4px' }}>City *</label>
                        <select 
                          value={newAddr.city}
                          onChange={e => setNewAddr(p => ({ ...p, city: e.target.value }))}
                          required
                          disabled={!newAddr.state}
                          style={{ 
                            width: '100%', 
                            padding: '10px 14px', 
                            background: '#0f0f0f', 
                            border: '1px solid #333', 
                            color: '#fff', 
                            borderRadius: '6px',
                            opacity: newAddr.state ? 1 : 0.5,
                            cursor: newAddr.state ? 'pointer' : 'not-allowed'
                          }}
                        >
                          <option value="">{newAddr.state ? (citiesList.length > 0 ? 'Select City' : 'Loading cities...') : 'Select State First'}</option>
                          {citiesList.map(ct => (
                            <option key={ct.id} value={ct.name}>{ct.name}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="form-group" style={{ marginBottom: '24px' }}>
                      <label style={{ display: 'block', color: 'var(--ivory)', fontSize: '12px', marginBottom: '4px' }}>PIN Code *</label>
                      <input 
                        type="text" 
                        value={newAddr.pincode}
                        onChange={e => setNewAddr(p => ({ ...p, pincode: e.target.value }))}
                        placeholder="e.g. 400001" 
                        required 
                        style={{ width: '100%', padding: '10px 14px', background: '#0f0f0f', border: '1px solid #333', color: '#fff', borderRadius: '6px' }}
                      />
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                      <button 
                        type="button" 
                        onClick={() => setShowAddressModal(false)}
                        className="btn-outline" 
                        style={{ padding: '10px 20px', fontSize: '13px' }}
                      >
                        Cancel
                      </button>
                      <button 
                        type="submit" 
                        disabled={addrSaving}
                        className="btn-primary" 
                        style={{ padding: '10px 24px', fontSize: '13px' }}
                      >
                        {addrSaving ? 'Saving...' : (editingAddrId ? 'Update Address' : 'Save Address')}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </motion.div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="account-page container">
      <h1>My Account</h1>
      <p className="account-subtitle">Welcome back, {user?.first_name}</p>

      <div className="account-container">
        
        {/* Sidebar */}
        <div className="account-sidebar">
          <button 
            className={`account-nav-btn ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            <div className="nav-left"><User size={18} /> Profile</div>
            {activeTab === 'profile' && <ChevronRight size={16} />}
          </button>
          
          <button 
            className={`account-nav-btn ${activeTab === 'orders' ? 'active' : ''}`}
            onClick={() => setActiveTab('orders')}
          >
            <div className="nav-left"><Package size={18} /> Orders</div>
            {activeTab === 'orders' && <ChevronRight size={16} />}
          </button>
          
          <button 
            className={`account-nav-btn ${activeTab === 'addresses' ? 'active' : ''}`}
            onClick={() => setActiveTab('addresses')}
          >
            <div className="nav-left"><MapPin size={18} /> Addresses</div>
            {activeTab === 'addresses' && <ChevronRight size={16} />}
          </button>
          
          <div style={{ margin: '20px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}></div>
          
          <button 
            className="account-nav-btn"
            onClick={() => { logout(); navigate('/auth'); }}
          >
            <div className="nav-left"><LogOut size={18} /> Logout</div>
          </button>
        </div>

        {/* Content Area */}
        <div className="account-content">
          <AnimatePresence mode="wait">
            {renderContent()}
          </AnimatePresence>
        </div>

      </div>
    </div>
  );
}
