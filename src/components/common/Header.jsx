import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import '../../styles/common/Header.css';

const Header = () => {
  const { user, signOut } = useAuth();

  // ユーザー名を取得（メールアドレスやカスタム名）
  const getUserName = () => {
    if (user) {
      // ユーザーが設定した名前があれば表示
      if (user.user_metadata && user.user_metadata.full_name) {
        return user.user_metadata.full_name;
      }
      // なければメールアドレスを表示（＠より前の部分のみ）
      if (user.email) {
        return user.email.split('@')[0];
      }
      // どちらもなければID表示
      return user.id.substring(0, 8) + '...';
    }
    return '';
  };

  return (
    <header className="app-header">
      <div className="header-title">
        <h1>TODOアプリ</h1>
      </div>
      
      <div className="header-actions">
        {user ? (
          <div className="user-info">
            <span className="user-name">{getUserName()}</span>
            <button className="logout-button" onClick={signOut}>
              ログアウト
            </button>
          </div>
        ) : (
          <div className="auth-actions">
            <a href="/login" className="login-button">ログイン</a>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
