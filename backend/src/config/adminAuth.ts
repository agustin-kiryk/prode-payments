// Middleware de autenticación para endpoints de admin
// Similar a un Interceptor en Spring Boot

import { Request, Response, NextFunction } from 'express';

export const adminAuth = (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers['x-admin-token'];
  const expectedToken = process.env.ADMIN_TOKEN || 'prode-admin-2026';

  if (!token || token !== expectedToken) {
    return res.status(403).json({
      success: false,
      error: '⚠️ Acceso denegado: Token de administrador inválido',
    });
  }

  next();
};

