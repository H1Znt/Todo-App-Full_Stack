import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export type Filter = "all" | "active" | "completed";

interface TodosState {
  filter: Filter;
}

const getInitialFilter = (): Filter => {
  if (typeof window === "undefined") return "all";
  const saved = localStorage.getItem("todosFilter");
  return saved === "all" || saved === "active" || saved === "completed" ? saved : "all";
};

const initialState: TodosState = {
  filter: getInitialFilter(), 
};

const todosSlice = createSlice({
  name: "todos",
  initialState,
  reducers: {
    setFilter: (
      state,
      action: PayloadAction<"all" | "active" | "completed">
    ) => {
      state.filter = action.payload;
    },
    resetFilter: (state) => {
      state.filter = "all";
    },
  },
});

export const { setFilter, resetFilter } = todosSlice.actions;
export default todosSlice.reducer;
