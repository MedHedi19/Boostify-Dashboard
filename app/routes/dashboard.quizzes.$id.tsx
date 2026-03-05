import { useState } from "react";
import { Link, useLoaderData } from "react-router";
import fs from "node:fs";
import path from "node:path";
import connectDB from "../lib/db.server";
import User from "../models/User.server";
import UserProgress from "../models/UserProgress.server";
// import type { Route } from "./+types/dashboard.quizzes.$id"; // Temporarily disabled if typegen is slow

export async function loader({ params }: any) {
    await connectDB();

    const userId = params.id;
    if (!userId || userId === "[object Object]") {
        throw new Response("Invalid User ID", { status: 400 });
    }

    let user;
    try {
        user = await User.findById(userId).lean();
    } catch (e) {
        throw new Response("Invalid User ID format", { status: 400 });
    }

    if (!user) {
        throw new Response("User not found", { status: 404 });
    }

    const userProgress = await UserProgress.findOne({ userId }).lean();

    // Fetch quiz questions from JSON files
    const dataDir = path.join(process.cwd(), "app", "data", "7P");
    const quizData: Record<string, any[]> = {};

    try {
        const files = fs.readdirSync(dataDir);
        for (const file of files) {
            if (file.endsWith(".json")) {
                const name = file.replace(".json", "");
                const content = JSON.parse(fs.readFileSync(path.join(dataDir, file), "utf-8"));
                // Store the first array found in the JSON as the questions for that quiz Name
                const questionsKey = Object.keys(content).find(key => Array.isArray(content[key]));
                if (questionsKey) {
                    quizData[name] = content[questionsKey];
                }
            }
        }
    } catch (err) {
        console.warn("Could not load quiz data files:", err);
    }

    return {
        user: JSON.parse(JSON.stringify(user)),
        userProgress: userProgress ? JSON.parse(JSON.stringify(userProgress)) : null,
        quizData
    };
}

export default function UserQuizDetail() {
    const { user, userProgress, quizData } = useLoaderData<typeof loader>();
    const [expandedModule, setExpandedModule] = useState<number | null>(null);

    const completedCount = userProgress?.quizProgress?.filter((q: any) => q.completed).length || 0;
    const totalQuizzes = 7;
    const globalScore = Math.round(
        (userProgress?.quizProgress?.reduce((acc: number, curr: any) => {
            const p = curr.percentage ?? (curr.totalQuestions > 0 ? (curr.score / curr.totalQuestions) * 100 : 0);
            return acc + p;
        }, 0) || 0) / totalQuizzes
    );

    return (
        <div className="p-6 max-w-7xl mx-auto bg-gray-50 min-h-screen">
            {/* Header / Breadcrumbs */}
            <div className="flex items-center space-x-2 text-sm text-gray-500 mb-6">
                <Link to="/dashboard/quizzes" className="hover:text-blue-600 transition-colors">Gestion des Quiz</Link>
                <span>/</span>
                <span className="text-gray-900 font-medium font-inter">Détails de progression</span>
            </div>

            {/* Profile Section */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-8 flex flex-col md:flex-row items-center md:items-start md:space-x-8">
                <div className="relative group mb-4 md:mb-0">
                    {user.profilePhoto ? (
                        <img
                            src={user.profilePhoto}
                            alt={`${user.firstName} ${user.lastName}`}
                            className="h-32 w-32 rounded-full object-cover border-4 border-white shadow-xl group-hover:scale-105 transition-transform duration-300"
                            referrerPolicy="no-referrer"
                        />
                    ) : (
                        <div className="h-32 w-32 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-4xl font-bold border-4 border-white shadow-xl">
                            {(user.firstName?.[0] || '') + (user.lastName?.[0] || '')}
                        </div>
                    )}
                    <div className="absolute -bottom-2 -right-2 bg-green-500 border-2 border-white p-2 rounded-full shadow-lg">
                        <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
                    </div>
                </div>

                <div className="flex-1 text-center md:text-left">
                    <h1 className="text-3xl font-bold text-gray-900 mb-1 font-inter">{user.firstName} {user.lastName}</h1>
                    <p className="text-gray-500 mb-4 font-inter">{user.email}</p>

                    <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                        <span className="px-4 py-1.5 bg-blue-50 text-blue-700 rounded-full text-sm font-semibold border border-blue-100 font-inter">
                            {user.payment?.subscriptionType || 'Gratuit'}
                        </span>
                        <span className="px-4 py-1.5 bg-green-50 text-green-700 rounded-full text-sm font-semibold border border-green-100 font-inter">
                            {completedCount}/{totalQuizzes} Quiz complétés
                        </span>
                    </div>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Progress Summary */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                        <h2 className="text-lg font-bold text-gray-900 mb-6 font-inter">Résumé de Progression</h2>

                        <div className="space-y-6">
                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-sm font-medium text-gray-600 font-inter">Progression Globale</span>
                                    <span className="text-sm font-bold text-blue-600 font-inter">{Math.round((completedCount / totalQuizzes) * 100)}%</span>
                                </div>
                                <div className="w-full bg-gray-100 rounded-full h-3">
                                    <div
                                        className="bg-gradient-to-r from-blue-500 to-indigo-600 h-3 rounded-full transition-all duration-1000"
                                        style={{ width: `${(completedCount / totalQuizzes) * 100}%` }}
                                    ></div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-4">
                                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 flex justify-between items-center">
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase tracking-wider font-bold mb-1 font-inter">Score Global</p>
                                        <p className="text-xl font-black text-blue-600 font-inter">{globalScore}%</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] text-gray-400 uppercase font-bold font-inter">Moyenne sur 7 modules</p>
                                    </div>
                                </div>
                                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                                    <p className="text-xs text-gray-500 uppercase tracking-wider font-bold mb-1 font-inter">Dernière activité</p>
                                    <p className="text-sm font-semibold text-gray-900 font-inter">
                                        {userProgress?.updatedAt ? new Date(userProgress.updatedAt).toLocaleDateString() : 'Aucune'}
                                    </p>
                                </div>
                                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                                    <p className="text-xs text-gray-500 uppercase tracking-wider font-bold mb-1 font-inter">Quiz actuel</p>
                                    <p className="text-sm font-semibold text-gray-900 font-inter font-inter">Module {userProgress?.currentQuizIndex + 1 || 0}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Quiz List */}
                <div className="lg:col-span-2 space-y-4">
                    <h2 className="text-xl font-bold text-gray-900 mb-4 px-2 font-inter">Modules de Coaching</h2>

                    {(!userProgress || !userProgress.quizProgress || userProgress.quizProgress.length === 0) ? (
                        <div className="bg-white border-2 border-dashed border-gray-200 rounded-2xl p-12 text-center">
                            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400 text-2xl">📋</div>
                            <h3 className="text-gray-900 font-bold text-lg mb-1 font-inter">Aucune donnée de progression</h3>
                            <p className="text-gray-500 font-inter">L'utilisateur n'a pas encore commencé le programme de coaching.</p>
                        </div>
                    ) : (
                        userProgress.quizProgress.map((qp: any, idx: number) => (
                            <div key={idx} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:border-blue-200 transition-colors">
                                <div className="p-5 flex items-center justify-between">
                                    <div className="flex items-center space-x-4">
                                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg ${qp.completed ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                                            {qp.completed ? '✓' : idx + 1}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-gray-900 font-inter">{qp.quizName}</h3>
                                            <p className="text-xs text-gray-500 font-medium font-inter">
                                                {qp.completed ? `Terminé le ${new Date(qp.completedAt).toLocaleDateString()}` : 'En attente'}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="text-right">
                                        {(() => {
                                            const displayScore = qp.percentage ?? (qp.totalQuestions > 0 ? Math.round((qp.score / qp.totalQuestions) * 100) : 0);
                                            return (
                                                <>
                                                    <div className={`text-lg font-black font-inter ${displayScore >= 70 ? 'text-green-600' : displayScore >= 40 ? 'text-yellow-600' : 'text-red-500'}`}>
                                                        {qp.completed ? `${displayScore}%` : '—'}
                                                    </div>
                                                    <p className="text-[10px] text-gray-400 uppercase font-extrabold tracking-tight font-inter">Score final</p>
                                                </>
                                            );
                                        })()}
                                    </div>
                                </div>

                                {qp.completed && qp.answers && qp.answers.length > 0 && (
                                    <div className="bg-gray-50 border-t border-gray-100 p-4">
                                        <button
                                            onClick={() => setExpandedModule(expandedModule === idx ? null : idx)}
                                            className="text-xs font-bold text-blue-600 cursor-pointer hover:underline flex items-center font-inter"
                                        >
                                            <span className={`mr-1 transition-transform ${expandedModule === idx ? 'rotate-180' : ''}`}>▼</span>
                                            VOIR LES RÉPONSES DÉTAILLÉES
                                        </button>

                                        {expandedModule === idx && (
                                            <div className="mt-4 space-y-3">
                                                {qp.answers.map((ans: any, aIdx: number) => {
                                                    const hasAnswer = ans?.selectedAnswer && ans.selectedAnswer.trim() !== "" && ans.selectedAnswer !== "N/A";

                                                    // Mapping logic: Find the real question text
                                                    // qp.quizName is the key like "Paperwork"
                                                    // qp.selectedQuestions[ans.questionIndex] is the absolute index in JSON
                                                    const absoluteIndex = qp.selectedQuestions?.[ans.questionIndex];
                                                    const quizPool = quizData[qp.quizName] || [];
                                                    const fullQuestion = quizPool[absoluteIndex];
                                                    const questionText = fullQuestion?.question || `Question ${ans.questionIndex}`;

                                                    return (
                                                        <div key={aIdx} className="flex items-start space-x-3 text-sm p-3 bg-white rounded-lg border border-gray-100">
                                                            <div className={`mt-1 h-5 w-5 flex-shrink-0 rounded-full flex items-center justify-center text-[10px] text-white ${ans.isCorrect ? 'bg-green-500' : 'bg-red-500'}`}>
                                                                {ans.isCorrect ? '✓' : '✗'}
                                                            </div>
                                                            <div>
                                                                <p className="text-gray-900 font-semibold mb-1 font-inter">{questionText}</p>
                                                                {hasAnswer ? (
                                                                    <p className="text-gray-600 font-inter text-xs">Réponse choisie: <span className="font-bold font-inter">{ans.selectedAnswer}</span></p>
                                                                ) : (
                                                                    <p className="text-red-500 font-medium italic font-inter text-xs">Time expired (no answer)</p>
                                                                )}
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
