import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema(
  {
    roomId: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true },
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
    text: { type: String, required: true },
    senderName: { type: String, required: true },
  },
  { timestamps: true }
);

export const Message = mongoose.model('Message', messageSchema);
