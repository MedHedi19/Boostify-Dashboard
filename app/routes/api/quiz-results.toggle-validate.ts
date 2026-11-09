import { json } from "@react-router/node";
import connectDB from '../../lib/db.server';
import QuizResult from '../../models/QuizResult.server';

// POST /api/quiz-results/toggle-validate -> body { id } toggles validated and returns updated document

export async function action({ request }: { request: Request }) {
	await connectDB();

	try {
		const body = await request.json();
		const { id } = body;

		if (!id) {
			return json({ error: 'id required' }, { status: 400 });
		}

		const doc = await QuizResult.findById(id);
		if (!doc) {
			return json({ error: 'not found' }, { status: 404 });
		}

		doc.validated = !doc.validated;
		await doc.save();

		return json({
			_id: String(doc._id),
			userId: String(doc.userId),
			userName: doc.userName,
			quizKey: doc.quizKey,
			score: doc.score,
			validated: doc.validated,
			takenAt: doc.takenAt,
		});
	} catch (e: any) {
		console.error('quiz-results API error', e);
		return json({ error: e.message || 'server error' }, { status: 500 });
	}
}
