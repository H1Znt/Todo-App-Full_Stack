import { baseApi } from './baseApi';

export interface Todo {
  id: number;
  title: string;
  completed: boolean;
  userId: number;
}

export const todosApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getTodos: builder.query<Todo[], void>({
      query: () => ({
        url: 'todos',
        method: 'GET',
      }),
      providesTags: ['Todos'],
    }),
    addTodo: builder.mutation<Todo, { title: string }>({
      query: (body) => ({
        url: 'todos',
        method: 'POST',
        data: body,
      }),
      invalidatesTags: ['Todos'],
    }),
    updateTodo: builder.mutation<Todo, { id: number; completed: boolean }>({
      query: ({ id, ...patch }) => ({
        url: `todos/${id}`,
        method: 'PUT',
        data: patch,
      }),
      invalidatesTags: ['Todos'],
    }),
    deleteTodo: builder.mutation<void, number>({
      query: (id) => ({
        url: `todos/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Todos'],
    }),
  }),
});

export const { 
  useGetTodosQuery, 
  useAddTodoMutation, 
  useUpdateTodoMutation, 
  useDeleteTodoMutation 
} = todosApi;