import { useMemo, useState } from "react";
import { type ResumeData } from "../data/resumeData";

type ResumeChatbotProps = {
  resume: ResumeData;
  compact?: boolean;
};

type BotPayload = {
  primary: string;
  secondary?: string;
  topic: "welcome" | "experience" | "projects" | "skills" | "education" | "fallback";
  followUps: string[];
};

type ChatMessage = {
  id: string;
  role: "bot" | "user";
  text?: string;
  payload?: BotPayload;
};

const STARTER_QUESTION = "Ask about my experience, projects, skills, or education";
const QUICK_SUGGESTIONS = ["Experience", "Projects", "Skills", "Education"];
const DEFAULT_VISIBLE_MESSAGES = 5;
const EXPANDED_VISIBLE_MESSAGES = 9;

function normalize(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9\s.+#-]/g, " ").replace(/\s+/g, " ").trim();
}

function includesAny(query: string, values: string[]) {
  return values.some((value) => query.includes(normalize(value)));
}

function getSkills(resume: ResumeData) {
  return Object.values(resume.skills).flat();
}

function getFollowUps(topic: BotPayload["topic"]) {
  if (topic === "experience") {
    return ["What did you build at MyTower?", "What did you do at Nakhil?", "Which stack did you use?"];
  }
  if (topic === "projects") {
    return ["Tell me about your top project", "Which project used C?", "Which project used Python?"];
  }
  if (topic === "skills") {
    return ["Where did you use that skill?", "What backend technologies do you use?", "Do you have systems experience?"];
  }
  if (topic === "education") {
    return ["What coursework is most relevant?", "What is your degree focus?", "Are you currently studying?"];
  }
  return ["Experience", "Projects", "Skills"];
}

function buildNoMatchPayload(): BotPayload {
  return {
    primary: "I can only answer from my resume.",
    secondary: "Ask me about Experience, Projects, Skills, or Education.",
    topic: "fallback",
    followUps: getFollowUps("fallback"),
  };
}

function buildEducationPayload(resume: ResumeData): BotPayload {
  const currentEducation = resume.education[0];
  const priorEducation = resume.education[1];
  return {
    primary: `I'm currently studying ${currentEducation.degree} at ${currentEducation.institution} (${currentEducation.period}).`,
    secondary: priorEducation
      ? `Before that, I completed ${priorEducation.degree} at ${priorEducation.institution}.`
      : `Relevant coursework includes ${currentEducation.pillars.slice(0, 4).join(", ")}.`,
    topic: "education",
    followUps: getFollowUps("education"),
  };
}

function buildProjectsPayload(resume: ResumeData, query: string): BotPayload {
  const normalized = normalize(query);
  const allSkills = getSkills(resume);
  const matchedSkill = allSkills.find((skill) => normalized.includes(normalize(skill)));
  const projects = matchedSkill
    ? resume.projects.filter((project) => project.skillsUsed.includes(matchedSkill))
    : resume.projects;

  if (!projects.length) {
    return {
      primary: `I don't have a project on my resume that explicitly lists ${matchedSkill}.`,
      secondary: "I can share projects in AI, systems simulation, or regression modeling instead.",
      topic: "projects",
      followUps: getFollowUps("projects"),
    };
  }

  if (matchedSkill) {
    const topProject = projects[0];
    return {
      primary: `Yes - I've used ${matchedSkill} in my ${topProject.title} project.`,
      secondary:
        projects.length > 1
          ? `I also used it in ${projects
              .slice(1, 3)
              .map((project) => project.title)
              .join(" and ")}.`
          : topProject.impact,
      topic: "projects",
      followUps: getFollowUps("projects"),
    };
  }

  return {
    primary: "I've built projects across AI workflows, systems simulation, and predictive modeling.",
    secondary: `Recent examples: ${projects
      .slice(0, 2)
      .map((project) => project.title)
      .join(" and ")}.`,
    topic: "projects",
    followUps: getFollowUps("projects"),
  };
}

function buildExperiencePayload(resume: ResumeData, query: string): BotPayload {
  const normalized = normalize(query);
  const matchedExperience = resume.experience.find((item) =>
    includesAny(normalized, [item.company, item.role, item.focus ?? ""])
  );

  if (matchedExperience) {
    return {
      primary: `I worked as a ${matchedExperience.role} at ${matchedExperience.company}.`,
      secondary: matchedExperience.summary,
      topic: "experience",
      followUps: getFollowUps("experience"),
    };
  }

  return {
    primary: `I have internship experience at ${resume.experience
      .map((item) => item.company)
      .join(" and ")}.`,
    secondary: "My work focused on backend integrations, workflow tools, and web app development.",
    topic: "experience",
    followUps: getFollowUps("experience"),
  };
}

function buildSkillsPayload(resume: ResumeData, query: string): BotPayload {
  const normalized = normalize(query);
  const allSkills = getSkills(resume);
  const matchedSkill = allSkills.find((skill) => normalized.includes(normalize(skill)));

  if (!matchedSkill) {
    return {
      primary: "My resume highlights Python, Java, C, SQL, React, Angular, and Spring Boot.",
      secondary: "I can break down where any specific skill was used.",
      topic: "skills",
      followUps: getFollowUps("skills"),
    };
  }

  const matchedExperience = resume.experience.find((item) => item.skillsUsed.includes(matchedSkill));
  const matchedProject = resume.projects.find((item) => item.skillsUsed.includes(matchedSkill));

  if (matchedExperience) {
    return {
      primary: `Yes - I've used ${matchedSkill} during my ${matchedExperience.company} internship.`,
      secondary: `Role: ${matchedExperience.role}.`,
      topic: "skills",
      followUps: getFollowUps("skills"),
    };
  }

  if (matchedProject) {
    return {
      primary: `Yes - I've used ${matchedSkill} for my ${matchedProject.title} project.`,
      secondary: matchedProject.impact,
      topic: "skills",
      followUps: getFollowUps("skills"),
    };
  }

  return {
    primary: `Yes - ${matchedSkill} is part of my skill set.`,
    secondary: "I can share related internship or project context from the sections above.",
    topic: "skills",
    followUps: getFollowUps("skills"),
  };
}

function buildPayload(resume: ResumeData, question: string): BotPayload {
  const normalized = normalize(question);
  if (!normalized) return buildNoMatchPayload();
  if (includesAny(normalized, ["education", "degree", "university", "mcgill"])) {
    return buildEducationPayload(resume);
  }
  if (includesAny(normalized, ["project", "projects", "build", "built"])) {
    return buildProjectsPayload(resume, question);
  }
  if (includesAny(normalized, ["experience", "intern", "internship", "nakhil", "mytower", "work"])) {
    return buildExperiencePayload(resume, question);
  }
  if (includesAny(normalized, ["skill", "skills", "stack", "technology", "technologies"])) {
    return buildSkillsPayload(resume, question);
  }
  if (includesAny(normalized, getSkills(resume))) {
    return buildSkillsPayload(resume, question);
  }
  return buildNoMatchPayload();
}

function ResumeChatbot({ resume, compact = false }: ResumeChatbotProps) {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "bot",
      payload: {
        primary: "This assistant answers strictly from my resume.",
        secondary: "Ask about Experience, Projects, Skills, or Education.",
        topic: "welcome",
        followUps: [],
      },
    },
  ]);
  const [expandedWindow, setExpandedWindow] = useState(false);

  const quickSuggestions = useMemo(() => QUICK_SUGGESTIONS, []);
  const visibleMessages = useMemo(
    () =>
      messages.slice(
        -(expandedWindow ? EXPANDED_VISIBLE_MESSAGES : DEFAULT_VISIBLE_MESSAGES)
      ),
    [messages, expandedWindow]
  );
  const hasOlderMessages = messages.length > visibleMessages.length;
  const latestBotMessage = [...visibleMessages].reverse().find((message) => message.role === "bot");

  const submitQuestion = (question: string) => {
    const clean = question.trim();
    if (!clean) return;

    const payload = buildPayload(resume, clean);
    const stamp = Date.now();
    setMessages((current) => [
      ...current,
      { id: `user-${stamp}`, role: "user", text: clean },
      { id: `bot-${stamp + 1}`, role: "bot", payload },
    ]);
    setExpandedWindow(false);
    setInput("");
  };

  return (
    <div className={`chatbot-card chatbot-shell ${compact ? "chatbot-compact" : ""}`} data-reveal>
      <div className="chatbot-topbar">
        <div className="chatbot-topbar-meta">
          <span className="chatbot-avatar" aria-hidden="true">
            AR
          </span>
          <div>
            <p className="chatbot-title">Resume Chatbot</p>
            <p className="chatbot-subtitle">Resume-grounded answers</p>
          </div>
        </div>
      </div>

      <div className="chat-suggestions" aria-label="Suggested questions">
        {quickSuggestions.map((suggestion) => (
          <button key={suggestion} type="button" className="chat-chip" onClick={() => submitQuestion(suggestion)}>
            {suggestion}
          </button>
        ))}
      </div>

      <div className="chat-messages compact-window" aria-live="polite">
        {hasOlderMessages && (
          <button
            type="button"
            className="chat-view-more"
            onClick={() => setExpandedWindow((current) => !current)}
          >
            {expandedWindow ? "Show recent" : "View earlier messages"}
          </button>
        )}
        {visibleMessages.map((message) => {
          if (message.role === "user") {
            return (
              <div key={message.id} className="chat-row chat-row-user">
                <div className="chat-bubble chat-bubble-user">
                  <p>{message.text}</p>
                </div>
              </div>
            );
          }

          if (!message.payload) return null;
          return (
            <div key={message.id} className="chat-row chat-row-bot">
              <div className="chat-bubble chat-bubble-bot">
                <p className={`bot-label ${message.id === "welcome" ? "bot-label-subtle" : ""}`}>
                  {message.payload.primary}
                </p>
                {message.payload.secondary && (
                  <p className="bot-supporting-text">{message.payload.secondary}</p>
                )}
              </div>
            </div>
          );
        })}
        {!!latestBotMessage?.payload?.followUps.length && latestBotMessage.payload.topic !== "welcome" && (
          <div className="chat-followups" aria-label="Suggested follow-up questions">
            {latestBotMessage.payload.followUps.slice(0, 3).map((question) => (
              <button
                key={question}
                type="button"
                className="chat-chip chat-chip-followup"
                onClick={() => submitQuestion(question)}
              >
                {question}
              </button>
            ))}
          </div>
        )}
      </div>

      <form
        className="chatbot-composer"
        onSubmit={(event) => {
          event.preventDefault();
          submitQuestion(input);
        }}
      >
        <label htmlFor="resume-chat">Ask about my resume</label>
        <div className="chat-input-row">
          <input
            id="resume-chat"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder={STARTER_QUESTION}
          />
          <button type="submit" className="btn btn-primary">
            Ask
          </button>
        </div>
      </form>
    </div>
  );
}

export default ResumeChatbot;
