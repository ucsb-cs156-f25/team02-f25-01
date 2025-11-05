import { Button, Form } from "react-bootstrap";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router";

const toLocalDatetimeValue = (s) => {
  if (!s) return s;
  const noZ = s.replace(/Z$/, "");
  // "YYYY-MM-DDTHH:mm" is 16 chars
  return noZ.length >= 16 ? noZ.slice(0, 16) : noZ;
};

function HelpRequestForm({
  initialContents,
  submitAction,
  buttonLabel = "Create",
}) {
  const defaultValues = initialContents
    ? {
        ...initialContents,
        requestTime: toLocalDatetimeValue(initialContents.requestTime),
      }
    : {};

  // Stryker disable all
  const {
    register,
    formState: { errors },
    handleSubmit,
  } = useForm({ defaultValues });
  // Stryker restore all

  const navigate = useNavigate();
  const testIdPrefix = "HelpRequestForm";

  const onSubmit = (data) => {
    const rt = data.requestTime;
    const withZ = `${rt}Z`;
    submitAction({ ...data, requestTime: withZ });
  };

  return (
    <Form onSubmit={handleSubmit(onSubmit)}>
      {initialContents && (
        <Form.Group className="mb-3">
          <Form.Label htmlFor="id">Id</Form.Label>
          <Form.Control
            data-testid={testIdPrefix + "-id"}
            id="id"
            type="text"
            {...register("id")}
            value={initialContents.id}
            disabled
          />
        </Form.Group>
      )}

      <Form.Group className="mb-3">
        <Form.Label htmlFor="requesterEmail">Requester Email</Form.Label>
        <Form.Control
          data-testid={testIdPrefix + "-requesterEmail"}
          id="requesterEmail"
          type="email"
          isInvalid={Boolean(errors.requesterEmail)}
          {...register("requesterEmail", {
            required: "Email is required.",
            pattern: { value: /.+@.+\..+/, message: "Enter a valid email." },
          })}
        />
        <Form.Control.Feedback type="invalid">
          {errors.requesterEmail?.message}
        </Form.Control.Feedback>
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label htmlFor="teamId">Team ID</Form.Label>
        <Form.Control
          data-testid={testIdPrefix + "-teamId"}
          id="teamId"
          type="text"
          isInvalid={Boolean(errors.teamId)}
          {...register("teamId", {
            required: "Team ID is required.",
          })}
        />
        <Form.Control.Feedback type="invalid">
          {errors.teamId?.message}
        </Form.Control.Feedback>
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label htmlFor="tableOrBreakoutRoom">
          Table / Breakout Room
        </Form.Label>
        <Form.Control
          data-testid={testIdPrefix + "-tableOrBreakoutRoom"}
          id="tableOrBreakoutRoom"
          type="text"
          isInvalid={Boolean(errors.tableOrBreakoutRoom)}
          {...register("tableOrBreakoutRoom", {
            required: "Table / Breakout Room is required.",
            maxLength: { value: 100, message: "Max length 100 characters" },
          })}
        />
        <Form.Control.Feedback type="invalid">
          {errors.tableOrBreakoutRoom?.message}
        </Form.Control.Feedback>
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label htmlFor="requestTime">Request Time (UTC)</Form.Label>
        <Form.Control
          data-testid={testIdPrefix + "-requestTime"}
          id="requestTime"
          type="datetime-local"
          isInvalid={Boolean(errors.requestTime)}
          {...register("requestTime", {
            required: "Request Time is required.",
          })}
        />
        <Form.Control.Feedback type="invalid">
          {errors.requestTime?.message}
        </Form.Control.Feedback>
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label htmlFor="explanation">Explanation</Form.Label>
        <Form.Control
          data-testid={testIdPrefix + "-explanation"}
          id="explanation"
          as="textarea"
          rows={3}
          isInvalid={Boolean(errors.explanation)}
          {...register("explanation", {
            required: "Explanation is required.",
            maxLength: { value: 255, message: "Max length 255 characters" },
          })}
        />
        <Form.Control.Feedback type="invalid">
          {errors.explanation?.message}
        </Form.Control.Feedback>
      </Form.Group>

      <Form.Group className="mb-3" controlId="solved">
        <Form.Check
          data-testid={testIdPrefix + "-solved"}
          type="checkbox"
          label="Solved?"
          {...register("solved")}
        />
      </Form.Group>

      <Button type="submit" data-testid={testIdPrefix + "-submit"}>
        {buttonLabel}
      </Button>
      <Button
        variant="Secondary"
        onClick={() => navigate(-1)}
        data-testid={testIdPrefix + "-cancel"}
        className="ms-2"
      >
        Cancel
      </Button>
    </Form>
  );
}

export default HelpRequestForm;
export { HelpRequestForm };