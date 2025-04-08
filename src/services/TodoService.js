import { supabase } from './supabase-client';

export class TodoService {
  // 現在のユーザーのすべてのTODOを取得
  static async getAllTodos() {
    const { data: { user } } = await supabase.auth.getUser();
    
    const { data, error } = await supabase
      .from('todos')
      .select('*')
      .eq('user_id', user?.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('TODOの取得中にエラーが発生しました:', error);
      throw error;
    }
    
    return data || [];
  }

  // 期限日が近いTODOを取得（通知機能用）
  static async getDueSoonTodos() {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) throw new Error('ログインが必要です');
    
    // 今日の日付
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // 3日後の日付
    const threeDaysLater = new Date(today);
    threeDaysLater.setDate(today.getDate() + 3);
    threeDaysLater.setHours(23, 59, 59, 999);
    
    const { data, error } = await supabase
      .from('todos')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_completed', false)
      .gte('due_date', today.toISOString())
      .lte('due_date', threeDaysLater.toISOString())
      .order('due_date', { ascending: true });

    if (error) {
      console.error('期限日が近いTODOの取得中にエラーが発生しました:', error);
      throw error;
    }
    
    return data || [];
  }

  // 期限切れのTODOを取得
  static async getOverdueTodos() {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) throw new Error('ログインが必要です');
    
    // 今日の日付
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const { data, error } = await supabase
      .from('todos')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_completed', false)
      .lt('due_date', today.toISOString())
      .order('due_date', { ascending: true });

    if (error) {
      console.error('期限切れのTODOの取得中にエラーが発生しました:', error);
      throw error;
    }
    
    return data || [];
  }

  // 新しいTODOを作成
  static async createTodo(title, description = '', dueDate = null) {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) throw new Error('ログインが必要です');
    
    const { data, error } = await supabase
      .from('todos')
      .insert([{ 
        title, 
        description,
        due_date: dueDate,
        user_id: user.id 
      }])
      .select();

    if (error) {
      console.error('TODOの作成中にエラーが発生しました:', error);
      throw error;
    }
    
    return data[0];
  }

  // TODOを更新
  static async updateTodo(id, updates) {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) throw new Error('ログインが必要です');
    
    const { data, error } = await supabase
      .from('todos')
      .update(updates)
      .eq('id', id)
      .eq('user_id', user.id) // ユーザーIDに基づいて権限確認
      .select();

    if (error) {
      console.error('TODOの更新中にエラーが発生しました:', error);
      throw error;
    }
    
    return data[0];
  }

  // TODOを完了/未完了に切り替え
  static async toggleTodoCompletion(id, isCompleted) {
    return await this.updateTodo(id, { is_completed: isCompleted });
  }

  // TODOを削除
  static async deleteTodo(id) {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) throw new Error('ログインが必要です');
    
    const { error } = await supabase
      .from('todos')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id); // ユーザーIDに基づいて権限確認

    if (error) {
      console.error('TODOの削除中にエラーが発生しました:', error);
      throw error;
    }
    
    return true;
  }

  // 特定のTODOの履歴を取得
  static async getTodoHistory(todoId) {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) throw new Error('ログインが必要です');
    
    // まずTODOがユーザーのものか確認
    const { data: todoData } = await supabase
      .from('todos')
      .select('id')
      .eq('id', todoId)
      .eq('user_id', user.id)
      .single();
      
    if (!todoData) throw new Error('そのTODOにアクセスする権限がありません');
    
    const { data, error } = await supabase
      .from('todo_history')
      .select('*')
      .eq('todo_id', todoId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('履歴の取得中にエラーが発生しました:', error);
      throw error;
    }
    
    return data || [];
  }

  // 現在のユーザーのすべてのTODO履歴を取得
  static async getAllHistory() {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) throw new Error('ログインが必要です');
    
    const { data, error } = await supabase
      .from('todo_history')
      .select(`
        *,
        todos:todo_id (title, user_id)
      `)
      .eq('todos.user_id', user.id) // 現在のユーザーのTODOの履歴のみ取得
      .order('created_at', { ascending: false });

    if (error) {
      console.error('全履歴の取得中にエラーが発生しました:', error);
      throw error;
    }
    
    return data || [];
  }
}