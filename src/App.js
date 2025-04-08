import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Header from './components/common/Header';
import TodoApp from './components/TodoApp';
import AuthContainer from './components/auth/AuthContainer';
import ProtectedRoute from './components/auth/ProtectedRoute';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Header />
          <div className="app-container">
            <Routes>
              {/* トップページ (ログイン済みならTODOアプリにリダイレクト、未ログインならログインページへ) */}
              <Route 
                path="/" 
                element={
                  <ProtectedRoute>
                    <TodoApp />
                  </ProtectedRoute>
                } 
              />
              
              {/* ログインページ */}
              <Route path="/login" element={<AuthContainer />} />
              
              {/* リセットパスワードページ (tokenを含むURLのため) */}
              <Route path="/reset-password" element={<AuthContainer />} />
              
              {/* 不明なパスは全てトップページにリダイレクト */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
