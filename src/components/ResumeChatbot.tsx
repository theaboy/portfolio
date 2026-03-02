import { useMemo, useState } from "react";
import { type ResumeData } from "../data/resumeData";
import { getStrictChatFacts } from "../data/resumeSelectors";

type ResumeChatbotProps = {
  resume: ResumeData;
};

function normalize(text: string) {
  return text.toLowerCase();
}

function ResumeChatbot({ resume }: ResumeChatbotProps) {
  const [input, setInput] = useState("");
  const [answer, setAnswer] = useState(
    "Ask about education, projects, experience, certifications, or leadership from the resume."
  );

  const facts = useMemo(() => getStrictChatFacts(), []);

  const respond = (question: string) => {
    const q = normalize(question);

    if (q.includes("ml") || q.includes("machine learning")) {
      return `Yes.\n- ${facts.mlAnswer.join("\n- ")}`;
    }

    if (q.includes("mytower") || q.includes("intern")) {
      const myTower = resume.experience[0];
      return `${myTower.company} (${myTower.role})\n- ${myTower.systems.join("\n- ")}`;
    }

    if (q.includes("education") || q.includes("mcgill")) {
      return `${resume.education.institution}\n- ${resume.education.degree}\n- Core pillars: ${resume.education.pillars.join(", ")}`;
    }

    if (q.includes("leadership") || q.includes("digi")) {
      const leader = resume.leadership[0];
      return `${leader.organization}\n- ${leader.title}\n- ${leader.summary}`;
    }

    if (q.includes("cert") || q.includes("prologin")) {
      return `Certifications/Achievements\n- ${resume.certifications.join("\n- ")}`;
    }

    if (q.includes("project") || q.includes("ai medical") || q.includes("bike") || q.includes("microsys")) {
      return resume.projects
        .map(
          (project) =>
            `${project.title}\n- Problem: ${project.problem}\n- Approach: ${project.approach}\n- Impact: ${project.impact}`
        )
        .join("\n\n");
    }

    const mentionsKnownTopic = facts.resumeOnlyTopics.some((topic) => q.includes(normalize(topic)));
    if (mentionsKnownTopic) {
      return "That topic is listed in the current resume. Ask for a specific section and I will answer from it.";
    }

    return "I do not have that listed in my current resume.";
  };

  const onSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const question = input.trim();
    if (!question) return;
    setAnswer(respond(question));
    setInput("");
  };

  return (
    <div className="chatbot-card" data-reveal>
      <p className="eyebrow">Resume-aware chatbot (strict mode)</p>
      <p className="chatbot-answer">{answer}</p>
      <form className="chatbot-form" onSubmit={onSubmit}>
        <label htmlFor="resume-chat">Ask a resume question</label>
        <input
          id="resume-chat"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="Example: Do you have ML experience?"
        />
        <button type="submit" className="btn btn-primary">
          Ask
        </button>
      </form>
    </div>
  );
}

export default ResumeChatbot;
