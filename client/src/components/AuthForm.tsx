import { useState } from "react";
import { Link } from "react-router-dom";
import { useLoginMutation, useRegisterMutation } from "../api/authApi";
import { useAppDispatch } from "../store/hooks";
import { setCredentials } from "../features/auth/authSlice";
import { baseApi } from "../api/baseApi";
import { fieldClass, primaryBtn } from "../ui";
import { toast } from "react-toastify";

interface AuthFormProps {
  type: "login" | "register";
}

const AuthForm = ({ type }: AuthFormProps) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [login] = useLoginMutation();
  const [register] = useRegisterMutation();
  const dispatch = useAppDispatch();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const response =
        type === "login"
          ? await login({ username, password }).unwrap()
          : await register({ username, password }).unwrap();

      dispatch(setCredentials(response));
      dispatch(baseApi.util.resetApiState());

      toast.success(
        type === "login" ? "Logged in successfully" : "Registered successfully"
      );
    } catch (err: unknown) {
      let message = "Unexpected error";
      if (typeof err === "object" && err !== null) {
        const anyErr = err as { data?: unknown };
        if (typeof anyErr.data === "string") {
          message = anyErr.data;
        } else if (
          anyErr.data &&
          typeof anyErr.data === "object" &&
          "error" in (anyErr.data as Record<string, unknown>) &&
          typeof (anyErr.data as Record<string, unknown>).error === "string"
        ) {
          message = (anyErr.data as { error: string }).error;
        }
      }
      setError(message);
      toast.error(message);
      console.error(err);
    }
  };

  return (
    <div className="mx-auto max-w-lg p-8 rounded-xl bg-[#DDBEA9] shadow-xl">
      <h2 className="text-2xl font-bold mb-6 text-[#6B705C]">
        {type === "login" ? "Login" : "Register"}
      </h2>

      {error && <div className="mb-4 text-[#ffffff]">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="username" className="block text-[#83836f] mb-2">
            Username
          </label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className={fieldClass}
            required
          />
        </div>
        <div className="mb-6">
          <label htmlFor="password" className="block text-[#83836f] mb-2">
            Password
          </label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={fieldClass}
            required
          />
        </div>
        <button type="submit" className={primaryBtn + " w-full mt-4" + " cursor-pointer shrink-0 whitespace-nowrap"}>
          {type === "login" ? "Login" : "Register"}
        </button>
      </form>
      <div className="mt-4 text-center">
        {type === "login" ? (
          <p className="text-[#83836f]">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="text-[#5d6150] hover:text-[#91917b] hover:underline"
            >
              Register
            </Link>
          </p>
        ) : (
          <p className="text-[#83836f]">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-[#5d6150] hover:text-[#91917b] hover:underline"
            >
              Login
            </Link>
          </p>
        )}
      </div>
    </div>
  );
};

export default AuthForm;
