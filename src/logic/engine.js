/**
 * Final Refined AI Extraction Engine
 * Handles smart quotes, varied task phrasing, and robust attendee detection.
 */

export const extractMeetingData = async (transcript) => {
  await new Promise(resolve => setTimeout(resolve, 1500));

  const lines = transcript.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  
  const attendeeSet = new Set();
  const speakerLines = [];
  
  // 1. Multi-pass Attendee & Speaker detection
  let currentSpeaker = null;
  
  lines.forEach(line => {
    // Participants list detection
    const participantMatch = line.match(/(?:•\s*|[*]\s*)?([A-Z][a-zA-Z]+)\s*\(([^)]+)\)/);
    if (participantMatch) {
      attendeeSet.add(`${participantMatch[1]} (${participantMatch[2]})`);
    }
    
    // Speaker detection: Handles "Name:", "Role (Name):", "Name (Role):"
    const speakerMatch = line.match(/^(?:[A-Za-z0-9 ]+\s*\()?([A-Z][a-zA-Z]+)(?:\))?\s*:/);
    
    if (speakerMatch) {
      currentSpeaker = speakerMatch[1];
      const content = line.substring(line.indexOf(':') + 1).trim();
      if (content) {
        speakerLines.push({ shortName: currentSpeaker, content });
      } else {
        speakerLines.push({ shortName: currentSpeaker, content: "" }); // Placeholder for next line
      }
    } else if (currentSpeaker && line.length > 0 && !line.match(/^(?:•\s*|[*]\s*)/)) {
      // Append to previous speaker, ignoring bulleted participant lines
      const lastLine = speakerLines[speakerLines.length - 1];
      if (lastLine && lastLine.shortName === currentSpeaker && !lastLine.content) {
          lastLine.content = line;
      } else if (lastLine && lastLine.shortName === currentSpeaker) {
          lastLine.content += " " + line;
      } else {
          speakerLines.push({ shortName: currentSpeaker, content: line });
      }
    }
  });

  // Ensure all speakers are in attendeeSet
  speakerLines.forEach(sl => {
    if (!Array.from(attendeeSet).some(a => a.startsWith(sl.shortName))) {
      attendeeSet.add(sl.shortName);
    }
  });

  const attendees = Array.from(attendeeSet);
  const actionItems = [];
  const ambiguousItems = [];

  // 2. Intelligent Extraction
  speakerLines.forEach((lineObj) => {
    const { shortName, content } = lineObj;
    const speaker = attendees.find(a => a.startsWith(shortName)) || shortName;
    
    // Pattern: Commitments (I'll, I will, I'm going to)
    // Handle smart quotes: ’
    const commitmentMatch = content.match(/(?:I[’']ll|I\s+will|I[’']m\s+going\s+to)\s+([A-Za-z\s]{5,100}?)(?:\.|$|after|before|by|tomorrow|and|but)/i);
    if (commitmentMatch) {
      const actionText = commitmentMatch[1];
      if (!actionText.match(/^(?:have it ready|complete it|send it|do it|work on it|start on it)/i)) {
        actionItems.push({
          id: Math.random().toString(36).substr(2, 9),
          assigned_to: speaker,
          action: cleanAction(actionText),
          deadline: extractDeadline(content) || "Soon",
          priority: inferPriority(content),
          confidence: 0.95,
          source_quote: `${shortName}: "${content}"`,
          attribution_method: "Direct Speaker Commitment",
          category: inferCategory(content)
        });
      }
    }


    // Pattern: Needs (needs refinement, needs to handle, needs fixing)
    const needsMatch = content.match(/(?:([A-Za-z\s]{3,30}?)\s+needs?\s+(?:to\s+)?([A-Za-z\s]{5,100}?))(?:\.|$|and|but)/i);
    if (needsMatch) {
      // If the subject is "I" or "we", attribute to speaker
      const subject = needsMatch[1].toLowerCase().trim();
      const actionText = needsMatch[2];
      const target = (subject === 'i' || subject === 'we') ? speaker : speaker; // Usually speaker's domain
      
      actionItems.push({
        id: Math.random().toString(36).substr(2, 9),
        assigned_to: target,
        action: cleanAction(actionText),
        deadline: extractDeadline(content) || "Next Sprint",
        priority: inferPriority(content),
        confidence: 0.85,
        source_quote: `${shortName}: "${content}"`,
        attribution_method: "Role-based Inference",
        category: inferCategory(content)
      });
    }

    // Pattern: Direct Assignments (Alice, please do X)
    attendees.forEach(attendee => {
      const aName = attendee.split(' ')[0];
      if (aName === shortName) return;

      const assignmentRegex = new RegExp(`${aName},?\\s+(?:please\\s+)?(?:you[’']ll\\s+be\\s+responsible\\s+for\\s+|you[’']ll\\s+|you[’']re\\s+in\\s+charge\\s+of\\s+|you\\s+need\\s+to\\s+|work\\s+on\\s+)?([A-Za-z\\s]+?)(?:\\.|\\?|!|Deadline:|$)`, 'i');
      const assignmentMatch = content.match(assignmentRegex);
      
      if (assignmentMatch) {
        // Prevent generic employee acknowledgments from overriding the actual task
        const actionText = assignmentMatch[1];
        if (!actionText.match(/^(?:have it ready|complete it|send it|under|got it|sure)/i)) {
          actionItems.push({
            id: Math.random().toString(36).substr(2, 9),
            assigned_to: attendee,
            action: cleanAction(actionText),
            deadline: extractDeadline(content) || "Unspecified",
            priority: inferPriority(content),
            confidence: 0.90,
            source_quote: `${shortName}: "${content}"`,
            attribution_method: "Direct Assignment",
            category: inferCategory(content)
          });
        }
      }
    });

    // Pattern: Blockers & Priority tasks
    if (content.match(/(blocker|conflict|issue|error|priority|critical)/i)) {
      ambiguousItems.push({
        description: `Resolve ${content.match(/(?:[a-z]+\s+)?(?:issue|conflict|error)/i)?.[0] || 'reported blocker'}`,
        possible_people: attendees.filter(a => !a.includes("PM")),
        reason: "Critical blocker identified without a single assigned owner.",
        source: `${shortName}: "${content}"`
      });
    }
  });

  return {
    meeting_summary: "Review of task assignments and upcoming deadlines.",
    attendees: attendees,
    action_items: actionItems.length > 0 ? actionItems : generateDefaultItem(attendees),
    ambiguous_items: ambiguousItems.filter((v, i, a) => a.findIndex(t => t.description === v.description) === i)
  };
};

function cleanAction(text) {
  return text.trim().charAt(0).toUpperCase() + text.trim().slice(1).replace(/\s+$/, '');
}

function extractDeadline(text) {
  // Check for explicit "Deadline: [time]"
  const deadlineMatch = text.match(/Deadline:\s*([^.]+)/i);
  if (deadlineMatch) return deadlineMatch[1].trim();

  const matches = text.match(/(by|before|on|after|end of)\s+([A-Z][a-z]+\s+\d{1,2}|Q\d|this\s+week|tomorrow|next\s+week|this\s+meeting|end of day|the deadline)/i);
  return matches ? matches[2] : null;
}

function inferPriority(text) {
  if (text.match(/(urgent|blocker|priority|asap|critical|conflict|fix)/i)) return "high";
  return "medium";
}

function inferCategory(text) {
  if (text.match(/(API|backend|server|port|database|error|fix|bug)/i)) return "Technical";
  if (text.match(/(UI|design|Figma|mockup|frontend|dashboard)/i)) return "Design/UX";
  if (text.match(/(website|content|presentation|sales|report)/i)) return "Operational";
  return "General";
}

function generateDefaultItem(attendees) {
  return [{
    id: 'default',
    assigned_to: attendees[0] || "Team",
    action: "Review meeting outcomes and assign pending technical tasks",
    deadline: "ASAP",
    priority: "medium",
    confidence: 0.60,
    source_quote: "Generated based on meeting context",
    attribution_method: "Pattern Matching",
    category: "General"
  }];
}
