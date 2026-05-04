import React, { useState, useEffect } from 'react';
import { db, handleFirestoreError, OperationType } from '../services/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { X, CheckCircle, ArrowRight, MapPin, Truck, ShieldCheck, ShoppingCart, Crosshair } from 'lucide-react';
import { motion } from 'framer-motion';
import { useCart } from '../App';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';

// Fix for default marker icons in Leaflet with Vite
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

function LocationPicker({ position, setPosition, onPin }: { position: [number, number], setPosition: (pos: [number, number]) => void, onPin?: (lat: number, lng: number) => void }) {
  const map = useMap();
  
  useEffect(() => {
    map.invalidateSize();
    map.setView(position, map.getZoom());
  }, [map, position]);

  useMapEvents({
    click(e) {
      const newPos: [number, number] = [e.latlng.lat, e.latlng.lng];
      setPosition(newPos);
      if (onPin) onPin(newPos[0], newPos[1]);
    },
  });

  return position ? (
    <Marker position={position} />
  ) : null;
}

export default function PurchaseForm({ onClose }: { onClose: () => void }) {
  const { cart, clearCart } = useCart();
  const [formData, setFormData] = useState({ name: '', email: '', address: '', phone: '' });
  const [position, setPosition] = useState<[number, number]>([14.5995, 120.9842]); // Manila Default
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [step, setStep] = useState(1);
  const [locating, setLocating] = useState(false);
  const [searching, setSearching] = useState(false);

  // Geocoding: Search address string -> coords
  const handleAddressSearch = async () => {
    if (!formData.address) return;
    setSearching(true);
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(formData.address)}`);
      const data = await response.json();
      if (data && data.length > 0) {
        const { lat, lon } = data[0];
        setPosition([parseFloat(lat), parseFloat(lon)]);
      } else {
        alert("Location not found. Please try a more specific address or pin it manually.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSearching(false);
    }
  };

  // Reverse Geocoding: Coords -> address string
  const handleReverseGeocode = async (lat: number, lng: number) => {
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
      const data = await response.json();
      if (data && data.display_name) {
        setFormData(prev => ({ ...prev, address: data.display_name }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }

    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const newPos: [number, number] = [pos.coords.latitude, pos.coords.longitude];
        setPosition(newPos);
        handleReverseGeocode(newPos[0], newPos[1]);
        setLocating(false);
      },
      (err) => {
        console.error(err);
        alert("Unable to retrieve your location. Please pin it manually.");
        setLocating(false);
      }
    );
  };

  const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 1) {
      setStep(2);
      return;
    }
    
    setLoading(true);
    try {
      const orderData = {
        customerName: formData.name,
        customerEmail: formData.email,
        customerAddress: formData.address,
        customerPhone: formData.phone,
        coordinates: { lat: position[0], lng: position[1] },
        items: cart.map(item => ({
          productId: item.productId,
          name: item.name,
          quantity: item.quantity,
          priceAtPurchase: item.price
        })),
        totalAmount,
        status: 'pending',
        createdAt: serverTimestamp(),
      };
      
      await addDoc(collection(db, 'orders'), orderData);
      setSuccess(true);
      clearCart();
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'orders');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white p-12 max-w-sm w-full text-center relative rounded-[3rem] shadow-2xl"
         >
          <div className="w-20 h-20 bg-accent/10 text-accent rounded-full flex items-center justify-center mx-auto mb-8">
             <CheckCircle size={40} />
           </div>
          <h3 className="text-3xl font-serif font-bold mb-4 text-primary">Order Placed!</h3>
          <p className="text-slate-500 text-sm mb-10 leading-relaxed">Your health journey continues. We'll contact you at {formData.phone} for delivery confirmation.</p>
           <button 
             onClick={onClose}
             className="w-full py-4 bg-primary text-white rounded-2xl text-xs uppercase tracking-widest font-bold hover:bg-accent transition-all shadow-lg shadow-primary/20"
           >
            Perfect, continue
           </button>
         </motion.div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md overflow-y-auto">
       <div className="absolute inset-0" onClick={onClose} />
       <motion.div 
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 40, opacity: 0 }}
        className="bg-white rounded-[2rem] sm:rounded-[3rem] overflow-hidden w-full max-w-5xl relative shadow-2xl border border-border flex flex-col lg:flex-row min-h-[500px] lg:min-h-[700px] my-auto"
      >
        <button onClick={onClose} className="absolute top-4 right-4 sm:top-8 sm:right-8 p-2 sm:p-3 bg-white/80 backdrop-blur-md rounded-full shadow-lg text-slate-400 hover:text-primary transition-colors z-[210]">
          <X size={20} />
        </button>

        {/* Left Side: Summary */}
        <div className="lg:w-4/12 bg-slate-50 p-6 sm:p-10 lg:p-12 border-b lg:border-b-0 lg:border-r border-border flex flex-col">
          <div className="mb-8 lg:mb-12">
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-primary mb-2">Checkout</h2>
            <div className="flex items-center gap-2 text-accent">
              <ShieldCheck size={16} />
              <span className="text-[10px] uppercase tracking-widest font-bold">Secure Order</span>
            </div>
          </div>

          <div className="flex-1 space-y-4 lg:space-y-6 mb-8 lg:mb-12 max-h-[200px] lg:max-h-none overflow-y-auto pr-2 no-scrollbar">
            {cart.map(item => (
              <div key={item.id} className="flex justify-between items-center gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-white border border-border overflow-hidden flex-shrink-0">
                    <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-primary truncate max-w-[120px]">{item.name}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase">Qty: {item.quantity}</p>
                  </div>
                </div>
                <p className="text-xs font-bold text-slate-600">₱{(item.price * item.quantity).toLocaleString()}</p>
              </div>
            ))}
          </div>

          <div className="pt-8 border-t border-border space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-[10px] uppercase tracking-widest font-bold text-slate-400">Subtotal</span>
              <span className="text-sm font-bold text-slate-600">₱{totalAmount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[10px] uppercase tracking-widest font-bold text-slate-400">Delivery</span>
              <span className="text-sm font-bold text-accent italic">FREE</span>
            </div>
            <div className="flex justify-between items-baseline pt-4">
              <span className="text-[10px] uppercase tracking-widest font-bold text-primary">Total</span>
              <span className="text-3xl font-serif font-bold text-primary">₱{totalAmount.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Right Side: Form & Map */}
        <div className="flex-1 p-6 sm:p-10 lg:p-16">
          <div className="flex items-center gap-2 sm:gap-4 mb-8 lg:mb-10 overflow-x-auto pb-2 no-scrollbar">
            <TabStep num={1} active={step >= 1} label="Contact" />
            <div className="h-px w-4 sm:w-8 bg-border flex-shrink-0" />
            <TabStep num={2} active={step >= 2} label="Location" />
          </div>

          <form onSubmit={handleSubmit} className="h-full flex flex-col">
            {step === 1 ? (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4 sm:space-y-6 flex-1">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  <InputField label="Full Name" value={formData.name} set={(v) => setFormData({...formData, name: v})} required />
                  <InputField label="Email Address" type="email" value={formData.email} set={(v) => setFormData({...formData, email: v})} required />
                </div>
                <InputField label="Phone Number" value={formData.phone} set={(v) => setFormData({...formData, phone: v})} placeholder="09XX XXX XXXX" required />
                <div className="p-4 sm:p-6 bg-accent/5 rounded-[2rem] border border-accent/10 flex items-center gap-4">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-accent text-white rounded-full flex items-center justify-center flex-shrink-0">
                    <Truck size={16} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-accent uppercase tracking-widest mb-1">Standard Delivery</p>
                    <p className="text-[10px] text-slate-500 leading-tight">Your order will be processed by our nearest distributor within 24 hours.</p>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4 sm:space-y-6 flex-1 flex flex-col">
                <div>
                  <label className="text-[10px] uppercase tracking-wider font-bold text-slate-400 mb-2 block px-1">Delivery Address</label>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      required
                      value={formData.address}
                      onChange={(e) => setFormData({...formData, address: e.target.value})}
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddressSearch())}
                      className="flex-1 bg-slate-50 border border-border rounded-xl px-4 py-3 sm:px-6 sm:py-4 focus:border-accent outline-none text-sm transition-all"
                      placeholder="Search or type address..."
                    />
                    <button 
                      type="button" 
                      onClick={handleAddressSearch}
                      disabled={searching}
                      className="bg-primary text-white px-4 sm:px-6 rounded-xl text-[10px] uppercase font-bold tracking-widest hover:bg-accent transition-all disabled:opacity-50"
                    >
                      {searching ? '...' : 'Find'}
                    </button>
                  </div>
                </div>
                
                <div className="flex-1 min-h-[250px] sm:min-h-[300px] border border-border rounded-[1.5rem] sm:rounded-[2rem] overflow-hidden relative">
                   <div className="absolute top-2 left-2 sm:top-4 sm:left-4 z-[40] flex flex-col gap-2 max-w-[calc(100%-1rem)]">
                     <div className="bg-white/90 backdrop-blur-md px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg sm:rounded-xl border border-border shadow-sm flex items-center gap-2">
                       <MapPin size={12} className="text-accent" />
                       <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-primary">Pin exact location</span>
                     </div>
                     <button 
                       type="button"
                       onClick={handleLocateMe}
                       disabled={locating}
                       className="bg-accent text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg sm:rounded-xl shadow-lg flex items-center gap-2 text-[9px] sm:text-[10px] font-bold uppercase tracking-widest hover:scale-105 transition-transform disabled:opacity-50 w-fit"
                     >
                       {locating ? <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Crosshair size={12} />}
                       <span>{locating ? 'Locating...' : 'Use My Location'}</span>
                     </button>
                   </div>
                   <MapContainer center={position} zoom={13} scrollWheelZoom={false} style={{ height: '100%', width: '100%' }}>
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    <LocationPicker position={position} setPosition={setPosition} onPin={handleReverseGeocode} />
                  </MapContainer>
                </div>
              </motion.div>
            )}

            <div className="mt-8 sm:mt-12 flex gap-4">
              {step === 2 && (
                <button type="button" onClick={() => setStep(1)} className="px-6 sm:px-8 py-4 sm:py-5 border border-border rounded-xl sm:rounded-2xl text-[10px] sm:text-[11px] uppercase tracking-widest font-bold text-slate-500 hover:bg-slate-50 transition-all">
                  Back
                </button>
              )}
              <button 
                type="submit" 
                disabled={loading}
                className="flex-1 bg-primary text-white py-4 sm:py-5 rounded-xl sm:rounded-2xl text-[10px] sm:text-[11px] uppercase tracking-widest font-bold flex items-center justify-center gap-3 hover:bg-accent transition-all disabled:opacity-50 shadow-xl shadow-primary/20"
              >
                {loading ? 'Processing...' : (
                  <>
                    <span>{step === 1 ? 'Next' : 'Place Order'}</span>
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
}

function TabStep({ num, active, label }: { num: number, active: boolean, label: string }) {
  return (
    <div className={`flex items-center gap-3 flex-shrink-0 transition-colors ${active ? 'text-primary' : 'text-slate-300'}`}>
      <span className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold ${active ? 'bg-primary text-white' : 'bg-slate-100'}`}>{num}</span>
      <span className="text-[11px] font-bold uppercase tracking-wider">{label}</span>
    </div>
  );
}

function InputField({ label, set, value, type = 'text', required = false, placeholder = '' }: any) {
  return (
    <div>
      <label className="text-[10px] uppercase tracking-wider font-bold text-slate-400 mb-2 block px-1">{label}</label>
      <input 
        type={type}
        required={required}
        value={value}
        onChange={(e) => set(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-slate-50 border border-border rounded-xl sm:rounded-2xl px-4 py-3 sm:px-6 sm:py-4 focus:border-accent outline-none text-sm transition-all"
      />
    </div>
  );
}
