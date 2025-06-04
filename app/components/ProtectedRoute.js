"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import Loader from "./Loader";

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
  if (loading || !isAuthenticated) {
    return <Loader message={"Authenticating & Verifying..."}/>;
  }

  return children; // If authenticated, render the children (protected content)
}
