export default function Icon({ src, className = "h-5 w-5" }) {
    return (
        <span
            aria-hidden="true"
            className={`inline-block shrink-0 bg-current ${className}`}
            style={{
                WebkitMask: `url("${src}") center / contain no-repeat`,
                mask: `url("${src}") center / contain no-repeat`,
            }}
        />
    );
}
