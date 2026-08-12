import React, { createContext, useContext, useEffect, useState } from "react";
import { AuthUser } from "@workspace/api-client-react";
import { useGetMe, getGetMeQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";

interface AuthContextType {
  user: AuthUser | undefined;
  isLoading: boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [localUser, setLocalUser] = useState<AuthUser | undefined>(() => {
    try {
      const saved = localStorage.getItem("eventhub_user");
      return saved ? JSON.parse(saved) : undefined;
    } catch {
      return undefined;
    }
  });

  const { data: serverUser, isLoading } = useGetMe({
    query: {
      queryKey: getGetMeQueryKey(),
      retry: false,
    },
  });

  const user = (serverUser as any) || localUser;

  const queryClient = useQueryClient();

  const logout = () => {
    localStorage.removeItem("eventhub_token");
    localStorage.removeItem("eventhub_user");
    setLocalUser(undefined);
    queryClient.setQueryData(getGetMeQueryKey(), null);
    queryClient.cancelQueries();
    queryClient.clear();
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
