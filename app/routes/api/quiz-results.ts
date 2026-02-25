import connectDB from '../../lib/db';
import QuizResult from '../../models/QuizResult';

export default async function handler(req: any, res: any) {
  await connectDB();

  try {
    if (req.method === 'GET') {
      const quizKey = String(req.query?.quizKey || '');
      if (!quizKey) return res.status(400).json({ error: 'quizKey required' });

      const results = await QuizResult.find({ quizKey }).sort({ takenAt: -1 }).lean();
      return res.json(results.map(r => ({ ...r, _id: String(r._id), takenAt: r.takenAt })));
    }

    res.setHeader('Allow', 'GET');
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  } catch (e: any) {
    console.error('quiz-results GET error', e);
    return res.status(500).json({ error: e.message || 'server error' });
  }
}
