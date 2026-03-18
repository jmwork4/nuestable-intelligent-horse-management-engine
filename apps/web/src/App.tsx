import { Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { AuthGuard } from '@/components/AuthGuard';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ToastContainer } from '@/components/ui/Toast';
import { routes } from '@/routes';

export default function App() {
  return (
    <>
      <Suspense fallback={<div className="flex h-screen items-center justify-center"><LoadingSpinner size="lg" /></div>}>
        <Routes>
          {routes.map((route) => {
            if (route.layout === false) {
              return (
                <Route key={route.path} path={route.path} element={route.element} />
              );
            }
            return (
              <Route
                key={route.path}
                path={route.path}
                element={
                  <AuthGuard>
                    <Layout>{route.element}</Layout>
                  </AuthGuard>
                }
              />
            );
          })}
        </Routes>
      </Suspense>
      <ToastContainer />
    </>
  );
}
