import { clerkClient, getAuth } from "@clerk/express";
import type { RequestHandler } from "express";

const allowedAdminEmails = new Set(
  (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean),
);

export const requireAdmin: RequestHandler = async (req, res, next) => {
  const { userId } = getAuth(req);
  if (!userId) {
    res.status(401).json({ error: "Entre para acessar o painel da loja." });
    return;
  }

  if (allowedAdminEmails.size === 0) {
    res.status(403).json({ error: "Nenhum administrador está configurado." });
    return;
  }

  try {
    const user = await clerkClient.users.getUser(userId);
    const isAllowedAdmin = user.emailAddresses.some(
      (email) =>
        allowedAdminEmails.has(email.emailAddress.trim().toLowerCase()) &&
        email.verification?.status === "verified",
    );

    if (!isAllowedAdmin) {
      res.status(403).json({ error: "Este acesso não pode gerenciar a loja." });
      return;
    }

    next();
  } catch (error) {
    next(error);
  }
};
