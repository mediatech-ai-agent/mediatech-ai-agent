import { Route, Routes } from 'react-router-dom';
import Home from './app/Home';
import Admin from './app/Admin';
import CommonLayout from './shared/components/CommonLayout.tsx';
import './App.css';

function App() {
  return (
    <Routes>
      <Route path="/" element={<CommonLayout />}>
        <Route index element={<Home />} />
        <Route path="/admin" element={<Admin />} />
      </Route>
    </Routes>
  );
}

export default App;
