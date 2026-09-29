import { Button, Card, Tag, Tooltip } from "antd";
import type { ToolDetails, ToolStep } from "../types";

const TYPE_LABEL = {
  experience: "经历",
  project: "项目",
  skill: "技能",
  education: "教育",
} as const;

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
        {details.items.length ? (
          <div className="citation-row">
            {details.items.map((item, index) => (
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
                <Tag className="citation-tag">
                  引用{index + 1} · {TYPE_LABEL[item.type]}
                </Tag>
              </Tooltip>
            ))}
          </div>
        ) : null}
        {projects.map((project) => (
          <Card key={project.id} className="project-card" size="small">
            <div className="project-card-top">
              <div>
                <h3>{project.title}</h3>
                <p>{project.period || "时间未写"}</p>
              </div>
              <Button type="link" onClick={() => onOpenProject(project.id)}>
                查看详情
              </Button>
            </div>
            <div className="skill-row">
              {project.tech_stack.map((tech) => (
                <Tag key={tech}>{tech}</Tag>
              ))}
            </div>
          </Card>
        ))}
      </>
    );
  }
  if (details.kind === "project") {
    return (
      <Card className="project-card" size="small">
        <div className="project-card-top">
          <div>
            <h3>{details.title}</h3>
            <p>{details.period || "时间未写"}</p>
          </div>
          <Button type="link" onClick={() => onOpenProject(details.id)}>
            查看详情
          </Button>
        </div>
        <div className="skill-row">
          {details.tech_stack.map((tech) => (
            <Tag key={tech}>{tech}</Tag>
          ))}
        </div>
      </Card>
    );
  }
  if (details.kind === "download") {
    return (
      <Button type="primary" href={details.url}>
        下载简历
      </Button>
    );
  }
  if (details.kind === "contact") {
    return (
      <Card className="contact-card" size="small" title="联系方式">
        <ul className="contact-list">
          {details.email ? (
            <li>
              <span>邮箱</span>
              <strong>{details.email}</strong>
            </li>
          ) : null}
          {details.phone ? (
            <li>
              <span>电话</span>
              <strong>{details.phone}</strong>
            </li>
          ) : null}
          {details.github ? (
            <li>
              <span>GitHub</span>
              <a href={details.github} target="_blank" rel="noreferrer">
                {details.github}
              </a>
            </li>
          ) : null}
          {details.website ? (
            <li>
              <span>网站</span>
              <a href={details.website} target="_blank" rel="noreferrer">
                {details.website}
              </a>
            </li>
          ) : null}
        </ul>
      </Card>
    );
  }
  return null;
}
