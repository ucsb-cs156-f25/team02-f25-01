import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { BrowserRouter as Router } from "react-router";
import HelpRequestForm from "main/components/HelpRequest/HelpRequestForm";
import { helpRequestFixtures } from "fixtures/helpRequestFixtures";
import { vi, expect, describe, test } from "vitest";

const mockedNavigate = vi.fn();
vi.mock("react-router", async () => {
  const originalModule = await vi.importActual("react-router");
  return {
    ...originalModule,
    useNavigate: () => mockedNavigate,
  };
});

describe("HelpRequestForm tests", () => {
  const testId = "HelpRequestForm";

  test("renders correctly with no initialContents", async () => {
    render(
      <Router>
        <HelpRequestForm submitAction={vi.fn()} />
      </Router>,
    );

    expect(await screen.findByText(/Create/)).toBeInTheDocument();

    // fields visible, id hidden in create
    expect(screen.queryByTestId(`${testId}-id`)).not.toBeInTheDocument();
    expect(screen.getByLabelText("Requester Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Team ID")).toBeInTheDocument();
    expect(screen.getByLabelText("Table / Breakout Room")).toBeInTheDocument();
    expect(screen.getByLabelText("Request Time (UTC)")).toBeInTheDocument();
    expect(screen.getByLabelText("Explanation")).toBeInTheDocument();
  });

  test("renders correctly when passing in initialContents (shows id and defaults)", async () => {
    render(
      <Router>
        <HelpRequestForm
          initialContents={helpRequestFixtures.oneHelpRequest}
          submitAction={vi.fn()}
          buttonLabel="Update"
        />
      </Router>,
    );

    const id = await screen.findByTestId(`${testId}-id`);
    expect(id).toBeInTheDocument();
    expect(id).toBeDisabled();

    expect(screen.getByTestId(`${testId}-requesterEmail`)).toHaveValue(
      helpRequestFixtures.oneHelpRequest.requesterEmail,
    );
    expect(screen.getByTestId(`${testId}-teamId`)).toHaveValue(
      helpRequestFixtures.oneHelpRequest.teamId,
    );

    // requestTime shown without trailing Z and trimmed to minutes
    const shown = screen.getByTestId(`${testId}-requestTime`);
    const expected = helpRequestFixtures.oneHelpRequest.requestTime
      .replace(/Z$/, "")
      .slice(0, 16);
    expect(shown).toHaveValue(expected);
  });

  test("that navigate(-1) is called when Cancel is clicked", async () => {
    render(
      <Router>
        <HelpRequestForm submitAction={vi.fn()} />
      </Router>,
    );
    const cancel = await screen.findByTestId(`${testId}-cancel`);
    fireEvent.click(cancel);
    await waitFor(() => expect(mockedNavigate).toHaveBeenCalledWith(-1));
  });

  test("validations: required fields, email pattern, and max length", async () => {
    render(
      <Router>
        <HelpRequestForm submitAction={vi.fn()} />
      </Router>,
    );

    const submit = await screen.findByTestId(`${testId}-submit`);
    fireEvent.click(submit);

    await screen.findByText(/Email is required/);
    expect(screen.getByText(/Team ID is required/)).toBeInTheDocument();
    expect(
      screen.getByText(/Table \/ Breakout Room is required/),
    ).toBeInTheDocument();
    expect(screen.getByText(/Request Time is required/)).toBeInTheDocument();
    expect(screen.getByText(/Explanation is required/)).toBeInTheDocument();

    // Email pattern
    fireEvent.change(screen.getByTestId(`${testId}-requesterEmail`), {
      target: { value: "notanemail" },
    });
    fireEvent.change(screen.getByTestId(`${testId}-teamId`), {
      target: { value: "f25-01" },
    });
    fireEvent.change(screen.getByTestId(`${testId}-tableOrBreakoutRoom`), {
      target: { value: "Table 1" },
    });
    fireEvent.change(screen.getByTestId(`${testId}-requestTime`), {
      target: { value: "2025-11-04T10:00" },
    });
    fireEvent.change(screen.getByTestId(`${testId}-explanation`), {
      target: { value: "Need help" },
    });

    fireEvent.click(submit);
    await waitFor(() =>
      expect(screen.getByText(/Enter a valid email/)).toBeInTheDocument(),
    );

    // Explanation too long
    fireEvent.change(screen.getByTestId(`${testId}-explanation`), {
      target: { value: "a".repeat(256) },
    });
    fireEvent.click(submit);
    await waitFor(() =>
      expect(screen.getByText(/Max length 255 characters/)).toBeInTheDocument(),
    );
  });

  test("submit appends Z to requestTime and passes checkbox value", async () => {
    const submitSpy = vi.fn();
    render(
      <Router>
        <HelpRequestForm submitAction={submitSpy} />
      </Router>,
    );

    fireEvent.change(screen.getByTestId(`${testId}-requesterEmail`), {
      target: { value: "jon@ucsb.edu" },
    });
    fireEvent.change(screen.getByTestId(`${testId}-teamId`), {
      target: { value: "f25-01" },
    });
    fireEvent.change(screen.getByTestId(`${testId}-tableOrBreakoutRoom`), {
      target: { value: "Table 1" },
    });
    fireEvent.change(screen.getByTestId(`${testId}-requestTime`), {
      target: { value: "2025-11-04T10:30" },
    });
    fireEvent.change(screen.getByTestId(`${testId}-explanation`), {
      target: { value: "Help please" },
    });
    fireEvent.click(screen.getByTestId(`${testId}-solved`));

    fireEvent.click(screen.getByTestId(`${testId}-submit`));

    await waitFor(() => expect(submitSpy).toHaveBeenCalledTimes(1));
    const payload = submitSpy.mock.calls[0][0];

    expect(payload.requesterEmail).toBe("jon@ucsb.edu");
    expect(payload.teamId).toBe("f25-01");
    expect(payload.tableOrBreakoutRoom).toBe("Table 1");
    expect(payload.explanation).toBe("Help please");
    expect(payload.solved).toBe(true);
    expect(payload.requestTime).toBe("2025-11-04T10:30Z");
  });
});
