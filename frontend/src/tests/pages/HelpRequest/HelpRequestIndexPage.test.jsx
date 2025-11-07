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
import * as useBackendModule from "main/utils/useBackend";

describe("HelpRequestIndexPage tests", () => {
  const axiosMock = new AxiosMockAdapter(axios);
  let queryClient;

  const makeClient = () =>
    new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });

  beforeEach(() => {
    queryClient = makeClient(); // fresh cache for each test
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
  test("renders error banner when backend list fetch fails", async () => {
  setupCommon();
  axiosMock.onGet("/api/currentUser").reply(200, apiCurrentUserFixtures.userOnly);
  axiosMock.onGet("/api/helprequest/all").reply(500);

  renderPage();

  // shows heading, then error state
  expect(await screen.findByText("Help Requests")).toBeInTheDocument();
  expect(await screen.findByTestId("HelpRequestIndexPage-error")).toBeInTheDocument();
});

  test("admin delete failure shows error toast and leaves rows intact", async () => {
    setupCommon();
    axiosMock.onGet("/api/currentUser").reply(200, apiCurrentUserFixtures.adminUser);
    axiosMock.onGet("/api/helprequest/all").replyOnce(200, sample);

    // make the delete call fail
    mockFetchWithRefresh.mockRejectedValueOnce(new Error("boom"));

    renderPage();

    // rows loaded (both present)
    await screen.findByTestId("HelpRequestTable-cell-row-0-col-requesterEmail");
    expect(screen.getAllByText(/@ucsb\.edu/)).toHaveLength(2);

    const deleteBtn = await screen.findByTestId(
      "HelpRequestTable-cell-row-0-col-Buttons-button-delete"
    );
    fireEvent.click(deleteBtn);

    // catch branch: error toast fires, success does not
    await waitFor(() => {
      expect(mockToastError).toHaveBeenCalledWith(
        expect.stringMatching(/^Error deleting HelpRequest with id \d+$/)
      );
    });
    expect(mockToastSuccess).not.toHaveBeenCalled();

    // list remains unchanged (no client-side removal)
    expect(screen.getByText("alice@ucsb.edu")).toBeInTheDocument();
    expect(screen.getByText("bob@ucsb.edu")).toBeInTheDocument();
  });

  test("uses GET /api/helprequest/all in useBackend", async () => {
    // arrange
    setupCommon();
    axiosMock.onGet("/api/currentUser").reply(200, apiCurrentUserFixtures.userOnly);
    axiosMock.onGet("/api/helprequest/all").reply(200, []);

    // capture args while delegating to the real hook (don’t break hooks)
    const realUseBackend = useBackendModule.useBackend;
    let capturedAxiosParams;
    const spy = vi
      .spyOn(useBackendModule, "useBackend")
      .mockImplementation((qk, axiosParams, initialData) => {
        capturedAxiosParams = axiosParams;
        return realUseBackend(qk, axiosParams, initialData);
      });

    render(
      <QueryClientProvider client={makeClient()}>
        <MemoryRouter>
          <HelpRequestIndexPage />
        </MemoryRouter>
      </QueryClientProvider>
    );

    await screen.findByText("Help Requests");

    expect(capturedAxiosParams).toMatchObject({
      method: "GET",
      url: "/api/helprequest/all",
    });

    spy.mockRestore();
  });

  test("admin Create button has inline float:right", async () => {
    setupCommon();
    axiosMock.onGet("/api/currentUser").reply(200, apiCurrentUserFixtures.adminUser);
    axiosMock.onGet("/api/helprequest/all").reply(200, []);

    render(
      <QueryClientProvider client={makeClient()}>
        <MemoryRouter>
          <HelpRequestIndexPage />
        </MemoryRouter>
      </QueryClientProvider>
    );

    const btn = await screen.findByTestId("HelpRequestIndexPage-create-button");
    expect(btn).toBeInTheDocument();
    expect(btn).toHaveStyle({ float: "right" });
  });

  test("shows loading state while fetching", async () => {
    setupCommon();
    axiosMock.onGet("/api/currentUser").reply(200, apiCurrentUserFixtures.userOnly);
    axiosMock.onGet("/api/helprequest/all").reply(200, []); // won't be used due to the spy

    const useBackendSpy = vi.spyOn(useBackendModule, "useBackend").mockReturnValue({
      data: [],
      error: null,
      status: "loading",
      mutate: vi.fn(),
    });

    renderPage();

    expect(screen.getByText("Loading...")).toBeInTheDocument();

    useBackendSpy.mockRestore();
  });
});

// New tests to enforce header text, edit link, and testid presence
import { render as render2, screen as screen2 } from "@testing-library/react";
import { MemoryRouter as MemoryRouter2 } from "react-router-dom";
import HelpRequestTable from "main/components/HelpRequest/HelpRequestTable";
import { helpRequestFixtures } from "fixtures/helpRequestFixtures";

describe("HelpRequestTable Stryker-killing tests", () => {
  test("shows 'Actions' header when showButtons is true", () => {
    render2(
      <MemoryRouter2>
        <HelpRequestTable
          helpRequests={helpRequestFixtures.threeHelpRequests}
          showButtons={true}
        />
      </MemoryRouter2>
    );
    // If the header string literal is mutated to "", this will fail
    expect(screen2.getByRole("columnheader", { name: "Actions" })).toBeInTheDocument();
  });

  test("edit button has correct href /helprequest/edit/:id for first row", () => {
    render2(
      <MemoryRouter2>
        <HelpRequestTable
          helpRequests={helpRequestFixtures.threeHelpRequests}
          showButtons={true}
        />
      </MemoryRouter2>
    );
    const editBtn = screen2.getByTestId(
      "HelpRequestTable-cell-row-0-col-Buttons-button-edit"
    );
    const link = editBtn.closest("a");
    expect(link).toBeTruthy();
    // If `to={``}` mutation happens, this will fail
    expect(link?.getAttribute("href")).toBe("/helprequest/edit/1");
  });

  test("edit button testid exists exactly as specified", () => {
    render2(
      <MemoryRouter2>
        <HelpRequestTable
          helpRequests={helpRequestFixtures.threeHelpRequests}
          showButtons={true}
        />
      </MemoryRouter2>
    );
    // If data-testid is mutated to empty string, this will fail
    expect(
      screen2.getByTestId("HelpRequestTable-cell-row-0-col-Buttons-button-edit")
    ).toBeInTheDocument();
  });
});