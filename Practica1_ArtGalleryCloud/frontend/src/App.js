import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import ProfilePage from './pages/PorfilePage';
import Gallery from './pages/gallery'
import PurchasedArt from './pages/PurchasedArt';

//import Gallery from './pages/Gallery'; // Asegúrate de importar Gallery
//import Profile from './pages/Profile'; // Asegúrate de importar Profile

// NUEVAS PÁGINAS QUE DEBERÁS CREAR
//import PurchasedArt from './pages/PurchasedArt'; // <-- Nueva página
//import EditProfile from './pages/EditProfile';   // <-- Nueva página


const App = () => {
  return (
    <Router>
      <Navbar /> {/* El Navbar siempre visible */}
      <div style={{ paddingTop: '80px' }}> {/* Agrega un padding superior a todo el contenido */}
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/porfile" element={<ProfilePage />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/PurchasedArt" element={<PurchasedArt />} />

          {/**/}
          {/* <Route path="/profile" element={<Profile />} />*/}
          {/*<Route path="/purchased-art" element={<PurchasedArt />} />*/}
          {/* <Route path="/edit-profile" element={<EditProfile />} /> */}

          {/* Si quieres una ruta para manejar usuarios no logueados que intentan acceder a rutas protegidas */}
          {/* <Route path="*" element={<p>Página no encontrada o no autorizado. Por favor, <Link to="/">inicia sesión</Link>.</p>} /> */}
        </Routes>
      </div>
    </Router>
  );
};

export default App;