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
  onFilterByTag,
  incompleteTodoCount,
  totalIncompleteTodoCount,
  isFiltered
}) {
  // タグをクリックしたときの処理
  const handleTagClick = (e, tag) => {
    e.stopPropagation(); // イベントの伝播を防止
    onFilterByTag(tag);
  };

  return (
    <div className="todo-list-container">
      <div className="todo-status-bar">
        <div className="incomplete-count">
          {isFiltered ? (
            <span>
              表示中: <strong>{incompleteTodoCount}</strong> / 全体: <strong>{totalIncompleteTodoCount}</strong> 件の未完了タスク
            </span>
          ) : (
            <span>
              <strong>{incompleteTodoCount}</strong> 件の未完了タスク
            </span>
          )}
        </div>
      </div>
      
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
    </div>
  );
}

export default TodoList;