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
public class UCSBDiningCommonsMenuItemWebIT extends WebTestCase {
  @Test
  public void admin_user_can_create_edit_delete_menu_item() throws Exception {
    setupUser(true);

    page.getByText("Menu Items").click();

    page.getByText("Create Menu Item").click();
    assertThat(page.getByText("Create New Menu Item")).isVisible();
    page.getByLabel("DiningCommonsCode").fill("ortega");
    page.getByLabel("Name").fill("Creamy Pesto Pasta with Chicken");
    page.getByLabel("Station").fill("Entrees");
    page.getByTestId("UCSBDiningCommonsMenuItemForm-submit").click();

    assertThat(page.getByTestId("UCSBDiningCommonsMenuItemTable-cell-row-0-col-diningCommonsCode"))
        .hasText("ortega");

    page.getByTestId("UCSBDiningCommonsMenuItemTable-cell-row-0-col-Edit-button").click();
    assertThat(page.getByText("Edit Menu Item")).isVisible();
    page.getByLabel("Name").fill("Creamy Chicken Marsala with Pasta");
    page.getByTestId("UCSBDiningCommonsMenuItemForm-submit").click();

    assertThat(page.getByTestId("UCSBDiningCommonsMenuItemTable-cell-row-0-col-name"))
        .hasText("Creamy Chicken Marsala with Pasta");

    page.getByTestId("UCSBDiningCommonsMenuItemTable-cell-row-0-col-Delete").click();

    assertThat(page.getByTestId("UCSBDiningCommonsMenuItemTable-cell-row-0-col-diningCommonsCode"))
        .not()
        .isVisible();
  }

  @Test
  public void regular_user_cannot_create_menu_item() throws Exception {
    setupUser(false);

    page.getByText("Menu Items").click();

    assertThat(page.getByText("Create Menu Item")).not().isVisible();
    assertThat(page.getByTestId("UCSBDiningCommonsMenuItemTable-cell-row-0-col-diningCommonsCode"))
        .not()
        .isVisible();
  }
}
