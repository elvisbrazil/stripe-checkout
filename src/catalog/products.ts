import type { Currency } from "@/lib/money";

export type Product = {
  id: string;
  name: string;
  description: string;
  prices: Record<Currency, number>;
};

export const products: Product[] = [
  {
    id: "mug-ceramic",
    name: "Ceramic mug",
    description: "350 ml, matte black, dishwasher safe.",
    prices: { BRL: 5990, USD: 1400 },
  },
  {
    id: "notebook-a5",
    name: "A5 dot grid notebook",
    description: "160 pages, 100 g/m² paper, lay-flat binding.",
    prices: { BRL: 7490, USD: 1800 },
  },
  {
    id: "tote-canvas",
    name: "Canvas tote bag",
    description: "Heavy cotton canvas with an inner pocket.",
    prices: { BRL: 8900, USD: 2200 },
  },
  {
    id: "pen-brass",
    name: "Brass pen",
    description: "Solid brass body, refillable gel cartridge.",
    prices: { BRL: 12990, USD: 3200 },
  },
  {
    id: "sticker-pack",
    name: "Sticker pack",
    description: "Six vinyl stickers, weatherproof.",
    prices: { BRL: 1990, USD: 500 },
  },
  {
    id: "hoodie-grey",
    name: "Grey hoodie",
    description: "Organic cotton fleece, regular fit.",
    prices: { BRL: 24900, USD: 5900 },
  },
];

export function findProduct(id: string) {
  return products.find((product) => product.id === id);
}
