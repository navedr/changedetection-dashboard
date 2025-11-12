#!/usr/bin/env node

/**
 * Test script to send a sample webhook to the changedetection dashboard
 * Usage: node test-webhook.js
 */

const sampleWebhookData = [
    {
        headers: {
            host: "localhost:8080",
            "user-agent": "changedetection.io",
            "content-type": "application/json",
        },
        params: {},
        query: {},
        body: {
            version: "1.0",
            title: "https://www.example.com/product/test-product-123",
            message: `<del>Old price: $99.99</del>
**New price: $79.99** 
**20% discount applied!**
---

[[Watch URL](https://www.example.com/product/test-product-123)] [[Diff URL](https://changedetection.example.com/diff/test-uuid)] [[Edit](https://changedetection.example.com/edit/test-uuid#general)]`,
            attachments: [
                {
                    filename: "last-screenshot.png",
                    base64: "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
                    mimetype: "image/png",
                },
            ],
            type: "info",
        },
        webhookUrl: "http://localhost:8080/api/webhook",
        executionMode: "test",
    },
];

async function sendWebhook() {
    try {
        console.log("Sending test webhook to http://localhost:8080/api/webhook");

        const response = await fetch("http://localhost:8080/api/webhook", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(sampleWebhookData),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        console.log("Success! Response:", JSON.stringify(result, null, 2));
        console.log("\n✓ Webhook sent successfully!");
        console.log("\nNow open http://localhost:8080 in your browser to view the dashboard.");
        console.log("Login credentials: ecarone / mavericks");
    } catch (error) {
        console.error("Error sending webhook:", error.message);
        console.error("\nMake sure the server is running with: yarn dev");
        process.exit(1);
    }
}

sendWebhook();
