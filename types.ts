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
