import React, { useState, useEffect } from 'react';
import { CategoryService } from '../services/CategoryService';
import '../styles/CategoryManager.css';

function CategoryManager({ onSelectCategory }) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryColor, setNewCategoryColor] = useState('#3498db');
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);

  // カテゴリを読み込む
  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await CategoryService.getAllCategories();
      setCategories(data);
    } catch (error) {
      console.error('カテゴリの読み込みに失敗しました:', error);
      setError('カテゴリの取得に失敗しました。再度お試しください。');
    } finally {
      setLoading(false);
    }
  };

  // 新しいカテゴリを追加
  const handleAddCategory = async (e) => {
    e.preventDefault();
    
    if (!newCategoryName.trim()) return;
    
    try {
      setError('');
      const newCategory = await CategoryService.createCategory(
        newCategoryName.trim(), 
        newCategoryColor
      );
      setCategories([...categories, newCategory]);
      setNewCategoryName('');
      setNewCategoryColor('#3498db');
      setIsAdding(false);
    } catch (error) {
      console.error('カテゴリの追加に失敗しました:', error);
      setError('カテゴリの追加に失敗しました。再度お試しください。');
    }
  };

  // カテゴリを削除
  const handleDeleteCategory = async (id) => {
    try {
      setError('');
      await CategoryService.deleteCategory(id);
      setCategories(categories.filter(category => category.id !== id));
      if (selectedCategoryId === id) {
        setSelectedCategoryId(null);
        onSelectCategory(null);
      }
    } catch (error) {
      console.error('カテゴリの削除に失敗しました:', error);
      setError('カテゴリの削除に失敗しました。再度お試しください。');
    }
  };

  // カテゴリを選択
  const handleSelectCategory = (id) => {
    if (selectedCategoryId === id) {
      setSelectedCategoryId(null);
      onSelectCategory(null);
    } else {
      setSelectedCategoryId(id);
      onSelectCategory(id);
    }
  };

  return (
    <div className="category-manager">
      <h3>カテゴリ</h3>
      {error && <div className="error-message">{error}</div>}
      
      <div className="category-list">
        <div
          className={`category-item ${selectedCategoryId === null ? 'selected' : ''}`}
          onClick={() => handleSelectCategory(null)}
        >
          <span className="category-color" style={{ backgroundColor: '#cccccc' }}></span>
          <span className="category-name">すべて</span>
        </div>
        
        {categories.map(category => (
          <div
            key={category.id}
            className={`category-item ${selectedCategoryId === category.id ? 'selected' : ''}`}
            onClick={() => handleSelectCategory(category.id)}
          >
            <span className="category-color" style={{ backgroundColor: category.color }}></span>
            <span className="category-name">{category.name}</span>
            <button
              className="delete-button"
              onClick={(e) => {
                e.stopPropagation();
                if (window.confirm(`カテゴリ「${category.name}」を削除しますか？`)) {
                  handleDeleteCategory(category.id);
                }
              }}
            >
              ×
            </button>
          </div>
        ))}
      </div>
      
      {isAdding ? (
        <form className="add-category-form" onSubmit={handleAddCategory}>
          <input
            type="text"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            placeholder="新しいカテゴリ名"
            autoFocus
          />
          <input
            type="color"
            value={newCategoryColor}
            onChange={(e) => setNewCategoryColor(e.target.value)}
          />
          <div className="form-actions">
            <button type="submit" disabled={!newCategoryName.trim()}>
              追加
            </button>
            <button type="button" onClick={() => setIsAdding(false)}>
              キャンセル
            </button>
          </div>
        </form>
      ) : (
        <button
          className="add-category-button"
          onClick={() => setIsAdding(true)}
        >
          + 新しいカテゴリ
        </button>
      )}
    </div>
  );
}

export default CategoryManager;