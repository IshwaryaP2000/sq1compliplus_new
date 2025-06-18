import Dropdown from "react-bootstrap/Dropdown";
import {
  RightarrowIcon,
  SharenodesIcon,
} from "../../../../components/Icons/Icons";

const DashboardTwo = () => {
  return (
    <>
      <div className="row">
        <div className="col-md-3 px-2 mb-3">
          <div className=" card p-3 rounded-4">
            <div className="d-flex justify-content-between">
              <div>
                <div>
                  <h5 className="vendorcard-heading mb-0">Cloud Security</h5>
                </div>
                <p className="vendorcard-para mb-0">Total questions</p>
              </div>
              <div>
                <Dropdown>
                  <Dropdown.Toggle
                    id="dropdown-basic"
                    className="menu-dashboard-dropdown py-1"
                  >
                    <i className="fa-solid fa-ellipsis-vertical menu-color "></i>
                  </Dropdown.Toggle>
                  <Dropdown.Menu>
                    <Dropdown.Item>
                      <div className="position-relative ">
                        <i className="fa-regular fa-message message-notification me-2"></i>
                        <div className="notification-dots"></div>
                        Message
                      </div>
                    </Dropdown.Item>
                    <Dropdown.Item>
                      <SharenodesIcon className="me-2 ms-1" />
                      Share
                    </Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              </div>
            </div>
            <p className="queshion-count">16</p>
            <div>
              <div className="total--count">
                <p className="count-badge mb-1 me-1">
                  <span className="badge text-bg-green me-2">7</span>Answered
                </p>
                <p className="count-badge mb-1 me-1">
                  <span className="badge text-bg-blue me-2">3</span>Not Answered
                </p>
                <p className="count-badge mb-1 me-1">
                  <span className="badge text-bg-gray me-2">6</span>Incomplete
                </p>
                <p className="count-badge mb-1 me-1">
                  <span className="badge text-bg-orange me-2">9</span>Reset
                </p>
              </div>
              <button className="btn btn-darkgray w-100 mt-2">
                View Questions <RightarrowIcon className="ms-2" />
              </button>
            </div>
          </div>
        </div>

        <div className="col-md-3 px-2">
          <div className=" card p-3 rounded-4">
            <div className="d-flex justify-content-between">
              <div>
                <div>
                  <h5 className="vendorcard-heading mb-0">
                    Privacy & Compliance
                  </h5>
                </div>
                <p className="vendorcard-para mb-0">Total questions</p>
              </div>
              <div>
                <Dropdown>
                  <Dropdown.Toggle
                    id="dropdown-basic"
                    className="menu-dashboard-dropdown py-1"
                  >
                    <i className="fa-solid fa-ellipsis-vertical menu-color "></i>
                  </Dropdown.Toggle>
                  <Dropdown.Menu>
                    <Dropdown.Item>
                      <div className="position-relative ">
                        <i className="fa-regular fa-message message-notification me-2"></i>
                        <div className="notification-dots"></div>
                        Message
                      </div>
                    </Dropdown.Item>
                    <Dropdown.Item>
                      <SharenodesIcon className="me-2 ms-1" />
                      Share
                    </Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              </div>
            </div>
            <p className="queshion-count">16</p>
            <div>
              <div className="total--count">
                <p className="count-badge mb-1 me-1">
                  <span className="badge text-bg-green me-2">7</span>Answered
                </p>
                <p className="count-badge mb-1 me-1">
                  <span className="badge text-bg-blue me-2">3</span>Not Answered
                </p>
                <p className="count-badge mb-1 me-1">
                  <span className="badge text-bg-gray me-2">6</span>Incomplete
                </p>
                <p className="count-badge mb-1 me-1">
                  <span className="badge text-bg-orange me-2">9</span>Reset
                </p>
              </div>
              {/* <p className='count-badge text-bg-lightgreen mb-1 w-100 text-center'><i className="fa-regular fa-circle-check me-2"></i>Completed!</p> */}
              <button className="btn btn-darkgray w-100 mt-2">
                View Questions <RightarrowIcon className="ms-2" />
              </button>
            </div>
          </div>
        </div>

        <div className="col-md-3 px-2">
          <div className=" card p-3 rounded-4">
            <div className="d-flex justify-content-between">
              <div>
                <div>
                  <h5 className="vendorcard-heading mb-0">IT Security</h5>
                </div>
                <p className="vendorcard-para mb-0">Total questions</p>
              </div>
              <div>
                <Dropdown>
                  <Dropdown.Toggle
                    id="dropdown-basic"
                    className="menu-dashboard-dropdown py-1"
                  >
                    <i className="fa-solid fa-ellipsis-vertical menu-color "></i>
                  </Dropdown.Toggle>
                  <Dropdown.Menu>
                    <Dropdown.Item>
                      <div className="position-relative ">
                        <i className="fa-regular fa-message message-notification me-2"></i>
                        <div className="notification-dots"></div>
                        Message
                      </div>
                    </Dropdown.Item>
                    <Dropdown.Item>
                      <SharenodesIcon className="me-2 ms-1" />
                      Share
                    </Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              </div>
            </div>
            <p className="queshion-count">16</p>
            <div>
              <div className="total--count">
                <p className="count-badge mb-1 me-1">
                  <span className="badge text-bg-green me-2">7</span>Answered
                </p>
                <p className="count-badge mb-1 me-1">
                  <span className="badge text-bg-blue me-2">3</span>Not Answered
                </p>
                <p className="count-badge mb-1 me-1">
                  <span className="badge text-bg-gray me-2">6</span>Incomplete
                </p>
                <p className="count-badge mb-1 me-1">
                  <span className="badge text-bg-orange me-2">9</span>Reset
                </p>
              </div>
              <button className="btn btn-darkgray w-100 mt-2">
                View Questions <RightarrowIcon className="ms-2" />
              </button>
            </div>
          </div>
        </div>

        <div className="col-md-3 px-2">
          <div className=" card p-3 rounded-4">
            <div className="d-flex justify-content-between">
              <div>
                <div>
                  <h5 className="vendorcard-heading mb-0">Physical Security</h5>
                </div>
                <p className="vendorcard-para mb-0">Total questions</p>
              </div>
              <div>
                <Dropdown>
                  <Dropdown.Toggle
                    id="dropdown-basic"
                    className="menu-dashboard-dropdown py-1"
                  >
                    <i className="fa-solid fa-ellipsis-vertical menu-color "></i>
                  </Dropdown.Toggle>
                  <Dropdown.Menu>
                    <Dropdown.Item>
                      <div className="position-relative ">
                        <i className="fa-regular fa-message message-notification me-2"></i>
                        <div className="notification-dots"></div>
                        Message
                      </div>
                    </Dropdown.Item>
                    <Dropdown.Item>
                      <SharenodesIcon className="me-2 ms-1" />
                      Share
                    </Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              </div>
            </div>
            <p className="queshion-count">16</p>
            <div>
              <div className="total--count">
                <p className="count-badge mb-1 me-1">
                  <span className="badge text-bg-green me-2">7</span>Answered
                </p>
                <p className="count-badge mb-1 me-1">
                  <span className="badge text-bg-blue me-2">3</span>Not Answered
                </p>
                <p className="count-badge mb-1 me-1">
                  <span className="badge text-bg-gray me-2">6</span>Incomplete
                </p>
                <p className="count-badge mb-1 me-1">
                  <span className="badge text-bg-orange me-2">9</span>Reset
                </p>
              </div>
              <button className="btn btn-darkgray w-100 mt-2">
                View Questions <RightarrowIcon className="ms-2" />
              </button>
            </div>
          </div>
        </div>

        <div className="col-md-3 px-2">
          <div className=" card p-3 rounded-4">
            <div className="d-flex justify-content-between">
              <div>
                <div>
                  <h5 className="vendorcard-heading mb-0">Design</h5>
                </div>
                <p className="vendorcard-para mb-0">Total questions</p>
              </div>
              <div>
                <Dropdown>
                  <Dropdown.Toggle
                    id="dropdown-basic"
                    className="menu-dashboard-dropdown py-1"
                  >
                    <i className="fa-solid fa-ellipsis-vertical menu-color "></i>
                  </Dropdown.Toggle>
                  <Dropdown.Menu>
                    <Dropdown.Item>
                      <div className="position-relative ">
                        <i className="fa-regular fa-message message-notification me-2"></i>
                        <div className="notification-dots"></div>
                        Message
                      </div>
                    </Dropdown.Item>
                    <Dropdown.Item>
                      <SharenodesIcon className="me-2 ms-1" />
                      Share
                    </Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              </div>
            </div>
            <p className="queshion-count">16</p>
            <div>
              <div className="total--count">
                <p className="count-badge mb-1 me-1">
                  <span className="badge text-bg-green me-2">7</span>Answered
                </p>
                <p className="count-badge mb-1 me-1">
                  <span className="badge text-bg-blue me-2">3</span>Not Answered
                </p>
                <p className="count-badge mb-1 me-1">
                  <span className="badge text-bg-gray me-2">6</span>Incomplete
                </p>
                <p className="count-badge mb-1 me-1">
                  <span className="badge text-bg-orange me-2">9</span>Reset
                </p>
              </div>
              <button className="btn btn-darkgray w-100 mt-2">
                View Questions <RightarrowIcon className="ms-2" />
              </button>
            </div>
          </div>
        </div>
        <div className="col-md-3 px-2">
          <div className=" card p-3 rounded-4">
            <div className="d-flex justify-content-between">
              <div>
                <div>
                  <h5 className="vendorcard-heading mb-0">HR</h5>
                </div>
                <p className="vendorcard-para mb-0">Total questions</p>
              </div>
              <div>
                <Dropdown>
                  <Dropdown.Toggle
                    id="dropdown-basic"
                    className="menu-dashboard-dropdown py-1"
                  >
                    <i className="fa-solid fa-ellipsis-vertical menu-color "></i>
                  </Dropdown.Toggle>
                  <Dropdown.Menu>
                    <Dropdown.Item>
                      <div className="position-relative ">
                        <i className="fa-regular fa-message message-notification me-2"></i>
                        <div className="notification-dots"></div>
                        Message
                      </div>
                    </Dropdown.Item>
                    <Dropdown.Item>
                      <SharenodesIcon className="me-2 ms-1" />
                      Share
                    </Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              </div>
            </div>
            <p className="queshion-count">16</p>
            <div>
              <div className="total--count">
                <p className="count-badge mb-1 me-1">
                  <span className="badge text-bg-green me-2">7</span>Answered
                </p>
                <p className="count-badge mb-1 me-1">
                  <span className="badge text-bg-blue me-2">3</span>Not Answered
                </p>
                <p className="count-badge mb-1 me-1">
                  <span className="badge text-bg-gray me-2">6</span>Incomplete
                </p>
                <p className="count-badge mb-1 me-1">
                  <span className="badge text-bg-orange me-2">9</span>Reset
                </p>
              </div>
              <button className="btn btn-darkgray w-100 mt-2">
                View Questions <RightarrowIcon className="ms-2" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default DashboardTwo;
