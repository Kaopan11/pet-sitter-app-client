'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import Icon from '../Icon';

function RatingStars({ count = 5 }) {
  const ratingNum = typeof count === 'number' ? Math.round(count) : 5;
  return (
    <div className="flex items-center gap-0.5 text-green-500">
      {Array.from({ length: 5 }).map((_, i) => (
        <Icon
          key={i}
          src="/icon/star.svg"
          className={`h-3.5 w-3.5 ${i < ratingNum ? 'text-green-500 fill-green-500' : 'text-gray-200'}`}
        />
      ))}
    </div>
  );
}

export default function SitterCardOverlay({
  sitters = [],
  selectedId = null,
  onSelect = () => {}
}) {
  const cardRefs = useRef({});

  // Auto-scroll the selected card into view inside the horizontal carousel
  useEffect(() => {
    if (selectedId && cardRefs.current[selectedId]) {
      cardRefs.current[selectedId].scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center'
      });
    }
  }, [selectedId]);

  if (!sitters || sitters.length === 0) return null;

  return (
    <div className="absolute bottom-4 left-4 right-4 z-[400] flex gap-3 overflow-x-auto pb-2 scrollbar-none snap-x snap-mandatory">
      {sitters.map((sitter) => {
        const isSelected = sitter.id === selectedId;
        const petTypes = sitter.pet_types || sitter.petTypes || ['Dog', 'Cat'];
        const image = sitter.profile_image || sitter.image || '/image/pet-placeholder.jpg';
        const tradeName = sitter.trade_name || sitter.tradeName || sitter.name || 'Pet Sitter';
        const ownerName = sitter.full_name || sitter.ownerName || 'By Sitter';

        return (
          <div
            key={sitter.id}
            ref={(el) => (cardRefs.current[sitter.id] = el)}
            onClick={() => onSelect(sitter)}
            className={`snap-center shrink-0 w-[300px] sm:w-[340px] bg-white rounded-2xl p-3 shadow-lg border transition-all cursor-pointer ${
              isSelected
                ? 'border-orange-500 ring-2 ring-orange-500/20 scale-[1.02]'
                : 'border-gray-100 hover:border-orange-300'
            }`}
          >
            <Link href={`/find-sitter/${sitter.id}`} className="flex gap-3">
              {/* Sitter Image */}
              <div className="w-24 h-24 rounded-xl overflow-hidden bg-gray-100 shrink-0 relative">
                <img
                  src={image}
                  alt={tradeName}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=300&q=80';
                  }}
                />
              </div>

              {/* Sitter Content */}
              <div className="flex flex-col justify-between min-w-0 flex-1">
                <div>
                  <div className="flex items-center justify-between gap-1">
                    <h3 className="font-bold text-gray-900 text-sm truncate">{tradeName}</h3>
                    <RatingStars count={sitter.rating || 5} />
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5 truncate">By {ownerName}</p>
                </div>

                {/* Pet Types Badges */}
                <div className="flex flex-wrap gap-1 mt-2">
                  {petTypes.map((type, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 text-[11px] font-medium text-green-600 border border-green-500/30 rounded-full bg-green-50/50 capitalize"
                    >
                      {typeof type === 'string' ? type : type.name}
                    </span>
                  ))}
                </div>
              </div>
            </Link>
          </div>
        );
      })}
    </div>
  );
}
