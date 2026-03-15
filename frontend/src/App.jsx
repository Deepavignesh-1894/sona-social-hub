import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './components/ProtectedRoute';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import AppLayout from './pages/AppLayout';
import PublicFeed from './pages/PublicFeed';
import GroupFeed from './pages/GroupFeed';
import MyGroups from './pages/MyGroups';
import JoinGroup from './pages/JoinGroup';
import CreateGroup from './pages/CreateGroup';
import Profile from './pages/Profile';
import AdminDashboard from './pages/admin/AdminDashboard';
import PendingOfficials from './pages/admin/PendingOfficials';
import AllMembers from './pages/admin/AllMembers';
import AllGroups from './pages/admin/AllGroups';
import AllPosts from './pages/admin/AllPosts';
import Reports from './pages/admin/Reports';
import PostDetail from './pages/PostDetail';

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/app"
              element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<PublicFeed />} />
              <Route path="group/:groupId" element={<GroupFeed />} />
              <Route path="groups" element={<MyGroups />} />
              <Route path="join-group" element={<JoinGroup />} />
              <Route path="create-group" element={<CreateGroup />} />
              <Route path="profile" element={<Profile />} />
              <Route path="admin" element={<AdminDashboard />} />
              <Route path="admin/pending" element={<PendingOfficials />} />
              <Route path="admin/members" element={<AllMembers />} />
              <Route path="admin/groups" element={<AllGroups />} />
              <Route path="admin/posts" element={<AllPosts />} />
              <Route path="admin/reports" element={<Reports />} />
              <Route path="post/:postId" element={<PostDetail />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
