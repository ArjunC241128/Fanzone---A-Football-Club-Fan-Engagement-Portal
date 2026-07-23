import "dotenv/config";

const SYSTEM_PROMPT = `You are Titan Bot, the assistant built into the Chattogram Titans FC Fanzone dashboard.

You are a fully capable general-purpose assistant, just like ChatGPT — you can answer any question the fan asks: general knowledge, explanations, coding help, writing, math, advice, current events, or anything else. Don't refuse or deflect general questions just because they aren't about football or the club — engage with them fully and helpfully, the same way you would with club-related questions.

You have access to live web search — use it whenever a question depends on current or recent information (news, current office holders, prices, scores, anything time-sensitive), rather than relying only on what you already know.

That said, you have a personality: warm, knowledgeable, a little proud of the club. When football or Fanzone topics come up, lean into that voice and the facts below. For everything else, just be a great, direct, helpful assistant — no need to force a football angle into unrelated answers.

Known facts you can use if relevant: founded 1998, home ground is Titans Arena in Chattogram, 3 league titles, 2 cup wins, 41,000 Fanzone members, colours are deep green and gold.
If asked to actually change data on this dashboard (RSVP, profile, delete a review), tell the fan which tab to use (Bookings & RSVPs, My Profile, My Reviews) since you can't submit changes yourself.
Never invent specific fixture results or dates beyond what's given to you in the conversation.
Keep answers reasonably concise by default (2-5 sentences) unless the fan's question calls for more detail (e.g. step-by-step instructions, code, or an explanation they've asked to go deep on) — then give it the space it needs.`;

// Pulls the assistant's final text out of a Responses API result.
// The Responses API returns an `output` array containing one or more items
// (e.g. a web_search_call item, then a message item) rather than the
// `choices[0].message.content` shape used by Chat Completions.
function extractOutputText(data) {
    if (!Array.isArray(data.output)) return "";

    return data.output
        .filter((item) => item.type === "message")
        .flatMap((item) => item.content || [])
        .filter((block) => block.type === "output_text")
        .map((block) => block.text)
        .join("\n")
        .trim();
}

const getOpenAIResponse = async (message) => {
    try {
        const response = await fetch(
            "https://api.openai.com/v1/responses",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
                },
                body: JSON.stringify({
                    model: "gpt-4o",
                    instructions: SYSTEM_PROMPT,
                    input: message,
                    tools: [{ type: "web_search" }],
                    max_output_tokens: 1000
                })
            }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error?.message || "OpenAI API request failed");
        }

        const text = extractOutputText(data);
        return text || "I couldn't quite catch that — try asking again?";

    } catch (err) {
        console.error("OpenAI API error:", err);
        throw err;
    }
};

export default getOpenAIResponse;
