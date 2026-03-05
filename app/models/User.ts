import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IUser extends Document {
  firstName: string;
  lastName: string;
  phone?: string;
  email: string;
  password?: string;
  socialAuth?: {
    googleId?: string;
    facebookId?: string;
    linkedinId?: string;
  };
  profilePhoto?: string;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  deletionToken?: string;
  deletionTokenExpires?: Date;
  refreshToken?: string;
  certificateSentCount: number;
  payment?: {
    subscriptionType?: 'free' | 'premium';
    subscriptionStatus?: 'active' | 'expired' | 'cancelled' | 'trial';
    subscriptionStartDate?: Date;
    subscriptionEndDate?: Date;
    totalSpent?: number;
    lastPaymentDate?: Date;
    lastPaymentAmount?: number;
    paymentMethod?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>({
  firstName: {
    type: String,
    required: true,
    trim: true,
  },
  lastName: {
    type: String,
    required: true,
    trim: true,
  },
  phone: {
    type: String,
    required: false,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    validate: {
      validator: function (v: string) {
        return /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(v);
      },
      message: (props: any) => `${props.value} is not a valid email address!`
    }
  },
  password: {
    type: String,
    minlength: [8, 'Password must be at least 8 characters long'],
  },
  socialAuth: {
    googleId: {
      type: String,
    },
    facebookId: {
      type: String,
    },
    linkedinId: {
      type: String,
    },
  },
  profilePhoto: {
    type: String,
  },
  resetPasswordToken: {
    type: String,
  },
  resetPasswordExpires: {
    type: Date,
  },
  deletionToken: {
    type: String,
  },
  deletionTokenExpires: {
    type: Date,
  },
  refreshToken: {
    type: String,
  },
  certificateSentCount: {
    type: Number,
    default: 0,
  },
  payment: {
    subscriptionType: {
      type: String,
      enum: ['free', 'premium'],
      default: 'free',
    },
    subscriptionStatus: {
      type: String,
      enum: ['active', 'expired', 'cancelled', 'trial'],
      default: 'active',
    },
    subscriptionStartDate: {
      type: Date,
    },
    subscriptionEndDate: {
      type: Date,
    },
    totalSpent: {
      type: Number,
      default: 0,
    },
    lastPaymentDate: {
      type: Date,
    },
    lastPaymentAmount: {
      type: Number,
    },
    paymentMethod: {
      type: String,
    },
  },
}, { timestamps: true });

// Create sparse indexes to allow multiple null values
userSchema.index({ phone: 1 }, { sparse: true, unique: true });
userSchema.index({ 'socialAuth.googleId': 1 }, { sparse: true, unique: true });
userSchema.index({ 'socialAuth.facebookId': 1 }, { sparse: true, unique: true });
userSchema.index({ 'socialAuth.linkedinId': 1 }, { sparse: true, unique: true });

// Prevent model recompilation in development
const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', userSchema);

export default User;
