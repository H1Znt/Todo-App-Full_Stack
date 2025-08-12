import { useUpdateTodoMutation, useDeleteTodoMutation } from "../api/todosApi";
import type { Todo } from "../api/todosApi";

const TodoItem = ({ todo }: { todo: Todo }) => {
  const [updateTodo] = useUpdateTodoMutation();
  const [deleteTodo] = useDeleteTodoMutation();

  const handleToggle = () => {
    updateTodo({ id: todo.id, completed: !todo.completed });
  };

  const handleDelete = () => {
    deleteTodo(todo.id);
  };

  return (
    <div
      className="
        flex items-start justify-between gap-3 p-4 mb-3 rounded-lg
        bg-[#ffe8d6c7] text-[#6B705C]
        ring-1 ring-[#CB997E] shadow
      "
    >
      <div className="flex gap-3">
        <input
          type="checkbox"
          checked={todo.completed}
          onChange={handleToggle}
          className="
            h-5 w-5 min-h-[1.25rem] min-w-[1.25rem] shrink-0
            accent-[#6B705C] rounded focus:ring-[#6B705C]
            cursor-pointer mt-[3px]
          "
          aria-label={todo.completed ? "Mark as active" : "Mark as completed"}
        />
        <span
          className={`${
            todo.completed ? "line-through text-[#A5A58D]" : "text-[#6B705C]"
          } break-words whitespace-normal text-pretty`}
        >
          {todo.title}
        </span>
      </div>
      <button
        onClick={handleDelete}
        className="text-[#a7a795] hover:text-[#6B705C] transition-colors shrink-0 cursor-pointer mt-[3px]"
        aria-label="Delete todo"
        title="Delete"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
            clipRule="evenodd"
          />
        </svg>
      </button>
    </div>
  );
};

export default TodoItem;
