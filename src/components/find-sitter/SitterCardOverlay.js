'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Icon from '../Icon';

const PET_BADGE = {
  dog: 'badge-dog',
  cat: 'badge-cat',
  bird: 'badge-bird',
  rabbit: 'badge-rabbit',
};

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
  const containerRef = useRef(null);
  const cardRefs = useRef({});
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    if (!containerRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = containerRef.current;
    setCanScrollLeft(scrollLeft > 5);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 5);
  };

  const handleScroll = (direction) => {
    if (!containerRef.current) return;
    const scrollAmount = 320;
    containerRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  };

  useEffect(() => {
    checkScroll();
    const el = containerRef.current;
    if (el) {
      el.addEventListener('scroll', checkScroll);
      return () => el.removeEventListener('scroll', checkScroll);
    }
  }, [sitters]);

  // Auto-scroll selected card into view
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
    <div className="absolute bottom-4 left-0 right-0 z-10 flex items-center">
      {/* Scroll Left Button */}
      {canScrollLeft && (
        <button
          type="button"
          onClick={() => handleScroll('left')}
          className="absolute left-3 z-20 flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-full bg-white/90 shadow-md backdrop-blur-xs transition-transform hover:scale-105 hover:bg-white text-gray-700"
          aria-label="Previous sitter"
        >
          <Icon src="/icon/chevron-left.svg" className="h-5 w-5" />
        </button>
      )}

      {/* Cards Scroll Container - Flush to map edges with px-4 inner padding */}
      <div
        ref={containerRef}
        className="flex w-full gap-3 overflow-x-auto pb-1 px-4 scrollbar-none snap-x snap-mandatory scroll-smooth"
      >
        {sitters.map((sitter) => {
          const isSelected = sitter.id === selectedId;
          const petTypes = sitter.petTypes || sitter.pet_types || ['Dog', 'Cat'];
          const image =
            sitter.imageUrl ||
            sitter.image_url ||
            sitter.profile_image ||
            sitter.avatarUrl ||
            sitter.avatar_url ||
            '/image/pet-placeholder.jpg';
          const tradeName =
            sitter.title ||
            sitter.trade_name ||
            sitter.tradeName ||
            sitter.name ||
            'Pet Sitter';
          const ownerName =
            sitter.sitterName ||
            sitter.sitter_name ||
            sitter.full_name ||
            sitter.name ||
            '';

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
                      e.currentTarget.src =
                        'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=300&q=80';
                    }}
                  />
                </div>

                {/* Sitter Content */}
                <div className="flex flex-col justify-between min-w-0 flex-1">
                  <div>
                    <div className="flex items-center justify-between gap-1">
                      <h3 className="font-bold text-gray-900 text-sm truncate">
                        {tradeName}
                      </h3>
                      <RatingStars count={sitter.rating || 5} />
                    </div>
                    {ownerName && (
                      <p className="text-xs text-gray-400 mt-0.5 truncate">
                        By {ownerName}
                      </p>
                    )}
                  </div>

                  {/* Pet Types Badges */}
                  <div className="flex flex-wrap gap-1 mt-2">
                    {petTypes.map((type, i) => {
                      const key = typeof type === 'string' ? type.toLowerCase() : type?.name?.toLowerCase();
                      const label = typeof type === 'string' ? type : type?.name || '';
                      return (
                        <span
                          key={i}
                          className={`badge ${PET_BADGE[key] ?? 'badge-dog'} capitalize`}
                        >
                          {label}
                        </span>
                      );
                    })}
                  </div>
                </div>
              </Link>
            </div>
          );
        })}
      </div>

      {/* Scroll Right Button */}
      {canScrollRight && (
        <button
          type="button"
          onClick={() => handleScroll('right')}
          className="absolute right-3 z-20 flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-full bg-white/90 shadow-md backdrop-blur-xs transition-transform hover:scale-105 hover:bg-white text-gray-700"
          aria-label="Next sitter"
        >
          <Icon src="/icon/chevron-right.svg" className="h-5 w-5" />
        </button>
      )}
    </div>
  );
}
