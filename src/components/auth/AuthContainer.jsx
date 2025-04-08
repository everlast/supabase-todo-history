import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Link } from 'react-router-dom';
import LoginForm from './LoginForm';
import SignUpForm from './SignUpForm';
import ResetPasswordForm from './ResetPasswordForm';
import UpdatePasswordForm from './UpdatePasswordForm';
import '../../styles/auth/Auth.css';

const AuthContainer = () => {
  const [formType, setFormType] = useState('login');
  const { user } = useAuth();
  
  // URLハッシュの確認（パスワードリセットリンクからの遷移）
  useEffect(() => {
    const hash = window.location.hash;
    
    if (hash.includes('type=recovery')) {
      setFormType('update_password');
    }
  }, []);
  
  // 各フォームへの切り替え処理
  const renderForm = () => {
    switch (formType) {
      case 'login':
        return (
          <LoginForm 
            onSwitchToSignUp={() => setFormType('signup')}
            onSwitchToReset={() => setFormType('reset')}
          />
        );
      case 'signup':
        return (
          <SignUpForm 
            onSwitchToLogin={() => setFormType('login')}
          />
        );
      case 'reset':
        return (
          <ResetPasswordForm 
            onSwitchToLogin={() => setFormType('login')}
          />
        );
      case 'update_password':
        return (
          <UpdatePasswordForm 
            onComplete={() => setFormType('login')}
          />
        );
      default:
        return (
          <LoginForm 
            onSwitchToSignUp={() => setFormType('signup')}
            onSwitchToReset={() => setFormType('reset')}
          />
        );
    }
  };
  
  // 既にログインしている場合のメッセージとトップページへのリンク
  if (user) {
    return (
      <div className="auth-form-container">
        <h2>ログイン済み</h2>
        <p>すでにログインしています。</p>
        <div className="auth-actions">
          <Link to="/" className="primary-button">
            TODOリストへ移動
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <div className="auth-container">
      {renderForm()}
    </div>
  );
};

export default AuthContainer;