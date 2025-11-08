package edu.ucsb.cs156.example.integration;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import com.fasterxml.jackson.databind.ObjectMapper;
import edu.ucsb.cs156.example.entities.Article;
import edu.ucsb.cs156.example.repositories.ArticleRepository;
import edu.ucsb.cs156.example.repositories.UserRepository;
import edu.ucsb.cs156.example.services.CurrentUserService;
import edu.ucsb.cs156.example.services.GrantedAuthoritiesService;
import edu.ucsb.cs156.example.testconfig.TestConfig;
import java.time.LocalDateTime;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.annotation.DirtiesContext.ClassMode;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.context.junit.jupiter.SpringExtension;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

@ExtendWith(SpringExtension.class)
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureMockMvc
@ActiveProfiles("integration")
@Import(TestConfig.class)
@DirtiesContext(classMode = ClassMode.BEFORE_EACH_TEST_METHOD)
public class ArticleIT {
  @Autowired public CurrentUserService currentUserService;

  @Autowired public GrantedAuthoritiesService grantedAuthoritiesService;

  @Autowired ArticleRepository articleRepo;

  @Autowired public MockMvc mockMvc;

  @Autowired public ObjectMapper objectMapper;

  @MockitoBean UserRepository userRepo;

  @WithMockUser(roles = {"USER"})
  @Test
  public void test_that_logged_in_user_can_get_by_id_when_the_id_exists() throws Exception {
    // arrange
    LocalDateTime dateTime = LocalDateTime.parse("2022-01-03T00:00:00");
    Article savedArticle =
        Article.builder()
            .title("testTitle")
            .url("test-url.com")
            .explanation("example article explanation")
            .email("example@test.com")
            .dateAdded(dateTime)
            .build();

    articleRepo.save(savedArticle);

    // act
    MvcResult result =
        mockMvc.perform(get("/api/articles?id=1")).andExpect(status().isOk()).andReturn();

    // assert
    String expectedJson = objectMapper.writeValueAsString(savedArticle);
    String responseString = result.getResponse().getContentAsString();
    assertEquals(expectedJson, responseString);
  }

  @WithMockUser(roles = {"ADMIN", "USER"})
  @Test
  public void an_admin_user_can_post_a_new_article() throws Exception {
    // arrange
    LocalDateTime dateTime = LocalDateTime.parse("2022-01-03T00:00:00");
    Article newArticle =
        Article.builder()
            .id(1L)
            .title("testTitleUpdated")
            .url("test-url.com")
            .explanation("example article explanation")
            .email("example@test.com")
            .dateAdded(dateTime)
            .build();

    // act
    MvcResult result =
        mockMvc
            .perform(
                post("/api/articles/post?title=testTitleUpdated&url=test-url.com&explanation=example article explanation&email=example@test.com&dateAdded=2022-01-03T00:00:00")
                    .with(csrf()))
            .andExpect(status().isOk())
            .andReturn();

    // assert
    String expectedJson = objectMapper.writeValueAsString(newArticle);
    String responseString = result.getResponse().getContentAsString();
    assertEquals(expectedJson, responseString);
  }
}
