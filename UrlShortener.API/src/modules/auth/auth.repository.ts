import { prisma } from '../../lib/prisma';

export const findUserByEmail = async (email: string) => {
    return prisma.user.findUnique({
        where: {email},
    });
};

export const createUser = async (email: string, hashedPassword: string) => {
    return prisma.user.create({
        data:{
            email,
            password: hashedPassword,
        },
    });
};