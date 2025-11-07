import BasicLayout from "main/layouts/BasicLayout/BasicLayout";
import UCSBOrganizationsForm from "main/components/UCSBOrganizations/UCSBOrganizationsForm";
import { Navigate } from "react-router";
import { useBackendMutation } from "main/utils/useBackend";
import { toast } from "react-toastify";

export default function UCSBOrganizationsCreatePage({ storybook = false }) {
  const objectToAxiosParams = (ucsbOrganization) => ({
    url: "/api/ucsborganizations/post",
    method: "POST",
    params: {
      orgCode: ucsbOrganization.orgCode,
      orgTranslationShort: ucsbOrganization.orgTranslationShort,
      orgTranslation: ucsbOrganization.orgTranslation,
      inactive: ucsbOrganization.inactive,
    },
  });

  const onSuccess = (ucsbOrganization) => {
    toast(
      `New UCSB organization Created - orgCode: ${ucsbOrganization.orgCode} orgTranslationShort: ${ucsbOrganization.orgTranslationShort} orgTranslation: ${ucsbOrganization.orgTranslation} inactive: ${ucsbOrganization.inactive}`,
    );
  };

  const mutation = useBackendMutation(
    objectToAxiosParams,
    { onSuccess },
    // Stryker disable next-line all : hard to set up test for caching
    ["/api/ucsborganizations/all"], // mutation makes this key stale so that pages relying on it reload
  );

  const { isSuccess } = mutation;

  const onSubmit = async (data) => {
    mutation.mutate(data);
  };

  if (isSuccess && !storybook) {
    return <Navigate to="/ucsborganizations" />;
  }

  return (
    <BasicLayout>
      <div className="pt-2">
        <h1>Create New UCSB Organization</h1>
        <UCSBOrganizationsForm submitAction={onSubmit} />
      </div>
    </BasicLayout>
  );
}
