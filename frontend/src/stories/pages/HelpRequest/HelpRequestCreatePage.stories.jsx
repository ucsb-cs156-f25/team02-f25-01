import React from "react";
import HelpRequestCreatePage from "main/pages/HelpRequest/HelpRequestCreatePage";
import { MemoryRouter } from "react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ToastContainer } from "react-toastify";
import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";
import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";
import { helpRequestFixtures } from "fixtures/helpRequestFixtures";

const queryClient = new QueryClient();

export default {
  title: "pages/HelpRequest/HelpRequestCreatePage",
  component: HelpRequestCreatePage,
};

const Template = () => {
  const axiosMock = new AxiosMockAdapter(axios);
  axiosMock.onGet("/api/currentUser").reply(200, apiCurrentUserFixtures.userOnly);
  axiosMock.onGet("/api/systemInfo").reply(200, systemInfoFixtures.showingNeither);
  axiosMock.onPost("/api/helprequest/post").reply(202, helpRequestFixtures.oneHelpRequest);

  return (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <ToastContainer />
        <HelpRequestCreatePage />
      </MemoryRouter>
    </QueryClientProvider>
  );
};

export const Default = Template.bind({});