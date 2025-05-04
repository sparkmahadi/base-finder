"use client";

import ProtectedRoute from "../components/ProtectedRoute";

export default function SamplesLayout({ children }) {

  return (
    <ProtectedRoute>
    {children}
    </ProtectedRoute>
  );
}
