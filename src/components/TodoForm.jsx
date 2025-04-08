import React, { useState } from 'react';
import TagInput from './TagInput';
import { CategoryService } from '../services/CategoryService';
import '../styles/TodoForm.css';

function TodoForm({ onAddTodo, categories, onCategoryUpdated }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [tags, setTags] = useState([]);
  const [expanded, setExpanded] = useState(false);
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryColor, setNewCategoryColor] = useState('#3498db');
  const [categoryError, setCategoryError] = useState('');
  const [localCategories, setLocalCategories] = useState(categories || []);

  // 親コンポーネントからcategoriesプロップが更新されたら、ローカルの状態も更新
  React.useEffect(() => {
    setLocalCategories(categories || []);
  }, [categories]);

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

  // 新しいカテゴリを追加する関数
  const handleAddCategory = async (e) => {
    e.preventDefault();
    
    if (!newCategoryName.trim()) {
      setCategoryError('カテゴリ名を入力してください');
      return;
    }
    
    try {
      setCategoryError('');
      // CategoryServiceを使って新しいカテゴリを追加
      const newCategory = await CategoryService.createCategory(
        newCategoryName.trim(), 
        newCategoryColor
      );
      
      // ローカルのカテゴリリストに新しいカテゴリを追加
      const updatedCategories = [...localCategories, newCategory];
      setLocalCategories(updatedCategories);
      
      // 追加したカテゴリを選択
      setCategoryId(newCategory.id);
      
      // フォームをリセット
      setNewCategoryName('');
      setNewCategoryColor('#3498db');
      setIsAddingCategory(false);
      
      // 親コンポーネントに新しいカテゴリが追加されたことを通知
      if (onCategoryUpdated) {
        onCategoryUpdated(updatedCategories);
      }
    } catch (error) {
      console.error('カテゴリの追加に失敗しました:', error);
      setCategoryError('カテゴリの追加に失敗しました。再度お試しください。');
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
                  <div className="category-select-wrapper">
                    <select
                      id="category"
                      value={categoryId}
                      onChange={(e) => setCategoryId(e.target.value)}
                      className="category-select"
                    >
                      <option value="">カテゴリなし</option>
                      {localCategories.map(category => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                    <button 
                      type="button" 
                      className="add-category-button"
                      onClick={() => setIsAddingCategory(!isAddingCategory)}
                    >
                      +
                    </button>
                  </div>
                  
                  {isAddingCategory && (
                    <div className="add-category-form">
                      <div className="add-category-inputs">
                        <input
                          type="text"
                          value={newCategoryName}
                          onChange={(e) => setNewCategoryName(e.target.value)}
                          placeholder="新しいカテゴリ名"
                          className="category-name-input"
                        />
                        <input
                          type="color"
                          value={newCategoryColor}
                          onChange={(e) => setNewCategoryColor(e.target.value)}
                          className="color-picker"
                        />
                      </div>
                      {categoryError && <div className="category-error">{categoryError}</div>}
                      <div className="category-actions">
                        <button 
                          type="button" 
                          onClick={handleAddCategory}
                          className="save-category-button"
                        >
                          追加
                        </button>
                        <button 
                          type="button" 
                          onClick={() => {
                            setIsAddingCategory(false);
                            setNewCategoryName('');
                            setCategoryError('');
                          }}
                          className="cancel-category-button"
                        >
                          キャンセル
                        </button>
                      </div>
                    </div>
                  )}
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