import Icon from "@/components/Icon";

function getPageNumbers(current, total) {
  if (total <= 0) return [];
  if (total <= 5) {
    return Array.from({ length: total }, (_, index) => index + 1);
  }

  const start = Math.max(1, Math.min(current - 2, total - 4));
  const end = Math.min(total, start + 4);
  return Array.from({ length: end - start + 1 }, (_, index) => start + index);
}

export default function Pagination({ currentPage, totalPages, onPageChange }) {
  const pageNumbers = getPageNumbers(currentPage, totalPages);

  if (pageNumbers.length <= 1) return null;

  return (
    <nav
      className="flex items-center justify-center gap-1"
      aria-label="Pagination"
    >
      <button
        type="button"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage <= 1}
        className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full text-gray-400 transition-colors hover:text-orange-500 disabled:cursor-not-allowed disabled:opacity-40"
        aria-label="Previous page"
      >
        <Icon src="/icon/chevron-left.svg" className="h-5 w-5" />
      </button>
      {pageNumbers.map((page) => (
        <button
          key={page}
          type="button"
          onClick={() => onPageChange(page)}
          className={`flex h-10 w-10 cursor-pointer items-center justify-center rounded-full text-body-2 font-bold transition-colors ${
            currentPage === page
              ? "bg-orange-100 text-orange-500"
              : "text-gray-400 hover:text-orange-500"
          }`}
        >
          {page}
        </button>
      ))}
      <button
        type="button"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
        className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full text-gray-400 transition-colors hover:text-orange-500 disabled:cursor-not-allowed disabled:opacity-40"
        aria-label="Next page"
      >
        <Icon src="/icon/chevron-right.svg" className="h-5 w-5" />
      </button>
    </nav>
  );
}
