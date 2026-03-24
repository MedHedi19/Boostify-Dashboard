import { useState } from "react";
import { useLoaderData, Link } from "react-router";
import connectDB from '../lib/db.server';
import QuizResultModel from '../models/QuizResult.server';
import User from '../models/User.server';
import UserProgress from '../models/UserProgress.server';

type QuizResult = {
  _id: string;
  userId: string;
  // populated user info (when available)
  user?: {
    _id: string;
    firstName: string;
    lastName: string;
    email?: string;
    profilePhoto?: string;
    certificateSentCount?: number;
    payment?: any;
  } | null;
  userName: string;
  quizKey: string; // e.g. "empowring"
  score: number;
  validated?: boolean;
  takenAt: string;
};

export default function QuizzesManagement() {
  // use server loader data to avoid API routing mismatch
  const loaderData = useLoaderData() as { results: QuizResult[]; totalUsers?: number; users?: any[] } | undefined;
  const [results, setResults] = useState<QuizResult[]>(loaderData?.results || []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const usersList = loaderData?.users || [];
  const validatedUsers = usersList.filter((u: any) => (u.globalScore || 0) >= 85);
  const nonValidatedUsers = usersList.filter((u: any) => (u.globalScore || 0) < 85);
  const [selectedBox, setSelectedBox] = useState<'none' | 'all' | 'validated' | 'nonValidated'>('none');
  const totalUsers = loaderData?.totalUsers ?? results.length;
  const [userSearch, setUserSearch] = useState('');

  const getInitials = (name = '') => {
    return name.split(' ').map(s => s[0]).join('').slice(0, 2).toUpperCase();
  };

  const toggleValidate = async (id: string) => {
    // optimistic UI
    setResults((prev) => prev.map(r => r._id === id ? { ...r, validated: !r.validated } : r));

    try {
      const res = await fetch(`/api/quiz-results/toggle-validate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `HTTP ${res.status}`);
      }

      const updated: QuizResult = await res.json();
      setResults((prev) => prev.map(r => r._id === updated._id ? updated : r));
    } catch (e: any) {
      // revert optimistic change
      setResults((prev) => prev.map(r => r._id === id ? { ...r, validated: !r.validated } : r));
      setError(e.message || "Failed to update");
    }
  };

  return (
    <div>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <h1 className="text-2xl font-bold text-black">7P — Résultats par utilisateur</h1>
      <Link
        to="/dashboard/quizzes/management"
        className="group inline-flex items-center justify-center gap-2 rounded-xl bg-linear-to-r from-blue-700 via-indigo-600 to-cyan-500 px-5 py-2.5 text-sm font-bold text-white shadow-[0_12px_30px_-14px_rgba(29,78,216,0.95)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_16px_34px_-14px_rgba(29,78,216,1)] focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
      >
        Management 7P
        <span className="transition-transform duration-200 group-hover:translate-x-0.5">-&gt;</span>
      </Link>
      </div>
      {loading && <p>Chargement...</p>}
      {error && <p className="text-red-600">Erreur: {error}</p>}

      {/* Compact validated + non-validated users boxes */}
      <div className="mb-6">
        <div className="flex items-stretch space-x-4">
          {/* Total users box */}
          <div className={`flex-1 bg-gradient-to-b from-green-50 to-white rounded-xl shadow-sm border border-green-100 p-4 h-40 flex flex-col justify-between`}>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-green-900">Tous les utilisateurs</h3>
                <p className="text-sm text-green-700">Base de données</p>
              </div>
              <div className="flex items-center space-x-3">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-900">{totalUsers}</div>
                  <div className="text-xs text-green-600">total</div>
                </div>
              </div>
            </div>
            <div className="mt-3 text-sm text-gray-600"></div>
          </div>
          {/* Validated box */}
          <div className={`flex-1 bg-gradient-to-b from-indigo-50 to-white rounded-xl shadow-sm border border-indigo-100 p-4 h-40 flex flex-col justify-between`}>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-indigo-900">Utilisateurs validés</h3>
                <p className="text-sm text-indigo-700">Total score ≥ 85%</p>
              </div>
              <div className="flex items-center space-x-3">
                <button onClick={() => setSelectedBox(selectedBox === 'validated' ? 'none' : 'validated')} className="text-center">
                  <div className="text-2xl font-bold text-indigo-900">{validatedUsers.length}</div>
                  <div className="text-xs text-indigo-600">validés</div>
                </button>
                <div className="flex -space-x-2">
                  {validatedUsers.slice(0, 6).map(u => (
                    <button title={`${u.firstName} ${u.lastName}`} key={u._id} className="h-10 w-10 rounded-full ring-2 ring-white shadow-sm overflow-hidden" style={{ backgroundColor: '#eef2ff' }}>
                      {u.profilePhoto ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={u.profilePhoto} alt={`${u.firstName} ${u.lastName}`} className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center text-indigo-700 font-semibold">{getInitials(`${u.firstName} ${u.lastName}`)}</div>
                      )}
                    </button>
                  ))}
                  {validatedUsers.length > 6 && (
                    <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center text-sm text-gray-700 ring-2 ring-white">+{validatedUsers.length - 6}</div>
                  )}
                </div>
              </div>
            </div>

            {/* Expanded details area (shows below the header) */}
            <div className="mt-3">
              {validatedUsers.slice(0, 6).map(u => (
                expanded[u._id] ? (
                  <div key={u._id} className="mt-2 p-3 bg-white border border-gray-100 rounded text-sm">
                    <ul className="space-y-1 text-gray-700">
                      <li><strong>Utilisateur:</strong> {u.firstName} {u.lastName}</li>
                      <li><strong>Email:</strong> {u.email || '—'}</li>
                      <li><strong>Score Global:</strong> {u.globalScore}%</li>
                      <li><strong>Quiz complétés:</strong> {u.completedQuizzes}/{u.totalQuizzes ?? 0}</li>
                      <li><strong>Certificats envoyés:</strong> {u.certificateSentCount ?? 0}</li>
                    </ul>
                  </div>
                ) : null
              ))}
            </div>
          </div>

          {/* Non-validated box */}
          <div onClick={() => setSelectedBox(selectedBox === 'nonValidated' ? 'none' : 'nonValidated')} className={`flex-1 bg-gradient-to-b from-yellow-50 to-white rounded-xl shadow-sm border border-yellow-100 p-4 h-40 flex flex-col justify-between`}>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-yellow-900">Utilisateurs non validés</h3>
                <p className="text-sm text-yellow-700">Empowring</p>
              </div>
              <div className="flex items-center space-x-3">
                <button onClick={() => setSelectedBox(selectedBox === 'nonValidated' ? 'none' : 'nonValidated')} className="text-center">
                  <div className="text-2xl font-bold text-yellow-900">{nonValidatedUsers.length}</div>
                  <div className="text-xs text-yellow-600">non validés</div>
                </button>
                <div className="flex -space-x-2">
                  {nonValidatedUsers.slice(0, 6).map(u => (
                    <button key={u._id} onClick={() => { setExpanded(prev => ({ ...prev, [u._id]: !prev[u._id] })); setSelectedBox('nonValidated'); }} title={u.userName} className="h-10 w-10 rounded-full ring-2 ring-white shadow-sm overflow-hidden" style={{ backgroundColor: '#fff7ed' }}>
                      {u.user?.profilePhoto ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={u.user.profilePhoto} alt={u.userName} className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center text-yellow-700 font-semibold">{getInitials(u.userName)}</div>
                      )}
                    </button>
                  ))}
                  {nonValidatedUsers.length > 6 && (
                    <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center text-sm text-gray-700 ring-2 ring-white">+{nonValidatedUsers.length - 6}</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Center area: show the 'all' users view, validated users view, or a placeholder for non-validated */}
      <div className="mb-6">
        {(selectedBox === 'all' || (!loading && results.length === 0 && selectedBox === 'none')) && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Tous les utilisateurs</h3>
                <p className="text-sm text-gray-500">Liste des utilisateurs enregistrés</p>
              </div>
              <div className="flex items-center space-x-3">
                <input
                  type="text"
                  placeholder="Rechercher par nom ou email..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="px-3 py-2 border border-gray-200 rounded-md shadow-sm w-64"
                />
              </div>
            </div>

            {usersList.length === 0 ? (
              <div className="text-sm text-gray-600">Aucun utilisateur trouvé.</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {usersList
                  .filter(u => {
                    if (!userSearch) return true;
                    const q = userSearch.toLowerCase();
                    const name = `${u.firstName || ''} ${u.lastName || ''}`.toLowerCase();
                    return name.includes(q) || (u.email || '').toLowerCase().includes(q);
                  })
                  .map((u: any) => (
                    <Link
                      to={`/dashboard/quizzes/${u._id.toString()}`}
                      key={u._id.toString()}
                      className="bg-white border border-gray-100 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow block hover:border-blue-200"
                    >
                      <div className="flex items-center">
                        {u.profilePhoto ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={u.profilePhoto} alt={`${u.firstName} ${u.lastName}`} className="h-12 w-12 rounded-full object-cover mr-4" referrerPolicy="no-referrer" />
                        ) : (
                          <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center mr-4 text-gray-700 font-semibold">{(u.firstName?.[0] || '') + (u.lastName?.[0] || '')}</div>
                        )}
                        <div className="flex-1">
                          <div className="font-medium text-gray-900 group-hover:text-blue-600">{u.firstName} {u.lastName}</div>
                          <div className="text-sm text-gray-500">{u.email || '—'}</div>
                        </div>
                        <div className="text-sm text-gray-600 text-right">
                          <div className="font-semibold text-gray-800">{u.completedQuizzes ?? 0}/{u.totalQuizzes ?? 0}</div>
                        </div>
                      </div>
                      <div className="mt-3 flex items-center justify-between text-sm text-gray-500">
                        <div>Subscription: {u.payment?.subscriptionType || '—'}</div>
                        <div>Join: {new Date(u.createdAt || u._id?.getTimestamp?.() || Date.now()).toLocaleDateString()}</div>
                      </div>
                    </Link>
                  ))}
              </div>
            )}
          </div>
        )}

        {selectedBox === 'validated' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Utilisateurs validés</h3>
                <p className="text-sm text-gray-500">Résultats Empowring validés</p>
              </div>
              <div className="flex items-center space-x-3">
                <input
                  type="text"
                  placeholder="Rechercher par nom ou email..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="px-3 py-2 border border-gray-200 rounded-md shadow-sm w-64"
                />
              </div>
            </div>

            {validatedUsers.length === 0 ? (
              <div className="text-sm text-gray-600">Aucun utilisateur validé.</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {validatedUsers
                  .filter(r => {
                    if (!userSearch) return true;
                    const q = userSearch.toLowerCase();
                    const name = r.user ? `${r.user.firstName || ''} ${r.user.lastName || ''}`.toLowerCase() : (r.userName || '').toLowerCase();
                    const email = r.user?.email || '';
                    return name.includes(q) || email.toLowerCase().includes(q);
                  })
                  .map((r) => (
                    <div key={r._id.toString()} className="bg-white border border-gray-100 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
                      <Link to={`/dashboard/quizzes/${r.userId.toString()}`} className="flex items-center hover:opacity-80 transition-opacity">
                        {r.user?.profilePhoto ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={r.user.profilePhoto} alt={r.userName} className="h-12 w-12 rounded-full object-cover mr-4" referrerPolicy="no-referrer" />
                        ) : (
                          <div className="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center mr-4 text-indigo-700 font-semibold">{getInitials(r.userName)}</div>
                        )}
                        <div className="flex-1 text-left">
                          <div className="font-medium text-gray-900">{r.user ? `${r.user.firstName} ${r.user.lastName}` : r.userName}</div>
                          <div className="text-sm text-gray-500">{r.user?.email || '—'}</div>
                        </div>
                        <div className="text-sm text-gray-600 text-right">
                          <div className="font-semibold text-gray-800">{r.score}%</div>
                          <div className="text-xs text-gray-500">score</div>
                        </div>
                      </Link>
                      <div className="mt-3 flex items-center justify-between text-sm text-gray-500">
                        <div>Passé le: {new Date(r.takenAt).toLocaleDateString()}</div>
                        <div>
                          <button onClick={() => toggleValidate(r._id)} className="px-3 py-1 rounded bg-red-50 text-red-600">Annuler</button>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}

        {(selectedBox === 'nonValidated') && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Utilisateurs non validés</h3>
                <p className="text-sm text-gray-500">En progression — Empowring / Upskilling</p>
              </div>
              <div className="flex items-center space-x-3">
                <input
                  type="text"
                  placeholder="Rechercher par nom ou email..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="px-3 py-2 border border-gray-200 rounded-md shadow-sm w-64"
                />
              </div>
            </div>

            {nonValidatedUsers.length === 0 ? (
              <div className="text-sm text-gray-600">Aucun utilisateur en progression.</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {nonValidatedUsers
                  .filter(r => {
                    if (!userSearch) return true;
                    const q = userSearch.toLowerCase();
                    const name = r.user ? `${r.user.firstName || ''} ${r.user.lastName || ''}`.toLowerCase() : (r.userName || '').toLowerCase();
                    const email = r.user?.email || '';
                    return name.includes(q) || email.toLowerCase().includes(q);
                  })
                  .map((r) => (
                    <div key={r._id.toString()} className="bg-white border border-gray-100 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
                      <Link to={`/dashboard/quizzes/${r.userId.toString()}`} className="flex items-center hover:opacity-80 transition-opacity">
                        {r.user?.profilePhoto ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={r.user.profilePhoto} alt={r.userName} className="h-12 w-12 rounded-full object-cover mr-4" referrerPolicy="no-referrer" />
                        ) : (
                          <div className="h-12 w-12 rounded-full bg-yellow-100 flex items-center justify-center mr-4 text-yellow-700 font-semibold">{getInitials(r.userName)}</div>
                        )}
                        <div className="flex-1 text-left">
                          <div className="font-medium text-gray-900">{r.user ? `${r.user.firstName} ${r.user.lastName}` : r.userName}</div>
                          <div className="text-sm text-gray-500">{r.user?.email || '—'}</div>
                        </div>
                        <div className="text-sm text-gray-600 text-right">
                          <div className="font-semibold text-gray-800">{r.score}%</div>
                          <div className="text-xs text-gray-500">score</div>
                        </div>
                      </Link>
                      <div className="mt-3 flex items-center justify-between text-sm text-gray-500">
                        <div>Passé le: {new Date(r.takenAt).toLocaleDateString()}</div>
                        <div>
                          <button onClick={() => toggleValidate(r._id)} className="px-3 py-1 rounded bg-green-600 text-white">Valider</button>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}
      </div>


      {!loading && results.length > 0 && (
        <div className="overflow-auto bg-white rounded-xl shadow-sm border border-gray-200">
          <table className="min-w-full table-auto">
            <thead>
              <tr className="text-left">
                <th className="px-4 py-3 border-b bg-gray-50 text-sm text-gray-700">Utilisateur</th>
                <th className="px-4 py-3 border-b bg-gray-50 text-sm text-gray-700">Score</th>
                <th className="px-4 py-3 border-b bg-gray-50 text-sm text-gray-700">Validé</th>
                <th className="px-4 py-3 border-b bg-gray-50 text-sm text-gray-700">Date</th>
                <th className="px-4 py-3 border-b bg-gray-50 text-sm text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {results.map((r) => (
                <tr key={r._id.toString()} className="hover:bg-gray-50">
                  <td className="px-4 py-3 border-b align-top">
                    <Link to={`/dashboard/quizzes/${r.userId.toString()}`} className="flex items-center space-x-3 group hover:opacity-80 transition-opacity">
                      {r.user?.profilePhoto ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={r.user.profilePhoto} alt={r.userName} className="h-10 w-10 rounded-full object-cover border-2 border-gray-200" referrerPolicy="no-referrer" />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-semibold">{getInitials(r.userName)}</div>
                      )}
                      <div>
                        <div className="font-medium text-gray-900 group-hover:text-blue-600 font-inter">{r.user ? `${r.user.firstName} ${r.user.lastName}` : r.userName}</div>
                        <div className="text-sm text-gray-600 font-inter">{r.user?.email ? r.user.email : `id: ${r.userId}`}</div>
                      </div>
                    </Link>
                  </td>
                  <td className="px-4 py-3 border-b align-top font-inter">{r.score}%</td>
                  <td className="px-4 py-3 border-b align-top font-inter">{r.validated ? 'Oui' : 'Non'}</td>
                  <td className="px-4 py-3 border-b align-top font-inter">{new Date(r.takenAt).toLocaleString()}</td>
                  <td className="px-4 py-3 border-b align-top">
                    <div className="flex items-center space-x-2">
                      <button onClick={() => toggleValidate(r._id)} className={`px-3 py-1 rounded font-inter ${r.validated ? 'bg-red-50 text-red-600' : 'bg-green-600 text-white'}`}>
                        {r.validated ? 'Annuler' : 'Valider'}
                      </button>
                      <button onClick={() => setExpanded(prev => ({ ...prev, [r._id]: !prev[r._id] }))} className="px-3 py-1 border rounded font-inter">Détails</button>
                    </div>
                    {expanded[r._id] && (
                      <div className="mt-2 p-3 bg-white border border-gray-100 rounded text-sm">
                        <ul className="space-y-1 text-gray-700">
                          <li className="font-inter"><strong>Utilisateur:</strong> {r.user ? `${r.user.firstName} ${r.user.lastName}` : r.userName}</li>
                          <li className="font-inter"><strong>Email:</strong> {r.user?.email || '—'}</li>
                          <li className="font-inter"><strong>Quiz:</strong> {r.quizKey}</li>
                          <li className="font-inter"><strong>Score:</strong> {r.score}%</li>
                          <li className="font-inter"><strong>Validé:</strong> {r.validated ? 'Oui' : 'Non'}</li>
                          <li className="font-inter"><strong>Passé le:</strong> {new Date(r.takenAt).toLocaleString()}</li>
                          <li className="font-inter"><strong>Certificats envoyés:</strong> {r.user?.certificateSentCount ?? 0}</li>
                        </ul>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// Server-side loader to fetch Empowring results and users at render time
export async function loader({ request }: any) {
  await connectDB();

  try {
    // Run all three isolated database queries concurrently for faster execution
    const [results, totalUsers, users, userProgresses] = await Promise.all([
      QuizResultModel.find({ quizKey: 'empowring' })
        .sort({ takenAt: -1 })
        .populate({ path: 'userId', select: '_id firstName lastName email profilePhoto certificateSentCount payment' })
        .lean(),
      User.countDocuments(),
      User.find()
        .select('_id firstName lastName email profilePhoto certificateSentCount payment createdAt')
        .sort({ createdAt: -1 })
        .lean(),
      UserProgress.find().lean()
    ]);

    // Map results to extract internal user object gracefully
    const mapped = results.map((r: any) => {
      const u = r.userId;
      const uId = u?._id ? String(u._id) : (u ? String(u) : "");

      return {
        _id: String(r._id),
        quizKey: r.quizKey,
        score: r.score,
        validated: r.validated,
        takenAt: r.takenAt,
        userId: uId, // Ensure this is a string
        userName: u ? `${u.firstName || ''} ${u.lastName || ''}`.trim() : "Utilisateur inconnu",
        user: (u && typeof u === 'object') ? {
          _id: uId,
          firstName: u.firstName,
          lastName: u.lastName,
          email: u.email,
          profilePhoto: u.profilePhoto,
          certificateSentCount: u.certificateSentCount,
          payment: u.payment,
        } : null,
      };
    });

    // Map users to include completedQuizzes and globalScore from userProgresses
    const mappedUsers = users.map((u: any) => {
      const uId = String(u._id);
      const userProg = userProgresses.find((p: any) => String(p.userId) === uId);
      const quizProgressEntries = Array.isArray(userProg?.quizProgress) ? userProg.quizProgress : [];
      const completedQuizzes = quizProgressEntries.filter((q: any) => q.completed).length;
      const totalQuizzes = quizProgressEntries.length;
      const globalScore = totalQuizzes > 0
        ? Math.round(
          quizProgressEntries.reduce((acc: number, curr: any) => {
            const p = curr.percentage ?? (curr.totalQuestions > 0 ? (curr.score / curr.totalQuestions) * 100 : 0);
            return acc + p;
          }, 0) / totalQuizzes
        )
        : 0;

      return {
        _id: uId, // Ensure this is a string
        firstName: u.firstName,
        lastName: u.lastName,
        email: u.email,
        profilePhoto: u.profilePhoto,
        certificateSentCount: u.certificateSentCount,
        payment: u.payment,
        createdAt: u.createdAt,
        completedQuizzes,
        totalQuizzes,
        globalScore
      };
    });

    return { results: mapped, totalUsers, users: mappedUsers };
  } catch (e) {
    console.warn('Failed to load quizzes management data concurrently', e);
    return { results: [], totalUsers: 0, users: [] };
  }
}
