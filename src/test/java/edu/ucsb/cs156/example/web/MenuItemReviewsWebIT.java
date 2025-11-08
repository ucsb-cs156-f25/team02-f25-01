package edu.ucsb.cs156.example.web;

import static com.microsoft.playwright.assertions.PlaywrightAssertions.assertThat;

import edu.ucsb.cs156.example.WebTestCase;
import edu.ucsb.cs156.example.entities.MenuItemReview;
import edu.ucsb.cs156.example.repositories.MenuItemReviewRepository;
import java.time.LocalDateTime;
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
public class MenuItemReviewsWebIT extends WebTestCase {
  @Autowired MenuItemReviewRepository menuItemReviewRepository;

  @Test
  public void admin_user_can_create_edit_delete_menuitemreview() throws Exception {
    LocalDateTime ldt = LocalDateTime.parse("2022-01-03T00:00:00");

    MenuItemReview menuItemReview =
        MenuItemReview.builder()
            .itemId(10)
            .reviewerEmail("noahzlouie@ucsb.edu")
            .stars(5)
            .dateReviewed(ldt)
            .comments("lovely")
            .build();

    menuItemReviewRepository.save(menuItemReview);

    setupUser(true);

    page.getByText("Menu Item Reviews").click();

    assertThat(page.getByTestId("MenuItemReviewTable-cell-row-0-col-reviewerEmail"))
        .hasText("noahzlouie@ucsb.edu");

    page.getByTestId("MenuItemReviewTable-cell-row-0-col-Edit").click();
    assertThat(page.getByText("Edit MenuItemReview")).isVisible();
    page.getByLabel("Item Id").fill("30");
    page.getByText("Update").click();

    assertThat(page.getByTestId("MenuItemReviewTable-cell-row-0-col-itemId")).hasText("30");

    page.getByTestId("MenuItemReviewTable-cell-row-0-col-Delete").click();

    assertThat(page.getByTestId("MenuItemReviewTable-cell-row-0-col-reviewerEmail"))
        .not()
        .isVisible();
  }

  @Test
  public void regular_user_cannot_create_restaurant() throws Exception {
    setupUser(false);

    page.getByText("Menu Item Reviews").click();

    assertThat(page.getByText("Create MenuItemReview")).not().isVisible();
    assertThat(page.getByTestId("MenuItemReviewTable-cell-row-0-col-reviewerEmail"))
        .not()
        .isVisible();
  }

  @Test
  public void admin_user_can_see_create_menuitemreview_button() throws Exception {
    setupUser(true);

    page.getByText("Menu Item Reviews").click();

    assertThat(page.getByText("Create MenuItemReview")).isVisible();
  }
}
