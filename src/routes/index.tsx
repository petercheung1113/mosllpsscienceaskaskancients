import { createFileRoute } from "@tanstack/react-router";
import { CampApp } from "@/components/camp-app";

export const Route = createFileRoute("/")({
  component: CampApp,
});
