import mongoose from 'mongoose'

export interface IUser extends mongoose.Document {
    username: string
    passwordHash: string
    role: 'operator' | 'vendor' | 'customer' | 'admin'
    firstName?: string
    lastName?: string
    mobile?: string
    createdAt: Date
}

const userSchema = new mongoose.Schema<IUser>({
    username: { type: String, required: true, unique: true, trim: true, lowercase: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['operator', 'vendor', 'customer', 'admin'], default: 'operator' },
    firstName: { type: String, trim: true },
    lastName: { type: String, trim: true },
    mobile: { type: String, trim: true },
    createdAt: { type: Date, default: Date.now }
})

const User = mongoose.models.User || mongoose.model<IUser>('User', userSchema)

export default User