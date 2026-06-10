import { hash } from 'node:crypto';
import { prisma } from '../../lib/prisma';

export const findUserByEmail = async (email: string) => {
    return await prisma.user.findUnique({
        where: {email},
    });
};

export const createUser = async (email: string, hashedPassword: string) => {
    return await prisma.user.create({
        data:{
            email,
            password: hashedPassword,
        },
    });
};