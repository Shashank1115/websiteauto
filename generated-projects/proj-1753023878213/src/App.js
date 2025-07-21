import React, { useState } from 'react';
import './App.css';

function App() {
  const [isloginOpen, setIsLoginOpen] = useState(false);

  const productData = [
    { name: 'Product 1', price: '$29.99', image: 'https://placehold.co/600x400' },
    { name: 'Product 2', price: '$49.99', image: 'https://placehold.co/600x400' },
    { name: 'Product 3', price: '$79.99', image: 'https://placehold.co/600x400' },
    { name: 'Product 4', price: '$99.99', image: 'https://placehold.co/600x400' },
  ];

  return (
    <div className="app">
      <header>
        <h1>Urban Vogue</h1>
        <nav>
          <a href="#">New Arrivals</a>
          <a href="#">Men</a>
          <a href="#">Women</a>
          <button onClick={() => setIsLoginOpen(true)}>Login</button>
        </nav>
      </header>
      <main>
        <div className="product-grid">
          {productData.map((product, index) => (
            <div className="product-card" key={index}>
              <img src={product.image} alt={product.name} />
              <h3>{product.name}</h3>
              <p>{product.price}</p>
            </div>
          ))}
        </div>
      </main>
      {isloginOpen && (
        <div className="login-form">
          <h2>Login to Your Account</h2>
          <form>
            <input type="email" placeholder="Email Address" required />
            <input type="password" placeholder="Password" required />
            <button type="submit">Sign In</button>
          </form>
          <button onClick={() => setIsLoginOpen(false)}>Close</button>
        </div>
      )}
      <footer>
        <p>&copy; 2023 Urban Vogue. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default App;
