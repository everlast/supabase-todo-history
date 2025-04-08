import React from 'react';
import '../styles/TodoHistory.css';

function TodoHistory({ history, categories, selectedTodoId, onShowAllHistory }) {
  // 期限日をフォーマット
  const formatDueDate = (dateString) => {
    if (!dateString) return 'なし';
    
    return new Date(dateString).toLocaleDateString('ja-JP', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      weekday: 'short'
    });
  };

  // 履歴アクションに応じた表示テキストを取得
  const getActionText = (action) => {
    switch (action) {
      case 'created': return '作成';
      case 'updated': return '更新';
      case 'completed': return '完了';
      case 'reopened': return '再開';
      case 'due_date_changed': return '期限日変更';
      default: return action;
    }
  };

  // カテゴリIDからカテゴリ名を取得
  const getCategoryName = (categoryId) => {
    if (!categoryId) return 'なし';
    if (!categories) return 'カテゴリID: ' + categoryId;
    
    const category = categories.find(c => c.id === categoryId);
    return category ? category.name : 'カテゴリID: ' + categoryId;
  };

  // 履歴の詳細を表示するヘルパー関数
  const renderHistoryDetails = (item) => {
    const { action, details } = item;
    
    if (action === 'created') {
      return (
        <div className="history-details">
          <p><strong>タイトル:</strong> {details.title}</p>
          {details.description && <p><strong>説明:</strong> {details.description}</p>}
          <p><strong>期限日:</strong> {details.due_date ? formatDueDate(details.due_date) : 'なし'}</p>
          <p><strong>カテゴリ:</strong> {getCategoryName(details.category_id)}</p>
          {details.tags && details.tags.length > 0 && (
            <p><strong>タグ:</strong> {details.tags.join(', ')}</p>
          )}
        </div>
      );
    }
    
    if (action === 'updated') {
      const changes = [];
      
      if (details.previous.title !== details.current.title) {
        changes.push(
          <div key="title-change">
            <p><strong>タイトル:</strong></p>
            <p className="old">変更前: {details.previous.title}</p>
            <p className="new">変更後: {details.current.title}</p>
          </div>
        );
      }
      
      if (details.previous.description !== details.current.description) {
        changes.push(
          <div key="desc-change">
            <p><strong>説明:</strong></p>
            <p className="old">変更前: {details.previous.description || '(なし)'}</p>
            <p className="new">変更後: {details.current.description || '(なし)'}</p>
          </div>
        );
      }
      
      if (details.previous.due_date !== details.current.due_date) {
        changes.push(
          <div key="due-date-change">
            <p><strong>期限日:</strong></p>
            <p className="old">変更前: {details.previous.due_date ? formatDueDate(details.previous.due_date) : 'なし'}</p>
            <p className="new">変更後: {details.current.due_date ? formatDueDate(details.current.due_date) : 'なし'}</p>
          </div>
        );
      }
      
      // カテゴリの変更を表示
      if (details.previous.category_id !== details.current.category_id) {
        changes.push(
          <div key="category-change">
            <p><strong>カテゴリ:</strong></p>
            <p className="old">変更前: {getCategoryName(details.previous.category_id)}</p>
            <p className="new">変更後: {getCategoryName(details.current.category_id)}</p>
          </div>
        );
      }
      
      // タグの変更を表示
      const prevTags = details.previous.tags || [];
      const currTags = details.current.tags || [];
      
      if (JSON.stringify(prevTags) !== JSON.stringify(currTags)) {
        changes.push(
          <div key="tags-change">
            <p><strong>タグ:</strong></p>
            <p className="old">変更前: {prevTags.length > 0 ? prevTags.join(', ') : '(なし)'}</p>
            <p className="new">変更後: {currTags.length > 0 ? currTags.join(', ') : '(なし)'}</p>
          </div>
        );
      }
      
      return <div className="history-details">{changes}</div>;
    }
    
    if (action === 'due_date_changed') {
      return (
        <div className="history-details">
          <p><strong>期限日:</strong></p>
          <p className="old">変更前: {details.previous.due_date ? formatDueDate(details.previous.due_date) : 'なし'}</p>
          <p className="new">変更後: {details.current.due_date ? formatDueDate(details.current.due_date) : 'なし'}</p>
        </div>
      );
    }
    
    return null;
  };

  return (
    <div className="todo-history">
      <h2>
        {selectedTodoId ? '特定のタスク履歴' : 'すべてのタスク履歴'}
        {selectedTodoId && (
          <button className="back-button" onClick={onShowAllHistory}>
            すべての履歴に戻る
          </button>
        )}
      </h2>
      
      {history.length === 0 ? (
        <div className="empty-state">履歴がありません。</div>
      ) : (
        <div className="history-list">
          {history.map(item => (
            <div key={item.id} className="history-item">
              <div className="history-header">
                <span className={`action-badge ${item.action}`}>
                  {getActionText(item.action)}
                </span>
                <span className="todo-title">
                  {item.todos?.title || 'タスク'}
                </span>
                <span className="date">
                  {new Date(item.created_at).toLocaleString()}
                </span>
              </div>
              
              {renderHistoryDetails(item)}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default TodoHistory;