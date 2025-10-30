const recommendationRequestFixtures = {
  oneRecommendationRequest: {
    "id": 2,
    "requesterEmail": "testRequester1@gmail.com",
    "professorEmail": "testProfessor1@gmail.com",
    "explanation": "This is a test explanation.",
    "dateRequested": "2025-10-30T00:00:00",
    "dateNeeded": "2025-10-31T00:00:00",
    "done": false
  },
  threeRecommendationRequests: [
  {
    "id": 2,
    "requesterEmail": "testRequester1@gmail.com",
    "professorEmail": "testProfessor1@gmail.com",
    "explanation": "This is a test explanation.",
    "dateRequested": "2025-10-30T00:00:00",
    "dateNeeded": "2025-10-31T00:00:00",
    "done": false
  },
        {
    "id": 3,
    "requesterEmail": "testRequester2@gmail.com",
    "professorEmail": "testProfessor2@gmail.com",
    "explanation": "This is another test explanation.",
    "dateRequested": "2025-10-30T12:34:56",
    "dateNeeded": "2025-10-31T12:34:56",
    "done": true
  },
  {
    "id": 4,
    "requesterEmail": "testRequester3@gmail.com",
    "professorEmail": "testProfessor3@gmail.com",
    "explanation": "This is a third test explanation.",
    "dateRequested": "2025-10-30T23:59:59",
    "dateNeeded": "2025-10-31T23:59:59",
    "done": false
  }
],
};

export { recommendationRequestFixtures };
