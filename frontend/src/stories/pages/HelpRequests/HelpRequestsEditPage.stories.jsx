import React from "react";
import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";
import { http, HttpResponse } from "msw";

import HelpRequestsEditPage from "main/pages/HelpRequests/HelpRequestsEditPage";
import { helpRequestFixtures } from "fixtures/helpRequestFixtures";

export default {
  title: "pages/HelpRequests/HelpRequestsEditPage",
  component: HelpRequestsEditPage,
};

const Template = () => <HelpRequestsEditPage storybook={true} />;

export const Default = Template.bind({});
Default.parameters = {
  msw: [
    http.get("/api/currentUser", () => {
      return HttpResponse.json(apiCurrentUserFixtures.userOnly, {
        status: 200,
      });
    }),
    http.get("/api/systemInfo", () => {
      return HttpResponse.json(systemInfoFixtures.showingNeither, {
        status: 200,
      });
    }),
    http.get("/api/helprequests", () => {
      return HttpResponse.json(helpRequestFixtures.threeHelpRequests[0], {
        status: 200,
      });
    }),
    http.put("/api/helprequests", () => {
      return HttpResponse.json(
        {
          id: 17,
          requesterEmail: "oof@ucsb.edu",
          teamId: "f25-4pm-9",
          tableOrBreakoutRoom: "3",
          requestTime: "2025-10-02T16:30:25",
          explanation: "Need help with Swagger-ui 25edits",
          solved: "true",
        },
        { status: 200 },
      );
    }),
  ],
};