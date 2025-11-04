package edu.ucsb.cs156.example.controllers;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import edu.ucsb.cs156.example.ControllerTestCase;
import edu.ucsb.cs156.example.entities.HelpRequest;
import edu.ucsb.cs156.example.repositories.HelpRequestRepository;
import edu.ucsb.cs156.example.repositories.UserRepository;
import edu.ucsb.cs156.example.testconfig.TestConfig;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Map;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MvcResult;

@WebMvcTest(controllers = HelpRequestController.class)
@Import(TestConfig.class)
public class HelpRequestControllerTests extends ControllerTestCase {

  @MockBean HelpRequestRepository helprequestRepository;

  @MockBean UserRepository userRepository;

  @Test
  public void logged_out_users_cannot_get_all() throws Exception {
    mockMvc
        .perform(get("/api/helprequest/all"))
        .andExpect(status().is(403)); // logged out users can't get all
  }

  @WithMockUser(roles = {"USER"})
  @Test
  public void logged_in_users_can_get_all() throws Exception {
    mockMvc.perform(get("/api/helprequest/all")).andExpect(status().is(200)); // logged
  }

  @Test
  public void logged_out_users_cannot_post() throws Exception {
    mockMvc.perform(post("/api/helprequest/post")).andExpect(status().is(403));
  }

  @WithMockUser(roles = {"USER"})
  @Test
  public void logged_in_regular_users_cannot_post() throws Exception {
    mockMvc
        .perform(post("/api/helprequest/post"))
        .andExpect(status().is(403)); // only admins can post
  }

  @WithMockUser(roles = {"USER"})
  @Test
  public void logged_in_user_can_get_all_ucsbdates() throws Exception {

    // arrange
    LocalDateTime ldt1 = LocalDateTime.parse("2022-01-03T00:00:00");

    HelpRequest helprequest1 =
        HelpRequest.builder()
            .requesterEmail("hjin133@ucsb.edu")
            .teamId("01")
            .tableOrBreakoutRoom("table1")
            .requestTime(ldt1)
            .explanation("Can-i-get-a-help?")
            .solved(true)
            .build();

    ArrayList<HelpRequest> expectedHelpRequest = new ArrayList<>();
    expectedHelpRequest.add(helprequest1);

    when(helprequestRepository.findAll()).thenReturn(expectedHelpRequest);

    // act
    MvcResult response =
        mockMvc.perform(get("/api/helprequest/all")).andExpect(status().isOk()).andReturn();

    // assert

    verify(helprequestRepository, times(1)).findAll();
    String expectedJson = mapper.writeValueAsString(expectedHelpRequest);

    String responseString = response.getResponse().getContentAsString();
    assertEquals(expectedJson, responseString);
  }

  @WithMockUser(roles = {"ADMIN", "USER"})
  @Test
  public void an_admin_user_can_post_a_new_helprequest() throws Exception {
    // arrange

    LocalDateTime ldt1 = LocalDateTime.parse("2022-01-03T00:00:00");

    HelpRequest helprequest1 =
        HelpRequest.builder()
            .requesterEmail("hjin133@ucsb.edu")
            .teamId("01")
            .tableOrBreakoutRoom("table1")
            .requestTime(ldt1)
            .explanation("Can-i-get-a-help?")
            .solved(true)
            .build();

    when(helprequestRepository.save(eq(helprequest1))).thenReturn(helprequest1);

    // act
    MvcResult response =
        mockMvc
            .perform(
                post("/api/helprequest/post?requesterEmail=hjin133@ucsb.edu&teamId=01&tableOrBreakoutRoom=table1&requestTime=2022-01-03T00:00:00&explanation=Can-i-get-a-help?&solved=true")
                    .with(csrf()))
            .andExpect(status().isOk())
            .andReturn();

    // assert
    verify(helprequestRepository, times(1)).save(helprequest1);
    String expectedJson = mapper.writeValueAsString(helprequest1);
    String responseString = response.getResponse().getContentAsString();
    assertEquals(expectedJson, responseString);
  }

  @Test
  public void logged_out_users_cannot_get_by_id() throws Exception {
    mockMvc
        .perform(get("/api/helprequest?id=7"))
        .andExpect(status().is(403)); // logged out users can't get by id
  }

  @WithMockUser(roles = {"USER"})
  @Test
  public void test_that_logged_in_user_can_get_by_id_when_the_id_does_not_exist() throws Exception {

    // arrange

    when(helprequestRepository.findById(eq(7L))).thenReturn(Optional.empty());

    // act
    MvcResult response =
        mockMvc.perform(get("/api/helprequest?id=7")).andExpect(status().isNotFound()).andReturn();

    // assert

    verify(helprequestRepository, times(1)).findById(eq(7L));
    Map<String, Object> json = responseToJson(response);
    assertEquals("EntityNotFoundException", json.get("type"));
    assertEquals("HelpRequest with id 7 not found", json.get("message"));
  }

  @WithMockUser(roles = {"USER"})
  @Test
  public void test_that_logged_in_user_can_get_by_id_when_the_id_does_exist() throws Exception {

    // arrange
    LocalDateTime ldt1 = LocalDateTime.parse("2022-01-03T00:00:00");

    HelpRequest helprequest1 =
        HelpRequest.builder()
            .requesterEmail("hjin133@ucsb.edu")
            .teamId("01")
            .tableOrBreakoutRoom("table1")
            .requestTime(ldt1)
            .explanation("Can-i-get-a-help?")
            .solved(true)
            .build();

    when(helprequestRepository.findById(eq(7L))).thenReturn(Optional.of(helprequest1));

    // act
    MvcResult response =
        mockMvc.perform(get("/api/helprequest?id=7")).andExpect(status().isOk()).andReturn();

    // assert

    verify(helprequestRepository, times(1)).findById(eq(7L));
    String expectedJson = mapper.writeValueAsString(helprequest1);
    String responseString = response.getResponse().getContentAsString();
    assertEquals(expectedJson, responseString);
  }

  @WithMockUser(roles = {"ADMIN", "USER"})
  @Test
  public void admin_can_edit_an_existing_helprequest() throws Exception {
    // arrange

    LocalDateTime ldt1 = LocalDateTime.parse("2022-01-03T00:00:00");
    LocalDateTime ldt2 = LocalDateTime.parse("2023-01-04T00:00:00");

    HelpRequest helprequest1 =
        HelpRequest.builder()
            .requesterEmail("hjin133@ucsb.edu")
            .teamId("01")
            .tableOrBreakoutRoom("table1")
            .requestTime(ldt1)
            .explanation("Can-i-get-a-help?")
            .solved(true)
            .build();

    HelpRequest editedhelprequest1 =
        HelpRequest.builder()
            .requesterEmail("hjin111@ucsb.edu")
            .teamId("02")
            .tableOrBreakoutRoom("table2")
            .requestTime(ldt2)
            .explanation("Need-a-help?")
            .solved(false)
            .build();

    String requestBody = mapper.writeValueAsString(editedhelprequest1);

    when(helprequestRepository.findById(eq(67L))).thenReturn(Optional.of(helprequest1));

    // act
    MvcResult response =
        mockMvc
            .perform(
                put("/api/helprequest?id=67")
                    .contentType(MediaType.APPLICATION_JSON)
                    .characterEncoding("utf-8")
                    .content(requestBody)
                    .with(csrf()))
            .andExpect(status().isOk())
            .andReturn();

    // assert
    verify(helprequestRepository, times(1)).findById(67L);
    verify(helprequestRepository, times(1)).save(editedhelprequest1);
    String responseString = response.getResponse().getContentAsString();
    assertEquals(requestBody, responseString);
  }

  @WithMockUser(roles = {"ADMIN", "USER"})
  @Test
  public void admin_cannot_edit_helprequest_that_does_not_exist() throws Exception {
    // arrange

    LocalDateTime ldt1 = LocalDateTime.parse("2022-01-03T00:00:00");

    HelpRequest helprequest1 =
        HelpRequest.builder()
            .requesterEmail("hjin133@ucsb.edu")
            .teamId("01")
            .tableOrBreakoutRoom("table1")
            .requestTime(ldt1)
            .explanation("Can-i-get-a-help?")
            .solved(true)
            .build();

    String requestBody = mapper.writeValueAsString(helprequest1);

    when(helprequestRepository.findById(eq(67L))).thenReturn(Optional.empty());

    // act
    MvcResult response =
        mockMvc
            .perform(
                put("/api/helprequest?id=67")
                    .contentType(MediaType.APPLICATION_JSON)
                    .characterEncoding("utf-8")
                    .content(requestBody)
                    .with(csrf()))
            .andExpect(status().isNotFound())
            .andReturn();

    // assert
    verify(helprequestRepository, times(1)).findById(67L);
    Map<String, Object> json = responseToJson(response);
    assertEquals("HelpRequest with id 67 not found", json.get("message"));
  }

  @WithMockUser(roles = {"ADMIN", "USER"})
  @Test
  public void admin_can_delete_a_helprequest() throws Exception {
    // arrange

    LocalDateTime ldt1 = LocalDateTime.parse("2022-01-03T00:00:00");

    HelpRequest helprequest1 =
        HelpRequest.builder()
            .requesterEmail("hjin133@ucsb.edu")
            .teamId("01")
            .tableOrBreakoutRoom("table1")
            .requestTime(ldt1)
            .explanation("Can-i-get-a-help?")
            .solved(true)
            .build();

    when(helprequestRepository.findById(eq(15L))).thenReturn(Optional.of(helprequest1));

    // act
    MvcResult response =
        mockMvc
            .perform(delete("/api/helprequest?id=15").with(csrf()))
            .andExpect(status().isOk())
            .andReturn();

    // assert
    verify(helprequestRepository, times(1)).findById(15L);
    verify(helprequestRepository, times(1)).delete(any());

    Map<String, Object> json = responseToJson(response);
    assertEquals("HelpRequest with id 15 deleted", json.get("message"));
  }

  @WithMockUser(roles = {"ADMIN", "USER"})
  @Test
  public void admin_tries_to_delete_non_existant_helprequest_and_gets_right_error_message()
      throws Exception {
    // arrange

    when(helprequestRepository.findById(eq(15L))).thenReturn(Optional.empty());

    // act
    MvcResult response =
        mockMvc
            .perform(delete("/api/helprequest?id=15").with(csrf()))
            .andExpect(status().isNotFound())
            .andReturn();

    // assert
    verify(helprequestRepository, times(1)).findById(15L);
    Map<String, Object> json = responseToJson(response);
    assertEquals("HelpRequest with id 15 not found", json.get("message"));
  }
}
