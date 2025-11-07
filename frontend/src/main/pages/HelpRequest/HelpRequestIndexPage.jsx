import React from "react";
import BasicLayout from "main/layouts/BasicLayout/BasicLayout";
import HelpRequestTable from "main/components/HelpRequest/HelpRequestTable.jsx";
import { useCurrentUser, hasRole } from "main/utils/useCurrentUser";
import { useBackend, fetchWithRefresh } from "main/utils/useBackend";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";

export default function HelpRequestIndexPage() {
  const currentUser = useCurrentUser();
  const isAdmin = hasRole(currentUser, "ROLE_ADMIN");

  const {
    data: helpRequests,
    error,
    status,
    mutate: refresh
  } = useBackend(
    ["/api/helprequest/all"],
    { method: "GET", url: "/api/helprequest/all" },
    []
  );

  const onDelete = async (row) => {
    try {
      await fetchWithRefresh({
        url: "/api/helprequest",
        method: "DELETE",
        params: { id: row.id }
      });
      toast.success(`HelpRequest with id ${row.id} deleted`);
      await refresh();
    } catch {
      toast.error(`Error deleting HelpRequest with id ${row.id}`);
    }
  };

  return (
    <BasicLayout>
      <div className="pt-2" data-testid="HelpRequestIndexPage">
        <h1>Help Requests</h1>

        {isAdmin && (
          <div className="my-3">
            <Link
              to="/helprequest/create"
              className="btn btn-primary"
              data-testid="HelpRequestIndexPage-create-button"
            >
              Create HelpRequest
            </Link>
          </div>
        )}

        {status === "loading" && <div>Loading...</div>}
        {error && (
          <div data-testid="HelpRequestIndexPage-error">
            Error loading help requests
          </div>
        )}

        <HelpRequestTable
          helpRequests={helpRequests}
          showButtons={isAdmin}
          onDelete={isAdmin ? onDelete : undefined}
        />
      </div>
    </BasicLayout>
  );
}