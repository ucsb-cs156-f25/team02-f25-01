import { True } from "@uiw/react-json-view/cjs/types/True";

const ucsbOrganizationsFixtures = {
  oneOrganization: [
    {
      orgCode: "ORG1",
      orgTranslationShort: "AFR",
      orgTranslation: "Student Affairs",
      inactive: false,
    },
  ],

  threeOrganizations: [
    {
      orgCode: "ORG1",
      orgTranslationShort: "AFR",
      orgTranslation: "Student Affairs",
      inactive: false,
    },

    {
      orgCode: "ORG2",
      orgTranslationShort: "FB",
      orgTranslation: "Freebirds",
      inactive: true,
    },
    {
      orgCode: "ORG3",
      orgTranslationShort: "IV",
      orgTranslation: "Isla Vista",
      inactive: false,
    },
  ],
};

export { ucsbOrganizationsFixtures };
