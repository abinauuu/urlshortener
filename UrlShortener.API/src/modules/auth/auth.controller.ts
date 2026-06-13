import { Request, Response } from "express";
import { loginUser, registerUser, refreshTokens, logoutUser } from "./auth.service";

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

export const refresh = async (req: Request, res: Response): Promise<void> => {
    try {
        const tokens = await refreshTokens(req.body.refreshToken);
        res.status(200).json(tokens);
    } catch (error) {
        res.status(401).json({
            message: error instanceof Error ? error.message : 'Could not refresh token',
        });
    }
};

export const logout = async (req: Request, res: Response): Promise<void> => {
    await logoutUser(req.body.refreshToken);
    res.status(204).send();
};