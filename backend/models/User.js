import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    uid: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    displayName: { type: String },
    photoURL: { type: String },

    role: { type: String, enum: ["user", "admin", "super_admin"], default: "user" },
    status: { type: String, enum: ["active", "banned", "inactive"], default: "active" },

    plan: { type: String, enum: ["free", "pro", "enterprise"], default: "free" },
    stripeCustomerId: { type: String },
    trialEndsAt: { type: Date },

    credits: { type: Number, default: 0 },
    totalCreditsUsed: { type: Number, default: 0 },

    totalFilesUploaded: { type: Number, default: 0 },
    totalPagesProcessed: { type: Number, default: 0 },
    storageUsedMB: { type: Number, default: 0 },
    defaultNamespace: { type: String },
    lastActiveFileId: { type: String },

    preferences: {
      theme: { type: String, default: "light" },
      language: { type: String, default: "en" },
      notifications: { type: Boolean, default: true }
    },

    onboardingCompleted: { type: Boolean, default: false },
    metadata: { type: mongoose.Schema.Types.Mixed },

    lastLogin: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.models.User || mongoose.model("User", userSchema);
