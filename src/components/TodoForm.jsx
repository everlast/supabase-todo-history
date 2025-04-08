import React, { useState } from 'react';
import '../styles/TodoForm.css';

function TodoForm({ onAddTodo }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [expanded, setExpanded] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (title.trim()) {
      onAddTodo(title.trim(), description.trim(), dueDate ? new Date(dueDate).toISOString() : null);
      setTitle('');
      setDescription('');
      setDueDate('');
      setExpanded(false);
    }
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
          </>
        )}
      </div>
      <button type="submit" disabled={!title.trim()}>追加</button>
    </form>
  );
}

export default TodoForm;