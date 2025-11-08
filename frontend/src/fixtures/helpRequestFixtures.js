const helpRequestFixtures = {
  oneHelpRequest: {
    id: 1,
    requesterEmail: "jon@ucsb.edu",
    teamId: "f25-4pm-1",
    tableOrBreakoutRoom: "1",
    requestTime: "2025-10-01T16:30:00",
    explanation: "add delete, put, get end points for helpRequest",
    solved: false,
  },
  threeHelpRequests: [
    {
      id: 2,
      requesterEmail: "foo@ucsb.edu",
      teamId: "f25-2pm-2",
      tableOrBreakoutRoom: "2",
      requestTime: "2025-10-02T16:30:00",
      explanation: "Need help with Swagger-ui",
      solved: false,
    },
    {
      id: 3,
      requesterEmail: "bar@ucsb.edu",
      teamId: "f25-3pm-3",
      tableOrBreakoutRoom: "3",
      requestTime: "2025-10-03T16:30:00",
      explanation: "Dokku problems",
      solved: false,
    },
    {
      id: 4,
      requesterEmail: "cccccccc@ucsb.edu",
      teamId: "f25-4pm-4",
      tableOrBreakoutRoom: "4",
      requestTime: "2025-10-04T16:30:00",
      explanation: "Merge conflict",
      solved: false,
    },
  ],
};

export { helpRequestFixtures };