import React from "react";
import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";
import { ucsbDiningCommonsMenuItemFixtures } from "fixtures/ucsbDiningCommonsMenuItemFixtures";
import { http, HttpResponse } from "msw";

import UCSBDiningCommonsMenuItemIndexPage from "main/pages/UCSBDiningCommonsMenuItems/UCSBDiningCommonsMenuItemIndexPage";

export default {
  title: "pages/UCSBDiningCommonsMenuItems/UCSBDiningCommonsMenuItemIndexPage",
  component: UCSBDiningCommonsMenuItemIndexPage,
};

const Template = () => <UCSBDiningCommonsMenuItemIndexPage storybook={true} />;

export const Empty = Template.bind({});
Empty.parameters = {
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
    http.get("/api/ucsbdiningcommonsmenuitems/all", () => {
      return HttpResponse.json([], { status: 200 });
    }),
  ],
};

export const ThreeItemsOrdinaryUser = Template.bind({});

ThreeItemsOrdinaryUser.parameters = {
  msw: [
    http.get("/api/currentUser", () => {
      return HttpResponse.json(apiCurrentUserFixtures.userOnly);
    }),
    http.get("/api/systemInfo", () => {
      return HttpResponse.json(systemInfoFixtures.showingNeither);
    }),
    http.get("/api/ucsbdiningcommonsmenuitems/all", () => {
      return HttpResponse.json(ucsbDiningCommonsMenuItemFixtures.threeItems);
    }),
  ],
};

export const ThreeItemsAdminUser = Template.bind({});

ThreeItemsAdminUser.parameters = {
  msw: [
    http.get("/api/currentUser", () => {
      return HttpResponse.json(apiCurrentUserFixtures.adminUser);
    }),
    http.get("/api/systemInfo", () => {
      return HttpResponse.json(systemInfoFixtures.showingNeither);
    }),
    http.get("/api/ucsbdiningcommonsmenuitems/all", () => {
      return HttpResponse.json(ucsbDiningCommonsMenuItemFixtures.threeItems);
    }),
    http.delete("/api/ucsbdiningcommonsmenuitems", () => {
      return HttpResponse.json(
        { message: "Menu item deleted successfully" },
        { status: 200 },
      );
    }),
  ],
};
