import { logoPath } from "../../../../utils/UtilsGlobalData";
import usePageTitle from "../../../../utils/usePageTitle";

const Policy = () => {
  usePageTitle("Policy");

  return (
    <section className="overflow-hidden">
      <div>
        <p>1. Welcome to Prepare</p>
        <div className="form-check form-check-inline">
          <input
            className="form-check-input"
            type="radio"
            name="inlineRadioOptions"
            id="inlineRadio1"
            value="option1"
          />
          <label className="form-check-label" for="inlineRadio1">
            1. Optional
          </label>
        </div>
        <div className="form-check form-check-inline">
          <input
            className="form-check-input"
            type="radio"
            name="inlineRadioOptions"
            id="inlineRadio2"
            value="option2"
          />
          <label className="form-check-label" for="inlineRadio2">
            2. Optional
          </label>
        </div>
        <div className="form-check form-check-inline">
          <input
            className="form-check-input"
            type="radio"
            name="inlineRadioOptions"
            id="inlineRadio3"
            value="option3"
          />
          <label className="form-check-label" for="inlineRadio3">
            3. Optional
          </label>
        </div>
        <div className="form-check form-check-inline">
          <input
            className="form-check-input"
            type="radio"
            name="inlineRadioOptions"
            id="inlineRadio4"
            value="option4"
          />
          <label className="form-check-label" for="inlineRadio4">
            4.Optional
          </label>
        </div>

        <div className="row">
          <div>
            <img
              src={logoPath()?.sq1_poweredby}
              className="powered-by-sq1"
              alt="Sq1-logo"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Policy;
