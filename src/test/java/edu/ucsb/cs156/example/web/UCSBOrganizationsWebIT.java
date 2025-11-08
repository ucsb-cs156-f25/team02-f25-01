package edu.ucsb.cs156.example.web;

import static com.microsoft.playwright.assertions.PlaywrightAssertions.assertThat;

import edu.ucsb.cs156.example.WebTestCase;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.annotation.DirtiesContext.ClassMode;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.junit.jupiter.SpringExtension;

@ExtendWith(SpringExtension.class)
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.DEFINED_PORT)
@ActiveProfiles("integration")
@DirtiesContext(classMode = ClassMode.BEFORE_EACH_TEST_METHOD)
public class UCSBOrganizationsWebIT extends WebTestCase {
  @Test
  public void admin_user_can_create_edit_delete_ucsbOrganization() throws Exception {
    setupUser(true);

    page.getByText("UCSB Organizations").click();

    page.getByText("Create UCSB Organization").click();
    assertThat(page.getByText("Create New UCSB Organization")).isVisible();
    page.getByTestId("UCSBOrganizationsForm-orgCode").fill("FB");
    page.getByTestId("UCSBOrganizationsForm-orgTranslationShort").fill("Freebirds");
    page.getByTestId("UCSBOrganizationsForm-orgTranslation").fill("Build your own burrito chain");
    page.getByTestId("UCSBOrganizationsForm-inactive").fill("false");
    page.getByTestId("UCSBOrganizationsForm-submit").click();

    assertThat(page.getByTestId("UCSBOrganizationsTable-cell-row-0-col-orgTranslation"))
        .hasText("Build your own burrito chain");

    page.getByTestId("UCSBOrganizationsTable-cell-row-0-col-Delete-button").click();

    assertThat(page.getByTestId("UCSBOrganizationsTable-cell-row-0-col-orgCode")).not().isVisible();
  }

  @Test
  public void regular_user_cannot_create_ucsbOrganization() throws Exception {
    setupUser(false);

    page.getByText("UCSB Organizations").click();

    assertThat(page.getByText("Create UCSB Organization")).not().isVisible();
    assertThat(page.getByTestId("UCSBOrganizationsTable-cell-row-0-col-orgCode")).not().isVisible();
  }
}
