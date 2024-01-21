import { Link } from "react-router-dom";
import "./Sidebar.css";

function Sidebar() {
  return (
    <>
      <input type="checkbox" id="check" />
      <label htmlFor="check">
        <i className="fas fa-bars" id="btn"></i>
        <i className="fas fa-times" id="cancel"></i>
      </label>
      <div className="sidebar">
        <header>HOME</header>
        <ul>
          <Link to="/home" className="fas fa-link">
            My Lands
          </Link>
          <Link to="/add-land" className="fas fa-link">
            Add Land
          </Link>
          <Link to="/for-sale" className="fas fa-link">
            View Lands
          </Link>
          <Link to="/user-details" className="fas fa-link">
            User Details
          </Link>
        </ul>
      </div>
    </>
  );
}

export default Sidebar;
