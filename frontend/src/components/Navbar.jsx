import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-light _header_nav _padd_t10">
      <div className="container _custom_container">
        <div className="_logo_wrap">
          <Link className="navbar-brand" to="/feed">
            <img src="/images/logo.svg" alt="Logo" className="_nav_logo" />
          </Link>
        </div>
        
        <button
          className="navbar-toggler bg-light"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarSupportedContent"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarSupportedContent">
          <div className="_header_form ms-auto">
            <form className="_header_form_grp">
              <svg className="_header_form_svg" xmlns="http://www.w3.org/2000/svg" width="17" height="17" fill="none" viewBox="0 0 17 17">
                <circle cx="7" cy="7" r="6" stroke="#666" />
                <path stroke="#666" strokeLinecap="round" d="M16 16l-3-3" />
              </svg>
              <input className="form-control me-2 _inpt1" type="search" placeholder="Search..." />
            </form>
          </div>

          <ul className="navbar-nav mb-2 mb-lg-0 _header_nav_list ms-auto _mar_r8">
            <li className="nav-item _header_nav_item">
              <Link className="nav-link _header_nav_link_active _header_nav_link" title="Home" to="/feed">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="21" fill="none" viewBox="0 0 18 21">
                  <path className="_home_active" stroke="#000" strokeWidth="1.5" strokeOpacity=".6" d="M1 9.924c0-1.552 0-2.328.314-3.01.313-.682.902-1.187 2.08-2.196l1.143-.98C6.667 1.913 7.732 1 9 1c1.268 0 2.333.913 4.463 2.738l1.142.98c1.179 1.01 1.768 1.514 2.081 2.196.314.682.314 1.458.314 3.01v4.846c0 2.155 0 3.233-.67 3.902-.669.67-1.746.67-3.901.67H5.57c-2.155 0-3.232 0-3.902-.67C1 18.002 1 16.925 1 14.77V9.924z" />
                  <path className="_home_active" stroke="#000" strokeOpacity=".6" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M11.857 19.341v-5.857a1 1 0 00-1-1H7.143a1 1 0 00-1 1v5.857" />
                </svg>
              </Link>
            </li>
          </ul>

          <div className="_header_nav_profile" onClick={() => setShowDropdown(!showDropdown)}>
            <div className="_header_nav_profile_image">
              <img src="/images/profile.png" alt="Profile" className="_nav_profile_img" />
            </div>
            <div className="_header_nav_dropdown">
              <p className="_header_nav_para">
                {user ? `${user.firstName} ${user.lastName}` : "User"}
              </p>
            </div>

            {/* Profile dropdown - Only shows when showDropdown is true */}
            <div className={`_nav_profile_dropdown _profile_dropdown ${showDropdown ? "show" : ""}`} 
                 style={{ display: showDropdown ? "block" : "none" }}>
              <div className="_nav_profile_dropdown_info">
                <div className="_nav_profile_dropdown_image">
                  <img src="/images/profile.png" alt="" className="_nav_drop_img" />
                </div>
                <div className="_nav_profile_dropdown_info_txt">
                  <h4 className="_nav_dropdown_title">
                    {user ? `${user.firstName} ${user.lastName}` : ""}
                  </h4>
                </div>
              </div>
              <hr />
              <ul className="_nav_dropdown_list">
                <li className="_nav_dropdown_list_item">
                  <button
                    onClick={handleLogout}
                    className="_nav_dropdown_link"
                    style={{ background: "none", border: "none", width: "100%", textAlign: "left", cursor: "pointer" }}
                  >
                    <div className="_nav_drop_info">
                      <span>
                        <svg xmlns="http://www.w3.org/2000/svg" width="19" height="19" fill="none" viewBox="0 0 19 19">
                          <path stroke="#377DFF" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M6.667 18H2.889A1.889 1.889 0 011 16.111V2.89A1.889 1.889 0 012.889 1h3.778M13.277 14.222L18 9.5l-4.723-4.722M18 9.5H6.667" />
                        </svg>
                      </span>
                      Log Out
                    </div>
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}