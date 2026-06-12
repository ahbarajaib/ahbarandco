import { z } from "zod";

// User Registration Validation Schema
export const RegisterSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(50, "Name must not exceed 50 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

// User Login Validation Schema
export const LoginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

const ImageSchema = z.string().refine(
  (val) => {
    if (val.startsWith("/")) return true;
    try {
      new URL(val);
      return true;
    } catch {
      return false;
    }
  },
  { message: "Must be a valid absolute URL or local path (starting with /)" }
);

// Product CRUD Validation Schema
export const ProductSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100, "Name must not exceed 100 characters"),
  shortDesc: z.string().max(250, "Short description must not exceed 250 characters").optional().nullable(),
  description: z.string().min(10, "Description must be at least 10 characters").optional().nullable(),
  price: z.number().positive("Price must be a positive number"),
  compareAtPrice: z.number().positive("Compare at price must be a positive number").optional().nullable(),
  stock: z.number().int("Stock must be an integer").nonnegative("Stock cannot be negative"),
  material: z.string().optional().nullable(),
  dimensions: z.string().optional().nullable(),
  careGuide: z.string().optional().nullable(),
  featured: z.boolean().default(false),
  published: z.boolean().default(true),
  collectionId: z.string().optional().nullable(),
  images: z.array(ImageSchema).min(1, "At least one product image is required"),
});

// Collection CRUD Validation Schema
export const CollectionSchema = z.object({
  name: z.string().min(2, "Collection name must be at least 2 characters").max(50, "Collection name must not exceed 50 characters"),
  description: z.string().max(500, "Description must not exceed 500 characters").optional().nullable(),
  imageUrl: ImageSchema.optional().nullable(),
  sortOrder: z.number().int("Sort order must be an integer").default(0),
  published: z.boolean().default(true),
});

// Journal / Blog CRUD Validation Schema
export const JournalPostSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters").max(150, "Title must not exceed 150 characters"),
  excerpt: z.string().max(300, "Excerpt must not exceed 300 characters").optional().nullable(),
  content: z.string().min(20, "Content must be at least 20 characters"),
  coverImageUrl: ImageSchema.optional().nullable(),
  published: z.boolean().default(false),
});

export const ForgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export const ResetPasswordSchema = z.object({
  password: z.string().min(8, "Password must be at least 8 characters"),
});

