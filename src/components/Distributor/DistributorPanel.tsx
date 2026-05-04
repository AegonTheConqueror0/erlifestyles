import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, updateDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType, auth } from '../../services/firebase';
import { Order, OrderStatus } from '../../types';
import { useAuth } from '../../App';
import { Package, CheckCircle, XCircle, LogOut, MapPin, ExternalLink, Phone } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { signOut } from 'firebase/auth';

export default function DistributorPanel() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<OrderStatus | 'all'>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    if (!user) return;

    const q = collection(db, 'orders'); // Showing all for demo, usually filtered by distributor assignment

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const ordersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
      setOrders(ordersData.sort((a, b) => {
        const dateA = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
        const dateB = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
        return dateB - dateA;
      }));
      setLoading(false);
    }, (err) => {
      handleFirestoreError(err, OperationType.LIST, 'orders');
    });

    return () => unsubscribe();
  }, [user]);

  const updateOrderStatus = async (orderId: string, status: OrderStatus) => {
    try {
      await updateDoc(doc(db, 'orders', orderId), {
        status,
        updatedAt: serverTimestamp()
      });
      setSelectedOrder(prev => prev && prev.id === orderId ? { ...prev, status } : prev);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `orders/${orderId}`);
    }
  };

  const deleteOrder = async (orderId: string) => {
    if (!confirm('Are you sure you want to remove this record from history?')) return;
    try {
      await deleteDoc(doc(db, 'orders', orderId));
      setSelectedOrder(null);
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `orders/${orderId}`);
    }
  };

  const filteredOrders = orders.filter(o => filter === 'all' || o.status === filter);

  return (
    <div className="min-h-[calc(100vh-64px)] bg-bg-primary p-4 sm:p-8 lg:p-12">
      <div className="max-w-7xl mx-auto flex flex-col gap-8 lg:gap-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-border pb-6 md:pb-10 gap-6">
          <div className="text-center md:text-left">
            <span className="mono-label block text-accent mb-2">Partner Portal</span>
            <h1 className="text-3xl sm:text-5xl font-serif font-bold text-primary">My Orders</h1>
          </div>
          
          <div className="flex bg-slate-50 border border-border p-1.5 rounded-2xl h-fit overflow-x-auto no-scrollbar">
            {(['all', 'pending', 'completed', 'cancelled'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 sm:px-6 py-2 rounded-xl text-[9px] sm:text-[10px] uppercase tracking-widest font-bold transition-all whitespace-nowrap ${
                  filter === f ? 'bg-white text-primary shadow-sm' : 'text-slate-400 hover:text-primary'
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          <button 
            onClick={() => signOut(auth)}
            className="flex items-center gap-2 px-6 py-3 bg-red-50 text-red-500 rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:bg-red-100 transition-all sm:ml-auto"
          >
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
          {/* Order List */}
          <div className="lg:col-span-2 space-y-4">
            {loading ? (
              <div className="p-20 text-center text-xs uppercase tracking-widest font-bold text-accent animate-pulse">Loading orders...</div>
            ) : filteredOrders.length > 0 ? (
              filteredOrders.map((order, idx) => (
                <motion.div 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  key={order.id}
                  onClick={() => setSelectedOrder(order)}
                  className={`p-6 sm:p-8 cursor-pointer transition-all border rounded-[2rem] flex flex-col sm:flex-row items-start sm:items-center justify-between group shadow-sm hover:shadow-xl gap-4 ${
                    selectedOrder?.id === order.id ? 'bg-white border-accent ring-4 ring-accent/5' : 'bg-white border-border hover:border-accent/40'
                  }`}
                >
                  <div className="space-y-2 sm:space-y-3">
                    <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
                       <p className="font-mono text-[10px] sm:text-xs font-bold text-slate-400">ORDER #{order.id.slice(-8).toUpperCase()}</p>
                       <span className={`text-[9px] sm:text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full ${
                         order.status === 'completed' ? 'bg-accent/10 text-accent' :
                         order.status === 'cancelled' ? 'bg-red-50 text-red-400' :
                         'bg-orange-50 text-orange-500'
                       }`}>
                         {order.status}
                       </span>
                    </div>
                    <p className="text-xl font-serif font-bold text-primary">{order.customerName}</p>
                  </div>
                  <div className="text-left sm:text-right w-full sm:w-auto mt-2 sm:mt-0 pt-4 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                    <p className="text-xl sm:text-2xl font-bold text-primary mb-1">₱{order.totalAmount.toLocaleString()}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                       {order.createdAt ? (order.createdAt as any).toDate().toLocaleDateString() : 'PROCESSING'}
                    </p>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="p-24 text-center bg-bg-secondary border border-dashed border-border rounded-[3rem]">
                 <p className="text-slate-400 font-medium">No orders found in this category.</p>
              </div>
            )}
          </div>

          {/* Order Detail Panel */}
          <div className="lg:col-span-1">
            <AnimatePresence mode="wait">
              {selectedOrder ? (
                <motion.div 
                  key={selectedOrder.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="bg-white border border-border p-6 sm:p-10 rounded-[2.5rem] sm:rounded-[3rem] shadow-2xl sticky top-4 sm:top-32"
                >
                   <div className="flex justify-between items-baseline mb-6 sm:mb-10">
                      <h3 className="text-xl sm:text-2xl font-serif font-bold text-primary">Order Details</h3>
                      <button onClick={() => setSelectedOrder(null)} className="text-slate-300 hover:text-primary transition-colors">
                         <XCircle size={24} />
                      </button>
                   </div>

                   <div className="space-y-10">
                      <div className="bg-bg-secondary p-8 rounded-3xl border border-border">
                         <p className="text-[10px] uppercase tracking-widest font-bold text-accent mb-4">Customer Information</p>
                         <div className="space-y-4">
                           <div>
                              <p className="text-lg font-bold text-primary mb-1">{selectedOrder.customerName}</p>
                              <p className="text-xs font-medium text-slate-500">{selectedOrder.customerEmail}</p>
                           </div>
                           
                           <div className="flex items-start gap-3 pt-4 border-t border-slate-200">
                              <MapPin size={16} className="text-accent mt-1 flex-shrink-0" />
                              <div>
                                 <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Delivery Address</p>
                                 <p className="text-xs text-primary font-medium leading-relaxed">{selectedOrder.customerAddress}</p>
                                 {selectedOrder.coordinates && (
                                   <a 
                                     href={`https://www.google.com/maps?q=${selectedOrder.coordinates.lat},${selectedOrder.coordinates.lng}`}
                                     target="_blank"
                                     rel="noopener noreferrer"
                                     className="inline-flex items-center gap-1.5 mt-2 text-[10px] font-bold uppercase tracking-widest text-accent hover:underline"
                                   >
                                     <ExternalLink size={12} />
                                     Open in Map
                                   </a>
                                 )}
                              </div>
                           </div>

                           <div className="flex items-center gap-3 pt-4 border-t border-slate-200">
                              <Phone size={16} className="text-accent flex-shrink-0" />
                              <div>
                                 <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Contact Phone</p>
                                 <p className="text-sm text-primary font-medium">{selectedOrder.customerPhone || 'N/A'}</p>
                               </div>
                           </div>
                         </div>
                      </div>

                      <div>
                         <p className="text-[10px] uppercase tracking-widest font-bold text-accent mb-6">Line Items</p>
                         <div className="space-y-4">
                            {selectedOrder.items.map((item, i) => (
                              <div key={i} className="flex justify-between items-center bg-white border border-border p-5 rounded-2xl">
                                 <div className="flex items-center gap-4">
                                    <div className="w-8 h-8 bg-accent/10 rounded-full flex items-center justify-center text-xs font-bold text-accent">
                                       {item.quantity}
                                    </div>
                                    <span className="text-xs font-bold text-primary uppercase tracking-tight">{item.name}</span>
                                 </div>
                                 <span className="text-xs font-bold text-slate-400">₱{(item.priceAtPurchase * item.quantity).toLocaleString()}</span>
                              </div>
                            ))}
                         </div>
                      </div>

                      <div className="pt-8 border-t border-border flex justify-between items-baseline">
                         <span className="text-xs uppercase tracking-widest font-bold text-slate-400">Total Settlement</span>
                         <span className="text-2xl font-bold text-accent">₱{selectedOrder.totalAmount.toLocaleString()}</span>
                      </div>

                      <div className="flex flex-col gap-4 mt-10">
                         <button 
                           onClick={() => updateOrderStatus(selectedOrder.id, 'completed')}
                           disabled={selectedOrder.status === 'completed'}
                           className={`flex items-center justify-center gap-3 py-5 bg-primary text-white rounded-2xl text-xs uppercase tracking-widest font-bold hover:bg-accent transition-all disabled:opacity-20 shadow-xl shadow-primary/20`}
                         >
                            <CheckCircle size={18} />
                            <span>Mark as Completed</span>
                         </button>
                         <button 
                           onClick={() => updateOrderStatus(selectedOrder.id, 'cancelled')}
                           disabled={selectedOrder.status === 'cancelled'}
                           className={`py-4 bg-red-50 text-red-500 hover:bg-red-100 rounded-2xl text-[10px] uppercase tracking-widest font-bold transition-all disabled:opacity-20`}
                         >
                            <span>Cancel Order</span>
                         </button>
                         <button 
                           onClick={() => deleteOrder(selectedOrder.id)}
                           className="py-4 mt-2 bg-slate-50 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-2xl text-[10px] uppercase tracking-widest font-bold transition-all flex items-center justify-center gap-2"
                         >
                            <XCircle size={14} />
                            <span>Delete Record</span>
                         </button>
                      </div>
                   </div>
                </motion.div>
              ) : (
                <div className="bg-bg-secondary border border-dashed border-border rounded-[3rem] p-20 flex flex-col items-center justify-center text-center">
                   <Package size={48} className="text-slate-200 mb-8" />
                   <p className="text-xs uppercase tracking-widest text-slate-400 font-bold leading-relaxed max-w-[150px]">Select an order to view and process</p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
