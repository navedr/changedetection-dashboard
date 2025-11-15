export interface WebhookRequest {
    version: string;
    title: string;
    message: string;
    attachments: Attachment[];
    type: string;
}

export interface Attachment {
    filename: string;
    base64: string;
    mimetype: string;
}
