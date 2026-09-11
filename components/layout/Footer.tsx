import { site } from "@/content/site";

export default function Footer() {
  return (
    <footer className="w-full max-w-md mt-16 text-center text-xs text-muted-faint">
      {site.name}
    </footer>
  );
}
