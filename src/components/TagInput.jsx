import React, { useState } from 'react';
import '../styles/TagInput.css';

function TagInput({ tags, onAddTag, onRemoveTag }) {
  const [inputValue, setInputValue] = useState('');

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const handleKeyDown = (e) => {
    // Enterキーが押されたとき
    if (e.key === 'Enter' && inputValue.trim()) {
      e.preventDefault();
      onAddTag(inputValue.trim());
      setInputValue('');
    }
  };

  const handleRemoveTag = (tag) => {
    onRemoveTag(tag);
  };

  return (
    <div className="tag-input">
      <div className="tag-list">
        {tags.map((tag, index) => (
          <div key={index} className="tag">
            <span>{tag}</span>
            <button 
              type="button"
              className="remove-tag"
              onClick={() => handleRemoveTag(tag)}
            >
              ×
            </button>
          </div>
        ))}
      </div>
      <input
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        placeholder="タグを入力..."
      />
    </div>
  );
}

export default TagInput;