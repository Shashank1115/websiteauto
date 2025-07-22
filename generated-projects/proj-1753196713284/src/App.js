import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Speakers from './pages/Speakers';
import Schedule from './pages/Schedule';
import Navbar from './components/Navbar';

function App() {
  return (
    <BrowserRouter>
      <div className='flex flex-col min-h-screen'>
        <Navbar/>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/speakers" element={<Speakers />} />
          <Route path="/schedule" element={<Schedule />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;