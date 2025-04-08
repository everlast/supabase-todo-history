import React, { createContext, useState, useEffect, useContext } from 'react';
import { AuthService } from '../services/AuthService';

// 認証コンテキストの作成
export const AuthContext = createContext();

// 認証プロバイダーコンポーネント
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 初期認証状態を取得する
    const initAuth = async () => {
      try {
        const session = await AuthService.getSession();
        
        if (session) {
          setSession(session);
          setUser(session.user);
        }
      } catch (error) {
        console.error('認証初期化エラー:', error);
      } finally {
        setLoading(false);
      }
    };

    initAuth();

    // 認証状態変更のリスナーを設定
    const { data: authListener } = AuthService.onAuthStateChange((event, newSession) => {
      setSession(newSession);
      setUser(newSession?.user || null);
      setLoading(false);
    });

    // クリーンアップ関数
    return () => {
      if (authListener && authListener.subscription) {
        authListener.subscription.unsubscribe();
      }
    };
  }, []);

  // サインアップ処理
  const signUp = async (email, password) => {
    try {
      setLoading(true);
      const { user, session } = await AuthService.signUp(email, password);
      return { user, session };
    } finally {
      setLoading(false);
    }
  };

  // サインイン処理
  const signIn = async (email, password) => {
    try {
      setLoading(true);
      const { user, session } = await AuthService.signIn(email, password);
      return { user, session };
    } finally {
      setLoading(false);
    }
  };

  // Googleでサインイン処理
  const signInWithGoogle = async () => {
    try {
      setLoading(true);
      return await AuthService.signInWithGoogle();
    } finally {
      setLoading(false);
    }
  };

  // サインアウト処理
  const signOut = async () => {
    try {
      setLoading(true);
      await AuthService.signOut();
      setUser(null);
      setSession(null);
    } finally {
      setLoading(false);
    }
  };

  // パスワードリセット
  const resetPassword = async (email) => {
    try {
      setLoading(true);
      return await AuthService.resetPassword(email);
    } finally {
      setLoading(false);
    }
  };

  // パスワード更新
  const updatePassword = async (password) => {
    try {
      setLoading(true);
      return await AuthService.updatePassword(password);
    } finally {
      setLoading(false);
    }
  };

  // コンテキスト値
  const value = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
    resetPassword,
    updatePassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// 認証コンテキストを使用するためのカスタムフック
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
