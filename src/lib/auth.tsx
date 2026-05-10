"use client";

import { createContext, useContext, useEffect, useState } from "react";

interface AuthUser {
	email: string;
	name: string;
	role: string;
}

interface AuthContextType {
	user: AuthUser | null;
	isLoggedIn: boolean;
	login: (user: AuthUser) => void;
	logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
	user: null,
	isLoggedIn: false,
	login: () => {},
	logout: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
	const [user, setUser] = useState<AuthUser | null>(null);

	useEffect(() => {
		const email = localStorage.getItem("userEmail");
		const name = localStorage.getItem("userName");
		const role = localStorage.getItem("userRole");
		if (email && name && role) {
			setUser({ email, name, role });
		}
	}, []);

	const login = (userData: AuthUser) => {
		localStorage.setItem("userEmail", userData.email);
		localStorage.setItem("userName", userData.name);
		localStorage.setItem("userRole", userData.role);
		setUser(userData);
	};

	const logout = () => {
		localStorage.removeItem("userEmail");
		localStorage.removeItem("userName");
		localStorage.removeItem("userRole");
		setUser(null);
	};

	return (
		<AuthContext.Provider value={{ user, isLoggedIn: !!user, login, logout }}>
			{children}
		</AuthContext.Provider>
	);
}

export const useAuth = () => useContext(AuthContext);
