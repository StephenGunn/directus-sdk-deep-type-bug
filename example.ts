import type { ApiCollections } from "./types";
import { createDirectus, rest, readItems } from "@directus/sdk";

const directus = createDirectus<ApiCollections>("https://localhost:8050").with(
  rest(),
);

const no_top_level_await = async () => {
  const query_with_deep_or = await directus.request(
    readItems("events", {
      fields: [
        "id",
        "title",
        "registrations",
        "user_created", // root level relation
        { registrations: ["status"] },
        { user_created: ["id", "email"] },
      ],
      deep: {
        registrations: {
          _filter: {
            _or: [
              {
                status: { _eq: "completed" },
              },
              { status: { _eq: "pending" } },
            ],
          },
        },
      },
    }),
  );

  const query = await directus.request(
    readItems("events", {
      fields: [
        "id",
        "title",
        "registrations",
        "user_created", // root level relation
        { registrations: ["status"] },
        { user_created: ["id", "email"] },
      ],
    }),
  );

  // remove errors
  console.log(query, query_with_deep_or);
};

no_top_level_await();
