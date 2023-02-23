import { Context, NarrowedContext } from "telegraf";
import { Update, Message } from "telegraf/typings/core/types/typegram";

export type DefaultContext = NarrowedContext<
	Context<Update>,
	{
		message: Update.New & Update.NonChannel & Message.TextMessage;
		update_id: number;
	}
>;

/** Get ID and thread of any chat: private, group or thread */
declare function GetChat(ctx: import("./get-chat").DefaultContext): { id: number; thread?: number };

export = GetChat;
