export interface HelpDefinition {
  id: string;
  question: string;
  answer: string;
  example?: string;
}

export interface HelpTopic {
  id: string;
  title: string;
  definitions: HelpDefinition[];
}

export const helpTopics: HelpTopic[] = [
  {
    id: "core-concepts",
    title: "Core Concepts",
    definitions: [
      {
        id: "thread",
        question: "What is a thread?",
        answer:
          "A thread is a conversation grouped by the same subject and participants. Watchlane tracks response time at the thread level, not individual messages.",
      },
      {
        id: "inbound-email",
        question: "What counts as an inbound email?",
        answer:
          "An inbound email is any message sent to your team from an external sender. Internal emails and automated responses are excluded.",
      },
      {
        id: "reply",
        question: "What counts as a reply?",
        answer:
          "A reply is the first outbound email sent by your team after an inbound message.",
      },
      {
        id: "coverage",
        question: "What is coverage?",
        answer:
          "Coverage means an inbound thread has received a reply. Threads without a reply are considered uncovered.",
      },
    ],
  },
  {
    id: "sla-and-metrics",
    title: "SLA & Metrics",
    definitions: [
      {
        id: "sla",
        question: "What is SLA?",
        answer:
          "SLA (Service Level Agreement) is the maximum time your team has to respond to an inbound email.",
      },
      {
        id: "response-time",
        question: "What is response time?",
        answer:
          "Response time is the time between receiving an inbound email and sending the first reply.",
      },
      {
        id: "breach",
        question: "What is a breach?",
        answer:
          "A breach occurs when a thread exceeds the SLA without a reply.",
      },
      {
        id: "at-risk",
        question: "What does at risk mean?",
        answer:
          "A thread is at risk when it is approaching the SLA limit but has not yet breached.",
      },
      {
        id: "average-response-time",
        question: "What is average response time?",
        answer:
          "The average time it takes your team to respond to inbound emails.",
      },
      {
        id: "oldest-gap",
        question: "What is the oldest gap?",
        answer:
          "The longest-running uncovered thread — the inbound email that has been waiting the longest for a reply.",
      },
    ],
  },
  {
    id: "ownership-and-accountability",
    title: "Ownership & Accountability",
    definitions: [
      {
        id: "owner",
        question: "What is an owner?",
        answer:
          "The owner is the person responsible for responding to a thread.",
      },
      {
        id: "ownership-matters",
        question: "Why does ownership matter?",
        answer:
          "Ownership allows performance tracking, accountability, and coaching.",
      },
    ],
  },
  {
    id: "folders-and-tracking",
    title: "Folders & Tracking",
    definitions: [
      {
        id: "tracked-folders",
        question: "Which folders are tracked?",
        answer:
          "By default, Inbox and its subfolders are tracked. Sent Items is always tracked.",
      },
      {
        id: "enable-folder",
        question: "What happens when I enable a folder?",
        answer:
          "Watchlane will begin tracking new emails and backfill up to 30 days of history.",
      },
      {
        id: "non-selectable-folders",
        question: "Why aren’t some folders selectable?",
        answer: "System folders like Junk, Deleted, and Drafts are excluded.",
      },
    ],
  },
  {
    id: "data-and-privacy",
    title: "Data & Privacy",
    definitions: [
      {
        id: "email-content",
        question: "Does Watchlane read email content?",
        answer:
          "No. Watchlane only accesses metadata such as timestamps, senders, and thread IDs.",
      },
      {
        id: "data-security",
        question: "How is data secured?",
        answer:
          "OAuth authentication, encrypted storage, and revocable access via Microsoft.",
      },
    ],
  },
  {
    id: "faq",
    title: "FAQ",
    definitions: [
      {
        id: "no-emails",
        question: "Why am I not seeing emails?",
        answer:
          "Check mailbox connection, folder selection, and run a sync.",
      },
      {
        id: "incorrect-coverage",
        question: "Why is coverage incorrect?",
        answer:
          "Replies may not be detected if Sent Items is not synced or if emails are filtered.",
      },
      {
        id: "gmail-support",
        question: "Does it work with Gmail?",
        answer: "Not yet. Microsoft 365 is supported first.",
      },
      {
        id: "workflow-changes",
        question: "Do I need to change my workflow?",
        answer: "No. Your team continues using Outlook.",
      },
    ],
  },
];
