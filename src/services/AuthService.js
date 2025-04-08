import { supabase } from './supabase-client';

export class AuthService {
  // 現在のユーザーを取得
  static async getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  }

  // セッション情報を取得
  static async getSession() {
    const { data: { session } } = await supabase.auth.getSession();
    return session;
  }

  // メール/パスワードでサインアップ
  static async signUp(email, password) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    
    if (error) {
      throw error;
    }
    
    return data;
  }

  // メール/パスワードでログイン
  static async signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) {
      throw error;
    }
    
    return data;
  }

  // Googleでログイン
  static async signInWithGoogle() {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/login`,
        scopes: 'email profile',
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        }
      },
    });
    
    if (error) {
      console.error('Googleログインエラー:', error);
      throw error;
    }
    
    return data;
  }

  // ログアウト
  static async signOut() {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      throw error;
    }
    
    return true;
  }

  // パスワードリセットメールを送信
  static async resetPassword(email) {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    
    if (error) {
      throw error;
    }
    
    return data;
  }

  // パスワードを更新
  static async updatePassword(password) {
    const { data, error } = await supabase.auth.updateUser({
      password,
    });
    
    if (error) {
      throw error;
    }
    
    return data;
  }

  // 認証状態の変化を監視する
  static onAuthStateChange(callback) {
    return supabase.auth.onAuthStateChange((event, session) => {
      callback(event, session);
    });
  }
}