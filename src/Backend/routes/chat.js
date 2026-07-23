import express from "express";
import Thread from "../models/Thread.js";
import getOpenAIResponse from "../utils/openai.js";

const router = express.Router();

router.post("/chat", async (req, res) => {
    const { threadID, message } = req.body;

    if (!threadID || !message) {
        return res.status(400).json({ error: "missing required fields" });
    }

    try {
        const assistantReply = await getOpenAIResponse(message);

        await Thread.findOneAndUpdate(
            { threadID },
            {
                $setOnInsert: { threadID, title: message },
                $push: {
                    messages: {
                        $each: [
                            { role: "user", content: message },
                            { role: "assistant", content: assistantReply }
                        ]
                    }
                },
                $set: { updatedAt: new Date() }
            },
            { returnDocument: "after", upsert: true }
        );

        res.json({ reply: assistantReply });
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: "something went wrong" });
    }
});

router.get("/thread/:threadID", async (req, res) => {
    const { threadID } = req.params;
    try {
        const thread = await Thread.findOne({ threadID });
        if (!thread) return res.status(404).json({ error: "Thread not Found" });
        res.json(thread.messages);
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: "Failed to fetch chat" });
    }
});

export default router;