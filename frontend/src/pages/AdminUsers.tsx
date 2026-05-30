import { useQuery, useMutation } from '@tanstack/react-query';
import { api } from '../services/api';
import { Shield, Ban, Unlock } from 'lucide-react';

export const AdminUsers = () => {
  const { data: usersResponse, refetch } = useQuery({
    queryKey: ['adminUsersList'],
    queryFn: async () => {
      const res = await api.get('/admin/users');
      return res.data;
    }
  });

  const toggleStatusMutation = useMutation({
    mutationFn: async ({ userId, status }: { userId: string; status: 'active' | 'blocked' }) => {
      return await api.patch(`/admin/users/${userId}/status`, { status });
    },
    onSuccess: () => {
      refetch();
    }
  });

  const usersList = usersResponse?.data || [];

  return (
    <div className="max-w-4xl mx-auto space-y-8 font-sans">
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Shield className="text-primary-500" />
          Manage Platform Users
        </h2>
        <p className="text-sm text-slate-500 dark:text-dark-400">Suspend or restore user and recruiter access privileges across the application.</p>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 dark:border-dark-800 dark:bg-dark-900 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-xs text-slate-500 uppercase dark:border-dark-800">
                <th className="py-3 font-semibold">User Email</th>
                <th className="py-3 font-semibold">System Role</th>
                <th className="py-3 font-semibold">Status</th>
                <th className="py-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm dark:divide-dark-800/50">
              {usersList.map((user: any) => (
                <tr key={user._id}>
                  <td className="py-3.5 font-medium text-slate-800 dark:text-white">{user.email}</td>
                  <td className="py-3.5 uppercase font-bold text-xs text-slate-500">{user.role}</td>
                  <td className="py-3.5">
                    <span className={`
                      inline-block rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase
                      ${user.status === 'blocked' 
                        ? 'bg-red-105 text-red-700 dark:bg-red-950/20 dark:text-red-400' 
                        : 'bg-green-105 text-green-700 dark:bg-green-950/20 dark:text-green-400'}
                    `}>
                      {user.status}
                    </span>
                  </td>
                  <td className="py-3.5 text-right">
                    {user.status === 'blocked' ? (
                      <button
                        onClick={() => toggleStatusMutation.mutate({ userId: user._id, status: 'active' })}
                        className="inline-flex items-center gap-1 text-xs font-bold text-green-600 hover:text-green-500"
                      >
                        <Unlock size={12} /> Restore Access
                      </button>
                    ) : (
                      <button
                        onClick={() => toggleStatusMutation.mutate({ userId: user._id, status: 'blocked' })}
                        className="inline-flex items-center gap-1 text-xs font-bold text-red-650 hover:text-red-500"
                        disabled={user.role === 'admin'}
                      >
                        <Ban size={12} /> Suspend User
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {usersList.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-6 text-center text-slate-400">No users found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminUsers;
