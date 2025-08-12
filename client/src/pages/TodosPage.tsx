import TodoForm from "../components/TodoForm";
import TodoList from "../components/TodoList";
import { useAppSelector, useAppDispatch } from "../store/hooks";
import { useLogoutMutation } from "../api/authApi";
import { logout } from "../features/auth/authSlice";
import { setFilter, resetFilter } from "../features/todos/todosSlice";
import { baseApi } from "../api/baseApi";
import { primaryBtn, secondaryBtn } from "../ui";
import { toast } from "react-toastify";

const TodosPage = () => {
  const { user, refreshToken } = useAppSelector((state) => state.auth);
  const { filter } = useAppSelector((state) => state.todos);
  const [logoutApi] = useLogoutMutation();
  const dispatch = useAppDispatch();

  const handleLogout = async () => {
    let serverFailed = false;
    try {
      if (refreshToken) {
        await logoutApi({ refreshToken }).unwrap();
      }
    } catch (error) {
      console.error("Logout API error:", error);
      serverFailed = true;
      toast.error("Failed to log out from server");
    } finally {
      dispatch(logout());
      dispatch(baseApi.util.resetApiState());
      dispatch(resetFilter());
      toast.success(serverFailed ? "Logged out locally" : "Logged out");
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 rounded-lg shadow-xl bg-[#DDBEA9]">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-[#6B705C]">
          {user?.username ? `${user.username}'s Todos` : "My Todos"}
        </h1>
        <button
          onClick={handleLogout}
          className="
            px-4 py-2 rounded-md transition-colors
            cursor-pointer shrink-0 whitespace-nowrap
            border border-[#6B705C] text-[#6B705C]
            hover:bg-[#6B705C] hover:text-[#FFE8D6]
            focus-visible:ring-2 focus-visible:ring-[#6B705C]
            focus-visible:ring-offset-2 focus-visible:ring-offset-[#DDBEA9]
          "
        >
          Logout
        </button>
      </div>

      <TodoForm />

      <div className="flex flex-wrap sm:flex-nowrap gap-x-3 gap-y-2 my-4">
        {(["all", "active", "completed"] as const).map((f) => (
          <button
            key={f}
            onClick={() => dispatch(setFilter(f))}
            className={`${
              filter === f ? primaryBtn : secondaryBtn
            } cursor-pointer shrink-0 whitespace-nowrap`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      <TodoList />
    </div>
  );
};

export default TodosPage;
