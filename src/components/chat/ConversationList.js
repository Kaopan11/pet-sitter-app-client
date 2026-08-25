export default function ConversationList({
  conversations,
  activeId,
  onSelect,
}) {
  const hasThread = Boolean(activeId);

  return (
    <aside
      className={`h-full w-full shrink-0 flex-col bg-black md:flex md:w-[368px] ${
        hasThread ? "hidden" : "flex"
      }`}
    >
      <div className="px-6 py-8 md:px-10 md:py-10">
        <h1 className="text-h4 text-white">Messages</h1>
      </div>
      <div className="flex-1 overflow-y-auto">
        {conversations.length === 0 ? (
          <p className="px-10 text-body-3 text-gray-400">No conversations yet</p>
        ) : (
          conversations.map((item) => {
            const isActive = String(item.id) === String(activeId);
            const unread = item.unreadCount > 0;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelect(item.id)}
                className={`flex w-full items-center gap-3 px-6 py-4 text-left ${
                  isActive ? "bg-gray-600" : "bg-transparent hover:bg-gray-600/60"
                }`}
              >
                <span className="relative size-12 shrink-0 overflow-hidden rounded-full bg-gray-200">
                  {item.otherUser?.avatarUrl ? (
                    <img
                      src={item.otherUser.avatarUrl}
                      alt=""
                      className="size-full object-cover"
                    />
                  ) : (
                    <img
                      src="/icon/user.svg"
                      alt=""
                      className="absolute inset-3 size-6 object-contain"
                    />
                  )}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-body-2 text-white">
                    {item.otherUser?.name || "User"}
                  </span>
                  <span className="mt-0.5 block truncate text-body-3 text-gray-400">
                    {item.lastMessage || "Start a conversation!"}
                  </span>
                </span>
                {unread ? (
                  <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-orange-500 text-[12px] font-bold text-white">
                    {item.unreadCount > 9 ? "9+" : item.unreadCount}
                  </span>
                ) : null}
              </button>
            );
          })
        )}
      </div>
    </aside>
  );
}
