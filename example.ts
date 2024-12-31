import { createDirectus, rest, readItems } from "@directus/sdk";

// Minimal collections type to demonstrate the relation type expansion issue
export type ApiCollections = {
  events: Event[];
  users: User[];
  registrations: Registration[];
  prices: Price[];
};

export type User = {
  id: string;
  email?: string;
};

export type Price = {
  id: string;
  amount?: number;
};

export type Registration = {
  id: string;
  status: string;
  user?: string | User;
};

export type Event = {
  id: string;
  title?: string;
  user_created?: string | User; // root level relation
  registrations?: string[] | Registration[];
};

const directus = createDirectus<ApiCollections>("https://localhost:8050").with(
  rest(),
);

const query_with_deep_or = directus.request(
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

const query = directus.request(
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
