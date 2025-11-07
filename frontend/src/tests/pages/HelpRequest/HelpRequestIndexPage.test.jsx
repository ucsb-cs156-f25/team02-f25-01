import { render, screen } from "@testing-library/react";
import HelpRequestIndexPage from "main/pages/HelpRequest/HelpRequestIndexPage";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router";
import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";
import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";

describe("HelpRequestIndexPage tests", () => {
  const axiosMock = new AxiosMockAdapter(axios);
  const queryClient = new QueryClient();

  const setupUserOnly = () => {
    axiosMock.reset();
    axiosMock.resetHistory();
    axiosMock.onGet("/api/currentUser").reply(200, apiCurrentUserFixtures.userOnly);
    axiosMock.onGet("/api/systemInfo").reply(200, systemInfoFixtures.showingNeither);
  };

  test("Renders expected content and links", async () => {
    setupUserOnly();

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <HelpRequestIndexPage />
        </MemoryRouter>
      </QueryClientProvider>
    );

    await screen.findByText("Index page not yet implemented");
    expect(screen.getByTestId("HelpRequestIndexPage")).toBeInTheDocument();
    expect(screen.getByText("Create")).toBeInTheDocument();
    expect(screen.getByText("Edit")).toBeInTheDocument();
  });
});