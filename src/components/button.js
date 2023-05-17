export const CustButton = ({ text, func }) => {
  return (
    <button className="button-14" id="btn-restart" onClick={func}>
      <i className="fas fa-sync"></i> {text}
    </button>
  );
};
