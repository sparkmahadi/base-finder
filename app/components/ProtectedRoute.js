"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children }) {
  const router = useRouter();
  const { isAuthenticated, loading } = useAuth(); // using loading from context

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      // Redirect to login if not authenticated
      router.replace("/login");
    }
  }, [isAuthenticated, loading, router]);

  // If still loading, show a loading spinner
  if (loading) {
    return <Loader />;
  }

  // If not authenticated, don't render children (handled by useEffect)
  if (!isAuthenticated) {
    return <h3>Loading  & Authenticating.......</h3>; // Optionally, return nothing while redirecting
  }

  return children; // If authenticated, render the children (protected content)
}
