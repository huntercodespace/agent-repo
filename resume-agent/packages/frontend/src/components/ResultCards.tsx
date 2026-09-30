import { ArrowRightOutlined, DownloadOutlined } from "@ant-design/icons";
import { Tooltip } from "antd";
import type { ToolDetails, ToolStep } from "../types";
import { ContactList } from "./ProfileViews";

const TYPE_LABEL = {
  experience: "经历",
  project: "项目",
  skill: "技能",
  education: "教育",
} as const;

export function CitationMarks({ tools }: { tools: ToolStep[] }) {
  const items = tools.flatMap((step) => (step.details?.kind === "search" ? step.details.items : []));
  if (!items.length) return null;
  return (
    <>
      {items.map((item, index) => (
        <Tooltip
          key={item.id}
          title={
            <span>
              <strong>{item.title}</strong>
              <br />
              {item.snippet}
            </span>
          }
        >
          <sup className="cite-chip">
            {index + 1} · {TYPE_LABEL[item.type]}
          </sup>
        </Tooltip>
      ))}
    </>
  );
}

export function ResultCards({
  tools,
  onOpenProject,
}: {
  tools: ToolStep[];
  onOpenProject: (id: string) => void;
}) {
  const details = tools.map((step) => step.details).filter((item): item is ToolDetails => Boolean(item));
  if (!details.length) return null;
  return (
    <div className="result-stack">
      {details.map((item, index) => (
        <ResultBlock key={`${item.kind}-${index}`} details={item} onOpenProject={onOpenProject} />
      ))}
    </div>
  );
}

function ResultBlock({
  details,
  onOpenProject,
}: {
  details: ToolDetails;
  onOpenProject: (id: string) => void;
}) {
  if (details.kind === "search") {
    const projects = details.items.filter((item) => item.type === "project");
    return (
      <>
        {projects.map((project) => (
          <button key={project.id} type="button" className="project-card" onClick={() => onOpenProject(project.id)}>
            <span className="project-card-copy">
              <span className="project-card-title">
                <strong>{project.title}</strong>
                {project.period ? <em>{project.period}</em> : null}
              </span>
              <span className="skill-row">
                {project.tech_stack.map((tech) => (
                  <span key={tech} className="plain-chip">
                    {tech}
                  </span>
                ))}
              </span>
            </span>
            <span className="detail-link">
              查看详情
              <ArrowRightOutlined />
            </span>
          </button>
        ))}
      </>
    );
  }
  if (details.kind === "project") {
    return (
      <button type="button" className="project-card" onClick={() => onOpenProject(details.id)}>
        <span className="project-card-copy">
          <span className="project-card-title">
            <strong>{details.title}</strong>
            {details.period ? <em>{details.period}</em> : null}
          </span>
        </span>
        <span className="detail-link">
          查看详情
          <ArrowRightOutlined />
        </span>
      </button>
    );
  }
  if (details.kind === "download") {
    return (
      <a className="file-card" href={details.url}>
        <span className="file-card-copy">
          <strong>{details.filename}</strong>
          <span>PDF</span>
        </span>
        <span className="detail-link">
          下载简历
          <DownloadOutlined />
        </span>
      </a>
    );
  }
  if (details.kind === "contact") {
    return (
      <div className="contact-card">
        <strong>联系方式</strong>
        <ContactList contact={details} />
      </div>
    );
  }
  if (details.kind === "project_missing") {
    return <p className="muted">没有找到这个项目。</p>;
  }
  return null;
}
