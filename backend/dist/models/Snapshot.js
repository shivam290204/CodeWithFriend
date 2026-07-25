"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Snapshot = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const snapshotSchema = new mongoose_1.default.Schema({
    roomId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'Room', required: true },
    content: { type: String, required: true }, // Can be the Yjs state vector or plain text
    description: { type: String, default: 'Manual Snapshot' },
}, { timestamps: true });
exports.Snapshot = mongoose_1.default.model('Snapshot', snapshotSchema);
