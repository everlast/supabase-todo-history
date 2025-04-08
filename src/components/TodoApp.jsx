import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { TodoService } from '../services/TodoService';
import { CategoryService } from '../services/CategoryService';
import TodoForm from './TodoForm';
import TodoList from './TodoList';
import TodoHistory from './TodoHistory';
import TodoNotifications from './TodoNotifications';
import CategoryManager from './CategoryManager';
import '../styles/TodoApp.css';

function TodoApp() {
  const [todos, setTodos] = useState([]);
  const [allTodos, setAllTodos] = useState([]); // フィルタリング前のすべてのTODO
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('todos'); // 'todos' または 'history'
  const [history, setHistory] = useState([]);
  const [selectedTodoId, setSelectedTodoId] = useState(null);
  const [error, setError] = useState('');
  const [notifications, setNotifications] = useState({
    overdue: [],
    dueSoon: []
  });
  const [showNotifications, setShowNotifications] = useState(false);
  const [categories, setCategories] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [filterTag, setFilterTag] = useState(null);
  
  // 認証コンテキストから現在のユーザーを取得
  const { user } = useAuth();

  // 初期データの読み込み
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError('');
        
        // カテゴリを読み込む
        const categoryData = await CategoryService.getAllCategories();
        setCategories(categoryData);
        
        // ユーザーのTODOを取得
        const todoData = await TodoService.getAllTodos();
        setAllTodos(todoData);
        
        // フィルタリング
        let filteredTodos = [...todoData];
        
        // カテゴリフィルター
        if (selectedCategoryId) {
          filteredTodos = filteredTodos.filter(
            todo => todo.category_id === selectedCategoryId
          );
        }
        
        // タグフィルター
        if (filterTag) {
          filteredTodos = filteredTodos.filter(
            todo => todo.tags && todo.tags.includes(filterTag)
          );
        }
        
        setTodos(filteredTodos);
        
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
  }, [activeTab, selectedTodoId, user, selectedCategoryId, filterTag]);

  // 通知の読み込み
  useEffect(() => {
    const loadNotifications = async () => {
      if (!user) return;
      
      try {
        // 期限切れのタスク
        const overdueData = await TodoService.getOverdueTodos();
        
        // 期限が近いタスク
        const dueSoonData = await TodoService.getDueSoonTodos();
        
        setNotifications({
          overdue: overdueData,
          dueSoon: dueSoonData
        });
        
        // 通知があれば通知パネルを表示
        if (overdueData.length > 0 || dueSoonData.length > 0) {
          setShowNotifications(true);
        }
      } catch (error) {
        console.error('通知の読み込み中にエラーが発生しました:', error);
      }
    };
    
    loadNotifications();
    
    // 1時間ごとに通知を更新
    const notificationInterval = setInterval(loadNotifications, 60 * 60 * 1000);
    
    return () => clearInterval(notificationInterval);
  }, [user, allTodos]);

  // 新しいTODOを追加
  const handleAddTodo = async (title, description, dueDate, categoryId, tags = []) => {
    if (!user) {
      setError('タスクを追加するにはログインしてください');
      return;
    }
    
    try {
      setError('');
      const newTodo = await TodoService.createTodo(title, description, categoryId, tags);
      if (dueDate) {
        // 期限日が設定されている場合は、別途更新する（createTodoが更新されたので不要だが、念のため）
        await TodoService.updateTodo(newTodo.id, { due_date: dueDate });
      }
      
      setAllTodos([newTodo, ...allTodos]);
      
      // 現在のフィルターに合致するか確認
      let shouldAdd = true;
      
      if (selectedCategoryId && newTodo.category_id !== selectedCategoryId) {
        shouldAdd = false;
      }
      
      if (filterTag && (!newTodo.tags || !newTodo.tags.includes(filterTag))) {
        shouldAdd = false;
      }
      
      if (shouldAdd) {
        setTodos([newTodo, ...todos]);
      }
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
      setAllTodos(allTodos.map(todo => todo.id === id ? updatedTodo : todo));
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
      setAllTodos(allTodos.filter(todo => todo.id !== id));
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
      setAllTodos(allTodos.map(todo => todo.id === id ? updatedTodo : todo));
    } catch (error) {
      console.error('TODOの編集中にエラーが発生しました:', error);
      setError('タスクの編集に失敗しました。再度お試しください。');
    }
  };

  // カテゴリフィルター処理
  const handleSelectCategory = (categoryId) => {
    setSelectedCategoryId(categoryId);
  };

  // タグの処理
  const handleAddTag = async (todoId, tag) => {
    try {
      setError('');
      const updatedTodo = await TodoService.addTagToTodo(todoId, tag);
      
      // ステートを更新
      setTodos(todos.map(todo => 
        todo.id === todoId ? updatedTodo : todo
      ));
      setAllTodos(allTodos.map(todo => 
        todo.id === todoId ? updatedTodo : todo
      ));
    } catch (error) {
      console.error('タグの追加中にエラーが発生しました:', error);
      setError('タグの追加に失敗しました。再度お試しください。');
    }
  };

  const handleRemoveTag = async (todoId, tag) => {
    try {
      setError('');
      const updatedTodo = await TodoService.removeTagFromTodo(todoId, tag);
      
      // ステートを更新
      setTodos(todos.map(todo => 
        todo.id === todoId ? updatedTodo : todo
      ));
      setAllTodos(allTodos.map(todo => 
        todo.id === todoId ? updatedTodo : todo
      ));
      
      // 現在フィルタリングしているタグが削除された場合
      if (filterTag === tag) {
        const stillHasTag = allTodos.some(todo => 
          todo.id !== todoId && todo.tags && todo.tags.includes(tag)
        );
        
        if (!stillHasTag) {
          // このタグがもうどのTODOにも存在しない場合はフィルターをクリア
          setFilterTag(null);
        }
      }
    } catch (error) {
      console.error('タグの削除中にエラーが発生しました:', error);
      setError('タグの削除に失敗しました。再度お試しください。');
    }
  };

  // タグでフィルタリング
  const handleFilterByTag = (tag) => {
    setFilterTag(tag === filterTag ? null : tag);
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

  // 通知パネルを閉じる
  const handleCloseNotifications = () => {
    setShowNotifications(false);
  };

  // 通知クリックでTODOにフォーカス
  const handleNotificationClick = (todoId) => {
    // 対象のTODOが画面に表示されるようにスクロール
    const todoElement = document.getElementById(`todo-${todoId}`);
    if (todoElement) {
      todoElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      todoElement.classList.add('highlight');
      setTimeout(() => {
        todoElement.classList.remove('highlight');
      }, 2000);
    }
    
    setShowNotifications(false);
  };

  // 未完了タスクの数を計算する関数
  const getIncompleteTodoCount = () => {
    return todos.filter(todo => !todo.is_complete).length;
  };

  // 全ての未完了タスクの数を計算する関数
  const getAllIncompleteTodoCount = () => {
    return allTodos.filter(todo => !todo.is_complete).length;
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

  // 通知の合計数を計算
  const notificationCount = notifications.overdue.length + notifications.dueSoon.length;

  return (
    <div className="todo-app">
      <h2>
        TODOリスト
        {notificationCount > 0 && (
          <button 
            className="notification-toggle"
            onClick={() => setShowNotifications(!showNotifications)}
          >
            通知 <span className="notification-badge">{notificationCount}</span>
          </button>
        )}
      </h2>
      
      {error && <div className="error-message">{error}</div>}
      
      {showNotifications && notificationCount > 0 && (
        <TodoNotifications 
          notifications={notifications} 
          onClose={handleCloseNotifications}
          onNotificationClick={handleNotificationClick}
        />
      )}
      
      <div className="todo-tabs">
        <button 
          className={`tab-button ${activeTab === 'todos' ? 'active' : ''}`}
          onClick={() => setActiveTab('todos')}
        >
          TODOリスト
        </button>
        <button 
          className={`tab-button ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('history');
            handleShowAllHistory();
          }}
        >
          履歴
        </button>
      </div>

      {activeTab === 'todos' ? (
        <>
          <div className="category-section">
            <CategoryManager 
              categories={categories}
              selectedCategoryId={selectedCategoryId}
              onSelectCategory={handleSelectCategory}
            />
            
            {filterTag && (
              <div className="active-filter">
                <span>タグフィルター: </span>
                <span className="filter-tag">{filterTag}</span>
                <button onClick={() => setFilterTag(null)} className="clear-filter">
                  ×
                </button>
              </div>
            )}
          </div>
          
          <TodoForm 
            onAddTodo={handleAddTodo} 
            categories={categories}
          />
          
          {loading ? (
            <div className="loading">読み込み中...</div>
          ) : (
            <TodoList 
              todos={todos}
              categories={categories}
              onToggleComplete={handleToggleComplete}
              onDeleteTodo={handleDeleteTodo}
              onEditTodo={handleEditTodo}
              onViewHistory={handleViewHistory}
              onAddTag={handleAddTag}
              onRemoveTag={handleRemoveTag}
              onFilterByTag={handleFilterByTag}
              incompleteTodoCount={getIncompleteTodoCount()}
              totalIncompleteTodoCount={getAllIncompleteTodoCount()}
              isFiltered={!!selectedCategoryId || !!filterTag}
            />
          )}
        </>
      ) : (
        <TodoHistory 
          history={history}
          categories={categories}
          selectedTodoId={selectedTodoId}
          onShowAllHistory={handleShowAllHistory}
        />
      )}
    </div>
  );
}

export default TodoApp;