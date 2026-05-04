import { Mail, Phone, MapPin, Facebook, Instagram, Twitter } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#000] border-t border-white/5 py-24 mt-auto">
      <div className="max-w-7xl mx-auto px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-16 mb-24">
          <div className="col-span-1 md:col-span-2">
            <h3 className="font-serif text-3xl italic text-white mb-8">ER Lifestyles</h3>
            <p className="max-w-sm text-sm font-light text-white/40 leading-relaxed mb-10">
              © 2026 Lifestyles International Holdings Corporation. All Rights Reserved.
Lifestyles is a proud member of the United States Direct Selling Association (DSA)
            </p>
            <div className="flex gap-6">
              {[Facebook, Instagram, Twitter].map((Icon, i) => (
                <a key={i} href="#" className="text-white/20 hover:text-accent transition-all transform hover:-translate-y-1">
                  <Icon size={18} />
                </a>
              ))}
            </div>
          </div>
          
          <div>
            <h4 className="mono-label !text-white/30 mb-8 lowercase">Navigation</h4>
            <ul className="space-y-4">
              {['About', 'Vault', 'Network', 'Compliance'].map((item) => (
                <li key={item}><a href="#" className="text-[10px] uppercase tracking-widest font-bold text-white/40 hover:text-white transition-colors">{item}</a></li>
              ))}
            </ul>
          </div>
          
          <div>
            <h4 className="mono-label !text-white/30 mb-8 lowercase">Contact</h4>
            <ul className="space-y-6">
              <li className="flex items-center gap-4">
                <Mail size={14} className="text-accent/40" />
                <span className="text-[10px] font-mono text-white/40 uppercase tracking-wider">ERLIFESTYLES@GMAIL.COM</span>
              </li>
              <li className="flex items-center gap-4">
                <Phone size={14} className="text-accent/40" />
                <span className="text-[10px] font-mono text-white/40 uppercase tracking-wider">+63 970 283 9443</span>
              </li>
              <li className="flex items-center gap-4">
                <MapPin size={14} className="text-accent/40" />
                <span className="text-[10px] font-mono text-white/40 uppercase tracking-wider">ASIA-SOUTHEAST-1</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex gap-2 items-center">
            <div className="w-2 h-2 rounded-full bg-accent"></div>
            <p className="text-[9px] uppercase tracking-[0.4em] font-mono font-bold text-white/20">Developed by Edgardo, Jr. B. Rojas {new Date().getFullYear()} ER Lifestyles</p>
          </div>
          <p className="text-[9px] uppercase tracking-[0.4em] font-mono font-bold text-white/10 italic">Precise • Potent • Pure</p>
        </div>
      </div>
    </footer>
  );
}
