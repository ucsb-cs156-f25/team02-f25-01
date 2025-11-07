const menuItemReviewFixtures = {
  oneMenuItemReview: {
    id: 8,
    itemId: 200,
    reviewerEmail: "testuser@ucsb.edu",
    stars: 1,
    dateReviewed: "2025-12-14T09:05:40",
    comments: "bad",
  },
  threeMenuItemReviews: [
    {
      id: 1,
      itemId: 27,
      reviewerEmail: "testuser1@ucsb.edu",
      stars: 3,
      dateReviewed: "2025-10-31T00:48:32",
      comments: "love it",
    },
    {
      id: 3,
      itemId: 27,
      reviewerEmail: "testuser2@ucsb.edu",
      stars: 5,
      dateReviewed: "2025-11-03T07:08:30",
      comments: "I love it",
    },
    {
      id: 5,
      itemId: 50,
      reviewerEmail: "testuser3@ucsb.edu",
      stars: 3,
      dateReviewed: "2025-12-03T08:08:30",
      comments: "bad",
    },
  ],
};

export { menuItemReviewFixtures };
