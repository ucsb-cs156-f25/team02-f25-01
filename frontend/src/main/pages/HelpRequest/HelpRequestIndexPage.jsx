import React from "react";
import BasicLayout from "main/layouts/BasicLayout/BasicLayout";
import HelpRequestTable from "main/components/HelpRequest/HelpRequestTable";
import { useBackend, fetchWithRefresh } from "main/utils/useBackend";
import { useCurrentUser, hasRole } from "main/utils/useCurrentUser";
import { Button } from "react-bootstrap";
import { toast } from "react-toastify";

export default function HelpRequestIndexPage() {
  const currentUser = useCurrentUser();
  const isAdmin = hasRole(currentUser, "ROLE_ADMIN");

  const {
    data: helpRequests,
    error,
    status,
    mutate: refresh,
  } = useBackend(
    // Stryker disable next-line all : don't test caching
    ["/api/helprequest/all"],
    { method: "GET", url: "/api/helprequest/all" },
    []
  );

  const onDelete = async (row) => {
    try {
      await fetchWithRefresh({
        url: "/api/helprequest",
        method: "DELETE",
        params: { id: row.id },
      });
      toast.success(`HelpRequest with id ${row.id} deleted`);
      refresh(); // no await, no extra branch
    } catch {
      toast.error(`Error deleting HelpRequest with id ${row.id}`);
    }
  };

  const createButton = () => {
    if (isAdmin) {
      return (
        <Button
          variant="primary"
          href="/helprequest/create"
          style={{ float: "right" }}
          data-testid="HelpRequestIndexPage-create-button"
        >
          Create HelpRequest
        </Button>
      );
    }
  };

  if (status === "loading") {
    return (
      <BasicLayout>
        <div className="pt-2" data-testid="HelpRequestIndexPage">
          <h1>Help Requests</h1>
          <div>Loading...</div>
        </div>
      </BasicLayout>
    );
  }

  if (error) {
    return (
      <BasicLayout>
        <div className="pt-2" data-testid="HelpRequestIndexPage">
          <h1>Help Requests</h1>
          <div data-testid="HelpRequestIndexPage-error">
            Error loading help requests
          </div>
        </div>
      </BasicLayout>
    );
  }

  return (
    <BasicLayout>
      <div className="pt-2" data-testid="HelpRequestIndexPage">
        {createButton()}
        <h1>Help Requests</h1>
        <HelpRequestTable
          helpRequests={helpRequests}
          showButtons={isAdmin}
          onDelete={isAdmin ? onDelete : undefined}
        />
      </div>
    </BasicLayout>
  );
}