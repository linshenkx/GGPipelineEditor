import React, { Component } from "react";
import UserState from "./userState";
import SaveButton from "./SaveButton";
import NavBar from "./navBar";
import PropTypes from "prop-types";
class topBar extends React.Component {

  render() {
    return (
      <div>
        <UserState />
        <SaveButton enable/>
        <NavBar />
      </div>
    );
  }
}
topBar.propTypes={
    enable:PropTypes.bool,
};
export default topBar;
