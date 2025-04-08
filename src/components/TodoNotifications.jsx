import React from 'react';
import '../styles/TodoNotifications.css';

function TodoNotifications({ notifications, onClose, onNotificationClick }) {
  const { overdue, dueSoon } = notifications;
  
  // 期限日の表示をフォーマット
  const formatDueDate = (dateString) => {
    if (!dateString) return 'なし';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('ja-JP', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      weekday: 'short'
    });
  };

  return (
    <div className="todo-notifications">
      <div className="notifications-header">
        <h3>タスク通知</h3>
        <button className="close-btn" onClick={onClose}>×</button>
      </div>
      
      <div className="notifications-content">
        {overdue.length > 0 && (
          <div className="notification-section overdue">
            <h4>期限切れのタスク ({overdue.length}件)</h4>
            <ul>
              {overdue.map(todo => (
                <li key={todo.id} onClick={() => onNotificationClick(todo.id)}>
                  <span className="todo-title">{todo.title}</span>
                  <span className="due-date">期限: {formatDueDate(todo.due_date)}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        
        {dueSoon.length > 0 && (
          <div className="notification-section due-soon">
            <h4>期限が近いタスク ({dueSoon.length}件)</h4>
            <ul>
              {dueSoon.map(todo => (
                <li key={todo.id} onClick={() => onNotificationClick(todo.id)}>
                  <span className="todo-title">{todo.title}</span>
                  <span className="due-date">期限: {formatDueDate(todo.due_date)}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
      
      <div className="notifications-footer">
        <button onClick={onClose}>閉じる</button>
      </div>
    </div>
  );
}

export default TodoNotifications;