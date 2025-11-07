import React from "react";
import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";
import { http, HttpResponse } from "msw";

import RecommendationRequestsEditPage from "main/pages/RecommendationRequests/RecommendationRequestsEditPage";
import { recommendationRequestFixtures } from "fixtures/recommendationRequestFixtures";

export default {
  title: "pages/RecommendationRequests/RecommendationRequestsEditPage",
  component: RecommendationRequestsEditPage,
};

const Template = () => <RecommendationRequestsEditPage storybook={true} />;

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
    http.get("/api/recommendationrequests", () => {
      return HttpResponse.json(
        recommendationRequestFixtures.threeRecommendationRequests[0],
        {
          status: 200,
        },
      );
    }),
    http.put("/api/recommendationrequests", () => {
      return HttpResponse.json(
        {
          id: "17",
          requesterEmail: "testRequester1EDITED@gmail.com",
          professorEmail: "testProfessor1EDITED@gmail.com",
          explanation: "This is a test explanation edited.",
          dateRequested: "2025-10-31T00:00",
          dateNeeded: "2025-11-01T00:00",
          done: "true",
        },
        { status: 200 },
      );
    }),
  ],
};
