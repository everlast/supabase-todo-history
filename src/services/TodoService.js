import { supabase } from './supabase-client';

export class TodoService {
  // 全てのTODOを取得
  static async getAllTodos() {
    const { data, error } = await supabase
      .from('todos')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('TODOの取得中にエラーが発生しました:', error);
      throw error;
    }
    
    return data;
  }

  // 新しいTODOを作成
  static async createTodo(title, description = '') {
    const { data, error } = await supabase
      .from('todos')
      .insert([{ title, description }])
      .select();

    if (error) {
      console.error('TODOの作成中にエラーが発生しました:', error);
      throw error;
    }
    
    return data[0];
  }

  // TODOを更新
  static async updateTodo(id, updates) {
    const { data, error } = await supabase
      .from('todos')
      .update(updates)
      .eq('id', id)
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
    const { error } = await supabase
      .from('todos')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('TODOの削除中にエラーが発生しました:', error);
      throw error;
    }
    
    return true;
  }

  // TODOの履歴を取得
  static async getTodoHistory(todoId) {
    const { data, error } = await supabase
      .from('todo_history')
      .select('*')
      .eq('todo_id', todoId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('履歴の取得中にエラーが発生しました:', error);
      throw error;
    }
    
    return data;
  }

  // すべてのTODO履歴を取得
  static async getAllHistory() {
    const { data, error } = await supabase
      .from('todo_history')
      .select(`
        *,
        todos:todo_id (title)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('全履歴の取得中にエラーが発生しました:', error);
      throw error;
    }
    
    return data;
  }
}
