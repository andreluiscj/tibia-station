import { createFileRoute } from "@tanstack/react-router";
import { TibiaSetBuilder } from "@/components/tibia/TibiaSetBuilder";

export const Route = createFileRoute("/set-builder")({
  head: () => ({
    meta: [
      { title: "Set Builder | Tibia Station" },
      {
        name: "description",
        content:
          "Monte o melhor set de equipamentos de Tibia por vocação, nível e proteção elemental.",
      },
    ],
  }),
  component: TibiaSetBuilder,
});
