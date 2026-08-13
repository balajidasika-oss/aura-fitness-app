import React, { useState } from 'react';
import { IMealEntry, MealType } from '../../types';
import { Utensils, Maximize2, X, Calendar } from 'lucide-react';

interface FoodGalleryProps {
  mealsWithDates: { meal: IMealEntry; date: string }[];
}

export const FoodGallery: React.FC<FoodGalleryProps> = ({ mealsWithDates }) => {
  const [selectedFilter, setSelectedFilter] = useState<MealType | 'all'>('all');
  const [zoomedImage, setZoomedImage] = useState<{ url: string; caption?: string; date: string; type: string } | null>(null);

  const filteredMeals = mealsWithDates.filter(({ meal }) => {
    if (selectedFilter === 'all') return true;
    return meal.type === selectedFilter;
  });

  return (
    <div className="space-y-4">
      {/* Filter Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        {(['all', 'breakfast', 'lunch', 'dinner', 'snack'] as const).map((filter) => (
          <button
            key={filter}
            onClick={() => setSelectedFilter(filter)}
            className={`text-xs font-semibold px-3 py-1.5 rounded-xl capitalize transition-all duration-300 border ${
              selectedFilter === filter
                ? 'bg-[var(--bg-surface-2)] text-[var(--text-primary)] border-[var(--border-medium)]'
                : 'bg-[var(--bg-surface-1)] text-[var(--text-muted)] border-[var(--border-subtle)] hover:text-[var(--text-primary)]'
            }`}
          >
            {filter === 'all' ? `All Meals (${mealsWithDates.length})` : filter}
          </button>
        ))}
      </div>

      {/* Grid of Food Images */}
      {filteredMeals.length === 0 ? (
        <div className="surface-card p-8 text-center animate-fade-in-up">
          <Utensils className="w-8 h-8 text-[var(--text-muted)] mx-auto mb-2" />
          <p className="text-sm font-semibold text-[var(--text-secondary)]">No meal photos logged for this filter</p>
          <p className="text-xs text-[var(--text-muted)] mt-1">Meals logged by the client will appear here in high-res</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {filteredMeals.map(({ meal, date }, index) => (
            <div
              key={index}
              onClick={() => setZoomedImage({ url: meal.imagePath, caption: meal.caption, date, type: meal.type })}
              className="group relative aspect-square rounded-2xl overflow-hidden glass-card cursor-pointer hover:border-[var(--border-medium)] transition-all duration-300 animate-fade-in-up"
            >
              <img
                src={meal.imagePath}
                alt={meal.caption || meal.type}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-void)] via-transparent to-transparent opacity-80 group-hover:opacity-100 transition-opacity duration-300" />

              {/* Tag Badge */}
              <span className="absolute top-2 left-2 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-[var(--bg-surface-2)]/80 backdrop-blur-md text-[var(--text-primary)] border border-[var(--border-subtle)]">
                {meal.type}
              </span>

              {/* Zoom Icon on Hover */}
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-[var(--bg-surface-2)]/80 backdrop-blur-md p-1.5 rounded-md text-[var(--text-primary)]">
                <Maximize2 className="w-3.5 h-3.5" />
              </div>

              {/* Date & Caption Footer */}
              <div className="absolute bottom-2 left-2 right-2">
                <div className="flex items-center gap-1 text-[10px] text-[var(--text-secondary)] font-medium">
                  <Calendar className="w-3 h-3" />
                  <span>{date}</span>
                </div>
                {meal.caption && (
                  <p className="text-[11px] text-[var(--text-primary)] font-medium truncate mt-0.5">{meal.caption}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Zoom Modal */}
      {zoomedImage && (
        <div
          onClick={() => setZoomedImage(null)}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in-up"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-2xl w-full surface-card overflow-hidden animate-scale-in"
          >
            <button
              onClick={() => setZoomedImage(null)}
              className="absolute top-3 right-3 z-10 btn-icon bg-[var(--bg-surface-2)]/80 backdrop-blur-md"
            >
              <X className="w-5 h-5" />
            </button>
            <img src={zoomedImage.url} alt="Enlarged meal" className="w-full max-h-[65vh] object-cover" />
            <div className="p-4 bg-[var(--bg-surface-1)] border-t border-[var(--border-subtle)] flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="pill text-xs uppercase">
                    {zoomedImage.type}
                  </span>
                  <span className="text-xs text-[var(--text-secondary)]">{zoomedImage.date}</span>
                </div>
                {zoomedImage.caption && (
                  <p className="text-sm text-[var(--text-primary)] font-semibold mt-1.5">{zoomedImage.caption}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
