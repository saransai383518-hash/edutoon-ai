import { ActivityCategory, SampleImage } from '../types';

export const LEARNING_CATEGORIES: ActivityCategory[] = [
  {
    id: 'animals',
    title: 'Animal Friends',
    subtitle: 'Pets, safari & cute creatures',
    icon: '🐾',
    color: 'bg-amber-100',
    borderColor: 'border-amber-400',
    shadowColor: 'shadow-amber-500/20',
    sampleObjects: ['Puppy', 'Cat', 'Dolphin', 'Lion']
  },
  {
    id: 'nature',
    title: 'Colors & Fruits',
    subtitle: 'Apples, bananas & rainbow nature',
    icon: '🍎',
    color: 'bg-emerald-100',
    borderColor: 'border-emerald-400',
    shadowColor: 'shadow-emerald-500/20',
    sampleObjects: ['Red Apple', 'Yellow Banana', 'Green Leaf']
  },
  {
    id: 'vehicles',
    title: 'Things That Go',
    subtitle: 'Cars, rockets, trains & bikes',
    icon: '🚀',
    color: 'bg-sky-100',
    borderColor: 'border-sky-400',
    shadowColor: 'shadow-sky-500/20',
    sampleObjects: ['Space Rocket', 'Yellow Bus', 'Toy Car']
  },
  {
    id: 'shapes',
    title: 'Shapes & Toys',
    subtitle: 'Circles, stars, teddy bears',
    icon: '⭐',
    color: 'bg-purple-100',
    borderColor: 'border-purple-400',
    shadowColor: 'shadow-purple-500/20',
    sampleObjects: ['Yellow Star', 'Building Block', 'Teddy Bear']
  }
];

export const SAMPLE_CHILDREN_IMAGES: SampleImage[] = [
  {
    id: 'apple',
    title: 'Red Crunchy Apple',
    category: 'Fruits & Food',
    emoji: '🍎',
    imageUrl: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=600&auto=format&fit=crop&q=80',
    color: 'from-red-400 to-rose-500'
  },
  {
    id: 'puppy',
    title: 'Fluffy Golden Puppy',
    category: 'Animal Friends',
    emoji: '🐶',
    imageUrl: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=600&auto=format&fit=crop&q=80',
    color: 'from-amber-400 to-orange-500'
  },
  {
    id: 'banana',
    title: 'Sweet Yellow Banana',
    category: 'Fruits & Food',
    emoji: '🍌',
    imageUrl: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=600&auto=format&fit=crop&q=80',
    color: 'from-yellow-400 to-amber-500'
  },
  {
    id: 'cat',
    title: 'Playful Kitten',
    category: 'Animal Friends',
    emoji: '🐱',
    imageUrl: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=600&auto=format&fit=crop&q=80',
    color: 'from-orange-300 to-amber-400'
  },
  {
    id: 'flower',
    title: 'Sunny Sunflower',
    category: 'Nature & Plants',
    emoji: '🌻',
    imageUrl: 'https://images.unsplash.com/photo-1597848212624-a19eb35e2651?w=600&auto=format&fit=crop&q=80',
    color: 'from-yellow-300 to-yellow-500'
  },
  {
    id: 'teddy',
    title: 'Friendly Teddy Bear',
    category: 'Toys & Fun',
    emoji: '🧸',
    imageUrl: 'https://images.unsplash.com/photo-1559454403-b8fb88521f11?w=600&auto=format&fit=crop&q=80',
    color: 'from-amber-600 to-amber-800'
  }
];

export const AVATAR_OPTIONS = [
  { id: 'bear', emoji: '🐻', label: 'Barnaby Bear', color: 'bg-amber-100 text-amber-600 border-amber-300' },
  { id: 'lion', emoji: '🦁', label: 'Leo the Lion', color: 'bg-orange-100 text-orange-600 border-orange-300' },
  { id: 'bunny', emoji: '🐰', label: 'Bella Bunny', color: 'bg-pink-100 text-pink-600 border-pink-300' },
  { id: 'monkey', emoji: '🐵', label: 'Milo Monkey', color: 'bg-yellow-100 text-yellow-700 border-yellow-300' },
  { id: 'star', emoji: '⭐', label: 'Super Star', color: 'bg-purple-100 text-purple-600 border-purple-300' },
  { id: 'dino', emoji: '🦖', label: 'Danny Dino', color: 'bg-emerald-100 text-emerald-600 border-emerald-300' },
];
