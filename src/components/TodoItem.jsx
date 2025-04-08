import React, { useState } from 'react';
import '../styles/TodoItem.css';

function TodoItem({ todo, onToggleComplete, onDeleteTodo, onEditTodo, onViewHistory }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(todo.title);
  const [editDescription, setEditDescription] = useState(todo.description || '');
  const [editDueDate, setEditDueDate] = useState(todo.due_date ? new Date(todo.due_date).toISOString().split('T')[0] : '');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editTitle.trim()) {
      onEditTodo(todo.id, { 
        title: editTitle.trim(),
        description: editDescription.trim(),
        due_date: editDueDate ? new Date(editDueDate).toISOString() : null
      });
      setIsEditing(false);
    }
  };

  // 期限日の表示をフォーマット
  const formatDueDate = (dateString) => {
    if (!dateString) return null;
    
    const date = new Date(dateString);
    return date.toLocaleDateString('ja-JP', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      weekday: 'short'
    });
  };

  // 期限日が近いか過ぎているかを確認
  const getDueDateStatus = () => {
    if (!todo.due_date) return null;
    
    const dueDate = new Date(todo.due_date);
    const today = new Date();
    
    // 時間部分をリセットして日付だけを比較
    today.setHours(0, 0, 0, 0);
    
    if (dueDate < today) return 'overdue';
    
    // 3日以内の期限
    const threeDaysLater = new Date(today);
    threeDaysLater.setDate(today.getDate() + 3);
    
    if (dueDate <= threeDaysLater) return 'soon';
    
    return 'normal';
  };

  // 今日の日付をYYYY-MM-DD形式で取得（日付入力フィールドのmin属性に使用）
  const today = new Date().toISOString().split('T')[0];
  
  const dueDateStatus = getDueDateStatus();

  return (
    <div className={`todo-item ${todo.is_completed ? 'completed' : ''} ${dueDateStatus ? `due-${dueDateStatus}` : ''}`}>
      {isEditing ? (
        <form className="edit-form" onSubmit={handleSubmit}>
          <input
            type="text"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            autoFocus
          />
          <textarea
            value={editDescription}
            onChange={(e) => setEditDescription(e.target.value)}
            placeholder="説明（任意）"
          />
          <div className="date-input-container">
            <label htmlFor="editDueDate">期限日（任意）:</label>
            <input
              type="date"
              id="editDueDate"
              value={editDueDate}
              min={today}
              onChange={(e) => setEditDueDate(e.target.value)}
            />
            {editDueDate && (
              <button 
                type="button" 
                className="clear-date-btn"
                onClick={() => setEditDueDate('')}
              >
                クリア
              </button>
            )}
          </div>
          <div className="actions">
            <button type="submit" disabled={!editTitle.trim()}>保存</button>
            <button type="button" onClick={() => setIsEditing(false)}>キャンセル</button>
          </div>
        </form>
      ) : (
        <>
          <div className="todo-content">
            <input
              type="checkbox"
              checked={todo.is_completed}
              onChange={() => onToggleComplete(todo.id, todo.is_completed)}
            />
            <div className="todo-text">
              <h3>{todo.title}</h3>
              {todo.description && <p>{todo.description}</p>}
              <div className="todo-meta">
                <span className="date">作成: {new Date(todo.created_at).toLocaleString()}</span>
                {todo.updated_at !== todo.created_at && (
                  <span className="date">更新: {new Date(todo.updated_at).toLocaleString()}</span>
                )}
                {todo.due_date && (
                  <span className={`due-date ${dueDateStatus}`}>
                    期限: {formatDueDate(todo.due_date)}
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="actions">
            <button onClick={() => setIsEditing(true)}>編集</button>
            <button onClick={() => onViewHistory(todo.id)}>履歴</button>
            <button onClick={() => onDeleteTodo(todo.id)}>削除</button>
          </div>
        </>
      )}
    </div>
  );
}

export default TodoItem;