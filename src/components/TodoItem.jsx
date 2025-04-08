import React, { useState } from 'react';
import TagInput from './TagInput';
import '../styles/TodoItem.css';

function TodoItem({ 
  todo, 
  categories, 
  onToggleComplete, 
  onDeleteTodo, 
  onEditTodo, 
  onViewHistory,
  onAddTag,
  onRemoveTag,
  onTagClick 
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(todo.title);
  const [editDescription, setEditDescription] = useState(todo.description || '');
  const [editDueDate, setEditDueDate] = useState(todo.due_date ? new Date(todo.due_date).toISOString().split('T')[0] : '');
  const [editCategory, setEditCategory] = useState(todo.category_id);
  const [editTags, setEditTags] = useState(todo.tags || []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editTitle.trim()) {
      onEditTodo(todo.id, { 
        title: editTitle.trim(),
        description: editDescription.trim(),
        due_date: editDueDate ? new Date(editDueDate).toISOString() : null,
        category_id: editCategory,
        tags: editTags
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

  // 期限までの残り日数を計算
  const getDaysRemaining = (dateString) => {
    if (!dateString) return null;
    
    const dueDate = new Date(dateString);
    dueDate.setHours(0, 0, 0, 0);
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const diffTime = dueDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  };

  // 期限までの日数のテキストを生成
  const getRemainingDaysText = (dateString) => {
    const days = getDaysRemaining(dateString);
    
    if (days === null) return null;
    
    if (days < 0) {
      return <span className="overdue-text">期限超過</span>;
    } else if (days === 0) {
      return "今日まで";
    } else {
      return `あと ${days} 日`;
    }
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

  // タグを追加
  const handleAddTag = (tag) => {
    if (!editTags.includes(tag)) {
      const newTags = [...editTags, tag];
      setEditTags(newTags);
      
      if (!isEditing) {
        onAddTag(todo.id, tag);
      }
    }
  };

  // タグを削除
  const handleRemoveTag = (tag) => {
    const newTags = editTags.filter(t => t !== tag);
    setEditTags(newTags);
    
    if (!isEditing) {
      onRemoveTag(todo.id, tag);
    }
  };

  // 今日の日付をYYYY-MM-DD形式で取得（日付入力フィールドのmin属性に使用）
  const today = new Date().toISOString().split('T')[0];
  
  const dueDateStatus = getDueDateStatus();

  // 現在のカテゴリ情報を取得
  const currentCategory = categories && todo.category_id 
    ? categories.find(c => c.id === todo.category_id) 
    : null;

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
          
          <div className="form-row">
            <div className="form-column">
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
            </div>
            
            <div className="form-column">
              <div className="category-select-container">
                <label htmlFor="editCategory">カテゴリ（任意）:</label>
                <select
                  id="editCategory"
                  value={editCategory || ''}
                  onChange={(e) => setEditCategory(e.target.value === '' ? null : e.target.value)}
                  className="category-select"
                >
                  <option value="">カテゴリなし</option>
                  {categories && categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          
          <div className="form-section">
            <label>タグ（Enterで追加）:</label>
            <TagInput
              tags={editTags}
              onAddTag={handleAddTag}
              onRemoveTag={handleRemoveTag}
            />
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
              
              {currentCategory && (
                <div className="todo-category">
                  <span
                    className="category-badge"
                    style={{
                      backgroundColor: currentCategory.color || '#3498db'
                    }}
                  >
                    {currentCategory.name}
                  </span>
                </div>
              )}
              
              {todo.tags && todo.tags.length > 0 && (
                <div className="todo-tags">
                  {todo.tags.map((tag, index) => (
                    <span 
                      key={index} 
                      className="tag-badge"
                      onClick={(e) => onTagClick && onTagClick(e, tag)}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
              
              <div className="todo-meta">
                <span className="date">作成: {new Date(todo.created_at).toLocaleString()}</span>
                {todo.updated_at !== todo.created_at && (
                  <span className="date">更新: {new Date(todo.updated_at).toLocaleString()}</span>
                )}
                {todo.due_date && (
                  <span className={`due-date ${dueDateStatus}`}>
                    期限: {formatDueDate(todo.due_date)}
                    {getDaysRemaining(todo.due_date) !== null && (
                      <span className="days-remaining">
                        {getRemainingDaysText(todo.due_date)}
                      </span>
                    )}
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