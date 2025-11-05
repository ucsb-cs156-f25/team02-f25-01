import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import MenuItemReviewsCreatePage from "main/pages/MenuItemReviews/MenuItemReviewsCreatePage";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router";

import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";

import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";

const mockToast = vi.fn();
vi.mock("react-toastify", async (importOriginal) => {
  const originalModule = await importOriginal();
  return {
    ...originalModule,
    toast: vi.fn((x) => mockToast(x)),
  };
});

const mockNavigate = vi.fn();
vi.mock("react-router", async (importOriginal) => {
  const originalModule = await importOriginal();
  return {
    ...originalModule,
    Navigate: vi.fn((x) => {
      mockNavigate(x);
      return null;
    }),
  };
});

describe("MenuItemReviewsCreatePage tests", () => {
  const axiosMock = new AxiosMockAdapter(axios);

  beforeEach(() => {
    vi.clearAllMocks();
    axiosMock.reset();
    axiosMock.resetHistory();
    axiosMock
      .onGet("/api/currentUser")
      .reply(200, apiCurrentUserFixtures.userOnly);
    axiosMock
      .onGet("/api/systemInfo")
      .reply(200, systemInfoFixtures.showingNeither);
  });

  const queryClient = new QueryClient();
  test("renders without crashing", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <MenuItemReviewsCreatePage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(screen.getByLabelText("Stars")).toBeInTheDocument();
    });
  });

  test("on submit, makes request to backend, and redirects to /menuitemreview", async () => {
    const queryClient = new QueryClient();
    const menuItemReview = {
      id: 8,
      itemId: "200",
      reviewerEmail: "testuser@ucsb.edu",
      stars:"1",
      dateReviewed: "2025-12-14T09:05:40.000",
      comments: "bad",
    };

    axiosMock.onPost("/api/menuitemreview/post").reply(202, menuItemReview);

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <MenuItemReviewsCreatePage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(screen.getByLabelText("Stars")).toBeInTheDocument();
    });

    const itemIdInput = screen.getByLabelText("Item Id");
    expect(itemIdInput).toBeInTheDocument();

    const reviewerEmailInput = screen.getByLabelText("Reviewer Email");
    expect(reviewerEmailInput).toBeInTheDocument();

    const starsInput = screen.getByLabelText("Stars");
    expect(starsInput).toBeInTheDocument();

    const dateReviewedInput = screen.getByLabelText("Date Reviewed (iso format)");
    expect(dateReviewedInput).toBeInTheDocument();

    const commentsInput = screen.getByLabelText("Comments");
    expect(commentsInput).toBeInTheDocument();

    const createButton = screen.getByText("Create");
    expect(createButton).toBeInTheDocument();

    fireEvent.change(itemIdInput, { target: { value: "200" } });
    fireEvent.change(reviewerEmailInput, { target: { value: "testuser@ucsb.edu" } });
    fireEvent.change(starsInput, { target: { value: "1" } });
    fireEvent.change(dateReviewedInput, { target: { value: "2025-12-14T09:05:40.000" } });
    fireEvent.change(commentsInput, { target: { value: "bad" } });
    fireEvent.click(createButton);

    await waitFor(() => expect(axiosMock.history.post.length).toBe(1));

    expect(axiosMock.history.post[0].params).toEqual({
      itemId: "200",
      reviewerEmail: "testuser@ucsb.edu",
      stars: "1",
      dateReviewed: "2025-12-14T09:05:40.000",
      comments: "bad",
    });

    // assert - check that the toast was called with the expected message
    expect(mockToast).toHaveBeenCalledWith(
      "New menu item review Created - id: 8 itemId: 200",
    );
    expect(mockNavigate).toHaveBeenCalledWith({ to: "/menuitemreview" });
  });
});