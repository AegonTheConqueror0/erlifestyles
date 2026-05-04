import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../services/firebase';
import { Product, Testimonial } from '../types';
import { motion } from 'framer-motion';
import { Leaf, ShieldCheck, Truck, Star, Quote } from 'lucide-react';
import ProductCard from './ProductCard';

const instrabotImage = new URL('../lib/instrabot.png', import.meta.url).href;

export default function LandingPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingTestimonials, setLoadingTestimonials] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const categories = ['All', 'Supplements', 'Vitamins', 'Energy Drinks', 'Essentials'];

  useEffect(() => {
    const q = query(collection(db, 'products'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setProducts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product)));
      setLoading(false);
    });

    const qt = query(collection(db, 'testimonials'), orderBy('createdAt', 'desc'));
    const unsubTestimonials = onSnapshot(qt, (snapshot) => {
      setTestimonials(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Testimonial)));
      setLoadingTestimonials(false);
    });

    return () => {
      unsubscribe();
      unsubTestimonials();
    };
  }, []);

  const filteredProducts = selectedCategory === 'All' 
    ? products 
    : products.filter(p => p.category === selectedCategory);

  return (
    <div className="flex flex-col min-h-screen bg-bg-primary">
      {/* Hero Section */}
      <section className="relative bg-bg-secondary py-24 lg:py-40 overflow-hidden border-b border-border">
        <div className="max-w-7xl mx-auto px-8 relative z-10 flex flex-col md:flex-row items-center justify-between gap-12">
          <div className="max-w-2xl text-center md:text-left">
            <motion.span 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-xs uppercase tracking-[0.3em] text-accent font-bold mb-6 block"
            >
              Lifestyles
            </motion.span>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl sm:text-6xl lg:text-8xl font-serif font-bold leading-tight text-primary mb-8"
            >
              Live Better. <br /> <span className="text-accent italic">Every Day.</span>
            </motion.h1>
            <p className="text-base sm:text-lg font-light text-slate-500 leading-relaxed mb-10 max-w-lg">
              Intra is a pleasant tasting, proprietary formulation of 23 time-tested and trusted botanical extracts that provide the body with antioxidants, flavonoids, lignins, polysaccharides and other nutrients specific to each herbal extract.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
              <button 
                onClick={() => document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' })} 
                className="px-10 py-4 bg-primary text-white rounded-full text-xs uppercase tracking-widest font-bold hover:bg-accent transition-all shadow-xl shadow-primary/20"
              >
                Shop Our Collection
              </button>
              <button
                onClick={() => window.open('https://www.lifestyles.net/ca-en/pr_intra.php', '_blank')}
                className="px-10 py-4 border border-border text-primary rounded-full text-xs uppercase tracking-widest font-bold hover:bg-slate-50 transition-all font-sans"
              >
                Learn More
              </button>
            </div>
          </div>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative hidden lg:block"
          >
            <div className="w-[400px] h-[500px] rounded-[3rem] overflow-hidden shadow-2xl relative border-8 border-white">
              <img 
                src={instrabotImage} 
                alt="Healthy Lifestyle"
                className="w-full h-full object-cover"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Bar */}
      <section className="py-16 bg-white border-b border-border">
        <div className="max-w-7xl mx-auto px-8">
          <div className="grid md:grid-cols-3 gap-12">
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-accent/10 text-accent rounded-2xl flex items-center justify-center mb-6">
                <Leaf size={24} />
              </div>
              <h3 className="text-sm uppercase tracking-widest font-bold mb-4">Pure Ingredients</h3>
              <p className="text-xs text-slate-500 leading-relaxed max-w-xs"> liquid herbal blend of 23 botanicals like Aloe Vera, Ginseng, and Dandelion Root, mixed with pear juice and sweeteners.</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-accent/10 text-accent rounded-2xl flex items-center justify-center mb-6">
                <ShieldCheck size={24} />
              </div>
              <h3 className="text-sm uppercase tracking-widest font-bold mb-4">Trusted Quality</h3>
              <p className="text-xs text-slate-500 leading-relaxed max-w-xs">Informed Choice / BSCG Certified Drug Free: Screens for prohibited substances and contaminants, providing high assurance for safety and compliance.</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-accent/10 text-accent rounded-2xl flex items-center justify-center mb-6">
                <Truck size={24} />
              </div>
              <h3 className="text-sm uppercase tracking-widest font-bold mb-4">Reliable Care</h3>
              <p className="text-xs text-slate-500 leading-relaxed max-w-xs">Fast, safe delivery managed by specialists who care about your wellness journey.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Product List */}
      <section id="products" className="py-32 px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col mb-20 gap-8">
            <div className="flex flex-col md:flex-row items-baseline justify-between gap-6">
              <div>
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-primary mb-2">Our <span className="text-accent italic">Essentials</span></h2>
                <p className="text-slate-500 text-xs sm:text-sm">Specially selected for your daily wellness need</p>
              </div>
              <span className="text-[10px] uppercase tracking-widest font-bold text-accent bg-accent/10 px-4 py-2 rounded-full w-fit">{filteredProducts.length} Products Found</span>
            </div>

            <div className="flex flex-wrap gap-2">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-wider transition-all ${
                    selectedCategory === cat 
                      ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-105' 
                      : 'bg-white border border-border text-slate-400 hover:border-accent hover:text-accent'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
          
          {loading ? (
            <div className="flex justify-center p-20 text-xs uppercase tracking-widest font-bold text-accent animate-pulse">Loading Wellness Vault...</div>
          ) : filteredProducts.length > 0 ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6 lg:gap-8">
              {filteredProducts.map((product, idx) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  viewport={{ once: true }}
                >
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center p-24 border border-dashed border-border rounded-[3rem] bg-slate-50">
              <p className="text-slate-400 font-medium italic">No products found in the "{selectedCategory}" category.</p>
            </div>
          )}
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 bg-bg-secondary border-y border-border">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
             <span className="text-[10px] uppercase tracking-[0.3em] text-accent font-bold mb-3 block">Voices of Wellness</span>
             <h2 className="text-3xl lg:text-4xl font-serif font-bold text-primary">Community <span className="text-accent italic">Stories</span></h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {testimonials.map((t, idx) => (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                viewport={{ once: true }}
                className="bg-white p-6 rounded-[2rem] border border-border shadow-sm hover:shadow-xl transition-all relative group overflow-hidden"
              >
                <div className="absolute -top-2 -right-2 text-slate-50 group-hover:text-accent/5 transition-colors">
                  <Quote size={80} fill="currentColor" />
                </div>
                
                <div className="relative z-10 flex flex-col h-full">
                  <div className="flex gap-1 mb-4 text-accent">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={12} fill={i < t.rating ? "currentColor" : "none"} className={i < t.rating ? "" : "text-slate-100"} />
                    ))}
                  </div>

                  <p className="text-slate-500 font-light text-sm leading-relaxed mb-6 italic">
                    "{t.text}"
                  </p>

                  <div className="mt-auto flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl overflow-hidden border border-slate-100 shadow-sm flex-shrink-0">
                      <img src={t.imageUrl} alt={t.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-primary uppercase tracking-wider truncate">{t.name}</h4>
                      <p className="text-[9px] font-bold text-accent uppercase tracking-widest truncate">{t.role}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
          
          {testimonials.length === 0 && !loadingTestimonials && (
             <div className="text-center py-12 opacity-30">
                <p className="text-xs font-serif italic text-primary uppercase tracking-widest">Awaiting our first community story...</p>
             </div>
          )}
        </div>
      </section>
    </div>
  );
}
