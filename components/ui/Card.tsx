type CardProps = React.HTMLAttributes<HTMLDivElement> & {
  children: React.ReactNode;
  className?: string;
};

export default function Card({ children, className, ...props }: CardProps) {
  const classes = [
    "bg-surface border border-border rounded-lg shadow-sm",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={classes} {...props}>
      {children}
    </div>
  );
}
