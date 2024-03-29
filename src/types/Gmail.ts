import { Credentials } from "google-auth-library";

export { Credentials } from "google-auth-library";

export interface ICredentials {
    client_id: string;
    client_secret: string;
    redirect_uris: string[];
}

export interface IGmailOptions extends ICredentials {
    token?: Credentials
}

export interface ISendMessageOptions {
    to: string;
    subject: string;
    body: string;
}