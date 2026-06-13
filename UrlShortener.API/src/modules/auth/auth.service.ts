import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

import { createUser, findUserByEmail } from './auth.repository';
import { AuthResponse, LoginDto, RegisterDto } from './auth.types';

const SALT_ROUNDS = 10;

export const registerUser = async (dto: RegisterDto): Promise<AuthResponse> =>{
    const existingUser = await findUserByEmail(dto.email);

    if(existingUser){
        throw new Error ('Email already in use');
    }

    const hashedPassword = await bcrypt.hash(dto.password, SALT_ROUNDS);

    const user = await createUser(dto.email, hashedPassword);

    const secret = process.env.JWT_SECRET!;
    const token = jwt.sign(
        { userId: user.id, email: user.email, role: user.role },
        secret,
        {expiresIn: '7d'},
    );

    return{
        token,
        user: {
            id: user.id,
            email: user.email,
            role: user.role,
        },
    };
};


export const loginUser = async (dto: LoginDto): Promise<AuthResponse> =>{
    const user = await findUserByEmail (dto.email);

    if (!user) {
        throw new Error('Invalid credentials');
    }

    const passwordMatch = await bcrypt.compare(dto.password, user.password);

    if (!passwordMatch) {
        throw new Error('Invalid credentials');
    }

    const secret = process.env.JWT_SECRET!;
    const token = jwt.sign(
        { userId: user.id, email: user.email, role: user.role },
        secret,
        { expiresIn: '7d' },
    );

    return{
        token,
        user: {
            id: user.id,
            email: user.email,
            role: user.role,
        },
    };
};
