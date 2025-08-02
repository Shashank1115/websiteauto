import React from 'react';

function Menu() {
  return (
    <div className="p-4 flex flex-col md:flex-row">
      <div className="w-full md:w-1/2 p-4">
        <h2 className="text-2xl font-bold text-tuscan-red mb-4">Pasta</h2>
        <ul>
          <li className="mb-2">
            Spaghetti Carbonara - Creamy, savory, and classic. $18
          </li>
          <li className="mb-2">
            Ravioli al Pesto - Delicate homemade ravioli with fresh pesto. $20
          </li>
          <li className="mb-2">
            Tagliatelle al Ragù - Rich meat sauce over perfectly cooked pasta. $16
          </li>
        </ul>
      </div>
      <div className="w-full md:w-1/2 p-4">
        <h2 className="text-2xl font-bold text-tuscan-red mb-4">Pizza</h2>
        <ul>
          <li className="mb-2">
            Margherita - Simple, classic, and always delicious. $14
          </li>
          <li className="mb-2">
            Capricciosa - A delightful mix of ham, mushrooms, and artichokes. $16
          </li>
          <li className="mb-2">
            Diavola - Spicy salami pizza for the adventurous. $15
          </li>
        </ul>
      </div>
    </div>
  );
}

export default Menu;