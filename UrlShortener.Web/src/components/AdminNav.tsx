import { Link, useNavigate, useLocation } from 'react-router-dom';

function AdminNav() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const linkClass = (path: string) =>
    `text-sm hover:underline ${pathname === path ? 'text-blue-600 font-medium' : 'text-gray-600'}`;

  return (
    <nav className="bg-white shadow px-6 py-4 flex justify-between items-center">
      <div className="flex items-center gap-6">
        <h1 className="text-xl font-bold">Admin</h1>
        <Link to="/admin" className={linkClass('/admin')}>Stats</Link>
        <Link to="/admin/users" className={linkClass('/admin/users')}>Users</Link>
        <Link to="/admin/urls" className={linkClass('/admin/urls')}>URLs</Link>
      </div>
      <button onClick={() => navigate('/dashboard')} className="text-sm text-gray-600 hover:underline">
        Back to app
      </button>
    </nav>
  );
}

export default AdminNav;
