import { Button } from '@/components/ui/button';
import { CategoryNavProps } from '@/lib/types';

const categories = [
  { id: 'popular', label: 'Popular' },
  { id: 'trending', label: 'Trending' },
  { id: 'top_rated', label: 'Top Rated' },
  { id: 'now_playing', label: 'Now Playing' },
  { id: 'upcoming', label: 'Upcoming' },
];

export const CategoryNav = ({ activeCategory, onCategoryChange }: CategoryNavProps) => {
  return (
    <div className="flex flex-wrap gap-2 mb-8">
      {categories.map((category) => (
        <Button
          key={category.id}
          variant={activeCategory === category.id ? "default" : "ghost"}
          onClick={() => onCategoryChange(category.id)}
          className={`nav-button ${activeCategory === category.id ? 'active' : ''}`}
        >
          {category.label}
        </Button>
      ))}
    </div>
  );
};