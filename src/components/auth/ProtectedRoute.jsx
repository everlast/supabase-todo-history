import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

// 認証済みユーザーのみがアクセスできるルートを保護するコンポーネント
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  // 認証状態の読み込み中はローディング表示
  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading">読み込み中...</div>
      </div>
    );
  }

  // 未認証ユーザーはログインページにリダイレクト
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // 認証済みユーザーは子コンポーネントを表示
  return children;
};

export default ProtectedRoute;
