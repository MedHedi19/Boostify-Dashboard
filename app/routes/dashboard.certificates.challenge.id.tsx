import { Link, useParams, useLoaderData } from "react-router";
import connectDB from "../lib/db";
import UpskillingProgress from "../models/UpskillingProgress";
import User from "../models/User";

export async function loader({ params }: any) {
    try {
        await connectDB();
        const { id: userId, day: dayStr } = params;
        const day = parseInt(dayStr, 10);

        const [user, progress] = await Promise.all([
            User.findById(userId).select('firstName lastName profilePhoto').lean(),
            UpskillingProgress.findOne({ userId }).lean()
        ]);

        if (!user) {
            throw new Response("User not found", { status: 404 });
        }

        const challenge = progress?.challenges?.find((c: any) => c.day === day);

        return {
            user: JSON.parse(JSON.stringify(user)),
            challenge: challenge ? JSON.parse(JSON.stringify(challenge)) : null,
            day
        };
    } catch (error) {
        console.error("Error loading challenge details:", error);
        throw new Response("Error loading data", { status: 500 });
    }
}

export default function ChallengeDetail() {
    const { user, challenge, day } = useLoaderData<typeof loader>();
    const submission = challenge?.submission;

    return (
        <div className="p-6 max-w-4xl mx-auto bg-gray-50 min-h-screen">
            {/* Breadcrumbs */}
            <div className="flex items-center space-x-2 text-sm text-gray-500 mb-6 font-inter">
                <Link to="/dashboard/certificates" className="hover:text-indigo-600 transition-colors">Gestion des Certificats</Link>
                <span>/</span>
                <Link to={`/dashboard/certificates/${user._id}`} className="hover:text-indigo-600 transition-colors">
                    {user.firstName} {user.lastName}
                </Link>
                <span>/</span>
                <span className="text-gray-900 font-medium font-inter">Challenge Jour {day}</span>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 mb-2 font-inter">Détails du Défi - Jour {day}</h1>
                        <p className="text-gray-500 font-inter">Consultez la soumission de l'utilisateur pour ce défi.</p>
                    </div>
                    <div className={`px-4 py-2 rounded-full font-bold text-sm ${challenge?.completed ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                        STATUT: {challenge?.completed ? 'COMPLÉTÉ' : 'EN COURS'}
                    </div>
                </div>

                <div className="space-y-8">
                    {/* Submission Content */}
                    <section>
                        <h3 className="text-lg font-bold text-gray-900 mb-4 border-b pb-2 font-inter">Soumission de l'utilisateur</h3>

                        {!submission || submission.type === 'none' ? (
                            <div className="bg-gray-50 rounded-xl p-8 border border-gray-100 text-center text-gray-400 font-inter">
                                Aucune soumission trouvée pour ce jour.
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {/* TEXT Submission */}
                                {submission.type === 'text' && (
                                    <div className="bg-gray-50 rounded-xl p-6 border border-gray-200 text-gray-800 font-inter leading-relaxed whitespace-pre-wrap">
                                        {submission.textContent || "L'utilisateur a soumis un texte vide."}
                                    </div>
                                )}

                                {/* VIDEO Submission */}
                                {submission.type === 'video' && (
                                    <div className="space-y-4">
                                        <div className="bg-black rounded-xl overflow-hidden aspect-video shadow-lg">
                                            {submission.mediaUrl ? (
                                                <video
                                                    key={submission.mediaUrl}
                                                    src={submission.mediaUrl}
                                                    controls
                                                    playsInline
                                                    preload="metadata"
                                                    crossOrigin="anonymous"
                                                    className="w-full h-full"
                                                >
                                                    Votre navigateur ne supporte pas la lecture de vidéos.
                                                </video>
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-100 italic">
                                                    URL de la vidéo non valide
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <p className="text-sm text-gray-500 italic font-inter">Vidéo soumise le {new Date(submission.uploadedAt || challenge.completedAt).toLocaleString()}</p>
                                            <button
                                                onClick={() => {
                                                    navigator.clipboard.writeText(submission.mediaUrl || '');
                                                    alert('URL Copiée');
                                                }}
                                                className="text-[10px] bg-gray-100 hover:bg-gray-200 text-gray-600 px-2 py-1 rounded border border-gray-200"
                                            >
                                                Debug: Copier URL
                                            </button>
                                        </div>
                                        <div className="p-2 bg-gray-50 rounded border border-gray-100 text-[10px] font-mono text-gray-400 break-all">
                                            Source: {submission.mediaUrl}
                                        </div>
                                    </div>
                                )}

                                {/* AUDIO Submission */}
                                {submission.type === 'audio' && (
                                    <div className="bg-indigo-50 rounded-xl p-8 border border-indigo-100 flex flex-col items-center space-y-4">
                                        <div className="w-16 h-16 bg-indigo-600 rounded-full flex items-center justify-center text-white text-2xl animate-pulse shadow-lg">
                                            🎙️
                                        </div>
                                        {submission.mediaUrl ? (
                                            <audio
                                                key={submission.mediaUrl}
                                                src={submission.mediaUrl}
                                                controls
                                                preload="metadata"
                                                crossOrigin="anonymous"
                                                className="w-full max-w-md"
                                            >
                                                Votre navigateur ne supporte pas la lecture audio.
                                            </audio>
                                        ) : (
                                            <div className="text-indigo-700 italic">URL audio non valide</div>
                                        )}
                                        <div className="flex flex-col items-center space-y-2">
                                            <p className="text-xs text-indigo-500 font-medium font-inter">Enregistrement audio du challenge</p>
                                            <button
                                                onClick={() => {
                                                    navigator.clipboard.writeText(submission.mediaUrl || '');
                                                    alert('URL Copiée');
                                                }}
                                                className="text-[10px] text-indigo-400 underline hover:text-indigo-600"
                                            >
                                                Debug: Copier URL Audio
                                            </button>
                                        </div>
                                        <div className="w-full p-2 bg-white/50 rounded border border-indigo-100 text-[10px] font-mono text-indigo-400 break-all text-center">
                                            Source: {submission.mediaUrl}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </section>

                    {/* Admin Notes */}
                    <section>
                        <h3 className="text-lg font-bold text-gray-900 mb-4 border-b pb-2 font-inter">Notes & Observations</h3>
                        <div className="bg-white border border-gray-100 rounded-xl p-6 min-h-[100px]">
                            {challenge?.notes ? (
                                <p className="text-gray-700 font-inter">{challenge.notes}</p>
                            ) : (
                                <p className="text-gray-400 italic font-inter text-sm">
                                    Aucune note administrative pour le moment.
                                </p>
                            )}
                        </div>
                    </section>
                </div>

                <div className="mt-12 flex justify-end">
                    <Link
                        to={`/dashboard/certificates/${user._id}`}
                        className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors shadow-md font-inter"
                    >
                        Retour au profil
                    </Link>
                </div>
            </div>
        </div>
    );
}
