import React, { useState } from 'react';
import '../styles/TodoForm.css';

function TodoForm({ onAddTodo }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [expanded, setExpanded] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (title.trim()) {
      onAddTodo(title.trim(), description.trim());
      setTitle('');
      setDescription('');
      setExpanded(false);
    }
  };

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
          <textarea
            placeholder="説明（任意）"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        )}
      </div>
      <button type="submit" disabled={!title.trim()}>追加</button>
    </form>
  );
}

export default TodoForm;
