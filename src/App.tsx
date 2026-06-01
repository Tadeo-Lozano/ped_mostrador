import { RouterProvider } from 'react-router-dom';

import { AuthProvider } from './modules/auth/providers/AuthProvider';
import { router } from './app/router';

export function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
}
