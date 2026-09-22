import logo from "../assets/pi-logo.png";

export function PiLogo({ className }: { className?: string }) {
  return <img alt="Pi Logo" className={className} src={logo} />;
}
