const transcript = `Zoom Meeting Transcript – Task Allocation

Manager (Raj): Good morning, everyone. Let’s quickly assign tasks for this week.

Raj: Priya, you’ll handle the client presentation. Deadline: Wednesday, 5 PM.

Priya: Got it, I’ll have it ready.

Raj: Arjun, you’re in charge of updating the website content. Deadline: Thursday noon.

Arjun: Okay, I’ll complete it by then.

Raj: Sneha, please analyze last month’s sales data and prepare a report. Deadline: Friday, 3 PM.

Sneha: Sure, I’ll send it before the deadline.

Raj: Rahul, work on fixing the app bugs reported by QA. Deadline: Friday end of day.

Rahul: Understood.

Raj: Great. Let me know if you face any issues. Let’s stay on track. Meeting adjourned.`

const lines = transcript.split('\n').map(l => l.trim()).filter(l => l.length > 0);
console.log(lines);
