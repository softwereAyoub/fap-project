import React from 'react';
import './index.css';
import {BrowserRouter , Routes, Route} from 'react-router-dom';
import Login from './login/login';
import Etech from './Etech';
import ProtectedRoute from './ProtectedRoute';
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/app" element={<ProtectedRoute><Etech /></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  )
}
