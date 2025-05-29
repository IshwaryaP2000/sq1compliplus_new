import moment from "moment";

const FormattedDateTime = ({ isoString, showDate = true, showTime = true }) => {
  const dateString = showDate ? moment(isoString).format("MMM DD, YYYY") : null;
  const timeString = showTime ? moment(isoString).format("hh:mm A") : null;

  return (
    <span className="inline-block">
      {dateString && <div>{dateString}</div>}
      {timeString && <div>{timeString}</div>}
    </span>
  );
};

export default FormattedDateTime;
