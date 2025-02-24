import axios from "axios";
import { createContext, useEffect, useState } from "react";

export const AuthContext = createContext();

export const AuthContextProvider = ({ children }) => { // Fix: changed "Children" to "children"
    const [currentUser, setCurrentUser] = useState(
        JSON.parse(localStorage.getItem("user")) || null
    );

    const login = async (inputs) => {
        const res = await axios.post("/auth/login", inputs);
        setCurrentUser(res.data);
    };

    const logout = async () => {
        try {
          await fetch("http://localhost:3000/api/logout", {
            method: "POST",
            credentials: "include", // Important for handling cookies
          });
          setCurrentUser(null); // Ensure the state updates after logout
        } catch (err) {
          console.error("Logout failed", err);
        }
      };
      
    

    useEffect(() => {
        localStorage.setItem("user", JSON.stringify(currentUser));
    }, [currentUser]);

    return (
        <AuthContext.Provider value={{ currentUser, login, logout }}>
            {children} {/* Fix: changed "Children" to "children" */}
        </AuthContext.Provider>
    );
};
