import React from 'react';
import { NavLink } from 'react-router-dom';
import { FaCompass, FaTags, FaUser, FaSearch } from 'react-icons/fa';
// import './BottomNav.scss'; // Optional: for custom styling

const BottomNav = () => {
  return (
    <div className="bottom-nav d-flex justify-content-around fixed-bottom bg-light py-2 border-top">
      <NavLink to="/user/Dashboard" className="text-dark text-center" activeClassName="active">
        <FaCompass size={20} />
        <div>Explore</div>
      </NavLink>
      <NavLink to="/user/offers" className="text-dark text-center" activeClassName="active">
        <FaTags size={20} />
        <div>Offers</div>
      </NavLink>
      <NavLink to="/user/wishlist" className="text-dark text-center" activeClassName="active">
        <FaUser size={20} />
        <div>Profile</div>
      </NavLink>
      <NavLink to="/user/filter" className="text-dark text-center" activeClassName="active">
        <FaSearch size={20} />
        <div>Finder</div>
      </NavLink>
    </div>
  );
};

export default BottomNav;
