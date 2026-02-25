
import mongoose, { Schema, Document, Model } from 'mongoose';
import type { IUser } from './User';

export interface IQuizResult extends Document {
	userId: mongoose.Types.ObjectId | string;
	userName: string;
	quizKey: string; // slug/key for quiz e.g. 'empowring'
	score: number;
	validated: boolean;
	takenAt: Date;
	createdAt: Date;
	updatedAt: Date;
}

const QuizResultSchema = new Schema<IQuizResult>({
	userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
	userName: { type: String, required: true },
	quizKey: { type: String, required: true, index: true },
	score: { type: Number, required: true },
	validated: { type: Boolean, default: false },
	takenAt: { type: Date, default: Date.now },
}, { timestamps: true });

const QuizResult: Model<IQuizResult> = mongoose.models.QuizResult || mongoose.model<IQuizResult>('QuizResult', QuizResultSchema);

export default QuizResult;
