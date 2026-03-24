import mongoose, { Schema, Document, Model } from 'mongoose';

interface ILocalizedText {
    fr?: string;
    en?: string;
    ar?: string;
}

interface IQuestionSnapshot {
    questionId?: mongoose.Types.ObjectId;
    question?: ILocalizedText;
    options?: ILocalizedText[];
    correct?: ILocalizedText;
}

interface IAnswer {
    questionIndex?: number;
    questionId?: mongoose.Types.ObjectId;
    selectedAnswer?: string | null;
    isCorrect?: boolean;
    questionSnapshot?: IQuestionSnapshot;
    answeredAt?: Date;
}

interface IQuizProgressEntry {
    moduleId?: mongoose.Types.ObjectId;
    moduleSlug?: string;
    moduleVersion?: number;
    quizName: string;
    completed: boolean;
    score: number;
    totalQuestions: number;
    percentage: number;
    completedAt?: Date;
    selectedQuestions?: number[];
    selectedQuestionIds?: mongoose.Types.ObjectId[];
    selectedQuestionSnapshots?: IQuestionSnapshot[];
    answers?: IAnswer[];
}

export interface IUserProgress extends Document {
    userId: mongoose.Types.ObjectId;
    quizProgress: IQuizProgressEntry[];
    currentQuizIndex: number;
    createdAt: Date;
    updatedAt: Date;
}

const localizedTextSchema = new Schema<ILocalizedText>({
    fr: { type: String },
    en: { type: String },
    ar: { type: String },
}, { _id: false });

const questionSnapshotSchema = new Schema<IQuestionSnapshot>({
    questionId: { type: Schema.Types.ObjectId },
    question: { type: localizedTextSchema },
    options: {
        type: [localizedTextSchema],
        default: [],
    },
    correct: { type: localizedTextSchema },
}, { _id: false });

const answerSchema = new Schema<IAnswer>({
    questionIndex: { type: Number },
    questionId: { type: Schema.Types.ObjectId },
    selectedAnswer: { type: String },
    isCorrect: { type: Boolean },
    questionSnapshot: { type: questionSnapshotSchema },
    answeredAt: { type: Date },
}, { _id: false });

const quizProgressEntrySchema = new Schema<IQuizProgressEntry>({
    moduleId: {
        type: Schema.Types.ObjectId,
        ref: 'QuizModule',
    },
    moduleSlug: {
        type: String,
    },
    moduleVersion: {
        type: Number,
        default: 1,
    },
    quizName: {
        type: String,
        required: true,
    },
    completed: {
        type: Boolean,
        default: false,
    },
    score: {
        type: Number,
        default: 0,
    },
    totalQuestions: {
        type: Number,
        default: 10,
    },
    percentage: {
        type: Number,
        default: 0,
    },
    completedAt: {
        type: Date,
    },
    selectedQuestions: [{
        type: Number,
    }],
    selectedQuestionIds: {
        type: [Schema.Types.ObjectId],
        default: [],
    },
    selectedQuestionSnapshots: {
        type: [questionSnapshotSchema],
        default: [],
    },
    answers: {
        type: [answerSchema],
        default: [],
    },
});

const userProgressSchema = new Schema<IUserProgress>({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    quizProgress: {
        type: [quizProgressEntrySchema],
        default: [],
    },
    currentQuizIndex: {
        type: Number,
        default: 0,
    },
}, { timestamps: true });

// Ensure one progress document per user
userProgressSchema.index({ userId: 1 }, { unique: true });

// Prevent model recompilation in development
const UserProgress: Model<IUserProgress> = mongoose.models.UserProgress || mongoose.model<IUserProgress>('UserProgress', userProgressSchema);

export default UserProgress;
