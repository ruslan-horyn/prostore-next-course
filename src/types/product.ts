import { insertProjectSchema } from "@/lib/validators";
import { z } from "zod";

export interface Product extends z.infer<typeof insertProjectSchema> {
  id: string;
  rating: string;
  createdAt: Date;
  updatedAt: Date;
}
