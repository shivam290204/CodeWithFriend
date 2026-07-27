import mongoose from 'mongoose';

const roomSchema = new mongoose.Schema(
  {
    roomCode: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    language: { type: String, default: 'javascript' },
    hostId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    members: [{ 
      userId: { type: String, required: true }, // Using String to support both ObjectId and 'guest-...'
      role: { type: String, default: 'member' }
    }],
    yjsState: { type: Buffer }
  },
  { timestamps: true }
);

export const Room = mongoose.model('Room', roomSchema);
