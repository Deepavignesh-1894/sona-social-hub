const API = import.meta.env.VITE_API_URL || '/api';

function getToken() {
  return localStorage.getItem('token');
}

export async function request(path, options = {}) {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };
  const res = await fetch(`${API}${path}`, { ...options, headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || 'Request failed');
  return data;
}

export async function uploadFile(file) {
  const token = getToken();
  const form = new FormData();
  form.append('file', file);
  const res = await fetch(`${API}/upload/image`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: form,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Upload failed');
  return data.url;
}

export const auth = {
  login: (email, password) => request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  register: (body) => request('/auth/register', { method: 'POST', body: JSON.stringify(body) }),
  me: () => request('/auth/me'),
  verifyEmail: (token) => request('/auth/verify-email', { method: 'POST', body: JSON.stringify({ token }) }),
  resendVerification: () => request('/auth/resend-verification', { method: 'POST' }),
  forgotPassword: (email) => request('/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email }) }),
  resetPassword: (token, password) => request('/auth/reset-password', { method: 'POST', body: JSON.stringify({ token, password }) }),
};

export const users = {
  officials: (q) => request(`/users/officials${q ? `?q=${encodeURIComponent(q)}` : ''}`),
  groupOfficials: (groupId) => request(`/users/group-officials/${groupId}`),
  profile: () => request('/users/profile'),
  updateProfile: (body) => request('/users/profile', { method: 'PATCH', body: JSON.stringify(body) }),
  adminAll: () => request('/users/admin/all'),
  adminApproveOfficial: (id) => request(`/users/admin/approve-official/${id}`, { method: 'PATCH' }),
  adminSetRole: (id, role) => request(`/users/admin/role/${id}`, { method: 'PATCH', body: JSON.stringify({ role }) }),
};

export const groups = {
  list: () => request('/groups'),
  my: () => request('/groups/my'),
  get: (id) => request(`/groups/${id}`),
  members: (id) => request(`/groups/${id}/members`),
  create: (body) => request('/groups', { method: 'POST', body: JSON.stringify(body) }),
  join: (id) => request(`/groups/${id}/join`, { method: 'POST' }),
  leave: (id) => request(`/groups/${id}/leave`, { method: 'POST' }),
  update: (id, body) => request(`/groups/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
  delete: (id) => request(`/groups/${id}`, { method: 'DELETE' }),
};

export const posts = {
  public: () => request('/posts/public'),
  group: (groupId) => request(`/posts/group/${groupId}`),
  get: (id) => request(`/posts/${id}`),
  create: (body) => request('/posts', { method: 'POST', body: JSON.stringify(body) }),
  like: (id) => request(`/posts/${id}/like`, { method: 'PATCH' }),
  pollVote: (id, optionIndex) => request(`/posts/${id}/poll-vote`, { method: 'POST', body: JSON.stringify({ optionIndex }) }),
  delete: (id) => request(`/posts/${id}`, { method: 'DELETE' }),
};

export const comments = {
  list: (postId) => request(`/comments/post/${postId}`),
  create: (postId, content) => request('/comments', { method: 'POST', body: JSON.stringify({ postId, content }) }),
  like: (id) => request(`/comments/${id}/like`, { method: 'PATCH' }),
  delete: (id) => request(`/comments/${id}`, { method: 'DELETE' }),
};

export const messages = {
  list: (groupId) => request(`/messages/group/${groupId}`),
  create: (groupId, content, attachments, replyTo) => request('/messages', { method: 'POST', body: JSON.stringify({ groupId, content, attachments, replyTo }) }),
  delete: (id) => request(`/messages/${id}`, { method: 'DELETE' }),
  react: (id, emoji) => request(`/messages/${id}/react`, { method: 'POST', body: JSON.stringify({ emoji }) }),
};

export const reports = {
  create: (body) => request('/reports', { method: 'POST', body: JSON.stringify(body) }),
  list: () => request('/reports'),
  setStatus: (id, status) => request(`/reports/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
};

export const admin = {
  dashboard: () => request('/admin/dashboard'),
  pendingOfficials: () => request('/admin/pending-officials'),
  allPosts: () => request('/admin/all-posts'),
  allGroups: () => request('/admin/all-groups'),
  allUsersDetailed: () => request('/admin/all-users-detailed'),
  groupActivity: (groupId) => request(`/admin/group-activity/${groupId}`),
  banUser: (id, ban) => request(`/admin/user/${id}/ban`, { method: 'PATCH', body: JSON.stringify({ ban }) }),
  
  // New enhanced admin controls
  deleteUser: (id) => request(`/admin/user/${id}`, { method: 'DELETE' }),
  updateUserRole: (id, role, officialTitle) => request(`/admin/user/${id}/role`, { method: 'PATCH', body: JSON.stringify({ role, officialTitle }) }),
  verifyUserEmail: (id) => request(`/admin/user/${id}/verify-email`, { method: 'PATCH' }),
  deletePost: (id) => request(`/admin/post/${id}`, { method: 'DELETE' }),
  deleteComment: (id) => request(`/admin/comment/${id}`, { method: 'DELETE' }),
  deleteGroup: (id) => request(`/admin/group/${id}`, { method: 'DELETE' }),
  getUnverifiedUsers: () => request('/admin/users-unverified'),
  getAllUsers: (page = 1, limit = 50, search = '') => request(`/admin/users?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}`),
  getStats: () => request('/admin/stats'),
  approveOfficial: (id) => request(`/admin/approve-official/${id}`, { method: 'PATCH' }),
  rejectOfficial: (id) => request(`/admin/reject-official/${id}`, { method: 'PATCH' }),
  getReports: (status = 'all') => request(`/admin/reports?status=${status}`),
  handleReport: (id, action, status) => request(`/admin/report/${id}`, { method: 'PATCH', body: JSON.stringify({ action, status }) }),
};
