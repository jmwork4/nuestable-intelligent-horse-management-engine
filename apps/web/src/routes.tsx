import { lazy, type ReactNode } from 'react';

const LoginPage = lazy(() => import('@/features/auth/LoginPage'));
const RegisterPage = lazy(() => import('@/features/auth/RegisterPage'));
const DashboardPage = lazy(() => import('@/features/dashboard/DashboardPage'));
const HorseListPage = lazy(() => import('@/features/horses/HorseListPage'));
const HorseProfilePage = lazy(() => import('@/features/horses/HorseProfilePage'));
const HorseForm = lazy(() => import('@/features/horses/HorseForm'));
const RaceCalendarPage = lazy(() => import('@/features/races/RaceCalendarPage'));
const RaceDayDashboard = lazy(() => import('@/features/races/RaceDayDashboard'));
const RaceDetailPage = lazy(() => import('@/features/races/RaceDetailPage'));
const EligibilityChecker = lazy(() => import('@/features/races/EligibilityChecker'));
const ChecklistPage = lazy(() => import('@/features/operations/ChecklistPage'));
const FeedLogPage = lazy(() => import('@/features/operations/FeedLogPage'));
const TherapyLogPage = lazy(() => import('@/features/operations/TherapyLogPage'));
const TaskBoard = lazy(() => import('@/features/operations/TaskBoard'));
const BarnMap = lazy(() => import('@/features/operations/BarnMap'));
const MedicationLog = lazy(() => import('@/features/health/MedicationLog'));
const VaccinationManager = lazy(() => import('@/features/health/VaccinationManager'));
const InjuryTracker = lazy(() => import('@/features/health/InjuryTracker'));
const PreRaceClearance = lazy(() => import('@/features/health/PreRaceClearance'));
const DocumentRepository = lazy(() => import('@/features/documents/DocumentRepository'));
const UploadPage = lazy(() => import('@/features/documents/UploadPage'));
const ExpiryTracker = lazy(() => import('@/features/documents/ExpiryTracker'));
const ExpenseTracker = lazy(() => import('@/features/financial/ExpenseTracker'));
const InvoiceManagement = lazy(() => import('@/features/financial/InvoiceManagement'));
const CostPerHorse = lazy(() => import('@/features/financial/CostPerHorse'));
const OwnerDashboard = lazy(() => import('@/features/owner-portal/OwnerDashboard'));
const OwnerHorseView = lazy(() => import('@/features/owner-portal/OwnerHorseView'));
const Messaging = lazy(() => import('@/features/owner-portal/Messaging'));
const SyndicateVoting = lazy(() => import('@/features/owner-portal/SyndicateVoting'));
const NotificationCenter = lazy(() => import('@/features/notifications/NotificationCenter'));
const NotificationPreferences = lazy(() => import('@/features/notifications/NotificationPreferences'));

export interface AppRoute {
  path: string;
  element: ReactNode;
  layout?: boolean;
}

export const routes: AppRoute[] = [
  // Auth (no layout)
  { path: '/login', element: <LoginPage />, layout: false },
  { path: '/register', element: <RegisterPage />, layout: false },

  // Dashboard
  { path: '/', element: <DashboardPage /> },
  { path: '/dashboard', element: <DashboardPage /> },

  // Horses
  { path: '/horses', element: <HorseListPage /> },
  { path: '/horses/new', element: <HorseForm /> },
  { path: '/horses/:id', element: <HorseProfilePage /> },
  { path: '/horses/:id/edit', element: <HorseForm /> },

  // Races
  { path: '/races', element: <RaceCalendarPage /> },
  { path: '/races/today', element: <RaceDayDashboard /> },
  { path: '/races/:id', element: <RaceDetailPage /> },
  { path: '/races/eligibility', element: <EligibilityChecker /> },

  // Operations
  { path: '/operations/checklist', element: <ChecklistPage /> },
  { path: '/operations/feed', element: <FeedLogPage /> },
  { path: '/operations/therapy', element: <TherapyLogPage /> },
  { path: '/operations/tasks', element: <TaskBoard /> },
  { path: '/operations/barn', element: <BarnMap /> },

  // Health
  { path: '/health/medications', element: <MedicationLog /> },
  { path: '/health/vaccinations', element: <VaccinationManager /> },
  { path: '/health/injuries', element: <InjuryTracker /> },
  { path: '/health/clearance', element: <PreRaceClearance /> },

  // Documents
  { path: '/documents', element: <DocumentRepository /> },
  { path: '/documents/upload', element: <UploadPage /> },
  { path: '/documents/expiry', element: <ExpiryTracker /> },

  // Financial
  { path: '/financial/expenses', element: <ExpenseTracker /> },
  { path: '/financial/invoices', element: <InvoiceManagement /> },
  { path: '/financial/cost-per-horse', element: <CostPerHorse /> },

  // Owner Portal
  { path: '/owner-portal', element: <OwnerDashboard /> },
  { path: '/owner-portal/horses/:id', element: <OwnerHorseView /> },
  { path: '/owner-portal/messages', element: <Messaging /> },
  { path: '/owner-portal/voting', element: <SyndicateVoting /> },

  // Notifications
  { path: '/notifications', element: <NotificationCenter /> },
  { path: '/notifications/preferences', element: <NotificationPreferences /> },
];
