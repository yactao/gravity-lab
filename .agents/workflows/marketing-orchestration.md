---
description: Orchestrate the marketing agents to create a full content campaign
---

# Marketing Campaign Orchestration Workflow

This workflow guides you through using the marketing agent team to research, plan, write, and design a marketing campaign (like a whitepaper, presentation, or landing page).

## 1. Project Planning & Strategy (Marketing Director)
Before writing any content, use the `marketing-director` agent to define the project scope.

**Example Prompt:**
> "I need to create a [whitepaper/presentation/campaign] about [Topic] targeting [Audience]. Act as the `marketing-director` agent. Ask me clarifying questions about the goals, tone, and key messages. Once we agree, provide a strategic brief and content outline."

## 2. SEO & Keyword Strategy (SEO Expert - Optional but Recommended)
If the content is for the web, use the `marketing-seo-expert` to define the keyword strategy based on the Director's brief.

**Example Prompt:**
> "Based on the marketing director's brief above, act as the `marketing-seo-expert` agent. Provide a keyword strategy, title tag recommendations, and a list of secondary keywords we should include in the copy."

## 3. Content Creation (Copywriter)
Once the strategy and outline are approved, have the `marketing-copywriter` draft the text.

**Example Prompt:**
> "Act as the `marketing-copywriter` agent. Using the strategic brief from the director [and the keywords from the SEO expert], write the first draft of the [section/asset]. Keep the tone [Tone] and ensure a strong hook."

*Note: For long assets like whitepapers, tackle this section by section rather than all at once.*

## 4. Visual Design Direction (Designer)
While or after the copy is written, use the `marketing-designer` to conceptualize the visuals.

**Example Prompt:**
> "Act as the `marketing-designer` agent. Review the copy drafted above and provide design direction. Suggest a layout structure, recommend specific types of imagery, and provide DALL-E/Midjourney prompts we can use to generate the visual assets."

## 5. Final Review (Marketing Director)
Bring the `marketing-director` back to review the combined copy and design direction against the original brief.

**Example Prompt:**
> "Act as the `marketing-director` agent. Review the drafted copy and the design direction. Does this meet the original strategic goals? Provide specific feedback for any necessary revisions before we finalize."

## 6. Export/Implementation
Once approved, format the final content (Markdown, HTML, or directly into a presentation tool) for the client.
