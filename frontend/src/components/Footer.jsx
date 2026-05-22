import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-charcoal text-gray-300 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          <div className="md:col-span-1">
            <h2 className="font-display text-3xl font-bold text-white mb-4">
              LUXE<span className="text-primary-400">.</span>
            </h2>
            <p className="text-sm leading-relaxed text-gray-400">
              Curated fashion for the modern wardrobe. Quality pieces, timeless style.
            </p>
          </div>
          <div>
            <h4 className="text-white font-medium mb-4 text-sm tracking-widest uppercase">Shop</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/shop?category=men" className="hover:text-white transition-colors">Men</Link></li>
              <li><Link to="/shop?category=women" className="hover:text-white transition-colors">Women</Link></li>
              <li><Link to="/shop?category=kids" className="hover:text-white transition-colors">Kids</Link></li>
              <li><Link to="/shop?category=accessories" className="hover:text-white transition-colors">Accessories</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-medium mb-4 text-sm tracking-widest uppercase">Help</h4>
            <ul className="space-y-2 text-sm">
              <li><span className="hover:text-white cursor-pointer transition-colors">Size Guide</span></li>
              <li><span className="hover:text-white cursor-pointer transition-colors">Returns</span></li>
              <li><span className="hover:text-white cursor-pointer transition-colors">Shipping Info</span></li>
              <li><span className="hover:text-white cursor-pointer transition-colors">Contact Us</span></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-medium mb-4 text-sm tracking-widest uppercase">Newsletter</h4>
            <p className="text-sm text-gray-400 mb-3">Get exclusive deals and style updates.</p>
            <div className="flex">
              <input type="email" placeholder="your@email.com" className="flex-1 bg-white/10 border border-white/20 px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-primary-400"/>
              <button className="bg-primary-500 text-white px-4 py-2 text-sm hover:bg-primary-600 transition-colors">→</button>
            </div>
          </div>
        </div>
        <div className="border-t border-white/10 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-gray-500">© 2024 LUXE. All rights reserved.</p>
          <p className="text-xs text-gray-500">Built with MERN Stack + Tailwind CSS</p>
        </div>
      </div>
    </footer>
  );
}