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
            className={`text-xs font-semibold px-3 py-1.5 rounded-[32px] capitalize transition ${
              selectedFilter === filter
                ? 'bg-[#EAF0EA] text-zinc-950 font-bold shadow-sm shadow-emerald-500/30'
                : 'bg-white shadow-sm border border-[#E6E4DD] text-[#7A8277] hover:text-zinc-200'
            }`}
          >
            {filter === 'all' ? `All Meals (${mealsWithDates.length})` : filter}
          </button>
        ))}
      </div>

      {/* Grid of Food Images */}
      {filteredMeals.length === 0 ? (
        <div className="bg-white shadow-sm border border-[#E6E4DD] rounded-[32px] p-8 text-center">
          <Utensils className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
          <p className="text-sm font-semibold text-[#7A8277]">No meal photos logged for this filter</p>
          <p className="text-xs text-zinc-600 mt-1">Meals logged by the client will appear here in high-res</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {filteredMeals.map(({ meal, date }, index) => (
            <div
              key={index}
              onClick={() => setZoomedImage({ url: meal.imagePath, caption: meal.caption, date, type: meal.type })}
              className="group relative aspect-square rounded-[32px] overflow-hidden border border-[#E6E4DD] bg-white shadow-sm cursor-pointer hover:border-[#E6E4DD] transition-all duration-300 shadow-sm"
            >
              <img
                src={meal.imagePath}
                alt={meal.caption || meal.type}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 group-hover:opacity-100 transition-opacity" />

              {/* Tag Badge */}
              <span className="absolute top-2 left-2 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-[#F4F2EC] text-[#4A5C4F] border border-[#E6E4DD] backdrop-blur">
                {meal.type}
              </span>

              {/* Zoom Icon on Hover */}
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-[#F4F2EC] p-1 rounded-md text-[#2D332F]">
                <Maximize2 className="w-3.5 h-3.5" />
              </div>

              {/* Date & Caption Footer */}
              <div className="absolute bottom-2 left-2 right-2">
                <div className="flex items-center gap-1 text-[10px] text-[#7A8277] font-medium">
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
          className="fixed inset-0 z-50 bg-[#F4F2EC]  flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-2xl w-full bg-white shadow-sm border border-[#E6E4DD] rounded-[32px] overflow-hidden shadow-none"
          >
            <button
              onClick={() => setZoomedImage(null)}
              className="absolute top-3 right-3 z-10 bg-[#F4F2EC] hover:bg-black p-2 rounded-full text-zinc-300 hover:text-[#2D332F] transition"
            >
              <X className="w-5 h-5" />
            </button>
            <img src={zoomedImage.url} alt="Enlarged meal" className="w-full max-h-[65vh] object-cover" />
            <div className="p-4 bg-white shadow-sm flex items-center justify-between border-t border-[#E6E4DD]">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase text-[#4A5C4F] bg-[#EAF0EA] px-2 py-0.5 rounded border border-[#E6E4DD]">
                    {zoomedImage.type}
                  </span>
                  <span className="text-xs text-[#7A8277]">{zoomedImage.date}</span>
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
