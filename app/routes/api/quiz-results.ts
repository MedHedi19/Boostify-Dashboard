import connectDB from '../../lib/db.server';
import QuizResult from '../../models/QuizResult.server';

export async function loader({ request }: { request: Request }) {
  await connectDB();

  try {
    const url = new URL(request.url);
    const quizKey = url.searchParams.get('quizKey');

    if (!quizKey) {
      return Response.json({ error: 'quizKey required' }, { status: 400 });
    }

    const results = await QuizResult.find({ quizKey }).sort({ takenAt: -1 }).lean();
    return Response.json(results.map(r => ({ ...r, _id: String(r._id), takenAt: r.takenAt })));
  } catch (e: any) {
    console.error('quiz-results GET error', e);
    return Response.json({ error: e.message || 'server error' }, { status: 500 });
  }
}
