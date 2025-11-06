const helpRequestFixtures = {
  oneHelpRequest: {
    id: 1,
    requesterEmail: "jon@ucsb.edu",
    teamId: "f25-01",
    tableOrBreakoutRoom: "Table 1",
    requestTime: "2025-11-04T10:00:00",
    explanation: "Need help debugging the POST endpoint.",
    solved: false,
  },

  threeHelpRequests: [
    {
      id: 1,
      requesterEmail: "jon@ucsb.edu",
      teamId: "f25-01",
      tableOrBreakoutRoom: "Table 1",
      requestTime: "2025-11-04T10:00:00",
      explanation: "Need help debugging the POST endpoint.",
      solved: false,
    },
    {
      id: 2,
      requesterEmail: "foo@ucsb.edu",
      teamId: "f25-02",
      tableOrBreakoutRoom: "Breakout Room A",
      requestTime: "2025-11-04T10:15:30",
      explanation: "Liquibase migration error with timestamp type.",
      solved: true,
    },
    {
      id: 3,
      requesterEmail: "bar@ucsb.edu",
      teamId: "f25-03",
      tableOrBreakoutRoom: "Table 3",
      requestTime: "2025-11-04T10:45:00",
      explanation: "Question about HelpRequestController tests.",
      solved: false,
    },
  ],
};

export { helpRequestFixtures };