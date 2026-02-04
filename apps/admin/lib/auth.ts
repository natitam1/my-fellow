import Cookies from "js-cookie";

const TOKEN_KEY = "admin_token";
const USER_KEY = "admin_user";

export const setToken = (token: string) => {
  Cookies.set(TOKEN_KEY, token, { expires: 7, path: "/" }); // Expires in 7 days
};

export const getToken = () => {
  return Cookies.get(TOKEN_KEY);
};

export const removeToken = () => {
  Cookies.remove(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};

export const setUser = (user: any) => {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};

export const getUser = () => {
  if (typeof window === "undefined") return null;
  const user = localStorage.getItem(USER_KEY);
  return user ? JSON.parse(user) : null;
};

export const isAuthenticated = () => {
  return !!getToken();
};
