import React, { Component } from "react";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import IconButton from "@material-ui/core/IconButton";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";
import Input from "@material-ui/core/Input";
import CircularProgress from "@material-ui/core/CircularProgress";
import { fade } from "@material-ui/core/styles/colorManipulator";
import { withStyles } from "@material-ui/core/styles";
import MenuIcon from "@material-ui/icons/Menu";
import SearchIcon from "@material-ui/icons/Search";
import InfoBarView from "../InfoBarView";
import { FormattedMessage } from "react-intl";
import "./AppBarView.css";
const styles = theme => ({
  root: {
    width: "100%",
    margin: 0
  },
  grow: {
    flexGrow: 1
  },
  menuButton: {
    marginLeft: -12,
    marginRight: 20
  },
  title: {
    display: "none",
    [theme.breakpoints.up("sm")]: {
      display: "block"
    }
  },
  search: {
    position: "relative",
    borderRadius: theme.shape.borderRadius,
    backgroundColor: fade(theme.palette.common.white, 0.15),
    "&:hover": {
      backgroundColor: fade(theme.palette.common.white, 0.25)
    },
    marginLeft: 0,
    width: "100%",
    [theme.breakpoints.up("sm")]: {
      marginLeft: theme.spacing(),
      width: "auto"
    }
  },
  searchIcon: {
    width: theme.spacing(9),
    height: "100%",
    position: "absolute",
    pointerEvents: "none",
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  },
  inputRoot: {
    color: "inherit",
    width: "100%"
  },
  inputInput: {
    paddingTop: theme.spacing(),
    paddingRight: theme.spacing(),
    paddingBottom: theme.spacing(),
    paddingLeft: theme.spacing(10),
    transition: theme.transitions.create("width"),
    width: "100%",
    [theme.breakpoints.up("sm")]: {
      width: 120,
      "&:focus": {
        width: 200
      }
    }
  }
});

class AppBarView extends Component {
  shouldComponentUpdate() {
    return true;
  }

  render() {
    const { classes } = this.props;
    return (
      <div className={`${classes.root}`}>
        <AppBar
          className={`appbar-root`}
          style={{ paddingTop: 10, margin: 0 }}
          position="absolute"
        >
          <Toolbar>
            <IconButton
              className={`${classes.menuButton} hamburgerButton`}
              color="inherit"
              aria-label="Menu"
              onClick={this.props.handleDrawerToggle}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" color="inherit" className={classes.title}>
              {this.props.title}
            </Typography>
            <InfoBarView
              fcConfig={this.props.fcConfig}
              rebooting={this.props.rebooting}
              notifyDirty={(isDirty, item, newValue) =>
                this.props.notifyDirty(isDirty, item, newValue)
              }
              isDirty={this.props.isDirty}
            />
            {this.props.rebooting && (
              <div style={{ display: "flex" }}>
                <CircularProgress
                  style={{
                    margin: 10,
                    justifyContent: "center",
                    alignContent: "center",
                    justifyItems: "center",
                    alignItems: "center"
                  }}
                  color="secondary"
                  thickness={7}
                />
                <Typography style={{ flexGrow: 1 }}>
                  <FormattedMessage id="common.rebooting" />
                </Typography>
              </div>
            )}
            <div className={classes.grow} />
            <Button
              color="secondary"
              variant="contained"
              style={{ marginLeft: "10px" }}
              disabled={!this.props.isDirty}
              onClick={() => this.props.onSave()}
            >
              <FormattedMessage id="common.save" />
            </Button>
            {this.props.title === "ADVANCED" && (
              <div className={classes.search}>
                <div className={classes.searchIcon}>
                  <SearchIcon />
                </div>
                <Input
                  placeholder="Search…"
                  disableUnderline
                  classes={{
                    root: classes.inputRoot,
                    input: classes.inputInput
                  }}
                  onChange={this.props.handleSearch}
                />
              </div>
            )}
          </Toolbar>
        </AppBar>
      </div>
    );
  }
}

export default withStyles(styles)(AppBarView);
