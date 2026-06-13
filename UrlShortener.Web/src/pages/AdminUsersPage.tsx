import { useState, useEffect } from 'react';
import AdminNav from '../components/AdminNav';
import { getUsers, updateUserRole, deleteUser } from '../api/admin.api';
import type { AdminUser } from '../types/admin.types';

function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [confirming, setConfirming] = useState<{ user: AdminUser; role: 'USER' | 'ADMIN' } | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setUsers(await getUsers());
      } catch {
        setError('Failed to load users');
      } finally {
        setLoading(false);
      }
    };
    void fetchUsers();
  }, []);

  const requestRoleChange = (user: AdminUser) => {
    const newRole = user.role === 'ADMIN' ? 'USER' : 'ADMIN';
    setConfirming({ user, role: newRole });
  };

  const confirmRoleChange = async () => {
    if (!confirming) return;
    try {
      const updated = await updateUserRole(confirming.user.id, confirming.role);
      setUsers(users.map(u => u.id === confirming.user.id ? updated : u));
      setConfirming(null);
    } catch {
      setError('Failed to update role');
      setConfirming(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this user and all their URLs?')) return;
    try {
      await deleteUser(id);
      setUsers(users.filter(u => u.id !== id));
    } catch {
      setError('Failed to delete user');
    }
  };

  if (loading) return <div className="text-center mt-20">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-100">
      <AdminNav />
      <div className="max-w-4xl mx-auto py-8 px-4">
        <h2 className="text-xl font-semibold mb-6">Users</h2>
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left text-gray-500">
              <tr>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">URLs</th>
                <th className="px-4 py-3">Joined</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id} className="border-t">
                  <td className="px-4 py-3">{user.email}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => requestRoleChange(user)}
                      className={`text-xs px-3 py-1 rounded-full font-medium ${
                        user.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {user.role}
                    </button>
                  </td>
                  <td className="px-4 py-3">{user.urlCount}</td>
                  <td className="px-4 py-3 text-gray-500">
                    {new Date(user.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => void handleDelete(user.id)} className="text-xs text-red-600 hover:underline">
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {confirming && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={() => setConfirming(null)}>
          <div className="bg-white rounded-lg shadow-lg p-6 w-80" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold mb-2">Change role</h3>
            <p className="text-sm text-gray-600 mb-4">
              {confirming.role === 'ADMIN'
                ? `Make ${confirming.user.email} an admin? They'll be able to manage all users and URLs.`
                : `Remove admin access from ${confirming.user.email}?`}
            </p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setConfirming(null)} className="text-sm text-gray-500 hover:underline">Cancel</button>
              <button
                onClick={() => void confirmRoleChange()}
                className={`text-sm px-4 py-2 rounded text-white ${
                  confirming.role === 'ADMIN' ? 'bg-purple-600 hover:bg-purple-700' : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminUsersPage;
