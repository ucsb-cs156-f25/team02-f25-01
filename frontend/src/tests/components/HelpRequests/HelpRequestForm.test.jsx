import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { BrowserRouter as Router } from "react-router";

import HelpRequestForm from "main/components/HelpRequests/HelpRequestForm";
import { helpRequestFixtures } from "fixtures/helpRequestFixtures";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const mockedNavigate = vi.fn();
vi.mock("react-router", async () => {
  const originalModule = await vi.importActual("react-router");
  return {
    ...originalModule,
    useNavigate: () => mockedNavigate,
  };
});

describe("HelpRequestForm tests", () => {
  const queryClient = new QueryClient();

  const expectedHeaders = [
    "Requester Email",
    "Team Id",
    "Table or Breakout Room",
    "Request Time (ISO with seconds)",
    "Explanation",
    "Solved",
  ];
  const testId = "HelpRequestForm";

  test("renders correctly with no initialContents", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <Router>
          <HelpRequestForm />
        </Router>
      </QueryClientProvider>,
    );

    expect(await screen.findByText(/Create/)).toBeInTheDocument();

    expectedHeaders.forEach((headerText) => {
      const header = screen.getByText(headerText);
      expect(header).toBeInTheDocument();
    });
  });

  test("renders correctly when passing in initialContents", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <Router>
          <HelpRequestForm
            initialContents={helpRequestFixtures.oneHelpRequest}
          />
        </Router>
      </QueryClientProvider>,
    );

    expect(await screen.findByText(/Create/)).toBeInTheDocument();

    expectedHeaders.forEach((headerText) => {
      const header = screen.getByText(headerText);
      expect(header).toBeInTheDocument();
    });

    expect(await screen.findByTestId(`${testId}-id`)).toBeInTheDocument();
    expect(screen.getByText(`Id`)).toBeInTheDocument();
  });

  test("that navigate(-1) is called when Cancel is clicked", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <Router>
          <HelpRequestForm />
        </Router>
      </QueryClientProvider>,
    );
    expect(await screen.findByTestId(`${testId}-cancel`)).toBeInTheDocument();
    const cancelButton = screen.getByTestId(`${testId}-cancel`);

    fireEvent.click(cancelButton);

    await waitFor(() => expect(mockedNavigate).toHaveBeenCalledWith(-1));
  });

  test("that the correct validations are performed", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <Router>
          <HelpRequestForm />
        </Router>
      </QueryClientProvider>,
    );

    expect(await screen.findByText(/Create/)).toBeInTheDocument();
    const submitButton = screen.getByText(/Create/);
    fireEvent.click(submitButton);

    await screen.findByText(/Requester Email is required\./);
    expect(screen.getByText(/Team id is required\./)).toBeInTheDocument();
    expect(
      screen.getByText(/Table or breakout room is required\./),
    ).toBeInTheDocument();
    expect(screen.getByText(/Request time is required\./)).toBeInTheDocument();
    expect(screen.getByText(/Explanation is required\./)).toBeInTheDocument();
    expect(screen.getByText(/Solved is required\./)).toBeInTheDocument();

    const torInput = screen.getByTestId(`${testId}-tableOrBreakoutRoom`);
    fireEvent.change(torInput, { target: { value: "x".repeat(101) } });
    fireEvent.click(submitButton);
    await waitFor(() =>
      expect(screen.getByText(/at most 100 characters\./i)).toBeInTheDocument(),
    );

    const explanationInput = screen.getByTestId(`${testId}-explanation`);
    fireEvent.change(explanationInput, { target: { value: "short" } });
    fireEvent.click(submitButton);
    await screen.findByText(/at least 10 characters\./i);
  });

  test("pattern + maxLength validations and submit testid are enforced", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <Router>
          <HelpRequestForm />
        </Router>
      </QueryClientProvider>,
    );

    const email = await screen.findByTestId(`${testId}-requesterEmail`);
    const teamId = screen.getByTestId(`${testId}-teamId`);
    const explanation = screen.getByTestId(`${testId}-explanation`);
    const submit = screen.getByTestId(`${testId}-submit`);

    fireEvent.change(email, { target: { value: "a@b" } });
    fireEvent.change(teamId, { target: { value: "bad value with spaces!" } });
    fireEvent.change(explanation, { target: { value: "x".repeat(1201) } });
    fireEvent.click(submit);

    await screen.findByText(/Requester Email must be a valid email address/);
    await screen.findByText(
      /Team Id must only contain numbers, letters, dash, and\/or underscore\./,
    );
    await screen.findByText(/Explanation has a maximum of 1200 characters\./);

    expect(submit).toBeInTheDocument();
  });
});