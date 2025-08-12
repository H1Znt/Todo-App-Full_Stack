import { useGetTodosQuery } from '../api/todosApi';
import TodoItem from './TodoItem';
import type { Todo } from '../api/todosApi';
import { useAppSelector } from '../store/hooks';
import LoadingSpinner from './LoadingSpinner';

const TodoList = () => {
  const { filter } = useAppSelector((state) => state.todos);
  const { data: todos = [], isLoading, isError } = useGetTodosQuery();

  const filteredTodos = todos.filter((todo: Todo) => {
    if (filter === 'active') return !todo.completed;
    if (filter === 'completed') return todo.completed;
    return true;
  });

  const sortedTodos = [...filteredTodos].sort((a: Todo, b: Todo) => {
    return (b.id ?? 0) - (a.id ?? 0);
  });

  if (isLoading) return <LoadingSpinner />;
  if (isError) return <div className="text-[#CB997E]">Error loading todos</div>;

  return (
    <div className="space-y-3">
      {sortedTodos.length === 0 ? (
        <div className="text-center py-4 text-[#A5A58D]">No todos found</div>
      ) : (
        sortedTodos.map((todo: Todo) => <TodoItem key={todo.id} todo={todo} />)
      )}
    </div>
  );
};

export default TodoList;