import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import HelpRequestCreatePage from "main/pages/HelpRequest/HelpRequestCreatePage";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router";
import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";
import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";
import { helpRequestFixtures } from "fixtures/helpRequestFixtures";
import { vi } from "vitest";

// ---- Vitest mocks (replace jest.* with vi.*) ----
const mockToast = vi.fn();
vi.mock("react-toastify", async () => {
  const actual = await vi.importActual("react-toastify");
  return { ...actual, toast: (...args) => mockToast(...args) };
});

const mockNavigate = vi.fn();
vi.mock("react-router", async () => {
  const actual = await vi.importActual("react-router");
  return { ...actual, useNavigate: () => mockNavigate };
});
// --------------------------------------------------

beforeEach(() => {
  vi.clearAllMocks(); // resets mockNavigate, mockToast, etc.
});

describe("HelpRequestCreatePage tests", () => {
  const axiosMock = new AxiosMockAdapter(axios);
  const queryClient = new QueryClient();

  const setupUserOnly = () => {
    axiosMock.reset();
    axiosMock.resetHistory();
    axiosMock.onGet("/api/currentUser").reply(200, apiCurrentUserFixtures.userOnly);
    axiosMock.onGet("/api/systemInfo").reply(200, systemInfoFixtures.showingNeither);
  };

  const renderPage = () =>
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <HelpRequestCreatePage />
        </MemoryRouter>
      </QueryClientProvider>
    );

  test("renders form fields", async () => {
    setupUserOnly();
    renderPage();

    await screen.findByText("Create HelpRequest");
    expect(screen.getByLabelText("Requester Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Team ID")).toBeInTheDocument();
    expect(screen.getByLabelText("Table / Breakout Room")).toBeInTheDocument();
    expect(screen.getByLabelText("Request Time (UTC)")).toBeInTheDocument();
    expect(screen.getByLabelText("Explanation")).toBeInTheDocument();
    expect(screen.getByLabelText("Solved?")).toBeInTheDocument();
    expect(screen.getByTestId("HelpRequestForm-submit")).toBeInTheDocument();
  });

  test("submits valid data -> POST, toast, navigate", async () => {
    setupUserOnly();

    const reply = helpRequestFixtures.oneHelpRequest;
    axiosMock.onPost("/api/helprequest/post").reply(202, reply);

    renderPage();

    fireEvent.change(screen.getByLabelText("Requester Email"), {
      target: { value: "jon@ucsb.edu" },
    });
    fireEvent.change(screen.getByLabelText("Team ID"), {
      target: { value: "f25-01" },
    });
    fireEvent.change(screen.getByLabelText("Table / Breakout Room"), {
      target: { value: "Table 1" },
    });
    fireEvent.change(screen.getByLabelText("Request Time (UTC)"), {
      target: { value: "2025-11-04T10:00" }, // form appends Z
    });
    fireEvent.change(screen.getByLabelText("Explanation"), {
      target: { value: "Need help debugging the POST endpoint." },
    });
    fireEvent.click(screen.getByLabelText("Solved?")); // true

    fireEvent.click(screen.getByTestId("HelpRequestForm-submit"));

    await waitFor(() => expect(axiosMock.history.post.length).toBe(1));

    const posted = axiosMock.history.post[0];
    expect(posted.url).toBe("/api/helprequest/post");
    expect(posted.params).toEqual({
      requesterEmail: "jon@ucsb.edu",
      teamId: "f25-01",
      tableOrBreakoutRoom: "Table 1",
      requestTime: "2025-11-04T10:00Z",
      explanation: "Need help debugging the POST endpoint.",
      solved: true,
    });

    expect(mockToast).toHaveBeenCalledWith(expect.stringContaining(`id ${reply.id}`));
    expect(mockNavigate).toHaveBeenCalledWith("/helprequest");
  });

  test("shows client-side validation errors and does NOT POST on empty submit", async () => {
    setupUserOnly();
    renderPage();

    fireEvent.click(screen.getByTestId("HelpRequestForm-submit"));

    await screen.findByText("Email is required.");
    await screen.findByText("Team ID is required.");
    await screen.findByText("Table / Breakout Room is required.");
    await screen.findByText("Request Time is required.");
    await screen.findByText("Explanation is required.");

    expect(axiosMock.history.post.length).toBe(0);
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  test("defaults solved to false when undefined (branch coverage)", async () => {
    // Arrange: reset module cache and provide a runtime mock for the Form
    vi.resetModules();
    vi.doMock("main/components/HelpRequest/HelpRequestForm", () => {
      let called = false;
      return {
        default: ({ submitAction }) => {
          if (!called) {
            called = true;
            // Defer to next microtask to avoid setState during render
            queueMicrotask(() => {
              submitAction({
                requesterEmail: "nosolved@ucsb.edu",
                teamId: "f25-01",
                tableOrBreakoutRoom: "Table X",
                requestTime: "2025-11-04T10:00Z",
                explanation: "Missing solved field",
              });
            });
          }
          return null;
        },
      };
    });

    // Recreate axios mocks after reset
    axiosMock.reset();
    axiosMock.resetHistory();
    axiosMock.onGet("/api/currentUser").reply(200, apiCurrentUserFixtures.userOnly);
    axiosMock.onGet("/api/systemInfo").reply(200, systemInfoFixtures.showingNeither);

    const reply = { id: 42 };
    axiosMock.onPost("/api/helprequest/post").reply(202, reply);

    // Dynamically import the page AFTER doMock so the mock is applied
    const { default: HelpRequestCreatePageMocked } = await import("main/pages/HelpRequest/HelpRequestCreatePage");

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <HelpRequestCreatePageMocked />
        </MemoryRouter>
      </QueryClientProvider>
    );

    await waitFor(() => expect(axiosMock.history.post.length).toBe(1));
    const posted = axiosMock.history.post[0];
    expect(posted.params).toEqual({
      requesterEmail: "nosolved@ucsb.edu",
      teamId: "f25-01",
      tableOrBreakoutRoom: "Table X",
      requestTime: "2025-11-04T10:00Z",
      explanation: "Missing solved field",
      solved: false, // covered the ?? false branch
    });

    // Cleanup runtime mock so other suites aren't affected if this file re-runs
    vi.resetModules();
  });
  test("wires useBackendMutation with invalidate key ['/api/helprequest/all']", async () => {
    // Recreate a clean module graph and capture the key passed to useBackendMutation
    vi.resetModules();
    let capturedKey = null;

    vi.doMock("main/utils/useBackend", async () => {
      // Provide a minimal mock that captures the third argument
      return {
        useBackendMutation: (objectToAxiosParams, useMutationParams, queryKey) => {
          capturedKey = queryKey;
          // return a minimal shape used by the component
          return { mutate: vi.fn() };
        },
      };
    });

    // Axios mocks need to be re-established after resetModules
    const axiosMock2 = new AxiosMockAdapter(axios);
    axiosMock2.onGet("/api/currentUser").reply(200, apiCurrentUserFixtures.userOnly);
    axiosMock2.onGet("/api/systemInfo").reply(200, systemInfoFixtures.showingNeither);

    // Dynamically import AFTER doMock so our mock is applied
    const { default: HelpRequestCreatePageLocal } = await import("main/pages/HelpRequest/HelpRequestCreatePage");

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <HelpRequestCreatePageLocal />
        </MemoryRouter>
      </QueryClientProvider>
    );

    // Assert the exact query key is passed (kills mutants that change it to [] or "")
    expect(capturedKey).toEqual(["/api/helprequest/all"]);

    // Cleanup to avoid leaking this mock into other tests
    vi.resetModules();
  });
});