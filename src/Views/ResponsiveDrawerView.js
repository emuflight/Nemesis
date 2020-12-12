import React from "react";
import PropTypes from "prop-types";
import CssBaseline from "@material-ui/core/CssBaseline";
import Divider from "@material-ui/core/Divider";
import Drawer from "@material-ui/core/Drawer";
import Hidden from "@material-ui/core/Hidden";
import List from "@material-ui/core/List";
import MenuItem from "@material-ui/core/MenuItem";
import Typography from "@material-ui/core/Typography";
import Badge from "@material-ui/core/Badge";
import VersionInfoView from "./VersionInfoView";
import { FormattedMessage } from "react-intl";
import "./Connected.css";
import { makeStyles, useTheme } from "@material-ui/core/styles";
import ClickAwayListener from "@material-ui/core/ClickAwayListener";
import CardMedia from "@material-ui/core/CardMedia";

const drawerWidth = 240;

const useStyles = makeStyles(theme => ({
  root: {
    display: "flex"
  },
  drawer: {
    [theme.breakpoints.up("sm")]: {
      width: drawerWidth,
      flexShrink: 0
    }
  },
  appBar: {
    [theme.breakpoints.up("sm")]: {
      width: `calc(100% - ${drawerWidth}px)`,
      marginLeft: drawerWidth
    }
  },
  menuButton: {
    marginRight: theme.spacing(2),
    [theme.breakpoints.up("sm")]: {
      display: "none"
    }
  },
  // necessary for content to be below app bar
  toolbar: theme.mixins.toolbar,
  drawerPaper: {
    width: drawerWidth
  },
  content: {
    flexGrow: 1,
    padding: theme.spacing(3)
  }
}));

function ResponsiveDrawer(props) {
  const { window } = props;
  const classes = useStyles();
  const theme = useTheme();

  const drawer = (
    <ClickAwayListener
      mouseEvent="onMouseDown"
      touchEvent="onTouchStart"
      onClickAway={props.handleClickAway}
    >
      <div>
        <CardMedia
          style={{ height: 100, backgroundSize: "contain" }}
          image="assets/cf_logo_white.png"
          title="EmuFlight"
        />
        <Typography
          style={{ marginBottom: -20, marginLeft: 16 }}
          color="textSecondary"
        >
          <FormattedMessage
            id="disconnected.title"
            values={{ version: props.appVersion }}
          />
        </Typography>

        <Divider style={{ marginTop: "30px" }} />
        <VersionInfoView
          goToImuf={props.goToImuf}
          version={props.fcConfig.version}
          imuf={props.fcConfig.imuf}
        />
        <Divider />
        <List style={{ display: "block" }}>
          {props.routes.map(route => {
            return (
              <MenuItem
                style={{ padding: 8 }}
                id={route.key}
                key={route.key}
                onClick={() => props.handleMenuItemClick(route.key)}
              >
                <Typography variant="subtitle1" style={{ flexGrow: 1 }}>
                  <FormattedMessage id={"route." + route.key} />
                </Typography>
                {route.incompeteItems && (
                  <Badge
                    style={{ top: "12px" }}
                    badgeContent={route.incompeteItems}
                    secondary={true}
                  />
                )}
              </MenuItem>
            );
          })}
        </List>
        <Divider />
      </div>
    </ClickAwayListener>
  );

  const container =
    window !== undefined ? () => window().document.body : undefined;

  return (
    <div className={classes.root}>
      <CssBaseline />
      <nav className={classes.drawer} aria-label="mailbox folders">
        {/* The implementation can be swapped with js to avoid SEO duplication of links. */}
        <Hidden smUp implementation="css">
          <Drawer
            container={container}
            variant="temporary"
            anchor={theme.direction === "rtl" ? "right" : "left"}
            open={props.mobileOpen}
            classes={{
              paper: classes.drawerPaper
            }}
            ModalProps={{
              keepMounted: true // Better open performance on mobile.
            }}
          >
            {drawer}
          </Drawer>
        </Hidden>
        <Hidden xsDown implementation="css">
          <Drawer
            classes={{
              paper: classes.drawerPaper
            }}
            variant="permanent"
            open
          >
            {drawer}
          </Drawer>
        </Hidden>
      </nav>
    </div>
  );
}

ResponsiveDrawer.propTypes = {
  /**
   * Injected by the documentation to work in an iframe.
   * You won't need it on your project.
   */
  window: PropTypes.func
};

export default ResponsiveDrawer;
