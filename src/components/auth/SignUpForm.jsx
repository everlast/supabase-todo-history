import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import '../../styles/auth/Auth.css';

const SignUpForm = ({ onSwitchToLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  
  const { signUp, signInWithGoogle } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // 入力検証
    if (!email || !password || !confirmPassword) {
      setError('すべての項目を入力してください');
      return;
    }
    
    if (password !== confirmPassword) {
      setError('パスワードが一致しません');
      return;
    }
    
    if (password.length < 6) {
      setError('パスワードは6文字以上で入力してください');
      return;
    }
    
    try {
      setError('');
      setLoading(true);
      await signUp(email, password);
      setMessage('登録が完了しました。確認メールを送信しましたのでご確認ください。');
    } catch (error) {
      setError(error.message || 'アカウント作成に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setError('');
      setLoading(true);
      await signInWithGoogle();
    } catch (error) {
      setError(error.message || 'Googleログインに失敗しました');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-form-container">
      <h2>アカウント作成</h2>
      {error && <div className="error-message">{error}</div>}
      {message && <div className="success-message">{message}</div>}
      
      <form onSubmit={handleSubmit} className="auth-form">
        <div className="form-group">
          <label htmlFor="email">メールアドレス</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="password">パスワード</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <small>6文字以上で入力してください</small>
        </div>
        
        <div className="form-group">
          <label htmlFor="confirmPassword">パスワード（確認）</label>
          <input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>
        
        <button type="submit" className="auth-button" disabled={loading}>
          {loading ? '登録中...' : 'アカウント作成'}
        </button>
      </form>
      
      <div className="auth-divider">または</div>
      
      <button 
        onClick={handleGoogleSignIn} 
        className="google-button"
        disabled={loading}
      >
        Googleで登録
      </button>
      
      <div className="auth-switch">
        すでにアカウントをお持ちですか？
        <button onClick={onSwitchToLogin} className="text-button">
          ログイン
        </button>
      </div>
    </div>
  );
};

export default SignUpForm;
