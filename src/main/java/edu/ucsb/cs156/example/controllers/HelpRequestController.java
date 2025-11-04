package edu.ucsb.cs156.example.controllers;

import com.fasterxml.jackson.core.JsonProcessingException;
import edu.ucsb.cs156.example.entities.HelpRequest;
import edu.ucsb.cs156.example.errors.EntityNotFoundException;
import edu.ucsb.cs156.example.repositories.HelpRequestRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.time.LocalDateTime;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/** REST controller for HelpRequest */
@Tag(name = "HelpRequest")
@RequestMapping("/api/helprequest")
@RestController
@Slf4j
public class HelpRequestController extends ApiController {

  @Autowired HelpRequestRepository helprequestRepository;

  /** List all HelpRequests */
  @Operation(summary = "List all helprequests")
  @PreAuthorize("hasRole('ROLE_USER')")
  @GetMapping("/all")
  public Iterable<HelpRequest> allHelpRequests() {
    return helprequestRepository.findAll();
  }

  /** Create a new helprequest */
  @Operation(summary = "Create a new helprequest")
  @PreAuthorize("hasRole('ROLE_ADMIN')")
  @PostMapping("/post")
  public HelpRequest postHelpRequest(
      @Parameter(name = "requesterEmail") @RequestParam String requesterEmail,
      @Parameter(name = "teamId") @RequestParam String teamId,
      @Parameter(name = "tableOrBreakoutRoom") @RequestParam String tableOrBreakoutRoom,
      @Parameter(name = "explanation") @RequestParam String explanation,
      @Parameter(name = "solved") @RequestParam boolean solved,
      @Parameter(
              name = "requestTime",
              description = "date-time in ISO local format, e.g. 2022-01-03T00:00:00")
          @RequestParam("requestTime")
          @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
          LocalDateTime requestTime)
      throws JsonProcessingException {

    log.info("requestTime={}", requestTime);

    HelpRequest helprequest =
        HelpRequest.builder()
            .requesterEmail(requesterEmail)
            .teamId(teamId)
            .tableOrBreakoutRoom(tableOrBreakoutRoom)
            .requestTime(requestTime)
            .explanation(explanation)
            .solved(solved)
            .build();

    return helprequestRepository.save(helprequest);
  }

  /** Get a single helprequest by id */
  @Operation(summary = "Get a single helprequest")
  @PreAuthorize("hasRole('ROLE_USER')")
  @GetMapping("")
  public HelpRequest getById(@Parameter(name = "id") @RequestParam Long id) {
    return helprequestRepository
        .findById(id)
        .orElseThrow(() -> new EntityNotFoundException(HelpRequest.class, id));
  }

  /** Update a single helprequest */
  @Operation(summary = "Update a single helprequest")
  @PreAuthorize("hasRole('ROLE_ADMIN')")
  @PutMapping("")
  public HelpRequest updateHelpRequest(
      @Parameter(name = "id") @RequestParam Long id, @RequestBody @Valid HelpRequest incoming) {
    HelpRequest helprequest =
        helprequestRepository
            .findById(id)
            .orElseThrow(() -> new EntityNotFoundException(HelpRequest.class, id));

    helprequest.setRequesterEmail(incoming.getRequesterEmail());
    helprequest.setTeamId(incoming.getTeamId());
    helprequest.setTableOrBreakoutRoom(incoming.getTableOrBreakoutRoom());
    helprequest.setRequestTime(incoming.getRequestTime());
    helprequest.setExplanation(incoming.getExplanation());
    helprequest.setSolved(incoming.getSolved());

    helprequestRepository.save(helprequest);
    return helprequest;
  }

  /** Delete a HelpRequest */
  @Operation(summary = "Delete a HelpRequest")
  @PreAuthorize("hasRole('ROLE_ADMIN')")
  @DeleteMapping("")
  public Object deleteHelpRequest(@Parameter(name = "id") @RequestParam Long id) {
    HelpRequest helprequest =
        helprequestRepository
            .findById(id)
            .orElseThrow(() -> new EntityNotFoundException(HelpRequest.class, id));

    helprequestRepository.delete(helprequest);
    return genericMessage("HelpRequest with id %s deleted".formatted(id));
  }
}
