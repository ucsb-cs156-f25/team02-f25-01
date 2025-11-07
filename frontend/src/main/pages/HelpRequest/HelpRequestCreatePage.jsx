import BasicLayout from "main/layouts/BasicLayout/BasicLayout";
import HelpRequestForm from "main/components/HelpRequest/HelpRequestForm";
import { useBackendMutation } from "main/utils/useBackend";
import { toast } from "react-toastify";
import { useNavigate } from "react-router";

export default function HelpRequestCreatePage() {
  const navigate = useNavigate();

  // Form already appends "Z" to requestTime; do NOT add it again here.
  const objectToAxiosParams = (helpRequest) => ({
    url: "/api/helprequest/post",
    method: "POST",
    params: {
      requesterEmail: helpRequest.requesterEmail,
      teamId: helpRequest.teamId,
      tableOrBreakoutRoom: helpRequest.tableOrBreakoutRoom,
      requestTime: helpRequest.requestTime, // already ends with "Z"
      explanation: helpRequest.explanation,
      solved: helpRequest.solved ?? false,
    },
  });

  const onSuccess = (data) => {
    toast(`New HelpRequest created: id ${data.id}`);
    navigate("/helprequest");
  };

  const mutation = useBackendMutation(objectToAxiosParams, { onSuccess }, [
    "/api/helprequest/all",
  ]);

  const onSubmit = async (data) => {
    mutation.mutate(data);
  };

  return (
    <BasicLayout>
      <div className="pt-2" data-testid="HelpRequestCreatePage">
        <h1>Create HelpRequest</h1>
        <HelpRequestForm submitAction={onSubmit} />
      </div>
    </BasicLayout>
  );
}