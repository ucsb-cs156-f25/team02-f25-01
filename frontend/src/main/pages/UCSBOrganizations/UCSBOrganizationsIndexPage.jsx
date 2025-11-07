import React from "react";
import { useBackend } from "main/utils/useBackend";

import BasicLayout from "main/layouts/BasicLayout/BasicLayout";
import UCSBOrganizationsTable from "main/components/UCSBOrganizations/UCSBOrganizationsTable";
import { useCurrentUser, hasRole } from "main/utils/useCurrentUser";
import { Button } from "react-bootstrap";

export default function UCSBOrganizationsIndexPage() {
  const currentUser = useCurrentUser();

  const {
    data: organizations,
    error: _error,
    status: _status,
  } = useBackend(
    // Stryker disable next-line all : don't test internal caching of React Query
    ["/api/ucsborganizations/all"],
    { method: "GET", url: "/api/ucsborganizations/all" },
    // Stryker disable next-line all : don't test default value of empty list
    [],
  );

  const createButton = () => {
    if (hasRole(currentUser, "ROLE_ADMIN")) {
      return (
        <Button
          variant="primary"
          href="/ucsborganizations/create"
          style={{ float: "right" }}
        >
          Create UCSB Organization
        </Button>
      );
    }
  };

  return (
    <BasicLayout>
      <div className="pt-2">
        {createButton()}
        <h1>UCSB Organizations</h1>
        <UCSBOrganizationsTable organizations={organizations} currentUser={currentUser} />
      </div>
    </BasicLayout>
  );
}
