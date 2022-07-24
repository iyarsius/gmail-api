import { gmail_v1 } from "googleapis";
import { IAuthor, IMessageOptions } from "../types/Message";

export class Message {
    gmail: gmail_v1.Gmail;
    id: string;
    threadId: string;
    labelIds: string[];
    subject: string;
    snippet: string;
    sizeEstimate: number;
    historyId: string;
    internalDate: string;
    author: IAuthor;
    body: string;


    constructor(messageOptions: IMessageOptions) {
        Object.assign(this, messageOptions);
    };

    async fetch() {
        return new Promise((resolve, reject) => {
            this.gmail.users.messages.get({
                userId: "me",
                id: this.id
            }, (err, res) => {
                if (err) {
                    reject(err);
                    return;
                }

                const body = res.data

                this.threadId = body.threadId;
                this.labelIds = body.labelIds;
                this.snippet = body.snippet;
                this.sizeEstimate = body.sizeEstimate;
                this.historyId = body.historyId;
                this.internalDate = body.internalDate;

                const from = body.payload.headers?.find(header => header.name === "From")
                this.author = {
                    name: from?.value.split(" <")[0].trim(),
                    email: from?.value.split(" <")[1]?.split(">")[0]
                };
                this.subject = body.payload.headers?.find(header => header.name === "Subject")?.value;

                const encodedBody = body.payload.parts?.find(part => part.mimeType === "text/html")?.body.data;
                this.body = encodedBody ? Buffer.from(encodedBody, "base64").toString() : "";
                resolve(this);
            });
        });
    };
}