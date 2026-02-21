import AppShell from "@/components/AppShell";

export default function PlansLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppShell>{children}</AppShell>;
}
