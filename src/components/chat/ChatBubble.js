export default function ChatBubble({ message, isMine, avatarUrl }) {
  const hasText = Boolean(String(message.content ?? "").trim());
  const bubbleClass = isMine
    ? "max-w-[70%] rounded-[12px] rounded-tr-none bg-orange-500 px-4 py-2 text-body-2 text-white"
    : "max-w-[70%] rounded-[12px] rounded-tl-none border border-gray-200 bg-white px-4 py-2 text-body-2 text-black";

  const body = (
    <div className={bubbleClass}>
      {message.imageUrl ? (
        <img
          src={message.imageUrl}
          alt=""
          className={`max-h-60 rounded-lg object-cover ${hasText ? "mb-2" : ""}`}
        />
      ) : null}
      {hasText ? message.content : null}
    </div>
  );

  if (isMine) {
    return <div className="flex justify-end">{body}</div>;
  }

  return (
    <div className="flex items-end gap-3">
      <span className="relative size-10 shrink-0 overflow-hidden rounded-full bg-gray-200">
        {avatarUrl ? (
          <img src={avatarUrl} alt="" className="size-full object-cover" />
        ) : (
          <img
            src="/icon/user.svg"
            alt=""
            className="absolute inset-2 size-6 object-contain"
          />
        )}
      </span>
      {body}
    </div>
  );
}
