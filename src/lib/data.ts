export type Garment = {
  id: string;
  name: string;
  category: 'Dresses' | 'Tops' | 'Bottoms' | 'Outerwear' | 'Skirts' | 'Jumpsuits';
  price: number;
  brand: string;
  baseSize: 'M';
  tags: string[];
  imageId: string;
  compatibleFabrics: string[];
};

export type Fabric = {
  id: string;
  name: string;
  colorways: { name: string; color: string }[];
  materialParams: {
    density: number;
    stretch: number;
    bendingStiffness: number;
  };
};

export const garments: Garment[] = [
  {
    id: 'g1',
    name: 'The A-Line Dream',
    category: 'Dresses',
    price: 4500,
    brand: 'Aura',
    baseSize: 'M',
    tags: ['spring', 'summer', 'elegant'],
    imageId: 'garment-1',
    compatibleFabrics: ['f1', 'f2', 'f3'],
  },
  {
    id: 'g2',
    name: 'Essential Silk Blouse',
    category: 'Tops',
    price: 3200,
    brand: 'Cada',
    baseSize: 'M',
    tags: ['work', 'classic', 'all-season'],
    imageId: 'garment-2',
    compatibleFabrics: ['f2', 'f4'],
  },
  {
    id: 'g3',
    name: 'Corporate Trousers',
    category: 'Bottoms',
    price: 3800,
    brand: 'Forma',
    baseSize: 'M',
    tags: ['professional', 'tailored', 'sleek'],
    imageId: 'garment-3',
    compatibleFabrics: ['f5', 'f6'],
  },
  {
    id: 'g4',
    name: 'City Trench Coat',
    category: 'Outerwear',
    price: 7500,
    brand: 'Aura',
    baseSize: 'M',
    tags: ['timeless', 'outerwear', 'fall'],
    imageId: 'garment-4',
    compatibleFabrics: ['f6'],
  },
  {
    id: 'g5',
    name: 'Kyoto Floral Skirt',
    category: 'Skirts',
    price: 2900,
    brand: 'Zinnia',
    baseSize: 'M',
    tags: ['floral', 'summer', 'vibrant'],
    imageId: 'garment-5',
    compatibleFabrics: ['f1', 'f3'],
  },
  {
    id: 'g6',
    name: 'Cloud Knit Sweater',
    category: 'Tops',
    price: 4100,
    brand: 'Loom',
    baseSize: 'M',
    tags: ['cozy', 'winter', 'minimal'],
    imageId: 'garment-6',
    compatibleFabrics: ['f5'],
  },
  {
    id: 'g7',
    name: 'Urban Jumpsuit',
    category: 'Jumpsuits',
    price: 5200,
    brand: 'Forma',
    baseSize: 'M',
    tags: ['modern', 'chic', 'one-piece'],
    imageId: 'garment-7',
    compatibleFabrics: ['f6', 'f4'],
  },
  {
    id: 'g8',
    name: 'The Executive Blazer',
    category: 'Outerwear',
    price: 6300,
    brand: 'Cada',
    baseSize: 'M',
    tags: ['power-dressing', 'structured', 'formal'],
    imageId: 'garment-8',
    compatibleFabrics: ['f5', 'f6'],
  },
];

export const fabrics: Fabric[] = [
  {
    id: 'f1',
    name: 'Cotton',
    colorways: [
      { name: 'White', color: '#FFFFFF' },
      { name: 'Sky Blue', color: '#87CEEB' },
      { name: 'Pale Pink', color: '#FADADD' },
    ],
    materialParams: { density: 150, stretch: 0.05, bendingStiffness: 0.2 },
  },
  {
    id: 'f2',
    name: 'Silk',
    colorways: [
      { name: 'Champagne', color: '#F7E7CE' },
      { name: 'Ruby Red', color: '#9B111E' },
      { name: 'Emerald', color: '#50C878' },
    ],
    materialParams: { density: 50, stretch: 0.02, bendingStiffness: 0.05 },
  },
  {
    id: 'f3',
    name: 'Chiffon',
    colorways: [
      { name: 'Lavender', color: '#E6E6FA' },
      { name: 'Mint Green', color: '#98FF98' },
      { name: 'Black', color: '#000000' },
    ],
    materialParams: { density: 30, stretch: 0.1, bendingStiffness: 0.02 },
  },
  {
    id: 'f4',
    name: 'Linen',
    colorways: [
      { name: 'Natural Beige', color: '#D4C4B1' },
      { name: 'Olive Green', color: '#808000' },
      { name: 'Navy', color: '#000080' },
    ],
    materialParams: { density: 200, stretch: 0.03, bendingStiffness: 0.4 },
  },
  {
    id: 'f5',
    name: 'Wool Knit',
    colorways: [
      { name: 'Charcoal', color: '#36454F' },
      { name: 'Cream', color: '#FFFDD0' },
      { name: 'Burgundy', color: '#800020' },
    ],
    materialParams: { density: 300, stretch: 0.2, bendingStiffness: 0.6 },
  },
  {
    id: 'f6',
    name: 'Denim',
    colorways: [
      { name: 'Classic Blue', color: '#1560BD' },
      { name: 'Washed Black', color: '#2C2C2C' },
      { name: 'Indigo', color: '#4B0082' },
    ],
    materialParams: { density: 400, stretch: 0.01, bendingStiffness: 0.9 },
  },
];
