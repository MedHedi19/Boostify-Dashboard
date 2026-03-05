import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IPersonalityTest extends Document {
    userId: mongoose.Types.ObjectId;
    completed: boolean;
    answers: {
        questionIndex: number;
        selectedColor: 'R' | 'J' | 'B' | 'V';
    }[];
    colorCounts: {
        R: number;
        J: number;
        B: number;
        V: number;
    };
    dominantColor?: 'R' | 'J' | 'B' | 'V' | 'G' | 'Y';
    completedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

const personalityTestSchema = new Schema<IPersonalityTest>({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    completed: {
        type: Boolean,
        default: false
    },
    answers: [{
        questionIndex: {
            type: Number,
            required: true
        },
        selectedColor: {
            type: String,
            required: true,
            enum: ['R', 'J', 'B', 'V']
        }
    }],
    colorCounts: {
        R: { type: Number, default: 0 },
        J: { type: Number, default: 0 },
        B: { type: Number, default: 0 },
        V: { type: Number, default: 0 }
    },
    dominantColor: {
        type: String,
        validate: {
            validator: function (v: any) {
                return v === null || v === undefined || ['R', 'J', 'B', 'V', 'G', 'Y'].includes(v);
            },
            message: '{VALUE} is not a valid color'
        }
    },
    completedAt: {
        type: Date
    }
}, { timestamps: true });

// Ensure one personality test per user
personalityTestSchema.index({ userId: 1 }, { unique: true });

// Prevent model recompilation in development
const PersonalityTest: Model<IPersonalityTest> = mongoose.models.PersonalityTest || mongoose.model<IPersonalityTest>('PersonalityTest', personalityTestSchema);

export default PersonalityTest;
