import { useState } from "react";
import { useLoaderData, Link } from "react-router";
import connectDB from '../lib/db.server';
import QuizResultModel from '../models/QuizResult.server';
import User from '../models/User.server';
import UpskillingProgress from '../models/UpskillingProgress.server';

type QuizResult = {
  _id: string;
  userId: string;
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
  quizKey: string;
  score: number;
  validated?: boolean;
  takenAt: string;
};

export default function CertificatesManagement() {
  const loaderData = useLoaderData() as { results: QuizResult[]; totalUsers?: number; users?: any[] } | undefined;
  const [results, setResults] = useState<QuizResult[]>(loaderData?.results || []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const usersList = loaderData?.users || [];
  const validatedUsers = usersList.filter((u: any) => (u.completedChallenges || 0) === 21);
  const nonValidatedUsers = usersList.filter((u: any) => (u.completedChallenges || 0) < 21);
  const [selectedBox, setSelectedBox] = useState<'none' | 'all' | 'certified' | 'inProgress'>('none');
  const [userSearch, setUserSearch] = useState('');

  const getInitials = (name = '') => {
    return name.split(' ').map(s => s[0]).join('').slice(0, 2).toUpperCase();
  };

  const toggleValidate = async (id: string) => {
    setResults((prev) => prev.map(r => r._id === id ? { ...r, validated: !r.validated } : r));
    try {
      const res = await fetch(`/api/quiz-results/toggle-validate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) throw new Error("Failed to update");
      const updated: QuizResult = await res.json();
      setResults((prev) => prev.map(r => r._id === updated._id ? updated : r));
    } catch (e: any) {
      setResults((prev) => prev.map(r => r._id === id ? { ...r, validated: !r.validated } : r));
      setError(e.message || "Failed to update");
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4 text-black">21 day challenge — Résultats par utilisateur</h1>

      {loading && <p>Chargement...</p>}
      {error && <p className="text-red-600">Erreur: {error}</p>}

      <div className="mb-6">
        <div className="flex items-stretch space-x-4">
          {/* Box 1 */}
          <div
            onClick={() => setSelectedBox(selectedBox === 'all' ? 'none' : 'all')}
            className={`flex-1 bg-gradient-to-b from-green-50 to-white rounded-xl shadow-sm border border-green-100 p-4 h-32 cursor-pointer flex flex-col justify-center transition-all ${selectedBox === 'all' ? 'ring-2 ring-green-500 scale-[1.02]' : 'hover:scale-[1.01]'}`}
          >
            <h3 className="text-lg font-semibold text-green-900">Tous les utilisateurs</h3>
            <p className="text-sm text-green-700">Base de données complète ({usersList.length})</p>
          </div>

          {/* Box 2 */}
          <div
            onClick={() => setSelectedBox(selectedBox === 'certified' ? 'none' : 'certified')}
            className={`flex-1 bg-gradient-to-b from-indigo-50 to-white rounded-xl shadow-sm border border-indigo-100 p-4 h-32 cursor-pointer flex flex-col justify-center transition-all ${selectedBox === 'certified' ? 'ring-2 ring-indigo-500 scale-[1.02]' : 'hover:scale-[1.01]'}`}
          >
            <h3 className="text-lg font-semibold text-indigo-900">Utilisateurs certifiés</h3>
            <p className="text-sm text-indigo-700">{validatedUsers.length}/{usersList.length} Utilisateurs (21/21 Défis)</p>
          </div>

          {/* Box 3 */}
          <div
            onClick={() => setSelectedBox(selectedBox === 'inProgress' ? 'none' : 'inProgress')}
            className={`flex-1 bg-gradient-to-b from-yellow-50 to-white rounded-xl shadow-sm border border-yellow-100 p-4 h-32 cursor-pointer flex flex-col justify-center transition-all ${selectedBox === 'inProgress' ? 'ring-2 ring-yellow-500 scale-[1.02]' : 'hover:scale-[1.01]'}`}
          >
            <h3 className="text-lg font-semibold text-yellow-900">En attente de certification</h3>
            <p className="text-sm text-yellow-700">{nonValidatedUsers.length}/{usersList.length} Utilisateurs (Progression en cours)</p>
          </div>
        </div>
      </div>

      <div className="mb-6">
        {(selectedBox === 'all' || (results.length === 0 && selectedBox === 'none' && !loading)) && (
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
                      to={`/dashboard/certificates/${u._id.toString()}`}
                      key={u._id.toString()}
                      className="bg-white border border-gray-100 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow hover:border-indigo-200 block"
                    >
                      <div className="flex items-center">
                        {u.profilePhoto ? (
                          <img src={u.profilePhoto} alt={`${u.firstName} ${u.lastName}`} className="h-12 w-12 rounded-full object-cover mr-4" referrerPolicy="no-referrer" />
                        ) : (
                          <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center mr-4 text-gray-700 font-semibold">{(u.firstName?.[0] || '') + (u.lastName?.[0] || '')}</div>
                        )}
                        <div className="flex-1">
                          <div className="font-medium text-gray-900 group-hover:text-indigo-600">{u.firstName} {u.lastName}</div>
                          <div className="text-sm text-gray-500">{u.email || '—'}</div>
                        </div>
                        <div className="text-sm text-gray-600 text-right">
                          <div className="font-semibold text-gray-800">{u.completedChallenges ?? 0}/21</div>
                        </div>
                      </div>
                      <div className="mt-3 flex items-center justify-between text-sm text-gray-500">
                        <div>Abonnement: {u.payment?.subscriptionType || '—'}</div>
                        <div>Inscrit le: {new Date(u.createdAt).toLocaleDateString()}</div>
                      </div>
                    </Link>
                  ))}
              </div>
            )}
          </div>
        )}

        {selectedBox === 'certified' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Utilisateurs certifiés</h3>
                <p className="text-sm text-gray-500">Ont complété les 21 jours du challenge</p>
              </div>
              <div className="flex items-center space-x-3">
                <input
                  type="text"
                  placeholder="Rechercher par nom..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="px-3 py-2 border border-gray-200 rounded-md shadow-sm w-64"
                />
              </div>
            </div>

            {validatedUsers.length === 0 ? (
              <div className="text-sm text-gray-600">Aucun utilisateur certifié.</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {validatedUsers
                  .filter(u => {
                    if (!userSearch) return true;
                    const q = userSearch.toLowerCase();
                    const name = `${u.firstName || ''} ${u.lastName || ''}`.toLowerCase();
                    return name.includes(q) || (u.email || '').toLowerCase().includes(q);
                  })
                  .map((u: any) => (
                    <Link
                      to={`/dashboard/certificates/${u._id.toString()}`}
                      key={u._id.toString()}
                      className="bg-white border border-gray-100 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow hover:border-indigo-200 block"
                    >
                      <div className="flex items-center">
                        {u.profilePhoto ? (
                          <img src={u.profilePhoto} alt={`${u.firstName} ${u.lastName}`} className="h-12 w-12 rounded-full object-cover mr-4" referrerPolicy="no-referrer" />
                        ) : (
                          <div className="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center mr-4 text-indigo-700 font-semibold">{getInitials(`${u.firstName} ${u.lastName}`)}</div>
                        )}
                        <div className="flex-1 text-left">
                          <div className="font-medium text-gray-900 group-hover:text-indigo-600">{u.firstName} {u.lastName}</div>
                          <div className="text-sm text-gray-500">{u.email || '—'}</div>
                        </div>
                        <div className="text-sm text-gray-600 text-right">
                          <div className="font-semibold text-gray-800">{u.completedChallenges}/21</div>
                          <div className="text-xs text-gray-500">défis</div>
                        </div>
                      </div>
                    </Link>
                  ))}
              </div>
            )}
          </div>
        )}

        {selectedBox === 'inProgress' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">En attente de certification</h3>
                <p className="text-sm text-gray-500">N'ont pas encore terminé les 21 défis</p>
              </div>
              <div className="flex items-center space-x-3">
                <input
                  type="text"
                  placeholder="Rechercher par nom..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="px-3 py-2 border border-gray-200 rounded-md shadow-sm w-64"
                />
              </div>
            </div>

            {nonValidatedUsers.length === 0 ? (
              <div className="text-sm text-gray-600">Aucun utilisateur en attente.</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {nonValidatedUsers
                  .filter(u => {
                    if (!userSearch) return true;
                    const q = userSearch.toLowerCase();
                    const name = `${u.firstName || ''} ${u.lastName || ''}`.toLowerCase();
                    return name.includes(q) || (u.email || '').toLowerCase().includes(q);
                  })
                  .map((u: any) => (
                    <Link
                      to={`/dashboard/certificates/${u._id.toString()}`}
                      key={u._id.toString()}
                      className="bg-white border border-gray-100 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow hover:border-indigo-200 block"
                    >
                      <div className="flex items-center">
                        {u.profilePhoto ? (
                          <img src={u.profilePhoto} alt={`${u.firstName} ${u.lastName}`} className="h-12 w-12 rounded-full object-cover mr-4" referrerPolicy="no-referrer" />
                        ) : (
                          <div className="h-12 w-12 rounded-full bg-yellow-100 flex items-center justify-center mr-4 text-yellow-700 font-semibold">{getInitials(`${u.firstName} ${u.lastName}`)}</div>
                        )}
                        <div className="flex-1 text-left">
                          <div className="font-medium text-gray-900 group-hover:text-indigo-600">{u.firstName} {u.lastName}</div>
                          <div className="text-sm text-gray-500">{u.email || '—'}</div>
                        </div>
                        <div className="text-sm text-gray-600 text-right">
                          <div className="font-semibold text-gray-800">{u.completedChallenges}/21</div>
                          <div className="text-xs text-gray-500">défis</div>
                        </div>
                      </div>
                    </Link>
                  ))}
              </div>
            )}
          </div>
        )}
      </div>

      {results.length > 0 && (
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
                <tr key={r._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 border-b align-top">
                    <Link
                      to={`/dashboard/certificates/${r.userId.toString()}`}
                      className="flex items-center space-x-3 hover:opacity-80 transition-opacity"
                    >
                      {r.user?.profilePhoto ? (
                        <img src={r.user.profilePhoto} alt={r.userName} className="h-10 w-10 rounded-full object-cover border-2 border-gray-200" referrerPolicy="no-referrer" />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-semibold">{getInitials(r.userName)}</div>
                      )}
                      <div>
                        <div className="font-medium text-gray-900 hover:text-indigo-600">{r.userName}</div>
                        <div className="text-sm text-gray-600">{r.user?.email || `id: ${r.userId}`}</div>
                      </div>
                    </Link>
                  </td>
                  <td className="px-4 py-3 border-b align-top">{r.score}%</td>
                  <td className="px-4 py-3 border-b align-top">{r.validated ? 'Oui' : 'Non'}</td>
                  <td className="px-4 py-3 border-b align-top">{new Date(r.takenAt).toLocaleString()}</td>
                  <td className="px-4 py-3 border-b align-top">
                    <div className="flex items-center space-x-2">
                      <button onClick={() => toggleValidate(r._id)} className={`px-3 py-1 rounded ${r.validated ? 'bg-red-50 text-red-600' : 'bg-green-600 text-white'}`}>
                        {r.validated ? 'Annuler' : 'Valider'}
                      </button>
                      <button onClick={() => setExpanded(prev => ({ ...prev, [r._id]: !prev[r._id] }))} className="px-3 py-1 border rounded">Détails</button>
                    </div>
                    {expanded[r._id] && (
                      <div className="mt-2 p-3 bg-white border border-gray-100 rounded text-sm">
                        <ul className="space-y-1 text-gray-700">
                          <li><strong>Utilisateur:</strong> {r.userName}</li>
                          <li><strong>Quiz:</strong> {r.quizKey}</li>
                          <li><strong>Certificats envoyés:</strong> {r.user?.certificateSentCount ?? 0}</li>
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

export async function loader() {
  try {
    await connectDB();
    const [results, totalUsers, users, upskillingProgresses] = await Promise.all([
      QuizResultModel.find({ quizKey: 'empowring' })
        .sort({ takenAt: -1 })
        .populate({ path: 'userId', select: '_id firstName lastName email profilePhoto certificateSentCount payment' })
        .lean(),
      User.countDocuments(),
      User.find()
        .select('_id firstName lastName email profilePhoto certificateSentCount payment createdAt')
        .sort({ createdAt: -1 })
        .lean(),
      UpskillingProgress.find().lean()
    ]);

    const mapped = results.map((r: any) => {
      const u = r.userId;
      const uId = u?._id ? String(u._id) : (u ? String(u) : "");
      return {
        _id: String(r._id),
        quizKey: r.quizKey,
        score: r.score,
        validated: r.validated,
        takenAt: r.takenAt,
        userId: uId,
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

    const mappedUsers = users.map((u: any) => {
      const uId = String(u._id);
      const upProg = upskillingProgresses.find((p: any) => String(p.userId) === uId);
      const completedChallenges = upProg?.challenges?.filter((c: any) => c.completed).length || 0;

      return {
        _id: uId,
        firstName: u.firstName,
        lastName: u.lastName,
        email: u.email,
        profilePhoto: u.profilePhoto,
        certificateSentCount: u.certificateSentCount,
        payment: u.payment,
        createdAt: u.createdAt,
        completedChallenges
      };
    });

    return { results: mapped, totalUsers, users: mappedUsers };
  } catch (e) {
    console.warn('Failed to load certificates management data', e);
    return { results: [], totalUsers: 0, users: [] };
  }
}
