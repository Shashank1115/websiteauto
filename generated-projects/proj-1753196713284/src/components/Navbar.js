import { Link } from 'react-router-dom';

function Navbar() {
  return (
    <nav className="bg-gray-800 p-4">
      <ul className="flex justify-center">
        <li className="mx-4">
          <Link to="/" className="hover:underline">Home</Link>
        </li>
        <li className="mx-4">
          <Link to="/speakers" className="hover:underline">Speakers</Link>
        </li>
        <li className="mx-4">
          <Link to="/schedule" className="hover:underline">Schedule</Link>
        </li>
      </ul>
    </nav>
  );
}

export default Navbar;