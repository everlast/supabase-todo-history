import React from 'react';
import TodoItem from './TodoItem';
import '../styles/TodoList.css';

function TodoList({ 
  todos, 
  categories,
  onToggleComplete, 
  onDeleteTodo, 
  onEditTodo, 
  onViewHistory,
  onAddTag,
  onRemoveTag,
  onFilterByTag
}) {
  // タグをクリックしたときの処理
  const handleTagClick = (e, tag) => {
    e.stopPropagation(); // イベントの伝播を防止
    onFilterByTag(tag);
  };

  return (
    <div className="todo-list">
      {todos.length === 0 ? (
        <div className="empty-state">TODOがありません。新しいタスクを追加してください。</div>
      ) : (
        todos.map(todo => (
          <div id={`todo-${todo.id}`} key={todo.id}>
            <TodoItem
              todo={todo}
              categories={categories}
              onToggleComplete={onToggleComplete}
              onDeleteTodo={onDeleteTodo}
              onEditTodo={onEditTodo}
              onViewHistory={onViewHistory}
              onAddTag={onAddTag}
              onRemoveTag={onRemoveTag}
              onTagClick={handleTagClick}
            />
          </div>
        ))
      )}
    </div>
  );
}

export default TodoList;