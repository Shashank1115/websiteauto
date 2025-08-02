import React from 'react';
import { Link } from 'react-router-dom';

function Navbar() {
  return (
    <nav className="bg-tuscan-brown p-4">
      <ul className="flex justify-center space-x-4">
        <li>
          <Link to="/" className="text-white hover:text-tuscan-yellow font-bold">Home</Link>
        </li>
        <li>
          <Link to="/menu" className="text-white hover:text-tuscan-yellow font-bold">Menu</Link>
        </li>
        <li>
          <Link to="/contact" className="text-white hover:text-tuscan-yellow font-bold">Contact</Link>
        </li>
      </ul>
    </nav>
  );
}

export default Navbar;