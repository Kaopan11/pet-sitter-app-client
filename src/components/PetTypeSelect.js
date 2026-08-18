"use client";

import { useEffect, useId, useRef, useState } from "react";
import { ChevronDown, X } from "lucide-react";

const PET_TYPES = [
  { id: "dog", label: "Dog" },
  { id: "cat", label: "Cat" },
  { id: "bird", label: "Bird" },
  { id: "rabbit", label: "Rabbit" },
];

export default function PetTypeSelect({
  value,
  defaultValue = ["cat", "dog"],
  onChange,
  error,
}) {
  const listId = useId();
  const rootRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [uncontrolled, setUncontrolled] = useState(defaultValue);
  const isControlled = value != null;
  const selected = isControlled ? value : uncontrolled;

  function commit(next) {
    if (!isControlled) {
      setUncontrolled(next);
    }
    onChange?.(next);
  }

  useEffect(() => {
    function handlePointerDown(event) {
      if (!rootRef.current?.contains(event.target)) {
        setOpen(false);
      }
    }

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  function toggle(id) {
    commit(
      selected.includes(id)
        ? selected.filter((item) => item !== id)
        : [...selected, id],
    );
  }

  function remove(id) {
    commit(selected.filter((item) => item !== id));
  }

  const selectedPets = PET_TYPES.filter((pet) => selected.includes(pet.id));

  return (
    <div className="relative" ref={rootRef}>
      <div
        className={`input flex min-h-12 cursor-pointer items-center justify-between gap-2 ${
          error ? "input-error" : ""
        }`}
        role="combobox"
        aria-expanded={open}
        aria-controls={listId}
        aria-haspopup="listbox"
        onClick={() => setOpen((current) => !current)}
      >
        <div className="flex min-w-0 flex-1 flex-wrap gap-2">
          {selectedPets.length === 0 ? (
            <span className="text-gray-400">Select pet type</span>
          ) : (
            selectedPets.map((pet) => (
              <span
                key={pet.id}
                className="inline-flex items-center gap-1 rounded-full bg-orange-100 px-3 py-0.5 text-body-3 text-orange-500"
              >
                {pet.label}
                <button
                  type="button"
                  className="flex h-4 w-4 items-center justify-center rounded-full hover:bg-orange-200"
                  aria-label={`Remove ${pet.label}`}
                  onClick={(event) => {
                    event.stopPropagation();
                    remove(pet.id);
                  }}
                >
                  <X className="h-3 w-3" strokeWidth={2.5} aria-hidden="true" />
                </button>
              </span>
            ))
          )}
        </div>
        <ChevronDown
          className="h-4 w-4 shrink-0 text-gray-400"
          aria-hidden="true"
        />
      </div>

      {open ? (
        <ul
          id={listId}
          role="listbox"
          aria-multiselectable="true"
          aria-label="Pet type"
          className="absolute z-50 mt-1 w-full rounded-md border border-gray-200 bg-white py-1 shadow-dropdown"
        >
          {PET_TYPES.map((pet) => {
            const isSelected = selected.includes(pet.id);

            return (
              <li key={pet.id} role="none">
                <button
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  className={`flex w-full px-3 py-3 text-left text-body-2 text-black ${
                    isSelected ? "bg-gray-100" : "hover:bg-gray-100"
                  }`}
                  onClick={(event) => {
                    event.stopPropagation();
                    toggle(pet.id);
                  }}
                >
                  {pet.label}
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
