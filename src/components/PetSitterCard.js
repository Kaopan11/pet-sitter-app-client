import Image from "next/image";
import Icon from "./Icon";

const PET_BADGE = {
    dog: "badge-dog",
    cat: "badge-cat",
    bird: "badge-bird",
    rabbit: "badge-rabbit",
};

function Stars({ count }) {
    return (
        <div className="flex items-center gap-0.5 text-green" aria-label={`${count} star rating`}>
            {Array.from({ length: count }).map((_, i) => (
                <Icon key={i} src="/icon/star.svg" className="h-5 w-5" />
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
                        unoptimized={String(imageUrl).startsWith("http")}
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
                                unoptimized={String(avatarUrl).startsWith("http")}
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
                        <Icon src="/icon/map-pin.svg" className="h-4 w-4" />
                        <span>{location}</span>
                    </div>
                )}

                {petTypes.length > 0 && (
                    <div className="mt-auto flex flex-wrap gap-2 pt-4">
                        {petTypes.map((type) => {
                            const key = String(type).toLowerCase();
                            const label = key.charAt(0).toUpperCase() + key.slice(1);

                            return (
                                <span
                                    key={type}
                                    className={`badge ${PET_BADGE[key] ?? ""}`}
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
