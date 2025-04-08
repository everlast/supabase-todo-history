import React, { useState } from 'react';
import '../styles/TodoItem.css';

function TodoItem({ todo, onToggleComplete, onDeleteTodo, onEditTodo, onViewHistory }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(todo.title);
  const [editDescription, setEditDescription] = useState(todo.description || '');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editTitle.trim()) {
      onEditTodo(todo.id, { 
        title: editTitle.trim(),
        description: editDescription.trim()
      });
      setIsEditing(false);
    }
  };

  return (
    <div className={`todo-item ${todo.is_completed ? 'completed' : ''}`}>
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
