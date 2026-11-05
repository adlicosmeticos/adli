import { CreateProductBody, UpdateProductBody } from "@workspace/api-zod";
import { db, productsTable } from "@workspace/db";
import { asc, desc, eq } from "drizzle-orm";
import { Router, type IRouter } from "express";
import { requireAdmin } from "../middlewares/requireAdmin";

const router: IRouter = Router();

function isUniqueViolation(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "23505"
  );
}

router.get("/products", async (_req, res, next) => {
  try {
    const products = await db
      .select()
      .from(productsTable)
      .where(eq(productsTable.isActive, true))
      .orderBy(asc(productsTable.sortOrder), asc(productsTable.name));

    res.json(products);
  } catch (error) {
    next(error);
  }
});

router.get("/admin/products", requireAdmin, async (_req, res, next) => {
  try {
    const products = await db
      .select()
      .from(productsTable)
      .orderBy(asc(productsTable.sortOrder), desc(productsTable.createdAt));

    res.json(products);
  } catch (error) {
    next(error);
  }
});

router.post("/admin/products", requireAdmin, async (req, res, next) => {
  const parsed = CreateProductBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  try {
    const [product] = await db
      .insert(productsTable)
      .values(parsed.data)
      .returning();

    res.status(201).json(product);
  } catch (error) {
    if (isUniqueViolation(error)) {
      res.status(409).json({ error: "Já existe um produto com este endereço." });
      return;
    }
    next(error);
  }
});

router.put("/admin/products/:id", requireAdmin, async (req, res, next) => {
  const id = Number.parseInt(String(req.params.id), 10);
  if (!Number.isSafeInteger(id) || id < 1) {
    res.status(400).json({ error: "Identificador de produto inválido." });
    return;
  }

  const parsed = UpdateProductBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  try {
    const [product] = await db
      .update(productsTable)
      .set({ ...parsed.data, updatedAt: new Date() })
      .where(eq(productsTable.id, id))
      .returning();

    if (!product) {
      res.status(404).json({ error: "Produto não encontrado." });
      return;
    }

    res.json(product);
  } catch (error) {
    if (isUniqueViolation(error)) {
      res.status(409).json({ error: "Já existe um produto com este endereço." });
      return;
    }
    next(error);
  }
});

router.delete("/admin/products/:id", requireAdmin, async (req, res, next) => {
  const id = Number.parseInt(String(req.params.id), 10);
  if (!Number.isSafeInteger(id) || id < 1) {
    res.status(400).json({ error: "Identificador de produto inválido." });
    return;
  }

  try {
    const [deleted] = await db
      .delete(productsTable)
      .where(eq(productsTable.id, id))
      .returning({ id: productsTable.id });

    if (!deleted) {
      res.status(404).json({ error: "Produto não encontrado." });
      return;
    }

    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

export default router;
