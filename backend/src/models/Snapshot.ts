import mongoose from 'mongoose';

const snapshotSchema = new mongoose.Schema(
  {
    roomId: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true },
    content: { type: String, required: true }, // Can be the Yjs state vector or plain text
    description: { type: String, default: 'Manual Snapshot' },
  },
  { timestamps: true }
);

export const Snapshot = mongoose.model('Snapshot', snapshotSchema);
