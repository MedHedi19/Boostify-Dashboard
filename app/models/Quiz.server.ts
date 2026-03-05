import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IQuiz extends Document {
  title: string;
  slug?: string;
  source?: string;
  category?: string;
  questions?: number;
  duration?: string;
  attempts?: number;
  avgScore?: number;
  status?: 'active' | 'draft' | 'archived';
  createdAt: Date;
  updatedAt: Date;
}

const quizSchema = new Schema<IQuiz>({
  title: { type: String, required: true },
  slug: { type: String, required: false, index: true },
  source: { type: String, required: false },
  category: { type: String },
  questions: { type: Number, default: 0 },
  duration: { type: String },
  attempts: { type: Number, default: 0 },
  avgScore: { type: Number, default: 0 },
  status: { type: String, enum: ['active', 'draft', 'archived'], default: 'draft' },
}, { timestamps: true });

// Prevent model recompilation in development
const Quiz: Model<IQuiz> = mongoose.models.Quiz || mongoose.model<IQuiz>('Quiz', quizSchema);

export default Quiz;
