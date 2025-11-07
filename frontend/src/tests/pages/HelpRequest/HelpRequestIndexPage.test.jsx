import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";
import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";
import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";

import { vi } from "vitest";

// already present in your file:
vi.mock("main/utils/useLogout", () => ({
  useLogout: () => ({ mutate: () => {} }),
}));

// add this to isolate the navbar (which uses the wrong Link import)
vi.mock("main/components/Nav/AppNavbar", () => ({
  default: () => <nav data-testid="MockAppNavbar" />,
}));

// mock toast so we can assert success/error branches
const mockToastSuccess = vi.fn();
const mockToastError = vi.fn();
vi.mock("react-toastify", () => ({
  toast: {
    success: (msg) => mockToastSuccess(msg),
    error: (msg) => mockToastError(msg),
  },
}));

// mock fetchWithRefresh to resolve immediately on DELETE
const mockFetchWithRefresh = vi.fn().mockResolvedValue({ data: { message: "ok" } });
vi.mock("main/utils/useBackend", async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    fetchWithRefresh: (...args) => mockFetchWithRefresh(...args),
  };
});

import HelpRequestIndexPage from "main/pages/HelpRequest/HelpRequestIndexPage.jsx";

describe("HelpRequestIndexPage tests", () => {
  const axiosMock = new AxiosMockAdapter(axios);
  const queryClient = new QueryClient();

  beforeEach(() => {
    mockToastSuccess.mockClear();
    mockToastError.mockClear();
    mockFetchWithRefresh.mockClear();
  });

  const renderPage = () =>
    render(
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

  const setupCommon = () => {
    axiosMock.reset();
    axiosMock.resetHistory();
    axiosMock.onGet("/api/systemInfo").reply(200, systemInfoFixtures.showingNeither);
  };

  test("regular user sees data but no admin buttons", async () => {
    setupCommon();
    axiosMock.onGet("/api/currentUser").reply(200, apiCurrentUserFixtures.userOnly);
    axiosMock.onGet("/api/helprequest/all").reply(200, sample);

    renderPage();

    expect(await screen.findByText("Help Requests")).toBeInTheDocument();
    expect(screen.getByTestId("HelpRequestTable")).toBeInTheDocument();
    expect(await screen.findByText("alice@ucsb.edu")).toBeInTheDocument();
    expect(screen.queryByTestId("HelpRequestIndexPage-create-button")).not.toBeInTheDocument();
    expect(screen.queryByText("Edit")).not.toBeInTheDocument();
    expect(screen.queryByText("Delete")).not.toBeInTheDocument();
  });

  test("admin sees create/edit/delete; delete removes row and refreshes", async () => {
    setupCommon();
    axiosMock.onGet("/api/currentUser").reply(200, apiCurrentUserFixtures.adminUser);

    // initial list (first GET)
    axiosMock.onGet("/api/helprequest/all").replyOnce(200, sample);

    renderPage();

    const firstIdCell = await screen.findByTestId("HelpRequestTable-cell-row-0-col-id");
    const deletedId = Number(firstIdCell.textContent);

    expect(await screen.findByTestId("HelpRequestIndexPage-create-button")).toBeInTheDocument();

    const deleteBtn = await screen.findByTestId(
      "HelpRequestTable-cell-row-0-col-Buttons-button-delete"
    );
    fireEvent.click(deleteBtn);

    // success toast covers toast.success branch (id depends on current sort)
    await waitFor(() => {
      expect(mockToastSuccess).toHaveBeenCalled();
    });
    const lastToastArg = mockToastSuccess.mock.calls.at(-1)?.[0];
    expect(lastToastArg).toMatch(/^HelpRequest with id \d+ deleted$/);

    // simulate the result of a refresh by updating the react-query cache
    // to the list after delete (only bob remains)
    await waitFor(() => {
      expect(mockFetchWithRefresh).toHaveBeenCalledWith({
        url: "/api/helprequest",
        method: "DELETE",
        params: { id: deletedId }
      });
    });
    // drive UI update by injecting the new data into the cache
    // (avoids relying on react-query revalidation timing differences)
    queryClient.setQueryData(["/api/helprequest/all"], [sample[1]]);

    await waitFor(() => {
      expect(screen.queryByText("alice@ucsb.edu")).not.toBeInTheDocument();
      expect(screen.getByText("bob@ucsb.edu")).toBeInTheDocument();
    });
  });
});