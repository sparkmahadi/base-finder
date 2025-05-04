'use client';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import Loader from './Loader';

export default function RouteLoader() {
  const pathname = usePathname();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);

    // Simulate delay for effect — optional
    const timer = setTimeout(() => {
      setLoading(false);
    }, 300); // 300ms

    return () => clearTimeout(timer);
  }, [pathname]);

  return loading ? <Loader/> : null;
}
