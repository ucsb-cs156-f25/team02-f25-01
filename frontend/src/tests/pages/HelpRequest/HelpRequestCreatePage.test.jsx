import { render, screen } from "@testing-library/react";
import HelpRequestCreatePage from "main/pages/HelpRequest/HelpRequestCreatePage";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router";
import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";
import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";

describe("HelpRequestCreatePage tests", () => {
  const axiosMock = new AxiosMockAdapter(axios);
  const queryClient = new QueryClient();

  const setupUserOnly = () => {
    axiosMock.reset();
    axiosMock.resetHistory();
    axiosMock.onGet("/api/currentUser").reply(200, apiCurrentUserFixtures.userOnly);
    axiosMock.onGet("/api/systemInfo").reply(200, systemInfoFixtures.showingNeither);
  };

  test("Renders expected content", async () => {
    setupUserOnly();
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <HelpRequestCreatePage />
        </MemoryRouter>
      </QueryClientProvider>
    );

    await screen.findByText("Create page not yet implemented");
    expect(screen.getByTestId("HelpRequestCreatePage")).toBeInTheDocument();
  });
});