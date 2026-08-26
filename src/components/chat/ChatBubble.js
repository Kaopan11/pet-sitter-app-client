import { formatMessageTime } from "@/utils/formatDateTime";

export default function ChatBubble({ message, isMine, avatarUrl }) {
  const hasText = Boolean(String(message.content ?? "").trim());
  const timeLabel = formatMessageTime(message.sentAt);
  const bubbleClass = isMine
    ? "max-w-[70%] rounded-[24px] rounded-br-none bg-orange-600 px-6 py-3 text-body-2 text-white"
    : "max-w-[70%] rounded-[24px] rounded-bl-none border border-gray-200 bg-white px-6 py-3 text-body-2 text-black";

  const bubble = (
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
    return (
      <div className="flex flex-col items-end">
        {bubble}
        {timeLabel ? (
          <span className="mt-1 text-body-3 text-gray-400">{timeLabel}</span>
        ) : null}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-start">
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
        {bubble}
      </div>
      {timeLabel ? (
        <span className="mt-1 ml-[52px] text-body-3 text-gray-400">{timeLabel}</span>
      ) : null}
    </div>
  );
}
