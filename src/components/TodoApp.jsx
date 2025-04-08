import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { TodoService } from '../services/TodoService';
import TodoForm from './TodoForm';
import TodoList from './TodoList';
import TodoHistory from './TodoHistory';
import '../styles/TodoApp.css';

function TodoApp() {
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('todos'); // 'todos' または 'history'
  const [history, setHistory] = useState([]);
  const [selectedTodoId, setSelectedTodoId] = useState(null);
  const [error, setError] = useState('');
  
  // 認証コンテキストから現在のユーザーを取得
  const { user } = useAuth();

  // 初期データの読み込み
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError('');
        
        // ユーザーのTODOを取得
        const todoData = await TodoService.getAllTodos();
        setTodos(todoData);
        
        // 履歴タブが選択されている場合は履歴も取得
        if (activeTab === 'history') {
          let historyData;
          if (selectedTodoId) {
            historyData = await TodoService.getTodoHistory(selectedTodoId);
          } else {
            historyData = await TodoService.getAllHistory();
          }
          setHistory(historyData);
        }
      } catch (error) {
        console.error('データの読み込み中にエラーが発生しました:', error);
        setError('データの取得に失敗しました。再度お試しください。');
      } finally {
        setLoading(false);
      }
    };

    // ユーザーがログインしている場合のみデータを読み込む
    if (user) {
      loadData();
    }
  }, [activeTab, selectedTodoId, user]);

  // 新しいTODOを追加
  const handleAddTodo = async (title, description) => {
    if (!user) {
      setError('タスクを追加するにはログインしてください');
      return;
    }
    
    try {
      setError('');
      const newTodo = await TodoService.createTodo(title, description);
      setTodos([newTodo, ...todos]);
    } catch (error) {
      console.error('TODOの追加中にエラーが発生しました:', error);
      setError('タスクの追加に失敗しました。再度お試しください。');
    }
  };

  // TODOの完了状態を切り替え
  const handleToggleComplete = async (id, currentStatus) => {
    try {
      setError('');
      const updatedTodo = await TodoService.toggleTodoCompletion(id, !currentStatus);
      setTodos(todos.map(todo => todo.id === id ? updatedTodo : todo));
    } catch (error) {
      console.error('TODOの状態切り替え中にエラーが発生しました:', error);
      setError('タスクの状態変更に失敗しました。再度お試しください。');
    }
  };

  // TODOを削除
  const handleDeleteTodo = async (id) => {
    try {
      setError('');
      await TodoService.deleteTodo(id);
      setTodos(todos.filter(todo => todo.id !== id));
    } catch (error) {
      console.error('TODOの削除中にエラーが発生しました:', error);
      setError('タスクの削除に失敗しました。再度お試しください。');
    }
  };

  // TODOを編集
  const handleEditTodo = async (id, updates) => {
    try {
      setError('');
      const updatedTodo = await TodoService.updateTodo(id, updates);
      setTodos(todos.map(todo => todo.id === id ? updatedTodo : todo));
    } catch (error) {
      console.error('TODOの編集中にエラーが発生しました:', error);
      setError('タスクの編集に失敗しました。再度お試しください。');
    }
  };

  // 特定のTODOの履歴を表示
  const handleViewHistory = async (todoId) => {
    try {
      setError('');
      setLoading(true);
      setSelectedTodoId(todoId);
      setActiveTab('history');
    } catch (error) {
      console.error('履歴の取得中にエラーが発生しました:', error);
      setError('履歴の取得に失敗しました。再度お試しください。');
    } finally {
      setLoading(false);
    }
  };

  // 全履歴表示に戻る
  const handleShowAllHistory = () => {
    setSelectedTodoId(null);
  };

  // ユーザーが未ログインの場合はメッセージを表示
  if (!user) {
    return (
      <div className="todo-app">
        <div className="error-message">
          タスクを表示・管理するにはログインしてください。
        </div>
      </div>
    );
  }

  return (
    <div className="todo-app">
      <h2>TODOリスト</h2>
      
      {error && <div className="error-message">{error}</div>}
      
      <div className="tabs">
        <button 
          className={activeTab === 'todos' ? 'active' : ''} 
          onClick={() => setActiveTab('todos')}
        >
          TODOリスト
        </button>
        <button 
          className={activeTab === 'history' ? 'active' : ''} 
          onClick={() => {
            setActiveTab('history');
            setSelectedTodoId(null);
          }}
        >
          履歴
        </button>
      </div>

      {loading ? (
        <div className="loading">読み込み中...</div>
      ) : (
        <div className="tab-content">
          {activeTab === 'todos' ? (
            <>
              <TodoForm onAddTodo={handleAddTodo} />
              <TodoList 
                todos={todos} 
                onToggleComplete={handleToggleComplete}
                onDeleteTodo={handleDeleteTodo}
                onEditTodo={handleEditTodo}
                onViewHistory={handleViewHistory}
              />
            </>
          ) : (
            <TodoHistory 
              history={history} 
              selectedTodoId={selectedTodoId}
              onShowAllHistory={handleShowAllHistory}
            />
          )}
        </div>
      )}
    </div>
  );
}

export default TodoApp;
