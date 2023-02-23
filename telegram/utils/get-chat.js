/**
 * Get ID of any chat: private, group or thread
 * @param {import("./get-chat").DefaultContext} ctx
 * @returns {{ id: number, thread?: number }}
 */
const GetChat = (ctx) => {
	if (!ctx?.chat) return { id: 0 };
	if (ctx.chat.type === "private" || ctx.chat.type === "group") return { id: ctx.chat.id };
	
	return { id: ctx.chat.id, thread: ctx.message?.message_thread_id };
};

module.exports = GetChat;
