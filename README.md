# SentinelAI: Meeting Intelligence Agent

SentinelAI is an intelligent web application designed to eliminate the chaos of post-meeting follow-ups. Simply paste a raw meeting transcript (from Zoom, Teams, Google Meet, etc.), and the AI agent will automatically identify attendees, extract specific action items, assign deadlines, and determine exactly who is responsible for what.

Built with **React**, **Vite**, and **Tailwind CSS**, it features a modern, clean, and highly readable UI inspired by premium newsletter dashboards.

---

## 🚀 Features

- **Smart Transcript Parsing Engine**: 
  - Handles single-line and multi-line speaker tags.
  - Understands varied delegation phrasing (e.g., *"you'll handle"*, *"you'll be responsible for"*).
  - Detects commitments directly from speakers (e.g., *"I'll draft the launch announcement"*).
- **Personalized Briefs**: Automatically generates personalized follow-up messages for each team member detailing only their specific action items.
- **Meeting Archive & Calendar**: 
  - All processed meetings are automatically saved locally to your browser.
  - Includes a clickable calendar widget in the header to easily filter your meeting history by specific dates.
- **Export Data**: One-click **Export CSV** functionality to download action items as a formatted spreadsheet for use in Jira, Notion, or Excel.
- **Slack Sync**: A mocked integration ready to push personalized briefs out to your team's direct messages.

## 🛠️ Technology Stack

- **Frontend**: React (Vite)
- **Styling**: Tailwind CSS v4
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Data Persistence**: Local Storage API

## 📋 Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/shahin5sarkar-droid/ai-meeting-agent.git
   cd ai-meeting-agent
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

4. **Open in browser:**
   Navigate to `http://localhost:5173` to view the app.

## 🧠 How the Engine Works

The core extraction logic lives in `src/logic/engine.js`. Rather than relying on simple keyword matching, it uses a multi-pass heuristic system:
1. **Attendee Detection**: Scans the document to identify unique speakers and maps them.
2. **Confidence Layering**: Prioritizes "Direct Assignments" (a manager telling someone to do something) and "Speaker Commitments" (someone volunteering) over generic "Role Inference".
3. **Context Cleanup**: Ignores generic conversational acknowledgments (like *"Got it"* or *"Understood"*) that might otherwise trigger false positives.

## 🖼️ Usage Example

Paste a transcript formatted like this into the editor:

> **Manager (Alex):**
> Alright team, let’s quickly go over task assignments.
> John, you’ll handle the frontend UI updates. I need the first version ready by Wednesday, 5 PM.
> 
> **John:**
> Got it.

Click **Process Meeting**, and SentinelAI will automatically attribute the "Frontend UI updates" task to John, tag it with a Wednesday 5 PM deadline, and generate his personalized brief.
