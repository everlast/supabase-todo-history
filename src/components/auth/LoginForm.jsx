import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import '../../styles/auth/Auth.css';

const LoginForm = ({ onSwitchToSignUp, onSwitchToReset }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { signIn, signInWithGoogle } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // 入力検証
    if (!email || !password) {
      setError('メールアドレスとパスワードを入力してください');
      return;
    }
    
    try {
      setError('');
      setLoading(true);
      await signIn(email, password);
    } catch (error) {
      setError(error.message || 'ログインに失敗しました');
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
      <h2>ログイン</h2>
      {error && <div className="error-message">{error}</div>}
      
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
        </div>
        
        <button type="submit" className="auth-button" disabled={loading}>
          {loading ? 'ログイン中...' : 'ログイン'}
        </button>
      </form>
      
      <div className="auth-divider">または</div>
      
      <button 
        onClick={handleGoogleSignIn} 
        className="google-button"
        disabled={loading}
      >
        Googleでログイン
      </button>
      
      <div className="auth-links">
        <button onClick={onSwitchToReset} className="text-button">
          パスワードをお忘れですか？
        </button>
        <div className="auth-switch">
          アカウントをお持ちでないですか？
          <button onClick={onSwitchToSignUp} className="text-button">
            新規登録
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
