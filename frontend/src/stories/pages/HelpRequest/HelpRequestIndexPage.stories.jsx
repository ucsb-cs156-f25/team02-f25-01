import React from "react";
import HelpRequestIndexPage from "main/pages/HelpRequest/HelpRequestIndexPage.jsx";
import { rest } from "msw";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router";
import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";

const queryClient = new QueryClient();

const Template = () => (
  <QueryClientProvider client={queryClient}>
    <MemoryRouter>
      <HelpRequestIndexPage />
    </MemoryRouter>
  </QueryClientProvider>
);

const sample = [
  {
    id: 1,
    requesterEmail: "alice@ucsb.edu",
    teamId: "t01",
    tableOrBreakoutRoom: "Table 3",
    requestTime: "2025-11-01T10:00:00",
    explanation: "Stuck on fixtures",
    solved: false
  },
  {
    id: 2,
    requesterEmail: "bob@ucsb.edu",
    teamId: "t02",
    tableOrBreakoutRoom: "BR-7",
    requestTime: "2025-11-01T11:15:00",
    explanation: "Swagger confusion",
    solved: true
  }
];

export default {
  title: "pages/HelpRequest/HelpRequestIndexPage",
  component: HelpRequestIndexPage
};

export const LoggedOut = Template.bind({});
LoggedOut.parameters = {
  msw: [
    rest.get("/api/currentUser", (_req, res, ctx) => res(ctx.json({ user: null }))),
    rest.get("/api/systemInfo", (_req, res, ctx) => res(ctx.json(systemInfoFixtures.showingNeither))),
    rest.get("/api/helprequest/all", (_req, res, ctx) => res(ctx.json(sample)))
  ]
};

export const User = Template.bind({});
User.parameters = {
  msw: [
    rest.get("/api/currentUser", (_req, res, ctx) => res(ctx.json(apiCurrentUserFixtures.userOnly))),
    rest.get("/api/systemInfo", (_req, res, ctx) => res(ctx.json(systemInfoFixtures.showingNeither))),
    rest.get("/api/helprequest/all", (_req, res, ctx) => res(ctx.json(sample)))
  ]
};

export const Admin = Template.bind({});
Admin.parameters = {
  msw: [
    rest.get("/api/currentUser", (_req, res, ctx) => res(ctx.json(apiCurrentUserFixtures.adminUser))),
    rest.get("/api/systemInfo", (_req, res, ctx) => res(ctx.json(systemInfoFixtures.showingNeither))),
    rest.get("/api/helprequest/all", (_req, res, ctx) => res(ctx.json(sample)))
  ]
};