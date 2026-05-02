# SentinelAI - Meeting Intelligence Agent

SentinelAI is a high-performance meeting action agent designed to eliminate ambiguity in team collaboration. It extracts commitments, assignments, and deadlines directly from meeting transcripts and uses a **5-stage confidence hierarchy** to attribute them to the correct individuals.

## Key Features

- **🎯 Smart Attribution**: Automatically identifies WHO is responsible for WHAT.
- **🛡️ Confidence Scoring**: Each action item is graded (0-100%) based on the clarity of the assignment.
- **📧 Personalized Outreach**: Generates unique follow-up messages for every attendee, containing only their specific tasks.
- **⚠️ Ambiguity Detection**: Flags unclear assignments for human review instead of making risky assumptions.
- **✨ Premium UI**: A state-of-the-art dashboard built with React, Framer Motion, and Tailwind CSS.

## Getting Started

### Prerequisites
- Node.js (v18+)
- npm

### Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run the development server:
   ```bash
   npm run dev
   ```

3. Open your browser to the local URL provided by Vite.

## Attribution Innovation: The 5-Stage Engine

1. **Direct Assignment (95%)**: "John, you need to build the API."
2. **Explicit Delegation (85%)**: "I'll assign the docs to Sarah."
3. **Speaker Commitment (95%)**: "I'll finalize the designs," says Maya.
4. **Role Inference (75%)**: "The designer will handle the UI," (Maya is the designer).
5. **Pattern Matching (60%)**: "We need a blog post," (Alex handles marketing).

## Designed For
**High-Growth Startup Teams**. In fast-paced environments, "we" often means "no one." SentinelAI forces clarity on ownership, ensuring nothing falls through the cracks.
