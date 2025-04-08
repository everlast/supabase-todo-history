import React, { useState } from 'react';
import TagInput from './TagInput';
import '../styles/TodoForm.css';

function TodoForm({ onAddTodo, categories }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [tags, setTags] = useState([]);
  const [expanded, setExpanded] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (title.trim()) {
      onAddTodo(
        title.trim(), 
        description.trim(), 
        dueDate ? new Date(dueDate).toISOString() : null,
        categoryId === '' ? null : categoryId,
        tags
      );
      setTitle('');
      setDescription('');
      setDueDate('');
      setCategoryId('');
      setTags([]);
      setExpanded(false);
    }
  };

  const handleAddTag = (tag) => {
    if (!tags.includes(tag)) {
      setTags([...tags, tag]);
    }
  };

  const handleRemoveTag = (tag) => {
    setTags(tags.filter(t => t !== tag));
  };

  // 今日の日付をYYYY-MM-DD形式で取得（日付入力フィールドのmin属性に使用）
  const today = new Date().toISOString().split('T')[0];

  return (
    <form className="todo-form" onSubmit={handleSubmit}>
      <div className="form-group">
        <input
          type="text"
          placeholder="新しいタスクを入力..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onClick={() => !expanded && setExpanded(true)}
        />
        {expanded && (
          <>
            <textarea
              placeholder="説明（任意）"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            
            <div className="form-row">
              <div className="form-column">
                <div className="date-input-container">
                  <label htmlFor="dueDate">期限日（任意）:</label>
                  <input
                    type="date"
                    id="dueDate"
                    value={dueDate}
                    min={today}
                    onChange={(e) => setDueDate(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="form-column">
                <div className="category-select-container">
                  <label htmlFor="category">カテゴリ（任意）:</label>
                  <select
                    id="category"
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
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
              <label>タグ（任意、Enterで追加）:</label>
              <TagInput
                tags={tags}
                onAddTag={handleAddTag}
                onRemoveTag={handleRemoveTag}
              />
            </div>
          </>
        )}
      </div>
      <button type="submit" disabled={!title.trim()}>追加</button>
    </form>
  );
}

export default TodoForm;