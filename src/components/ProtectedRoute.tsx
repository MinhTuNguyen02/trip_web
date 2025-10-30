import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

type Props = { children: React.ReactElement }; 

export default function ProtectedRoute({ children }: Props) {
  const { user, loading } = useAuth();
  if (loading) return <div className="p-8">Đang tải…</div>;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}
