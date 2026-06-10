import { Request, Response } from "express";
import { loginUser, registerUser } from "./auth.service";

export const register = async (req: Request, res: Response): Promise<void> => {
    try{
        const result = await registerUser(req.body);
        res.status(201).json(result);
    } catch (error){
        res.status(400).json({
            message: error instanceof Error ? error.message : 'Registration failed',
        });
    }
};

export const login = async (req:Request, res: Response): Promise<void> => {
    try{
        const result = await loginUser(req.body);

        res.status(200).json(result);
    } catch (error) {
        res.status(400).json({
            message: error instanceof Error ? error.message : 'Login faieled',
        });
    }
};