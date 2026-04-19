export type ProductCategory = "JEJU_TICON" | "GOODS";

export type Product = {
  productId: string | number;
  name: string;
  imageUrl?: string | null;
  category?: ProductCategory;
  hallabongCost?: number | null;
  description?: string | null;
};
