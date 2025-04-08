import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import '../../styles/auth/Auth.css';

const UpdatePasswordForm = ({ onComplete }) => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { updatePassword } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // 入力検証
    if (!password || !confirmPassword) {
      setError('すべての項目を入力してください');
      return;
    }
    
    if (password.length < 6) {
      setError('パスワードは6文字以上で入力してください');
      return;
    }
    
    if (password !== confirmPassword) {
      setError('パスワードが一致しません');
      return;
    }
    
    try {
      setError('');
      setLoading(true);
      await updatePassword(password);
      setMessage('パスワードが正常に更新されました');
      setTimeout(() => {
        if (onComplete) onComplete();
      }, 2000);
    } catch (error) {
      setError(error.message || 'パスワードの更新に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-form-container">
      <h2>パスワードを更新</h2>
      {error && <div className="error-message">{error}</div>}
      {message && <div className="success-message">{message}</div>}
      
      <form onSubmit={handleSubmit} className="auth-form">
        <div className="form-group">
          <label htmlFor="password">新しいパスワード</label>
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
          <label htmlFor="confirmPassword">新しいパスワード（確認）</label>
          <input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>
        
        <button type="submit" className="auth-button" disabled={loading}>
          {loading ? '更新中...' : 'パスワードを更新'}
        </button>
      </form>
    </div>
  );
};

export default UpdatePasswordForm;
