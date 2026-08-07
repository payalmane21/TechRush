import '@/lib/socket';
import { queryClient } from '@/lib/queryClient';
import { QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { AuthProvider } from '@/components/auth-provider';
import { ProtectedRoute } from '@/components/protected-route';
import { Route, Switch, Router as WouterRouter } from 'wouter';

// Pages
import Home from '@/pages/home';
import Login from '@/pages/login';
import Signup from '@/pages/signup';
import ForgotPassword from '@/pages/forgot-password';
import ResetPassword from '@/pages/reset-password';
import VerifyEmail from '@/pages/verify-email';
import EventDetail from '@/pages/event-detail';
import NotFound from '@/pages/not-found';

// Dashboard pages
import AttendeeDashboard from '@/pages/dashboard/attendee';
import VolunteerDashboard from '@/pages/dashboard/volunteer';
import VolunteerScan from '@/pages/dashboard/volunteer-scan';
import OrganizerDashboard from '@/pages/dashboard/organizer';
import OrganizerEvents from '@/pages/dashboard/organizer-events';
import EventForm from '@/pages/dashboard/event-form';
import EventAttendance from '@/pages/dashboard/event-attendance';
import EventAnalytics from '@/pages/dashboard/event-analytics';
import OrganizerVolunteers from '@/pages/dashboard/organizer-volunteers';
import AdminPanel from '@/pages/dashboard/admin-panel';
import CalendarPage from '@/pages/dashboard/calendar';
import MessagingCenter from '@/pages/dashboard/messages';
import FeedbackModule from '@/pages/dashboard/feedback';
import CertificatesStudio from '@/pages/dashboard/certificates';
import VerifyCertificatePage from '@/pages/verify-certificate';
import LeaderboardPage from '@/pages/dashboard/leaderboard';
import GamificationHub from '@/pages/dashboard/gamification';
import AiStudioPage from '@/pages/dashboard/ai-studio';
import UserProfilePage from '@/pages/dashboard/profile';
import SettingsPage from '@/pages/dashboard/settings';

import BrowseEvents from '@/pages/browse-events';
import { RealtimeSyncProvider } from '@/components/realtime-sync-provider';

function Router() {
  return (
    <Switch>
      {/* Public Routes */}
      <Route path="/" component={Home} />
      <Route path="/events" component={BrowseEvents} />
      <Route path="/login" component={Login} />
      <Route path="/signup" component={Signup} />
      <Route path="/forgot-password" component={ForgotPassword} />
      <Route path="/reset-password" component={ResetPassword} />
      <Route path="/verify-email" component={VerifyEmail} />
      <Route path="/events/:id" component={EventDetail} />
      <Route path="/verify-certificate/:serial" component={VerifyCertificatePage} />

      {/* Protected Dashboard Routes */}
      <Route path="/dashboard/ai-studio">
        {() => (
          <ProtectedRoute allowedRoles={['attendee', 'volunteer', 'organizer', 'admin']}>
            <AiStudioPage />
          </ProtectedRoute>
        )}
      </Route>

      {/* Protected Dashboard Routes */}
      <Route path="/dashboard/gamification">
        {() => (
          <ProtectedRoute allowedRoles={['attendee', 'volunteer', 'organizer', 'admin']}>
            <GamificationHub />
          </ProtectedRoute>
        )}
      </Route>

      {/* Protected Dashboard Routes */}
      <Route path="/dashboard/leaderboard">
        {() => (
          <ProtectedRoute allowedRoles={['attendee', 'volunteer', 'organizer', 'admin']}>
            <LeaderboardPage />
          </ProtectedRoute>
        )}
      </Route>

      {/* Protected Dashboard Routes */}
      <Route path="/dashboard/certificates">
        {() => (
          <ProtectedRoute allowedRoles={['attendee', 'volunteer', 'organizer', 'admin']}>
            <CertificatesStudio />
          </ProtectedRoute>
        )}
      </Route>

      {/* Protected Dashboard Routes */}
      <Route path="/dashboard/feedback">
        {() => (
          <ProtectedRoute allowedRoles={['attendee', 'volunteer', 'organizer', 'admin']}>
            <FeedbackModule />
          </ProtectedRoute>
        )}
      </Route>
      <Route path="/events/:id/feedback">
        {() => (
          <ProtectedRoute allowedRoles={['attendee', 'volunteer', 'organizer', 'admin']}>
            <FeedbackModule />
          </ProtectedRoute>
        )}
      </Route>

      {/* Protected Dashboard Routes */}
      <Route path="/dashboard/messages">
        {() => (
          <ProtectedRoute allowedRoles={['attendee', 'volunteer', 'organizer', 'admin']}>
            <MessagingCenter />
          </ProtectedRoute>
        )}
      </Route>
      <Route path="/dashboard/calendar">
        {() => (
          <ProtectedRoute allowedRoles={['attendee', 'volunteer', 'organizer', 'admin']}>
            <CalendarPage />
          </ProtectedRoute>
        )}
      </Route>
      <Route path="/dashboard/attendee">
        {() => (
          <ProtectedRoute allowedRoles={['attendee', 'admin']}>
            <AttendeeDashboard />
          </ProtectedRoute>
        )}
      </Route>

      {/* Protected Volunteer Routes */}
      <Route path="/dashboard/volunteer">
        {() => (
          <ProtectedRoute allowedRoles={['volunteer', 'organizer', 'admin']}>
            <VolunteerDashboard />
          </ProtectedRoute>
        )}
      </Route>
      <Route path="/dashboard/volunteer/scan">
        {() => (
          <ProtectedRoute allowedRoles={['volunteer', 'organizer', 'admin']}>
            <VolunteerScan />
          </ProtectedRoute>
        )}
      </Route>

      {/* Protected Admin Routes */}
      <Route path="/dashboard/admin">
        {() => (
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminPanel />
          </ProtectedRoute>
        )}
      </Route>

      {/* Protected Organizer & Admin Routes */}
      <Route path="/dashboard/organizer">
        {() => (
          <ProtectedRoute allowedRoles={['organizer', 'admin']}>
            <OrganizerDashboard />
          </ProtectedRoute>
        )}
      </Route>
      <Route path="/dashboard/organizer/events">
        {() => (
          <ProtectedRoute allowedRoles={['organizer', 'admin']}>
            <OrganizerEvents />
          </ProtectedRoute>
        )}
      </Route>
      <Route path="/dashboard/organizer/events/new">
        {() => (
          <ProtectedRoute allowedRoles={['organizer', 'admin']}>
            <EventForm />
          </ProtectedRoute>
        )}
      </Route>
      <Route path="/dashboard/organizer/events/:id/edit">
        {() => (
          <ProtectedRoute allowedRoles={['organizer', 'admin']}>
            <EventForm />
          </ProtectedRoute>
        )}
      </Route>
      <Route path="/dashboard/organizer/events/:id/attendance">
        {() => (
          <ProtectedRoute allowedRoles={['organizer', 'admin']}>
            <EventAttendance />
          </ProtectedRoute>
        )}
      </Route>

      <Route path="/dashboard/organizer/events/:id/analytics">
        {() => (
          <ProtectedRoute allowedRoles={['organizer', 'admin']}>
            <EventAnalytics />
          </ProtectedRoute>
        )}
      </Route>
      <Route path="/dashboard/organizer/volunteers">
        {() => (
          <ProtectedRoute allowedRoles={['organizer', 'admin']}>
            <OrganizerVolunteers />
          </ProtectedRoute>
        )}
      </Route>
      <Route path="/dashboard/organizer/events/:id/volunteers">
        {() => (
          <ProtectedRoute allowedRoles={['organizer', 'admin']}>
            <OrganizerVolunteers />
          </ProtectedRoute>
        )}
      </Route>

      {/* Profile & Settings Routes */}
      <Route path="/dashboard/profile">
        {() => (
          <ProtectedRoute allowedRoles={['attendee', 'volunteer', 'organizer', 'admin']}>
            <UserProfilePage />
          </ProtectedRoute>
        )}
      </Route>
      <Route path="/dashboard/settings">
        {() => (
          <ProtectedRoute allowedRoles={['attendee', 'volunteer', 'organizer', 'admin']}>
            <SettingsPage />
          </ProtectedRoute>
        )}
      </Route>

      <Route component={NotFound} />
    </Switch>
  );
}

import { ErrorBoundary } from '@/components/error-boundary';
import { SecurityProvider } from '@/components/security-provider';

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <RealtimeSyncProvider>
          <TooltipProvider>
            <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
              <AuthProvider>
                <SecurityProvider>
                  <Router />
                </SecurityProvider>
              </AuthProvider>
            </WouterRouter>
            <Toaster />
          </TooltipProvider>
        </RealtimeSyncProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
