import type { ThemeConfig } from "antd";

/** 偏纸面和谈话，而不是后台管理系统。 */
export const theme: ThemeConfig = {
  token: {
    colorPrimary: "#1e5c4e",
    colorInfo: "#1e5c4e",
    colorLink: "#1e5c4e",
    colorText: "#1d2a26",
    colorTextSecondary: "#5d6d66",
    colorBgLayout: "#efe6d6",
    colorBgContainer: "#fffdf8",
    colorBorder: "#e4d8c6",
    borderRadius: 16,
    fontFamily:
      '"Avenir Next", "PingFang SC", "Hiragino Sans GB", "Noto Sans SC", "Microsoft YaHei", sans-serif',
    boxShadow: "0 16px 40px rgba(70, 48, 22, 0.08)",
    controlHeight: 40,
  },
  components: {
    Button: {
      primaryShadow: "none",
      defaultShadow: "none",
      fontWeight: 600,
    },
    Card: {
      headerBg: "transparent",
    },
    Tag: {
      defaultBg: "#f4e7d8",
      defaultColor: "#7a4630",
    },
  },
};
