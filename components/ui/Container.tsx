type ContainerProps = {
  children: React.ReactNode;
  className?: string;
};

export default function Container({
  children,
  className = "py-16",
}: ContainerProps) {
  const classes = [
    "min-h-screen bg-background flex flex-col items-center px-4",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return <main className={classes}>{children}</main>;
}
