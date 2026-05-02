const transcript = `Manager (Alex):
Alright team, let’s quickly go over task assignments for this week.

Employee 1 (John):
Sure.

Manager:
John, you’ll handle the frontend UI updates. I need the first version ready by Wednesday, 5 PM.

John:
Got it.

Manager:
Sarah, you’ll work on the backend API integration. Please complete it by Thursday, end of day.

Employee 2 (Sarah):
Okay, noted.

Manager:
Mike, you’ll be responsible for testing and bug tracking. Start after John’s update and submit your report by Friday noon.

Employee 3 (Mike):
Understood.

Manager:
Also, everyone, keep updating progress daily in the tracker. Let’s stay on schedule.

Team:
Sure.

Manager:
Great, that’s all for now. Thanks everyone!`

const lines = transcript.split('\n').map(l => l.trim()).filter(l => l.length > 0);
let currentSpeaker = null;
const speakerLines = [];

lines.forEach(line => {
  const speakerMatch = line.match(/^(?:[A-Za-z0-9 ]+\s*\()?([A-Z][a-zA-Z]+)(?:\))?\s*:/);
  
  if (speakerMatch) {
    currentSpeaker = speakerMatch[1];
    const content = line.substring(line.indexOf(':') + 1).trim();
    if (content) {
      speakerLines.push({ shortName: currentSpeaker, content });
    } else {
      speakerLines.push({ shortName: currentSpeaker, content: "" }); // Placeholder for next line
    }
  } else if (currentSpeaker && line.length > 0) {
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

console.log(speakerLines);
