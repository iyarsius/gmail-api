import { readFileSync, writeFileSync } from 'fs';
import { Credentials, OAuth2Client } from 'google-auth-library';
import { gmail_v1, google } from 'googleapis';
import { join } from 'path';
import { Message } from './classes/Message';
import { IGmailOptions } from './types/Gmail';

const SCOPES = [
    'https://mail.google.com/',
    'https://www.googleapis.com/auth/gmail.modify',
    'https://www.googleapis.com/auth/gmail.send',
];

export class Gmail {
    oAuth2Client: OAuth2Client;
    authUrl: string;
    token: Credentials;
    gmail: gmail_v1.Gmail;

    constructor(options: IGmailOptions) {
        const { client_secret, client_id, redirect_uris } = options;
        this.oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);
        this.authUrl = this.oAuth2Client.generateAuthUrl({
            access_type: "offline",
            scope: SCOPES
        });

        this.token = options.token ? options.token : JSON.parse(readFileSync(join(__dirname, "./token.json"), 'utf8')) as Credentials;
    };

    async authorize(code?: string) {
        // Check if we have previously stored a token.
        if (!this.token && !code) throw new Error('token or code is required');

        if (!this.token) {
            this.token = await new Promise((resolve, reject) => {
                this.oAuth2Client.getToken(code, (err, token) => {
                    if (err) {
                        reject(err);
                        return
                    };
                    resolve(token);
                });
            });
        };

        this.oAuth2Client.setCredentials(this.token);

        if (this.token.expiry_date < Date.now()) {
            // refresh token
            await this.oAuth2Client.getRequestHeaders()
            this.token = this.oAuth2Client.credentials
        }

        writeFileSync(join(__dirname, "./token.json"), JSON.stringify(this.token));

        this.gmail = google.gmail({ version: 'v1', auth: this.oAuth2Client });
    }

    async listMessages(listMessagesOptions: gmail_v1.Params$Resource$Users$Messages$List) {
        const res = await new Promise((resolve, reject) => {
            this.gmail.users.messages.list(listMessagesOptions, (err, res) => {
                if (err) {
                    reject(err);
                    return;
                }

                resolve(res.data);
            }
            );
        }) as gmail_v1.Schema$ListMessagesResponse;

        return res.messages.map(message => new Message({
            id: message.id,
            gmail: this.gmail
        }));
    };

    async sendMessage(sendMessageOptions: gmail_v1.Params$Resource$Users$Messages$Send) {
        return await new Promise((resolve, reject) => {
            this.gmail.users.messages.send(sendMessageOptions, (err, res) => {
                if (err) {
                    reject(err);
                    return;
                }

                resolve(res.data);
            }
            );
        });
    };
}