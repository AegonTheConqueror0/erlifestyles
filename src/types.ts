import { Timestamp } from 'firebase/firestore';

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  healthBenefits: string;
  stock: number;
  imageUrl: string;
  category: string;
}

export interface CartItem {
  id: string;
  productId: string;
  name: string;
  quantity: number;
  price: number;
  imageUrl: string;
}

export interface OrderItem {
  productId: string;
  name: string;
  quantity: number;
  priceAtPurchase: number;
}

export type OrderStatus = 'pending' | 'completed' | 'cancelled';

export interface Order {
  id: string;
  customerEmail: string;
  customerName: string;
  customerAddress: string;
  customerPhone?: string;
  coordinates?: { lat: number; lng: number };
  items: OrderItem[];
  totalAmount: number;
  status: OrderStatus;
  distributorId?: string;
  createdAt: Timestamp;
  updatedAt?: Timestamp;
}

export interface Distributor {
  uid: string;
  name: string;
  email: string;
  status: 'active' | 'inactive';
  createdAt: Timestamp;
}

export interface Admin {
  uid: string;
  email: string;
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  text: string;
  imageUrl: string;
  rating: number;
  createdAt: Timestamp;
}

export type UserRole = 'customer' | 'distributor' | 'admin';

export interface AuthState {
  user: any | null;
  role: UserRole;
  loading: boolean;
}
