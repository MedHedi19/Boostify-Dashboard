import connectDB from '../../lib/db.server';
import QuizResult from '../../models/QuizResult.server';

// This file implements two behaviors depending on method:
// GET /api/quiz-results?quizKey=empowring -> returns array of results
// POST /api/quiz-results/toggle-validate -> body { id } toggles validated and returns updated document

export async function handler(req: any, res: any) {
	await connectDB();

	try {
		if (req.method === 'GET') {
			const quizKey = String(req.query.quizKey || '');
			if (!quizKey) return res.status(400).json({ error: 'quizKey required' });

			const results = await QuizResult.find({ quizKey }).sort({ takenAt: -1 }).lean();
			// map _id to string and format takenAt
			return res.json(results.map(r => ({
				...r,
				_id: String(r._id),
				takenAt: r.takenAt,
			})));
		}

		if (req.method === 'POST') {
			const { id } = req.body;
			if (!id) return res.status(400).send('id required');

			const doc = await QuizResult.findById(id);
			if (!doc) return res.status(404).send('not found');

			doc.validated = !doc.validated;
			await doc.save();

			return res.json({
				_id: String(doc._id),
				userId: String(doc.userId),
				userName: doc.userName,
				quizKey: doc.quizKey,
				score: doc.score,
				validated: doc.validated,
				takenAt: doc.takenAt,
			});
		}

		res.setHeader('Allow', 'GET, POST');
		return res.status(405).end(`Method ${req.method} Not Allowed`);
	} catch (e: any) {
		console.error('quiz-results API error', e);
		return res.status(500).json({ error: e.message || 'server error' });
	}
}

// For frameworks expecting default export
export default handler;
