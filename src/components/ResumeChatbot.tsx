import { useEffect, useMemo, useRef, useState } from "react";
import { type ResumeData } from "../data/resumeData";

type ResumeChatbotProps = {
  resume: ResumeData;
};

type ChatMode = "strict" | "relaxed";
type MessageRole = "bot" | "user";

type BotMessagePayload = {
  label: "Yes" | "No" | "Partial";
  summary: string;
  evidence: string[];
  details: string[];
  sources: string[];
  fallbackTips?: string[];
};

type ChatMessage = {
  id: string;
  role: MessageRole;
  text?: string;
  payload?: BotMessagePayload;
};

type SkillMention = {
  skill: string;
  aliases: string[];
};

const STARTER_QUESTION = "Summarize your backend experience";

const QUICK_SUGGESTIONS = [
  "Summarize your backend experience",
  "What projects use Java?",
  "What's your ML stack?",
  "Education",
  "Leadership",
];

const ALIAS_LOOKUP: Record<string, string[]> = {
  java: ["java", "spring boot", "jvm", "backend in java"],
  typescript: ["typescript", "type script", "ts"],
  javascript: ["javascript", "js"],
  machinelearning: ["ml", "machine learning", "ai", "modeling"],
  backend: ["backend", "api", "apis", "rest", "server"],
  projects: ["project", "projects", "build", "built"],
  education: ["education", "mcgill", "degree", "university"],
  leadership: ["leadership", "president", "club", "digi"],
  certifications: ["certification", "certifications", "achievement", "prologin"],
  experience: ["experience", "intern", "internship", "mytower", "work"],
};

function normalize(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9\s.+#-]/g, " ").replace(/\s+/g, " ").trim();
}

function includesAny(query: string, values: string[]) {
  return values.some((value) => query.includes(normalize(value)));
}

function unique(values: string[]) {
  return Array.from(new Set(values));
}

function buildSkillMentions(resume: ResumeData): SkillMention[] {
  const skills = Object.values(resume.skills).flat();
  return skills.map((skill) => {
    const key = normalize(skill);
    const extraAliases = ALIAS_LOOKUP[key.replace(/\s+/g, "")] ?? [];
    return { skill, aliases: unique([skill, ...extraAliases]) };
  });
}

function buildNoResultPayload(term: string, mode: ChatMode): BotMessagePayload {
  const modeText = mode === "strict" ? "Strict mode" : "Relaxed mode";
  return {
    label: "No",
    summary: `I couldn't find "${term}" in the resume data I'm allowed to use.`,
    evidence: [`${modeText}: no matching skill, project, experience, education, certification, or leadership entity.`],
    details: [],
    sources: ["Resume dataset"],
    fallbackTips: [
      "Try asking: Which languages are on your resume?",
      "Try asking: Summarize your backend experience",
      "Try clicking a suggestion chip below",
    ],
  };
}

function buildEducationPayload(resume: ResumeData): BotMessagePayload {
  return {
    label: "Yes",
    summary: "Education is clearly listed.",
    evidence: [
      `${resume.education.institution} — ${resume.education.degree}`,
      `Period: ${resume.education.period}`,
    ],
    details: [`Core pillars: ${resume.education.pillars.join(", ")}`],
    sources: ["Education section"],
  };
}

function buildLeadershipPayload(resume: ResumeData): BotMessagePayload {
  const lead = resume.leadership[0];
  return {
    label: "Yes",
    summary: "Leadership experience is listed.",
    evidence: [`${lead.title}, ${lead.organization}`],
    details: [lead.summary],
    sources: ["Leadership section"],
  };
}

function buildCertPayload(resume: ResumeData): BotMessagePayload {
  return {
    label: "Yes",
    summary: "Certifications and achievements are listed.",
    evidence: resume.certifications.map((item) => item),
    details: [],
    sources: ["Certifications section"],
  };
}

function buildMlPayload(resume: ResumeData): BotMessagePayload {
  const mlProjects = resume.projects.filter((project) =>
    project.skillsUsed.some((skill) =>
      includesAny(normalize(skill), ["python", "numpy", "pandas", "matplotlib", "sqlite", "n8n"])
    )
  );
  return {
    label: "Yes",
    summary: "Machine learning and AI work is present.",
    evidence: [
      "Coursework includes Machine Learning at McGill.",
      ...mlProjects.map((project) => `${project.title} — ${project.impact}`),
    ],
    details: [
      `ML/Data tools in skills: ${["Python", "NumPy", "Pandas", "Matplotlib", "SQLite", "n8n"].filter((skill) =>
        Object.values(resume.skills).flat().includes(skill)
      ).join(", ")}`,
    ],
    sources: ["Education section", "Projects section", "Skills section"],
  };
}

function buildBackendPayload(resume: ResumeData): BotMessagePayload {
  const myTower = resume.experience[0];
  return {
    label: "Yes",
    summary: "Backend experience is listed.",
    evidence: [
      `${myTower.company} (${myTower.role})`,
      "Built service endpoints and API-oriented workflows in logistics context.",
    ],
    details: [
      `Stack evidence: ${myTower.skillsUsed.join(", ")}`,
      `Systems context: ${myTower.systems.join(", ")}`,
    ],
    sources: ["Experience section", "Skills section"],
  };
}

function buildSkillPayload(
  resume: ResumeData,
  query: string,
  mode: ChatMode,
  mentions: SkillMention[]
): BotMessagePayload {
  const normalized = normalize(query);
  const matched = mentions.find((mention) =>
    mention.aliases.some((alias) => normalized.includes(normalize(alias)))
  );

  if (!matched) {
    return buildNoResultPayload(query, mode);
  }

  const projects = resume.projects.filter((project) => project.skillsUsed.includes(matched.skill));
  const roles = resume.experience.filter((experience) => experience.skillsUsed.includes(matched.skill));

  const exists = projects.length > 0 || roles.length > 0 || Object.values(resume.skills).flat().includes(matched.skill);
  if (!exists && mode === "strict") {
    return buildNoResultPayload(matched.skill, mode);
  }

  if (!exists) {
    return {
      label: "Partial",
      summary: `${matched.skill} is not explicit, but related backend stack is present.`,
      evidence: resume.experience.map((experience) => `${experience.company} — ${experience.skillsUsed.join(", ")}`),
      details: ["Relaxed mode inferred this from adjacent technologies and role context."],
      sources: ["Experience section", "Skills section"],
    };
  }

  const evidence: string[] = [];
  if (roles.length) {
    evidence.push(...roles.map((role) => `${role.company} (${role.role}) — ${role.skillsUsed.join(", ")}`));
  }
  if (projects.length) {
    evidence.push(...projects.map((project) => `${project.title} — ${project.approach}`));
  }
  if (!roles.length && !projects.length) {
    evidence.push(`${matched.skill} appears in skills list.`);
  }

  return {
    label: "Yes",
    summary: `${matched.skill} is included in the resume.`,
    evidence,
    details: [
      roles.length
        ? `Role outcomes: ${roles.map((role) => role.summary).join(" | ")}`
        : "No specific role summary tied to this skill.",
    ],
    sources: ["Skills section", ...(roles.length ? ["Experience section"] : []), ...(projects.length ? ["Projects section"] : [])],
  };
}

function buildProjectsPayload(resume: ResumeData, query: string): BotMessagePayload {
  const normalized = normalize(query);
  const skillMentions = buildSkillMentions(resume);
  const matched = skillMentions.find((mention) =>
    mention.aliases.some((alias) => normalized.includes(normalize(alias)))
  );

  if (matched) {
    const projects = resume.projects.filter((project) => project.skillsUsed.includes(matched.skill));
    if (!projects.length) {
      return {
        label: "Partial",
        summary: `No project explicitly lists ${matched.skill}.`,
        evidence: resume.experience
          .filter((experience) => experience.skillsUsed.includes(matched.skill))
          .map((experience) => `${experience.company} (${experience.role}) uses ${matched.skill}`),
        details: ["This technology appears in work experience rather than project entries."],
        sources: ["Experience section", "Projects section"],
      };
    }
    return {
      label: "Yes",
      summary: `Projects using ${matched.skill} were found.`,
      evidence: projects.map((project) => `${project.title} — ${project.impact}`),
      details: projects.map((project) => `Built with: ${project.skillsUsed.join(", ")}`),
      sources: ["Projects section"],
    };
  }

  return {
    label: "Yes",
    summary: "Projects are listed in the resume.",
    evidence: resume.projects.map((project) => `${project.title} — ${project.problem}`),
    details: resume.projects.map((project) => `Impact: ${project.impact}`),
    sources: ["Projects section"],
  };
}

function buildLanguagesPayload(resume: ResumeData): BotMessagePayload {
  return {
    label: "Yes",
    summary: "Both programming and spoken languages are listed.",
    evidence: [
      `Programming: ${resume.skills.Programming.join(", ")}`,
      `Spoken: ${resume.skills.Languages.join(", ")}`,
    ],
    details: [],
    sources: ["Skills section"],
  };
}

function buildPayload(resume: ResumeData, question: string, mode: ChatMode): BotMessagePayload {
  const q = normalize(question);
  const mentions = buildSkillMentions(resume);

  if (!q) {
    return buildNoResultPayload("empty question", mode);
  }
  if (includesAny(q, ["hello", "hi", "hey"])) {
    return {
      label: "Yes",
      summary: "Ready. Ask about experience, projects, skills, education, certifications, or leadership.",
      evidence: ["I only answer from resume-backed data."],
      details: [`Current mode: ${mode === "strict" ? "Strict" : "Relaxed"}`],
      sources: ["Resume dataset"],
    };
  }
  if (includesAny(q, ALIAS_LOOKUP.education)) return buildEducationPayload(resume);
  if (includesAny(q, ALIAS_LOOKUP.leadership)) return buildLeadershipPayload(resume);
  if (includesAny(q, ALIAS_LOOKUP.certifications)) return buildCertPayload(resume);
  if (includesAny(q, ["language", "languages"])) return buildLanguagesPayload(resume);
  if (includesAny(q, ALIAS_LOOKUP.machinelearning)) return buildMlPayload(resume);
  if (includesAny(q, ALIAS_LOOKUP.backend)) return buildBackendPayload(resume);
  if (includesAny(q, ALIAS_LOOKUP.projects)) return buildProjectsPayload(resume, question);
  if (includesAny(q, ALIAS_LOOKUP.experience)) return buildBackendPayload(resume);

  return buildSkillPayload(resume, question, mode, mentions);
}

function ResumeChatbot({ resume }: ResumeChatbotProps) {
  const [mode, setMode] = useState<ChatMode>("strict");
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [streamingMessageId, setStreamingMessageId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "bot",
      payload: {
        label: "Yes",
        summary: "Resume Chatbot is ready in Strict mode.",
        evidence: [
          "Ask direct questions about skills, projects, education, experience, certifications, and leadership.",
        ],
        details: ["Use chips for quick prompts or type your own question."],
        sources: ["Resume dataset"],
      },
    },
  ]);

  const listRef = useRef<HTMLDivElement | null>(null);

  const quickSuggestions = useMemo(() => QUICK_SUGGESTIONS, []);

  useEffect(() => {
    if (!listRef.current) return;
    listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages, isTyping]);

  const runBotResponse = (question: string) => {
    const payload = buildPayload(resume, question, mode);
    const messageId = `bot-${Date.now()}`;

    setIsTyping(true);
    const typingDelay = 300 + Math.floor(Math.random() * 500);

    window.setTimeout(() => {
      setIsTyping(false);
      const hiddenPayload: BotMessagePayload = { ...payload, summary: "" };
      setMessages((current) => [...current, { id: messageId, role: "bot", payload: hiddenPayload }]);
      setStreamingMessageId(messageId);

      let index = 0;
      const full = payload.summary;
      const interval = window.setInterval(() => {
        index += 1;
        const nextSummary = full.slice(0, index);
        setMessages((current) =>
          current.map((message) => {
            if (message.id !== messageId || !message.payload) return message;
            return { ...message, payload: { ...payload, summary: nextSummary } };
          })
        );

        if (index >= full.length) {
          window.clearInterval(interval);
          setStreamingMessageId((current) => (current === messageId ? null : current));
        }
      }, 14);
    }, typingDelay);
  };

  const submitQuestion = (question: string) => {
    const clean = question.trim();
    if (!clean) return;
    setMessages((current) => [...current, { id: `user-${Date.now()}`, role: "user", text: clean }]);
    setInput("");
    runBotResponse(clean);
  };

  const onSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    submitQuestion(input);
  };

  return (
    <div className="chatbot-card chatbot-shell" data-reveal>
      <div className="chatbot-topbar">
        <div className="chatbot-topbar-meta">
          <span className="chatbot-avatar" aria-hidden="true">
            AR
          </span>
          <div>
            <p className="chatbot-title">Resume Chatbot</p>
            <p className="chatbot-subtitle">Resume Bot • {mode === "strict" ? "Strict mode" : "Relaxed mode"}</p>
          </div>
        </div>
        <div className="mode-toggle" role="group" aria-label="Response mode">
          <button
            type="button"
            className={mode === "strict" ? "mode-btn is-active" : "mode-btn"}
            onClick={() => setMode("strict")}
          >
            Strict
          </button>
          <button
            type="button"
            className={mode === "relaxed" ? "mode-btn is-active" : "mode-btn"}
            onClick={() => setMode("relaxed")}
          >
            Relaxed
          </button>
        </div>
      </div>

      <div className="chat-window" ref={listRef}>
        {messages.map((message) => {
          if (message.role === "user") {
            return (
              <div key={message.id} className="chat-row chat-row-user">
                <div className="chat-bubble chat-bubble-user">
                  <p>{message.text}</p>
                </div>
              </div>
            );
          }

          const payload = message.payload;
          if (!payload) return null;
          const isStreaming = streamingMessageId === message.id;
          return (
            <div key={message.id} className="chat-row chat-row-bot">
              <span className="chat-avatar-mini" aria-hidden="true">
                AR
              </span>
              <div className="chat-bubble chat-bubble-bot">
                <p className="bot-label">
                  {payload.label} - <span>{payload.summary || " "}</span>
                </p>
                <ul className="bot-points">
                  {payload.evidence.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
                {payload.details.length > 0 && (
                  <ul className="bot-details">
                    {payload.details.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                )}
                {payload.fallbackTips && payload.fallbackTips.length > 0 && (
                  <ul className="bot-fallback">
                    {payload.fallbackTips.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                )}
                {!isStreaming && (
                  <details className="bot-sources">
                    <summary>Sources</summary>
                    <ul>
                      {payload.sources.map((source) => (
                        <li key={source}>{source}</li>
                      ))}
                    </ul>
                  </details>
                )}
              </div>
            </div>
          );
        })}

        {isTyping && (
          <div className="chat-row chat-row-bot">
            <span className="chat-avatar-mini" aria-hidden="true">
              AR
            </span>
            <div className="chat-bubble chat-bubble-bot typing-bubble" aria-live="polite">
              <span>Thinking</span>
              <span className="typing-dots" aria-hidden="true">
                <i />
                <i />
                <i />
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="chat-suggestions" aria-label="Suggested questions">
        {quickSuggestions.map((suggestion) => (
          <button key={suggestion} type="button" className="chat-chip" onClick={() => submitQuestion(suggestion)}>
            {suggestion}
          </button>
        ))}
      </div>

      <form className="chatbot-composer" onSubmit={onSubmit}>
        <label htmlFor="resume-chat">Ask a resume question</label>
        <textarea
          id="resume-chat"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              submitQuestion(input);
            }
          }}
          rows={2}
          placeholder={STARTER_QUESTION}
        />
        <button type="submit" className="btn btn-primary">
          Send
        </button>
      </form>
    </div>
  );
}

export default ResumeChatbot;
