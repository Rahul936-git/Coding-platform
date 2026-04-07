const { GoogleGenAI } = require("@google/genai");

const solveDoubt = async (req, res) => {
  try {
    const { messages, title, description, testCases, startCode } = req.body;

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_KEY });

    // Force correct Gemini format (only text)
    const formattedMessages = (messages || []).map((m) => {
      let text = "";

      // If frontend sends OpenAI style: {role, content}
      if (m.content) text = m.content;

      // If frontend sends Gemini style: {role, parts:[{text:""}]}
      else if (m.parts && m.parts[0] && m.parts[0].text) text = m.parts[0].text;

      // If frontend sends {text:""}
      else if (m.text) text = m.text;

      return {
        role: m.role || "user",
        parts: [{ text }]
      };
    });

    const response = await ai.models.generateContent({
      model: "models/gemini-2.5-flash",
      contents: formattedMessages,
      config: {
        systemInstruction: `
You are an expert Data Structures and Algorithms (DSA) tutor.

PROBLEM TITLE: ${title}
PROBLEM DESCRIPTION: ${description}
EXAMPLES: ${testCases}
START CODE: ${startCode}

Only help with this DSA problem.
        `,
      },
    });

    res.status(200).json({
      message: response.text,
    });

  } catch (err) {
    console.log("Gemini API Error:", err);

    res.status(500).json({
      message: "Internal server error",
      error: err.message,
    });
  }
};

module.exports = solveDoubt;
