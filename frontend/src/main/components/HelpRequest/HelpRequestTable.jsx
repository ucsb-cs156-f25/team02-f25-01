import React from "react";
import OurTable from "main/components/OurTable";
import { Link } from "react-router-dom";

export default function HelpRequestTable({ helpRequests, showButtons = false, onDelete }) {
  const columns = [
    { header: "ID", accessorKey: "id" },
    { header: "Requester Email", accessorKey: "requesterEmail" },
    { header: "Team ID", accessorKey: "teamId" },
    { header: "Table/Breakout Room", accessorKey: "tableOrBreakoutRoom" },
    { header: "Request Time", accessorKey: "requestTime" },
    { header: "Explanation", accessorKey: "explanation" },
    {
      header: "Solved",
      accessorKey: "solved",
      cell: ({ getValue }) => String(getValue())
    }
  ];

  if (showButtons) {
    columns.push({
      header: "Actions",
      id: "actions",
      cell: ({ row }) => {
        const id = row.original.id;
        return (
          <div className="d-flex gap-2">
            <Link
              to={`/helprequest/edit/${id}`}
              data-testid={`HelpRequestTable-cell-row-${row.index}-col-Buttons-button-edit`}
              className="btn btn-primary btn-sm"
            >
              Edit
            </Link>
            <button
              type="button"
              className="btn btn-danger btn-sm"
              data-testid={`HelpRequestTable-cell-row-${row.index}-col-Buttons-button-delete`}
              onClick={() => onDelete && onDelete(row.original)}
            >
              Delete
            </button>
          </div>
        );
      }
    });
  }

  return (
    <OurTable
      data={helpRequests || []}
      columns={columns}
      testid="HelpRequestTable"
    />
  );
}