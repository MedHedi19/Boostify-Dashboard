import mongoose, { Schema, type Document, type Model } from 'mongoose';

export interface IVarkTest extends Document {
  userId: mongoose.Types.ObjectId;
  completed: boolean;
  answers: { questionIndex: number; selectedStyle: 'V' | 'A' | 'R' | 'K' }[];
  styleCounts: { V: number; A: number; R: number; K: number };
  dominantStyle?: 'V' | 'A' | 'R' | 'K';
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const varkTestSchema = new Schema<IVarkTest>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  completed: { type: Boolean, default: false },
  answers: [{
    questionIndex: { type: Number, required: true },
    selectedStyle: { type: String, required: true, enum: ['V', 'A', 'R', 'K'] },
  }],
  styleCounts: {
    V: { type: Number, default: 0 },
    A: { type: Number, default: 0 },
    R: { type: Number, default: 0 },
    K: { type: Number, default: 0 },
  },
  dominantStyle: { type: String, enum: ['V', 'A', 'R', 'K'] },
  completedAt: Date,
}, { timestamps: true });

const VarkTest: Model<IVarkTest> = mongoose.models.VarkTest || mongoose.model<IVarkTest>('VarkTest', varkTestSchema);

export default VarkTest;
