import { DownloadOutlined, MailOutlined } from "@ant-design/icons";
import { Avatar, Button, Card, Modal, Tag } from "antd";
import { useState } from "react";
import type { Profile } from "../types";

export function ProfileCard({ profile, narrow }: { profile: Profile; narrow: boolean }) {
  const [skillsOpen, setSkillsOpen] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);
  const showSkills = !narrow || skillsOpen;

  return (
    <Card className="profile-card" variant="borderless">
      <div className="profile-row">
        <Avatar className="profile-avatar" src={profile.avatar} size={narrow ? 40 : 64}>
          {profile.name.slice(-1)}
        </Avatar>
        <div className="profile-copy">
          <div className="profile-name-line">
            <h1>{profile.name}</h1>
            {profile.example ? <Tag className="example-tag">示例数据</Tag> : null}
          </div>
          <p className="profile-headline">{profile.headline}</p>
        </div>
        <div className="profile-actions">
          {narrow ? (
            <Button className="skills-toggle" onClick={() => setSkillsOpen((open) => !open)}>
              {skillsOpen ? "收起" : "技能"}
            </Button>
          ) : null}
          <Button icon={<DownloadOutlined />} href={profile.resumePdf}>
            下载简历
          </Button>
          <Button icon={<MailOutlined />} onClick={() => setContactOpen(true)}>
            联系我
          </Button>
        </div>
      </div>
      {showSkills ? (
        <div className="skill-row">
          {profile.skills.map((skill) => (
            <Tag key={skill}>{skill}</Tag>
          ))}
        </div>
      ) : null}
      <Modal
        title={`联系${profile.name}`}
        open={contactOpen}
        footer={null}
        onCancel={() => setContactOpen(false)}
      >
        <ContactList contact={profile.contact} />
      </Modal>
    </Card>
  );
}

export function ContactList({
  contact,
}: {
  contact: Profile["contact"];
}) {
  const rows = [
    ["邮箱", contact.email],
    ["电话", contact.phone],
    ["GitHub", contact.github],
    ["网站", contact.website],
  ].filter((row) => row[1]);
  if (!rows.length) return <p>简历里没有留下联系方式。</p>;
  return (
    <ul className="contact-list">
      {rows.map(([label, value]) => (
        <li key={label}>
          <span>{label}</span>
          {value?.startsWith("http") ? (
            <a href={value} target="_blank" rel="noreferrer">
              {value}
            </a>
          ) : (
            <strong>{value}</strong>
          )}
        </li>
      ))}
    </ul>
  );
}
