import HelpRequestTable from "main/components/HelpRequest/HelpRequestTable";
import { helpRequestFixtures } from "fixtures/helpRequestFixtures";

export default {
  title: "components/HelpRequest/HelpRequestTable",
  component: HelpRequestTable
};

const Template = (args) => <HelpRequestTable {...args} />;

export const Empty = Template.bind({});
Empty.args = { helpRequests: [] };

export const ThreeRows = Template.bind({});
ThreeRows.args = { helpRequests: helpRequestFixtures.threeHelpRequests };