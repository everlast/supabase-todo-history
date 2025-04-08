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

  // 期限までの日数を計算
  const getDaysUntilDue = (dateString) => {
    if (!dateString) return null;
    
    const dueDate = new Date(dateString);
    dueDate.setHours(0, 0, 0, 0);
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const diffTime = dueDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  };

  // 期限切れかどうかを判定
  const isOverdue = (dateString) => {
    return getDaysUntilDue(dateString) < 0;
  };

  // 期限が当日または前日かどうかを判定
  const isUrgent = (dateString) => {
    const daysUntilDue = getDaysUntilDue(dateString);
    return daysUntilDue === 0 || daysUntilDue === 1;
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
                <li key={todo.id} onClick={() => onNotificationClick(todo.id)} className="overdue-item">
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
                <li 
                  key={todo.id} 
                  onClick={() => onNotificationClick(todo.id)}
                  className={isUrgent(todo.due_date) ? "urgent-item" : ""}
                >
                  <span className="todo-title">{todo.title}</span>
                  <span className="due-date">
                    期限: {formatDueDate(todo.due_date)}
                    {isUrgent(todo.due_date) && <span className="urgent-label">緊急</span>}
                  </span>
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