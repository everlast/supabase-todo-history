import React, { useState, useEffect } from 'react';
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

  // 初期データの読み込み
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const todoData = await TodoService.getAllTodos();
        setTodos(todoData);
        
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
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [activeTab, selectedTodoId]);

  // 新しいTODOを追加
  const handleAddTodo = async (title, description) => {
    try {
      const newTodo = await TodoService.createTodo(title, description);
      setTodos([newTodo, ...todos]);
    } catch (error) {
      console.error('TODOの追加中にエラーが発生しました:', error);
    }
  };

  // TODOの完了状態を切り替え
  const handleToggleComplete = async (id, currentStatus) => {
    try {
      const updatedTodo = await TodoService.toggleTodoCompletion(id, !currentStatus);
      setTodos(todos.map(todo => todo.id === id ? updatedTodo : todo));
    } catch (error) {
      console.error('TODOの状態切り替え中にエラーが発生しました:', error);
    }
  };

  // TODOを削除
  const handleDeleteTodo = async (id) => {
    try {
      await TodoService.deleteTodo(id);
      setTodos(todos.filter(todo => todo.id !== id));
    } catch (error) {
      console.error('TODOの削除中にエラーが発生しました:', error);
    }
  };

  // TODOを編集
  const handleEditTodo = async (id, updates) => {
    try {
      const updatedTodo = await TodoService.updateTodo(id, updates);
      setTodos(todos.map(todo => todo.id === id ? updatedTodo : todo));
    } catch (error) {
      console.error('TODOの編集中にエラーが発生しました:', error);
    }
  };

  // 特定のTODOの履歴を表示
  const handleViewHistory = async (todoId) => {
    try {
      setLoading(true);
      setSelectedTodoId(todoId);
      setActiveTab('history');
    } catch (error) {
      console.error('履歴の取得中にエラーが発生しました:', error);
    }
  };

  // 全履歴表示に戻る
  const handleShowAllHistory = () => {
    setSelectedTodoId(null);
  };

  return (
    <div className="todo-app">
      <h1>TODOアプリ</h1>
      
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
