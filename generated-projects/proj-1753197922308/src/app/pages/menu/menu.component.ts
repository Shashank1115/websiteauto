import { Component } from '@angular/core';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.css']
})
export class MenuComponent {
  pastaDishes = [
    { name: 'Spaghetti Carbonara', description: 'Classic Roman pasta dish with guanciale, egg, pecorino romano, and black pepper.', price: '$18' },
    { name: 'Tagliatelle al Ragù', description: 'Rich and flavorful pasta with slow-cooked meat ragu.', price: '$20' },
    { name: 'Pappardelle with Wild Mushroom Ragu', description: 'Delicate pasta with earthy wild mushrooms in a creamy sauce.', price: '$22' }
  ];

pizzaDishes = [
    { name: 'Margherita Pizza', description: 'Traditional Neapolitan pizza with San Marzano tomatoes, mozzarella, and basil.', price: '$15' },
    { name: 'Diavola Pizza', description: 'Spicy pizza with salami, mozzarella, and chili flakes.', price: '$17' },
    { name: 'Quattro Formaggi Pizza', description: 'Four cheese pizza with mozzarella, gorgonzola, parmesan, and ricotta.', price: '$19' }
  ];
}
