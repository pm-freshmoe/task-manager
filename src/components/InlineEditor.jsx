import React, { useState, useRef, useEffect } from 'react';

const InlineEditor = ({ 
  value, 
  onSave, 
  placeholder = 'Enter text...',
  className = '',
  autoFocus = false 
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      // Select all text only if it's the default "New Task"
      if (value === 'New Task') {
        inputRef.current.select();
      }
    }
  }, [isEditing, value]);

  useEffect(() => {
    setEditValue(value);
  }, [value]);

  const handleDoubleClick = (e) => {
    e.stopPropagation();
    e.preventDefault();
    setIsEditing(true);
  };

  const handleBlur = () => {
    setIsEditing(false);
    // Always save, even if content is empty (user can delete if they want)
    onSave(editValue);
  };

  const handleKeyDown = (e) => {
    // Stop propagation for all keys to prevent drag and drop interference
    e.stopPropagation();
    
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      inputRef.current?.blur();
    } else if (e.key === 'Escape') {
      setEditValue(value);
      setIsEditing(false);
    }
    // Allow space bar and all other keys to work normally
  };

  const handleChange = (e) => {
    setEditValue(e.target.value);
  };

  // Prevent drag when interacting with the editor
  const handleMouseDown = (e) => {
    e.stopPropagation();
  };

  const handleClick = (e) => {
    e.stopPropagation();
  };

  if (isEditing) {
    return (
      <textarea
        ref={inputRef}
        value={editValue}
        onChange={handleChange}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        onMouseDown={handleMouseDown}
        onClick={handleClick}
        className={`inline-editor ${className}`}
        placeholder={placeholder}
        rows={Math.max(2, editValue.split('\n').length)}
        style={{ cursor: 'text' }}
      />
    );
  }

  return (
    <div
      onDoubleClick={handleDoubleClick}
      onMouseDown={handleMouseDown}
      onClick={handleClick}
      className={`inline-display ${!value ? 'placeholder' : ''} ${className}`}
      style={{ cursor: 'text' }}
    >
      {value || placeholder}
    </div>
  );
};

export default InlineEditor;