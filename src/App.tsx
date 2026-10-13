  import { Suspense, lazy, useEffect } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { MainLayout } from './layouts/MainLayout'
import { useAuth } from './contexts/AuthContext'
import { LoadingState } from './components/common/StateComponents'

const LoginPage = lazy(() => import('./pages/LoginPage'))
const DashboardPage = lazy(() => import('./pages/DashboardPage'))
const StudentsPage = lazy(() => import('./pages/StudentsPage'))
const TeachersPage = lazy(() => import('./pages/TeachersPage'))
const ClassesPage = lazy(() => import('./pages/ClassesPage'))
const SubjectsPage = lazy(() => import('./pages/SubjectsPage'))
const ScoresPage = lazy(() => import('./pages/ScoresPage'))
const AttendancePage = lazy(() => import('./pages/AttendancePage'))
const ResultsPage = lazy(() => import('./pages/ResultsPage'))
const RewardsPage = lazy(() => import('./pages/RewardsPage'))
const ReportsPage = lazy(() => import('./pages/ReportsPage'))
const AccountsPage = lazy(() => import('./pages/AccountsPage'))

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth()
  const location = useLocation()
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }
  return <>{children}</>
}

function App() {
  const location = useLocation()

  useEffect(() => {
    if (location.pathname && location.pathname !== '/login') {
      sessionStorage.setItem('edumanage_last_path', location.pathname)
    }
  }, [location.pathname])

  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center">
          <LoadingState label="Đang tải..." />
        </div>
      }
    >
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardPage />} />
          <Route path="students" element={<StudentsPage />} />
          <Route path="teachers" element={<TeachersPage />} />
          <Route path="classes" element={<ClassesPage />} />
          <Route path="subjects" element={<SubjectsPage />} />
          <Route path="scores" element={<ScoresPage />} />
          <Route path="attendance" element={<AttendancePage />} />
          <Route path="results" element={<ResultsPage />} />
          <Route path="rewards" element={<RewardsPage />} />
          <Route path="reports" element={<ReportsPage />} />
          <Route path="accounts" element={<AccountsPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  )
}

export default App
