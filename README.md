# Deep filters with `_or`/`_and` cause unexpected type expansion across all related fields

I tried to find if this had been reported but didn't see anything that quite matched. This isn't a huge issue but it does create a need for a lot of extra type guards. When using deep filters with `_or` or `_and` operators, the type system is expanding all relation types in unexpected ways.

## Description

When applying a deep filter with `_or` or `_and` operators to a query, all related types in the response are expanded to their full object representations, even for unrelated fields at the root level.

## Minimal Reproduction

```typescript
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
```

## Current Behavior

With deep filter using `_or`:

```typescript
const query_with_deep_or: Promise<{
    registrations: Registration[] | string[] | {
        id: string;
        status: string;
        user: string | User | {
            id: string;
            email: string | undefined;
        } | undefined;
    }[] | null | undefined;
    id: string;
    title: string | undefined;
    user_created: string | ... 2 more ... | undefined;
}[]>
```

Without deep filter:

```typescript
const query: Promise<
  {
    registrations:
      | {
          id: string;
          status: string;
          user: string | User | undefined;
        }[]
      | null;
    id: string;
    title: string | undefined;
    user_created: {
      id: string;
      email: string | undefined;
    };
  }[]
>;
```

## Expected Behavior

Deep filters with `_or`/`_and` operators should only affect the typing of fields within the filtered relation. Root-level relations like `user_created` should maintain their simple union type structure.

## Impact

Creates unnecessarily complex TypeScript types when using deep filters with logical operators, affecting IDE performance and code readability.
