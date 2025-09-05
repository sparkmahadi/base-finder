export const getAuthHeaders = () => {
  // window is undefined on server-side, so guard for SSR
  if (typeof window === "undefined") return {};

  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};
