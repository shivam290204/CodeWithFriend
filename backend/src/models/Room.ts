import mongoose from 'mongoose';

const roomSchema = new mongoose.Schema(
  {
    roomCode: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    language: { type: String, default: 'javascript' },
    hostId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

export const Room = mongoose.model('Room', roomSchema);
