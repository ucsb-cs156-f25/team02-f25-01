package edu.ucsb.cs156.example.web;

import static com.microsoft.playwright.assertions.PlaywrightAssertions.assertThat;

import com.microsoft.playwright.Page;
import com.microsoft.playwright.options.AriaRole;
import edu.ucsb.cs156.example.WebTestCase;
import edu.ucsb.cs156.example.entities.HelpRequest;
import edu.ucsb.cs156.example.repositories.HelpRequestRepository;
import java.time.LocalDateTime;
import java.util.regex.Pattern;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.annotation.DirtiesContext.ClassMode;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.junit.jupiter.SpringExtension;

@ExtendWith(SpringExtension.class)
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.DEFINED_PORT)
@ActiveProfiles("integration")
@DirtiesContext(classMode = ClassMode.BEFORE_EACH_TEST_METHOD)
public class HelpRequestWebIT extends WebTestCase {

  @Autowired HelpRequestRepository helpRequestRepository;

  @Test
  public void admin_user_can_create_edit_delete_helpRequest() throws Exception {

    LocalDateTime ldt = LocalDateTime.parse("2022-01-03T00:00:00");

    HelpRequest helpRequest =
        HelpRequest.builder()
            .requesterEmail("email@gmail.com")
            .teamId("01")
            .tableOrBreakoutRoom("05")
            .requestTime(ldt)
            .explanation("help")
            .solved(false)
            .build();

    helpRequestRepository.save(helpRequest);

    setupUser(true);

    page.navigate("http://localhost:8080/");
    page.getByRole(
            AriaRole.LINK,
            new Page.GetByRoleOptions()
                .setName(Pattern.compile("Help\\s*Requests", Pattern.CASE_INSENSITIVE)))
        .click();
    page.waitForURL("**/helprequests*");

    assertThat(page.getByTestId("HelpRequestTable-cell-row-0-col-requesterEmail"))
        .hasText("email@gmail.com");

    page.getByTestId("HelpRequestTable-cell-row-0-col-Delete-button").click();

    assertThat(page.getByTestId("HelpRequestTable-cell-row-0-col-name")).not().isVisible();
  }

  @Test
  public void regular_user_cannot_create_helpRequest() throws Exception {
    setupUser(false);

    page.navigate("http://localhost:8080/");
    page.getByRole(
            AriaRole.LINK,
            new Page.GetByRoleOptions()
                .setName(Pattern.compile("Help\\s*Requests", Pattern.CASE_INSENSITIVE)))
        .click();
    page.waitForURL("**/helprequests*");

    assertThat(page.getByText("Create HelpRequest")).not().isVisible();
    assertThat(page.getByTestId("HelpRequestTable-cell-row-0-col-name")).not().isVisible();
  }

  @Test
  public void admin_user_can_see_create_helpRequest_button() throws Exception {
    setupUser(true);

    page.navigate("http://localhost:8080/");
    page.getByRole(
            AriaRole.LINK,
            new Page.GetByRoleOptions()
                .setName(Pattern.compile("Help\\s*Requests", Pattern.CASE_INSENSITIVE)))
        .click();
    page.waitForURL("**/helprequests*");

    assertThat(page.getByText("Create HelpRequest")).isVisible();
  }
}
