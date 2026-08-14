import Image from "next/image";

const PET_TAG_CLASS = {
    dog: "border border-green bg-green-light text-green",
    cat: "border border-pink bg-pink-light text-pink",
    bird: "border border-blue bg-blue-light text-blue",
    rabbit: "border border-orange-400 bg-orange-100 text-orange-400",
};

function Stars({ count }) {
    return (
        <div className="flex items-center gap-0.5" aria-label={`${count} star rating`}>
            {Array.from({ length: count }).map((_, i) => (
                <svg
                    key={i}
                    className="h-5 w-5 fill-current text-green"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                >
                    <path
                        fillRule="evenodd"
                        d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.006 5.404.434c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.434 2.082-5.005Z"
                        clipRule="evenodd"
                    />
                </svg>
            ))}
        </div>
    );
}

export default function PetSitterCard({
    title,
    sitterName,
    avatarUrl,
    location,
    rating = 0,
    petTypes = [],
    imageUrl,
}) {
    return (
        <article className="flex flex-col gap-4 rounded-xl bg-white p-4 sm:flex-row sm:gap-6 sm:p-5">
            <div className="relative h-48 w-full shrink-0 overflow-hidden rounded-xl sm:h-46 sm:w-62">
                {imageUrl ? (
                    <Image
                        src={imageUrl}
                        alt={title}
                        fill
                        sizes="(max-width: 640px) 100vw, 248px"
                        className="object-cover"
                    />
                ) : (
                    <div className="h-full w-full bg-gray-100" />
                )}
            </div>

            <div className="flex min-w-0 flex-1 flex-col">
                <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                        {avatarUrl && (
                            <Image
                                src={avatarUrl}
                                alt={sitterName || title}
                                width={48}
                                height={48}
                                className="avatar h-12 w-12 shrink-0"
                            />
                        )}
                        <h3 className="truncate text-h4 text-gray-900">{title}</h3>
                    </div>
                    <Stars count={rating} />
                </div>

                {sitterName && (
                    <p className="mt-1 text-body-3 text-gray-400">By {sitterName}</p>
                )}

                {location && (
                    <div className="mt-2 flex items-center gap-1.5 text-body-3 text-gray-400">
                        <svg
                            className="h-4 w-4 shrink-0"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            aria-hidden="true"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                            />
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z"
                            />
                        </svg>
                        <span>{location}</span>
                    </div>
                )}

                {petTypes.length > 0 && (
                    <div className="mt-auto flex flex-wrap gap-2 pt-4">
                        {petTypes.map((type) => {
                            const key = String(type).toLowerCase();
                            const label = key.charAt(0).toUpperCase() + key.slice(1);
                            const tagClass = PET_TAG_CLASS[key] ?? "border border-gray-500 bg-gray-100 text-gray-500";

                            return (
                                <span
                                    key={type}
                                    className={`rounded-full px-3 py-1 text-body-3 font-medium ${tagClass}`}
                                >
                                    {label}
                                </span>
                            );
                        })}
                    </div>
                )}
            </div>
        </article>
    );
}
