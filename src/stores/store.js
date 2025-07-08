import { configureStore } from "@reduxjs/toolkit";
import HealthReducer from "./reducers/health";
import AuthReducer, { setAxiosStore } from "./reducers/auth";
import CharactersReducer from "./reducers/characters";
import BooksReducer from "./reducers/books";
import { DEBUG_MODE } from "@/utils/constants";

const reducer = {
  health: HealthReducer,
  auth: AuthReducer,
  characters: CharactersReducer,
  books: BooksReducer,
};

export const store = configureStore({
  reducer: reducer,
  devTools: DEBUG_MODE,
});

// Set the store reference for axios interceptor
setAxiosStore(store);
