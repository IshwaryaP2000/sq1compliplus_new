import usePageTitle from "../../../../utils/usePageTitle";

const Assets = () => {
  usePageTitle("Assets");
  return (
    <div>
      <h5>Assets</h5>
      <table className="table users-table">
        <thead>
          <tr>
            <th scope="col" className="radius-design-ls">
              Id
            </th>
            <th scope="col">Os</th>
            <th scope="col">Ip</th>
            <th scope="col" className="radius-design-rs">
              Host name
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <th scope="row">1</th>
            <td>Linux</td>
            <td>192.168.4.6</td>
            <td>mark antony</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default Assets;
