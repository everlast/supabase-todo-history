import { supabase } from './supabase-client';

export class CategoryService {
  // ユーザーのすべてのカテゴリを取得
  static async getAllCategories() {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) throw new Error('ログインが必要です');
    
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('user_id', user.id)
      .order('name', { ascending: true });

    if (error) {
      console.error('カテゴリの取得中にエラーが発生しました:', error);
      throw error;
    }
    
    return data || [];
  }

  // 新しいカテゴリを作成
  static async createCategory(name, color = '#3498db') {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) throw new Error('ログインが必要です');
    
    const { data, error } = await supabase
      .from('categories')
      .insert([{ name, color, user_id: user.id }])
      .select();

    if (error) {
      console.error('カテゴリの作成中にエラーが発生しました:', error);
      throw error;
    }
    
    return data[0];
  }

  // カテゴリを更新
  static async updateCategory(id, updates) {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) throw new Error('ログインが必要です');
    
    const { data, error } = await supabase
      .from('categories')
      .update(updates)
      .eq('id', id)
      .eq('user_id', user.id)
      .select();

    if (error) {
      console.error('カテゴリの更新中にエラーが発生しました:', error);
      throw error;
    }
    
    return data[0];
  }

  // カテゴリを削除
  static async deleteCategory(id) {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) throw new Error('ログインが必要です');
    
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      console.error('カテゴリの削除中にエラーが発生しました:', error);
      throw error;
    }
    
    return true;
  }
}