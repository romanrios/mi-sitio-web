import { site } from "@/content/site";

export default function Footer() {
  return (
    <footer className="w-full bg-hero-bg border-t border-border/40 py-8 text-center text-xs text-muted-faint">
      {site.name}
    </footer>
  );
}
