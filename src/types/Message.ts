import { gmail_v1 } from "googleapis";

export interface IMessageOptions {
    id: string;
    gmail: gmail_v1.Gmail
}

export interface IAuthor {
    name: string;
    email: string;
}