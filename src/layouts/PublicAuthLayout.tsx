import { Outlet } from 'react-router-dom';

export function PublicAuthLayout() {
  return (
    <div className="min-h-dvh bg-surface-tint">
      <div className="mx-auto flex min-h-dvh max-w-[1280px] flex-col justify-center px-6 py-16 lg:px-8">
        <Outlet />
      </div>
    </div>
  );
}
