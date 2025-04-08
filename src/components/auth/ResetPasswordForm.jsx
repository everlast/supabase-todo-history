import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import '../../styles/auth/Auth.css';

const ResetPasswordForm = ({ onSwitchToLogin }) => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { resetPassword } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email) {
      setError('メールアドレスを入力してください');
      return;
    }
    
    try {
      setError('');
      setLoading(true);
      await resetPassword(email);
      setMessage('パスワードリセットのためのメールを送信しました。メールをご確認ください。');
    } catch (error) {
      setError(error.message || 'パスワードのリセットに失敗しました');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-form-container">
      <h2>パスワードをリセット</h2>
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
        
        <button type="submit" className="auth-button" disabled={loading}>
          {loading ? '送信中...' : 'リセットメールを送信'}
        </button>
      </form>
      
      <div className="auth-switch">
        <button onClick={onSwitchToLogin} className="text-button">
          ログインに戻る
        </button>
      </div>
    </div>
  );
};

export default ResetPasswordForm;
