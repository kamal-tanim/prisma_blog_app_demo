import { NextFunction, Request, Response } from "express";
import { auth as betterAuth } from "../lib/auth";
import { UserRole } from "../enum/UserRole";

const auth = (...role: UserRole []) => {
  
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
          const session = await betterAuth.api.getSession({
        headers: req.headers as any,
      });

      if (!session) {
        return res.send(401).json({
          success: false,
          message: "You are not authorized",
        });
      }

      if (!session.user.emailVerified) {
        return res.send(403).json({
          success: false,
          message: "Email verification required. Please verify your email",
        });
      }

      req.user = {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name,
        role: session.user.role as string,
        emailVerified: session.user.emailVerified,
      };

      if (role.length && !role.includes(req.user.role as UserRole)) {
        return res.send(403).json({
          success: false,
          message:
            "Forbidden! You don't have permission to access this resource",
        });
      }

      next();
        }
        catch (err) {
            console.error(err)
        }
    };
  
};

export default auth
