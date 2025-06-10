import { ReactFlowProvider } from "@xyflow/react";
import { DnDProvider } from "../../../../components/Modal/ApprovalCategorieDrawflow";
import { DnDFlow } from "../../../../components/Modal/ApprovalCategorieDrawflow";

const ApprovalCategories = () => {
  return (
    <ReactFlowProvider>
      <DnDProvider>
        <DnDFlow />
      </DnDProvider>
    </ReactFlowProvider>
  );
};

export default ApprovalCategories;