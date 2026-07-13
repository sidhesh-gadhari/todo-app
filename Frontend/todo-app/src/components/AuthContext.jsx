import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
import { toast } from 'react-hot-toast';

const AuthContext = createContext();

const api = axios.create({
   baseURL: import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000/api/v1',
   withCredentials: true
});

export const AuthProvider = ({ children }) => {
   const [user, setUser] = useState(null);
   const [loading, setLoading] = useState(true);
   const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');

   useEffect(() => {
      const interceptorId = api.interceptors.response.use(
         (response) => response,
         async (error) => {
            const originalRequest = error.config;

            if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
               originalRequest._retry = true;

               try {
                  await axios.post(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000/api/v1'}/todo/refresh-token`, {}, { withCredentials: true });
                  return api(originalRequest);
               }
               catch (refreshError) {
                  setUser(null);
                  return Promise.reject(refreshError);
               }
            }
            return Promise.reject(error);
         }
      );
      return () => api.interceptors.response.eject(interceptorId);
   }, []);

   useEffect(() => {
      const checkAuth = async () => {
         try {
            const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000/api/v1'}/todo/session`, { withCredentials: true });
            setUser(res.data.data || null);
         }
         catch {
            setUser(null);
         }
         finally {
            setLoading(false);
         }
      }
      checkAuth();
   }, []);

   const Signup = async (data) => {
      try {
         const res = await api.post('/todo/', data);
         return res.data;
      }
      catch (e) {
         handleError(e);
         throw e;
      }
   }

   const Login = async (data) => {
      try {
         const res = await api.post('/todo/login', data);
         setUser(res.data.data.user);
         return res.data;
      }
      catch (e) {
         handleError(e);
         throw e;
      }
   }

   const Logout = async () => {
      try {
         await api.post('/todo/logout');
         setUser(null);
         toast.success("User Logged Out Successfully!")
      }
      catch (e) {
         handleError(e);
         throw e;
      }
   }

   const AddTask = async (data) => {
      try {
         const res = await api.post('/todo/add-task', data);
         return res.data;
      }
      catch (e) {
         handleError(e);
         throw e;
      }
   }

   const updateCompletion = async (data) => {
      try {
         const res = await api.patch('/todo/update-completion', data);
         return res.data;
      }
      catch (e) {
         handleError(e);
         throw e;
      }
   }

   const updatePriority = async (data) => {
      try {
         const res = await api.patch('/todo/update-priority', data);
         return res.data;
      }
      catch (e) {
         handleError(e);
         throw e;
      }
   }

   const deleteTask = async (id) => {
      try {
         const res = await api.delete(`/todo/delete-task/${id}`);
         return res.data;
      }
      catch (e) {
         handleError(e);
         throw e;
      }
   }

   const deleteAllTasksForUser = async () => {
      try {
         const res = await api.delete('/todo/delete-allTasks');
         return res.data;
      }
      catch (e) {
         handleError(e);
         throw e;
      }
   }

   const deleteUser = async () => {
      try {
         await api.delete(`/todo/delete-user/${user._id}`);
         setUser(null);
         toast.success("User Deleted Successfully! 🗑️");
      }
      catch (e) {
         handleError(e);
         throw e;
      }
   }

   const getErrorMessage = (e) => {
      if (e.response) {
         const status = e.response.status;
         const msg = e.response.data.message || 'An Error Occured!';
         return `Error ${status} : ${msg}`;
      }

      if (e.request) return 'Backend Is Down! Please Check Your Server!';
      return 'Request Failed!';
   }

   const handleError = (e) => {
      toast.dismiss();
      toast.error(getErrorMessage(e));
   }

   const toggleTheme = () => {
      const newTheme = theme === 'light' ? 'dark' : 'light';
      setTheme(newTheme);
      localStorage.setItem('theme', newTheme);
   }

   const value = {
      user,
      loading,
      Signup,
      Login,
      Logout,
      AddTask,
      updateCompletion,
      updatePriority,
      deleteTask,
      deleteAllTasksForUser,
      deleteUser,
      api,
      theme,
      toggleTheme
   }

   return (
      <AuthContext.Provider value={value}>
         {children}
      </AuthContext.Provider>
   )
}

export const useAuth = () => useContext(AuthContext);