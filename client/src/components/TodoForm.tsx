import { useState } from 'react';
import { useAddTodoMutation } from '../api/todosApi';
import { fieldClass, primaryBtn } from '../ui';

const TodoForm = () => {
  const [title, setTitle] = useState('');
  const [addTodo, { isLoading }] = useAddTodoMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim()) {
      try {
        await addTodo({ title }).unwrap();
        setTitle('');
      } catch (err) {
        console.error('Failed to add todo:', err);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mb-6">
      <div className="flex space-x-2">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Add a new todo..."
          className={fieldClass}
        />
        <button
          type="submit"
          disabled={isLoading}
          className={primaryBtn + " cursor-pointer shrink-0 whitespace-nowrap"}
        >
          {isLoading ? 'Adding...' : 'Add'}
        </button>
      </div>
    </form>
  );
};

export default TodoForm;