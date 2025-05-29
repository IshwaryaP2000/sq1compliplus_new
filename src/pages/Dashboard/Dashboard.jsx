import usePageTitle from "../../utils/usePageTitle";
import { getApi } from "../../services/apiService";
import { useEffect, useState } from "react";
import {
  ArchiveIcon,
  ClipboardIcon,
  HandshakeIcon,
  SitemapIcon,
  TasksIcon,
  UsersIcon,
} from "../../components/Icons/Icons";
import { Spinner } from "../../components/Spinner/Spinner";

const Dashboard = () => {
  usePageTitle("Dashboard");
  const [organization, setOrganization] = useState("");
  const [readiness, setReadiness] = useState("");
  const [user, setUser] = useState("");
  const [vendor, setVendor] = useState("");
  const [isloading, setIsLoading] = useState(false);
  const [vendorquestion, setVendorquestion] = useState("");
  const [policyCount, setPolicyCount] = useState(0);
  const authuser = localStorage.getItem("authUser");
  const rolename = JSON.parse(authuser);

  
  const GetDetails = async () => {
    try {
      setIsLoading(true);
      const response = await getApi("/dashboard/get-dashboard-data");
      setOrganization(response?.data?.data?.organization);
      setReadiness(response?.data?.data?.readiness);
      setUser(response?.data?.data?.user);
      setVendor(response?.data?.data?.vendor);
      setVendorquestion(response?.data?.data?.vendor_question);
      setPolicyCount(response?.data?.data?.policy);
    } catch (error) {
      console.error("error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    GetDetails();
  }, []);

  function roundOff(total) {
    total = total / 1000;
    return Math.round(total * 10) / 10;
  }

  return (
    <>
      <div>
        {isloading ? (
          // <div className="stackflo-loadert " role="status">
          //   <span className="custom-loader "></span>
          // </div>
          <Spinner />
        ) : (
          <div className="row">
            <div className="col-lg-4 col-md-6 mb-3">
              <div className="card dashboard-card h-100">
                <div className="card-body align-content-center">
                  <div className="d-flex align-items-center">
                    <div>
                      <div className="user-dashboarsicon bg-dashboarduser me-4">
                        <UsersIcon />
                      </div>
                    </div>
                    <div className="w-100">
                      <h4>
                        Users - <span>{user?.total}</span>
                      </h4>
                      <div className="d-flex justify-content-between flex-wrap">
                        <div>
                          <p className="mb-1 active-count">
                            Active - <span>{user?.active}</span>
                          </p>
                        </div>
                        <div>
                          <p className="mb-1 inactive-count ">
                            Inactive - <span>{user?.inactive}</span>
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {rolename?.user_role !== "admin" ? (
              <div className="col-lg-4 col-md-6 mb-3">
                <div className="card dashboard-card  h-100">
                  <div className="card-body align-content-center">
                    <div className="d-flex align-items-center">
                      <div>
                        <div className="user-dashboarsicon bg-dashboardorg me-4">
                          <SitemapIcon />
                        </div>
                      </div>
                      <div className="w-100">
                        <h4>
                          Organizations - <span>{organization?.total}</span>
                        </h4>
                        <div className="d-flex justify-content-between flex-wrap">
                          <div>
                            <p className="mb-1 active-count">
                              Active - <span>{organization?.active}</span>
                            </p>
                          </div>
                          <div>
                            <p className="mb-1 inactive-count">
                              Inactive - <span>{organization?.inactive}</span>
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              ""
            )}
            {rolename?.user_role !== "sq1_super_admin" ? (
              <div className="col-lg-4 col-md-6 mb-3">
                <div className="card dashboard-card  h-100">
                  <div className="card-body align-content-center">
                    <div className="d-flex align-items-center">
                      <div>
                        <div className="user-dashboarsicon bg-dashboardvendor me-4">
                          <HandshakeIcon />
                        </div>
                      </div>
                      <div className="w-100">
                        <h4>
                          Vendors - <span>{vendor?.total}</span>
                        </h4>
                        <div className="d-flex justify-content-between flex-wrap">
                          <div>
                            <p className="mb-1 active-count">
                              Active - <span>{vendor?.active}</span>
                            </p>
                          </div>
                          <div>
                            <p className="mb-1 inactive-count">
                              Inactive - <span>{vendor?.inactive}</span>
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              ""
            )}
            {rolename?.user_role !== "sq1_super_admin" ? (
              <div className="col-lg-4 col-md-6 mb-3">
                <div className="card dashboard-card  h-100">
                  <div className="card-body d-flex align-items-center">
                    <div className="d-flex justify-content-center align-items-center">
                      <div>
                        <div className="user-dashboarsicon bg-vendorquest me-4">
                          <i className="fa-solid fa-q"></i>
                        </div>
                      </div>
                      <div className="w-100">
                        <h4 className="my-3 textWrap-balance">
                          Vendors Questions -
                          {vendorquestion?.total > 999 ? (
                            <span className="ms-2">
                              {roundOff(vendorquestion?.total)}k
                            </span>
                          ) : (
                            <span className="ms-2">
                              {vendorquestion?.total}
                            </span>
                          )}
                        </h4>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              ""
            )}
            <div className="col-lg-4 col-md-6 mb-3">
              <div className="card dashboard-card  h-100">
                <div className="card-body d-flex align-items-center">
                  <div className="d-flex justify-content-center align-items-center">
                    <div>
                      <div className="user-dashboarsicon bg-readinessquest me-4">
                        <TasksIcon />
                      </div>
                    </div>
                    <div className="w-100">
                      <h4 className="my-3 textWrap-balance">
                        Readiness Questions -
                        {readiness?.total > 999 ? (
                          <span className="ms-2">
                            {roundOff(readiness?.total)}k
                          </span>
                        ) : (
                          <span className="ms-2">{readiness?.total}</span>
                        )}
                      </h4>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-lg-4 col-md-6 mb-3">
              <div className="card dashboard-card  h-100">
                <div className="card-body d-flex align-items-center">
                  <div className="d-flex justify-content-center align-items-center">
                    <div>
                      <div className="user-dashboarsicon bg-readinessquest me-4">
                        <ClipboardIcon />
                      </div>
                    </div>
                    <div className="w-100">
                      <h4 className="my-3 textWrap-balance">
                        Active Policy -
                        <span className="ms-2">{policyCount?.active}</span>
                      </h4>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-lg-4 col-md-6 mb-3">
              <div className="card dashboard-card  h-100">
                <div className="card-body d-flex align-items-center">
                  <div className="d-flex justify-content-center align-items-center">
                    <div>
                      <div className="user-dashboarsicon bg-readinessquest me-4">
                        <ArchiveIcon />
                      </div>
                    </div>
                    <div className="w-100">
                      <h4 className="my-3 textWrap-balance">
                        Pending Policy -
                        <span className="ms-2">{policyCount?.pending}</span>
                      </h4>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};
export default Dashboard;
