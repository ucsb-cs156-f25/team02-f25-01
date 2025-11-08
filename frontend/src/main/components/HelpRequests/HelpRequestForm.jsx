import { Button, Form } from "react-bootstrap";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router";

function HelpRequestForm({
  initialContents,
  submitAction,
  buttonLabel = "Create",
}) {
  // Stryker disable all
  const {
    register,
    formState: { errors },
    handleSubmit,
  } = useForm({ defaultValues: initialContents || {} });
  // Stryker restore all

  const navigate = useNavigate();

  const testIdPrefix = "HelpRequestForm";

  // Stryker disable Regex
  const email_regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; 
  const teamid_regex = /^[A-Za-z0-9_-]+$/; 

  // Stryker restore Regex

  return (
    <Form onSubmit={handleSubmit(submitAction)}>
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
          data-testid="HelpRequestForm-requesterEmail"
          id="requesterEmail"
          type="email"
          placeholder="example: user@ucsb.edu"
          isInvalid={Boolean(errors.requesterEmail)}
          {...register("requesterEmail", {
            required: "Requester Email is required.",
            pattern: {
              value: email_regex,
              message: "Requester Email must be a valid email address",
            },
          })}
        />
        <Form.Control.Feedback type="invalid">
          {errors.requesterEmail?.message}
        </Form.Control.Feedback>
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label htmlFor="teamId">Team Id</Form.Label>
        <Form.Control
          data-testid="HelpRequestForm-teamId"
          id="teamId"
          type="text"
          placeholder="format: quarter-section-table (e.g. f25-4pm-3)"
          isInvalid={Boolean(errors.teamId)}
          {...register("teamId", {
            required: "Team id is required.",
            pattern: {
              value: teamid_regex,
              message:
                "Team Id must only contain numbers, letters, dash, and/or underscore.",
            },
          })}
        />
        <Form.Control.Feedback type="invalid">
          {errors.teamId?.message}
        </Form.Control.Feedback>
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label htmlFor="tableOrBreakoutRoom">
          Table or Breakout Room
        </Form.Label>
        <Form.Control
          data-testid="HelpRequestForm-tableOrBreakoutRoom"
          id="tableOrBreakoutRoom"
          type="text"
          placeholder="numeric value only e.g. 2 (table) or 14 (room)"
          isInvalid={Boolean(errors.tableOrBreakoutRoom)}
          {...register("tableOrBreakoutRoom", {
            required: "Table or breakout room is required.",
            maxLength: {
              value: 100,
              message:
                "Table number or breakout room number must be at most 100 characters.",
            },
          })}
        />
        <Form.Control.Feedback type="invalid">
          {errors.tableOrBreakoutRoom?.message}
        </Form.Control.Feedback>
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label htmlFor="requestTime">
          Request Time (ISO with seconds)
        </Form.Label>
        <Form.Control
          data-testid="HelpRequestForm-requestTime"
          id="requestTime"
          type="datetime-local"
          step="1" // ensures seconds are included
          isInvalid={Boolean(errors.requestTime)}
          {...register("requestTime", {
            required: "Request time is required.",
          })}
        />
        <Form.Control.Feedback type="invalid">
          {errors.requestTime?.message}
        </Form.Control.Feedback>
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label htmlFor="explanation">Explanation</Form.Label>
        <Form.Control
          as="textarea"
          rows={3}
          data-testid="HelpRequestForm-explanation"
          id="explanation"
          placeholder="Explain what went wrong and any relevant details."
          isInvalid={Boolean(errors.explanation)}
          {...register("explanation", {
            required: "Explanation is required.",
            minLength: {
              value: 10,
              message:
                "Explanation should be thorough and at least 10 characters.",
            },
            maxLength: {
              value: 1200,
              message: "Explanation has a maximum of 1200 characters.",
            },
          })}
        />
        <Form.Control.Feedback type="invalid">
          {errors.explanation?.message}
        </Form.Control.Feedback>
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label htmlFor="solved">Solved</Form.Label>
        <Form.Select
          data-testid="HelpRequestForm-solved"
          id="solved"
          isInvalid={Boolean(errors.solved)}
          {...register("solved", {
            required: "Solved is required.",
          })}
        >
          <option value="">Select...</option>
          <option value="false">false</option>
          <option value="true">true</option>
        </Form.Select>
        <Form.Control.Feedback type="invalid">
          {errors.solved?.message}
        </Form.Control.Feedback>
      </Form.Group>

      <Button type="submit" data-testid={testIdPrefix + "-submit"}>
        {buttonLabel}
      </Button>
      <Button
        variant="Secondary"
        onClick={() => navigate(-1)}
        data-testid={testIdPrefix + "-cancel"}
      >
        Cancel
      </Button>
    </Form>
  );
}

export default HelpRequestForm;