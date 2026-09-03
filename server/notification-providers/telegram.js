const NotificationProvider = require("./notification-provider");
const axios = require("axios");

class Telegram extends NotificationProvider {
    name = "telegram";

    /**
     * @inheritdoc
     */
    async send(notification, msg, monitorJSON = null, heartbeatJSON = null) {
        const okMsg = "Sent Successfully.";
        const url = notification.telegramServerUrl ?? "https://api.telegram.org";

        try {
            let params = {
                chat_id: notification.telegramChatID,
                text: msg,
                disable_notification: notification.telegramSendSilently ?? false,
                protect_content: notification.telegramProtectContent ?? false,
            };
            if (notification.telegramMessageThreadID) {
                params.message_thread_id = notification.telegramMessageThreadID;
            }

            if (notification.telegramUseTemplate) {
                params.text = await this.renderTemplate(notification.telegramTemplate, msg, monitorJSON, heartbeatJSON);

                if (notification.telegramTemplateParseMode !== "plain") {
                    params.parse_mode = notification.telegramTemplateParseMode;
                }
            }

            let config = this.getAxiosConfigWithProxy({ params });

            await axios.get(`${url}/bot${notification.telegramBotToken}/sendMessage`, config);
            return okMsg;

        } catch (error) {
            if (error.response?.data?.description?.includes("chat not found")) {
                throw new Error("Telegram error: Chat not found. Please open your Telegram bot in Telegram and send '/start' to it first, or add the bot as an admin to your channel/group.");
            }
            this.throwGeneralAxiosError(error);
        }
    }
}

module.exports = Telegram;
