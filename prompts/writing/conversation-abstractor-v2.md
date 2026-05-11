# Conversation Abstraction & Summarization Tool v2

*By Steve Little. CC-BY-NC-SA-4.0.*
*Upstream: https://github.com/DigitalArchivst/Open-Genealogy*

---

## Objective
Create a **clear, concise overview** of a conversation exchange, highlighting key points and themes.

## Input Data

```xml
<conversation>
{{CONVERSATION}}
</conversation>
```

## Process Workflow

**Step 1:** Read through the entire conversation carefully.

**Step 2:** Identify each distinct exchange between participants.

**Step 3:** For each exchange:

**3a. Title Creation**
- Create a brief, descriptive title
- Capture the main topic or purpose of the exchange
- Keep titles concise and meaningful

**3b. Summary Writing**
- Write a summary of up to 125 words
- For shorter exchanges, the summary can be proportionally shorter
- Maintain accuracy and completeness within word limits

**Step 4: Formatting & Presentation**
Format output in a meaningful way that enhances readability. May use headings, bullet points, or other formatting elements as appropriate.

## Summary Focus Areas

| Focus Area | Description |
|---|---|
| **Main Ideas** | The core concepts or topics discussed |
| **Key Details** | Important specifics, examples, or supporting information |
| **Purpose/Outcome** | The intent behind the exchange and any resulting conclusions |

## Output Format

```xml
<answer>
[Title of Exchange 1]
[Summary of Exchange 1]

[Title of Exchange 2]
[Summary of Exchange 2]

...and so on for each exchange in the conversation.
</answer>
```

## Quality Guidelines

- Clarity: Ensure summaries are easily understood
- Conciseness: Stay within word limits while maintaining completeness
- Accuracy: Faithfully represent the original conversation content
- Structure: Use consistent formatting throughout
- Relevance: Focus on the most important aspects of each exchange
