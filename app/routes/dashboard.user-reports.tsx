import { useEffect, useState } from 'react';
import { Link, useLoaderData } from 'react-router';
import type { Route } from './+types/dashboard.user-reports';
import connectDB from '~/lib/db.server';
import User from '~/models/User.server';
import PersonalityTest from '~/models/PersonalityTest.server';

const DISC_COLORS: Record<string, { label: string; badge: string }> = {
  R: { label: 'Rouge (D)', badge: 'border-red-200 bg-red-100 text-red-800' },
  J: { label: 'Jaune (I)', badge: 'border-yellow-200 bg-yellow-100 text-yellow-800' },
  Y: { label: 'Jaune (I)', badge: 'border-yellow-200 bg-yellow-100 text-yellow-800' },
  V: { label: 'Vert (S)', badge: 'border-green-200 bg-green-100 text-green-800' },
  G: { label: 'Vert (S)', badge: 'border-green-200 bg-green-100 text-green-800' },
  B: { label: 'Bleu (C)', badge: 'border-blue-200 bg-blue-100 text-blue-800' },
};

export async function loader() {
  await connectDB();
  const [users, personalityTests] = await Promise.all([
    User.find().select('_id firstName lastName email profilePhoto createdAt').sort({ createdAt: -1 }).lean(),
    PersonalityTest.find({ completed: true }).select('userId dominantColor').lean(),
  ]);
  const discByUser = new Map(personalityTests.map((test) => [String(test.userId), test.dominantColor || null]));

  return {
    users: users.map((user) => ({
      id: String(user._id),
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      profilePhoto: user.profilePhoto || null,
      createdAt: user.createdAt,
      discColor: discByUser.get(String(user._id)) || null,
    })),
  };
}

export default function UserReports() {
  const { users } = useLoaderData<typeof loader>();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const filtered = users.filter((user) =>
    `${user.firstName} ${user.lastName} ${user.email}`.toLowerCase().includes(search.toLowerCase()),
  );
  const pageCount = Math.ceil(filtered.length / pageSize);
  const pageUsers = filtered.slice((page - 1) * pageSize, page * pageSize);

  useEffect(() => setPage(1), [search]);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold text-gray-900">User Reports</h1>
        <p className="mt-1 text-gray-600">{users.length} users · detailed results for each assessment</p>
      </header>

      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search by name or email..."
          className="w-full rounded-lg border border-gray-300 px-4 py-2 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
        />
      </div>

      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="border-b bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-500">
            <tr>
              <th className="p-4">User</th>
              <th className="p-4">Email</th>
              <th className="p-4">DISC Color</th>
              <th className="p-4">Joined</th>
              <th className="p-4 text-right">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {pageUsers.map((user) => {
              const disc = user.discColor ? DISC_COLORS[user.discColor] : null;
              return (
                <tr key={user.id} className="transition-colors hover:bg-gray-50">
                  <td className="p-4">
                    <Link to={`/dashboard/user-reports/${user.id}`} className="group flex items-center gap-3">
                      {user.profilePhoto ? (
                        <img src={user.profilePhoto} alt="" className="h-10 w-10 rounded-full border object-cover" referrerPolicy="no-referrer" />
                      ) : (
                        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 font-semibold text-gray-700">
                          {`${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase()}
                        </span>
                      )}
                      <span className="font-semibold text-gray-900 group-hover:text-blue-700">{user.firstName} {user.lastName}</span>
                    </Link>
                  </td>
                  <td className="p-4 text-gray-600">{user.email}</td>
                  <td className="p-4">
                    {disc ? <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${disc.badge}`}>{disc.label}</span> : <span className="italic text-gray-400">Not completed</span>}
                  </td>
                  <td className="p-4 text-gray-600">{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '—'}</td>
                  <td className="p-4 text-right">
                    <Link to={`/dashboard/user-reports/${user.id}`} className="inline-flex rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 hover:bg-blue-100">
                      View results →
                    </Link>
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && <tr><td colSpan={5} className="p-8 text-center text-gray-500">No users found.</td></tr>}
          </tbody>
        </table>
      </div>

      {filtered.length > 0 && (
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>{(page - 1) * pageSize + 1}–{Math.min(page * pageSize, filtered.length)} of {filtered.length} users</span>
          <div className="flex items-center gap-2">
            <button onClick={() => setPage((current) => Math.max(1, current - 1))} disabled={page === 1} className="rounded-lg border bg-white px-3 py-1.5 disabled:cursor-not-allowed disabled:opacity-50">Previous</button>
            <span>Page {page} of {Math.max(pageCount, 1)}</span>
            <button onClick={() => setPage((current) => Math.min(pageCount, current + 1))} disabled={page === pageCount} className="rounded-lg border bg-white px-3 py-1.5 disabled:cursor-not-allowed disabled:opacity-50">Next</button>
          </div>
        </div>
      )}
    </div>
  );
}
