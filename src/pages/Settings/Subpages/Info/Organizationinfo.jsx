import OrganizationInfo from "../../../../components/Organization/OrganizationInfo";
import usePageTitle from "../../../../utils/usePageTitle";

const Organizationinfo = () => {
  usePageTitle("Organization Info");

  return (
    <div className="justify-items-center">
      <div className="card form-card w-50 m-auto">
        <h4 className="text-center mb-3">Organization Info</h4>
        <OrganizationInfo />
      </div>
    </div>
  );
};

export default Organizationinfo;
