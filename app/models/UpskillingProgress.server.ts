import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IUpskillingProgress extends Document {
    userId: mongoose.Types.ObjectId;
    personalityColor: 'rouge' | 'jaune' | 'vert' | 'bleu';
    challenges: {
        day: number;
        completed: boolean;
        completedAt?: Date;
        notes?: string;
        submission?: {
            type: 'text' | 'audio' | 'video' | 'none';
            textContent?: string;
            mediaUrl?: string;
            mediaType?: string;
            uploadedAt?: Date;
        };
    }[];
    startedAt: Date;
    lastAccessedDay: number;
    completedAt?: Date;
    currentStreak: number;
    createdAt: Date;
    updatedAt: Date;
    totalCompleted: number;
    progressPercentage: number;
    remainingChallenges: number;
    isFullyCompleted(): boolean;
    getNextChallenge(): number | null;
}

const upskillingProgressSchema = new Schema<IUpskillingProgress>({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    personalityColor: {
        type: String,
        enum: ['rouge', 'jaune', 'vert', 'bleu'],
        required: true
    },
    challenges: [{
        day: {
            type: Number,
            required: true,
            min: 1,
            max: 21
        },
        completed: {
            type: Boolean,
            default: false
        },
        completedAt: {
            type: Date
        },
        notes: {
            type: String,
            default: ''
        },
        submission: {
            type: {
                type: String,
                enum: ['text', 'audio', 'video', 'none'],
                default: 'none'
            },
            textContent: {
                type: String
            },
            mediaUrl: {
                type: String
            },
            mediaType: {
                type: String
            },
            uploadedAt: {
                type: Date
            }
        }
    }],
    startedAt: {
        type: Date,
        default: Date.now
    },
    lastAccessedDay: {
        type: Number,
        default: 0
    },
    completedAt: {
        type: Date
    },
    currentStreak: {
        type: Number,
        default: 0
    }
}, { timestamps: true });

// Ensure one upskilling progress document per user
upskillingProgressSchema.index({ userId: 1 }, { unique: true });

// Virtuals
upskillingProgressSchema.virtual('totalCompleted').get(function () {
    return this.challenges ? this.challenges.filter((c: any) => c.completed).length : 0;
});

upskillingProgressSchema.virtual('progressPercentage').get(function () {
    return Math.round((this.totalCompleted / 21) * 100);
});

upskillingProgressSchema.virtual('remainingChallenges').get(function () {
    return 21 - this.totalCompleted;
});

// Methods
upskillingProgressSchema.methods.isFullyCompleted = function () {
    return this.challenges ? this.challenges.filter((c: any) => c.completed).length === 21 : false;
};

upskillingProgressSchema.methods.getNextChallenge = function () {
    if (!this.challenges) return null;
    const uncompletedChallenge = this.challenges.find((c: any) => !c.completed);
    return uncompletedChallenge ? uncompletedChallenge.day : null;
};

// Ensure virtuals are included in JSON
upskillingProgressSchema.set('toJSON', { virtuals: true });
upskillingProgressSchema.set('toObject', { virtuals: true });

// Prevent model recompilation in development
const UpskillingProgress: Model<IUpskillingProgress> = mongoose.models.UpskillingProgress || mongoose.model<IUpskillingProgress>('UpskillingProgress', upskillingProgressSchema);

export default UpskillingProgress;
