import { Link } from "react-router-dom";
import "./SidebarAdmin.css";

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
        <Link to="/admin" className="fas fa-link">
            Add Authorities
          </Link>
        <Link to="/user-details" className="fas fa-link">
            User Details
          </Link>
        <Link to="/user-verification" className="fas fa-link">Pending User Verifications</Link>
        <Link to="/land-verification" className="fas fa-link">Pending land Verifications</Link>
                <Link to="/" className="fas fa-link">
            Log Out
          </Link>

        </ul>
      </div>
    </>
  );
}

export default Sidebar;
