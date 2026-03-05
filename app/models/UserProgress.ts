import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IUserProgress extends Document {
    userId: mongoose.Types.ObjectId;
    quizProgress: {
        quizName: string;
        completed: boolean;
        score: number;
        totalQuestions: number;
        percentage: number;
        completedAt?: Date;
        selectedQuestions?: number[];
        answers?: {
            questionIndex: number;
            selectedAnswer: string;
            isCorrect: boolean;
        }[];
    }[];
    currentQuizIndex: number;
    createdAt: Date;
    updatedAt: Date;
}

const userProgressSchema = new Schema<IUserProgress>({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    quizProgress: [{
        quizName: {
            type: String,
            required: true
        },
        completed: {
            type: Boolean,
            default: false
        },
        score: {
            type: Number,
            default: 0
        },
        totalQuestions: {
            type: Number,
            default: 10
        },
        percentage: {
            type: Number,
            default: 0
        },
        completedAt: {
            type: Date
        },
        selectedQuestions: [{
            type: Number
        }],
        answers: [{
            questionIndex: Number,
            selectedAnswer: String,
            isCorrect: Boolean
        }]
    }],
    currentQuizIndex: {
        type: Number,
        default: 0
    }
}, { timestamps: true });

// Ensure one progress document per user
userProgressSchema.index({ userId: 1 }, { unique: true });

// Prevent model recompilation in development
const UserProgress: Model<IUserProgress> = mongoose.models.UserProgress || mongoose.model<IUserProgress>('UserProgress', userProgressSchema);

export default UserProgress;
