import { render, screen, within } from "@testing-library/react";
import HelpRequestTable from "main/components/HelpRequest/HelpRequestTable";
import { helpRequestFixtures } from "fixtures/helpRequestFixtures";

describe("HelpRequestTable", () => {
  test("renders without crashing and shows headers", () => {
    render(<HelpRequestTable helpRequests={[]} />);

    const table = screen.getByTestId("HelpRequestTable");
    expect(table).toBeInTheDocument();

    [
      "ID",
      "Requester Email",
      "Team ID",
      "Table/Breakout Room",
      "Request Time",
      "Explanation",
      "Solved"
    ].forEach((h) => expect(screen.getByText(h)).toBeInTheDocument());
  });

  test("renders rows from fixtures", () => {
    render(
      <HelpRequestTable helpRequests={helpRequestFixtures.threeHelpRequests} />
    );

    const table = screen.getByTestId("HelpRequestTable");
    const tbody = within(table).getAllByRole("rowgroup")[1];
    const rows = within(tbody).getAllByRole("row");
    expect(rows.length).toBe(helpRequestFixtures.threeHelpRequests.length);

    const first = helpRequestFixtures.threeHelpRequests[0];
    expect(screen.getByText(String(first.id))).toBeInTheDocument();
    expect(screen.getByText(first.requesterEmail)).toBeInTheDocument();
    expect(screen.getByText(first.tableOrBreakoutRoom)).toBeInTheDocument();

    expect(screen.getByText(first.teamId)).toBeInTheDocument();
    expect(screen.getByText(first.requestTime)).toBeInTheDocument();
    expect(screen.getByText(first.explanation)).toBeInTheDocument();
    const solvedCellRow0 = within(table).getByTestId("HelpRequestTable-cell-row-0-col-solved");
    expect(solvedCellRow0).toHaveTextContent(String(first.solved));

    const second = helpRequestFixtures.threeHelpRequests[1];
    expect(screen.getByText(String(second.id))).toBeInTheDocument();
    expect(screen.getByText(second.requesterEmail)).toBeInTheDocument();
    expect(screen.getByText(second.teamId)).toBeInTheDocument();
    expect(screen.getByText(second.requestTime)).toBeInTheDocument();
    expect(screen.getByText(second.explanation)).toBeInTheDocument();
    const solvedCellRow1 = within(table).getByTestId("HelpRequestTable-cell-row-1-col-solved");
    expect(solvedCellRow1).toHaveTextContent(String(second.solved));
  });
  test("renders zero rows when helpRequests is undefined (fallback path)", () => {
    render(<HelpRequestTable />);

    const table = screen.getByTestId("HelpRequestTable");
    const tbody = within(table).getAllByRole("rowgroup")[1];
    const rows = within(tbody).queryAllByRole("row");

    expect(rows.length).toBe(0);
    });
});