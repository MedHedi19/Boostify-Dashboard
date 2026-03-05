import { Link, useLoaderData } from "react-router";
import connectDB from "../lib/db.server";
import User from "../models/User.server";
import UpskillingProgress, { type IUpskillingProgress } from "../models/UpskillingProgress.server";

export async function loader({ params }: any) {
    try {
        await connectDB();
        const userId = params.id;

        if (!userId || userId.length !== 24) {
            return {
                user: { firstName: "Utilisateur", lastName: "Inconnu", email: "invalid-id@example.com" },
                progress: null
            };
        }

        const [user, progress] = await Promise.all([
            User.findById(userId).select('firstName lastName email profilePhoto payment').lean(),
            UpskillingProgress.findOne({ userId }).lean()
        ]);

        if (!user) {
            return {
                user: { firstName: "Utilisateur", lastName: "Non-trouvé", email: "not-found@example.com" },
                progress: null
            };
        }

        return {
            user: JSON.parse(JSON.stringify(user)),
            progress: progress ? JSON.parse(JSON.stringify(progress)) : null
        };
    } catch (error) {
        console.error("Failed to load user and progress for certificate details", error);
        return {
            user: { firstName: "Utilisateur", lastName: "Erreur", email: "db-error@example.com" },
            progress: null
        };
    }
}

export default function UserCertificateDetail() {
    const { user, progress } = useLoaderData<typeof loader>();

    // Map personality color to Tailwind classes
    const colorMap: Record<string, string> = {
        'rouge': 'bg-red-500',
        'jaune': 'bg-yellow-400',
        'vert': 'bg-green-500',
        'bleu': 'bg-blue-500',
    };

    const colorTextMap: Record<string, string> = {
        'rouge': 'Rouge',
        'jaune': 'Jaune',
        'vert': 'Vert',
        'bleu': 'Bleu',
    };

    const userColorClass = progress?.personalityColor ? colorMap[progress.personalityColor] || 'bg-indigo-600' : 'bg-indigo-600';
    const userColorName = progress?.personalityColor ? colorTextMap[progress.personalityColor] || 'Non défini' : 'Non défini';

    // Get challenges or mock them if none
    const actualChallenges = progress?.challenges || [];

    // Sort and ensure we have all 21 days (if db somehow has fewer or more)
    const sortedChallenges = Array.from({ length: 21 }, (_, i) => {
        const dayNum = i + 1;
        const dbChallenge = actualChallenges.find((c: any) => c.day === dayNum);
        return {
            day: dayNum,
            completed: dbChallenge?.completed || false,
            completedAt: dbChallenge?.completedAt || null,
        };
    });

    const completedCount = sortedChallenges.filter(c => c.completed).length;

    return (
        <div className="p-6 max-w-7xl mx-auto bg-gray-50 min-h-screen">
            {/* Header / Breadcrumbs */}
            <div className="flex items-center space-x-2 text-sm text-gray-500 mb-6 font-inter">
                <Link to="/dashboard/certificates" className="hover:text-indigo-600 transition-colors">Gestion des Certificats</Link>
                <span>/</span>
                <span className="text-gray-900 font-medium">Détails du Challenge 21 Jours</span>
            </div>

            {/* Profile Section */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-8 flex flex-col md:flex-row items-center md:items-start md:space-x-8">
                <div className="relative mb-4 md:mb-0">
                    {user.profilePhoto ? (
                        <img
                            src={user.profilePhoto}
                            alt={`${user.firstName} ${user.lastName}`}
                            className="h-32 w-32 rounded-full object-cover border-4 border-white shadow-xl"
                            referrerPolicy="no-referrer"
                        />
                    ) : (
                        <div className={`h-32 w-32 rounded-full ${userColorClass} flex items-center justify-center text-white text-4xl font-bold border-4 border-white shadow-xl`}>
                            {(user.firstName?.[0] || '') + (user.lastName?.[0] || '')}
                        </div>
                    )}
                    {progress?.personalityColor && (
                        <div className={`absolute -bottom-2 -right-2 ${userColorClass} border-4 border-white p-2 rounded-full shadow-lg h-10 w-10 flex items-center justify-center`} title={`Couleur: ${userColorName}`}>
                            <span className="sr-only">{userColorName}</span>
                        </div>
                    )}
                </div>

                <div className="flex-1 text-center md:text-left">
                    <h1 className="text-3xl font-bold text-gray-900 mb-1 font-inter">
                        {user.firstName} {user.lastName}
                    </h1>
                    <p className="text-gray-500 mb-4 font-inter">{user.email}</p>

                    <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                        <span className="px-4 py-1.5 bg-indigo-50 text-indigo-700 rounded-full text-sm font-semibold border border-indigo-100 font-inter">
                            {user.payment?.subscriptionType === 'premium' ? 'PREMIUM' : 'FREE'}
                        </span>
                        <span className="px-4 py-1.5 bg-green-50 text-green-700 rounded-full text-sm font-semibold border border-green-100 font-inter">
                            Progression: {completedCount}/21
                        </span>
                        <span className={`px-4 py-1.5 rounded-full text-sm font-semibold border text-white ${userColorClass}`}>
                            Couleur: {userColorName}
                        </span>
                    </div>
                </div>
            </div>

            {/* Actual Challenge Grid (21 Boxes) */}
            <h2 className="text-xl font-bold text-gray-900 mb-6 px-2 font-inter">Progression du Challenge (21 Jours)</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-4">
                {sortedChallenges.map((d) => (
                    d.completed ? (
                        <Link
                            to={`challenge/${d.day}`}
                            key={d.day}
                            className={`p-4 rounded-xl border-2 transition-all h-32 flex flex-col justify-between bg-green-50 border-green-200 text-green-900 shadow-sm hover:shadow-md hover:scale-[1.03] cursor-pointer`}
                        >
                            <div className="flex justify-between items-start">
                                <span className="text-sm font-bold uppercase tracking-wider font-inter">Jour</span>
                                <span className="text-xl">✅</span>
                            </div>
                            <div className="text-3xl font-black font-inter">{d.day}</div>
                            <div className="text-[10px] font-medium leading-tight font-inter">
                                Complété le {new Date(d.completedAt!).toLocaleDateString()}
                            </div>
                        </Link>
                    ) : (
                        <div
                            key={d.day}
                            className={`p-4 rounded-xl border-2 transition-all cursor-default h-32 flex flex-col justify-between bg-white border-gray-100 text-gray-400 opacity-60`}
                        >
                            <div className="flex justify-between items-start">
                                <span className="text-sm font-bold uppercase tracking-wider font-inter">Jour</span>
                                <span className="text-xl grayscale">🔒</span>
                            </div>
                            <div className="text-3xl font-black font-inter">{d.day}</div>
                            <div className="text-[10px] font-medium leading-tight font-inter">
                                Non complété
                            </div>
                        </div>
                    )
                ))}
            </div>
        </div>
    );
}
