import React from 'react';
import TodoItem from './TodoItem';
import '../styles/TodoList.css';

function TodoList({ todos, onToggleComplete, onDeleteTodo, onEditTodo, onViewHistory }) {
  return (
    <div className="todo-list">
      {todos.length === 0 ? (
        <div className="empty-state">TODOがありません。新しいタスクを追加してください。</div>
      ) : (
        todos.map(todo => (
          <div id={`todo-${todo.id}`} key={todo.id}>
            <TodoItem
              todo={todo}
              onToggleComplete={onToggleComplete}
              onDeleteTodo={onDeleteTodo}
              onEditTodo={onEditTodo}
              onViewHistory={onViewHistory}
            />
          </div>
        ))
      )}
    </div>
  );
}