import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import HelpRequestsCreatePage from "main/pages/HelpRequests/HelpRequestsCreatePage";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router";

import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";

import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";
import { expect } from "vitest";

const mockToast = vi.fn();
vi.mock("react-toastify", async (importOriginal) => {
  const originalModule = await importOriginal();
  return {
    ...originalModule,
    toast: vi.fn((x) => mockToast(x)),
  };
});

const mockNavigate = vi.fn();
vi.mock("react-router", async (importOriginal) => {
  const originalModule = await importOriginal();
  return {
    ...originalModule,
    Navigate: vi.fn((x) => {
      mockNavigate(x);
      return null;
    }),
  };
});

describe("HelpRequestsCreatePage tests", () => {
  const axiosMock = new AxiosMockAdapter(axios);

  beforeEach(() => {
    vi.clearAllMocks();
    axiosMock.reset();
    axiosMock.resetHistory();
    axiosMock
      .onGet("/api/currentUser")
      .reply(200, apiCurrentUserFixtures.userOnly);
    axiosMock
      .onGet("/api/systemInfo")
      .reply(200, systemInfoFixtures.showingNeither);
  });

  const queryClient = new QueryClient();
  test("renders without crashing", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <HelpRequestsCreatePage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(screen.getByLabelText("Requester Email")).toBeInTheDocument();
    });
  });

  test("when you fill in the form and hit submit, it makes a request to /helpRequests", async () => {
    const queryClient = new QueryClient();

    const expectedPost = {
      requesterEmail: "jon@ucsb.edu",
      teamId: "f25-4pm-1",
      tableOrBreakoutRoom: "1",
      requestTime: "2025-10-01T16:30",
      explanation: "add delete, put, get end points for helpRequest",
      solved: "false",
    };

    const helpRequest = {
      id: 7,
      ...expectedPost,
    };

    axiosMock.onPost("/api/helprequests/post").reply(202, helpRequest);

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <HelpRequestsCreatePage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(screen.getByLabelText("Requester Email")).toBeInTheDocument();
    });

    const requesterEmailInput = screen.getByLabelText("Requester Email");
    expect(requesterEmailInput).toBeInTheDocument();

    const teamIdInput = screen.getByLabelText("Team Id");
    expect(teamIdInput).toBeInTheDocument();

    const tableOrBreakoutRoomInput = screen.getByLabelText(
      "Table or Breakout Room",
    );
    expect(tableOrBreakoutRoomInput).toBeInTheDocument();

    const requestTimeInput = screen.getByLabelText(
      "Request Time (ISO with seconds)",
    );
    expect(requestTimeInput).toBeInTheDocument();

    const explanationInput = screen.getByLabelText("Explanation");
    expect(explanationInput).toBeInTheDocument();

    const solvedInput = screen.getByLabelText("Solved");
    expect(solvedInput).toBeInTheDocument();

    const createButton = screen.getByText("Create");
    expect(createButton).toBeInTheDocument();

    fireEvent.change(requesterEmailInput, {
      target: { value: "jon@ucsb.edu" },
    });
    fireEvent.change(teamIdInput, { target: { value: "f25-4pm-1" } });
    fireEvent.change(tableOrBreakoutRoomInput, { target: { value: "1" } });
    fireEvent.change(requestTimeInput, {
      target: { value: "2025-10-01T16:30" },
    });
    fireEvent.change(explanationInput, {
      target: { value: "add delete, put, get end points for helpRequest" },
    });
    fireEvent.change(solvedInput, { target: { value: "false" } });

    fireEvent.click(createButton);

    await waitFor(() => expect(axiosMock.history.post.length).toBe(1));

    expect(axiosMock.history.post[0].params).toEqual(expectedPost);

    expect(mockToast).toHaveBeenCalledWith(
      "New helpRequest Created - id: 7 requesterEmail: jon@ucsb.edu",
    );
    expect(mockNavigate).toHaveBeenCalledWith({ to: "/HelpRequests" });
  });
});