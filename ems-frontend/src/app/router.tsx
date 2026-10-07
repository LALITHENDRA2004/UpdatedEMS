import { createBrowserRouter, Navigate } from 'react-router'
import { RedirectIfAuthed, RequireAuth, RequirePermission } from '@/auth/guards'
import { AppShell } from '@/components/layout/AppShell'
import { LoginPage } from '@/features/auth/LoginPage'
import { RegisterPage } from '@/features/auth/RegisterPage'
import { AcceptInvitePage } from '@/features/auth/AcceptInvitePage'
import { NotFoundPage } from '@/routes/NotFoundPage'

// App pages are code-split; the router loads each chunk before it navigates, so no Suspense flashes.
export const router = createBrowserRouter([
  {
    element: <RedirectIfAuthed />,
    children: [
      { path: '/login', element: <LoginPage /> },
      { path: '/register', element: <RegisterPage /> },
    ],
  },
  // Reachable whether or not someone is signed in on this browser.
  { path: '/accept-invite', element: <AcceptInvitePage /> },
  {
    element: <RequireAuth />,
    children: [
      {
        element: <AppShell />,
        children: [
          {
            index: true,
            lazy: () => import('@/features/dashboard/DashboardPage').then((m) => ({ Component: m.DashboardPage })),
          },
          {
            path: 'employees',
            lazy: () => import('@/features/employees/EmployeesPage').then((m) => ({ Component: m.EmployeesPage })),
          },
          {
            path: 'employees/:id',
            lazy: () =>
              import('@/features/employees/EmployeeDetailPage').then((m) => ({ Component: m.EmployeeDetailPage })),
          },
          {
            path: 'departments',
            lazy: () => import('@/features/departments/DepartmentsPage').then((m) => ({ Component: m.DepartmentsPage })),
          },
          {
            path: 'team',
            lazy: () =>
              import('@/features/team/TeamPage').then(({ TeamPage }) => ({
                Component: () => (
                  <RequirePermission action="user:list">
                    <TeamPage />
                  </RequirePermission>
                ),
              })),
          },
          {
            path: 'settings',
            children: [
              { index: true, element: <Navigate to="organization" replace /> },
              {
                path: 'organization',
                lazy: () =>
                  import('@/features/settings/OrganizationSettingsPage').then((m) => ({
                    Component: m.OrganizationSettingsPage,
                  })),
              },
              {
                path: 'profile',
                lazy: () => import('@/features/settings/ProfilePage').then((m) => ({ Component: m.ProfilePage })),
              },
            ],
          },
        ],
      },
    ],
  },
  { path: '*', element: <NotFoundPage /> },
])
