"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Room = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const roomSchema = new mongoose_1.default.Schema({
    roomCode: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    language: { type: String, default: 'javascript' },
    hostId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'User' },
    members: [{
            userId: { type: String, required: true }, // Using String to support both ObjectId and 'guest-...'
            role: { type: String, default: 'member' }
        }],
}, { timestamps: true });
exports.Room = mongoose_1.default.model('Room', roomSchema);
