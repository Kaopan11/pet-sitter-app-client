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

function firstImageUrl(...values) {
  return (
    values.find(
      (value) => typeof value === 'string' && value.trim().length > 0,
    ) ?? ''
  );
}

function CardPhoto({ src, alt }) {
  const [failed, setFailed] = useState(false);
  const showImage = Boolean(src) && !failed;

  if (!showImage) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-gray-100">
        <Icon src="/icon/user.svg" className="h-10 w-10 text-gray-300" />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      draggable={false}
      className="pointer-events-none h-full w-full object-cover"
      onError={() => setFailed(true)}
    />
  );
}

const DRAG_THRESHOLD = 6;

export default function SitterCardOverlay({
  sitters = [],
  selectedId = null,
  onSelect = () => {}
}) {
  const containerRef = useRef(null);
  const cardRefs = useRef({});
  const dragRef = useRef({
    active: false,
    startX: 0,
    startScrollLeft: 0,
    moved: false,
  });
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [isDragging, setIsDragging] = useState(false);

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

  function stopDrag(event) {
    const el = containerRef.current;
    if (event && el?.hasPointerCapture(event.pointerId)) {
      el.releasePointerCapture(event.pointerId);
    }
    dragRef.current.active = false;
    setIsDragging(false);
  }

  function handlePointerDown(event) {
    if (event.pointerType !== 'mouse' && event.pointerType !== 'pen') return;
    if (event.button !== 0) return;
    if (event.target.closest('a')) return;
    const el = containerRef.current;
    if (!el) return;

    dragRef.current = {
      active: true,
      startX: event.clientX,
      startScrollLeft: el.scrollLeft,
      moved: false,
    };
  }

  function handlePointerMove(event) {
    const drag = dragRef.current;
    const el = containerRef.current;
    if (!drag.active || !el) return;

    const deltaX = event.clientX - drag.startX;
    if (!drag.moved) {
      if (Math.abs(deltaX) < DRAG_THRESHOLD) return;
      drag.moved = true;
      el.setPointerCapture(event.pointerId);
      setIsDragging(true);
    }

    el.scrollLeft = drag.startScrollLeft - deltaX;
  }

  function handlePointerUp(event) {
    const didDrag = dragRef.current.moved;
    stopDrag(event);
    if (didDrag) {
      dragRef.current.moved = true;
    }
  }

  function handleClickCapture(event) {
    if (!dragRef.current.moved) return;
    event.preventDefault();
    event.stopPropagation();
    dragRef.current.moved = false;
  }

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
    <div className="pointer-events-none absolute right-0 bottom-4 left-0 z-[1100] flex items-center">
      {/* Scroll Left Button */}
      {canScrollLeft && (
        <button
          type="button"
          onClick={() => handleScroll('left')}
          className="pointer-events-auto absolute left-3 z-20 flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-full bg-white/90 text-gray-700 shadow-md backdrop-blur-xs transition-transform hover:scale-105 hover:bg-white"
          aria-label="Previous sitter"
        >
          <Icon src="/icon/chevron-left.svg" className="h-5 w-5" />
        </button>
      )}

      {/* Cards Scroll Container - Flush to map edges with px-4 inner padding */}
      <div
        ref={containerRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onClickCapture={handleClickCapture}
        onDragStart={(event) => event.preventDefault()}
        className={`pointer-events-auto flex w-full touch-pan-x gap-3 overflow-x-auto px-4 pb-1 select-none scrollbar-none ${
          isDragging
            ? 'cursor-grabbing snap-none scroll-auto'
            : 'snap-x snap-mandatory scroll-smooth'
        }`}
      >
        {sitters.map((sitter) => {
          const isSelected = sitter.id === selectedId;
          const petTypes = sitter.petTypes || sitter.pet_types || [];
          const image = firstImageUrl(sitter.avatarUrl, sitter.avatar_url);
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
              className={`w-[300px] shrink-0 snap-center rounded-2xl border bg-white p-3 shadow-lg transition-all sm:w-[340px] ${
                isDragging ? 'cursor-grabbing' : 'cursor-pointer'
              } ${
                isSelected
                  ? 'border-orange-500 ring-2 ring-orange-500/20 scale-[1.02]'
                  : 'border-gray-100 hover:border-orange-300'
              }`}
            >
              <div className="flex gap-3">
                {/* Sitter Image */}
                <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-gray-100">
                  <CardPhoto src={image} alt={tradeName} />
                </div>

                {/* Sitter Content */}
                <div className="flex min-w-0 flex-1 flex-col">
                  <div className="flex items-center justify-between gap-1">
                    <h3 className="truncate text-sm font-bold text-gray-900">
                      {tradeName}
                    </h3>
                    <RatingStars count={sitter.rating || 5} />
                  </div>
                  {ownerName && (
                    <p className="mt-0.5 truncate text-xs text-gray-400">
                      By {ownerName}
                    </p>
                  )}
                  <div className="mt-1 flex flex-wrap items-center gap-1">
                    {petTypes.map((type, i) => {
                      const key = typeof type === 'string' ? type.toLowerCase() : type?.name?.toLowerCase();
                      const label = typeof type === 'string' ? type : type?.name || '';
                      return (
                        <span
                          key={i}
                          className={`badge ${PET_BADGE[key] ?? 'badge-dog'} px-1.5 py-0 text-[10px] leading-4 capitalize`}
                        >
                          {label}
                        </span>
                      );
                    })}
                  </div>
                  <Link
                    href={`/find-sitter/${sitter.id}`}
                    draggable={false}
                    onPointerDown={(event) => event.stopPropagation()}
                    onClick={(event) => event.stopPropagation()}
                    className="mt-auto ml-auto inline-flex h-7 items-center rounded-full bg-[#FF7037] px-3 text-[11px] font-bold text-white hover:bg-[#FF986F]"
                  >
                    See details
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Scroll Right Button */}
      {canScrollRight && (
        <button
          type="button"
          onClick={() => handleScroll('right')}
          className="pointer-events-auto absolute right-3 z-20 flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-full bg-white/90 text-gray-700 shadow-md backdrop-blur-xs transition-transform hover:scale-105 hover:bg-white"
          aria-label="Next sitter"
        >
          <Icon src="/icon/chevron-right.svg" className="h-5 w-5" />
        </button>
      )}
    </div>
  );
}
