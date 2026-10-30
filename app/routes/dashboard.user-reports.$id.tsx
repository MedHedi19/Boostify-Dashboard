import { Link, useLoaderData } from 'react-router';
import { useState } from 'react';
import type { ReactNode } from 'react';
import type { Route } from './+types/dashboard.user-reports.$id';
import connectDB from '~/lib/db.server';
import User from '~/models/User.server';
import PersonalityTest from '~/models/PersonalityTest.server';
import UserProgress from '~/models/UserProgress.server';
import UpskillingProgress from '~/models/UpskillingProgress.server';
import VarkTest from '~/models/VarkTest.server';
import QuizResult from '~/models/QuizResult.server';

export async function loader({ params }: Route.LoaderArgs) {
  await connectDB();
  const user = await User.findById(params.id).select('_id firstName lastName email profilePhoto createdAt').lean();
  if (!user) throw new Response('User not found', { status: 404 });

  const [disc, coaching, challenge, vark, empowering] = await Promise.all([
    PersonalityTest.findOne({ userId: user._id }).lean(),
    UserProgress.findOne({ userId: user._id }).lean(),
    UpskillingProgress.findOne({ userId: user._id }).lean(),
    VarkTest.findOne({ userId: user._id }).lean(),
    QuizResult.find({ userId: user._id }).sort({ takenAt: -1 }).lean(),
  ]);

  const report = {
    user: {
      id: String(user._id), firstName: user.firstName, lastName: user.lastName,
      email: user.email, profilePhoto: user.profilePhoto || null, createdAt: user.createdAt,
    },
    disc: disc ? {
      completed: disc.completed, dominantColor: disc.dominantColor || null,
      colorCounts: disc.colorCounts || null, answers: disc.answers || [], completedAt: disc.completedAt || null,
    } : null,
    coaching: coaching?.quizProgress || [],
    challenge: challenge ? {
      personalityColor: challenge.personalityColor,
      startedAt: challenge.startedAt,
      completedAt: challenge.completedAt || null,
      challenges: challenge.challenges || [],
    } : null,
    vark: vark ? {
      completed: vark.completed, dominantStyle: vark.dominantStyle || null,
      styleCounts: vark.styleCounts || null, answers: vark.answers || [], completedAt: vark.completedAt || null,
    } : null,
    empowering: empowering.map((result) => ({
      id: String(result._id), quizKey: result.quizKey, score: result.score,
      validated: result.validated, takenAt: result.takenAt,
    })),
  };
  return JSON.parse(JSON.stringify(report));
}

const colorNames: Record<string, string> = { R: 'Red (D)', J: 'Yellow (I)', Y: 'Yellow (I)', V: 'Green (S)', G: 'Green (S)', B: 'Blue (C)' };
const colorBar: Record<string, string> = { R: 'bg-red-500', J: 'bg-yellow-400', Y: 'bg-yellow-400', V: 'bg-green-500', G: 'bg-green-500', B: 'bg-blue-500' };
const styleNames: Record<string, string> = { V: 'Visual', A: 'Auditory', R: 'Reading / Writing', K: 'Kinesthetic' };
const styleIcons: Record<string, string> = { V: '👁️', A: '🔊', R: '📖', K: '🏃' };
const localDate = (value?: string | Date | null) => value ? new Date(value).toLocaleDateString() : '—';
const localized = (value: any) => typeof value === 'string' ? value : value?.en || value?.fr || value?.ar || '—';

function Section({ title, subtitle, children }: { title: string; subtitle?: string; children: ReactNode }) {
  return <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
    <div className="mb-5 border-b border-gray-100 pb-4"><h2 className="text-xl font-bold text-gray-900">{title}</h2>{subtitle && <p className="mt-1 text-sm text-gray-500">{subtitle}</p>}</div>
    {children}
  </section>;
}

export default function UserReportDetails() {
  const { user, disc, coaching, challenge, vark, empowering } = useLoaderData<typeof loader>();
  const [activeTab, setActiveTab] = useState('disc');
  const maxColor = Math.max(1, ...Object.values(disc?.colorCounts || {}).map(Number));
  const maxStyle = Math.max(1, ...Object.values(vark?.styleCounts || {}).map(Number));
  const completedDays = challenge?.challenges.filter((item: any) => item.completed).length || 0;
  const tabs = [
    { id: 'disc', icon: '🎭', label: 'DISC', detail: disc?.completed ? 'Completed' : 'No result' },
    { id: 'coaching', icon: '📝', label: 'Coaching (7P)', detail: `${coaching.length} ${coaching.length === 1 ? 'quiz' : 'quizzes'}` },
    { id: 'vark', icon: '👁️', label: 'VARK', detail: vark?.completed ? 'Completed' : 'No result' },
    { id: 'challenge', icon: '🏆', label: '21-Day Challenge', detail: `${completedDays}/21 days` },
  ];

  return <div className="space-y-6">
    <Link to="/dashboard/user-reports" className="inline-flex items-center text-sm font-medium text-blue-700 hover:text-blue-900">← Back to User Reports</Link>
    <header className="flex flex-wrap items-center gap-4 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      {user.profilePhoto ? <img src={user.profilePhoto} alt="" className="h-16 w-16 rounded-full border object-cover" referrerPolicy="no-referrer" /> : <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-xl font-bold text-blue-800">{`${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`}</div>}
      <div><h1 className="text-2xl font-bold text-gray-900">{user.firstName} {user.lastName}</h1><p className="text-gray-600">{user.email}</p><p className="mt-1 text-xs text-gray-500">Joined {localDate(user.createdAt)}</p></div>
    </header>

    <nav role="tablist" aria-label="User test results" className="flex gap-2 overflow-x-auto rounded-xl border border-gray-200 bg-white p-2 shadow-sm">
      {tabs.map((tab) => <button key={tab.id} id={`tab-${tab.id}`} type="button" role="tab" aria-controls="report-panel" aria-selected={activeTab === tab.id} onClick={() => setActiveTab(tab.id)} className={`min-w-max rounded-lg px-4 py-3 text-left transition-colors ${activeTab === tab.id ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-700 hover:bg-gray-100'}`}>
        <span className="flex items-center gap-2 font-semibold"><span aria-hidden="true">{tab.icon}</span>{tab.label}</span><span className={`mt-0.5 block text-xs ${activeTab === tab.id ? 'text-blue-100' : 'text-gray-500'}`}>{tab.detail}</span>
      </button>)}
    </nav>

    <div id="report-panel" role="tabpanel" aria-labelledby={`tab-${activeTab}`} className="space-y-6">
    {activeTab === 'disc' && <>
    <Section title="DISC Personality Test" subtitle={disc?.completed ? `Completed ${localDate(disc.completedAt)}` : 'Not completed'}>
      {!disc ? <p className="text-gray-500">No DISC result recorded.</p> : <div className="space-y-4">
        <p className="font-semibold text-gray-800">Dominant color: {colorNames[disc.dominantColor || ''] || 'Pending'}</p>
        {Object.entries(disc.colorCounts || {}).map(([color, count]) => <div key={color} className="grid grid-cols-[120px_1fr_40px] items-center gap-3 text-sm text-gray-700"><span>{colorNames[color] || color}</span><div className="h-3 overflow-hidden rounded-full bg-gray-100"><div className={`h-full rounded-full ${colorBar[color] || 'bg-gray-400'}`} style={{ width: `${Math.min(100, (Number(count) / maxColor) * 100)}%` }} /></div><span className="text-right">{String(count)}</span></div>)}
        <details className="pt-2"><summary className="cursor-pointer font-medium text-blue-700">View answers ({disc.answers.length})</summary><div className="mt-3 grid gap-2 sm:grid-cols-2">{disc.answers.map((answer: any, index: number) => <div key={index} className="rounded-lg bg-gray-50 p-3 text-sm text-gray-800">Question {answer.questionIndex + 1}: <strong>{colorNames[answer.selectedColor] || answer.selectedColor}</strong></div>)}</div></details>
      </div>}
    </Section>
    </>}

    {activeTab === 'coaching' && <>
    <Section title="Coaching Quizzes (7P)" subtitle={`${coaching.length} quiz record(s)`}>
      {!coaching.length ? <p className="text-gray-500">No coaching quiz results recorded.</p> : <div className="space-y-4">{coaching.map((quiz: any, index: number) => <article key={`${quiz.moduleId || quiz.quizName}-${index}`} className="rounded-lg border border-gray-200 p-4">
        <div className="flex flex-wrap items-start justify-between gap-2"><div><h3 className="font-semibold text-gray-900">{quiz.quizName || 'Coaching quiz'}</h3><p className="text-sm text-gray-500">{quiz.completed ? `Completed ${localDate(quiz.completedAt)}` : 'In progress'}</p></div><span className="rounded-full bg-indigo-50 px-3 py-1 text-sm font-semibold text-indigo-800">{quiz.score ?? 0}/{quiz.totalQuestions ?? 0} · {quiz.percentage ?? 0}%</span></div>
        {!!quiz.answers?.length && <details className="mt-3"><summary className="cursor-pointer text-sm font-medium text-blue-700">View answer details ({quiz.answers.length})</summary><div className="mt-3 space-y-2">{quiz.answers.map((answer: any, answerIndex: number) => <div key={answerIndex} className={`rounded-lg border p-3 text-sm text-gray-800 ${answer.isCorrect === true ? 'border-green-200 bg-green-50' : answer.isCorrect === false ? 'border-red-200 bg-red-50' : 'border-gray-200 bg-gray-50'}`}><p className="font-medium text-gray-900">{localized(answer.questionSnapshot?.question) !== '—' ? localized(answer.questionSnapshot?.question) : `Question ${(answer.questionIndex ?? answerIndex) + 1}`}</p><p className={`mt-1 ${answer.isCorrect === undefined ? 'text-gray-700' : answer.isCorrect ? 'text-green-700' : 'text-red-700'}`}>Answer: {answer.selectedAnswer || 'No answer'}{answer.isCorrect === undefined ? '' : answer.isCorrect ? ' · Correct' : ' · Incorrect'}</p>{answer.questionSnapshot?.correct && <p className="text-gray-500">Expected: {localized(answer.questionSnapshot.correct)}</p>}</div>)}</div></details>}
      </article>)}</div>}
    </Section>
    </>}

    {activeTab === 'vark' && <>
    <Section title="VARK Learning Style" subtitle={vark?.completed ? `Completed ${localDate(vark.completedAt)}` : 'Not completed'}>
      {!vark ? <p className="text-gray-500">No VARK result recorded.</p> : <div className="space-y-4">
        <p className="font-semibold text-gray-800">Dominant style: <span aria-hidden="true">{styleIcons[vark.dominantStyle || ''] || ''}</span> {styleNames[vark.dominantStyle || ''] || 'Pending'}</p>
        {Object.entries(vark.styleCounts || {}).map(([style, count]) => <div key={style} className="grid grid-cols-[150px_1fr_40px] items-center gap-3 text-sm text-gray-700"><span><span aria-hidden="true" className="mr-2">{styleIcons[style] || '•'}</span>{styleNames[style] || style}</span><div className="h-3 overflow-hidden rounded-full bg-gray-100"><div className="h-full rounded-full bg-violet-500" style={{ width: `${Math.min(100, (Number(count) / maxStyle) * 100)}%` }} /></div><span className="text-right">{String(count)}</span></div>)}
        <details className="pt-2"><summary className="cursor-pointer font-medium text-blue-700">View answers ({vark.answers.length})</summary><div className="mt-3 grid gap-2 sm:grid-cols-2">{vark.answers.map((answer: any, index: number) => <div key={index} className="rounded-lg bg-gray-50 p-3 text-sm text-gray-800">Question {answer.questionIndex + 1}: <strong><span aria-hidden="true">{styleIcons[answer.selectedStyle] || ''} </span>{styleNames[answer.selectedStyle] || answer.selectedStyle}</strong></div>)}</div></details>
      </div>}
    </Section>
    </>}

    {activeTab === 'challenge' && <>
    <Section title="21-Day Challenge" subtitle={challenge ? `${completedDays}/21 completed` : 'Not started'}>
      {!challenge ? <p className="text-gray-500">No challenge progress recorded.</p> : <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{Array.from({ length: 21 }, (_, index) => {
        const day = index + 1; const item = challenge.challenges.find((entry: any) => entry.day === day);
        return <article key={day} className={`rounded-lg border p-3 text-gray-800 ${item?.completed ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50'}`}><div className="flex justify-between"><h3 className="font-semibold text-gray-900">Day {day}</h3><span className="text-xs text-gray-600">{item?.completed ? `Completed ${localDate(item.completedAt)}` : 'Not completed'}</span></div>{item?.notes && <p className="mt-2 whitespace-pre-wrap text-sm text-gray-700">{item.notes}</p>}{item?.submission?.textContent && <p className="mt-2 whitespace-pre-wrap text-sm text-gray-700">{item.submission.textContent}</p>}{item?.submission?.mediaUrl && <a className="mt-2 inline-block text-sm text-blue-700 underline" href={item.submission.mediaUrl} target="_blank" rel="noreferrer">Open {item.submission.mediaType || item.submission.type} submission</a>}</article>;
      })}</div>}
    </Section>
    </>}

    </div>
  </div>;
}
