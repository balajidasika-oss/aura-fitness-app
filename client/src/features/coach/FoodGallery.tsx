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
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {(['all', 'breakfast', 'lunch', 'dinner', 'snack'] as const).map((filter) => (
          <button
            key={filter}
            onClick={() => setSelectedFilter(filter)}
            className={`text-xs font-semibold px-3 py-1.5 rounded-xl capitalize transition ${
              selectedFilter === filter
                ? 'bg-emerald-500 text-zinc-950 font-bold shadow-sm shadow-emerald-500/30'
                : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-200'
            }`}
          >
            {filter === 'all' ? `All Meals (${mealsWithDates.length})` : filter}
          </button>
        ))}
      </div>

      {/* Grid of Food Images */}
      {filteredMeals.length === 0 ? (
        <div className="bg-zinc-950/60 border border-zinc-800 rounded-2xl p-8 text-center">
          <Utensils className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
          <p className="text-sm font-semibold text-zinc-400">No meal photos logged for this filter</p>
          <p className="text-xs text-zinc-600 mt-1">Meals logged by the client will appear here in high-res</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {filteredMeals.map(({ meal, date }, index) => (
            <div
              key={index}
              onClick={() => setZoomedImage({ url: meal.imagePath, caption: meal.caption, date, type: meal.type })}
              className="group relative aspect-square rounded-2xl overflow-hidden border border-zinc-800 bg-zinc-950 cursor-pointer hover:border-emerald-500/50 transition-all duration-300 shadow-sm"
            >
              <img
                src={meal.imagePath}
                alt={meal.caption || meal.type}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 group-hover:opacity-100 transition-opacity" />

              {/* Tag Badge */}
              <span className="absolute top-2 left-2 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-black/70 text-emerald-300 border border-emerald-500/30 backdrop-blur">
                {meal.type}
              </span>

              {/* Zoom Icon on Hover */}
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/70 p-1 rounded-md text-white">
                <Maximize2 className="w-3.5 h-3.5" />
              </div>

              {/* Date & Caption Footer */}
              <div className="absolute bottom-2 left-2 right-2">
                <div className="flex items-center gap-1 text-[10px] text-zinc-400 font-medium">
                  <Calendar className="w-3 h-3" />
                  <span>{date}</span>
                </div>
                {meal.caption && (
                  <p className="text-[11px] text-zinc-200 font-medium truncate mt-0.5">{meal.caption}</p>
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
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-2xl w-full bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl"
          >
            <button
              onClick={() => setZoomedImage(null)}
              className="absolute top-3 right-3 z-10 bg-black/70 hover:bg-black p-2 rounded-full text-zinc-300 hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>
            <img src={zoomedImage.url} alt="Enlarged meal" className="w-full max-h-[65vh] object-cover" />
            <div className="p-4 bg-zinc-950 flex items-center justify-between border-t border-zinc-800">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    {zoomedImage.type}
                  </span>
                  <span className="text-xs text-zinc-400">{zoomedImage.date}</span>
                </div>
                {zoomedImage.caption && (
                  <p className="text-sm text-zinc-200 font-semibold mt-1">{zoomedImage.caption}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
